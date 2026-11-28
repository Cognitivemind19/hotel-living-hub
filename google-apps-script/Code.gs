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
 *
 * The website's Reviews page reads the newest reviews back through doGet. To
 * take a review off the website, type anything in its "Hide" column.
 */

const TABS = {
  Contact: ['name', 'phone', 'message'],
  Booking: ['name', 'phone', 'email', 'check_in', 'check_out', 'room', 'guests', 'message'],
  Corporate: ['company', 'name', 'phone', 'email', 'rooms_needed', 'message'],
  Restaurant: ['name', 'phone', 'email', 'date', 'time', 'guests', 'occasion', 'message'],
  Banquet: ['name', 'phone', 'email', 'organisation', 'event_type', 'date', 'session', 'guests', 'catering', 'rooms_needed', 'message'],
  Order: ['name', 'phone', 'address', 'landmark', 'when', 'payment', 'order', 'subtotal', 'discount', 'total', 'message'],
  Review: ['name', 'rating', 'visit', 'message', 'phone', 'hide'],
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
  date: 'Date',
  time: 'Time',
  occasion: 'Occasion',
  organisation: 'Organisation',
  event_type: 'Event type',
  session: 'Session',
  catering: 'Catering',
  address: 'Delivery address',
  landmark: 'Landmark',
  when: 'Delivery time',
  payment: 'Payment',
  order: 'Order',
  subtotal: 'Subtotal',
  discount: 'Web discount',
  total: 'Total',
  rating: 'Rating',
  visit: 'Visited for',
  message: 'Message',
  hide: 'Hide',
};

const TIME_HEADER = 'Date & time';
const TIME_ZONE = 'Asia/Kolkata';
const MAX_LENGTH = 5000;
const MAX_FIELDS = 30;
const MAX_REVIEWS = 20;
const REVIEWS_CACHE_KEY = 'reviews';

function doPost(e) {
  const params = (e && e.parameter) || {};
  const tab = params._sheet;
  if (!Object.prototype.hasOwnProperty.call(TABS, tab) || params.botcheck) return reply('ignored');

  const fields = Object.keys(params)
    .filter((key) => !key.startsWith('_') && key !== 'botcheck' && key !== 'hide' && /^[a-z0-9_]{1,40}$/i.test(key))
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
    if (tab === 'Review') CacheService.getScriptCache().remove(REVIEWS_CACHE_KEY);
    return reply('ok');
  } finally {
    lock.releaseLock();
  }
}

// GET ?reviews=1 returns the newest reviews for the website (never the guest's phone or email).
function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.reviews !== '1') return reply('ignored');

  const cache = CacheService.getScriptCache();
  let json = cache.get(REVIEWS_CACHE_KEY);
  if (!json) {
    json = JSON.stringify({ result: 'ok', reviews: readReviews() });
    cache.put(REVIEWS_CACHE_KEY, json, 300);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function readReviews() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Review');
  if (!sheet || sheet.getLastRow() < 2) return [];
  const rows = sheet.getDataRange().getValues();
  const col = (label) => rows[0].indexOf(label);
  const c = { time: col(TIME_HEADER), name: col(LABELS.name), rating: col(LABELS.rating), visit: col(LABELS.visit), quote: col(LABELS.message), hide: col(LABELS.hide) };
  const get = (row, i) => (i === -1 ? '' : String(row[i]).trim());
  // Sheets may turn the timestamp text into a Date; either way return yyyy-MM-dd.
  const day = (v) => (v instanceof Date ? Utilities.formatDate(v, TIME_ZONE, 'yyyy-MM-dd') : String(v).slice(0, 10));

  const reviews = [];
  for (let r = rows.length - 1; r >= 1 && reviews.length < MAX_REVIEWS; r--) {
    const row = rows[r];
    const name = get(row, c.name);
    const quote = get(row, c.quote);
    if (!name || !quote || get(row, c.hide)) continue;
    const rating = Math.round(Number(get(row, c.rating)));
    reviews.push({
      name: name.slice(0, 60),
      quote: quote.slice(0, 1000),
      rating: rating >= 1 && rating <= 5 ? rating : undefined,
      visit: get(row, c.visit).slice(0, 60),
      date: c.time === -1 ? '' : day(row[c.time]),
    });
  }
  return reviews;
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
