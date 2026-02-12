/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

// Modern theme colors
const theme = {
  bg: {
    default: 'rgba(26, 26, 46, 0.8)',
    selected: 'linear-gradient(135deg, #00d4aa 0%, #00a885 100%)',
    hover: 'rgba(42, 42, 62, 0.9)',
    disabled: 'rgba(26, 26, 46, 0.4)',
  },
  text: {
    default: '#a0a0b0',
    selected: '#ffffff',
    disabled: '#6b6b7b',
  },
  border: {
    default: '1px solid #2a2a3e',
    selected: '1px solid #00d4aa',
    hover: '1px solid #667eea',
  },
};

const baseButtonStyle = {
  padding: '12px 24px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: '12px',
  transition: 'all 0.25s ease',
  minWidth: '120px',
};

function ToggleButtons({
  onClick,
  buttonsGroup,
  buttonRef,
  selected,
  single = false,
  sx = {},
  disabled = true
}) {
  if (single && buttonsGroup.length === 1) {
    return (
      <Button
        type="submit"
        onClick={() => onClick(buttonsGroup[0])}
        ref={buttonRef}
        sx={{
          ...baseButtonStyle,
          background: disabled ? theme.bg.disabled : theme.bg.selected,
          color: disabled ? theme.text.disabled : theme.text.selected,
          border: disabled ? theme.border.default : theme.border.selected,
          boxShadow: disabled ? 'none' : '0 4px 20px rgba(0, 212, 170, 0.3)',
          '&:hover': {
            background: disabled ? theme.bg.disabled : theme.bg.selected,
            transform: disabled ? 'none' : 'translateY(-2px)',
            boxShadow: disabled ? 'none' : '0 6px 24px rgba(0, 212, 170, 0.4)',
          },
          '&:disabled': {
            background: theme.bg.disabled,
            color: theme.text.disabled,
            border: theme.border.default,
          },
          ...sx
        }}
        disabled={disabled}
      >
        <span style={{ whiteSpace: 'pre-line' }}>{buttonsGroup[0]}</span>
      </Button>
    );
  }

  return (
    <ButtonGroup
      variant="contained"
      aria-label="toggle button group"
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '12px',
        flexWrap: 'wrap',
        '& .MuiButtonGroup-grouped': {
          borderRadius: '12px !important',
          border: 'none !important',
        },
      }}
    >
      {buttonsGroup.map((opt, idx) => (
        <Button
          key={opt}
          onClick={() => onClick(opt)}
          ref={idx === 0 ? buttonRef : null}
          sx={{
            ...baseButtonStyle,
            background: selected === opt ? theme.bg.selected : theme.bg.default,
            color: selected === opt ? theme.text.selected : theme.text.default,
            border: selected === opt ? theme.border.selected : theme.border.default,
            boxShadow: selected === opt ? '0 4px 20px rgba(0, 212, 170, 0.3)' : 'none',
            '&:hover': {
              background: selected === opt ? theme.bg.selected : theme.bg.hover,
              border: selected === opt ? theme.border.selected : theme.border.hover,
              transform: 'translateY(-2px)',
              boxShadow: selected === opt 
                ? '0 6px 24px rgba(0, 212, 170, 0.4)' 
                : '0 4px 16px rgba(102, 126, 234, 0.2)',
            },
            ...sx
          }}
        >
          <span style={{ whiteSpace: 'pre-line' }}>{opt}</span>
        </Button>
      ))}
    </ButtonGroup>
  );
}

export default ToggleButtons;