import React from 'react';
import RejectionForm from './RejectionForm';

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
  onToggleRejectionForm,
  onReasonChange,
  onOtherChange,
  onConfirmRejection
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
          <th>{t.vehicleModel}</th>
          <th>{t.modelYear}</th>
          <th>{t.licensePlate}</th>
          <th>{t.location}</th>
          <th>Ref No</th>
          <th>{t.submittedAt}</th>
          {!showArchive && <th>{t.receiptFile || 'Receipt File'}</th>}
          <th>{t.invitationStatus}</th>
          {!showArchive && <th>{t.actions}</th>}
          {showArchive && <th>{t.actions || 'Actions'}</th>}
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
            <td>{record.vehicle_model}</td>
            <td>{record.model_year}</td>
            <td>{record.license_plate}</td>
          <td>{t.locations[record.location] || record.location}</td>
          <td>{record.reference_number || '-'}</td>
          <td>{new Date(record.submitted_at).toLocaleString()}</td>
            {!showArchive && (
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
            )}
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
                    disabled={record.invitation_status === 'Approved' || record.invitation_status === 'Rejected'}
                    title={t.approveRegistration}
                  >
                    {t.approveRegistration}
                  </button>
                  <button
                    type="button"
                    className="btn-reject"
                    onClick={() => onToggleRejectionForm(record.id)}
                    disabled={record.invitation_status === 'Approved' || record.invitation_status === 'Rejected'}
                    title={t.rejectRegistration}
                  >
                    {t.rejectRegistration}
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
            {showArchive && (
              <td>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => onDeleteArchived?.(record)}
                  title={t.deleteRecord}
                >
                  {t.delete}
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminTable;
