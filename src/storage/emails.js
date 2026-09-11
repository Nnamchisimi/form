import { supabase } from '../supabaseClient';
import { EMAIL_FROM, BASE_URL } from './constants';
import { baseEmailTemplate, eventBadge, highlightBox, eventInfo } from './templates';

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
          <p style="font-size: 18px; font-weight: 600; color: #000000; margin: 0 0 12px;">Hello ${registration.name} ${registration.surname},</p>
          <p>Your registration has been received successfully.</p>
          <div class="card" style="text-align: center;">
            <p class="card-title">Your Reference Number</p>
            <p class="ref-number"><a href="${BASE_URL}?ref=${registration.reference_number}" style="color: #000000; text-decoration: none;">${registration.reference_number}</a></p>
          </div>
          ${highlightBox(eventInfo())}
          <p>Keep this reference number for your records. We will review your details and send your invitation once your car document is verified.</p>
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
        from: EMAIL_FROM,
        subject,
        html: baseEmailTemplate(subject, `
          ${eventBadge()}
          <p style="font-size: 18px; font-weight: 600; color: #000000; margin: 0 0 12px;">${greeting}</p>
          <p>${intro}</p>
          ${highlightBox(`<p><strong>${missingLabel}</strong></p><p>${missingList}</p>`)}
          ${customMessage ? highlightBox(`<p><strong>${messageLabel}</strong></p><p>${customMessage.replace(/\n/g, '<br>')}</p>`) : ''}
          <p>${linkLabel}</p>
          <p><a href="${editLink}" style="color: #000000; text-decoration: none; font-weight: 600;">${editLink}</a></p>
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
            from: EMAIL_FROM,
            subject: 'Update from Serhan Kombos Otomotiv',
            html: baseEmailTemplate('Update', `
              ${eventBadge()}
              ${highlightBox(eventInfo())}
              <p>${message.replace(/\n/g, '</p><p>')}</p>
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
          <p style="font-size: 18px; font-weight: 600; color: #000000; margin: 0 0 12px;">Hello ${registration.name} ${registration.surname},</p>
          <p>Your registration was not approved.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          ${registration.reference_number ? highlightBox(`<p><strong>Reference No:</strong> ${registration.reference_number}</p>`) : ''}
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

export const sendApprovalEmail = async (registration) => {
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
          <p style="font-size: 18px; font-weight: 600; color: #000000; margin: 0 0 12px;">Hello ${registration.name} ${registration.surname},</p>
          ${highlightBox(eventInfo())}
          <p>Your registration is approved and has been confirmed.</p>
          <p>Please keep this reference number safe, as you will need it later.</p>
          <p>Note: This email cannot be used for another registration.</p>
          ${registration.reference_number ? highlightBox(`<p><strong>Reference No:</strong> ${registration.reference_number}</p>`) : ''}
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
