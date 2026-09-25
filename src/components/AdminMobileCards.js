import React from 'react';
import { Trash } from '../icons';

const AdminMobileCards = ({
  dataToShow,
  showArchive,
  language,
  t,
  getStatusColor,
  receiptUrls,
  rejectionReasons,
  rejectionReasonOptions,
  onApprove,
  onOpenRejectionModal,
  onDeleteArchived,
  onDeleteRegistration,
  onReasonChange,
  onOtherChange,
  onConfirmRejection,
  isRecordIncomplete,
  onSendReminder,
  onViewDocument,
  isProcessing
}) => {
  const getLanguageLabel = (lang) => {
    if (lang === 'tr') return 'TR';
    if (lang === 'en') return 'EN';
    if (!lang) return '-';
    return String(lang).toUpperCase();
  };

  return (
    <div className="admin-mobile-cards">
      {dataToShow.map((record, index) => (
        <div key={index} className="admin-mobile-card">
          <div className="admin-mobile-card-header">
            <div>
              <div className="admin-mobile-card-title">{record.name} {record.surname}</div>
              <div className="admin-mobile-card-subtitle">{record.email}</div>
            </div>
            <span className="status-badge" style={{ backgroundColor: getStatusColor(record.invitation_status || 'Pending') }}>
              {record.invitation_status || 'Pending'}
            </span>
          </div>

          <div className="admin-mobile-card-body">
            <div className="admin-mobile-field">
              <span className="admin-mobile-field-label">{t.phone}</span>
              <span className="admin-mobile-field-value">{record.phone}</span>
            </div>
            <div className="admin-mobile-field">
              <span className="admin-mobile-field-label">{t.dob}</span>
              <span className="admin-mobile-field-value">{record.dob}</span>
            </div>
            <div className="admin-mobile-field">
              <span className="admin-mobile-field-label">{t.vehicleModel}</span>
              <span className="admin-mobile-field-value">{record.vehicle_model} ({record.model_year})</span>
            </div>
            <div className="admin-mobile-field">
              <span className="admin-mobile-field-label">{t.licensePlate}</span>
              <span className="admin-mobile-field-value">{record.license_plate}</span>
            </div>
            <div className="admin-mobile-field">
              <span className="admin-mobile-field-label">{t.chassisNumber}</span>
              <span className="admin-mobile-field-value">{record.chassis_number || '-'}</span>
            </div>
            <div className="admin-mobile-field">
              <span className="admin-mobile-field-label">{t.location}</span>
              <span className="admin-mobile-field-value">{t.locations[record.location] || record.location}</span>
            </div>
            <div className="admin-mobile-field">
              <span className="admin-mobile-field-label">Ref No</span>
              <span className="admin-mobile-field-value">{record.reference_number || '-'}</span>
            </div>
            <div className="admin-mobile-field">
              <span className="admin-mobile-field-label">{t.language}</span>
              <span className="admin-mobile-field-value">{getLanguageLabel(record.language)}</span>
            </div>
            <div className="admin-mobile-field">
              <span className="admin-mobile-field-label">{t.submittedAt}</span>
              <span className="admin-mobile-field-value">{new Date(record.submitted_at).toLocaleString()}</span>
            </div>
            {record.vehicle_stub && receiptUrls[record.id] && (
              <div className="admin-mobile-field">
                <span className="admin-mobile-field-label">{t.receiptFile || 'Car Document File'}</span>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => onViewDocument?.(record)}
                  title={t.viewReceipt}
                >
                  {t.viewReceiptButton}
                </button>
              </div>
            )}

            {!showArchive && (
              <div className="admin-mobile-actions">
                <div className="admin-mobile-actions-row">
                  {!isRecordIncomplete?.(record) && (
                    <button
                      type="button"
                      className="btn-approve"
                      onClick={() => onApprove(record)}
                      disabled={record.invitation_status === 'Approved' || record.invitation_status === 'Rejected' || isProcessing?.(record.id)}
                      title={t.approveRegistration}
                    >
                      {t.approveRegistration}
                    </button>
                  )}
                  {!isRecordIncomplete?.(record) && (
                    <button
                      type="button"
                      className="btn-reject"
                      onClick={() => onOpenRejectionModal?.(record)}
                      disabled={record.invitation_status === 'Approved' || record.invitation_status === 'Rejected' || isProcessing?.(record.id)}
                      title={t.rejectRegistration}
                    >
                      {t.rejectRegistration}
                    </button>
                  )}
                  {isRecordIncomplete?.(record) && (
                    <button
                      type="button"
                      className="btn-send"
                      onClick={() => onSendReminder?.(record)}
                      title={t.sendReminder}
                    >
                      {t.sendReminder}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => onDeleteRegistration?.(record)}
                    title={t.deleteRecord}
                  >
                    <Trash size={14} style={{ marginRight: 4 }} />
                    {t.delete}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminMobileCards;
