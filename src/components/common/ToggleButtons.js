import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

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
            backgroundColor: 'grey.300',
            color: '#000',
            '&:hover': {
              backgroundColor: 'grey.400',
            },
            ...sx
          }          
        }
        disabled={disabled}
      >
        <span style={{ whiteSpace: 'pre-line' }}>{buttonsGroup[0]}</span>
      </Button>
    );
  }

  return (
    <ButtonGroup
      variant="contained"
      color="primary"
      aria-label="toggle button group"
      sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}
    >
      {buttonsGroup.map((opt, idx) => (
        <Button
          key={opt}
          onClick={() => onClick(opt)}
          ref={idx === 0 ? buttonRef : null}
          sx={{
            backgroundColor: selected === opt ? 'primary.main' : 'grey.300',
            color: selected === opt ? '#fff' : '#000',
            '&:hover': {
              backgroundColor: selected === opt ? 'primary.dark' : 'grey.400',
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