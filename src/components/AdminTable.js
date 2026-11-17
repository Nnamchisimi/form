import React from 'react';
import { Trash } from '../icons';


const AdminTable = ({
  dataToShow,
  showArchive,
  language,
  t,
  receiptUrls,
  getStatusColor,
  rejectionReasons,
  rejectionReasonOptions,
  onApprove,
  onOpenRejectionModal,
  onResendApproval,
  onResendApprovalArchive,
  onDeleteArchived,
  onDeleteRegistration,
  onReasonChange,
  onOtherChange,
  onConfirmRejection,
  isRecordIncomplete,
  onSendReminder,
  onViewDocument,
  isProcessing,
  isProcessingAny,
  selectedIds,
  onToggleSelect
}) => {
  const getLanguageLabel = (lang) => {
    if (lang === 'tr') return 'TR';
    if (lang === 'en') return 'EN';
    if (!lang) return '-';
    return String(lang).toUpperCase();
  };

  return (
    <table className="admin-table">
      <thead>
        <tr>
          {!showArchive && <th style={{ width: 36 }}></th>}
          <th>{t.name}</th>
          <th>{t.surname}</th>
          <th>{t.email}</th>
          <th>{t.phone}</th>
          <th>{t.dob}</th>
          <th>{t.vehicleModel}</th>
          <th>{t.modelYear}</th>
          <th>{t.licensePlate}</th>
          <th>{t.chassisNumber}</th>
          <th>{t.location}</th>
          <th>Ref No</th>
          <th>{t.language}</th>
          <th>{t.submittedAt}</th>
          <th>{language === 'en' ? 'Approved At' : 'Onaylanma Zamanı'}</th>
          <th>{t.receiptFile || 'Car Document File'}</th>
          <th>{t.invitationStatus}</th>
          {!showArchive && <th>{t.actions}</th>}
        </tr>
      </thead>
      <tbody>
        {dataToShow.map((record, index) => {
          const eligible = record.invitation_status !== 'Approved' && record.invitation_status !== 'Rejected';
          return (
          <tr key={record.id || index}>
            {!showArchive && (
              <td>
                <input
                  type="checkbox"
                  checked={!!selectedIds?.has(record.id)}
                  onChange={() => onToggleSelect?.(record.id)}
                  disabled={!eligible || isProcessingAny}
                  aria-label={language === 'en' ? 'Select record' : 'Kaydı seç'}
                />
              </td>
            )}
            <td>{record.name}</td>
            <td>{record.surname}</td>
            <td>{record.email}</td>
            <td>{record.phone}</td>
            <td>{record.dob}</td>
            <td>{record.vehicle_model}</td>
            <td>{record.model_year}</td>
            <td>{record.license_plate}</td>
            <td>{record.chassis_number || '-'}</td>
          <td>{t.locations[record.location] || record.location}</td>
          <td>{record.reference_number || '-'}</td>
          <td>{getLanguageLabel(record.language)}</td>
          <td>{record.submitted_at ? new Date(record.submitted_at).toLocaleString() : '-'}</td>
          <td>{record.approved_at ? new Date(record.approved_at).toLocaleString() : '-'}</td>
            <td>
              {record.vehicle_stub && receiptUrls[record.id] ? (
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => onViewDocument?.(record)}
                  title={t.viewReceipt}
                >
                  {t.viewReceiptButton}
                </button>
              ) : (
                'N/A'
              )}
            </td>
            <td>
              <span className="status-badge" style={{ backgroundColor: getStatusColor(record.invitation_status || 'Pending') }}>
                {record.invitation_status || 'Pending'}
              </span>
            </td>
            {!showArchive && (
              <td>
                <div className="action-buttons-row">
                  <button
                    type="button"
                    className="btn-approve"
                    onClick={() => onApprove(record)}
                    disabled={record.invitation_status === 'Approved' || record.invitation_status === 'Rejected' || isProcessing?.(record.id) || isProcessingAny}
                    title={t.approveRegistration}
                    style={isProcessing?.(record.id) ? { position: 'relative', overflow: 'hidden' } : undefined}
                  >
                    {isProcessing?.(record.id) ? (language === 'en' ? 'Approving...' : 'Onaylanıyor...') : t.approveRegistration}
                    {isProcessing?.(record.id) && <span style={{ position: 'absolute', left: 0, bottom: 0, height: 3, width: '100%', background: 'rgba(255,255,255,0.7)', animation: 'approvalBtnBar 1s linear infinite' }} />}
                  </button>
                  {isProcessing?.(record.id) && <style>{`@keyframes approvalBtnBar { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>}
                  <button
                    type="button"
                    className="btn-reject"
                    onClick={() => onOpenRejectionModal?.(record)}
                    disabled={record.invitation_status === 'Approved' || record.invitation_status === 'Rejected' || isProcessing?.(record.id) || isProcessingAny}
                    title={t.rejectRegistration}
                  >
                    {t.rejectRegistration}
                  </button>
                  {record.invitation_status === 'Approved' && (
                    <button
                      type="button"
                      className="btn-send"
                      onClick={() => onResendApproval?.(record)}
                      disabled={isProcessing?.(record.id) || isProcessingAny}
                      title={language === 'en' ? 'Resend approval email' : 'Onay e-postasını yeniden gönder'}
                    >
                      {language === 'en' ? 'Resend Approval' : 'Onayı Yeniden Gönder'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-send"
                    onClick={() => onSendReminder?.(record)}
                    disabled={isProcessing?.(record.id) || isProcessingAny}
                    title={t.sendReminder}
                  >
                    {t.sendReminder}
                  </button>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => onDeleteRegistration?.(record)}
                    disabled={isProcessing?.(record.id) || isProcessingAny}
                    title={t.deleteRecord}
                  >
                    <Trash size={14} style={{ marginRight: 4 }} />
                    {t.delete}
                  </button>
                </div>
              </td>
            )}
            {showArchive && (
              <td>
                <div className="action-buttons-row">
                  {record.invitation_status === 'Approved' && (
                    <button
                      type="button"
                      className="btn-send"
                      onClick={() => onResendApprovalArchive?.(record)}
                      disabled={isProcessing?.(record.id) || isProcessingAny}
                      title={language === 'en' ? 'Resend approval email' : 'Onay e-postasını yeniden gönder'}
                    >
                      {language === 'en' ? 'Resend Approval' : 'Onayı Yeniden Gönder'}
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        );})}
      </tbody>
    </table>
  );
};

export default AdminTable;
