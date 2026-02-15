/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

const sheetId = "1syi5ytWjxheM7PWzW40MxTPaHSUUxLUsSYTaNRFrlMQ";
const settingsSheetName = "settings";
const traineesSheetName = "trainees";
const coachesSheetName = "coaches";
const sessionsSheetName = "sessions";
const campsSheetName = "camps";
const coachesExperienceSheetName = "coaches_experience";
const coachLoginSheetName = "coach_login";
const weeklyScheduleSheetName = "weekly_schedule";

function doPost(e) {
  // Parse the full request body
  const payload = JSON.parse(e.postData.contents);

  const role = payload.path.role;
  const operation = payload.path.operation;
  const holder = payload.data;

  Logger.log(`Role: ${role}, Operation: ${operation}`);
  Logger.log(holder);

  let id;
  let result = "success";

  try {
    if (role === "trainee") {
      if (operation === "add") {
        id = addTrainee(holder);
      } else if (operation === "update") {
        id = updateTrainee(holder);
      }
    } else if (role === "coach") {
      if (operation === "add") {
        id = addCoach(holder);
      } else if (operation === "update") {
        id = updateCoach(holder);
      }
    } else if (role === "camp") {
      if (operation === "add") {
        id = addCamp(holder);
      } else if (operation === "update") {
        id = updateCamp(holder);
      } else if (operation === "delete") {
        id = deleteCamp(holder);
      }
    } else if (role === "session") {
      if (operation === "add") {
        id = addSession(holder);
      } else if (operation === "update") {
        id = updateSession(holder);
      } else if (operation === "delete") {
        id = deleteSession(holder);
      }
    } else if (role === "coach_login") {
      if (operation === "register") {
        id = registerCoachLogin(holder);
      } else if (operation === "verify") {
        // Special case: verify returns coach data, not just id
        const verifyResult = verifyCoachPin(holder);
        return ContentService
          .createTextOutput(JSON.stringify(verifyResult))
          .setMimeType(ContentService.MimeType.JSON);
      } else if (operation === "update") {
        id = updateCoachLogin(holder);
      } else if (operation === "delete") {
        id = deleteCoachLogin(holder);
      }
    } else {
      result = "error";
    }
  } catch (err) {
    Logger.log("Error: " + err);
    result = "error";
  }

  const jsonResponse = JSON.stringify({
    result: result,
    id: id || null
  });

  if (role === "coach" && id != null) {
    generateCoachMonthlyStats();
  }

  return ContentService
    .createTextOutput(jsonResponse)
    .setMimeType(ContentService.MimeType.JSON)
}

function doGet(e) {
  const fetchType = e.parameter.fetch;

  let result;

  if (fetchType === "settings") {
    result = getSettings();
  } else if (fetchType === "trainee_registrations") {
    result = getTraineeRegistrations();
  } else if (fetchType === "coach_registrations") {
    result = getCoachRegistrations();
  } else if (fetchType === "sessions") {
    result = getSessions();
  } else if (fetchType === "camps") {
    result = getCamps();
  } else if (fetchType === "coaches_experience") {
    result = getCoachesExperience();
  } else if (fetchType === "coach_logins") {
    result = getCoachLogins();
  } else if (fetchType === "upcoming_sessions") {
    result = getUpcomingSessionsWithCoaches();
  } else {
    result = { error: "Invalid fetch type: " + (fetchType || "undefined") };
  }

  var jsonResponse = {
    status : "success",
    data : result
  };

  return ContentService
    .createTextOutput(JSON.stringify(jsonResponse))
    .setMimeType(ContentService.MimeType.JSON)
}

function doOptions(e) {
  return ContentService
    .createTextOutput(JSON.stringify(''))
    .setMimeType(ContentService.MimeType.TEXT)
}

function formatDates(dates) {
  const datesArray = Array.isArray(dates) ? dates : [dates];
  // Format each date to 'YYYY-MM-DD'
  return datesArray.map(date =>
    Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), 'yyyy-MM-dd')
  );  
}

function normalizeDatesInArray(rows) {
  const tz = Session.getScriptTimeZone();
  const ymd = /^\d{4}-\d{2}-\d{2}$/;
  const iso = /^\d{4}-\d{2}-\d{2}T.*Z?$/i;
  const dmy = /^\d{1,2}[.\-\/]\d{1,2}[.\-\/]\d{4}$/;

  const parseDMY = (s) => {
    const parts = s.split(/[.\-\/]/);
    const d = Number(parts[0]);
    const m = Number(parts[1]);
    const y = Number(parts[2]);
    return new Date(y, m - 1, d);
  };

  const parseDateLike = (s) => {
    if (dmy.test(s)) return parseDMY(s);
    return new Date(s);
  };

  return (Array.isArray(rows) ? rows : []).map(row =>
    (Array.isArray(row) ? row : []).map(v => {
      if (v instanceof Date) {
        return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
      }
      if (typeof v === 'string' && (ymd.test(v) || iso.test(v) || dmy.test(v))) {
        const d = parseDateLike(v);
        if (!isNaN(d)) {
          return Utilities.formatDate(d, tz, 'yyyy-MM-dd');
        }
      }
      return v;
    })
  );
}

/**
 * Get cached spreadsheet instance to avoid repeated openById calls
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(sheetId);
}

/**
 * Helper to get sheet data (excluding header row)
 */
function getSheetData(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  return sheet.getDataRange().getValues().slice(1);
}

function getSettings() {
  return getSheetData(settingsSheetName);
}

function getTraineeRegistrations() {
  return getSheetData(traineesSheetName);
}

function getCoachRegistrations() {
  return getSheetData(coachesSheetName);
}

function getSessions() {
  return getSheetData(sessionsSheetName);
}

function getCamps() {
  return normalizeDatesInArray(getSheetData(campsSheetName));
}

// ============================================
// COACH LOGIN FUNCTIONS
// ============================================

/**
 * Get all coach login records
 * Returns array of [id, firstName, lastName, alias, createdAt]
 * PIN is intentionally excluded for security
 */
function getCoachLogins() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(coachLoginSheetName);
  
  if (!sheet) {
    return [];
  }
  
  const data = sheet.getDataRange().getValues().slice(1); // Skip header
  // Return without PIN (column index 4)
  return data.map(row => [row[0], row[1], row[2], row[3], row[5]]);
}

/**
 * Get a map of coach names to their aliases
 * Returns { "FirstName LastName": "Alias" } for coaches who have an alias set
 */
function getCoachAliasMap() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(coachLoginSheetName);
  
  if (!sheet) {
    return {};
  }
  
  const data = sheet.getDataRange().getValues().slice(1); // Skip header
  const aliasMap = {};
  
  data.forEach(row => {
    const firstName = String(row[1] || '').trim();
    const lastName = String(row[2] || '').trim();
    const alias = String(row[3] || '').trim();
    
    if (firstName && lastName && alias) {
      const fullName = `${firstName} ${lastName}`;
      aliasMap[fullName] = alias;
    }
  });
  
  return aliasMap;
}

/**
 * Register a new coach login with PIN
 * @param {Object} holder - { firstName, lastName, alias, pin }
 * @returns {number|string} - ID of created record or 'exists' if already registered
 */
function registerCoachLogin(holder) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(coachLoginSheetName);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(coachLoginSheetName);
    sheet.getRange(1, 1, 1, 6).setValues([['id', 'firstName', 'lastName', 'alias', 'pin', 'createdAt']]);
    SpreadsheetApp.flush();
  }
  
  const firstName = (holder.firstName || '').trim();
  const lastName = (holder.lastName || '').trim();
  const alias = (holder.alias || '').trim();
  const pin = (holder.pin || '').toString();
  
  // Check if coach already exists
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1].toLowerCase() === firstName.toLowerCase() && 
        data[i][2].toLowerCase() === lastName.toLowerCase()) {
      return 'exists';
    }
  }
  
  // Check if PIN is already in use by another coach
  for (let i = 1; i < data.length; i++) {
    const existingPin = (data[i][4] || '').toString();
    if (existingPin === pin) {
      return 'pin_taken';
    }
  }
  
  // Generate new ID
  const lastRow = sheet.getLastRow();
  const newId = lastRow > 1 ? Math.max(...data.slice(1).map(r => r[0] || 0)) + 1 : 1;
  
  // Add new coach login
  const timestamp = new Date().toISOString();
  sheet.appendRow([newId, firstName, lastName, alias, pin, timestamp]);
  
  return newId;
}

/**
 * Verify coach PIN and return coach data
 * @param {Object} holder - { pin }
 * @returns {Object} - { result: 'success'|'error', coach: {...} | null, message: string }
 */
function verifyCoachPin(holder) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(coachLoginSheetName);
  
  if (!sheet) {
    return { result: 'error', coach: null, message: 'not_found' };
  }
  
  const pin = (holder.pin || '').toString();
  
  if (!pin) {
    return { result: 'error', coach: null, message: 'wrong_pin' };
  }
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const rowPin = (data[i][4] || '').toString();
    
    if (rowPin === pin) {
      return {
        result: 'success',
        coach: {
          id: data[i][0],
          firstName: data[i][1],
          lastName: data[i][2],
          alias: data[i][3] || ''
        },
        message: 'verified'
      };
    }
  }
  
  return { result: 'error', coach: null, message: 'wrong_pin' };
}

/**
 * Update coach login (alias or PIN)
 * @param {Object} holder - { id, alias?, pin? }
 * @returns {number} - ID of updated record
 */
function updateCoachLogin(holder) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(coachLoginSheetName);
  
  if (!sheet) {
    throw new Error('Coach login sheet not found');
  }
  
  const data = sheet.getDataRange().getValues();
  const id = Number(holder.id);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      if (holder.alias !== undefined) {
        sheet.getRange(i + 1, 4).setValue(holder.alias);
      }
      if (holder.pin !== undefined) {
        sheet.getRange(i + 1, 5).setValue(holder.pin.toString());
      }
      return id;
    }
  }
  
  throw new Error('Coach login not found');
}

/**
 * Delete coach login
 * @param {Object} holder - { id }
 * @returns {number} - ID of deleted record
 */
function deleteCoachLogin(holder) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(coachLoginSheetName);
  
  if (!sheet) {
    throw new Error('Coach login sheet not found');
  }
  
  const data = sheet.getDataRange().getValues();
  const id = Number(holder.id);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return id;
    }
  }
  
  throw new Error('Coach login not found');
}

// ============================================
// WEEKLY SCHEDULE & QUICK REGISTRATION
// ============================================

/**
 * Get Monday of the current week
 * @param {Date} date - Reference date
 * @returns {Date} - Monday of that week
 */
function getStartOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(d.setDate(diff));
}

/**
 * Get upcoming sessions for current and next week with registered coaches
 * Returns sessions with dates and their registered coaches
 * Only shows sessions where the course is currently active (within start/end dates)
 * @returns {Array} - Array of session objects
 */
function getUpcomingSessionsWithCoaches() {
  const ss = getSpreadsheet();
  const scheduleSheet = ss.getSheetByName(weeklyScheduleSheetName);
  const coachesSheet = ss.getSheetByName(coachesSheetName);
  const sessionsSheet = ss.getSheetByName(sessionsSheetName);
  
  if (!scheduleSheet) {
    return { error: 'Weekly schedule sheet not found. Please create a sheet named "weekly_schedule".' };
  }
  
  const scheduleData = scheduleSheet.getDataRange().getValues().slice(1); // Skip header
  let coachesData = coachesSheet ? coachesSheet.getDataRange().getValues().slice(1) : [];
  // Filter out rows where Realized (col 5) is not TRUE
  coachesData = coachesData.filter(row => {
    // If column missing, treat as TRUE
    if (row.length < 6) return true;
    const realized = row[5];
    return realized === true || realized === 'TRUE' || realized === 1 || realized === '';
  });
  const sessionsData = sessionsSheet ? sessionsSheet.getDataRange().getValues().slice(1) : [];
  const aliasMap = getCoachAliasMap();
  
  const tz = Session.getScriptTimeZone();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Build map of sessionType -> { startDate, endDate } from sessions sheet
  // Sessions schema: [ID, Course, Name, Start, End]
  const courseActivePeriods = {};
  sessionsData.forEach(row => {
    const name = String(row[2] || '').toUpperCase();
    const startDate = row[3];
    const endDate = row[4];
    if (name && startDate && endDate) {
      courseActivePeriods[name] = {
        start: startDate instanceof Date ? startDate : new Date(startDate),
        end: endDate instanceof Date ? endDate : new Date(endDate)
      };
    }
  });
  
  const sessions = [];
  const startOfWeek = getStartOfWeek(today);
  
  // Generate sessions for current week and next week (14 days)
  for (let weekOffset = 0; weekOffset < 2; weekOffset++) {
    for (let day = 0; day < 7; day++) {
      const sessionDate = new Date(startOfWeek);
      sessionDate.setDate(startOfWeek.getDate() + (weekOffset * 7) + day);
      
      // Skip past dates
      if (sessionDate < today) continue;
      
      const weekday = day; // 0=Mon, 1=Tue, ..., 6=Sun
      const dateStr = Utilities.formatDate(sessionDate, tz, 'yyyy-MM-dd');
      
      // Find scheduled sessions for this weekday
      scheduleData.forEach(row => {
        // Schema: [id, sessionType, weekday, startTime, endTime, location, active]
        const isActive = row[6] === true || row[6] === 'TRUE' || row[6] === 1;
        if (!isActive) return;
        
        // Parse weekday(s) - supports single value (1) or comma-separated (1,3)
        const weekdayValue = String(row[2] || '');
        const weekdays = weekdayValue.split(',').map(w => Number(w.trim()));
        if (!weekdays.includes(weekday)) return;
        
        const sessionType = String(row[1] || '').toUpperCase();
        
        // Check if course is active for this date (from sessions sheet)
        const activePeriod = courseActivePeriods[sessionType];
        if (activePeriod) {
          if (sessionDate < activePeriod.start || sessionDate > activePeriod.end) {
            return; // Course not active on this date
          }
        }
        
        // Format time values - Google Sheets stores times as Date objects
        let startTimeStr = '';
        let endTimeStr = '';
        const rawStartTime = row[3];
        const rawEndTime = row[4];
        
        if (rawStartTime instanceof Date) {
          startTimeStr = Utilities.formatDate(rawStartTime, tz, 'HH:mm');
        } else if (rawStartTime) {
          startTimeStr = String(rawStartTime);
        }
        
        if (rawEndTime instanceof Date) {
          endTimeStr = Utilities.formatDate(rawEndTime, tz, 'HH:mm');
        } else if (rawEndTime) {
          endTimeStr = String(rawEndTime);
        }
        
        const location = row[5] || '';
        
        // Find coaches registered for this session + date
        const registeredCoaches = coachesData
          .filter(coach => {
            const coachSession = String(coach[3] || '').toUpperCase();
            const coachDate = coach[4];
            let coachDateStr;
            if (coachDate instanceof Date) {
              coachDateStr = Utilities.formatDate(coachDate, tz, 'yyyy-MM-dd');
            } else {
              coachDateStr = String(coachDate || '');
            }
            return coachSession === sessionType && coachDateStr === dateStr;
          })
          .map(coach => {
            const fullName = `${coach[1]} ${coach[2]}`;
            return aliasMap[fullName] || fullName;
          });
        
        sessions.push({
          scheduleId: row[0],
          sessionType: sessionType,
          date: dateStr,
          weekday: weekday,
          startTime: startTimeStr,
          endTime: endTimeStr,
          location: String(location),
          coaches: registeredCoaches
        });
      });
    }
  }
  
  // Sort by date, then by start time
  sessions.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
  
  return sessions;
}

/**
 * Get coaches experience data
 * Returns array of [name, year1_exp, year2_exp, ...] with header row containing years
 */
function getCoachesExperience() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(coachesExperienceSheetName);
  
  if (!sheet) {
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  return data; // Include header row with years
}

/**
 * Update coaches experience sheet
 * - Adds new year column if needed
 * - Increments experience for active coaches (green background)
 * - Carries over experience for inactive coaches (no green)
 */
function updateCoachesExperience() {
  const ss = getSpreadsheet();
  const coachesSheet = ss.getSheetByName(coachesSheetName);
  let expSheet = ss.getSheetByName(coachesExperienceSheetName);
  
  // Create sheet if it doesn't exist
  if (!expSheet) {
    expSheet = ss.insertSheet(coachesExperienceSheetName);
    expSheet.getRange(1, 1).setValue("Nimi");
    SpreadsheetApp.flush();
  }
  
  const currentYear = new Date().getFullYear();
  
  // Get all coach registrations for current year
  const coachesData = coachesSheet.getDataRange().getValues().slice(1);
  const activeCoachesThisYear = new Set();
  
  coachesData.forEach(row => {
    const firstName = String(row[1]).trim();
    const lastName = String(row[2]).trim();
    const dateVal = row[4];
    
    if (!firstName || !lastName || !dateVal) return;
    
    const regDate = new Date(dateVal);
    const regYear = regDate.getFullYear();
    
    if (regYear === currentYear) {
      activeCoachesThisYear.add(`${firstName} ${lastName}`);
    }
  });
  
  // Re-read experience data fresh
  const expData = expSheet.getDataRange().getValues();
  const headerRow = expData[0] || ["Nimi"];
  
  // Find current year column (1-based for sheet operations)
  let yearCol = -1;
  for (let i = 0; i < headerRow.length; i++) {
    if (Number(headerRow[i]) === currentYear) {
      yearCol = i + 1; // Convert to 1-based
      break;
    }
  }
  
  // Add new year column if not found
  if (yearCol === -1) {
    yearCol = headerRow.length + 1;
    expSheet.getRange(1, yearCol).setValue(currentYear);
    SpreadsheetApp.flush();
  }
  
  // Find the last year column with data (for getting previous experience)
  let lastDataColIndex = 0; // 0-based index in data array
  for (let i = headerRow.length - 1; i >= 1; i--) {
    if (Number(headerRow[i]) > 0 && Number(headerRow[i]) < currentYear) {
      lastDataColIndex = i;
      break;
    }
  }
  
  // Build map of existing coaches with their row numbers and previous experience
  const existingCoaches = {};
  for (let i = 1; i < expData.length; i++) {
    const name = String(expData[i][0]).trim();
    if (name) {
      // Get previous experience from last data column
      let prevExp = 0;
      if (lastDataColIndex > 0 && expData[i][lastDataColIndex] !== undefined) {
        prevExp = Number(expData[i][lastDataColIndex]) || 0;
      }
      existingCoaches[name] = { rowNum: i + 1, prevExp: prevExp };
    }
  }
  
  // Process active coaches - increment experience
  const processedCoaches = new Set();
  
  activeCoachesThisYear.forEach(coachName => {
    processedCoaches.add(coachName);
    
    if (existingCoaches[coachName]) {
      const rowNum = existingCoaches[coachName].rowNum;
      const prevExp = existingCoaches[coachName].prevExp;
      const newExp = prevExp + 1;
      
      expSheet.getRange(rowNum, yearCol).setValue(newExp);
      expSheet.getRange(rowNum, yearCol).setBackground("#ccffcc");
    } else {
      // New coach - add to sheet
      const newRowNum = expSheet.getLastRow() + 1;
      expSheet.getRange(newRowNum, 1).setValue(coachName);
      expSheet.getRange(newRowNum, yearCol).setValue(1);
      expSheet.getRange(newRowNum, yearCol).setBackground("#ccffcc");
      existingCoaches[coachName] = { rowNum: newRowNum, prevExp: 0 };
    }
  });
  
  // Process inactive coaches - carry over previous experience (no green)
  for (const coachName in existingCoaches) {
    if (!processedCoaches.has(coachName)) {
      const rowNum = existingCoaches[coachName].rowNum;
      const prevExp = existingCoaches[coachName].prevExp;
      
      if (prevExp > 0) {
        expSheet.getRange(rowNum, yearCol).setValue(prevExp);
        // No green background for inactive year
      }
    }
  }
  
  // Style header row
  const lastCol = expSheet.getLastColumn();
  if (lastCol > 0) {
    expSheet.getRange(1, 1, 1, lastCol).setBackground("#e0e0e0").setFontWeight("bold");
  }
  
  SpreadsheetApp.flush();
  
  return "Experience updated for " + currentYear;
}

function addTrainee(holder) {
  const sheet = getSpreadsheet().getSheetByName(traineesSheetName);
  const formattedDates = formatDates(holder.dates);
  
  // Get the last ID from column A to ensure unique incrementing IDs
  const lastRow = sheet.getLastRow();
  let id = 1;
  if (lastRow > 1) {
    const lastId = sheet.getRange(lastRow, 1).getValue();
    id = (Number(lastId) || lastRow) + 1;
  }

  const row = [
    id,
    holder.firstName,
    holder.lastName,
    holder.ageGroup,
    holder.sessionName,
    ...formattedDates
  ];
  
  // Add age as last column if provided (for under-18)
  if (holder.age !== undefined && holder.age !== null) {
    row.push(holder.age);
  }
  
  sheet.appendRow(row);
  return id;
}

function addCoach(holder) {
  const sheet = getSpreadsheet().getSheetByName(coachesSheetName);
  const formattedDates = formatDates(holder.dates);
  
  // Get the last ID from column A to ensure unique incrementing IDs
  const lastRow = sheet.getLastRow();
  let id = 1;
  if (lastRow > 1) {
    const lastId = sheet.getRange(lastRow, 1).getValue();
    id = (Number(lastId) || lastRow) + 1;
  }

  sheet.appendRow([
    id,
    holder.firstName,
    holder.lastName,
    holder.sessionName,
    ...formattedDates
  ]);
  return id;
}

/**
 * Add a new camp
 * @param {Object} holder - Camp data object
 * @param {string} holder.name - Camp name (will be uppercased)
 * @param {string} holder.teacher - Teacher/coach name
 * @param {Array} holder.days - Array of {date: 'YYYY-MM-DD', sessions: number}
 */
function addCamp(holder) {
  const sheet = getSpreadsheet().getSheetByName(campsSheetName);
  
  // Get the last ID from column A to ensure unique incrementing IDs
  const lastRow = sheet.getLastRow();
  let id = 1;
  if (lastRow > 1) {
    const lastId = sheet.getRange(lastRow, 1).getValue();
    id = (Number(lastId) || lastRow) + 1;
  }
  
  // Build row: [id, "camp", NAME, teacher, date1, sessions1, date2, sessions2, ...]
  const row = [
    id,
    "camp",
    (holder.name || "").toUpperCase(),
    holder.teacher || ""
  ];
  
  // Add day/session pairs
  const days = holder.days || [];
  days.forEach(day => {
    if (day.date) {
      row.push(formatDates(day.date)[0]);
      row.push(Number(day.sessions) || 0);
    }
  });
  
  sheet.appendRow(row);
  return id;
}

/**
 * Update an existing camp
 * @param {Object} holder - Camp data object with id
 */
function updateCamp(holder) {
  const sheet = getSpreadsheet().getSheetByName(campsSheetName);
  const data = sheet.getDataRange().getValues();
  const targetId = Number(holder.id);
  
  // Build row data
  const row = [
    targetId,
    "camp",
    (holder.name || "").toUpperCase(),
    holder.teacher || ""
  ];
  
  // Add day/session pairs
  const days = holder.days || [];
  days.forEach(day => {
    if (day.date) {
      row.push(formatDates(day.date)[0]);
      row.push(Number(day.sessions) || 0);
    }
  });
  
  // Find the row with matching ID
  for (let i = 0; i < data.length; i++) {
    if (Number(data[i][0]) === targetId) {
      const rowIndex = i + 1; // Sheet rows are 1-based
      // Clear the entire row first (to handle variable number of day columns)
      const lastCol = sheet.getLastColumn();
      if (lastCol > 0) {
        sheet.getRange(rowIndex, 1, 1, lastCol).clearContent();
      }
      // Write new data
      sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
      return targetId;
    }
  }
  
  return 0; // Not found
}

/**
 * Delete a camp by ID
 * @param {Object} holder - Object containing id to delete
 */
function deleteCamp(holder) {
  const sheet = getSpreadsheet().getSheetByName(campsSheetName);
  const data = sheet.getDataRange().getValues();
  const targetId = Number(holder.id);
  
  // Find the row with matching ID
  for (let i = 0; i < data.length; i++) {
    if (Number(data[i][0]) === targetId) {
      const rowIndex = i + 1; // Sheet rows are 1-based
      sheet.deleteRow(rowIndex);
      return targetId;
    }
  }
  
  return 0; // Not found
}

/**
 * Add a new session
 * @param {Object} holder - Session data object
 * @param {string} holder.course - Course type (basic, advanced, fitness)
 * @param {string} holder.name - Session name (will be uppercased)
 * @param {string} holder.startDate - Start date YYYY-MM-DD
 * @param {string} holder.endDate - End date YYYY-MM-DD
 */
function addSession(holder) {
  const sheet = getSpreadsheet().getSheetByName(sessionsSheetName);
  
  // Get the last ID from column A to ensure unique incrementing IDs
  const lastRow = sheet.getLastRow();
  let id = 1;
  if (lastRow > 1) {
    const lastId = sheet.getRange(lastRow, 1).getValue();
    id = (Number(lastId) || lastRow) + 1;
  }
  
  const row = [
    id,
    holder.course || "",
    (holder.name || "").toUpperCase(),
    formatDates(holder.startDate)[0],
    formatDates(holder.endDate)[0]
  ];
  
  sheet.appendRow(row);
  return id;
}

/**
 * Update an existing session
 * @param {Object} holder - Session data object with id
 */
function updateSession(holder) {
  const sheet = getSpreadsheet().getSheetByName(sessionsSheetName);
  const data = sheet.getDataRange().getValues();
  const targetId = Number(holder.id);
  
  const row = [
    targetId,
    holder.course || "",
    (holder.name || "").toUpperCase(),
    formatDates(holder.startDate)[0],
    formatDates(holder.endDate)[0]
  ];
  
  // Find the row with matching ID
  for (let i = 0; i < data.length; i++) {
    if (Number(data[i][0]) === targetId) {
      const rowIndex = i + 1; // Sheet rows are 1-based
      sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
      return targetId;
    }
  }
  
  return 0; // Not found
}

/**
 * Delete a session by ID
 * @param {Object} holder - Object containing id to delete
 */
function deleteSession(holder) {
  const sheet = getSpreadsheet().getSheetByName(sessionsSheetName);
  const data = sheet.getDataRange().getValues();
  const targetId = Number(holder.id);
  
  // Find the row with matching ID
  for (let i = 0; i < data.length; i++) {
    if (Number(data[i][0]) === targetId) {
      const rowIndex = i + 1; // Sheet rows are 1-based
      sheet.deleteRow(rowIndex);
      return targetId;
    }
  }
  
  return 0; // Not found
}

function updateTrainee(holder) {
  const sheet = getSpreadsheet().getSheetByName(traineesSheetName);
  const data = sheet.getDataRange().getValues();
  const targetId = holder.id;
  const formattedDates = formatDates(holder.dates);
  const columnsToUpdate = [
    holder.id,
    holder.firstName,
    holder.lastName,
    holder.ageGroup,
    holder.sessionName,
    ...formattedDates    
  ];
  
  // Add age as last column if provided (for under-18)
  if (holder.age !== undefined && holder.age !== null) {
    columnsToUpdate.push(holder.age);
  }

  // Find the row where the id matches
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === targetId) { // Assuming 'id' is in column A (index 0)
      const rowIndex = i + 1;      // Sheet rows are 1-based
      sheet.getRange(rowIndex, 1, 1, columnsToUpdate.length).setValues([columnsToUpdate]);
      return holder.id;
    }
  }

  return 0;
}

function generateAllTraineesReports() {
  generateOver18_JATKO(); 
  generateOver18_KUNTO(); 
  generateOver18_PEKU(); 
  generateOver18_VAPAASPARRI(); 
  generateUnder18_JATKO(); 
  generateUnder18_KUNTO(); 
  generateUnder18_PEKU(); 
  generateUnder18_VAPAASPARRI();
}

function generateOver18_JATKO() { generateReport("JATKO", true); }
function generateOver18_KUNTO() { generateReport("KUNTO", true); }
function generateOver18_PEKU() { generateReport("PEKU", true); }
function generateOver18_VAPAASPARRI() { generateReport("VAPAA/SPARRI", true); }
function generateUnder18_JATKO() { generateReport("JATKO", false); }
function generateUnder18_KUNTO() { generateReport("KUNTO", false); }
function generateUnder18_PEKU() { generateReport("PEKU", false); }
function generateUnder18_VAPAASPARRI() { generateReport("VAPAA/SPARRI", false); }

// Camp report wrapper functions
function generateOver18_Camp() { generateCampReport(true); }
function generateUnder18_Camp() { generateCampReport(false); }

/**
 * Generate camp registration report
 * @param {boolean} isOver18 - true for 18+ vuotias, false for alle 18-vuotias
 */
function generateCampReport(isOver18) {
  const ss = SpreadsheetApp.getActive();
  const traineesSheet = ss.getSheetByName("trainees");
  const campsSheet = ss.getSheetByName(campsSheetName);
  
  const ageFilter = isOver18 ? "18+ vuotias" : "alle 18-vuotias";
  const sheetName = isOver18 ? "trainees_over_18_camp" : "trainees_under_18_camp";
  const targetSheet = ss.getSheetByName(sheetName);
  
  if (!targetSheet) {
    Logger.log("Target sheet not found: " + sheetName);
    return;
  }

  // 1. Get all camp names from camps sheet
  const campsLastRow = campsSheet.getLastRow();
  const campNames = new Set();
  if (campsLastRow > 1) {
    const campsData = campsSheet.getRange(2, 3, campsLastRow - 1, 1).getValues(); // Column C = camp name
    campsData.forEach(row => {
      const name = String(row[0]).trim().toUpperCase();
      if (name) campNames.add(name);
    });
  }

  // 2. Read trainees data - get more columns to include age (column 7+)
  const lastRow = traineesSheet.getLastRow();
  if (lastRow < 2) return;
  
  // Read up to column 10 to capture age data which may be after dates
  const maxCols = Math.min(traineesSheet.getLastColumn(), 20);
  const traineesData = traineesSheet.getRange(2, 1, lastRow - 1, maxCols).getValues();
  
  // 3. Filter trainees who registered for camp sessions
  // Camp sessions are named like "CAMPNAME SESSIO X"
  const filtered = traineesData.filter(r => {
    const ageGroup = String(r[3]).trim();
    const sessionName = String(r[4]).trim().toUpperCase();
    
    if (ageGroup !== ageFilter) return false;
    
    // Check if session name starts with any camp name
    for (const campName of campNames) {
      if (sessionName.startsWith(campName)) return true;
    }
    return false;
  });

  // 4. Extract camp name from session name (remove "SESSIO X" part)
  const extractCampName = (sessionName) => {
    const upper = String(sessionName).trim().toUpperCase();
    const match = upper.match(/^(.+?)\s+SESSIO\s+\d+$/);
    return match ? match[1] : upper;
  };

  // 5. Collect unique dates and build person data
  const dateSet = new Set();
  const personData = {}; // { "lastname firstname": { camp: "CAMPNAME", dates: Set, age: number|null } }
  
  filtered.forEach(r => {
    const firstName = String(r[1]).trim();
    const lastName = String(r[2]).trim();
    const sessionName = r[4];
    const dateVal = r[5];
    const age = r[6]; // Age column (if present, for under-18)
    
    const name = `${lastName} ${firstName}`;
    const campName = extractCampName(sessionName);
    const dateStr = normalizeDate(dateVal);
    
    if (dateStr) dateSet.add(dateStr);
    
    if (!personData[name]) {
      personData[name] = { camp: campName, dates: new Set(), age: null };
    }
    if (dateStr) personData[name].dates.add(dateStr);
    
    // Store age for under-18 (take the first non-empty age found)
    if (!isOver18 && age !== undefined && age !== null && age !== "" && personData[name].age === null) {
      personData[name].age = age;
    }
  });

  // 6. Sort dates and names
  const sortedDates = [...dateSet].sort();
  const parsedDates = sortedDates.map(d => new Date(d));
  const months = parsedDates.map(d => d.getMonth() + 1);
  const days = parsedDates.map(d => d.getDate());
  
  const sortedNames = Object.keys(personData).sort();

  // 7. Build output matrix
  // Row format: [name (age), camp, X, X, X, ...]
  const startRow = 7; // Data starts at row 7
  const outputData = sortedNames.map(name => {
    const data = personData[name];
    let displayName = name;
    
    // For under-18, add age in parenthesis
    if (!isOver18 && data.age !== null && data.age !== "") {
      displayName = `${name} (${data.age})`;
    }
    
    const row = [displayName, data.camp];
    sortedDates.forEach(dateStr => {
      row.push(data.dates.has(dateStr) ? "X" : "");
    });
    return row;
  });

  // 8. Clear old content (preserve rows 1, 2, 6)
  // Clear month row (row 4) from column C onwards
  targetSheet.getRange(4, 3, 1, 200).clearContent();
  // Clear day row (row 5) from column C onwards
  targetSheet.getRange(5, 3, 1, 200).clearContent();
  // Clear data rows (row 7+)
  const clearRows = Math.max(targetSheet.getLastRow() - startRow + 1, 1);
  targetSheet.getRange(startRow, 1, clearRows, 200).clearContent();

  // 9. Write statistics to B3 and E3
  targetSheet.getRange("B3").setValue(sortedNames.length); // harrastajia count
  targetSheet.getRange("E3").setValue(sortedDates.length);  // sessioita count

  // 10. Write month/day headers starting at column C
  if (months.length > 0) {
    targetSheet.getRange(4, 3, 1, months.length).setValues([months]); // C4 onwards
    targetSheet.getRange(5, 3, 1, days.length).setValues([days]);     // C5 onwards
  }

  // 11. Write data (row 7+)
  if (outputData.length > 0) {
    const numCols = outputData[0].length;
    targetSheet.getRange(startRow, 1, outputData.length, numCols).setValues(outputData);
  }
}


/**
 * Normalisoi päivämäärän muotoon YYYY-MM-DD
 */
function normalizeDate(d) {
  if (!(d instanceof Date)) d = new Date(d);
  return Utilities.formatDate(d, "Europe/Helsinki", "yyyy-MM-dd");
}

/**
 * Unified report generator for both over 18 and under 18 trainees
 * Optimized to batch all writes for better performance
 * @param {string} sessionType - session type, e.g. "JATKO" or "KUNTO"
 * @param {boolean} isOver18 - true for 18+ vuotias, false for alle 18-vuotias
 */
function generateReport(sessionType, isOver18) {
  const ss = SpreadsheetApp.getActive();
  const traineesSheet = ss.getSheetByName("trainees");
  const agePrefix = isOver18 ? "over" : "under";
  const ageFilter = isOver18 ? "18+ vuotias" : "alle 18-vuotias";
  const sheetName = `trainees_${agePrefix}_18_${sessionType.toLowerCase()}`.replace(/\//g, "");
  const targetSheet = ss.getSheetByName(sheetName);

  // 1. Read and filter trainees data
  const lastRow = traineesSheet.getLastRow();
  if (lastRow < 2) return;
  
  const traineesData = traineesSheet.getRange(2, 1, lastRow - 1, 6).getValues();
  const filtered = traineesData.filter(r => 
    String(r[3]).trim() === ageFilter && 
    String(r[4]).trim() === sessionType
  );

  // 2. Calculate statistics
  const uniqueNames = [...new Set(filtered.map(r => r[2] + " " + r[1]))].sort();

  // 3. Process dates - collect unique dates only from filtered data
  const dateSet = new Set();
  filtered.forEach(r => {
    const dateStr = normalizeDate(r[5]);
    if (dateStr) dateSet.add(dateStr);
  });
  
  // Convert to sorted array of date strings
  const parsedDateStrings = [...dateSet].sort();
  const parsedDates = parsedDateStrings.map(d => new Date(d));
  
  const months = parsedDates.map(d => d.getMonth() + 1);
  const days = parsedDates.map(d => d.getDate());

  // 4. Build person-dates map
  const personDates = {};
  filtered.forEach(r => {
    const name = r[2] + " " + r[1];
    const dateStr = normalizeDate(r[5]);
    if (!personDates[name]) personDates[name] = new Set();
    if (dateStr) personDates[name].add(dateStr);
  });

  // 5. Build output data matrix (names + X marks) for batch write
  const startRow = 6;
  const numCols = Math.max(parsedDateStrings.length + 1, 1);
  const outputData = uniqueNames.map(name => {
    const row = [name];
    const dates = personDates[name] || new Set();
    parsedDateStrings.forEach(dateStr => {
      row.push(dates.has(dateStr) ? "X" : "");
    });
    return row;
  });

  // 6. Clear old content - include header rows for months/days
  targetSheet.getRange(4, 2, 1, 200).clearContent(); // Clear month row
  targetSheet.getRange(5, 2, 1, 200).clearContent(); // Clear day row
  const clearRows = Math.max(targetSheet.getLastRow() - startRow + 1, 1);
  targetSheet.getRange(startRow, 1, clearRows, 200).clearContent();

  // 7. Batch write all data
  targetSheet.getRange("C3").setValue(uniqueNames.length);
  targetSheet.getRange("F3").setValue(parsedDateStrings.length); // Number of unique session dates

  if (months.length > 0) {
    targetSheet.getRange(4, 2, 1, months.length).setValues([months]);
    targetSheet.getRange(5, 2, 1, days.length).setValues([days]);
  }

  if (outputData.length > 0) {
    targetSheet.getRange(startRow, 1, outputData.length, numCols).setValues(outputData);
  }
}

function generateCoachMonthlyStats() {
  const ss = SpreadsheetApp.getActive();
  const coachesSheet = ss.getSheetByName("coaches");
  const targetSheet = ss.getSheetByName("coaches_data");

  // Tyhjennetään vanha sisältö
  targetSheet.clear();

  // Otsikkorivi: Coach | Total | 1 | 2 | ... | 12
  const header = ["Coach", "Total"];
  for (let m = 1; m <= 12; m++) header.push(m);
  targetSheet.getRange(1, 1, 1, header.length).setValues([header]);

  // Load coach aliases from coach_login sheet
  const aliasMap = getCoachAliasMap();

  // Luetaan coaches-data
  const data = coachesSheet.getDataRange().getValues().slice(1);
  // Filter out rows where Realized (col 5) is not TRUE
  const filteredData = data.filter(row => {
    // If column missing, treat as TRUE
    if (row.length < 6) return true;
    const realized = row[5];
    return realized === true || realized === 'TRUE' || realized === 1 || realized === '';
  });

  // Map: { "Etunimi Sukunimi": { total: X, 1: count, 2: count, ... } }
  const coachMap = {};

  filteredData.forEach(row => {
    const first = row[1];
    const last = row[2];
    const date = row[4];

    if (!first || !last || !date) return;

    const name = `${first} ${last}`;
    const month = new Date(date).getMonth() + 1;

    if (!coachMap[name]) {
      coachMap[name] = { total: 0 };
      for (let m = 1; m <= 12; m++) coachMap[name][m] = 0;
    }

    coachMap[name][month]++;
    coachMap[name].total++;
  });

  // Muodostetaan taulukko
  const rows = [];
  const sortedNames = Object.keys(coachMap).sort();

  sortedNames.forEach(name => {
    // Use alias if available, otherwise use full name
    const displayName = aliasMap[name] || name;
    const row = [displayName, coachMap[name].total];
    for (let m = 1; m <= 12; m++) {
      row.push(coachMap[name][m]);
    }
    rows.push(row);
  });

  // Kirjoitetaan taulukko
  if (rows.length > 0) {
    targetSheet.getRange(2, 1, rows.length, header.length).setValues(rows);
  }

  // ------------------------------------------------------------
  // LISÄTÄÄN YHTEENVETORIVI ALLE
  // ------------------------------------------------------------

  const summaryRow = ["TOTAL"];

  // Lasketaan Total-sarake (kaikki valmentajat)
  let totalOfTotals = 0;
  sortedNames.forEach(name => {
    totalOfTotals += coachMap[name].total;
  });
  summaryRow.push(totalOfTotals);

  // Lasketaan kuukausisummat
  for (let m = 1; m <= 12; m++) {
    let monthSum = 0;
    sortedNames.forEach(name => {
      monthSum += coachMap[name][m];
    });
    summaryRow.push(monthSum);
  }

  // Kirjoitetaan yhteenvetorivi taulukon alle
  const summaryRowIndex = rows.length + 2;
  targetSheet.getRange(summaryRowIndex, 1, 1, summaryRow.length).setValues([summaryRow]);

  // ------------------------------------------------------------
  // VÄRIKOODAUS
  // ------------------------------------------------------------

  const lastRow = summaryRowIndex;
  const lastCol = header.length;

  // 1) Otsikkorivi harmaaksi
  targetSheet.getRange(1, 1, 1, lastCol).setBackground("#e0e0e0");

  // 2) Yhteenvetorivi harmaaksi
  targetSheet.getRange(lastRow, 1, 1, lastCol).setBackground("#e0e0e0");

  // 3) Solujen värikoodaus (punainen = 0, vihreä = >0)
  const dataRange = targetSheet.getRange(2, 2, lastRow - 2, lastCol - 1);
  const values = dataRange.getValues();
  const backgrounds = [];

  values.forEach(row => {
    const bgRow = row.map(value => {
      if (typeof value === "number" && value > 0) {
        return "#ccffcc"; // vaalean vihreä
      } else if (typeof value === "number" && value === 0) {
        return "#ffcccc"; // hailakka punainen
      } else {
        return "white"; // nimi-sarake
      }
    });
    backgrounds.push(bgRow);
  });

  dataRange.setBackgrounds(backgrounds);

  // ------------------------------------------------------------------------
  // LUODAAN AUTOMAATTINEN BAR CHART (ilman B-saraketta ja ilman TOTAL-riviä)
  // ------------------------------------------------------------------------

  // Poistetaan vanhat kaaviot
  const charts = targetSheet.getCharts();
  charts.forEach(chart => targetSheet.removeChart(chart));

  // Selvitetään aktiiviset kuukaudet (kuukaudet joissa yhteenvetorivin arvo > 0)
  const activeMonths = [];
  for (let col = 3; col <= lastCol; col++) { // sarakkeet 3–14 = kuukaudet 1–12
    const value = targetSheet.getRange(lastRow, col).getValue();
    if (value > 0) activeMonths.push(col);
  }

  if (activeMonths.length === 0) return;

  // Kuukausien nimet
  const monthNames = [
    "", "Tammi", "Helmi", "Maalis", "Huhti", "Touko", "Kesä",
    "Heinä", "Elo", "Syys", "Loka", "Marras", "Joulu"
  ];

  // Rakennetaan datan alue kaaviolle:
  // - Sarake 1 = Coach
  // - Sarakkeet activeMonths = vain aktiiviset kuukaudet
  // - EI saraketta 2 (Total)
  // - EI viimeistä riviä (TOTAL)
  const ranges = [
    targetSheet.getRange(1, 1, lastRow - 1, 1) // Coach-nimet
  ];

  activeMonths.forEach(col => {
    ranges.push(targetSheet.getRange(1, col, lastRow - 1, 1));
  });

  // Luodaan bar chart (vaakasuora pylväskaavio)
  let chartBuilder = targetSheet.newChart()
    .asBarChart()
    .setChartType(Charts.ChartType.BAR)
    .setOption("title", "Valmentajien kuukausittaiset treenimäärät (aktiiviset kuukaudet)")
    .setOption("legend", { position: "top" })
    .setOption("isStacked", false)
    .setOption("hAxis", { title: "Treenimäärä" })
    .setOption("vAxis", { title: "Valmentaja" });

  // Lisätään datarange-alueet kaavioon
  ranges.forEach((r, index) => {
    chartBuilder.addRange(r);

    // Ensimmäinen sarja on Coach-nimet → ei labelia
    if (index >= 1) {
      const monthIndex = activeMonths[index - 1] - 2; // sarake 3 = kuukausi 1
      chartBuilder.setOption(`series.${index - 1}.labelInLegend`, monthNames[monthIndex]);
    }
  });

  // Automaattinen koon säätö
  const chartHeight = Math.max(300, sortedNames.length * 40);
  const chartWidth = Math.max(600, activeMonths.length * 120);

  chartBuilder = chartBuilder
    .setOption("width", chartWidth)
    .setOption("height", chartHeight)
    .setPosition(lastRow + 2, 1, 0, 0);

  // Lisätään kaavio
  targetSheet.insertChart(chartBuilder.build());

}
