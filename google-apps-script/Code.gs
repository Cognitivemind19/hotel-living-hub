/**
 * Hotel Living Hub - saves website form messages into this Google Sheet.
 *
 * Setup (once): open the Google Sheet → Extensions → Apps Script, replace the
 * code with this file, then Deploy → New deployment → Web app, with
 * "Execute as: Me" and "Who has access: Anyone". Put the Web app URL in
 * src/data/site.json as "sheetsWebAppUrl".
 *
 * Each form gets its own tab (created automatically with a header row). New
 * form fields become new columns automatically.
 */

const TABS = {
  Contact: ['name', 'phone', 'message'],
  Booking: ['name', 'phone', 'email', 'check_in', 'check_out', 'room', 'guests', 'message'],
  Corporate: ['company', 'name', 'phone', 'email', 'rooms_needed', 'message'],
};

const LABELS = {
  name: 'Name',
  phone: 'Phone',
  email: 'Email',
  company: 'Company',
  check_in: 'Check-in',
  check_out: 'Check-out',
  room: 'Room',
  guests: 'Guests',
  rooms_needed: 'Rooms needed',
  message: 'Message',
};

const TIME_HEADER = 'Date & time';
const TIME_ZONE = 'Asia/Kolkata';
const MAX_LENGTH = 5000;
const MAX_FIELDS = 30;

function doPost(e) {
  const params = (e && e.parameter) || {};
  const tab = params._sheet;
  if (!Object.prototype.hasOwnProperty.call(TABS, tab) || params.botcheck) return reply('ignored');

  const fields = Object.keys(params)
    .filter((key) => !key.startsWith('_') && key !== 'botcheck' && /^[a-z0-9_]{1,40}$/i.test(key))
    .slice(0, MAX_FIELDS);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet(tab);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    const values = {};
    values[TIME_HEADER] = Utilities.formatDate(new Date(), TIME_ZONE, 'yyyy-MM-dd HH:mm');
    fields.forEach((key) => {
      const label = LABELS[key] || key;
      values[label] = clean(params[key]);
      if (headers.indexOf(label) === -1) {
        headers.push(label);
        sheet.getRange(1, headers.length).setValue(label).setFontWeight('bold');
      }
    });

    sheet.appendRow(headers.map((header) => (header in values ? values[header] : '')));
    return reply('ok');
  } finally {
    lock.releaseLock();
  }
}

function getSheet(tab) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(tab);
  if (!sheet) sheet = spreadsheet.insertSheet(tab);
  if (sheet.getLastRow() === 0) {
    const headers = [TIME_HEADER].concat(TABS[tab].map((key) => LABELS[key] || key));
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Keeps text as text: stops values such as "+91 98..." or "=..." being read as formulas.
function clean(value) {
  const text = String(value == null ? '' : value).trim().slice(0, MAX_LENGTH);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply(result) {
  return ContentService.createTextOutput(JSON.stringify({ result: result })).setMimeType(ContentService.MimeType.JSON);
}
