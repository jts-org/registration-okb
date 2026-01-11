import { FORM_LABELS } from "../constants";

function ConfirmationDialog({data, onConfirm, onCancel}) {
  console.log('data', data);
  return (
    <div className="confirmation-dialog">
      <div style={styles.overlay}>
        <div style={styles.dialog}>
          {data}
          <div style={styles.buttonGroup}>
            <button onClick={onConfirm}>{FORM_LABELS.OK}</button>
            <button onClick={onCancel}>{FORM_LABELS.CANCEL}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
  },
  dialog: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    minWidth: '300px',
    textAlign: 'center',
  },
  buttonGroup: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-around',
  },
};


export default ConfirmationDialog;