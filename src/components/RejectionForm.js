import React from 'react';

const RejectionForm = ({
  record,
  language,
  rejectionReasons,
  rejectionReasonOptions,
  onReasonChange,
  onOtherChange,
  onConfirm,
  onToggleRejectionForm,
  getStatusColor,
  receiptUrls,
  t
}) => {
  const selectedReasons = rejectionReasons[record.id] || [];
  const customReason = rejectionReasons[`${record.id}_other`] || '';

  return (
    <div className="rejection-form">
      <label>{t.selectRejectionReason}</label>
      <div className="rejection-options">
        {rejectionReasonOptions.map((option) => (
          <label key={option.value} className="rejection-option">
            <input
              type="radio"
              name={`rejection-${record.id}`}
              checked={selectedReasons.includes(option.value)}
              onChange={() => onReasonChange(record.id, option.value)}
            />
            <span>{language === 'en' ? option.en : option.tr}</span>
          </label>
        ))}
      </div>
      {selectedReasons.includes('other') && (
        <div className="form-group">
          <label>{t.otherReason}</label>
          <textarea
            placeholder={t.otherReasonPlaceholder}
            value={customReason}
            onChange={(e) => onOtherChange(record.id, e.target.value)}
            className="message-input"
          />
        </div>
      )}
      <button
        type="button"
        className="btn-confirm-reject"
        onClick={() => onConfirm(record)}
      >
        {t.confirmRejection}
      </button>
      <button
        type="button"
        className="btn-cancel-reject"
        onClick={() => onToggleRejectionForm(record.id)}
      >
        {t.cancel}
      </button>
    </div>
  );
};

export default RejectionForm;
