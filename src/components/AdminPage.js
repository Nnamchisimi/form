import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Users, Archive, LogOut, Login, Edit } from '../icons';
import storage from '../storage';
import { supabase } from '../supabaseClient';
import translations from '../translations';
import AdminDashboard from './AdminDashboard';
import AdminModals from './AdminModals';
import AdminLoading from './AdminLoading';
import AdminLogin from './AdminLogin';
import Ticket from './Ticket';
import ticketImage from '../ticketimg.jpg';
import html2canvas from 'html2canvas';

const AdminPage = ({ language, onBack, onToast }) => {
  const showToast = (message, severity = 'info') => {
    if (onToast) onToast(message, severity);
  };
  const [records, setRecords] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const processingRef = useRef(new Set());
  const [receiptUrls, setReceiptUrls] = useState({});
  const [archivedRecords, setArchivedRecords] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showArchive, setShowArchive] = useState(false);
  const [reminderModal, setReminderModal] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderLogs, setReminderLogs] = useState([]);
  const [adminView, setAdminView] = useState('dashboard');
  const [approvalModal, setApprovalModal] = useState(null);
  const [rejectionModal, setRejectionModal] = useState(null);
  const [documentViewer, setDocumentViewer] = useState(null);
  const [approvalChassis, setApprovalChassis] = useState('');
  const [approvalMessage, setApprovalMessage] = useState('');
  const [confirmApproval, setConfirmApproval] = useState(false);
  const [imageTransformOrigin, setImageTransformOrigin] = useState('center center');
  const ticketCaptureRef = useRef(null);
  const [ticketImageUrl, setTicketImageUrl] = useState(null);
  const itemsPerPage = 10;
  const t = translations[language];
  const rejectionReasonOptions = [
    { value: 'invalid_details', en: 'Invalid/incorrect details', tr: 'Geçersiz/yanlış detaylar' },
    { value: 'other', en: 'Other', tr: 'Diğer' }
  ];

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

  const loadReceiptUrls = useCallback(async (records) => {
    const entries = records
      .filter(record => record.vehicle_stub)
      .map(async (record) => {
        try {
          const url = await storage.getReceiptUrl(record.vehicle_stub);
          if (url) {
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
      const data = await storage.getRegistrations();
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
      const data = await storage.getArchivedRegistrations();
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
    setApprovalChassis(record.chassis_number || '');
    setApprovalMessage('');
    setConfirmApproval(false);
  };

  const handleCloseApprovalModal = () => {
    setApprovalModal(null);
    setApprovalChassis('');
    setApprovalMessage('');
    setConfirmApproval(false);
  };

  const handleOpenRejectionModal = (record) => {
    setRejectionModal(record);
  };

  const handleCloseRejectionModal = () => {
    setRejectionModal(null);
  };

  const handleOpenDocument = (record) => {
    setDocumentViewer(record);
  };

  const handleCloseDocument = () => {
    setDocumentViewer(null);
  };

  const handleApprove = async (record) => {
    if (record.invitation_status === 'Approved' || record.invitation_status === 'Rejected') {
      return;
    }
    if (processingRef.current.has(record.id)) {
      return;
    }
    if (!approvalChassis.trim()) {
      showToast(language === 'tr' ? 'Lütfen şasi numarası girin.' : 'Please enter the chassis number.', 'warning');
      return;
    }
    processingRef.current.add(record.id);
    try {
      let generatedTicketUrl = null;
      if (ticketCaptureRef.current) {
        const ticketElement = ticketCaptureRef.current.querySelector('.ticket');
        if (ticketElement) {
          try {
            const canvas = await html2canvas(ticketElement, {
              useCORS: true,
              backgroundColor: null,
              scale: 2,
              logging: false,
            });
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const fileName = `${record.reference_number || 'ticket'}-${Date.now()}.png`;
            const path = await storage.uploadTicketImage(blob, fileName);
            generatedTicketUrl = await storage.getTicketImageUrl(path);
          } catch (imageError) {
            console.error('Error generating ticket image:', imageError);
          }
        }
      }

      const updatedRecord = { ...record, invitation_status: 'Approved', chassis_number: approvalChassis.trim() };
      await storage.updateRegistration(record.id, {
        invitation_status: 'Approved',
        chassis_number: approvalChassis.trim() || null
      });
      await storage.archiveRegistration(updatedRecord, 'Approved');
      await storage.deleteRegistration(record.id);
      try {
        await storage.sendApprovalEmail(updatedRecord, approvalMessage.trim() || undefined, language, generatedTicketUrl);
      } catch (emailError) {
        console.error('Approval email error:', emailError);
      }
      showToast(t.registrationApprovedAndArchived, 'success');
      setRecords(prev => prev.filter(r => r.id !== record.id));
      setTicketImageUrl(null);
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
        await storage.sendRejectionEmail(updatedRecord, reasonText, language);
      } catch (emailError) {
        console.error('Rejection email error:', emailError);
      }
      await storage.deleteRegistration(record.id);
      showToast(t.registrationRejectedAndArchived, 'success');
      setRecords(prev => prev.filter(r => r.id !== record.id));
      setRejectionReasons(prev => {
        const next = { ...prev };
        delete next[record.id];
        delete next[`${record.id}_other`];
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
    setCurrentPage(1);
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

  const openReminderHistory = async () => {
    setAdminView('reminder-history');
    await loadReminderLogs();
  };

  const closeReminderHistory = () => {
    setAdminView('dashboard');
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
    const headers = ['Name', 'Surname', 'Email', 'Phone', 'DOB', 'Vehicle Model', 'Model Year', 'License Plate', 'Chassis Number', 'Location', 'Reference No', 'Submitted At', 'Invitation Status'];
    const rows = dataToExport.map(r => [
      r.name,
      r.surname,
      r.email,
      r.phone,
      r.dob,
      r.vehicle_model,
      r.model_year,
      r.license_plate,
      r.chassis_number || '',
      r.location,
      r.reference_number || '',
      r.submitted_at,
      r.invitation_status || 'Pending'
    ]);
    const table = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${String(cell ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:Worksheets><x:ExcelWorksheet><x:Name>Registrations</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:Worksheets></x:ExcelWorkbook></xml><![endif]--></head><body>${table}</body></html>`;
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

  const handleImageMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setImageTransformOrigin(`${x}% ${y}%`);
  };

  const handleImageMouseLeave = () => {
    setImageTransformOrigin('center center');
  };

  if (loading) {
    return <AdminLoading language={language} />;
  }

  if (!session) {
    return (
      <AdminLogin
        language={language}
        onToast={showToast}
        checkAuth={checkAuth}
      />
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
      <AdminDashboard
        dataToShow={paginatedData}
        showArchive={showArchive}
        language={language}
        t={t}
        receiptUrls={receiptUrls}
        getStatusColor={getStatusColor}
        rejectionReasons={rejectionReasons}
        rejectionReasonOptions={rejectionReasonOptions}
        onApprove={handleOpenApprovalModal}
        onOpenRejectionModal={handleOpenRejectionModal}
        onViewDocument={handleOpenDocument}
        onReasonChange={handleRejectionReasonChange}
        onOtherChange={handleOtherReasonChange}
        onConfirmRejection={handleArchiveRecord}
        onDeleteArchived={handleDeleteArchived}
        onDeleteRegistration={handleDeleteRegistration}
        isRecordIncomplete={isRecordIncomplete}
        onSendReminder={handleSendReminder}
        isProcessing={(id) => processingRef.current.has(id)}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        goToPage={goToPage}
        adminView={adminView}
        openReminderHistory={openReminderHistory}
        closeReminderHistory={closeReminderHistory}
        loadReminderLogs={loadReminderLogs}
        reminderLogs={reminderLogs}
        downloadExcel={downloadExcel}
        toggleArchiveView={toggleArchiveView}
        handleLogout={handleLogout}
        sessionUserEmail={session?.user?.email}
      />

      <AdminModals
        approvalModal={approvalModal}
        rejectionModal={rejectionModal}
        documentViewer={documentViewer}
        reminderModal={reminderModal}
        setReminderModal={setReminderModal}
        approvalChassis={approvalChassis}
        setApprovalChassis={setApprovalChassis}
        approvalMessage={approvalMessage}
        setApprovalMessage={setApprovalMessage}
        confirmApproval={confirmApproval}
        setConfirmApproval={setConfirmApproval}
        reminderMessage={reminderMessage}
        setReminderMessage={setReminderMessage}
        receiptUrls={receiptUrls}
        language={language}
        t={t}
        getStatusColor={getStatusColor}
        rejectionReasons={rejectionReasons}
        rejectionReasonOptions={rejectionReasonOptions}
        onCloseApprovalModal={handleCloseApprovalModal}
        onCloseRejectionModal={handleCloseRejectionModal}
        onCloseDocument={handleCloseDocument}
        onApprove={handleApprove}
        onArchiveRecord={handleArchiveRecord}
        onReasonChange={handleRejectionReasonChange}
        onOtherChange={handleOtherReasonChange}
        onSendReminderEmail={handleSendReminderEmail}
        imageTransformOrigin={imageTransformOrigin}
        handleImageMouseMove={handleImageMouseMove}
        handleImageMouseLeave={handleImageMouseLeave}
      />

      <div ref={ticketCaptureRef} style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
        {approvalModal && (
          <Ticket
            title={language === 'tr' ? 'Kombos Tombala Gecesi Mercedes Sahiplerine Özel' : 'Kombos Bingo Night Exclusive for Mercedes Owners'}
            subtitle={language === 'tr' ? 'Tebrikler, Kombos Bingoya katılımınız onaylandı. Bu etkinlik Mercedes-Benz sahiplerine özeldir ve 500.000 TL nakit ödülüyle.' : 'Congratulations, you have been approved to participate in the Kombos Bingo which is exclusive for Mercedes-Benz owners, with a cash prize of 500,000 TL.'}
            referenceNumber={approvalModal.reference_number}
            date={approvalModal.date || ''}
            location={''}
            image={ticketImage}
            language={language}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPage;
