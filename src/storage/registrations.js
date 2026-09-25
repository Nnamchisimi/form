import { supabase } from '../supabaseClient';

export const getRegistrations = async () => {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching registrations:', error);
    return [];
  }

  return data || [];
};

export const findActiveRegistrationByEmail = async (email) => {
  if (!email) return null;
  const { data, error } = await supabase
    .from('registrations')
    .select('id, reference_number, invitation_status')
    .eq('email', email)
    .neq('invitation_status', 'Rejected')
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error checking duplicate email:', error);
    return null;
  }

  return data || null;
};

export const findArchivedRegistrationByEmail = async (email) => {
  if (!email) return null;
  const { data, error } = await supabase
    .from('archived_registrations')
    .select('id, reference_number, invitation_status')
    .eq('email', email)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error checking archived duplicate email:', error);
    return null;
  }

  if (data && data.invitation_status === 'Approved') {
    return data;
  }

  return null;
};

export const markEditLinkUsed = async (referenceNumber) => {
  if (!referenceNumber) return;
  const { error } = await supabase
    .from('registrations')
    .update({ edit_link_used: true, edit_link_used_at: new Date().toISOString() })
    .eq('reference_number', referenceNumber);

  if (error) {
    console.error('Error marking edit link as used:', error);
    throw error;
  }
};

export const getRegistrationByReference = async (referenceNumber) => {
  if (!referenceNumber) return null;
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('reference_number', referenceNumber)
    .maybeSingle();

  if (error) {
    console.error('Error fetching registration by reference:', error);
    return null;
  }

  return data || null;
};

export const updateRegistrationByReference = async (referenceNumber, updates) => {
  if (!referenceNumber) return null;
  const { data, error } = await supabase
    .from('registrations')
    .update(updates)
    .eq('reference_number', referenceNumber)
    .select()
    .single();

  if (error) {
    console.error('Error updating registration by reference:', error);
    throw error;
  }

  return data || null;
};

export const saveRegistration = async (registration) => {
  const { data, error } = await supabase
    .from('registrations')
    .insert([registration])
    .select();

  if (error) {
    console.error('Error saving registration:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('No data returned after saving registration');
  }

  return data[0];
};

export const updateRegistration = async (id, updates) => {
  const { data, error } = await supabase
    .from('registrations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating registration:', error);
    throw error;
  }

  return data;
};

export const archiveRegistration = async (registration, reason = 'Rejected') => {
  const archived = {
    original_id: registration.id,
    name: registration.name,
    surname: registration.surname,
    email: registration.email,
    phone: registration.phone,
    dob: registration.dob,
    vehicle_brand: registration.vehicle_brand,
    vehicle_model: registration.vehicle_model,
    model_year: registration.model_year,
    license_plate: registration.license_plate,
    chassis_number: registration.chassis_number,
    vehicle_stub: registration.vehicle_stub,
    location: registration.location,
    submitted_at: registration.submitted_at,
    receipt_status: registration.receipt_status || 'Pending',
    verification_status: registration.verification_status || 'Pending',
    invitation_status: registration.invitation_status || 'Pending',
    archived_reason: reason,
    reference_number: registration.reference_number,
    language: registration.language || null
  };

  const { data, error } = await supabase
    .from('archived_registrations')
    .insert([archived])
    .select()
    .single();

  if (error) {
    console.error('Error archiving registration:', error);
    throw error;
  }

  return data;
};

export const deleteRegistration = async (id) => {
  const { error: remindersError } = await supabase
    .from('reminders')
    .delete()
    .eq('registration_id', id);

  if (remindersError) {
    console.error('Error deleting reminders for registration:', remindersError);
    throw remindersError;
  }

  const { data, error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error deleting registration:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    const { data: verify, error: verifyError } = await supabase
      .from('registrations')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (verifyError) {
      console.error('Error verifying deletion:', verifyError);
      throw verifyError;
    }

    if (verify) {
      console.error('Record still exists after delete - possible foreign key constraint or permission issue');
      throw new Error('Record was not deleted from database');
    }
  }

  return data;
};

export const getArchivedRegistrations = async () => {
  const { data, error } = await supabase
    .from('archived_registrations')
    .select('*')
    .order('archived_at', { ascending: false });

  if (error) {
    console.error('Error fetching archived registrations:', error);
    return [];
  }

  return data || [];
};

export const deleteArchivedRegistration = async (record) => {
  if (record?.vehicle_stub) {
    try {
      await supabase.storage.from('receipts').remove([record.vehicle_stub]);
    } catch (storageError) {
      console.error('Error deleting receipt file:', storageError);
    }
  }

  const { data, error } = await supabase
    .from('archived_registrations')
    .delete()
    .eq('id', record.id)
    .select();

  if (error) {
    console.error('Error deleting archived registration:', error);
    throw error;
  }

  return data;
};
