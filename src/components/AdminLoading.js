import React from 'react';

const AdminLoading = ({ language }) => {
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
};

export default AdminLoading;
