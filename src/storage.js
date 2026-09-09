import { supabase } from './supabaseClient';

const SUPABASE_PROJECT_REF = 'urtmleicijluwonalidr';
// eslint-disable-next-line no-unused-vars
const EDGE_EMAIL_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/rapid-service`;
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

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
    .select()
    .single();
  
  if (error) {
    console.error('Error saving registration:', error);
    throw error;
  }
  
  return data;
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

export const sendConfirmationEmail = async (registration) => {
  if (!registration?.email) return;

  try {
    console.log('Sending confirmation email to:', registration.email);
      const { data, error } = await supabase.functions.invoke('rapid-service', {
        body: {
          to: registration.email,
          from: 'Serhan Kombos Otomotiv <noreply@kombosdms.com>',
          subject: 'Registration received - Serhan Kombos Otomotiv',
          html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Received</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background-color: #000000; padding: 24px 32px; text-align: center; }
    .header img { max-height: 60px; max-width: 180px; }
    .body { padding: 32px; color: #1f2937; font-size: 15px; line-height: 1.7; }
    .body p { margin: 0 0 16px; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px 20px; margin: 20px 0; }
    .card-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin: 0 0 10px; }
    .ref-number { font-size: 22px; font-weight: 700; color: #000000; letter-spacing: 1px; margin: 0; }
    .highlight-box { background-color: #ffffff; border-left: 4px solid #000000; padding: 14px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .highlight-box p { margin: 0 0 6px; }
    .highlight-box strong { color: #000000; }
    .footer { padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .event-badge { display: inline-block; background: #000000; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://urtmleicijluwonalidr.supabase.co/storage/v1/object/public/logos/merclogo.webp" alt="Mercedes Logo" />
    </div>
    <div class="body">
      <div style="text-align: center; margin-bottom: 8px;">
        <span class="event-badge">Kombos Otomotiv Bingo</span>
      </div>
      <p style="font-size: 18px; font-weight: 600; color: #000000; margin: 0 0 12px;">Hello ${registration.name} ${registration.surname},</p>
      <p>Your registration has been received successfully.</p>
      <div class="card" style="text-align: center;">
        <p class="card-title">Your Reference Number</p>
        <p class="ref-number"><a href="${BASE_URL}?ref=${registration.reference_number}" style="color: #000000; text-decoration: none;">${registration.reference_number}</a></p>
      </div>
      <div class="highlight-box">
        <p><strong>Event:</strong> Kombos Otomotiv Bingo</p>
        <p><strong>Prize:</strong> 500,000 TL cash prize</p>
      </div>
      <p>Keep this reference number for your records. We will review your details and send your invitation once your car document is verified.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Serhan Kombos Otomotiv. All rights reserved.
    </div>
  </div>
</body>
</html>`
        }
      });
    console.log('Email invoke result:', { data, error });
  } catch (emailError) {
    console.error('Error sending confirmation email:', emailError);
  }
};

export const sendReminderEmail = async (registration, missingFields = [], customMessage = '', language = 'en') => {
  if (!registration?.email) return;

  const missingList = missingFields.map(field => `- ${field}`).join('<br>');
  const editLink = `${BASE_URL}?ref=${registration.reference_number}`;
  const subject = language === 'tr' ? 'Hatırlatma: Lütfen kaydınızı tamamlayın' : 'Reminder: Please complete your registration';

  const greeting = language === 'tr' ? `Merhaba ${registration.name} ${registration.surname},` : `Hello ${registration.name} ${registration.surname},`;
  const intro = language === 'tr'
    ? 'Kaydınızda eksik alanlar var. Lütfen aşağıdaki bilgileri tamamlayın:'
    : 'We noticed that your registration is missing some required details. Please complete the following:';
  const missingLabel = language === 'tr' ? 'Eksik alanlar:' : 'Missing fields:';
  const messageLabel = language === 'tr' ? 'Mesaj:' : 'Message:';
  const linkLabel = language === 'tr'
    ? 'Kaydınızı düzenlemek için bu bağlantıya tıklayın:'
    : 'Click the link below to edit and complete your registration:';

  try {
    console.log('Sending reminder email to:', registration.email);
    await supabase.functions.invoke('rapid-service', {
      body: {
        to: registration.email,
        from: 'Serhan Kombos Otomotiv <noreply@kombosdms.com>',
        subject,
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background-color: #000000; padding: 24px 32px; text-align: center; }
    .header img { max-height: 60px; max-width: 180px; }
    .body { padding: 32px; color: #1f2937; font-size: 15px; line-height: 1.7; }
    .body p { margin: 0 0 16px; }
    .highlight-box { background-color: #ffffff; border-left: 4px solid #000000; padding: 14px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .highlight-box p { margin: 0 0 6px; }
    .highlight-box strong { color: #000000; }
    .footer { padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .event-badge { display: inline-block; background: #000000; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://urtmleicijluwonalidr.supabase.co/storage/v1/object/public/logos/merclogo.webp" alt="Mercedes Logo" />
    </div>
    <div class="body">
      <div style="text-align: center; margin-bottom: 8px;">
        <span class="event-badge">Kombos Otomotiv Bingo</span>
      </div>
      <p style="font-size: 18px; font-weight: 600; color: #000000; margin: 0 0 12px;">${greeting}</p>
      <p>${intro}</p>
      <div class="highlight-box">
        <p><strong>${missingLabel}</strong></p>
        <p>${missingList}</p>
      </div>
      ${customMessage ? `<div class="highlight-box"><p><strong>${messageLabel}</strong></p><p>${customMessage.replace(/\n/g, '<br>')}</p></div>` : ''}
      <p>${linkLabel}</p>
      <p><a href="${editLink}" style="color: #000000; text-decoration: none; font-weight: 600;">${editLink}</a></p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Serhan Kombos Otomotiv. All rights reserved.
    </div>
  </div>
</body>
</html>`
      }
    });
    console.log('Reminder email sent to:', registration.email);
  } catch (emailError) {
    console.error('Error sending reminder email:', emailError);
    throw emailError;
  }
};

export const sendMessage = async (registrationId, message, type = 'custom') => {
  const { data, error } = await supabase
    .from('reminders')
    .insert([{ registration_id: registrationId, type, message }])
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  if (registrationId && message) {
    try {
      const { data: reg } = await supabase
        .from('registrations')
        .select('email')
        .eq('id', registrationId)
        .maybeSingle();

      if (reg?.email) {
        console.log('Sending message email to:', reg.email);
         const { error: emailError } = await supabase.functions.invoke('rapid-service', {
          body: {
            to: reg.email,
            from: 'Serhan Kombos Otomotiv <noreply@kombosdms.com>',
            subject: type === 'custom' ? 'Update from Serhan Kombos Otomotiv' : `Update from Serhan Kombos Otomotiv`,
            html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Update</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background-color: #000000; padding: 24px 32px; text-align: center; }
    .header img { max-height: 60px; max-width: 180px; }
    .body { padding: 32px; color: #1f2937; font-size: 15px; line-height: 1.7; }
    .body p { margin: 0 0 16px; }
    .highlight-box { background-color: #ffffff; border-left: 4px solid #000000; padding: 14px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .highlight-box p { margin: 0 0 6px; }
    .highlight-box strong { color: #000000; }
    .footer { padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .event-badge { display: inline-block; background: #000000; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://urtmleicijluwonalidr.supabase.co/storage/v1/object/public/logos/merclogo.webp" alt="Mercedes Logo" />
    </div>
    <div class="body">
      <div style="text-align: center; margin-bottom: 8px;">
        <span class="event-badge">Kombos Otomotiv Bingo</span>
      </div>
      <div class="highlight-box">
        <p><strong>Event:</strong> Kombos Otomotiv Bingo</p>
        <p><strong>Prize:</strong> 500,000 TL cash prize</p>
      </div>
      <p>${message.replace(/\n/g, '</p><p>')}</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Serhan Kombos Otomotiv. All rights reserved.
    </div>
  </div>
</body>
</html>`
          }
        });
        if (emailError) {
          console.error('Message email error:', emailError);
        }
      }
    } catch (emailError) {
      console.error('Error sending email via Edge Function:', emailError);
    }
  }

  return data;
};

export const sendRejectionEmail = async (registration, reason) => {
  const { data, error } = await supabase
    .from('reminders')
    .insert([{
      registration_id: registration.id,
      type: 'rejection',
      message: reason
    }])
    .select()
    .single();

  if (error) {
    console.error('Error sending rejection email:', error);
    throw error;
  }

  if (registration.email && reason) {
    try {
      console.log('Sending rejection email to:', registration.email);
       const { error: emailError } = await supabase.functions.invoke('send-email', {
         body: {
           to: registration.email,
           from: 'Serhan Kombos Otomotiv <noreply@kombosdms.com>',
           subject: 'Update on your registration',
           html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Update</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background-color: #000000; padding: 24px 32px; text-align: center; }
    .header img { max-height: 60px; max-width: 180px; }
    .body { padding: 32px; color: #1f2937; font-size: 15px; line-height: 1.7; }
    .body p { margin: 0 0 16px; }
    .highlight-box { background-color: #ffffff; border-left: 4px solid #000000; padding: 14px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .highlight-box p { margin: 0 0 6px; }
    .highlight-box strong { color: #000000; }
    .footer { padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .event-badge { display: inline-block; background: #000000; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://urtmleicijluwonalidr.supabase.co/storage/v1/object/public/logos/merclogo.webp" alt="Mercedes Logo" />
    </div>
    <div class="body">
      <div style="text-align: center; margin-bottom: 8px;">
        <span class="event-badge">Kombos Otomotiv Bingo</span>
      </div>
      <div class="highlight-box">
        <p><strong>Event:</strong> Kombos Otomotiv Bingo</p>
        <p><strong>Prize:</strong> 500,000 TL cash prize</p>
      </div>
      <p>Your registration was not approved.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      ${registration.reference_number ? `<div class="highlight-box"><p><strong>Reference No:</strong> ${registration.reference_number}</p></div>` : ''}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Serhan Kombos Otomotiv. All rights reserved.
    </div>
  </div>
</body>
</html>`
         }
       });
      if (emailError) {
        console.error('Rejection email error:', emailError);
      }
    } catch (emailError) {
      console.error('Error sending rejection email via Edge Function:', emailError);
    }
  }

  return data;
};

export const sendApprovalEmail = async (registration) => {
  if (registration.email) {
    try {
      console.log('Sending approval email to:', registration.email);
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: registration.email,
          from: 'Serhan Kombos Otomotiv <noreply@kombosdms.com>',
          subject: 'Your registration has been approved',
          html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Approved</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background-color: #000000; padding: 24px 32px; text-align: center; }
    .header img { max-height: 60px; max-width: 180px; }
    .body { padding: 32px; color: #1f2937; font-size: 15px; line-height: 1.7; }
    .body p { margin: 0 0 16px; }
    .highlight-box { background-color: #ffffff; border-left: 4px solid #000000; padding: 14px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .highlight-box p { margin: 0 0 6px; }
    .highlight-box strong { color: #000000; }
    .footer { padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .event-badge { display: inline-block; background: #000000; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://urtmleicijluwonalidr.supabase.co/storage/v1/object/public/logos/merclogo.webp" alt="Mercedes Logo" />
    </div>
    <div class="body">
      <div style="text-align: center; margin-bottom: 8px;">
        <span class="event-badge">Kombos Otomotiv Bingo</span>
      </div>
      <div class="highlight-box">
        <p><strong>Event:</strong> Kombos Otomotiv Bingo</p>
        <p><strong>Prize:</strong> 500,000 TL cash prize</p>
      </div>
      <p>Your registration is approved and has been confirmed.</p>
      <p>Please keep this reference number safe, as you will need it later.</p>
      <p>Note: This email cannot be used for another registration.</p>
      ${registration.reference_number ? `<div class="highlight-box"><p><strong>Reference No:</strong> ${registration.reference_number}</p></div>` : ''}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Serhan Kombos Otomotiv. All rights reserved.
    </div>
  </div>
</body>
</html>`
        }
      });
      if (emailError) {
        console.error('Approval email error:', emailError);
      }
    } catch (emailError) {
      console.error('Error sending approval email via Edge Function:', emailError);
    }
  }
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
    vehicle_stub: registration.vehicle_stub,
    location: registration.location,
    submitted_at: registration.submitted_at,
    receipt_status: registration.receipt_status || 'Pending',
    verification_status: registration.verification_status || 'Pending',
    invitation_status: registration.invitation_status || 'Pending',
    archived_reason: reason,
    reference_number: registration.reference_number
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

export const uploadReceipt = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(fileName, file);
  
  if (error) {
    console.error('Error uploading receipt:', error);
    throw error;
  }
  
  return data.path;
};

export const getReceiptUrl = async (path) => {
  try {
    const { data, error } = await supabase.storage
      .from('receipts')
      .createSignedUrl(path, 3600); // 1 hour expiry
    
    if (error) {
      console.error('Error creating signed URL for', path, ':', error);
      return null;
    }
    
    return data?.signedUrl || null;
  } catch (error) {
    console.error('Error creating signed URL for', path, ':', error);
    return null;
  }
};

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

export const saveDraftRegistration = async (registration) => {
  const referenceNumber = `KOMBOS-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  let receiptPath = registration.vehicle_stub;
  if (receiptPath instanceof File) {
    try {
      receiptPath = await uploadReceipt(receiptPath);
    } catch (uploadError) {
      console.error('Error uploading draft receipt:', uploadError);
      receiptPath = null;
    }
  }
  const draftRecord = {
    ...registration,
    reference_number: referenceNumber,
    vehicle_stub: receiptPath,
    receipt_status: receiptPath ? 'Submitted' : 'Pending',
    verification_status: 'Pending',
    invitation_status: 'Pending',
    submitted_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('registrations')
    .insert([draftRecord])
    .select()
    .single();

  if (error) {
    console.error('Error saving draft registration:', error);
    throw error;
  }

  if (data?.email) {
    try {
      await supabase.functions.invoke('rapid-service', {
        body: {
          to: data.email,
          from: 'Serhan Kombos Otomotiv <noreply@kombosdms.com>',
          subject: 'Continue your registration - Serhan Kombos Otomotiv',
          html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Continue Registration</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background-color: #000000; padding: 24px 32px; text-align: center; }
    .header img { max-height: 60px; max-width: 180px; }
    .body { padding: 32px; color: #1f2937; font-size: 15px; line-height: 1.7; }
    .body p { margin: 0 0 16px; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px 20px; margin: 20px 0; }
    .card-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin: 0 0 10px; }
    .ref-number { font-size: 22px; font-weight: 700; color: #000000; letter-spacing: 1px; margin: 0; }
    .ref-number a { color: #000000; text-decoration: none; }
    .highlight-box { background-color: #ffffff; border-left: 4px solid #000000; padding: 14px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .highlight-box p { margin: 0 0 6px; }
    .highlight-box strong { color: #000000; }
    .footer { padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .event-badge { display: inline-block; background: #000000; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://urtmleicijluwonalidr.supabase.co/storage/v1/object/public/logos/merclogo.webp" alt="Mercedes Logo" />
    </div>
    <div class="body">
      <div style="text-align: center; margin-bottom: 8px;">
        <span class="event-badge">Kombos Otomotiv Bingo</span>
      </div>
      <p style="font-size: 18px; font-weight: 600; color: #000000; margin: 0 0 12px;">Hello ${registration.name} ${registration.surname},</p>
      <p>You have saved your registration. Click the link below to continue where you left off.</p>
      <div class="card" style="text-align: center;">
        <p class="card-title">Your Reference Number</p>
        <p class="ref-number"><a href="${BASE_URL}?ref=${referenceNumber}">${referenceNumber}</a></p>
      </div>
      <div class="highlight-box">
        <p><strong>Event:</strong> Kombos Otomotiv Bingo</p>
        <p><strong>Prize:</strong> 500,000 TL cash prize</p>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Serhan Kombos Otomotiv. All rights reserved.
    </div>
  </div>
</body>
</html>`
        }
      });
      console.log('Draft email sent to:', data.email);
    } catch (emailError) {
      console.error('Error sending draft email:', emailError);
    }
  }

  return data;
};

export const getDraft = () => {
  return JSON.parse(localStorage.getItem('registrationDraft') || 'null');
};

export const saveDraft = (data) => {
  localStorage.setItem('registrationDraft', JSON.stringify(data));
};

export const clearDraft = () => {
  localStorage.removeItem('registrationDraft');
};

const storage = {
  getRegistrations,
  saveRegistration,
  updateRegistration,
  findActiveRegistrationByEmail,
  findArchivedRegistrationByEmail,
  getRegistrationByReference,
  updateRegistrationByReference,
  saveDraftRegistration,
  archiveRegistration,
  deleteRegistration,
  deleteArchivedRegistration,
  sendConfirmationEmail,
  sendReminderEmail,
  getArchivedRegistrations,
  uploadReceipt,
  getReceiptUrl,
  addReminder,
  getReminders,
  getDraft,
  saveDraft,
  clearDraft,
  sendApprovalEmail,
  sendRejectionEmail
};

export default storage;
