import React from 'react';
import { ArrowLeft } from '../icons';
import translations from '../translations';

const AboutPage = ({ language, onBack }) => {
  const t = translations[language];

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>{t.aboutTitle}</h1>
          <p>{t.aboutDescription}</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} style={{ marginRight: 6 }} />
            {language === 'en' ? 'Back to Form' : 'Forma Dön'}
          </button>
        </div>
      </div>

      <div className="about-card">
        <p>{t.aboutIntro}</p>
      </div>

      <div className="about-section">
        <h2>{t.ourServices}</h2>
        <p>{t.ourServicesDescription}</p>
        <ul className="about-list">
          <li>{t.serviceNewVehicle}</li>
          <li>{t.serviceUsedVehicle}</li>
          <li>{t.serviceServicing}</li>
          <li>{t.serviceRepairs}</li>
          <li>{t.serviceParts}</li>
          <li>{t.serviceInspection}</li>
          <li>{t.serviceTradeIn}</li>
        </ul>
      </div>

      <div className="about-section">
        <h2>{t.ourExperience}</h2>
        <p>{t.ourExperienceDescription}</p>
      </div>

      <div className="about-section">
        <h2>{t.ourCommitment}</h2>
        <p>{t.ourCommitmentDescription}</p>
      </div>

      <div className="about-section">
        <h2>{t.ourVision}</h2>
        <p>{t.ourVisionDescription}</p>
      </div>

      <div className="about-section">
        <h2>{t.ourMission}</h2>
        <p>{t.ourMissionDescription}</p>
      </div>

      <div className="about-section">
        <h2>{t.whyChooseUs}</h2>
        <ul className="about-list">
          <li>
            <strong>{t.whyExperience}:</strong> {t.whyExperienceDesc}
          </li>
          <li>
            <strong>{t.whyQuality}:</strong> {t.whyQualityDesc}
          </li>
          <li>
            <strong>{t.whyProfessional}:</strong> {t.whyProfessionalDesc}
          </li>
          <li>
            <strong>{t.whyBrands}:</strong> {t.whyBrandsDesc}
          </li>
          <li>
            <strong>{t.whyComplete}:</strong> {t.whyCompleteDesc}
          </li>
          <li>
            <strong>{t.whySatisfaction}:</strong> {t.whySatisfactionDesc}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;
