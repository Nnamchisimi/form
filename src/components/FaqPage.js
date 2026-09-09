import React, { useState } from 'react';
import { ChevronDown, ArrowLeft } from '../icons';
import translations from '../translations';

const FaqPage = ({ language, onBack }) => {
  const t = translations[language];
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: language === 'en' ? 'Do I need to upload my car document when registering?' : 'Kayıt olurken koçanımı yüklemem gerekiyor mu?',
      answer: language === 'en'
        ? 'Car document upload may be optional during registration. If you do not upload your car document at the time of registration, you will be asked to submit it separately before the specified deadline.'
        : 'Kayıt sırasında koçan yükleme isteğe bağlı olabilir. Kayıt sırasında koçanınızı yüklemezseniz, belirtilen son tarihten önce ayrı olarak göndermeniz istenecektir.'
    },
    {
      question: language === 'en' ? 'What happens after I upload my car document?' : 'Koçanımı yükledikten sonra ne olur?',
      answer: language === 'en'
        ? 'Once your car document is submitted, you will receive an email confirmation. Your registration will then proceed to the car document verification process.'
        : 'Koçanınız gönderildikten sonra bir e-posta onayı alacaksınız. Kaydınız daha sonra koçan doğrulama sürecine geçecektir.'
    },
    {
      question: language === 'en' ? 'When will I receive my invitation?' : 'Davetiyemi ne zaman alacağım?',
      answer: language === 'en'
        ? 'Your invitation will be sent once your car document has been successfully verified.'
        : 'Koçanınız başarıyla doğrulandıktan sonra davetiniz gönderilecektir.'
    },
    {
      question: language === 'en' ? 'What if I complete my registration without uploading my car document?' : 'Kaydımı koçan yüklemeden tamamlarsam ne olur?',
      answer: language === 'en'
        ? 'You will receive an email reminder to submit your car document by the specified deadline.'
        : 'Belirtilen son tarihe kadar koçanınızı göndermeniz konusunda sizi hatırlatan bir e-posta mesajı alacaksınız.'
    },
    {
      question: language === 'en' ? 'What happens if I forget to send my car document?' : 'Koçanımı göndermeyi unutursam ne olur?',
      answer: language === 'en'
        ? 'If your car document has not been submitted, you will receive a follow-up email approximately 3 days after registration.'
        : 'Koçanınız gönderilmediyse, kayıttan yaklaşık 3 gün sonra bir takip e-postası alacaksınız.'
    },
    {
      question: language === 'en' ? 'Will I receive reminders about the event?' : 'Etkinlikle ilgili hatırlatmalar alacağım?',
      answer: language === 'en'
        ? 'Yes. Registered attendees will receive event reminders: 5 days before the event, 3 days before the event.'
        : 'Evet. Kayıtlı katılımcılar etkinlik hatırlatmaları alacaktır: Etkinlikten 5 gün önce, etkinlikten 3 gün önce.'
    },
    {
      question: language === 'en' ? 'How will I receive the reminders?' : 'Hatırlatmaları nasıl alacağım?',
      answer: language === 'en'
        ? 'Reminders may be sent by email, depending on the contact details provided during registration.'
        : 'Hatırlatmalar, kayıt sırasında verilen iletişim bilgilerine bağlı olarak e-posta ile gönderilebilir.'
    },
    {
      question: language === 'en' ? 'What should I do if I have a problem uploading my car document?' : 'Koçanımı yüklerken sorun yaşarsam ne yapmalıyım?',
      answer: language === 'en'
        ? 'If you experience any issues uploading your car document, please contact the event support team for assistance or use the alternative car document submission method provided.'
        : 'Koçanınızı yüklerken herhangi bir sorun yaşarsanız, lütfen yardım için etkinlik destek ekibiyle iletişime geçin veya sağlanan alternatif koçan gönderme yöntemini kullanın.'
    }
  ];

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>FAQ</h1>
          <p>{language === 'en' ? 'Frequently Asked Questions' : 'Sıkça Sorulan Sorular'}</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} style={{ marginRight: 6 }} />
            {language === 'en' ? 'Back to Form' : 'Forma Dön'}
          </button>
        </div>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
            <button type="button" className="faq-question" onClick={() => toggle(index)}>
              <span>{faq.question}</span>
              <ChevronDown size={20} />
            </button>
            {openIndex === index && <div className="faq-answer"><p>{faq.answer}</p></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqPage;
