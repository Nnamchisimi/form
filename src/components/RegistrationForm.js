import React from 'react';
import { ChevronDown, Upload, Save, Check } from '../icons';
import translations from '../translations';
import DatePicker from './DatePicker';

const RegistrationForm = ({ language, formData, setFormData, fileName, setFileName, onSubmit, onSaveDraft }) => {
  const t = translations[language];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').replace(/^90/, '');
    if (digits.length === 0) return '+90 ';

    if (digits.length <= 3) return '+90 (' + digits;
    if (digits.length <= 6) return '+90 (' + digits.slice(0, 3) + ') ' + digits.slice(3);
    if (digits.length <= 8) return '+90 (' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
    return '+90 (' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6, 10);
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDimension = 1920;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.8;
          let attempts = 0;
          const maxAttempts = 8;

          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Image compression failed'));
                  return;
                }

                if ((blob.size > 1024 * 1024 || blob.size > file.size * 0.9) && attempts < maxAttempts) {
                  attempts += 1;
                  quality = Math.max(0.1, quality - 0.15);
                  tryCompress();
                } else {
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  });
                  resolve(compressedFile);
                }
              },
              'image/jpeg',
              quality
            );
          };

          tryCompress();
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const processedFile = await compressImage(file);
        setFileName(processedFile.name);
        setFormData(prev => ({ ...prev, vehicleStub: processedFile }));
      } catch (error) {
        console.error('Error processing image:', error);
        setFileName(file.name);
        setFormData(prev => ({ ...prev, vehicleStub: file }));
      }
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="name-row">
        <div className="form-group">
          <label htmlFor="name">{t.name} <span className="required">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder={t.placeholderName}
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="surname">{t.surname}</label>
          <input
            type="text"
            id="surname"
            name="surname"
            placeholder={t.placeholderSurname}
            value={formData.surname}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">{t.email} <span className="required">*</span></label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder={t.placeholderEmail}
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">{t.phone} <span className="required">*</span></label>
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder={t.placeholderPhone}
          value={formData.phone}
          onChange={handlePhoneChange}
          required
        />
      </div>

      <DatePicker
        label={t.dob}
        value={formData.dob}
        onChange={(value) => setFormData(prev => ({ ...prev, dob: value }))}
        required
      />

      <div className="form-group">
        <label htmlFor="vehicleModel">{t.vehicleModel} <span className="required">*</span></label>
        <input
          type="text"
          id="vehicleModel"
          name="vehicleModel"
          placeholder={t.placeholderVehicleModel}
          value={formData.vehicleModel}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="modelYear">{t.modelYear} <span className="required">*</span></label>
        <div className="select-wrapper">
          <select
            id="modelYear"
            name="modelYear"
            value={formData.modelYear}
            onChange={handleChange}
            required
          >
            <option value="">{t.pleaseSelect}</option>
            {Array.from({ length: 35 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          <ChevronDown className="select-icon" size={14} />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="licensePlate">{t.licensePlate} <span className="required">*</span></label>
        <input
          type="text"
          id="licensePlate"
          name="licensePlate"
          placeholder={t.placeholderLicensePlate}
          value={formData.licensePlate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>{t.uploadStub} <span className="required">*</span></label>
        <div className="file-upload" onClick={() => document.getElementById('vehicleStub').click()}>
          <input
            type="file"
            id="vehicleStub"
            name="vehicleStub"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            required
          />
          <div className="file-upload-content">
            <Upload className="upload-icon" size={28} />
            <div className="file-upload-text">
              <strong>{t.browseFiles}</strong>
              <p>{t.dragDrop}</p>
            </div>
            <span className="file-name">{fileName !== 'No file chosen' ? fileName : t.noFileChosen}</span>
          </div>
        </div>
        <div className="file-info">
          {t.stubInfo}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="location">{t.location} <span className="required">*</span></label>
        <div className="select-wrapper">
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          >
            <option value="">{t.pleaseSelect}</option>
            <option value="lefkosa">{t.locations.lefkosa}</option>
            <option value="kyrenia">{t.locations.kyrenia}</option>
            <option value="haspolat">{t.locations.haspolat}</option>
            <option value="famagusta">{t.locations.famagusta}</option>
            <option value="guzelyurt">{t.locations.guzelyurt}</option>
          </select>
          <ChevronDown className="select-icon" size={14} />
        </div>
      </div>

      <div className="button-group">
        <button type="button" className="btn-secondary" onClick={onSaveDraft}>
          <Save size={16} style={{ marginRight: 6 }} />
          {t.continueLater}
        </button>
        <button type="submit" className="btn-primary">
          <Check size={16} style={{ marginRight: 6 }} />
          {t.completeRegistration}
        </button>
      </div>
    </form>
  );
};

export default RegistrationForm;
