import { useState, useEffect, useCallback } from 'react';
import { getCamps, addCamp, updateCamp, deleteCamp } from '../../integrations/Api';
import { SkeletonList } from '../common/Skeleton';

const LABELS = {
  TITLE: 'Leirien hallinta',
  ADD_NEW: '+ Lisää uusi leiri',
  NAME: 'Leirin nimi',
  TEACHER: 'Vetäjä',
  DAYS: 'Päivät',
  ADD_DAY: '+ Lisää päivä',
  DATE: 'Päivämäärä',
  SESSIONS: 'Sessioita',
  SAVE: 'Tallenna',
  CANCEL: 'Peruuta',
  EDIT: 'Muokkaa',
  DELETE: 'Poista',
  CONFIRM_DELETE: 'Haluatko varmasti poistaa leirin',
  NO_CAMPS: 'Ei leirejä',
  LOADING: 'Ladataan...',
};

/**
 * Parse camp data from API response format to internal format
 * API format: [id, "camp", name, teacher, date1, sessions1, date2, sessions2, ...]
 */
function parseCampData(row) {
  const [id, , name, teacher, ...dayData] = row;
  const days = [];
  
  for (let i = 0; i < dayData.length; i += 2) {
    const date = dayData[i];
    const sessions = dayData[i + 1];
    if (date) {
      days.push({ date, sessions: Number(sessions) || 0 });
    }
  }
  
  return { id, name, teacher, days };
}

function CampManagement({ onLoading }) {
  const [camps, setCamps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCamps = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      const body = await getCamps(forceRefresh);
      const parsedCamps = (body.data || []).map(parseCampData);
      setCamps(parsedCamps);
    } catch (error) {
      // Error fetching camps
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  useEffect(() => {
    if (onLoading) onLoading(isLoading);
  }, [isLoading, onLoading]);

  const handleAddNew = () => {
    setEditingCamp({ id: null, name: '', teacher: '', days: [{ date: '', sessions: 1 }] });
    setIsAddingNew(true);
  };

  const handleEdit = (camp) => {
    setEditingCamp({ ...camp, days: [...camp.days] });
    setIsAddingNew(false);
  };

  const handleCancelEdit = () => {
    setEditingCamp(null);
    setIsAddingNew(false);
  };

  const handleSave = async () => {
    if (!editingCamp) return;
    
    setIsLoading(true);
    if (onLoading) onLoading(true);
    
    try {
      const campData = {
        id: editingCamp.id,
        name: editingCamp.name,
        teacher: editingCamp.teacher,
        days: editingCamp.days.filter(d => d.date), // Only include days with dates
      };
      
      if (isAddingNew) {
        await addCamp(campData);
      } else {
        await updateCamp(campData);
      }
      
      await fetchCamps(true); // Force refresh after save
      setEditingCamp(null);
      setIsAddingNew(false);
    } catch (error) {
      console.error('Error saving camp:', error);
    } finally {
      setIsLoading(false);
      if (onLoading) onLoading(false);
    }
  };

  const handleDelete = async (campId) => {
    setIsLoading(true);
    if (onLoading) onLoading(true);
    
    try {
      await deleteCamp(campId);
      await fetchCamps(true); // Force refresh after delete
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting camp:', error);
    } finally {
      setIsLoading(false);
      if (onLoading) onLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditingCamp(prev => ({ ...prev, [field]: value }));
  };

  const handleDayChange = (index, field, value) => {
    setEditingCamp(prev => {
      const newDays = [...prev.days];
      newDays[index] = { ...newDays[index], [field]: value };
      return { ...prev, days: newDays };
    });
  };

  const handleAddDay = () => {
    setEditingCamp(prev => ({
      ...prev,
      days: [...prev.days, { date: '', sessions: 1 }]
    }));
  };

  const handleRemoveDay = (index) => {
    setEditingCamp(prev => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== index)
    }));
  };

  if (isLoading && camps.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>{LABELS.TITLE}</h3>
        </div>
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>{LABELS.TITLE}</h3>
        {!editingCamp && (
          <button style={styles.addButton} onClick={handleAddNew}>
            {LABELS.ADD_NEW}
          </button>
        )}
      </div>

      {/* Edit/Add Form */}
      {editingCamp && (
        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{LABELS.NAME}</label>
            <input
              type="text"
              style={styles.input}
              value={editingCamp.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="LEIRIN NIMI"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{LABELS.TEACHER}</label>
            <input
              type="text"
              style={styles.input}
              value={editingCamp.teacher}
              onChange={(e) => handleFieldChange('teacher', e.target.value)}
              placeholder="Vetäjän nimi"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{LABELS.DAYS}</label>
            {editingCamp.days.map((day, index) => (
              <div key={index} style={styles.dayRow}>
                <input
                  type="date"
                  style={styles.dateInput}
                  value={day.date}
                  onChange={(e) => handleDayChange(index, 'date', e.target.value)}
                />
                <input
                  type="number"
                  style={styles.sessionsInput}
                  value={day.sessions === '' ? '' : day.sessions}
                  min="1"
                  onChange={(e) => handleDayChange(index, 'sessions', e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value);
                    if (!val || val < 1) handleDayChange(index, 'sessions', 1);
                  }}
                  onFocus={(e) => e.target.select()}
                />
                <span style={styles.sessionsLabel}>sessio(ta)</span>
                {editingCamp.days.length > 1 && (
                  <button
                    type="button"
                    style={styles.removeDayButton}
                    onClick={() => handleRemoveDay(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" style={styles.addDayButton} onClick={handleAddDay}>
              {LABELS.ADD_DAY}
            </button>
          </div>

          <div style={styles.formActions}>
            <button style={styles.cancelButton} onClick={handleCancelEdit}>
              {LABELS.CANCEL}
            </button>
            <button 
              style={styles.saveButton} 
              onClick={handleSave}
              disabled={!editingCamp.name || !editingCamp.days.some(d => d.date)}
            >
              {LABELS.SAVE}
            </button>
          </div>
        </div>
      )}

      {/* Camp List */}
      {!editingCamp && (
        <div style={styles.list}>
          {camps.length === 0 ? (
            <div style={styles.empty}>{LABELS.NO_CAMPS}</div>
          ) : (
            camps.map((camp) => (
              <div key={camp.id} style={styles.campCard}>
                <div style={styles.campInfo}>
                  <div style={styles.campName}>{camp.name}</div>
                  <div style={styles.campTeacher}>{camp.teacher}</div>
                  <div style={styles.campDays}>
                    {camp.days.map((day, i) => (
                      <span key={i} style={styles.dayBadge}>
                        {day.date} ({day.sessions} {day.sessions === 1 ? 'sessio' : 'sessiota'})
                      </span>
                    ))}
                  </div>
                </div>
                <div style={styles.campActions}>
                  <button style={styles.editButton} onClick={() => handleEdit(camp)}>
                    {LABELS.EDIT}
                  </button>
                  <button style={styles.deleteButton} onClick={() => setDeleteConfirm(camp)}>
                    {LABELS.DELETE}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div style={styles.overlay}>
          <div style={styles.dialog}>
            <p style={styles.dialogText}>
              {LABELS.CONFIRM_DELETE} "{deleteConfirm.name}"?
            </p>
            <div style={styles.dialogActions}>
              <button style={styles.cancelButton} onClick={() => setDeleteConfirm(null)}>
                {LABELS.CANCEL}
              </button>
              <button style={styles.deleteConfirmButton} onClick={() => handleDelete(deleteConfirm.id)}>
                {LABELS.DELETE}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '16px 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '1.125rem',
    color: '#ffffff',
    fontWeight: 600,
  },
  loading: {
    textAlign: 'center',
    color: '#6b6b7b',
    padding: '40px',
  },
  addButton: {
    padding: '10px 16px',
    fontSize: '0.875rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #00d4aa 0%, #00a885 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  form: {
    background: 'rgba(26, 26, 46, 0.8)',
    border: '1px solid #2a2a3e',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#a0a0b0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '0.95rem',
    background: '#12121a',
    border: '2px solid #2a2a3e',
    borderRadius: '8px',
    color: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.25s ease',
    boxSizing: 'border-box',
  },
  dayRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  dateInput: {
    flex: 1,
    padding: '10px',
    fontSize: '0.9rem',
    background: '#12121a',
    border: '2px solid #2a2a3e',
    borderRadius: '8px',
    color: '#ffffff',
    outline: 'none',
  },
  sessionsInput: {
    width: '70px',
    padding: '10px',
    fontSize: '0.9rem',
    background: '#12121a',
    border: '2px solid #2a2a3e',
    borderRadius: '8px',
    color: '#ffffff',
    outline: 'none',
    textAlign: 'center',
  },
  sessionsLabel: {
    fontSize: '0.85rem',
    color: '#6b6b7b',
  },
  removeDayButton: {
    width: '32px',
    height: '32px',
    padding: 0,
    fontSize: '1rem',
    background: 'rgba(255, 107, 107, 0.2)',
    color: '#ff6b6b',
    border: '1px solid #ff6b6b',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  addDayButton: {
    padding: '8px 12px',
    fontSize: '0.8rem',
    fontWeight: 500,
    background: 'transparent',
    color: '#667eea',
    border: '1px dashed #667eea',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #2a2a3e',
  },
  saveButton: {
    padding: '10px 24px',
    fontSize: '0.875rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #00d4aa 0%, #00a885 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  cancelButton: {
    padding: '10px 24px',
    fontSize: '0.875rem',
    fontWeight: 600,
    background: 'transparent',
    color: '#a0a0b0',
    border: '1px solid #2a2a3e',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  empty: {
    textAlign: 'center',
    color: '#6b6b7b',
    padding: '40px',
    background: 'rgba(26, 26, 46, 0.5)',
    borderRadius: '12px',
    border: '1px dashed #2a2a3e',
  },
  campCard: {
    background: 'rgba(26, 26, 46, 0.8)',
    border: '1px solid #2a2a3e',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    transition: 'border-color 0.25s ease',
  },
  campInfo: {
    flex: 1,
  },
  campName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '4px',
  },
  campTeacher: {
    fontSize: '0.875rem',
    color: '#a0a0b0',
    marginBottom: '8px',
  },
  campDays: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  dayBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    fontSize: '0.75rem',
    background: 'rgba(102, 126, 234, 0.2)',
    color: '#667eea',
    borderRadius: '4px',
  },
  campActions: {
    display: 'flex',
    gap: '8px',
    marginLeft: '12px',
  },
  editButton: {
    padding: '8px 12px',
    fontSize: '0.8rem',
    fontWeight: 500,
    background: 'transparent',
    color: '#667eea',
    border: '1px solid #667eea',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  deleteButton: {
    padding: '8px 12px',
    fontSize: '0.8rem',
    fontWeight: 500,
    background: 'transparent',
    color: '#ff6b6b',
    border: '1px solid #ff6b6b',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
  },
  dialog: {
    background: 'linear-gradient(180deg, #1a1a2e 0%, #12121a 100%)',
    border: '1px solid #2a2a3e',
    padding: '24px',
    borderRadius: '16px',
    minWidth: '300px',
    maxWidth: '400px',
  },
  dialogText: {
    color: '#ffffff',
    fontSize: '1rem',
    marginBottom: '20px',
    textAlign: 'center',
  },
  dialogActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
  },
  deleteConfirmButton: {
    padding: '10px 24px',
    fontSize: '0.875rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
};

export default CampManagement;
