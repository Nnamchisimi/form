import React from 'react';
import RejectionForm from './RejectionForm';
import { Trash } from '../icons';


const AdminTable = ({
  dataToShow,
  showArchive,
  language,
  t,
  receiptUrls,
  getStatusColor,
  rejectionForms,
  rejectionReasons,
  rejectionReasonOptions,
  onApprove,
  onDeleteArchived,
  onDeleteRegistration,
  onToggleRejectionForm,
  onReasonChange,
  onOtherChange,
  onConfirmRejection,
  isRecordIncomplete,
  onSendReminder,
  isProcessing
}) => {
  if (dataToShow.length === 0) {
    return <div className="empty-state">{t.noRecords}</div>;
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>{t.name}</th>
          <th>{t.surname}</th>
          <th>{t.email}</th>
          <th>{t.phone}</th>
          <th>{t.dob}</th>
          <th>{t.vehicleBrand}</th>
          <th>{t.vehicleModel}</th>
          <th>{t.modelYear}</th>
          <th>{t.licensePlate}</th>
          <th>{t.location}</th>
          <th>Ref No</th>
          <th>{t.submittedAt}</th>
          <th>{t.receiptFile || 'Car Document File'}</th>
          <th>{t.invitationStatus}</th>
          {!showArchive && <th>{t.actions}</th>}
        </tr>
      </thead>
      <tbody>
        {dataToShow.map((record, index) => (
          <tr key={index}>
            <td>{record.name}</td>
            <td>{record.surname}</td>
            <td>{record.email}</td>
            <td>{record.phone}</td>
            <td>{record.dob}</td>
            <td>{record.vehicle_brand || '-'}</td>
            <td>{record.vehicle_model}</td>
            <td>{record.model_year}</td>
            <td>{record.license_plate}</td>
          <td>{t.locations[record.location] || record.location}</td>
          <td>{record.reference_number || '-'}</td>
          <td>{new Date(record.submitted_at).toLocaleString()}</td>
            <td>
              {record.vehicle_stub && receiptUrls[record.id] ? (
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => window.open(receiptUrls[record.id], '_blank', 'noopener,noreferrer')}
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
                      onClick={() => onToggleRejectionForm(record.id)}
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
                {rejectionForms[record.id] && (
                  <RejectionForm
                    record={record}
                    language={language}
                    rejectionReasons={rejectionReasons}
                    rejectionReasonOptions={rejectionReasonOptions}
                    onReasonChange={onReasonChange}
                    onOtherChange={onOtherChange}
                    onConfirm={onConfirmRejection}
                    onToggleRejectionForm={onToggleRejectionForm}
                    getStatusColor={getStatusColor}
                    receiptUrls={receiptUrls}
                    t={t}
                  />
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminTable;
