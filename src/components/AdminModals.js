import React from 'react';
import { Edit } from '../icons';
import RejectionForm from './RejectionForm';

const AdminModals = ({
  approvalModal,
  rejectionModal,
  documentViewer,
  reminderModal,
  setReminderModal,
  approvalChassis,
  setApprovalChassis,
  approvalMessage,
  setApprovalMessage,
  confirmApproval,
  setConfirmApproval,
  reminderMessage,
  setReminderMessage,
  receiptUrls,
  language,
  t,
  getStatusColor,
  rejectionReasons,
  rejectionReasonOptions,
  onCloseApprovalModal,
  onCloseRejectionModal,
  onCloseDocument,
  onApprove,
  onArchiveRecord,
  onReasonChange,
  onOtherChange,
  onSendReminderEmail,
  imageTransformOrigin,
  handleImageMouseMove,
  handleImageMouseLeave,
}) => {
  return (
    <>
      {reminderModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t.sendReminder}</h3>
            <p><strong>To:</strong> {reminderModal.email}</p>
            <p><strong>Reference:</strong> {reminderModal.reference_number}</p>
            <textarea
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              rows={12}
              style={{ width: '100%', marginTop: 12, padding: 12, fontSize: 14, fontFamily: 'inherit' }}
            />
            <div className="button-group" style={{ marginTop: 16 }}>
              <button type="button" className="btn-secondary" onClick={() => { setReminderModal(null); setReminderMessage(''); }}>
                {t.cancel}
              </button>
              <button type="button" className="btn-primary" onClick={onSendReminderEmail}>
                {t.sendMessage}
              </button>
            </div>
          </div>
        </div>
      )}

      {approvalModal && (
        <div className="modal-overlay">
          <div className="modal approval-modal">
            <div className="approval-modal-header">
              <h3>{language === 'en' ? 'Review Registration' : 'Kaydı İncele'}</h3>
              <button type="button" className="btn-ghost" onClick={onCloseApprovalModal} title={language === 'en' ? 'Close' : 'Kapat'}>
                {language === 'en' ? 'Close' : 'Kapat'}
              </button>
            </div>
            <div className="approval-modal-body">
              <div className="approval-document">
                <h4>{t.receiptFile || 'Car Document File'}</h4>
                {receiptUrls[approvalModal.id] ? (
                  <img
                    src={receiptUrls[approvalModal.id]}
                    alt="Car document"
                    className="approval-document-image"
                    style={{ transformOrigin: imageTransformOrigin }}
                    onMouseMove={handleImageMouseMove}
                    onMouseLeave={handleImageMouseLeave}
                  />
                ) : (
                  <div className="approval-document-placeholder">
                    {language === 'en' ? 'No document available' : 'Belge mevcut değil'}
                  </div>
                )}
              </div>
              <div className="approval-details">
                <h4>{language === 'en' ? 'Registration Details' : 'Kayıt Detayları'}</h4>
                <div className="approval-details-grid">
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.name}</span>
                    <span className="approval-detail-value">{approvalModal.name}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.surname}</span>
                    <span className="approval-detail-value">{approvalModal.surname}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.email}</span>
                    <span className="approval-detail-value">{approvalModal.email}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.phone}</span>
                    <span className="approval-detail-value">{approvalModal.phone}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.dob}</span>
                    <span className="approval-detail-value">{approvalModal.dob}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.vehicleModel}</span>
                    <span className="approval-detail-value">{approvalModal.vehicle_model}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.modelYear}</span>
                    <span className="approval-detail-value">{approvalModal.model_year}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.licensePlate}</span>
                    <span className="approval-detail-value">{approvalModal.license_plate}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.location}</span>
                    <span className="approval-detail-value">{t.locations?.[approvalModal.location] || approvalModal.location}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">Ref No</span>
                    <span className="approval-detail-value">{approvalModal.reference_number}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.submittedAt}</span>
                    <span className="approval-detail-value">{new Date(approvalModal.submitted_at).toLocaleString()}</span>
                  </div>
                </div>
                 <div className="form-group" style={{ marginTop: 16 }}>
                    <label htmlFor="approval-chassis" style={{ fontWeight: 600, fontSize: '0.95em' }}>
                      {t.chassisNumber}
                    </label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <input
                        id="approval-chassis"
                        type="text"
                        value={approvalChassis}
                        onChange={(e) => setApprovalChassis(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            onApprove(approvalModal);
                          }
                        }}
                        placeholder={language === 'en' ? 'Enter chassis number' : 'Şasi numarası girin'}
                        style={{ flex: 1, padding: 10, fontSize: 14, fontFamily: 'inherit' }}
                      />
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => setConfirmApproval(true)}
                        title={language === 'en' ? 'Approve with chassis number' : 'Şasi numarasıyla onayla'}
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label htmlFor="approval-message" style={{ fontWeight: 600, fontSize: '0.95em' }}>
                      {language === 'en' ? 'Approval Message (optional)' : 'Onay Mesajı (isteğe bağlı)'}
                    </label>
                    <textarea
                      id="approval-message"
                      value={approvalMessage}
                      onChange={(e) => setApprovalMessage(e.target.value)}
                      rows={5}
                      placeholder={language === 'en' ? 'Enter a custom message to include in the approval email...' : 'Onay e-postasına eklenecek özel mesajı girin...'}
                      style={{ width: '100%', marginTop: 8, padding: 12, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
              </div>
            </div>
            {confirmApproval && (
              <div style={{ marginTop: 16, padding: 12, background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8, color: '#92400e', fontWeight: 600 }}>
                {t.confirmApproval}
              </div>
            )}
            <div className="approval-modal-footer">
              {!confirmApproval ? (
                <>
                  <button type="button" className="btn-secondary" onClick={onCloseApprovalModal}>
                    {language === 'en' ? 'Cancel' : 'İptal'}
                  </button>
                  <button type="button" className="btn-approve" onClick={() => setConfirmApproval(true)}>
                    {t.approveRegistration}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn-secondary" onClick={() => setConfirmApproval(false)}>
                    {t.confirmApprovalNo}
                  </button>
                  <button type="button" className="btn-approve" onClick={() => onApprove(approvalModal)}>
                    {t.confirmApprovalYes}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {rejectionModal && (
        <div className="modal-overlay">
          <div className="modal rejection-modal">
            <div className="approval-modal-header">
              <h3>{language === 'en' ? 'Reject Registration' : 'Kaydı Reddet'}</h3>
              <button type="button" className="btn-ghost" onClick={onCloseRejectionModal} title={language === 'en' ? 'Close' : 'Kapat'}>
                {language === 'en' ? 'Close' : 'Kapat'}
              </button>
            </div>
            <div className="approval-modal-body">
              <div className="approval-document">
                <h4>{t.receiptFile || 'Car Document File'}</h4>
                {receiptUrls[rejectionModal.id] ? (
                  <img
                    src={receiptUrls[rejectionModal.id]}
                    alt="Car document"
                    className="approval-document-image"
                    style={{ transformOrigin: imageTransformOrigin }}
                    onMouseMove={handleImageMouseMove}
                    onMouseLeave={handleImageMouseLeave}
                  />
                ) : (
                  <div className="approval-document-placeholder">
                    {language === 'en' ? 'No document available' : 'Belge mevcut değil'}
                  </div>
                )}
              </div>
              <div className="approval-details">
                <h4>{language === 'en' ? 'Registration Details' : 'Kayıt Detayları'}</h4>
                <div className="approval-details-grid">
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.name}</span>
                    <span className="approval-detail-value">{rejectionModal.name}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.surname}</span>
                    <span className="approval-detail-value">{rejectionModal.surname}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.email}</span>
                    <span className="approval-detail-value">{rejectionModal.email}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.phone}</span>
                    <span className="approval-detail-value">{rejectionModal.phone}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.dob}</span>
                    <span className="approval-detail-value">{rejectionModal.dob}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.vehicleModel}</span>
                    <span className="approval-detail-value">{rejectionModal.vehicle_model}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.modelYear}</span>
                    <span className="approval-detail-value">{rejectionModal.model_year}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.licensePlate}</span>
                    <span className="approval-detail-value">{rejectionModal.license_plate}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.chassisNumber}</span>
                    <span className="approval-detail-value">{rejectionModal.chassis_number || '-'}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.location}</span>
                    <span className="approval-detail-value">{t.locations?.[rejectionModal.location] || rejectionModal.location}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">Ref No</span>
                    <span className="approval-detail-value">{rejectionModal.reference_number}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.submittedAt}</span>
                    <span className="approval-detail-value">{new Date(rejectionModal.submitted_at).toLocaleString()}</span>
                  </div>
                </div>
                <h4 style={{ marginTop: 20 }}>{language === 'en' ? 'Rejection Details' : 'Reddetme Detayları'}</h4>
                <RejectionForm
                  record={rejectionModal}
                  language={language}
                  rejectionReasons={rejectionReasons}
                  rejectionReasonOptions={rejectionReasonOptions}
                  onReasonChange={onReasonChange}
                  onOtherChange={onOtherChange}
                  onConfirm={() => {
                    onArchiveRecord(rejectionModal);
                    onCloseRejectionModal();
                  }}
                  onToggleRejectionForm={onCloseRejectionModal}
                  getStatusColor={getStatusColor}
                  receiptUrls={receiptUrls}
                  t={t}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {documentViewer && (
        <div className="modal-overlay">
          <div className="modal document-modal">
            <div className="approval-modal-header">
              <h3>{language === 'en' ? 'Car Document' : 'Araç Belgesi'}</h3>
              <button type="button" className="btn-ghost" onClick={onCloseDocument} title={language === 'en' ? 'Close' : 'Kapat'}>
                {language === 'en' ? 'Close' : 'Kapat'}
              </button>
            </div>
            <div className="approval-modal-body">
              <div className="approval-document">
                <h4>{t.receiptFile || 'Car Document File'}</h4>
                {receiptUrls[documentViewer.id] ? (
                  <img
                    src={receiptUrls[documentViewer.id]}
                    alt="Car document"
                    className="approval-document-image"
                    style={{ transformOrigin: imageTransformOrigin }}
                    onMouseMove={handleImageMouseMove}
                    onMouseLeave={handleImageMouseLeave}
                  />
                ) : (
                  <div className="approval-document-placeholder">
                    {language === 'en' ? 'No document available' : 'Belge mevcut değil'}
                  </div>
                )}
              </div>
              <div className="approval-details">
                <h4>{language === 'en' ? 'Registration Details' : 'Kayıt Detayları'}</h4>
                <div className="approval-details-grid">
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.name}</span>
                    <span className="approval-detail-value">{documentViewer.name}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.surname}</span>
                    <span className="approval-detail-value">{documentViewer.surname}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.email}</span>
                    <span className="approval-detail-value">{documentViewer.email}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.phone}</span>
                    <span className="approval-detail-value">{documentViewer.phone}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.dob}</span>
                    <span className="approval-detail-value">{documentViewer.dob}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.vehicleModel}</span>
                    <span className="approval-detail-value">{documentViewer.vehicle_model}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.modelYear}</span>
                    <span className="approval-detail-value">{documentViewer.model_year}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.licensePlate}</span>
                    <span className="approval-detail-value">{documentViewer.license_plate}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.chassisNumber}</span>
                    <span className="approval-detail-value">{documentViewer.chassis_number || '-'}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.location}</span>
                    <span className="approval-detail-value">{t.locations?.[documentViewer.location] || documentViewer.location}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">Ref No</span>
                    <span className="approval-detail-value">{documentViewer.reference_number}</span>
                  </div>
                  <div className="approval-detail-item">
                    <span className="approval-detail-label">{t.submittedAt}</span>
                    <span className="approval-detail-value">{new Date(documentViewer.submitted_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminModals;
