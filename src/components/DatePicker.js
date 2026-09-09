import React from 'react';
import { ChevronDown } from '../icons';

const DatePicker = ({ label, value, onChange, required }) => {
  const maxYear = 2012;
  const years = Array.from({ length: maxYear - 1899 }, (_, i) => maxYear - i);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1).padStart(2, '0') }));
  
  const getDay = (month, year) => {
    if (!month || !year) return Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: String(i + 1).padStart(2, '0') }));
    const maxDay = new Date(year, month, 0).getDate();
    return Array.from({ length: maxDay }, (_, i) => ({ value: i + 1, label: String(i + 1).padStart(2, '0') }));
  };

  const parseDob = (dobValue) => {
    if (!dobValue) return { day: '', month: '', year: '' };
    const parts = dobValue.split('-');
    return {
      year: parts[0] ? Number(parts[0]) : '',
      month: parts[1] ? Number(parts[1]) : '',
      day: parts[2] ? Number(parts[2]) : ''
    };
  };

  const initial = parseDob(value);
  const [dobMonth, setDobMonth] = React.useState(initial.month);
  const [dobYear, setDobYear] = React.useState(initial.year);
  const [dobDay, setDobDay] = React.useState(initial.day);

  React.useEffect(() => {
    const parsed = parseDob(value);
    setDobMonth(parsed.month);
    setDobYear(parsed.year);
    setDobDay(parsed.day);
  }, [value]);

  const days = getDay(dobMonth, dobYear);

  React.useEffect(() => {
    if (dobMonth && dobYear && dobDay) {
      const formattedMonth = String(dobMonth).padStart(2, '0');
      const formattedDay = String(dobDay).padStart(2, '0');
      onChange(`${dobYear}-${formattedMonth}-${formattedDay}`);
    }
  }, [dobMonth, dobYear, dobDay]);

  const handleMonthChange = (e) => {
    const newMonth = Number(e.target.value);
    setDobMonth(newMonth);
    if (dobDay && newDateMaxDay(newMonth, dobYear) < dobDay) {
      setDobDay(newDateMaxDay(newMonth, dobYear));
    }
  };

  const handleYearChange = (e) => {
    const newYear = Number(e.target.value);
    setDobYear(newYear);
    if (dobDay && newDateMaxDay(dobMonth, newYear) < dobDay) {
      setDobDay(newDateMaxDay(dobMonth, newYear));
    }
  };

  const handleDayChange = (e) => {
    setDobDay(Number(e.target.value));
  };

  const newDateMaxDay = (month, year) => {
    if (!month || !year) return 31;
    return new Date(year, month, 0).getDate();
  };

  return (
    <div className="form-group">
      <label>{label} {required && <span className="required">*</span>}</label>
      <div className="date-picker-row">
        <div className="select-wrapper">
          <select value={dobDay} onChange={handleDayChange} required>
            <option value="">DD</option>
            {days.map(day => (
              <option key={day.value} value={day.value}>{day.label}</option>
            ))}
          </select>
          <ChevronDown className="select-icon" size={14} />
        </div>
        <div className="select-wrapper">
          <select value={dobMonth} onChange={handleMonthChange} required>
            <option value="">MM</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <ChevronDown className="select-icon" size={14} />
        </div>
        <div className="select-wrapper">
          <select value={dobYear} onChange={handleYearChange} required>
            <option value="">YYYY</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <ChevronDown className="select-icon" size={14} />
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
