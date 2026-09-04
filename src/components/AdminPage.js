import React, { useState, useEffect, useCallback } from 'react';
import { Download, Trash, Users, ArrowLeft } from '../icons';
import storage from '../storage';
import { supabase } from '../supabaseClient';
import translations from '../translations';
import AdminTable from './AdminTable';
import AdminMobileCards from './AdminMobileCards';

const AdminPage = ({ language, onBack }) => {
  const [records, setRecords] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiptUrls, setReceiptUrls] = useState({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [archivedRecords, setArchivedRecords] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [rejectionForms, setRejectionForms] = useState({});
  const t = translations[language];

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
    const urls = {};
    for (const record of records) {
      if (record.vehicle_stub) {
        try {
          const url = await storage.getReceiptUrl(record.vehicle_stub);
          urls[record.id] = url;
        } catch (error) {
          console.error('Error loading receipt URL for record', record.id, ':', error);
        }
      }
    }
    setReceiptUrls(urls);
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

  const handleApprove = async (record) => {
    if (record.invitation_status === 'Approved' || record.invitation_status === 'Rejected') {
      return;
    }
    try {
      const updatedRecord = { ...record, invitation_status: 'Approved' };
      await storage.updateRegistration(record.id, {
        invitation_status: 'Approved'
      });
      await storage.archiveRegistration(updatedRecord, 'Approved');
      await storage.deleteRegistration(record.id);
      alert(t.registrationApprovedAndArchived);
      setRecords(prev => prev.filter(r => r.id !== record.id));
      await loadArchivedRegistrations();
      await loadRegistrations();
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Error approving registration');
      await loadRegistrations();
    }
  };

  const handleArchiveRecord = async (record) => {
    if (record.invitation_status === 'Approved' || record.invitation_status === 'Rejected') {
      return;
    }
    const selectedReasons = rejectionReasons[record.id] || [];
    const customReason = rejectionReasons[`${record.id}_other`] || '';

    if (selectedReasons.length === 0 && !customReason.trim()) {
      alert(t.pleaseSelectRejectionReason);
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
      alert(t.registrationRejectedAndArchived);
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
      alert('Error archiving registration');
      await loadRegistrations();
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
    } catch (error) {
      console.error('Error loading archived registrations:', error);
    }
  };

  const toggleArchiveView = async () => {
    const newShowArchive = !showArchive;
    setShowArchive(newShowArchive);
    if (newShowArchive && archivedRecords.length === 0) {
      await loadArchivedRegistrations();
    }
  };

  const handleDeleteArchived = async (record) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await storage.deleteArchivedRegistration(record);
      setArchivedRecords(prev => prev.filter(r => r.id !== record.id));
    } catch (error) {
      console.error('Error deleting archived registration:', error);
      alert(t.errorDeletingArchived);
    }
  };

  const downloadExcel = () => {
    const dataToExport = showArchive ? archivedRecords : records;
    if (dataToExport.length === 0) return;
    const headers = ['Name', 'Surname', 'Email', 'Phone', 'DOB', 'Vehicle Model', 'Model Year', 'License Plate', 'Location', 'Reference No', 'Submitted At', 'Invitation Status'];
    const rows = dataToExport.map(r => [
      r.name,
      r.surname,
      r.email,
      r.phone,
      r.dob,
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

  const clearAll = async () => {
    if (window.confirm(t.confirmClear)) {
      try {
        const dataToClear = showArchive ? archivedRecords : records;
        for (const record of dataToClear) {
          if (record.vehicle_stub) {
            await supabase.storage.from('receipts').remove([record.vehicle_stub]);
          }
          if (!showArchive) {
            await storage.deleteRegistration(record.id);
          }
        }
        if (!showArchive) {
          setRecords([]);
        } else {
          setArchivedRecords([]);
        }
      } catch (error) {
        console.error('Error clearing records:', error);
      }
    }
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
            <button type="button" className="btn-secondary" onClick={onBack}>
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
              if (error) alert(error.message);
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

  return (
    <div className="container admin-container">
      <div className="page-header">
        <div>
          <h1>{t.adminTitle}</h1>
          <p>{showArchive ? t.archivedRegistrations : t.adminSubtitle}</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} style={{ marginRight: 6 }} />
            {t.backToForm}
          </button>
          <button type="button" className="btn-secondary" onClick={downloadExcel} disabled={dataToShow.length === 0}>
            <Download size={16} style={{ marginRight: 6 }} />
            {t.downloadExcel}
          </button>
          {!showArchive && (
            <button type="button" className="btn-danger" onClick={clearAll} disabled={records.length === 0}>
              <Trash size={16} style={{ marginRight: 6 }} />
              {t.clearAll}
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={toggleArchiveView}>
            {showArchive ? t.activeRegistrations : t.viewArchive}
          </button>
          <button type="button" className="btn-secondary" onClick={handleLogout}>
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
          dataToShow={dataToShow}
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
        />
      </div>

      <AdminMobileCards
        dataToShow={dataToShow}
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
      />
    </div>
  );
};

export default AdminPage;
