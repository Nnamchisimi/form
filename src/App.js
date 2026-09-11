import React, { useState, useEffect } from 'react';
import headerImage from './raffle-banner.jpg';
import Navbar from './components/Navbar';
import FormHeader from './components/FormHeader';
import RegistrationForm from './components/RegistrationForm';
import AdminPage from './components/AdminPage';
import AboutPage from './components/AboutPage';
import FaqPage from './components/FaqPage';
import BingoPage from './components/BingoPage';
import translations from './translations';
import storage from './storage';
import { supabase } from './supabaseClient';
import Toast from './components/Toast';

const App = () => {
  const [language, setLanguage] = useState('en');
  const [currentPage, setCurrentPage] = useState('form');
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    dob: '',
    vehicleBrand: 'Mercedes-Benz',
    vehicleModel: '',
    modelYear: '',
    licensePlate: '',
    vehicleStub: null,
    location: ''
  });

  const [fileName, setFileName] = useState('No file chosen');
  const [editingReference, setEditingReference] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const showToast = (message, severity = 'info') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  const t = translations[language];

  useEffect(() => {
    const draft = storage.getDraft();
    if (draft) {
      setFormData(prev => ({ ...prev, ...draft }));
      if (draft.vehicleStub) {
        setFileName(draft.vehicleStub);
      }
    }
  }, []);

  useEffect(() => {
    document.title = t.bingoTitle;
  }, [t.bingoTitle]);

  useEffect(() => {
    const checkAdminSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentPage('admin');
      }
    };
    checkAdminSession();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (!ref) return;

    const loadByReference = async () => {
      try {
        const record = await storage.getRegistrationByReference(ref);
        if (!record) {
          showToast(language === 'tr' ? 'Referans numarası bulunamadı.' : 'Reference number not found.', 'error');
          return;
        }
        setEditingReference(ref);
        setFormData({
          name: record.name || '',
          surname: record.surname || '',
          email: record.email || '',
          phone: record.phone || '',
          dob: record.dob || '',
          vehicleBrand: record.vehicle_brand || 'Mercedes-Benz',
          vehicleModel: record.vehicle_model || '',
          modelYear: record.model_year || '',
          licensePlate: record.license_plate || '',
          vehicleStub: null,
          location: record.location || ''
        });
        setFileName('No file chosen');
        setCurrentPage('form');
      } catch (error) {
        console.error('Error loading registration by reference:', error);
        showToast(language === 'tr' ? 'Referans numarası yüklenirken hata oluştu.' : 'Error loading reference number.', 'error');
      }
    };

    loadByReference();
  }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const missing = [];
        if (!formData.name?.trim()) missing.push('name');
        if (!formData.surname?.trim()) missing.push('surname');
        if (!formData.email?.trim()) missing.push('email');
        if (!formData.phone?.trim()) missing.push('phone');
        if (!formData.dob) missing.push('dob');
        if (!formData.vehicleBrand) missing.push('vehicleBrand');
        if (!formData.vehicleModel?.trim()) missing.push('vehicleModel');
        if (!formData.modelYear) missing.push('modelYear');
        if (!formData.licensePlate?.trim()) missing.push('licensePlate');
        if (!formData.location) missing.push('location');
        if (!formData.vehicleStub) missing.push('vehicleStub');

        if (missing.length > 0) {
          showToast(t.allFieldsRequiredMessage, 'warning');
          return;
        }

        const normalizedEmail = (formData.email || '').trim().toLowerCase();
        const existingRegistration = await storage.findActiveRegistrationByEmail(normalizedEmail);
        if (existingRegistration && existingRegistration.reference_number !== editingReference) {
          showToast(t.duplicateEmailMessage, 'error');
          return;
        }
        const archivedRegistration = await storage.findArchivedRegistrationByEmail(normalizedEmail);
        if (archivedRegistration && archivedRegistration.reference_number !== editingReference) {
          showToast(t.duplicateEmailMessage, 'error');
          return;
        }

        const receiptPath = formData.vehicleStub ? await storage.uploadReceipt(formData.vehicleStub) : null;

        if (editingReference) {
          const updatePayload = {
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
            phone: formData.phone,
            dob: formData.dob,
            vehicle_brand: formData.vehicleBrand,
            vehicle_model: formData.vehicleModel,
            model_year: formData.modelYear,
            license_plate: formData.licensePlate,
            location: formData.location,
            receipt_status: receiptPath ? 'Submitted' : 'Pending'
          };
          if (receiptPath) {
            updatePayload.vehicle_stub = receiptPath;
          }
          const updated = await storage.updateRegistrationByReference(editingReference, updatePayload);
          console.log('Registration updated:', updated);
          showToast(language === 'tr' ? 'Kaydınız güncellendi.' : 'Your registration has been updated.', 'success');
          setEditingReference(null);
          setFormData({
            name: '',
            surname: '',
            email: '',
            phone: '',
            dob: '',
            vehicleBrand: 'Mercedes-Benz',
            vehicleModel: '',
            modelYear: '',
            licensePlate: '',
            vehicleStub: null,
            location: ''
          });
          setFileName('No file chosen');
          storage.clearDraft();
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }

        const submission = {
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          vehicle_brand: formData.vehicleBrand,
          vehicle_model: formData.vehicleModel,
          model_year: formData.modelYear,
          license_plate: formData.licensePlate,
          vehicle_stub: receiptPath,
          location: formData.location,
          submitted_at: new Date().toISOString(),
          receipt_status: receiptPath ? 'Submitted' : 'Pending',
          verification_status: 'Pending',
          invitation_status: 'Pending',
          reference_number: `KOMBOS-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        };
        
        const savedSubmission = await storage.saveRegistration(submission);
        console.log('Registration saved successfully:', savedSubmission);
        try {
          await storage.sendConfirmationEmail(savedSubmission);
          console.log('Confirmation email sent');
        } catch (emailError) {
          console.error('Confirmation email failed (registration still saved):', emailError);
        }
        if (!receiptPath && savedSubmission?.id) {
          try {
            await storage.addReminder(savedSubmission.id, 'receipt_pending');
          } catch (reminderError) {
            console.error('Failed to create reminder:', reminderError);
          }
        }
        console.log('Form submitted:', submission);
        showToast(t.successMessage, 'success');
      setFormData({
        name: '',
        surname: '',
        email: '',
        phone: '',
        dob: '',
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: '',
        modelYear: '',
        licensePlate: '',
        vehicleStub: null,
        location: ''
      });
      setFileName('No file chosen');
      storage.clearDraft();
    } catch (error) {
      console.error('Error submitting form:', error);
      const message = error?.message || 'Unknown error';
      showToast(`Error submitting form: ${message}. Please try again.`, 'error');
    }
  };

  const saveDraft = async () => {
    try {
      const normalizedEmail = (formData.email || '').trim().toLowerCase();
      if (!normalizedEmail) {
        showToast(t.draftEmailRequired, 'warning');
        return;
      }
      const existingRegistration = await storage.findActiveRegistrationByEmail(normalizedEmail);
      if (existingRegistration && existingRegistration.reference_number !== editingReference) {
        showToast(t.duplicateEmailMessage, 'error');
        return;
      }
      const archivedRegistration = await storage.findArchivedRegistrationByEmail(normalizedEmail);
      if (archivedRegistration && archivedRegistration.reference_number !== editingReference) {
        showToast(t.duplicateEmailMessage, 'error');
        return;
      }

      const payload = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        vehicle_brand: formData.vehicleBrand,
        vehicle_model: formData.vehicleModel,
        model_year: formData.modelYear,
        license_plate: formData.licensePlate,
        location: formData.location,
        vehicle_stub: formData.vehicleStub
      };
      const saved = await storage.saveDraftRegistration(payload);
      storage.saveDraft(formData);
      showToast(language === 'tr' ? 'Devam edebilirsiniz. Düzenleme bağlantısı e-posta adresinize gönderildi.' : 'You can continue later. An edit link has been sent to your email.', 'success');
      if (saved?.reference_number) {
        setEditingReference(saved.reference_number);
      }
      setFormData({
        name: '',
        surname: '',
        email: '',
        phone: '',
        dob: '',
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: '',
        modelYear: '',
        licensePlate: '',
        vehicleStub: null,
        location: ''
      });
      setFileName('No file chosen');
      storage.clearDraft();
    } catch (error) {
      console.error('Error saving draft registration:', error);
      storage.saveDraft(formData);
      showToast(t.draftMessage, 'error');
    }
  };

  return (
    <div className="app">
      <Navbar
        language={language}
        setLanguage={setLanguage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="main-content">
        {currentPage === 'form' && (
          <div className="container">
            <div className="header-image-wrapper">
              <img src={headerImage} alt="Serhan Kombos Otomotiv" className="header-image" />
            </div>

            <div className="form-container">
              <FormHeader title={t.bingoTitle} description={t.bingoDescription} />
              <RegistrationForm
                language={language}
                formData={formData}
                setFormData={setFormData}
                fileName={fileName}
                setFileName={setFileName}
                onSubmit={handleSubmit}
                onSaveDraft={saveDraft}
              />
            </div>
          </div>
        )}

        {currentPage === 'admin' && (
          <AdminPage
            language={language}
            onBack={() => setCurrentPage('form')}
            onToast={showToast}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            language={language}
            onBack={() => setCurrentPage('form')}
          />
        )}

        {currentPage === 'faq' && (
          <FaqPage
            language={language}
            onBack={() => setCurrentPage('form')}
          />
        )}

        {currentPage === 'bingo' && (
          <BingoPage
            language={language}
            onBack={() => setCurrentPage('form')}
          />
        )}
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Serhan Kombos Otomotiv. All rights reserved.</p>
      </footer>

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={handleCloseToast} />
    </div>
  );
};

export default App;
