/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useState, useEffect, useCallback } from 'react';
import { getSessions, addSession, updateSession, deleteSession } from '../../integrations/Api';
import { SkeletonList } from '../common/Skeleton';

const LABELS = {
  TITLE: 'Kurssien hallinta',
  ADD_NEW: '+ Lisää uusi kurssi',
  NAME: 'Kurssin nimi',
  COURSE: 'Kurssityyppi',
  START_DATE: 'Alkupäivä',
  END_DATE: 'Loppupäivä',
  SAVE: 'Tallenna',
  CANCEL: 'Peruuta',
  EDIT: 'Muokkaa',
  DELETE: 'Poista',
  CONFIRM_DELETE: 'Haluatko varmasti poistaa kurssin',
  NO_SESSIONS: 'Ei kursseja',
  LOADING: 'Ladataan...',
};

const COURSE_TYPES = [
  { value: 'basic', label: 'Peruskurssi' },
  { value: 'advanced', label: 'Jatkokurssi' },
  { value: 'fitness', label: 'Kuntopotkis' },
];

/**
 * Parse session data from API response format to internal format
 * API format: [id, course, name, startDate, endDate]
 */
function parseSessionData(row) {
  const [id, course, name, startDate, endDate] = row;
  return { 
    id, 
    course, 
    name, 
    startDate: formatDateForInput(startDate), 
    endDate: formatDateForInput(endDate) 
  };
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
function formatDateForInput(dateValue) {
  if (!dateValue) return '';
  if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
    return dateValue.substring(0, 10);
  }
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().substring(0, 10);
}

const styles = {
  container: {
    padding: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    gap: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  addButton: {
    background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  card: {
    background: 'var(--color-surface)',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid var(--color-border)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    background: 'transparent',
    color: 'var(--color-accent-primary)',
    border: '1px solid var(--color-accent-primary)',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
  },
  deleteBtn: {
    background: 'transparent',
    color: '#ef4444',
    border: '1px solid #ef4444',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    color: 'var(--color-text-secondary)',
    fontSize: '0.9rem',
  },
  infoRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  infoLabel: {
    fontWeight: 500,
    minWidth: '80px',
  },
  form: {
    background: 'var(--color-surface)',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid var(--color-accent-primary)',
    marginBottom: '1.5rem',
  },
  formTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: 'var(--color-text-secondary)',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-background)',
    color: 'var(--color-text-primary)',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-background)',
    color: 'var(--color-text-primary)',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  dateRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  saveBtn: {
    background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  cancelBtn: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: '3rem',
    color: 'var(--color-text-secondary)',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--color-text-secondary)',
  },
  dialog: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  dialogContent: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '1.5rem',
    maxWidth: '400px',
    width: '90%',
    border: '1px solid #2a2a3e',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  dialogTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: '1rem',
  },
  dialogText: {
    color: 'var(--color-text-secondary)',
    marginBottom: '1.5rem',
  },
  dialogActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  courseBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase',
  },
};

function getCourseLabel(courseType) {
  const found = COURSE_TYPES.find(c => c.value === courseType);
  return found ? found.label : courseType;
}

function getCourseBadgeStyle(courseType) {
  const colors = {
    basic: { background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' },
    advanced: { background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' },
    fitness: { background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' },
  };
  return colors[courseType] || { background: 'rgba(107, 114, 128, 0.2)', color: '#6b7280' };
}

function SessionManagement({ onLoading }) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchSessions = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      const body = await getSessions(forceRefresh);
      const parsedSessions = (body.data || []).map(parseSessionData);
      setSessions(parsedSessions);
    } catch (error) {
      // Error fetching sessions
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (onLoading) onLoading(isLoading);
  }, [isLoading, onLoading]);

  const handleAddNew = () => {
    setEditingSession({ id: null, course: 'basic', name: '', startDate: '', endDate: '' });
    setIsAddingNew(true);
  };

  const handleEdit = (session) => {
    setEditingSession({ ...session });
    setIsAddingNew(false);
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setIsAddingNew(false);
  };

  const handleSave = async () => {
    if (!editingSession.name || !editingSession.startDate || !editingSession.endDate) {
      return;
    }

    setIsLoading(true);
    try {
      if (isAddingNew) {
        await addSession(editingSession);
      } else {
        await updateSession(editingSession);
      }
      await fetchSessions(true); // Force refresh after save
      setEditingSession(null);
      setIsAddingNew(false);
    } catch (error) {
      // Error saving session
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (session) => {
    setDeleteConfirm(session);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setIsLoading(true);
    try {
      await deleteSession(deleteConfirm.id);
      await fetchSessions(true); // Force refresh after delete
    } catch (error) {
      // Error deleting session
    } finally {
      setIsLoading(false);
      setDeleteConfirm(null);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditingSession(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading && sessions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>{LABELS.TITLE}</h2>
        </div>
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>{LABELS.TITLE}</h2>
        {!editingSession && (
          <button style={styles.addButton} onClick={handleAddNew}>
            {LABELS.ADD_NEW}
          </button>
        )}
      </div>

      {/* Edit/Add Form */}
      {editingSession && (
        <div style={styles.form}>
          <div style={styles.formTitle}>
            {isAddingNew ? 'Uusi kurssi' : 'Muokkaa kurssia'}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{LABELS.COURSE}</label>
            <select
              style={styles.select}
              value={editingSession.course}
              onChange={(e) => handleFieldChange('course', e.target.value)}
            >
              {COURSE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{LABELS.NAME}</label>
            <input
              style={styles.input}
              type="text"
              value={editingSession.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Esim. PEKU"
            />
          </div>

          <div style={styles.dateRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>{LABELS.START_DATE}</label>
              <input
                style={styles.input}
                type="date"
                value={editingSession.startDate}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>{LABELS.END_DATE}</label>
              <input
                style={styles.input}
                type="date"
                value={editingSession.endDate}
                onChange={(e) => handleFieldChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div style={styles.formActions}>
            <button style={styles.saveBtn} onClick={handleSave} disabled={isLoading}>
              {LABELS.SAVE}
            </button>
            <button style={styles.cancelBtn} onClick={handleCancelEdit}>
              {LABELS.CANCEL}
            </button>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div style={styles.empty}>{LABELS.NO_SESSIONS}</div>
      ) : (
        <div style={styles.list}>
          {sessions.map(session => (
            <div key={session.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>{session.name}</h3>
                  <span style={{ ...styles.courseBadge, ...getCourseBadgeStyle(session.course) }}>
                    {getCourseLabel(session.course)}
                  </span>
                </div>
                <div style={styles.cardActions}>
                  <button style={styles.editBtn} onClick={() => handleEdit(session)}>
                    {LABELS.EDIT}
                  </button>
                  <button style={styles.deleteBtn} onClick={() => handleDeleteClick(session)}>
                    {LABELS.DELETE}
                  </button>
                </div>
              </div>
              <div style={styles.cardInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>{LABELS.START_DATE}:</span>
                  <span>{session.startDate}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>{LABELS.END_DATE}:</span>
                  <span>{session.endDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div style={styles.dialog}>
          <div style={styles.dialogContent}>
            <div style={styles.dialogTitle}>{LABELS.DELETE}</div>
            <div style={styles.dialogText}>
              {LABELS.CONFIRM_DELETE} "{deleteConfirm.name}"?
            </div>
            <div style={styles.dialogActions}>
              <button style={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>
                {LABELS.CANCEL}
              </button>
              <button style={styles.deleteBtn} onClick={handleDeleteConfirm}>
                {LABELS.DELETE}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionManagement;
