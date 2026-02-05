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

/**
 * Add a new camp
 * @param {Object} holder - Camp data object
 * @param {string} holder.name - Camp name (will be uppercased)
 * @param {string} holder.teacher - Teacher/coach name
 * @param {Array} holder.days - Array of {date: 'YYYY-MM-DD', sessions: number}
 */
function addCamp(holder) {
  const sheet = getSpreadsheet().getSheetByName(campsSheetName);
  const id = sheet.getLastRow() + 1;
  
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
  const id = sheet.getLastRow() + 1;
  
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

  // Luetaan coaches-data
  const data = coachesSheet.getRange(
    2, 1, coachesSheet.getLastRow() - 1, 5
  ).getValues();

  // Map: { "Etunimi Sukunimi": { total: X, 1: count, 2: count, ... } }
  const coachMap = {};

  data.forEach(row => {
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
    const row = [name, coachMap[name].total];
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
