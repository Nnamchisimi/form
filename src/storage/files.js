import { supabase } from '../supabaseClient';

export const uploadReceipt = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('receipts')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading receipt:', error);
    throw error;
  }

  return fileName;
};

export const getReceiptUrl = async (path) => {
  if (!path) return null;
  const fileName = path.includes('/') ? path.split('/').pop() : path;
  try {
    const { data, error } = await supabase.storage
      .from('receipts')
      .createSignedUrl(fileName, 3600);

    if (error) {
      console.error('Error creating signed URL for', path, ':', error);
      console.error('Storage auth error detail:', error.message, error.status, error.name);
      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error('Error creating signed URL for', path, ':', error);
    return null;
  }
};

export const uploadTicketImage = async (blob, fileName) => {
  const { error } = await supabase.storage
    .from('receipts')
    .upload(`tickets/${fileName}`, blob, {
      contentType: 'image/png',
      cacheControl: 'public,max-age=31536000',
    });

  if (error) {
    console.error('Error uploading ticket image:', error);
    throw error;
  }

  return `tickets/${fileName}`;
};

export const getTicketImageUrl = async (path) => {
  if (!path) return null;
  try {
    const { data, error } = await supabase.storage
      .from('receipts')
      .createSignedUrl(path, 604800);

    if (error) {
      console.error('Error creating signed URL for ticket image', path, ':', error);
      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error('Error creating signed URL for ticket image', path, ':', error);
    return null;
  }
};
