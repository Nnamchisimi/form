import { supabase } from '../supabaseClient';
import { EMAIL_FROM, BASE_URL } from './constants';
import { baseEmailTemplate, eventBadge, highlightBox, eventInfo, bingoCallout } from './templates';

export const sendConfirmationEmail = async (registration) => {
  if (!registration?.email) return;

  try {
    console.log('Sending confirmation email to:', registration.email);
    const { data, error } = await supabase.functions.invoke('rapid-service', {
      body: {
        to: registration.email,
        from: EMAIL_FROM,
        subject: 'Registration received - Serhan Kombos Otomotiv',
        html: baseEmailTemplate('Registration Received', `
          ${eventBadge()}
          <p style="font-size:18px;font-weight:700;color:#7c2d12;margin:0 0 12px;">Hello ${registration.name} ${registration.surname},</p>
          <p style="margin:0 0 16px;">Your registration has been received successfully.</p>
          ${bingoCallout('You are now entered in the Kombos Otomotiv Bingo draw.')}
          <div style="background:#ffffff;border:1px solid #fde68a;border-radius:12px;padding:18px 20px;margin:20px 0;box-shadow:0 2px 8px rgba(217,119,6,0.08);text-align:center;">
            <p style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#92400e;margin:0 0 10px;font-weight:700;">Your Reference Number</p>
            <p style="font-size:22px;font-weight:800;color:#7c2d12;letter-spacing:1px;margin:0;"><a href="${BASE_URL}?ref=${registration.reference_number}" style="color:#b45309;text-decoration:none;">${registration.reference_number}</a></p>
            <p style="font-size:12px;color:#92400e;margin-top:8px;">This link can only be used once.</p>
          </div>
          ${highlightBox(eventInfo())}
          <p style="margin:0 0 16px;">Keep this reference number for your records. We will review your details and send your invitation once your car document is verified.</p>
        `)
      }
    });
    console.log('Email invoke result:', { data, error });
  } catch (emailError) {
    console.error('Error sending confirmation email:', emailError);
  }
};

export const sendReminderEmail = async (registration, missingFields = [], customMessage = '', language = 'en') => {
  if (!registration?.email) return;

  const subject = language === 'tr' ? 'Hatırlatma: Lütfen kaydınızı tamamlayın' : 'Reminder: Please complete your registration';
  const editLink = `${BASE_URL}?ref=${registration.reference_number}`;

  const missingList = missingFields.map(field => `- ${field}`).join('<br>');
  const missingLabel = language === 'tr' ? 'Eksik alanlar:' : 'Missing fields:';

  const hasCustomMessage = Boolean(customMessage && customMessage.trim());
  const greeting = language === 'tr' ? `Merhaba ${registration.name} ${registration.surname},` : `Hello ${registration.name} ${registration.surname},`;
  const intro = language === 'tr'
    ? 'Kaydınızda eksik alanlar var. Lütfen aşağıdaki bilgileri tamamlayın:'
    : 'We noticed that your registration is missing some required details. Please complete the following:';
  const linkLabel = language === 'tr'
    ? 'Kaydınızı düzenlemek için bu bağlantıya tıklayın:'
    : 'Click the link below to edit and complete your registration:';

  const emailContent = hasCustomMessage
    ? `<p>${customMessage.replace(/\n/g, '</p><p>')}</p>`
    : `${missingFields.length > 0 ? highlightBox(`<p><strong>${missingLabel}</strong></p><p>${missingList}</p>`) : ''}`;

  if (registration.id) {
    try {
      await supabase
        .from('reminders')
        .insert([{
          registration_id: registration.id,
          type: 'reminder',
          message: missingFields.length > 0 ? missingFields.join(', ') : (customMessage || 'Reminder sent').trim()
        }]);
    } catch (logError) {
      console.error('Error logging reminder:', logError);
    }
  }

  try {
    console.log('Sending reminder email to:', registration.email);
    await supabase.functions.invoke('rapid-service', {
      body: {
        to: registration.email,
        from: EMAIL_FROM,
        subject,
        html: baseEmailTemplate(subject, `
          ${eventBadge()}
          ${hasCustomMessage ? '' : `<p style="font-size:18px;font-weight:700;color:#7c2d12;margin:0 0 12px;">${greeting}</p>`}
          ${hasCustomMessage ? '' : `<p style="margin:0 0 16px;">${intro}</p>`}
          ${emailContent}
          ${hasCustomMessage ? '' : `<p style="margin:0 0 6px;">${linkLabel}</p><p style="margin:0 0 16px;"><a href="${editLink}" style="color:#b45309;text-decoration:none;font-weight:700;">${editLink}</a></p><p style="font-size:12px;color:#92400e;margin-top:8px;">This link can only be used once.</p>`}
        `)
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
    .select();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('No data returned after sending message');
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
            from: EMAIL_FROM,
            subject: 'Update from Serhan Kombos Otomotiv',
            html: baseEmailTemplate('Update', `
              ${eventBadge()}
              ${bingoCallout('You have a new update regarding your registration.')}
              ${highlightBox(eventInfo())}
              <p style="margin:0 0 16px;">${message.replace(/\n/g, '</p><p style="margin:0 0 16px;">')}</p>
            `)
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
  if (!registration?.email || !reason) {
    return;
  }

  try {
    console.log('Sending rejection email to:', registration.email);
    const { error: emailError } = await supabase.functions.invoke('rapid-service', {
      body: {
        to: registration.email,
        from: EMAIL_FROM,
        subject: 'Update on your registration',
        html: baseEmailTemplate('Registration Update', `
          ${eventBadge()}
          <p style="font-size:18px;font-weight:700;color:#7c2d12;margin:0 0 12px;">Hello ${registration.name} ${registration.surname},</p>
          <p style="margin:0 0 16px;">Your registration was not approved.</p>
          <p style="margin:0 0 16px;"><strong>Reason:</strong> ${reason}</p>
          ${registration.reference_number ? highlightBox(`<p style="margin:0 0 6px;"><strong>Reference No:</strong> ${registration.reference_number}</p>`) : ''}
        `)
      }
    });
    if (emailError) {
      console.error('Rejection email error:', emailError);
    }
  } catch (emailError) {
    console.error('Error sending rejection email via Edge Function:', emailError);
  }
};

export const sendApprovalEmail = async (registration, customMessage) => {
  if (registration.email) {
    try {
      console.log('Sending approval email to:', registration.email);
      const { error: emailError } = await supabase.functions.invoke('rapid-service', {
        body: {
          to: registration.email,
          from: EMAIL_FROM,
          subject: 'Your registration has been approved',
          html: baseEmailTemplate('Registration Approved', `
            ${eventBadge()}
            <p style="font-size:18px;font-weight:700;color:#7c2d12;margin:0 0 12px;">Hello ${registration.name} ${registration.surname},</p>
            ${highlightBox(eventInfo())}
            ${bingoCallout('Your registration is approved and has been confirmed.')}
            ${customMessage ? `<p style="margin:0 0 16px;">${customMessage.replace(/\n/g, '</p><p style="margin:0 0 16px;">')}</p>` : ''}
            <p style="margin:0 0 16px;">Please keep this reference number safe, as you will need it later.</p>
            <p style="margin:0 0 16px;">Note: This email cannot be used for another registration.</p>
            ${registration.reference_number ? highlightBox(`<p style="margin:0 0 6px;"><strong>Reference No:</strong> ${registration.reference_number}</p>`) : ''}
          `)
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
