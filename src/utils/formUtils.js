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