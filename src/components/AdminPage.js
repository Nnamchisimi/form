import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Users, ArrowLeft, Archive, LogOut, Login } from '../icons';
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
  const [reminderLogs, setReminderLogs] = useState([]);
  const [adminView, setAdminView] = useState('dashboard');
  const [approvalModal, setApprovalModal] = useState(null);
  const itemsPerPage = 10;
  const t = translations[language];

  const recordsCacheRef = useRef({ active: null, archived: null });
  const receiptUrlCacheRef = useRef({});

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
    { value: 'invalid_details', en: 'Invalid/incorrect details', tr: 'Geçersiz/yanlış detaylar' },
    { value: 'other', en: 'Other', tr: 'Diğer' }
  ];

  const loadReceiptUrls = useCallback(async (records) => {
    const cache = receiptUrlCacheRef.current;
    const now = Date.now();
    const ttl = 50 * 60 * 1000;
    const entries = records
      .filter(record => record.vehicle_stub)
      .map(async (record) => {
        const cached = cache[record.vehicle_stub];
        if (cached && now - cached.createdAt < ttl) {
          return [record.id, cached.url];
        }
        try {
          const url = await storage.getReceiptUrl(record.vehicle_stub);
          if (url) {
            cache[record.vehicle_stub] = { url, createdAt: now };
            return [record.id, url];
          }
          console.warn('Missing receipt file for record', record.id, 'path:', record.vehicle_stub);
        } catch (error) {
          console.error('Error loading receipt URL for record', record.id, ':', error);
        }
        return null;
      });

    const results = await Promise.all(entries);
    const newUrls = results.reduce((acc, item) => {
      if (item) acc[item[0]] = item[1];
      return acc;
    }, {});
    setReceiptUrls(prev => ({ ...prev, ...newUrls }));
  }, []);

  const loadRegistrations = useCallback(async () => {
    try {
      if (recordsCacheRef.current.active) {
        setRecords(recordsCacheRef.current.active);
        await loadReceiptUrls(recordsCacheRef.current.active);
        return;
      }
      const data = await storage.getRegistrations();
      recordsCacheRef.current.active = data;
      setRecords(data);
      await loadReceiptUrls(data);
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  }, [loadReceiptUrls]);

  const loadArchivedRegistrations = useCallback(async () => {
    try {
      if (recordsCacheRef.current.archived) {
        setArchivedRecords(recordsCacheRef.current.archived);
        await loadReceiptUrls(recordsCacheRef.current.archived);
        return;
      }
      const data = await storage.getArchivedRegistrations();
      recordsCacheRef.current.archived = data;
      setArchivedRecords(data);
      await loadReceiptUrls(data);
    } catch (error) {
      console.error('Error loading archived registrations:', error);
    }
  }, [loadReceiptUrls]);

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (!session) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (session) {
      setLoading(true);
      setReceiptUrls({});
      loadRegistrations();
    }
  }, [session, loadRegistrations]);

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

  const handleOpenApprovalModal = (record) => {
    setApprovalModal(record);
  };

  const handleCloseApprovalModal = () => {
    setApprovalModal(null);
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
      recordsCacheRef.current.active = recordsCacheRef.current.active.filter(r => r.id !== record.id);
      setRecords(prev => prev.filter(r => r.id !== record.id));
      recordsCacheRef.current.archived = null;
      await loadArchivedRegistrations();
      await loadRegistrations();
      handleCloseApprovalModal();
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
      try {
        await storage.sendRejectionEmail(updatedRecord, reasonText);
      } catch (emailError) {
        console.error('Rejection email error:', emailError);
      }
      await storage.deleteRegistration(record.id);
      showToast(t.registrationRejectedAndArchived, 'success');
      recordsCacheRef.current.active = recordsCacheRef.current.active.filter(r => r.id !== record.id);
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
      recordsCacheRef.current.archived = null;
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

  const toggleArchiveView = async () => {
    const newShowArchive = !showArchive;
    setShowArchive(newShowArchive);
    if (newShowArchive) {
      await loadArchivedRegistrations();
    } else {
      await loadRegistrations();
    }
  };

  const loadReminderLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          id,
          type,
          message,
          sent_at,
          registration_id,
          registrations (
            name,
            surname,
            email,
            reference_number
          )
        `)
        .order('sent_at', { ascending: false });

      if (error) {
        console.error('Error loading reminder logs:', error);
        return;
      }

      const formatted = (data || []).map(row => ({
        id: row.id,
        type: row.type,
        message: row.message,
        sent_at: row.sent_at,
        registration_id: row.registration_id,
        name: row.registrations?.name || '-',
        surname: row.registrations?.surname || '-',
        email: row.registrations?.email || '-',
        reference_number: row.registrations?.reference_number || '-'
      }));

      setReminderLogs(formatted);
    } catch (error) {
      console.error('Error loading reminder logs:', error);
    }
  }, []);

  const toggleReminderLog = async () => {
    const newAdminView = adminView === 'dashboard' ? 'reminder-history' : 'dashboard';
    setAdminView(newAdminView);
    if (newAdminView === 'reminder-history' && reminderLogs.length === 0) {
      await loadReminderLogs();
    }
  };

  const handleDeleteArchived = async (record) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      if (record.vehicle_stub && receiptUrlCacheRef.current[record.vehicle_stub]) {
        delete receiptUrlCacheRef.current[record.vehicle_stub];
      }
      await storage.deleteArchivedRegistration(record);
      recordsCacheRef.current.archived = recordsCacheRef.current.archived.filter(r => r.id !== record.id);
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
        if (receiptUrlCacheRef.current[record.vehicle_stub]) {
          delete receiptUrlCacheRef.current[record.vehicle_stub];
        }
        await supabase.storage.from('receipts').remove([record.vehicle_stub]);
      }
      await storage.deleteRegistration(record.id);
      recordsCacheRef.current.active = recordsCacheRef.current.active.filter(r => r.id !== record.id);
      setRecords(prev => prev.filter(r => r.id !== record.id));
    } catch (error) {
      console.error('Error deleting registration:', error);
      showToast(t.errorDeletingArchived, 'error');
      recordsCacheRef.current.active = null;
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
          </div>
          <div className="page-actions">
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
              <Login size={20} />
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
      {adminView === 'dashboard' && (
        <>
          <div className="page-header">
            <div>
              <h1>{t.adminTitle}</h1>
              {session?.user?.email && <p className="admin-email">{session.user.email}</p>}
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
              <button type="button" className="btn-ghost" onClick={toggleReminderLog} title={t.reminderHistory}>
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

          {paginatedData.length === 0 ? (
            <div className="empty-state">{t.noRecords}</div>
          ) : (
            <>
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
                  onApprove={handleOpenApprovalModal}
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
                  onApprove={handleOpenApprovalModal}
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
            </>
          )}

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
              <button type="button" className="btn-secondary" onClick={() => setAdminView('dashboard')}>
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

      {approvalModal && (
        <div className="modal-overlay">
          <div className="modal approval-modal">
            <div className="approval-modal-header">
              <h3>{language === 'en' ? 'Review Registration' : 'Kaydı İncele'}</h3>
              <button type="button" className="btn-ghost" onClick={handleCloseApprovalModal} title={language === 'en' ? 'Close' : 'Kapat'}>
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
                    <span className="approval-detail-label">{t.vehicleBrand}</span>
                    <span className="approval-detail-value">{approvalModal.vehicle_brand}</span>
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
              </div>
            </div>
            <div className="approval-modal-footer">
              <button type="button" className="btn-secondary" onClick={handleCloseApprovalModal}>
                {language === 'en' ? 'Cancel' : 'İptal'}
              </button>
              <button type="button" className="btn-reject" onClick={() => { handleCloseApprovalModal(); toggleRejectionForm(approvalModal.id); }}>
                {t.rejectRegistration}
              </button>
              <button type="button" className="btn-approve" onClick={() => handleApprove(approvalModal)}>
                {t.approveRegistration}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
