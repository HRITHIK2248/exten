# Payment QR Tool

Payment QR Tool is a Firefox browser extension that scans QR codes from webpages and extracts payment, wallet, website, email, phone, SMS, contact, and calendar information.

The extension also includes Snapshot mode. It allows you to select part of a webpage, capture the selected area, and detect visible email addresses, phone numbers, URLs, and possible postal addresses.

## Features

- Scan QR codes from the current webpage.
- Scan QR codes from a selected webpage area.
- Highlight detected QR codes in screenshots.
- Create a QR-only image crop.
- Copy the highlighted screenshot.
- Copy the QR-only image.
- Copy the raw decoded QR payload.
- Extract UPI payment information.
- Extract Pix payment information.
- Extract QRIS merchant information.
- Detect cryptocurrency wallet addresses and payment links.
- Detect HTTP and HTTPS website QR codes.
- Detect `mailto:` email QR codes.
- Detect MATMSG email QR codes.
- Detect `tel:` phone QR codes.
- Detect `sms:` and `SMSTO:` SMS QR codes.
- Format and structurally validate phone numbers.
- Identify phone-number countries and calling codes.
- Detect vCard contact QR codes.
- Detect MECARD contact QR codes.
- Detect calendar event QR codes.
- Display and copy individual decoded values.
- Select a webpage area using Snapshot mode.
- Detect emails, phone numbers, URLs, and possible addresses from Snapshot text.
- Configure screenshot border spacing, border thickness, arrow size, and arrow placement.

## Supported QR Information

### UPI

The extension supports UPI payment links such as:

```text
upi://pay?pa=example@upi&pn=Example
```

It can display:

- UPI ID.
- Payee name.
- Amount.
- Currency.
- Payment note.
- A phone number when an Indian mobile number can be extracted from the UPI ID.

### Pix

The extension supports Brazilian Pix QR payloads.

It can display:

- Pix key.
- Merchant name.
- Merchant city.
- Amount.
- Currency.
- Country.
- Transaction ID.

### QRIS

The extension supports Indonesian QRIS merchant payloads.

It can display:

- Merchant name.
- National Merchant ID.
- Merchant city.
- Amount.
- Currency.
- Country.
- Merchant account ID.
- Merchant criteria.

### Cryptocurrency

The extension can identify supported cryptocurrency addresses and payment links for:

- Bitcoin.
- Ethereum and EVM-compatible networks.
- Solana.
- Litecoin.
- Dogecoin.
- Bitcoin Cash.
- Monero.
- TRON.
- XRP.
- Stellar.
- Cardano.

The extension does not perform cryptocurrency transactions. It only extracts, displays, and copies wallet or payment information.

Bitcoin Lightning invoices are identified separately and are not treated as reusable wallet addresses.

### Website QR Codes

The extension supports QR codes containing HTTP or HTTPS website URLs.

Example:

```text
https://example.com/payment/order123?amount=500
```

The extension displays:

- Protocol.
- Domain.
- Path.
- Query parameters.

The complete URL can be copied or opened manually in a new browser tab. The extension does not automatically open decoded website URLs.

HTTP URLs display a warning because they do not use HTTPS. HTTPS does not guarantee that a website is trustworthy, so verify the domain before opening it.

### Email QR Codes

The extension supports email QR codes using the `mailto:` format.

Example:

```text
mailto:person@example.com?subject=Hello&body=Test%20message
```

It can display and copy:

- Recipient.
- CC recipients.
- BCC recipients.
- Subject.
- Message body.

#### MATMSG

The extension also supports MATMSG email payloads.

Example:

```text
MATMSG:TO:person@example.com;SUB:Hello;BODY:Test message;;
```

It can display and copy:

- Recipient.
- Subject.
- Message body.

MATMSG does not normally contain separate CC or BCC fields.

### Phone QR Codes

The extension supports telephone QR payloads using the `tel:` format.

Example:

```text
tel:+919876543210
```

It can display:

- Original decoded phone number.
- Properly formatted international number.
- National number format.
- Country.
- Country calling code.
- Structural validation status.

Example result:

```text
Formatted number: +91 98765 43210
Country: IN
Country calling code: +91
Validation: Structurally valid
```

Phone-number validation is structural only. It does not confirm that the number is active, reachable, or owned by a particular person.

If the number does not include an international country code, the country may not be identifiable reliably. The extension does not automatically call the decoded phone number.

### SMS QR Codes

The extension supports SMS QR payloads using these formats:

```text
sms:+919876543210?body=Hello%20from%20QR
```

```text
SMSTO:+919876543210:Hello from QR
```

It can display and copy:

- SMS recipient.
- Formatted phone number.
- Country.
- Country calling code.
- Structural validation status.
- Pre-filled message.

The extension does not automatically send an SMS. It only displays and copies the recipient and message.

### Contact QR Codes

The extension supports vCard contact payloads.

Example:

```text
BEGIN:VCARD
VERSION:3.0
FN:Jane Smith
ORG:Example Company
TITLE:Manager
TEL;TYPE=CELL:+919876543210
EMAIL:jane@example.com
ADR;TYPE=HOME:;;123 Main Street;Belagavi;Karnataka;590006;India
URL:https://example.com
NOTE:Test contact
END:VCARD
```

It can display and copy:

- Name.
- Organization.
- Job title.
- Phone numbers.
- Email addresses.
- Postal address.
- Website.
- Note.

The extension also supports compact MECARD contact payloads, including names, organizations, telephone numbers, email addresses, addresses, websites, and notes.

### Calendar Event QR Codes

The extension supports iCalendar and VEVENT QR payloads.

It can display and copy:

- Event title.
- Start time.
- End time.
- Location.
- Description.
- Organizer.
- Event URL.
- Event UID when available.

Calendar information is displayed only. The extension does not automatically add events to the user’s calendar.

## Snapshot Mode

Snapshot mode allows you to select an area of the current webpage.

The extension creates:

- A highlighted screenshot of the selected area.
- Text extracted from visible webpage elements.
- Detected email addresses.
- Detected phone numbers.
- Detected URLs and domains.
- Possible postal addresses.

Snapshot text is displayed in the popup and is not automatically copied to the clipboard.

Press `Escape` while selecting an area to cancel Snapshot mode.

Snapshot detection is pattern-based. It may produce false positives or fail to recognize some address, phone, URL, or email formats.

## Keyboard Shortcuts

The current default shortcuts declared in `manifest.json` are:

| Shortcut | Action |
|---|---|
| `Alt+Shift+A` | Scan a QR code on the current webpage |
| `Alt+A` | Start Snapshot selection |
| `Alt+X` | Clear the latest scan or Snapshot result |

Firefox may allow these shortcuts to be customized from **Extensions → Manage Extension Shortcuts**. A shortcut can fail to work when it conflicts with Firefox, the operating system, another extension, or another application. The `suggested_key` value in the manifest is a default suggestion, not a guaranteed override.

## Installation for Development

1. Open Firefox.
2. Navigate to:

   ```text
   about:debugging#/runtime/this-firefox
   ```

3. Select **Load Temporary Add-on**.
4. Choose the project’s `manifest.json` file.
5. Open a webpage containing a QR code.
6. Click the Payment QR Tool toolbar button.
7. Select **Scan QR** or **Snapshot**.

After changing project files, return to the temporary add-ons page and click **Reload** for the extension.

The extension currently uses Manifest V2 and a persistent background HTML page.

## Project Structure

```text
Payment QR Tool/
├── manifest.json
├── background.html
├── background.js
├── content.js
├── options.html
├── options.js
├── libs/
│   ├── jsQR.js
│   └── libphonenumber.min.js
└── popup/
    ├── popup.html
    ├── popup.css
    └── popup.js
```

## File Description

| File | Purpose |
|---|---|
| `manifest.json` | Defines the extension, permissions, scripts, popup, options page, and keyboard shortcuts. |
| `background.html` | Loads the QR decoder, phone-number library, and background script. |
| `background.js` | Captures screenshots, decodes QR codes, parses payloads, extracts information, generates images, and stores results. |
| `content.js` | Handles Snapshot area selection, selected-page text detection support, and webpage notifications. |
| `popup/popup.html` | Defines the popup interface and result sections. |
| `popup/popup.css` | Styles the popup interface. |
| `popup/popup.js` | Displays results and handles copy, clear, and website-open actions. |
| `options.html` | Defines the screenshot settings page. |
| `options.js` | Saves settings and draws the live preview. |
| `libs/jsQR.js` | Decodes QR codes from image data. |
| `libs/libphonenumber.min.js` | Parses, formats, identifies, and structurally validates phone numbers. |

## Screenshot Settings

The options page provides these settings:

- Border spacing: `1` to `100` pixels.
- Border thickness: `1` to `30` pixels.
- Arrow size: `0.03` to `0.30`.
- Arrow side: Automatic, left, or right.

Settings are saved using browser local storage. `background.js` reads them when generating highlighted QR and Snapshot images.

## Result Storage

The latest scan or Snapshot result is stored locally using the extension storage key:

```text
latestResult
```

The result may include:

- Decoded QR information.
- Raw QR payload.
- Scan timestamp.
- QR location.
- Highlighted screenshot.
- QR-only image crop.
- Snapshot text detections.

Selecting **Clear result** removes the saved result and resets the popup display.

## Required Permissions

The extension requests these permissions:

- `activeTab` for interacting with the active webpage.
- `tabs` for accessing the current tab, capturing screenshots, and opening website URLs.
- `<all_urls>` for running the content script on webpages.
- `clipboardWrite` for copying extracted information.
- `storage` for saving settings and the latest result.

## Privacy

QR decoding and payload parsing are performed locally inside the browser extension.

The extension does not require an external server to decode QR codes or parse supported payloads.

Decoded results and screenshot data may be stored temporarily in the browser’s local extension storage until the result is cleared or replaced.

The extension may access the active webpage and capture its visible area when the user starts QR scanning or Snapshot mode.

Do not share sensitive QR screenshots or decoded payment information publicly.

## Limitations

- QR decoding depends on the size, quality, contrast, and visibility of the QR code.
- Very small, blurred, distorted, partially hidden, or damaged QR codes may not decode correctly.
- Payment information is extracted from the QR payload but is not independently verified.
- A recognized wallet address does not prove that the address belongs to the intended recipient.
- A valid phone-number structure does not prove that the phone is active.
- A decoded website URL is not automatically considered trustworthy.
- Snapshot detection is pattern-based and may produce false positives or miss information.
- Some webpages, browser-protected pages, PDF viewers, or restricted frames may not be accessible.
- Image clipboard support depends on browser support and permissions.
- The extension does not send payments, place calls, send SMS messages, or save contacts automatically.
- Wi-Fi, geographic-location, and some other specialized QR formats are not currently parsed as dedicated result types.
- The extension should be tested before it is used with important payment or contact information.

## Safety Notice

Always verify the displayed:

- Payment recipient.
- Merchant name.
- Wallet address.
- Network.
- Amount.
- Website domain.
- Phone number.
- Email recipient.

QR codes can contain altered or malicious information. Website QR codes may lead to phishing pages, and payment QR codes may contain an unintended recipient.

Payment QR Tool only extracts and displays data. It does not guarantee that decoded information is safe, genuine, or correct.

## Third-Party Libraries

This project uses local third-party libraries.

### jsQR

`jsQR.js` is used for QR-code decoding.

### libphonenumber

`libphonenumber.min.js` is used for phone-number parsing, formatting, country identification, and structural validation.

Keep the original license and attribution notices for each third-party library included in the project.

## Testing Checklist

- Load the extension without manifest or resource errors.
- Confirm that the popup opens and shows the empty state.
- Scan a visible UPI QR code and verify the UPI ID, raw payload, copy action, and generated images.
- Scan Pix and QRIS QR codes and verify merchant fields.
- Test cryptocurrency, website, email, phone, SMS, contact, MECARD, and calendar payloads.
- Test Snapshot by dragging in both directions.
- Press `Escape` during Snapshot selection and verify that it cancels.
- Verify selected text and detected items in the popup.
- Test image-copy buttons where Firefox clipboard support is available.
- Save each options value and confirm that it affects generated screenshots.
- Test shortcuts from Firefox’s extension shortcut manager.
- Clear the result and confirm that stored data and displayed sections reset.

## License

Add the project license information here before publishing or distributing the extension.
