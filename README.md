# Payment QR Tool

Payment QR Tool is a Firefox browser extension that scans QR codes from webpages and extracts payment, wallet, website, email, phone, SMS, and contact information.

The extension also includes Snapshot mode, which allows you to select part of a webpage and detect visible email addresses, phone numbers, URLs, and possible postal addresses.

## Features

- Scan QR codes from the current webpage.
- Scan QR codes from a selected webpage area.
- Highlight detected QR codes in screenshots.
- Copy the highlighted screenshot.
- Copy the QR-only image crop.
- Copy the raw decoded QR payload.
- Extract UPI payment information.
- Extract Pix payment information.
- Extract QRIS merchant information.
- Detect cryptocurrency wallet addresses.
- Detect HTTP and HTTPS website QR codes.
- Detect `mailto:` email QR codes.
- Detect MATMSG email QR codes.
- Detect `tel:` phone QR codes.
- Format and validate phone numbers structurally.
- Identify the country and calling code of international phone numbers.
- Detect `sms:` and `SMSTO:` SMS QR codes.
- Detect vCard contact QR codes.
- Display and copy individual decoded values.
- Select a webpage area using Snapshot mode.
- Detect emails, phone numbers, URLs, and possible addresses from Snapshot text.
- Configure screenshot border spacing.
- Configure screenshot border thickness.
- Configure arrow size.
- Configure arrow placement.

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
- Phone number when an Indian mobile number can be extracted from the UPI ID.

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

The complete URL can be copied or opened in a new browser tab.

HTTP URLs display a warning because they do not use HTTPS.

Opening a website is always a manual action. The extension does not automatically open decoded website URLs.

### Email QR Codes

The extension supports email QR codes using the `mailto:` format.

Example:

```text
mailto:person@example.com?subject=Hello&body=Test%20message
```

It can display:

- Recipient.
- CC recipients.
- BCC recipients.
- Subject.
- Message body.

Each available email field can be copied separately.

#### MATMSG

The extension also supports MATMSG email payloads.

Example:

```text
MATMSG:TO:person@example.com;SUB:Hello;BODY:Test message;;
```

It can display:

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

If the number does not include an international country code, the country may not be identifiable reliably.

The extension does not automatically call the decoded phone number.

### SMS QR Codes

The extension supports SMS QR payloads using these formats:

```text
sms:+919876543210?body=Hello%20from%20QR
```

and:

```text
SMSTO:+919876543210:Hello from QR
```

It can display:

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

MECARD contact support may be added in a future update.

## Snapshot Mode

Snapshot mode allows you to select an area of the current webpage.

The extension creates:

- A highlighted screenshot of the selected area.
- Text extracted from visible webpage elements.
- Detected email addresses.
- Detected phone numbers.
- Detected URLs and domains.
- Possible postal addresses.

The Snapshot feature does not automatically copy webpage text to the clipboard.

Press `Escape` while selecting an area to cancel Snapshot mode.

Snapshot address detection is pattern-based. It may produce false positives or fail to recognize some address formats.

## Keyboard Shortcuts

The default keyboard shortcuts are:

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+S` | Scan a QR code on the current webpage |
| `Ctrl+Shift+P` | Start Snapshot selection |
| `Ctrl+Shift+X` | Clear the latest scan or Snapshot result |

Firefox may require a shortcut to be changed from the Extensions Shortcuts settings page if the default combination conflicts with another application or browser feature.

## Installation for Development

1. Open Firefox.
2. Navigate to:

   ```text
   about:debugging#/runtime/this-firefox
   ```

3. Select **Load Temporary Add-on**.
4. Choose the `manifest.json` file from the project directory.
5. Open a webpage containing a QR code.
6. Click the Payment QR Tool toolbar button.
7. Select **Scan QR** or **Snapshot**.

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
| `manifest.json` | Defines the extension, permissions, scripts, popup, options page, and keyboard shortcuts |
| `background.html` | Loads the QR decoder, phone-number library, and background script |
| `background.js` | Captures screenshots, decodes QR codes, parses payloads, extracts information, and stores results |
| `content.js` | Handles Snapshot area selection and webpage notifications |
| `popup/popup.html` | Defines the popup interface and result sections |
| `popup/popup.css` | Styles the popup interface |
| `popup/popup.js` | Displays results and handles copy and open actions |
| `options.html` | Defines the screenshot settings page |
| `options.js` | Saves settings and draws the live preview |
| `libs/jsQR.js` | Decodes QR codes from image data |
| `libs/libphonenumber.min.js` | Parses, formats, identifies, and structurally validates international phone numbers |

## Screenshot Settings

The options page provides these settings:

- Border spacing: `1` to `100` pixels.
- Border thickness: `1` to `30` pixels.
- Arrow size: `0.03` to `0.30`.
- Arrow side: Automatic, left, or right.

Settings are saved using browser local storage.

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

Selecting **Clear result** removes the saved result.

## Required Permissions

The extension requests these permissions:

- `activeTab` for interacting with the active webpage.
- `tabs` for accessing the current tab and opening website URLs.
- `<all_urls>` for running the content script on webpages.
- `clipboardWrite` for copying extracted information.
- `storage` for saving settings and the latest result.

## Privacy

QR decoding and payload parsing are performed locally inside the browser extension.

The extension does not require an external server to decode QR codes or parse supported payloads.

Decoded results and screenshot data may be stored temporarily in the browser’s local extension storage until the result is cleared or replaced.

The extension may access the active webpage and its visible screenshot when the user starts scanning or Snapshot mode.

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
- MECARD, Wi-Fi, location, calendar, and other QR formats are not currently parsed as dedicated result types.
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

## License

Add the project license information here.
