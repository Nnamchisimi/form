import { supabase } from '../supabaseClient';

export const addReminder = async (registrationId, type) => {
  const { data, error } = await supabase
    .from('reminders')
    .insert([{ registration_id: registrationId, type }])
    .select()
    .single();

  if (error) {
    console.error('Error adding reminder:', error);
    throw error;
  }

  return data;
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
