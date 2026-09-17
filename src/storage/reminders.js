import { supabase } from '../supabaseClient';

export const addReminder = async (registrationId, type) => {
  const { data, error } = await supabase
    .from('reminders')
    .insert([{ registration_id: registrationId, type }])
    .select();

  if (error) {
    console.error('Error adding reminder:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('No data returned after adding reminder');
  }

  return data[0];
};

export const getReminders = async (registrationId) => {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('registration_id', registrationId)
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }

  return data || [];
};
