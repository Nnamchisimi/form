import { getRegistrations, findActiveRegistrationByEmail, findArchivedRegistrationByEmail, getRegistrationByReference, updateRegistrationByReference, saveRegistration, updateRegistration, archiveRegistration, deleteRegistration, getArchivedRegistrations, deleteArchivedRegistration, markEditLinkUsed } from './registrations';
import { sendConfirmationEmail, sendReminderEmail, sendMessage, sendRejectionEmail, sendApprovalEmail } from './emails';
import { uploadReceipt, getReceiptUrl } from './files';
import { addReminder, getReminders } from './reminders';
import { saveDraftRegistration, getDraft, saveDraft, clearDraft } from './drafts';

export { getRegistrations, findActiveRegistrationByEmail, findArchivedRegistrationByEmail, getRegistrationByReference, updateRegistrationByReference, saveRegistration, updateRegistration, archiveRegistration, deleteRegistration, getArchivedRegistrations, deleteArchivedRegistration, markEditLinkUsed } from './registrations';
export { sendConfirmationEmail, sendReminderEmail, sendMessage, sendRejectionEmail, sendApprovalEmail } from './emails';
export { uploadReceipt, getReceiptUrl } from './files';
export { addReminder, getReminders } from './reminders';
export { saveDraftRegistration, getDraft, saveDraft, clearDraft } from './drafts';

const storage = {
  getRegistrations,
  saveRegistration,
  updateRegistration,
  findActiveRegistrationByEmail,
  findArchivedRegistrationByEmail,
  getRegistrationByReference,
  updateRegistrationByReference,
  markEditLinkUsed,
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
  sendRejectionEmail,
  sendMessage
};

export default storage;
