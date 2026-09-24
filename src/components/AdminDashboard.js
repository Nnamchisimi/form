import React from 'react';
import AdminTable from './AdminTable';
import AdminMobileCards from './AdminMobileCards';
import { Download, Users, Archive, LogOut } from '../icons';

const AdminDashboard = ({
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
  onViewDocument,
  onReasonChange,
  onOtherChange,
  onConfirmRejection,
  onDeleteArchived,
  onDeleteRegistration,
  isRecordIncomplete,
  onSendReminder,
  isProcessing,
  currentPage,
  totalPages,
  goToPage,
  adminView,
  openReminderHistory,
  closeReminderHistory,
  loadReminderLogs,
  reminderLogs,
  downloadExcel,
  toggleArchiveView,
  handleLogout,
  sessionUserEmail,
}) => {
  return (
    <>
      {adminView === 'dashboard' && (
        <>
          <div className="page-header">
            <div>
              <h1>{t.adminTitle}</h1>
              {sessionUserEmail && <p className="admin-email">{sessionUserEmail}</p>}
              <p>{showArchive ? t.archivedRegistrations : t.adminSubtitle}</p>
            </div>
            <div className="page-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={downloadExcel}
                disabled={dataToShow.length === 0}
                title={t.downloadExcel}
              >
                <Download size={18} style={{ marginRight: 6 }} />
                {t.downloadExcel}
              </button>
              <button
                type="button"
                className={`btn-ghost ${!showArchive ? 'active' : ''}`}
                onClick={() => { if (showArchive) toggleArchiveView(); }}
                title={t.activeRegistrations}
              >
                <Users size={18} style={{ marginRight: 6 }} />
                {t.activeRegistrations}
              </button>
              <button
                type="button"
                className={`btn-ghost ${showArchive ? 'active' : ''}`}
                onClick={() => { if (!showArchive) toggleArchiveView(); }}
                title={t.archivedRegistrations}
              >
                <Archive size={18} style={{ marginRight: 6 }} />
                {t.archivedRegistrations}
              </button>
              <button
                type="button"
                className={`btn-ghost ${adminView === 'reminder-history' ? 'active' : ''}`}
                onClick={openReminderHistory}
                title={t.reminderHistory}
              >
                <Users size={18} style={{ marginRight: 6 }} />
                {t.reminderHistory}
              </button>
              <button type="button" className="btn-ghost" onClick={handleLogout} title={t.logout}>
                <LogOut size={18} style={{ marginRight: 6 }} />
                {t.logout}
              </button>
            </div>
          </div>

          <div className="stats-card">
            <Users size={20} />
            <span className="stats-number">{dataToShow.length}</span>
            <span className="stats-label">{showArchive ? t.archivedRegistrations : t.totalRegistrations}</span>
          </div>

          {dataToShow.length === 0 ? (
            <div className="empty-state">{t.noRecords}</div>
          ) : (
            <>
              <div className="table-wrapper admin-table-wrapper">
                <AdminTable
                  dataToShow={dataToShow}
                  showArchive={showArchive}
                  language={language}
                  t={t}
                  receiptUrls={receiptUrls}
                  getStatusColor={getStatusColor}
                  rejectionReasons={rejectionReasons}
                  rejectionReasonOptions={rejectionReasonOptions}
                  onApprove={onApprove}
                  onOpenRejectionModal={onOpenRejectionModal}
                  onViewDocument={onViewDocument}
                  onReasonChange={onReasonChange}
                  onOtherChange={onOtherChange}
                  onConfirmRejection={onConfirmRejection}
                  onDeleteArchived={onDeleteArchived}
                  onDeleteRegistration={onDeleteRegistration}
                  isRecordIncomplete={isRecordIncomplete}
                  onSendReminder={onSendReminder}
                  isProcessing={isProcessing}
                />
              </div>

              <AdminMobileCards
                dataToShow={dataToShow}
                showArchive={showArchive}
                language={language}
                t={t}
                getStatusColor={getStatusColor}
                receiptUrls={receiptUrls}
                rejectionReasons={rejectionReasons}
                rejectionReasonOptions={rejectionReasonOptions}
                onApprove={onApprove}
                onOpenRejectionModal={onOpenRejectionModal}
                onViewDocument={onViewDocument}
                onReasonChange={onReasonChange}
                onOtherChange={onOtherChange}
                onConfirmRejection={onConfirmRejection}
                onDeleteArchived={onDeleteArchived}
                onDeleteRegistration={onDeleteRegistration}
                isRecordIncomplete={isRecordIncomplete}
                onSendReminder={onSendReminder}
                isProcessing={isProcessing}
              />
            </>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button type="button" className="btn-secondary" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                {language === 'en' ? 'Previous' : 'Önceki'}
              </button>
              <span className="pagination-info">
                {language === 'en' ? 'Page' : 'Sayfa'} {currentPage} / {totalPages}
              </span>
              <button type="button" className="btn-secondary" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                {language === 'en' ? 'Next' : 'Sonraki'}
              </button>
            </div>
          )}
        </>
      )}

      {adminView === 'reminder-history' && (
        <div className="container admin-container" style={{ marginTop: 32 }}>
          <div className="page-header">
            <div>
              <h1>{t.reminderHistory}</h1>
              <p>{language === 'en' ? 'History of reminder emails sent to registrants' : 'Kayıtlılara gönderilen hatırlatma e-postaları geçmişi'}</p>
            </div>
            <div className="page-actions">
              <button type="button" className="btn-secondary" onClick={loadReminderLogs}>
                {language === 'en' ? 'Refresh' : 'Yenile'}
              </button>
              <button type="button" className="btn-secondary" onClick={closeReminderHistory}>
                {language === 'en' ? 'Back' : 'Geri'}
              </button>
            </div>
          </div>

          <div className="table-wrapper admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{language === 'en' ? 'Sent At' : 'Gönderim Zamanı'}</th>
                  <th>{language === 'en' ? 'Type' : 'Tür'}</th>
                  <th>{language === 'en' ? 'Message' : 'Mesaj'}</th>
                  <th>{t.name}</th>
                  <th>{t.surname}</th>
                  <th>{t.email}</th>
                  <th>Ref No</th>
                </tr>
              </thead>
              <tbody>
                {reminderLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                      {language === 'en' ? 'No reminders sent yet.' : 'Henüz hatırlatma gönderilmemiş.'}
                    </td>
                  </tr>
                ) : (
                  reminderLogs.map((log, index) => (
                    <tr key={log.id || index}>
                      <td>{new Date(log.sent_at).toLocaleString()}</td>
                      <td style={{ textTransform: 'capitalize' }}>{log.type}</td>
                      <td>{log.message || '-'}</td>
                      <td>{log.name}</td>
                      <td>{log.surname}</td>
                      <td>{log.email}</td>
                      <td>{log.reference_number}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
