import React from 'react';

const datePickerStyle = {
  width: '100%',
  maxWidth: '320px',
  padding: '14px 16px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  background: '#12121a',
  border: '2px solid #2a2a3e',
  borderRadius: '12px',
  color: '#ffffff',
  cursor: 'pointer',
  transition: 'all 0.25s ease',
  outline: 'none',
};

const datePickerFocusStyle = `
  .modern-date-picker:focus {
    border-color: #00d4aa;
    box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
  }
  .modern-date-picker:hover {
    border-color: #667eea;
  }
  .modern-date-picker::-webkit-calendar-picker-indicator {
    filter: invert(0.8) sepia(1) saturate(5) hue-rotate(120deg);
    cursor: pointer;
  }
`;

// Inject styles once
if (typeof document !== 'undefined' && !document.querySelector('[data-datepicker-styles]')) {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('data-datepicker-styles', 'true');
  styleSheet.textContent = datePickerFocusStyle;
  document.head.appendChild(styleSheet);
}

function DatePicker({onDateChange, selectedDate}) {
  const handleDateChange = (event) => {
    onDateChange(event.target.value);
  };

  return (
    <input
      type="date"
      id="date"
      className="modern-date-picker"
      style={datePickerStyle}
      value={selectedDate}
      onChange={handleDateChange}
    />
  );
}

export default DatePicker;