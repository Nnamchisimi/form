import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Users, ArrowLeft, Archive, LogOut } from '../icons';
import storage from '../storage';
import { supabase } from '../supabaseClient';
import translations from '../translations';
import AdminTable from './AdminTable';
import AdminMobileCards from './AdminMobileCards';

const AdminPage = ({ language, onBack, onToast }) => {
  const showToast = (message, severity = 'info') => {
    if (onToast) onToast(message, severity);
  };
  const [records, setRecords] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const processingRef = useRef(new Set());
  const [receiptUrls, setReceiptUrls] = useState({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [archivedRecords, setArchivedRecords] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [rejectionForms, setRejectionForms] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [reminderModal, setReminderModal] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const itemsPerPage = 10;
  const t = translations[language];

  useEffect(() => {
    setCurrentPage(1);
  }, [showArchive, records.length, archivedRecords.length]);

  useEffect(() => {
    if (!session) return;

    const SESSION_TIMEOUT = 30 * 60 * 1000;
    const timer = setTimeout(async () => {
      await supabase.auth.signOut();
      setSession(null);
    }, SESSION_TIMEOUT);

    const resetTimer = () => {
      clearTimeout(timer);
      setTimeout(async () => {
        await supabase.auth.signOut();
        setSession(null);
      }, SESSION_TIMEOUT);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [session]);

  const rejectionReasonOptions = [
    { value: 'incomplete', en: 'Incomplete information', tr: 'Eksik bilgiler' },
    { value: 'invalid_details', en: 'Invalid/incorrect details', tr: 'Geçersiz/yanlış detaylar' },
    { value: 'duplicate', en: 'Duplicate registration', tr: 'Tekrarlayan kayıt' },
    { value: 'other', en: 'Other', tr: 'Diğer' }
  ];

  const loadReceiptUrls = useCallback(async (records) => {
    const newUrls = {};
    for (const record of records) {
      if (record.vehicle_stub) {
        try {
          const url = await storage.getReceiptUrl(record.vehicle_stub);
          newUrls[record.id] = url;
        } catch (error) {
          console.error('Error loading receipt URL for record', record.id, ':', error);
        }
      }
    }
    setReceiptUrls(prev => ({ ...prev, ...newUrls }));
  }, []);

  const loadRegistrations = useCallback(async () => {
    try {
      const data = await storage.getRegistrations();
      setRecords(data);
      await loadReceiptUrls(data);
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  }, [loadReceiptUrls]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  };

  useEffect(() => {
    checkAuth();
    loadRegistrations();
  }, [loadRegistrations]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Submitted': return '#3b82f6';
      case 'Verified': return '#10b981';
      case 'Sent': return '#10b981';
      case 'Approved': return '#10b981';
      case 'Rejected': return '#ef4444';
      case 'Info Requested': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const isRecordIncomplete = (record) => {
    if (!record) return false;
    const missing = [];
    if (!record.name?.trim()) missing.push('name');
    if (!record.surname?.trim()) missing.push('surname');
    if (!record.email?.trim()) missing.push('email');
    if (!record.phone?.trim()) missing.push('phone');
    if (!record.dob) missing.push('dob');
    if (!record.vehicle_brand) missing.push('vehicleBrand');
    if (!record.vehicle_model?.trim()) missing.push('vehicleModel');
    if (!record.model_year) missing.push('modelYear');
    if (!record.license_plate?.trim()) missing.push('licensePlate');
    if (!record.location) missing.push('location');
    if (!record.vehicle_stub) missing.push('vehicleStub');
    return missing.length > 0;
  };

  const getMissingFields = (record) => {
    if (!record) return [];
    const missing = [];
    if (!record.name?.trim()) missing.push(language === 'tr' ? 'Ad' : 'Name');
    if (!record.surname?.trim()) missing.push(language === 'tr' ? 'Soyadı' : 'Surname');
    if (!record.email?.trim()) missing.push(language === 'tr' ? 'E-posta' : 'Email');
    if (!record.phone?.trim()) missing.push(language === 'tr' ? 'Telefon Numarası' : 'Phone Number');
    if (!record.dob) missing.push(language === 'tr' ? 'Doğum Tarihi' : 'Date of Birth');
    if (!record.vehicle_brand) missing.push(language === 'tr' ? 'Araç Markası' : 'Vehicle Brand');
    if (!record.vehicle_model?.trim()) missing.push(language === 'tr' ? 'Araç Modeli' : 'Vehicle Model');
    if (!record.model_year) missing.push(language === 'tr' ? 'Model Yılı' : 'Model Year');
    if (!record.license_plate?.trim()) missing.push(language === 'tr' ? 'Plaka' : 'License Plate');
    if (!record.location) missing.push(language === 'tr' ? 'Konum' : 'Location');
    if (!record.vehicle_stub) missing.push(language === 'tr' ? 'Koçan' : 'Car Document');
    return missing;
  };

  const handleSendReminder = (record) => {
    const missing = getMissingFields(record);
    const missingList = missing.join('\n');
    const editLink = `${window.location.origin}?ref=${record.reference_number}`;
    const defaultMessage = language === 'tr'
      ? `Merhaba ${record.name} ${record.surname},\n\nKaydınızda eksik alanlar var. Lütfen aşağıdaki bilgileri tamamlayın:\n\n${missingList}\n\nKaydınızı düzenlemek için bu bağlantıya tıklayın:\n${editLink}`
      : `Hello ${record.name} ${record.surname},\n\nYour registration has missing fields. Please complete the following information:\n\n${missingList}\n\nClick the link below to edit your registration:\n${editLink}`;
    setReminderModal(record);
    setReminderMessage(defaultMessage);
  };

  const handleSendReminderEmail = async () => {
    if (!reminderModal || !reminderMessage.trim()) {
      showToast(t.pleaseEnterMessage, 'warning');
      return;
    }
    try {
      await storage.sendReminderEmail(reminderModal, getMissingFields(reminderModal), reminderMessage, language);
      showToast(t.reminderSentSuccessfully, 'success');
      setReminderModal(null);
      setReminderMessage('');
    } catch (error) {
      console.error('Error sending reminder email:', error);
      showToast('Error sending reminder email. Please try again.', 'error');
    }
  };

  const handleApprove = async (record) => {
    if (record.invitation_status === 'Approved' || record.invitation_status === 'Rejected') {
      return;
    }
    if (processingRef.current.has(record.id)) {
      return;
    }
    processingRef.current.add(record.id);
    try {
      const updatedRecord = { ...record, invitation_status: 'Approved' };
      await storage.updateRegistration(record.id, {
        invitation_status: 'Approved'
      });
      await storage.archiveRegistration(updatedRecord, 'Approved');
      await storage.deleteRegistration(record.id);
      try {
        await storage.sendApprovalEmail(updatedRecord);
      } catch (emailError) {
        console.error('Approval email error:', emailError);
      }
      showToast(t.registrationApprovedAndArchived, 'success');
      setRecords(prev => prev.filter(r => r.id !== record.id));
      await loadArchivedRegistrations();
      await loadRegistrations();
    } catch (error) {
      console.error('Error approving registration:', error);
      showToast('Error approving registration', 'error');
      await loadRegistrations();
    } finally {
      processingRef.current.delete(record.id);
    }
  };

  const handleArchiveRecord = async (record) => {
    if (record.invitation_status === 'Approved' || record.invitation_status === 'Rejected') {
      return;
    }
    if (processingRef.current.has(record.id)) {
      return;
    }
    processingRef.current.add(record.id);
    const selectedReasons = rejectionReasons[record.id] || [];
    const customReason = rejectionReasons[`${record.id}_other`] || '';

    if (selectedReasons.length === 0 && !customReason.trim()) {
      showToast(t.pleaseSelectRejectionReason, 'warning');
      processingRef.current.delete(record.id);
      return;
    }

    const reasonText = selectedReasons.map(value => {
      const option = rejectionReasonOptions.find(opt => opt.value === value);
      return option ? option[language] || option.en : value;
    }).join(', ') + (customReason.trim() ? ` - ${customReason.trim()}` : '');

    try {
      const updatedRecord = { ...record, invitation_status: 'Rejected' };
      await storage.updateRegistration(record.id, {
        invitation_status: 'Rejected'
      });
      await storage.archiveRegistration(updatedRecord, reasonText);
      await storage.deleteRegistration(record.id);
      try {
        await storage.sendRejectionEmail(updatedRecord, reasonText);
      } catch (emailError) {
        console.error('Rejection email error:', emailError);
      }
      showToast(t.registrationRejectedAndArchived, 'success');
      setRecords(prev => prev.filter(r => r.id !== record.id));
      setRejectionReasons(prev => {
        const next = { ...prev };
        delete next[record.id];
        delete next[`${record.id}_other`];
        return next;
      });
      setRejectionForms(prev => {
        const next = { ...prev };
        delete next[record.id];
        return next;
      });
      await loadArchivedRegistrations();
      await loadRegistrations();
    } catch (error) {
      console.error('Error archiving registration:', error);
      showToast('Error archiving registration', 'error');
      await loadRegistrations();
    } finally {
      processingRef.current.delete(record.id);
    }
  };

  const toggleRejectionForm = (recordId) => {
    setRejectionForms(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  const handleRejectionReasonChange = (recordId, value) => {
    setRejectionReasons(prev => ({
      ...prev,
      [recordId]: [value]
    }));
  };

  const handleOtherReasonChange = (recordId, value) => {
    setRejectionReasons(prev => ({
      ...prev,
      [`${recordId}_other`]: value
    }));
  };

  const loadArchivedRegistrations = async () => {
    try {
      const data = await storage.getArchivedRegistrations();
      setArchivedRecords(data);
      if (data.length > 0) {
        await loadReceiptUrls(data);
      }
    } catch (error) {
      console.error('Error loading archived registrations:', error);
    }
  };

  const toggleArchiveView = async () => {
    const newShowArchive = !showArchive;
    setShowArchive(newShowArchive);
    if (newShowArchive) {
      if (archivedRecords.length === 0) {
        await loadArchivedRegistrations();
      }
    } else {
      await loadRegistrations();
    }
  };

  const handleDeleteArchived = async (record) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await storage.deleteArchivedRegistration(record);
      setArchivedRecords(prev => prev.filter(r => r.id !== record.id));
    } catch (error) {
      console.error('Error deleting archived registration:', error);
      showToast(t.errorDeletingArchived, 'error');
    }
  };

  const handleDeleteRegistration = async (record) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      if (record.vehicle_stub) {
        await supabase.storage.from('receipts').remove([record.vehicle_stub]);
      }
      await storage.deleteRegistration(record.id);
      setRecords(prev => prev.filter(r => r.id !== record.id));
    } catch (error) {
      console.error('Error deleting registration:', error);
      showToast(t.errorDeletingArchived, 'error');
      await loadRegistrations();
    }
  };

  const downloadExcel = () => {
    const dataToExport = showArchive ? archivedRecords : records;
    if (dataToExport.length === 0) return;
    const headers = ['Name', 'Surname', 'Email', 'Phone', 'DOB', 'Vehicle Brand', 'Vehicle Model', 'Model Year', 'License Plate', 'Location', 'Reference No', 'Submitted At', 'Invitation Status'];
    const rows = dataToExport.map(r => [
      r.name,
      r.surname,
      r.email,
      r.phone,
      r.dob,
      r.vehicle_brand,
      r.vehicle_model,
      r.model_year,
      r.license_plate,
      r.location,
      r.reference_number || '',
      r.submitted_at,
      r.invitation_status || 'Pending'
    ]);
    const table = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${String(cell ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Registrations</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>${table}</body></html>`;
    const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `serhan-kombos-otomotiv-registrations-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h1 className="loading-title">Serhan Kombos Otomotiv</h1>
          <p className="loading-subtitle">{language === 'en' ? 'Loading your dashboard...' : 'Yönetim paneli yükleniyor...'}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container">
        <div className="page-header">
          <div>
            <h1>{t.adminTitle}</h1>
            <p>{t.adminSubtitle}</p>
          </div>
          <div className="page-actions">
            <button type="button" className="btn-ghost" onClick={onBack} title={t.backToForm}>
              <ArrowLeft size={16} style={{ marginRight: 6 }} />
              {t.backToForm}
            </button>
          </div>
        </div>
        <div className="admin-login">
          <h2>{t.adminLogin}</h2>
          <div className="admin-login-form">
            <input
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="btn-primary" onClick={async () => {
              const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
              });
              if (error) showToast(error.message, 'error');
              else checkAuth();
            }}>
              {t.login}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dataToShow = showArchive ? archivedRecords : records;
  const totalPages = Math.max(1, Math.ceil(dataToShow.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = dataToShow.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  const goToPage = (page) => {
    const next = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container admin-container">
      <div className="page-header">
        <div>
          <h1>{t.adminTitle}</h1>
          <p>{showArchive ? t.archivedRegistrations : t.adminSubtitle}</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn-ghost" onClick={downloadExcel} disabled={dataToShow.length === 0} title={t.downloadExcel}>
            <Download size={18} style={{ marginRight: 6 }} />
            {t.downloadExcel}
          </button>
          <button type="button" className="btn-ghost" onClick={toggleArchiveView} title={showArchive ? t.activeRegistrations : t.viewArchive}>
            <Archive size={18} style={{ marginRight: 6 }} />
            {showArchive ? t.activeRegistrations : t.viewArchive}
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

      <div className="table-wrapper admin-table-wrapper">
        <AdminTable
          dataToShow={paginatedData}
          showArchive={showArchive}
          language={language}
          t={t}
          receiptUrls={receiptUrls}
          getStatusColor={getStatusColor}
          rejectionForms={rejectionForms}
          rejectionReasons={rejectionReasons}
          rejectionReasonOptions={rejectionReasonOptions}
          onApprove={handleApprove}
          onToggleRejectionForm={toggleRejectionForm}
          onReasonChange={handleRejectionReasonChange}
          onOtherChange={handleOtherReasonChange}
          onConfirmRejection={handleArchiveRecord}
          onDeleteArchived={handleDeleteArchived}
          onDeleteRegistration={handleDeleteRegistration}
          isRecordIncomplete={isRecordIncomplete}
          onSendReminder={handleSendReminder}
          isProcessing={(id) => processingRef.current.has(id)}
        />
      </div>

      <AdminMobileCards
        dataToShow={paginatedData}
        showArchive={showArchive}
        language={language}
        t={t}
        getStatusColor={getStatusColor}
        receiptUrls={receiptUrls}
        rejectionForms={rejectionForms}
        rejectionReasons={rejectionReasons}
        rejectionReasonOptions={rejectionReasonOptions}
        onApprove={handleApprove}
        onToggleRejectionForm={toggleRejectionForm}
        onReasonChange={handleRejectionReasonChange}
        onOtherChange={handleOtherReasonChange}
        onConfirmRejection={handleArchiveRecord}
        onDeleteArchived={handleDeleteArchived}
        onDeleteRegistration={handleDeleteRegistration}
        isRecordIncomplete={isRecordIncomplete}
        onSendReminder={handleSendReminder}
        isProcessing={(id) => processingRef.current.has(id)}
      />

      {totalPages > 1 && (
        <div className="pagination">
          <button type="button" className="btn-secondary" onClick={() => goToPage(safeCurrentPage - 1)} disabled={safeCurrentPage === 1}>
            {language === 'en' ? 'Previous' : 'Önceki'}
          </button>
          <span className="pagination-info">
            {language === 'en' ? 'Page' : 'Sayfa'} {safeCurrentPage} / {totalPages}
          </span>
          <button type="button" className="btn-secondary" onClick={() => goToPage(safeCurrentPage + 1)} disabled={safeCurrentPage === totalPages}>
            {language === 'en' ? 'Next' : 'Sonraki'}
          </button>
        </div>
      )}

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
              <button type="button" className="btn-primary" onClick={handleSendReminderEmail}>
                {t.sendMessage}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
