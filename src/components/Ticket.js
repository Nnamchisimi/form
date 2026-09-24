import React from 'react';
import './Ticket.css';
import mercedesLogo from '../merclogo.webp';

const Ticket = ({ title, subtitle, referenceNumber, date, location, image, language = 'tr' }) => {
  const isTurkish = language === 'tr';
  const dateLabel = isTurkish ? 'Tarih' : 'Date';
  const locationLabel = isTurkish ? 'Konum' : 'Location';
  const refLabel = isTurkish ? 'REF' : 'REF';
  const ticketSrc = image || 'https://urtmleicijluwonalidr.supabase.co/storage/v1/object/public/logos/ticketimg.jpg';

  const gradientStyle = {
    background: 'linear-gradient(135deg, #c4b9ab 0%, #e1ddcc 50%, #fdfaf2 100%)'
  };

  return (
    <div className="ticket-wrapper">
      <div className="ticket">
        <div className="ticket-left" style={gradientStyle}>
          <div className="ticket-brand">
            <img src={mercedesLogo} alt="Mercedes" className="ticket-brand-logo" />
            <div className="ticket-brand-text-wrapper">
              <span className="ticket-brand-text">Serhan Kombos</span>
              <span className="ticket-brand-sub">OTOMOTIV</span>
            </div>
          </div>
          <div className="ticket-divider" />
          <div className="ticket-info">
            <h2 className="ticket-title">{title}</h2>
            {subtitle && <p className="ticket-subtitle">{subtitle}</p>}
            <div className="ticket-details-box">
              <div className="ticket-detail-item">
                <span className="ticket-detail-label">{dateLabel}</span>
                <span className="ticket-detail-value">{date || ''}</span>
              </div>
              <div className="ticket-detail-divider" />
              <div className="ticket-detail-item">
                <span className="ticket-detail-label">{locationLabel}</span>
                <span className="ticket-detail-value">{location || ''}</span>
              </div>
              <div className="ticket-detail-divider" />
              <div className="ticket-detail-item">
                <span className="ticket-detail-label">{refLabel}</span>
                <span className="ticket-detail-value">{referenceNumber || 'KOMBOS-2026'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="ticket-right">
          <img src={ticketSrc} alt="Ticket" className="ticket-image" />
        </div>
        <div className="ticket-notch ticket-notch-left" />
        <div className="ticket-notch ticket-notch-right" />
      </div>
    </div>
  );
};

export default Ticket;
