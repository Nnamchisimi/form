import { supabase } from '../supabaseClient';
import { uploadReceipt } from './files';
import { BASE_URL, EMAIL_FROM } from './constants';
import { baseEmailTemplate, eventBadge, highlightBox, eventInfo, bingoCallout } from './templates';

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
    .select();

  if (error) {
    console.error('Error saving draft registration:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('No data returned after saving draft registration');
  }

  const draft = data[0];
  if (draft?.email) {
    try {
      await supabase.functions.invoke('rapid-service', {
        body: {
          to: draft.email,
          from: EMAIL_FROM,
          subject: 'Continue your registration - Serhan Kombos Otomotiv',
          html: baseEmailTemplate('Continue Registration', `
            ${eventBadge()}
            <p style="font-size:18px;font-weight:700;color:#7c2d12;margin:0 0 12px;">Hello ${registration.name} ${registration.surname},</p>
            <p style="margin:0 0 16px;">You have saved your registration. Click the link below to continue where you left off.</p>
            ${bingoCallout('Your spot in the bingo draw is reserved.')}
            <div style="background:#ffffff;border:1px solid #fde68a;border-radius:12px;padding:18px 20px;margin:20px 0;box-shadow:0 2px 8px rgba(217,119,6,0.08);text-align:center;">
              <p style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#92400e;margin:0 0 10px;font-weight:700;">Your Reference Number</p>
              <p style="font-size:22px;font-weight:800;color:#7c2d12;letter-spacing:1px;margin:0;"><a href="${BASE_URL}?ref=${referenceNumber}" style="color:#b45309;text-decoration:none;">${referenceNumber}</a></p>
              <p style="font-size:12px;color:#92400e;margin-top:8px;">This link can only be used once.</p>
            </div>
            ${highlightBox(eventInfo())}
          `)
        }
      });
      console.log('Draft email sent to:', draft.email);
    } catch (emailError) {
      console.error('Error sending draft email:', emailError);
      throw emailError;
    }
  }

  return draft;
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
