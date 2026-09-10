import { supabase } from '../supabaseClient';
import { uploadReceipt } from './files';
import { BASE_URL, EMAIL_FROM } from './constants';
import { baseEmailTemplate, eventBadge, highlightBox, eventInfo } from './templates';

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
          from: EMAIL_FROM,
          subject: 'Continue your registration - Serhan Kombos Otomotiv',
          html: baseEmailTemplate('Continue Registration', `
            ${eventBadge()}
            <p style="font-size: 18px; font-weight: 600; color: #000000; margin: 0 0 12px;">Hello ${registration.name} ${registration.surname},</p>
            <p>You have saved your registration. Click the link below to continue where you left off.</p>
            <div class="card" style="text-align: center;">
              <p class="card-title">Your Reference Number</p>
              <p class="ref-number"><a href="${BASE_URL}?ref=${referenceNumber}">${referenceNumber}</a></p>
            </div>
            ${highlightBox(eventInfo())}
          `)
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
