/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

export function findMatchingRegistrationEntry(registration, traineeRegistrations) {
  const sameCalendarDay = (a, b) => {
    if (!(a instanceof Date) || !(b instanceof Date)) return false;
    if (isNaN(a) || isNaN(b)) return false;
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  };

  return traineeRegistrations.find(entry =>
    entry.firstName === registration.firstName &&
    entry.lastName === registration.lastName &&
    entry.ageGroup === registration.ageGroup &&
    entry.sessionName === registration.sessionName &&
    sameCalendarDay(entry.date, registration.dates)
  );
}

export function insertDate(sortedDates, newDate) {
  let left = 0;
  let right = sortedDates.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (sortedDates[mid] < newDate) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  sortedDates.splice(left, 0, newDate);
  return sortedDates;
}

export function dateStringToDate(dateStr) {
    const d = new Date(dateStr);
    return isNaN(d) ? null : d;
};

export function isValidDate(d) {
  return isNaN(d);
}

export function getLocalDate() {
  return new Date().toLocaleDateString('en-CA');
}