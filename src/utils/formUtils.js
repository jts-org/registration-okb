/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

export function stringToDate(dateStr) {
  const d = new Date(dateStr);
  return isNaN(d) ? null : d;
}

export function clearInputFields(ids) {
  ids.forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
}

export function copyTimePart(sourceDate, targetDate) {
  console.log('copyTimePart: source', sourceDate, 'target', targetDate);
  if (!sourceDate || !targetDate) return null;
  const newDate = new Date(sourceDate);
  newDate.setHours(targetDate.getHours());
  newDate.setMinutes(targetDate.getMinutes());
  newDate.setSeconds(targetDate.getSeconds());
  newDate.setMilliseconds(targetDate.getMilliseconds());
  return newDate;
}