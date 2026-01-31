const sheetId = "1syi5ytWjxheM7PWzW40MxTPaHSUUxLUsSYTaNRFrlMQ";
const settingsSheetName = "settings";
const traineesSheetName = "trainees";
const coachesSheetName = "coaches";
const sessionsSheetName = "sessions";
const campsSheetName = "camps";

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

function addTrainee(holder) {
  const sheet = getSpreadsheet().getSheetByName(traineesSheetName);
  const id = sheet.getLastRow() + 1;
  const formattedDates = formatDates(holder.dates);

  sheet.appendRow([
    id,
    holder.firstName,
    holder.lastName,
    holder.ageGroup,
    holder.sessionName,
    ...formattedDates
  ]);
  return id;
}

function addCoach(holder) {
  const sheet = getSpreadsheet().getSheetByName(coachesSheetName);
  const id = sheet.getLastRow() + 1;
  const formattedDates = formatDates(holder.dates);

  sheet.appendRow([
    id,
    holder.firstName,
    holder.lastName,
    holder.sessionName,
    ...formattedDates
  ]);
  return id;
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

function generateOver18_JATKO() { generateReport("JATKO", true); }
function generateOver18_KUNTO() { generateReport("KUNTO", true); }
function generateOver18_PEKU() { generateReport("PEKU", true); }
function generateOver18_VAPAASPARRI() { generateReport("VAPAA/SPARRI", true); }
function generateUnder18_JATKO() { generateReport("JATKO", false); }
function generateUnder18_KUNTO() { generateReport("KUNTO", false); }
function generateUnder18_PEKU() { generateReport("PEKU", false); }
function generateUnder18_VAPAASPARRI() { generateReport("VAPAA/SPARRI", false); }
function generateUnder18_LEIRI() { generateReport("LEIRI", false); }


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
  const filtered = traineesData.filter(r => r[3] === ageFilter && r[4] === sessionType);

  // 2. Calculate statistics
  const uniqueNames = [...new Set(filtered.map(r => r[2] + " " + r[1]))].sort();
  const totalRows = filtered.length;

  // 3. Process dates
  const traineeDates = filtered.map(r => normalizeDate(r[5])).filter(Boolean);
  const parsedDates = [...new Set(traineeDates)]
    .map(d => new Date(d))
    .sort((a, b) => a - b);
  
  const months = parsedDates.map(d => d.getMonth() + 1);
  const days = parsedDates.map(d => d.getDate());
  const parsedDateStrings = parsedDates.map(d => normalizeDate(d));

  // 4. Build person-dates map
  const personDates = {};
  filtered.forEach(r => {
    const name = r[2] + " " + r[1];
    const dateStr = normalizeDate(r[5]);
    if (!personDates[name]) personDates[name] = [];
    personDates[name].push(dateStr);
  });

  // 5. Build output data matrix (names + X marks) for batch write
  const startRow = 6;
  const numCols = Math.max(parsedDateStrings.length + 1, 1);
  const outputData = uniqueNames.map(name => {
    const row = [name];
    const dates = personDates[name] || [];
    parsedDateStrings.forEach(dateStr => {
      row.push(dates.includes(dateStr) ? "X" : "");
    });
    return row;
  });

  // 6. Clear old content once
  const clearRows = Math.max(targetSheet.getLastRow() - startRow + 1, 1);
  targetSheet.getRange(startRow, 1, clearRows, 200).clearContent();

  // 7. Batch write all data
  targetSheet.getRange("C3").setValue(uniqueNames.length);
  targetSheet.getRange("F3").setValue(totalRows);

  if (months.length > 0) {
    targetSheet.getRange(4, 2, 1, months.length).setValues([months]);
    targetSheet.getRange(5, 2, 1, days.length).setValues([days]);
  }

  if (outputData.length > 0) {
    targetSheet.getRange(startRow, 1, outputData.length, numCols).setValues(outputData);
  }
}
