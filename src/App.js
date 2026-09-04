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

const App = () => {
  const [language, setLanguage] = useState('en');
  const [currentPage, setCurrentPage] = useState('form');
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    dob: '',
    vehicleModel: '',
    modelYear: '',
    licensePlate: '',
    vehicleStub: null,
    location: ''
  });

  const [fileName, setFileName] = useState('No file chosen');

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
    const checkAdminSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentPage('admin');
      }
    };
    checkAdminSession();
  }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const receiptPath = formData.vehicleStub ? await storage.uploadReceipt(formData.vehicleStub) : null;
        
        const submission = {
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
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
       
       await storage.saveRegistration(submission);
       console.log('Registration saved successfully:', submission);
       try {
         await storage.sendConfirmationEmail(submission);
         console.log('Confirmation email sent');
       } catch (emailError) {
         console.error('Confirmation email failed (registration still saved):', emailError);
       }
       console.log('Form submitted:', submission);
       alert(t.successMessage);
      setFormData({
        name: '',
        surname: '',
        email: '',
        phone: '',
        dob: '',
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
      alert('Error submitting form. Please try again.');
    }
  };

  const saveDraft = () => {
    storage.saveDraft(formData);
    alert(t.draftMessage);
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
    </div>
  );
};

export default App;
