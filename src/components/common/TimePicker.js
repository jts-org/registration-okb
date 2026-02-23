import React from 'react';
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';

const timePickerStyle = {
  width: '100%',
  maxWidth: '320px',
  minHeight: '36px',
  height: '48px',
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

const timePickerFocusStyle = `
  .modern-time-picker:focus-within {
    border-color: #00d4aa;
    box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
  }
  .modern-time-picker:hover {
    border-color: #667eea;
  }
  .modern-time-picker .MuiSvgIcon-root {
    color: #00d4aa;
  }
`;

// Inject styles once
if (typeof document !== 'undefined' && !document.querySelector('[data-timepicker-styles]')) {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('data-timepicker-styles', 'true');
  styleSheet.textContent = timePickerFocusStyle;
  document.head.appendChild(styleSheet);
}

function TimePicker({ value, onChange, label }) {
  return (
    <MuiTimePicker
      label={label}
      value={value}
      onChange={onChange}
      ampm={false}
      slotProps={{
        textField: {
          InputProps: {
            className: 'modern-time-picker',
            style: timePickerStyle,
          },
          InputLabelProps: {
            style: { color: '#ffffff' },
          },
        },
      }}
    />
  );
}

export default TimePicker;
