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

function getSettings() {
  var ss = SpreadsheetApp.openById(sheetId);
  var sheet = ss.getSheetByName(settingsSheetName);
  var rows = sheet.getDataRange().getValues();
  Logger.log(rows);
  var settings = rows.slice(1);
  Logger.log(settings);
  return settings;  
}

function getTraineeRegistrations() {
  var ss = SpreadsheetApp.openById(sheetId);
  var sheet = ss.getSheetByName(traineesSheetName);
  var rows = sheet.getDataRange().getValues();
  Logger.log(rows);
  var registrations = rows.slice(1);
  Logger.log(registrations);
  return registrations;
}

function getCoachRegistrations() {
  var ss = SpreadsheetApp.openById(sheetId);
  var sheet = ss.getSheetByName(coachesSheetName);
  var rows = sheet.getDataRange().getValues();
  Logger.log(rows);
  var registrations = rows.slice(1);
  Logger.log(registrations);
  return registrations;
}

function getSessions() {
  var ss = SpreadsheetApp.openById(sheetId);
  var sheet = ss.getSheetByName(sessionsSheetName);
  var rows = sheet.getDataRange().getValues();
  Logger.log(rows);  
  var sessions = rows.slice(1);
  return sessions;
}

function getCamps() {
  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheetByName(campsSheetName);
  const rows = sheet.getDataRange().getValues();
  const camps = rows.slice(1);
  return normalizeDatesInArray(camps);
}

function addTrainee(holder) {
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(traineesSheetName);
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
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(coachesSheetName);
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
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(traineesSheetName);
  const data = sheet.getDataRange().getValues(); // Get all data
  const targetId = holder.id;              // The id you're looking for
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