/**
 * Shri Govardhan Goshala — donation intake.
 *
 * Paste this into the Apps Script editor bound to the donations spreadsheet,
 * then Deploy → New deployment → Web app:
 *   Execute as:    Me
 *   Who has access: Anyone
 *
 * "Anyone" is unavoidable for a public site, so the endpoint defends itself:
 *   - a shared token that only the Cloudflare Function knows
 *   - a field allow-list, so unexpected keys are never written
 *   - an append-only sheet with a fixed column order
 *
 * IMPORTANT: deploy this as a NEW deployment with a NEW URL. The old
 * /exec URL has been public in client-side JavaScript and should be
 * treated as burned — disable it once the new one is live.
 *
 * Set the shared token once, in the editor:
 *   Project Settings → Script Properties → SHARED_TOKEN = <long random string>
 * The same value goes into Cloudflare as APPS_SCRIPT_TOKEN.
 */

var SHEET_INTENTS = 'Donations';
var SHEET_LOG = 'Log';

/* Column order matches what Form 10BD needs, so the sheet can be filtered
   and exported for the statement of donations without rearranging. */
var COLUMNS = [
  'receivedAt', 'ref', 'status', 'cause', 'causeTitle', 'amount',
  'name', 'phone', 'email',
  'idType', 'idNumber', 'address',
  'utr', 'verifiedAt', 'country', 'ua',
];

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    var expected = PropertiesService.getScriptProperties().getProperty('SHARED_TOKEN');
    if (!expected || body.token !== expected) {
      return reply({ error: 'unauthorised' });
    }

    var sheet = getSheet();

    if (body.kind === 'confirm') {
      var updated = markClaimed(sheet, body.ref, body.utr);
      if (updated) notifyConfirm(body);
      return reply({ ok: true, updated: updated });
    }

    appendIntent(sheet, body);
    notifyIntent(body);
    return reply({ ok: true });
  } catch (err) {
    log('ERROR ' + err);
    return reply({ error: 'server' });
  }
}

/** No data is ever served over GET. */
function doGet() {
  return reply({ error: 'method not allowed' });
}

// ---------------------------------------------------------------- helpers

function reply(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_INTENTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_INTENTS);
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function appendIntent(sheet, b) {
  var row = COLUMNS.map(function (c) {
    switch (c) {
      case 'status': return 'pending';
      case 'utr':
      case 'verifiedAt': return '';
      // Leading apostrophe keeps Sheets from turning a 12-digit Aadhaar
      // into scientific notation or stripping a leading zero.
      case 'idNumber': return b.idNumber ? "'" + b.idNumber : '';
      case 'phone':    return b.phone ? "'" + b.phone : '';
      default: return b[c] === undefined || b[c] === null ? '' : b[c];
    }
  });
  sheet.appendRow(row);
}

/** Find the row by reference and record the donor's claimed UTR. */
function markClaimed(sheet, ref, utr) {
  var refCol = COLUMNS.indexOf('ref') + 1;
  var values = sheet.getRange(2, refCol, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(ref)) {
      var r = i + 2;
      sheet.getRange(r, COLUMNS.indexOf('status') + 1).setValue(utr ? 'claimed' : 'awaiting-utr');
      if (utr) sheet.getRange(r, COLUMNS.indexOf('utr') + 1).setValue("'" + utr);
      return true;
    }
  }
  return false;
}

function money(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

// ---------------------------------------------------------------- email

/**
 * MailApp on a consumer Google account allows ~100 recipients/day, which is
 * comfortably above this site's volume. Each submission sends at most two:
 * one to the goshala, one acknowledgement to the donor.
 */
function notifyIntent(b) {
  var subject = 'New donation — ' + money(b.amount) + ' · ' + (b.causeTitle || b.cause);

  var lines = [
    'Reference:  ' + b.ref,
    'Cause:      ' + (b.causeTitle || b.cause),
    'Amount:     ' + money(b.amount),
    '',
    'Name:       ' + b.name,
    'Phone:      ' + b.phone,
    'Email:      ' + b.email,
    '',
    b.idType + ':' + (b.idType === 'PAN' ? '        ' : '    ') + b.idNumber,
    'Address:    ' + b.address,
  ];
  if (b.idType === 'AADHAAR') {
    lines.push('', 'NOTE: Aadhaar only — this donor cannot claim 80G in their');
    lines.push('return without a PAN. Ask for one if they want the deduction.');
  }
  lines.push('', 'Status: PENDING — payment not yet confirmed.', 'Received: ' + b.receivedAt);

  MailApp.sendEmail({
    to: b.notify,
    subject: subject,
    body: lines.join('\n'),
    name: 'Shri Govardhan Goshala',
  });

  // Donor acknowledgement. Deliberately does NOT say the payment succeeded
  // or that a receipt has been issued — neither is known at this point.
  if (b.email) {
    MailApp.sendEmail({
      to: b.email,
      subject: 'We have your details — reference ' + b.ref,
      name: 'Shri Govardhan Goshala',
      body: [
        'Namaskara ' + b.name + ',',
        '',
        'Thank you for choosing to support the goshala.',
        '',
        'Cause:     ' + (b.causeTitle || b.cause),
        'Amount:    ' + money(b.amount),
        'Reference: ' + b.ref,
        '',
        'This reference will appear on your bank statement. Please keep it —',
        'quote it if you need to write to us about this donation.',
        '',
        'Once we have matched your payment against our bank statement we will',
        'send you an acknowledgement, and your 80G certificate will follow.',
        '',
        'Shri Govardhan [R] Goshala',
        'Karadolli, Yellapur, Uttara Kannada',
      ].join('\n'),
    });
  }
}

function notifyConfirm(b) {
  MailApp.sendEmail({
    to: b.notify,
    subject: 'Payment claimed — ' + b.ref,
    name: 'Shri Govardhan Goshala',
    body: [
      'The donor says they have completed this payment.',
      '',
      'Reference: ' + b.ref,
      'UTR:       ' + (b.utr || '(not provided)'),
      '',
      'Match this against the bank statement, then set the row status to',
      '"verified" and fill verifiedAt.',
    ].join('\n'),
  });
}

function log(msg) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var s = ss.getSheetByName(SHEET_LOG) || ss.insertSheet(SHEET_LOG);
    s.appendRow([new Date(), msg]);
  } catch (e) {}
}
