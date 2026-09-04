import React from 'react';
import { ArrowLeft, Upload, Check, Mail, Clock, Users, Star } from '../icons';
import translations from '../translations';

const BingoPage = ({ language, onBack }) => {
  const t = translations[language];

  const steps = [
    {
      icon: <Users size={24} />,
      title: language === 'en' ? 'Register' : 'Kayıt Ol',
      text: language === 'en'
        ? 'Complete your registration by providing your required details through the registration form.'
        : 'Kayıt formunu kullanarak gerekli bilgilerinizi girerek kaydınızı tamamlayın.'
    },
    {
      icon: <Upload size={24} />,
      title: language === 'en' ? 'Submit Your Receipt' : 'Makbuzunuzu Gönderin',
      text: language === 'en'
        ? 'Upload your receipt during registration, or submit it separately by the required deadline if you choose not to upload it at the time of registration.'
        : 'Kayıt sırasında makbuzunuzu yükleyin veya kayıt sırasında yüklemediyseniz belirtilen son tarihe kadar ayrı olarak gönderin.'
    },
    {
      icon: <Check size={24} />,
      title: language === 'en' ? 'Receipt Verification' : 'Makbuz Doğrulama',
      text: language === 'en'
        ? 'Once your receipt is received, our team will verify your registration and receipt. You will receive a confirmation by email and/or WhatsApp.'
        : 'Makbuzunuz alındıktan sonra ekibimiz kaydınızı ve makbuzunuzu doğrulayacaktır. E-posta ve/veya WhatsApp ile onay alacaksınız.'
    },
    {
      icon: <Mail size={24} />,
      title: language === 'en' ? 'Receive Your Invitation' : 'Davetinizi Alın',
      text: language === 'en'
        ? 'After your receipt has been successfully verified, your official invitation will be sent to you.'
        : 'Makbuzunuz başarıyla doğrulandıktan sonra resmi davetiniz size gönderilecektir.'
    },
    {
      icon: <Clock size={24} />,
      title: language === 'en' ? 'Get Ready for Bingo' : 'Bingo İçin Hazırlanın',
      text: language === 'en'
        ? 'Keep an eye on your email and WhatsApp for important event information and reminders. You will receive reminders 5 days and 3 days before the event.'
        : 'Önemli etkinlik bilgileri ve hatırlatmalar için e-postanızı ve WhatsApp\'ınızı kontrol edin. Etkinlikten 5 gün ve 3 gün önce hatırlatmalar alacaksınız.'
    },
    {
      icon: <Users size={24} />,
      title: language === 'en' ? 'Join the Event' : 'Etkinliğe Katılın',
      text: language === 'en'
        ? 'Come along to the Kombos Otomotiv Bingo event, enjoy the experience, and get ready for an exciting game.'
        : 'Kombos Otomotiv Bingo etkinliğine gelin, deneyimi yaşayın ve heyecanlı bir oyun için hazırlanın.'
    },
    {
      icon: <Star size={24} />,
      title: language === 'en' ? 'Chance to Win 500,000 TL' : '500.000 TL Kazanma Şansı',
      text: language === 'en'
        ? 'Take part in the bingo and get your chance to win the 500,000 TL cash prize.'
        : 'Bingo\'ya katılın ve 500.000 TL nakit ödülü kazanma şansını yakalayın.'
    }
  ];

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>{language === 'en' ? 'Why Kombos Otomotiv Bingo?' : 'Neden Kombos Otomotiv Bingo?'}</h1>
          <p>{language === 'en' ? 'The main purpose behind this raffle and registration.' : 'Bu çekiliş ve kaydın arkasındaki ana amaç.'}</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} style={{ marginRight: 6 }} />
            {language === 'en' ? 'Back to Form' : 'Forma Dön'}
          </button>
        </div>
      </div>

      <div className="about-card">
        <p>
          {language === 'en'
            ? 'Kombos Otomotiv Bingo is designed to give participants a simple, exciting, and rewarding experience. From registration to the event itself, every step is designed to make participation easy while giving you the chance to win the 500,000 TL cash prize.'
            : 'Kombos Otomotiv Bingo, katılımcılara basit, heyecan verici ve ödüllendirici bir deneyim sunmak için tasarlanmıştır. Kayıttan etkinliğe kadar her adım, katılımı kolaylaştırırken 500.000 TL nakit ödülü kazanma şansı verir.'}
        </p>
      </div>

      <div className="about-section">
        <h2>{language === 'en' ? 'How It Works' : 'Nasıl Çalışır?'}</h2>
        <div className="bingo-steps">
          {steps.map((step, index) => (
            <div key={index} className="bingo-step">
              <div className="bingo-step-icon">{step.icon}</div>
              <div className="bingo-step-content">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="about-section" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.15em', fontWeight: 600, color: '#000000', margin: '0 0 16px' }}>
          {language === 'en'
            ? 'Register now and be part of the Kombos Otomotiv Bingo experience!'
            : 'Şimdi kayıt olun ve Kombos Otomotiv Bingo deneyiminin bir parçası olun!'}
        </p>
        <button type="button" className="btn-primary" onClick={onBack}>
          {language === 'en' ? 'Register Now' : 'Şimdi Kayıt Ol'}
        </button>
      </div>
    </div>
  );
};

export default BingoPage;
