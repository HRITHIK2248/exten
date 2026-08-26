"use strict";


/*
  ============================================================
  1. Main popup elements
  ============================================================
*/

const scanButton =
  document.getElementById(
    "scanButton"
  );

const snapshotButton =
  document.getElementById(
    "snapshotButton"
  );

const clearButton =
  document.getElementById(
    "clearButton"
  );

const emptyState =
  document.getElementById(
    "emptyState"
  );

const resultCard =
  document.getElementById(
    "resultCard"
  );

const resultHeading =
  document.getElementById(
    "resultHeading"
  );

const paymentInfo =
  document.getElementById(
    "paymentInfo"
  );

const resultType =
  document.getElementById(
    "resultType"
  );

const resultNetwork =
  document.getElementById(
    "resultNetwork"
  );

const details =
  document.getElementById(
    "details"
  );

const copyStatus =
  document.getElementById(
    "copyStatus"
  );
const phoneDetails =
  document.getElementById(
    "phoneDetails"
  );

const phoneFormattedNumber =
  document.getElementById(
    "phoneFormattedNumber"
  );

const phoneCountry =
  document.getElementById(
    "phoneCountry"
  );

const phoneCountryCallingCode =
  document.getElementById(
    "phoneCountryCallingCode"
  );

const phoneValidationStatus =
  document.getElementById(
    "phoneValidationStatus"
  );
const smsDetails =
  document.getElementById(
    "smsDetails"
  );

const smsRecipient =
  document.getElementById(
    "smsRecipient"
  );

const smsMessage =
  document.getElementById(
    "smsMessage"
  );

const smsMessageField =
  document.getElementById(
    "smsMessageField"
  );

const copySmsRecipientButton =
  document.getElementById(
    "copySmsRecipientButton"
  );

const copySmsMessageButton =
  document.getElementById(
    "copySmsMessageButton"
  );  
const contactSection =
  document.getElementById(
    "contactSection"
  );

const contactNameField =
  document.getElementById(
    "contactNameField"
  );

const contactOrganizationField =
  document.getElementById(
    "contactOrganizationField"
  );

const contactTitleField =
  document.getElementById(
    "contactTitleField"
  );

const contactPhonesField =
  document.getElementById(
    "contactPhonesField"
  );

const contactEmailsField =
  document.getElementById(
    "contactEmailsField"
  );

const contactAddressField =
  document.getElementById(
    "contactAddressField"
  );

const contactWebsiteField =
  document.getElementById(
    "contactWebsiteField"
  );

const contactNoteField =
  document.getElementById(
    "contactNoteField"
  );

const contactName =
  document.getElementById(
    "contactName"
  );

const contactOrganization =
  document.getElementById(
    "contactOrganization"
  );

const contactTitle =
  document.getElementById(
    "contactTitle"
  );

const contactPhones =
  document.getElementById(
    "contactPhones"
  );

const contactEmails =
  document.getElementById(
    "contactEmails"
  );

const contactAddress =
  document.getElementById(
    "contactAddress"
  );

const contactWebsite =
  document.getElementById(
    "contactWebsite"
  );

const contactNote =
  document.getElementById(
    "contactNote"
  );  
const eventSection =
  document.getElementById(
    "eventSection"
  );

const eventTitleField =
  document.getElementById(
    "eventTitleField"
  );

const eventStartField =
  document.getElementById(
    "eventStartField"
  );

const eventEndField =
  document.getElementById(
    "eventEndField"
  );

const eventLocationField =
  document.getElementById(
    "eventLocationField"
  );

const eventDescriptionField =
  document.getElementById(
    "eventDescriptionField"
  );

const eventOrganizerField =
  document.getElementById(
    "eventOrganizerField"
  );

const eventUrlField =
  document.getElementById(
    "eventUrlField"
  );

const eventTitle =
  document.getElementById(
    "eventTitle"
  );

const eventStart =
  document.getElementById(
    "eventStart"
  );

const eventEnd =
  document.getElementById(
    "eventEnd"
  );

const eventLocation =
  document.getElementById(
    "eventLocation"
  );

const eventDescription =
  document.getElementById(
    "eventDescription"
  );

const eventOrganizer =
  document.getElementById(
    "eventOrganizer"
  );

const eventUrl =
  document.getElementById(
    "eventUrl"
  );
/*
  ============================================================
  2. Raw QR payload elements
  ============================================================
*/

const rawPayloadSection =
  document.getElementById(
    "rawPayloadSection"
  );

const rawPayloadText =
  document.getElementById(
    "rawPayloadText"
  );

const copyRawPayloadButton =
  document.getElementById(
    "copyRawPayloadButton"
  );


/*
  ============================================================
  3. Website QR elements
  ============================================================
*/

const websiteSection =
  document.getElementById(
    "websiteSection"
  );

const websiteProtocol =
  document.getElementById(
    "websiteProtocol"
  );

const websiteDomain =
  document.getElementById(
    "websiteDomain"
  );

const websitePath =
  document.getElementById(
    "websitePath"
  );

const websiteQuery =
  document.getElementById(
    "websiteQuery"
  );

const copyWebsiteButton =
  document.getElementById(
    "copyWebsiteButton"
  );

const openWebsiteButton =
  document.getElementById(
    "openWebsiteButton"
  );

const websiteWarning =
  document.getElementById(
    "websiteWarning"
  );


/*
  ============================================================
  4. Email QR elements
  ============================================================
*/

const emailQrSection =
  document.getElementById(
    "emailQrSection"
  );

const emailQrTo =
  document.getElementById(
    "emailQrTo"
  );

const emailQrCc =
  document.getElementById(
    "emailQrCc"
  );

const emailQrBcc =
  document.getElementById(
    "emailQrBcc"
  );

const emailQrSubject =
  document.getElementById(
    "emailQrSubject"
  );

const emailQrBody =
  document.getElementById(
    "emailQrBody"
  );

const emailQrCcField =
  document.getElementById(
    "emailQrCcField"
  );

const emailQrBccField =
  document.getElementById(
    "emailQrBccField"
  );

const emailQrSubjectField =
  document.getElementById(
    "emailQrSubjectField"
  );

const emailQrBodyField =
  document.getElementById(
    "emailQrBodyField"
  );

const copyEmailToButton =
  document.getElementById(
    "copyEmailToButton"
  );

const copyEmailCcButton =
  document.getElementById(
    "copyEmailCcButton"
  );

const copyEmailBccButton =
  document.getElementById(
    "copyEmailBccButton"
  );

const copyEmailSubjectButton =
  document.getElementById(
    "copyEmailSubjectButton"
  );

const copyEmailBodyButton =
  document.getElementById(
    "copyEmailBodyButton"
  );


/*
  ============================================================
  5. Address and UPI elements
  ============================================================
*/

const addressSection =
  document.getElementById(
    "addressSection"
  );

const addressLabel =
  document.getElementById(
    "addressLabel"
  );

const resultAddress =
  document.getElementById(
    "resultAddress"
  );

const copyButton =
  document.getElementById(
    "copyButton"
  );

const upiPhoneSection =
  document.getElementById(
    "upiPhoneSection"
  );

const upiPhoneNumber =
  document.getElementById(
    "upiPhoneNumber"
  );

const copyUpiPhoneButton =
  document.getElementById(
    "copyUpiPhoneButton"
  );


/*
  ============================================================
  6. Pix elements
  ============================================================
*/

const pixSection =
  document.getElementById(
    "pixSection"
  );

const pixMerchantName =
  document.getElementById(
    "pixMerchantName"
  );

const pixMerchantCity =
  document.getElementById(
    "pixMerchantCity"
  );

const copyMerchantNameButton =
  document.getElementById(
    "copyMerchantNameButton"
  );

const copyMerchantCityButton =
  document.getElementById(
    "copyMerchantCityButton"
  );


/*
  ============================================================
  7. QRIS elements
  ============================================================
*/

const qrisSection =
  document.getElementById(
    "qrisSection"
  );

const qrisMerchantName =
  document.getElementById(
    "qrisMerchantName"
  );

const qrisNationalMerchantId =
  document.getElementById(
    "qrisNationalMerchantId"
  );

const copyQrisMerchantNameButton =
  document.getElementById(
    "copyQrisMerchantNameButton"
  );

const copyQrisNationalMerchantIdButton =
  document.getElementById(
    "copyQrisNationalMerchantIdButton"
  );


/*
  ============================================================
  8. Image elements
  ============================================================
*/

const imageSection =
  document.getElementById(
    "imageSection"
  );

const highlightedScreenshot =
  document.getElementById(
    "highlightedScreenshot"
  );

const qrOnlyImage =
  document.getElementById(
    "qrOnlyImage"
  );

const copyHighlightedButton =
  document.getElementById(
    "copyHighlightedButton"
  );

const copyQrButton =
  document.getElementById(
    "copyQrButton"
  );


/*
  ============================================================
  9. Snapshot elements
  ============================================================
*/

const snapshotTextBlock =
  document.getElementById(
    "snapshotTextBlock"
  );

const detectedItems =
  document.getElementById(
    "detectedItems"
  );

const detectedEmails =
  document.getElementById(
    "detectedEmails"
  );

const detectedPhones =
  document.getElementById(
    "detectedPhones"
  );

const detectedUrls =
  document.getElementById(
    "detectedUrls"
  );

const detectedAddresses =
  document.getElementById(
    "detectedAddresses"
  );

const emailList =
  document.getElementById(
    "emailList"
  );

const phoneList =
  document.getElementById(
    "phoneList"
  );

const urlList =
  document.getElementById(
    "urlList"
  );

const addressList =
  document.getElementById(
    "addressList"
  );

const noDetectedItems =
  document.getElementById(
    "noDetectedItems"
  );

/*
  ============================================================
   event elements 
  ============================================================
*/

const copyEventTitleButton =
  document.getElementById(
    "copyEventTitleButton"
  );

const copyEventStartButton =
  document.getElementById(
    "copyEventStartButton"
  );

const copyEventEndButton =
  document.getElementById(
    "copyEventEndButton"
  );

const copyEventLocationButton =
  document.getElementById(
    "copyEventLocationButton"
  );

const copyEventDescriptionButton =
  document.getElementById(
    "copyEventDescriptionButton"
  );

const copyEventOrganizerButton =
  document.getElementById(
    "copyEventOrganizerButton"
  );

const copyEventUrlButton =
  document.getElementById(
    "copyEventUrlButton"
  );


/*
  ============================================================
  10. Current result
  ============================================================
*/

let latestResult =
  null;


/*
  ============================================================
  11. Button listeners
  ============================================================
*/

scanButton.addEventListener(
  "click",
  startScan
);

snapshotButton.addEventListener(
  "click",
  startSnapshot
);

clearButton.addEventListener(
  "click",
  clearResult
);

copyButton.addEventListener(
  "click",
  copyAddress
);

copyUpiPhoneButton.addEventListener(
  "click",
  copyUpiPhone
);

copyMerchantNameButton.addEventListener(
  "click",
  copyPixMerchantName
);

copyMerchantCityButton.addEventListener(
  "click",
  copyPixMerchantCity
);

copyQrisMerchantNameButton.addEventListener(
  "click",
  copyQrisName
);

copyQrisNationalMerchantIdButton.addEventListener(
  "click",
  copyQrisNationalId
);

copyHighlightedButton.addEventListener(
  "click",
  copyHighlightedScreenshot
);

copyQrButton.addEventListener(
  "click",
  copyQrOnlyImage
);

copyRawPayloadButton.addEventListener(
  "click",
  copyRawPayload
);

copyWebsiteButton.addEventListener(
  "click",
  copyWebsiteUrl
);

openWebsiteButton.addEventListener(
  "click",
  openWebsiteUrl
);

copyEmailToButton.addEventListener(
  "click",
  copyEmailTo
);

copyEmailCcButton.addEventListener(
  "click",
  copyEmailCc
);

copyEmailBccButton.addEventListener(
  "click",
  copyEmailBcc
);

copyEmailSubjectButton.addEventListener(
  "click",
  copyEmailSubject
);

copyEmailBodyButton.addEventListener(
  "click",
  copyEmailBody
);

copyEventTitleButton.addEventListener(
  "click",
  () => copyEventField(
    eventTitle,
    "Event title copied."
  )
);

copyEventStartButton.addEventListener(
  "click",
  () => copyEventField(
    eventStart,
    "Event start copied."
  )
);

copyEventEndButton.addEventListener(
  "click",
  () => copyEventField(
    eventEnd,
    "Event end copied."
  )
);

copyEventLocationButton.addEventListener(
  "click",
  () => copyEventField(
    eventLocation,
    "Event location copied."
  )
);

copyEventDescriptionButton.addEventListener(
  "click",
  () => copyEventField(
    eventDescription,
    "Event description copied."
  )
);

copyEventOrganizerButton.addEventListener(
  "click",
  () => copyEventField(
    eventOrganizer,
    "Event organizer copied."
  )
);

copyEventUrlButton.addEventListener(
  "click",
  () => copyEventField(
    eventUrl,
    "Event URL copied."
  )
);
/*
  ============================================================
  12. Load saved result
  ============================================================
*/

loadLatestResult();

async function loadLatestResult() {
  try {
    const data =
      await browser.storage.local.get(
        "latestResult"
      );

    if (
      data.latestResult
    ) {
      renderResult(
        data.latestResult
      );
    }
  } catch (error) {
    showEmpty(
      `Could not load result: ${
        error.message
      }`
    );
  }
}


/*
  ============================================================
  13. Start QR scan
  ============================================================
*/

async function startScan() {
  scanButton.disabled =
    true;

  snapshotButton.disabled =
    true;

  clearButton.disabled =
    true;

  scanButton.textContent =
    "Scanning...";

  try {
    const tabs =
      await browser.tabs.query({
        active: true,
        currentWindow: true
      });

    const tab =
      tabs[0];

    if (
      !tab ||
      !tab.id
    ) {
      throw new Error(
        "No active webpage was found."
      );
    }

    await browser.runtime.sendMessage({
      type:
        "START_AUTO_SCAN",

      tabId:
        tab.id
    });

    window.close();
  } catch (error) {
    restoreButtons();

    showEmpty(
      `Could not start scan: ${
        error.message
      }`
    );
  }
}


/*
  ============================================================
  14. Start Snapshot
  ============================================================
*/

async function startSnapshot() {
  snapshotButton.disabled =
    true;

  scanButton.disabled =
    true;

  clearButton.disabled =
    true;

  snapshotButton.textContent =
    "Select area...";

  try {
    const tabs =
      await browser.tabs.query({
        active: true,
        currentWindow: true
      });

    const tab =
      tabs[0];

    if (
      !tab ||
      !tab.id
    ) {
      throw new Error(
        "No active webpage was found."
      );
    }

    await browser.tabs.sendMessage(
      tab.id,
      {
        type:
          "START_SNAPSHOT_SELECTION"
      }
    );

    window.close();
  } catch (error) {
    restoreButtons();

    showEmpty(
      `Could not start snapshot: ${
        error.message
      }`
    );
  }
}


/*
  ============================================================
  15. Restore button state
  ============================================================
*/

function restoreButtons() {
  scanButton.disabled =
    false;

  snapshotButton.disabled =
    false;

  clearButton.disabled =
    false;

  scanButton.textContent =
    "Scan QR";

  snapshotButton.textContent =
    "Snapshot";
}


/*
  ============================================================
  16. Clear saved result
  ============================================================
*/

async function clearResult() {
  latestResult =
    null;

  await browser.storage.local.remove(
    "latestResult"
  );

  resetAllSections();

  showEmpty(
    "No scan result yet."
  );
}


/*
  ============================================================
  17. Copy payment values
  ============================================================
*/

async function copyAddress() {
  if (
    !latestResult ||
    !latestResult.address
  ) {
    return;
  }

  await copyText(
    latestResult.address,
    "Address copied."
  );
}

async function copyUpiPhone() {
  if (
    !latestResult ||
    latestResult.type !==
      "upi"
  ) {
    return;
  }

  const phone =
    extractPhoneFromUpiId(
      latestResult.address
    );

  if (
    !phone
  ) {
    return;
  }

  await copyText(
    phone,
    "UPI phone number copied."
  );
}

async function copyPixMerchantName() {
  if (
    !latestResult ||
    latestResult.type !==
      "pix"
  ) {
    return;
  }

  await copyText(
    latestResult.merchantName,
    "Merchant name copied."
  );
}

async function copyPixMerchantCity() {
  if (
    !latestResult ||
    latestResult.type !==
      "pix"
  ) {
    return;
  }

  await copyText(
    latestResult.merchantCity,
    "Merchant city copied."
  );
}

async function copyQrisName() {
  if (
    !latestResult ||
    latestResult.type !==
      "qris"
  ) {
    return;
  }

  await copyText(
    latestResult.merchantName,
    "Merchant name copied."
  );
}

async function copyQrisNationalId() {
  if (
    !latestResult ||
    latestResult.type !==
      "qris"
  ) {
    return;
  }

  await copyText(
    latestResult.nationalMerchantId,
    "National Merchant ID copied."
  );
}


/*
  ============================================================
  18. Copy raw QR information
  ============================================================
*/

async function copyRawPayload() {
  if (
    !latestResult ||
    !latestResult.rawPayload
  ) {
    return;
  }

  await copyText(
    latestResult.rawPayload,
    "Raw QR information copied."
  );
}


/*
  ============================================================
  19. Copy and open website
  ============================================================
*/

async function copyWebsiteUrl() {
  const url =
    websiteSection.dataset.url ||
    "";

  if (
    !url
  ) {
    return;
  }

  await copyText(
    url,
    "Website URL copied."
  );
}

async function openWebsiteUrl() {
  const url =
    websiteSection.dataset.url ||
    "";

  if (
    !url
  ) {
    return;
  }

  try {
    await browser.tabs.create({
      url
    });

    showCopyStatus(
      "Website opened."
    );
  } catch {
    showCopyStatus(
      "Could not open website."
    );
  }
}




async function copySmsRecipient() {
  if (
    !latestResult ||
    latestResult.type !==
    "sms"
  ) {
    return;
  }

  await copyText(
    latestResult.formattedNumber ||
      latestResult.address,
    "SMS recipient copied."
  );
}

async function copySmsMessage() {
  if (
    !latestResult ||
    latestResult.type !==
    "sms" ||
    !latestResult.message
  ) {
    return;
  }

  await copyText(
    latestResult.message,
    "SMS message copied."
  );
}


/*
  ============================================================
  20. Copy email fields
  ============================================================
*/

async function copyEmailTo() {
  await copyEmailField(
    emailQrTo,
    "Email recipient copied."
  );
}

async function copyEmailCc() {
  await copyEmailField(
    emailQrCc,
    "CC recipient copied."
  );
}

async function copyEmailBcc() {
  await copyEmailField(
    emailQrBcc,
    "BCC recipient copied."
  );
}

async function copyEmailSubject() {
  await copyEmailField(
    emailQrSubject,
    "Email subject copied."
  );
}

async function copyEmailBody() {
  await copyEmailField(
    emailQrBody,
    "Email message copied."
  );
}

async function copyEmailField(
  element,
  message
) {
  if (
    !element ||
    !element.textContent
  ) {
    return;
  }

  await copyText(
    element.textContent,
    message
  );
}


/*
  ============================================================
  21. Copy images
  ============================================================
*/

async function copyHighlightedScreenshot() {
  if (
    !latestResult ||
    !latestResult.highlightedScreenshot
  ) {
    return;
  }

  await copyImage(
    latestResult.highlightedScreenshot,
    "Highlighted screenshot copied."
  );
}

async function copyQrOnlyImage() {
  if (
    !latestResult ||
    !latestResult.qrOnlyImage
  ) {
    return;
  }

  await copyImage(
    latestResult.qrOnlyImage,
    "QR image copied."
  );
}

async function copyImage(
  dataUrl,
  message
) {
  try {
    const response =
      await fetch(
        dataUrl
      );

    const blob =
      await response.blob();

    if (
      browser.clipboard &&
      browser.clipboard.setImageData
    ) {
      const buffer =
        await blob.arrayBuffer();

      await browser.clipboard.setImageData(
        buffer,
        "png"
      );
    } else if (
      navigator.clipboard &&
      window.ClipboardItem
    ) {
      const item =
        new ClipboardItem({
          "image/png":
            blob
        });

      await navigator.clipboard.write([
        item
      ]);
    } else {
      throw new Error(
        "Image clipboard is not supported."
      );
    }

    showCopyStatus(
      message
    );
  } catch (error) {
    showCopyStatus(
      `Image copy failed: ${
        error.message
      }`
    );
  }
}

/*
  ============================================================
   Event qr 
  ============================================================
*/
async function copyEventField(
  element,
  message
) {
  if (
    !element ||
    !element.textContent
  ) {
    return;
  }

  await copyText(
    element.textContent,
    message
  );
}

/*
  ============================================================
  22. Copy text
  ============================================================
*/

async function copyText(
  text,
  message
) {
  if (
    !text
  ) {
    return;
  }

  try {
    await navigator.clipboard.writeText(
      text
    );

    showCopyStatus(
      message
    );
  } catch {
    showCopyStatus(
      "Copy failed."
    );
  }
}

function showCopyStatus(
  message
) {
  copyStatus.textContent =
    message;

  setTimeout(
    () => {
      copyStatus.textContent =
        "";
    },
    2500
  );
}


/*
  ============================================================
  23. Render the result
  ============================================================
*/

function renderResult(
  result
) {
  latestResult =
    result;

  resetUpiPhoneDisplay();
  resetWebsiteDisplay();
  resetEmailDisplay();

  if (
    !result ||
    !result.ok
  ) {
    rawPayloadSection.classList.add(
      "hidden"
    );

    rawPayloadText.value =
      "";

    showEmpty(
      result?.error ||
        "No supported payment data was found."
    );

    return;
  }

  renderRawPayload(
    result
  );

  renderWebsiteResult(
    result
  );

  renderEmailResult(
    result
  );
  renderContactResult(
    result
  );
  renderEventResult(
    result
  );
  if (
    result.type ===
    "snapshot"
  ) {
    renderSnapshotResult(
      result
    );

    return;
  }

  emptyState.classList.add(
    "hidden"
  );

  resultCard.classList.remove(
    "hidden"
  );

  resultHeading.textContent =
    "Latest decoded result";

  paymentInfo.classList.remove(
    "hidden"
  );

  resultType.textContent =
    getResultType(
      result
    );

  resultNetwork.textContent =
    result.network ||
    "Unknown";

  resetSnapshotVisibility();

  renderImages(
    result
  );

  renderPixFields(
    result
  );

  renderQrisFields(
    result
  );
  
  renderPhoneDetails(
    result
  );
  renderSmsDetails(
    result
  );
  
  if (
    result.type ===
      "website" ||
    result.type ===
      "phone" ||
    result.type ===
      "sms" ||
    result.type ===
      "contact" ||
    result.type ===
      "event"
  ) {
    addressSection.classList.toggle(
      "hidden",
      result.type ===
        "website" ||
        result.type ===
        "sms" ||
        result.type ===
        "contact" ||
        result.type ===
        "event"
    );
    pixSection.classList.add(
      "hidden"
    );

    qrisSection.classList.add(
      "hidden"
    );

    details.innerHTML =
      "";

    copyStatus.textContent =
      "";

    renderAddressField(
      result
    );

    return;
  }

  renderAddressField(
    result
  );

  renderDetails(
    result
  );

  copyStatus.textContent =
    "";
}


/*
  ============================================================
  24. Render raw payload
  ============================================================
*/

function renderRawPayload(
  result
) {
  const rawPayload =
    result.rawPayload ||
    "";

  rawPayloadText.value =
    rawPayload;

  rawPayloadSection.classList.toggle(
    "hidden",
    !rawPayload
  );

  copyRawPayloadButton.disabled =
    !rawPayload;
}


/*
  ============================================================
  25. Render website QR
  ============================================================
*/

function renderWebsiteResult(
  result
) {
  resetWebsiteDisplay();

  if (
    !result ||
    !result.rawPayload
  ) {
    return;
  }

  let url;

  try {
    url =
      new URL(
        result.rawPayload.trim()
      );
  } catch {
    return;
  }

  if (
    url.protocol !==
      "http:" &&
    url.protocol !==
      "https:"
  ) {
    return;
  }

  websiteSection.classList.remove(
    "hidden"
  );

  websiteProtocol.textContent =
    url.protocol
      .replace(
        ":",
        ""
      )
      .toUpperCase();

  websiteDomain.textContent =
    url.hostname;

  websitePath.textContent =
    url.pathname ||
    "/";

  websiteQuery.textContent =
    url.search ||
    "None";

  websiteSection.dataset.url =
    url.href;

  if (
    url.protocol ===
    "http:"
  ) {
    websiteWarning.textContent =
      "Warning: This website does not use HTTPS.";

    websiteWarning.classList.remove(
      "hidden"
    );
  }
}

function resetWebsiteDisplay() {
  websiteSection.classList.add(
    "hidden"
  );

  websiteSection.dataset.url =
    "";

  websiteProtocol.textContent =
    "";

  websiteDomain.textContent =
    "";

  websitePath.textContent =
    "";

  websiteQuery.textContent =
    "";

  websiteWarning.textContent =
    "";

  websiteWarning.classList.add(
    "hidden"
  );
}

/*
  ============================================================
  Render vCard contact QR
  ------------------------------------------------------------
  Displays contact name, organization, title, phone numbers,
  email addresses, postal address, website, and note.
  ============================================================
*/
function renderContactResult(
  result
) {
  resetContactDisplay();

  if (
    !result ||
    result.type !==
    "contact"
  ) {
    return;
  }

  contactSection.classList.remove(
    "hidden"
  );

  renderContactField(
    contactNameField,
    contactName,
    result.contactName
  );

  renderContactField(
    contactOrganizationField,
    contactOrganization,
    result.contactOrganization
  );

  renderContactField(
    contactTitleField,
    contactTitle,
    result.contactTitle
  );

  renderContactField(
    contactPhonesField,
    contactPhones,
    (
      result.contactPhones ||
      []
    ).join(
      "\n"
    )
  );

  renderContactField(
    contactEmailsField,
    contactEmails,
    (
      result.contactEmails ||
      []
    ).join(
      "\n"
    )
  );

  renderContactField(
    contactAddressField,
    contactAddress,
    result.contactAddress
  );

  renderContactField(
    contactWebsiteField,
    contactWebsite,
    result.contactWebsite
  );

  renderContactField(
    contactNoteField,
    contactNote,
    result.contactNote
  );
}

/*
  ============================================================
  Render calendar event QR
  ------------------------------------------------------------
  Displays the title, start time, end time, location,
  description, organizer, and event URL.

  The event is displayed only. It is not automatically added
  to the user's calendar.
  ============================================================
*/
function renderEventResult(
  result
) {
  resetEventDisplay();

  if (
    !result ||
    result.type !==
    "event"
  ) {
    return;
  }

  eventSection.classList.remove(
    "hidden"
  );

  renderEventField(
    eventTitleField,
    eventTitle,
    result.eventTitle
  );

  renderEventField(
    eventStartField,
    eventStart,
    formatCalendarDate(
      result.eventStart
    )
  );

  renderEventField(
    eventEndField,
    eventEnd,
    formatCalendarDate(
      result.eventEnd
    )
  );

  renderEventField(
    eventLocationField,
    eventLocation,
    result.eventLocation
  );

  renderEventField(
    eventDescriptionField,
    eventDescription,
    result.eventDescription
  );

  renderEventField(
    eventOrganizerField,
    eventOrganizer,
    result.eventOrganizer
  );

  renderEventField(
    eventUrlField,
    eventUrl,
    result.eventUrl
  );
}

function renderEventField(
  field,
  element,
  value
) {
  const text =
    value ||
    "";

  element.textContent =
    text;

  field.classList.toggle(
    "hidden",
    !text
  );
}

function formatCalendarDate(
  value
) {
  if (
    !value
  ) {
    return "";
  }

  const compact =
    value
      .trim()
      .replace(
        /^TZID=[^:]+:/i,
        ""
      );

  const match =
    compact.match(
      /^(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?(\d{2})?(Z)?$/
    );

  if (
    !match
  ) {
    return value;
  }

  const [
    ,
    year,
    month,
    day,
    hour = "00",
    minute = "00",
    second = "00",
    utc
  ] =
    match;

  const date =
    new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}${utc ? "Z" : ""}`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle:
        "medium",
      timeStyle:
        "short",
      timeZone:
        utc
          ? "Asia/Kolkata"
          : undefined
    }
  );
}
function resetEventDisplay() {
  eventSection.classList.add(
    "hidden"
  );

  [
    eventTitleField,
    eventStartField,
    eventEndField,
    eventLocationField,
    eventDescriptionField,
    eventOrganizerField,
    eventUrlField
  ].forEach(
    (field) => {
      field.classList.add(
        "hidden"
      );
    }
  );

  [
    eventTitle,
    eventStart,
    eventEnd,
    eventLocation,
    eventDescription,
    eventOrganizer,
    eventUrl
  ].forEach(
    (element) => {
      element.textContent =
        "";
    }
  );
}
function renderContactField(
  field,
  element,
  value
) {
  const text =
    value ||
    "";

  element.textContent =
    text;

  field.classList.toggle(
    "hidden",
    !text
  );
}

function resetContactDisplay() {
  contactSection.classList.add(
    "hidden"
  );

  [
    contactNameField,
    contactOrganizationField,
    contactTitleField,
    contactPhonesField,
    contactEmailsField,
    contactAddressField,
    contactWebsiteField,
    contactNoteField
  ].forEach(
    (field) => {
      field.classList.add(
        "hidden"
      );
    }
  );

  [
    contactName,
    contactOrganization,
    contactTitle,
    contactPhones,
    contactEmails,
    contactAddress,
    contactWebsite,
    contactNote
  ].forEach(
    (element) => {
      element.textContent =
        "";
    }
  );
}
/*
  ============================================================
  26. Render email QR
  ------------------------------------------------------------
  Reads mailto:recipient?subject=...&body=... values.
  ============================================================
*/

function renderEmailResult(
  result
) {
  resetEmailDisplay();

  if (
    !result ||
    !result.rawPayload
  ) {
    return;
  }
  
  const rawPayload =
    result.rawPayload.trim();

  if (
    /^MATMSG:/i.test(
      rawPayload
    )
  ) {
    renderMatmsgEmail(
      rawPayload
    );

    return;
  }

  if (
    !/^mailto:/i.test(
      rawPayload
    )
  ) {
    return;
  }
  
  const rawValue =
    result.rawPayload
      .trim()
      .replace(
        /^mailto:/i,
        ""
      );

  const queryIndex =
    rawValue.indexOf(
      "?"
    );

  const recipientPart =
    queryIndex ===
      -1
      ? rawValue
      : rawValue.slice(
          0,
          queryIndex
        );

  const queryPart =
    queryIndex ===
      -1
      ? ""
      : rawValue.slice(
          queryIndex + 1
        );

  const parameters =
    new URLSearchParams(
      queryPart
    );

  const to =
    decodeEmailValue(
      recipientPart
    );

  const cc =
    parameters.get(
      "cc"
    ) || "";

  const bcc =
    parameters.get(
      "bcc"
    ) || "";

  const subject =
    parameters.get(
      "subject"
    ) || "";

  const body =
    parameters.get(
      "body"
    ) || "";

  emailQrTo.textContent =
    to;

  emailQrCc.textContent =
    cc;

  emailQrBcc.textContent =
    bcc;

  emailQrSubject.textContent =
    subject;

  emailQrBody.textContent =
    body;

  emailQrSection.classList.remove(
    "hidden"
  );

  emailQrCcField.classList.toggle(
    "hidden",
    !cc
  );

  emailQrBccField.classList.toggle(
    "hidden",
    !bcc
  );

  emailQrSubjectField.classList.toggle(
    "hidden",
    !subject
  );

  emailQrBodyField.classList.toggle(
    "hidden",
    !body
  );
}

/*
  ============================================================
  Render MATMSG email QR
  ------------------------------------------------------------
  Reads the MATMSG payload and displays the recipient,
  subject, and message in the email QR section.

  MATMSG does not normally provide separate CC or BCC fields,
  so those fields remain hidden.
  ============================================================
*/

function renderMatmsgEmail(
  payload
) {
  const value =
    payload
      .trim()
      .replace(
        /^MATMSG:/i,
        ""
      );

  const fields =
    {};

  value
    .split(
      ";"
    )
    .forEach(
      (part) => {
        const separator =
          part.indexOf(
            ":"
          );

        if (
          separator ===
          -1
        ) {
          return;
        }

        const key =
          part
            .slice(
              0,
              separator
            )
            .trim()
            .toUpperCase();

        const fieldValue =
          part
            .slice(
              separator + 1
            )
            .trim();

        fields[key] =
          fieldValue;
      }
    );

  const to =
    fields.TO ||
    "";

  const subject =
    fields.SUB ||
    "";

  const body =
    fields.BODY ||
    "";

  if (
    !to
  ) {
    return;
  }

  emailQrTo.textContent =
    to;

  emailQrCc.textContent =
    "";

  emailQrBcc.textContent =
    "";

  emailQrSubject.textContent =
    subject;

  emailQrBody.textContent =
    body;

  emailQrSection.classList.remove(
    "hidden"
  );

  emailQrCcField.classList.add(
    "hidden"
  );

  emailQrBccField.classList.add(
    "hidden"
  );

  emailQrSubjectField.classList.toggle(
    "hidden",
    !subject
  );

  emailQrBodyField.classList.toggle(
    "hidden",
    !body
  );
}

function resetEmailDisplay() {
  emailQrSection.classList.add(
    "hidden"
  );

  emailQrCcField.classList.add(
    "hidden"
  );

  emailQrBccField.classList.add(
    "hidden"
  );

  emailQrSubjectField.classList.add(
    "hidden"
  );

  emailQrBodyField.classList.add(
    "hidden"
  );

  emailQrTo.textContent =
    "";

  emailQrCc.textContent =
    "";

  emailQrBcc.textContent =
    "";

  emailQrSubject.textContent =
    "";

  emailQrBody.textContent =
    "";
}

function decodeEmailValue(
  value
) {
  try {
    return decodeURIComponent(
      value
    );
  } catch {
    return value;
  }
}


/*
  ============================================================
  27. Render Snapshot
  ============================================================
*/

function renderSnapshotResult(
  result
) {
  emptyState.classList.add(
    "hidden"
  );

  resultCard.classList.remove(
    "hidden"
  );

  resultHeading.textContent =
    "Snapshot";

  paymentInfo.classList.add(
    "hidden"
  );

  addressSection.classList.add(
    "hidden"
  );

  pixSection.classList.add(
    "hidden"
  );

  qrisSection.classList.add(
    "hidden"
  );

  details.innerHTML =
    "";

  copyStatus.textContent =
    "";

  imageSection.classList.remove(
    "hidden"
  );

  highlightedScreenshot.src =
    result.highlightedScreenshot ||
    "";

  copyHighlightedButton.disabled =
    !result.highlightedScreenshot;

  qrOnlyImage.removeAttribute(
    "src"
  );

  qrOnlyImage.classList.add(
    "hidden"
  );

  copyQrButton.classList.add(
    "hidden"
  );

  snapshotTextBlock.classList.remove(
    "hidden"
  );

  renderDetectedItems(
    result.detectedText ||
      result.selectedText ||
      ""
  );
}


/*
  ============================================================
  28. Render images
  ============================================================
*/

function renderImages(
  result
) {
  if (
    result.highlightedScreenshot &&
    result.qrOnlyImage
  ) {
    imageSection.classList.remove(
      "hidden"
    );

    highlightedScreenshot.src =
      result.highlightedScreenshot;

    qrOnlyImage.src =
      result.qrOnlyImage;

    copyHighlightedButton.disabled =
      false;

    copyQrButton.disabled =
      false;
  } else {
    imageSection.classList.add(
      "hidden"
    );

    highlightedScreenshot.removeAttribute(
      "src"
    );

    qrOnlyImage.removeAttribute(
      "src"
    );

    copyHighlightedButton.disabled =
      true;

    copyQrButton.disabled =
      true;
  }
}


/*
  ============================================================
  29. Render Snapshot detections
  ============================================================
*/

function renderDetectedItems(
  text
) {
  const emails =
    extractEmails(
      text
    );

  const phones =
    extractPhones(
      text
    );

  const urls =
    extractUrls(
      text
    );

  const addresses =
    extractAddresses(
      text,
      emails,
      phones,
      urls
    );

  emailList.innerHTML =
    "";

  phoneList.innerHTML =
    "";

  urlList.innerHTML =
    "";

  addressList.innerHTML =
    "";

  const hasDetectedItems =
    emails.length > 0 ||
    phones.length > 0 ||
    urls.length > 0 ||
    addresses.length > 0;

  detectedItems.classList.toggle(
    "hidden",
    !hasDetectedItems
  );

  noDetectedItems.classList.toggle(
    "hidden",
    hasDetectedItems
  );

  detectedEmails.classList.toggle(
    "hidden",
    emails.length === 0
  );

  detectedPhones.classList.toggle(
    "hidden",
    phones.length === 0
  );

  detectedUrls.classList.toggle(
    "hidden",
    urls.length === 0
  );

  detectedAddresses.classList.toggle(
    "hidden",
    addresses.length === 0
  );

  emails.forEach(
    (email) => {
      addDetectedItem(
        emailList,
        email,
        "Copy email"
      );
    }
  );

  phones.forEach(
    (phone) => {
      addDetectedItem(
        phoneList,
        phone.display,
        "Copy phone",
        phone.copyValue
      );
    }
  );

  urls.forEach(
    (url) => {
      addDetectedItem(
        urlList,
        url,
        "Copy URL"
      );
    }
  );

  addresses.forEach(
    (address) => {
      addDetectedItem(
        addressList,
        address,
        "Copy address"
      );
    }
  );
}


/*
  ============================================================
  30. Snapshot extraction helpers
  ============================================================
*/

function extractEmails(
  text
) {
  const matches =
    text.match(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
    ) || [];

  return uniqueValues(
    matches
  );
}

function extractPhones(
  text
) {
  const matches =
    text.match(
      /(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/g
    ) || [];

  const phones =
    [];

  matches.forEach(
    (value) => {
      const display =
        cleanDetectedValue(
          value
        );

      const digits =
        display.replace(
          /\D/g,
          ""
        );

      if (
        digits.length <
          7 ||
        digits.length >
          15
      ) {
        return;
      }

      phones.push({
        display,

        copyValue:
          display
      });
    }
  );

  const seen =
    new Set();

  return phones.filter(
    (phone) => {
      if (
        seen.has(
          phone.copyValue
        )
      ) {
        return false;
      }

      seen.add(
        phone.copyValue
      );

      return true;
    }
  );
}

function extractUrls(
  text
) {
  const matches =
    text.match(
      /\bhttps?:\/\/[^\s<>"']+|\b(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+\b/gi
    ) || [];

  return uniqueValues(
    matches.map(
      (value) =>
        cleanDetectedValue(
          value
        )
    )
  );
}

function extractAddresses(
  text,
  emails,
  phones,
  urls
) {
  const lines =
    text.split(
      /[\r\n]+/
    );

  const excluded =
    new Set([
      ...emails,

      ...phones.map(
        (phone) =>
          phone.copyValue
      ),

      ...urls
    ]);

  const addresses =
    [];

  lines.forEach(
    (line) => {
      const value =
        cleanDetectedValue(
          line
        );

      if (
        !value ||
        excluded.has(
          value
        )
      ) {
        return;
      }

      const hasNumber =
        /\d/.test(
          value
        );

      const hasAddressWord =
        /\b(?:street|st|road|rd|avenue|ave|lane|ln|boulevard|blvd|building|bldg|floor|block|sector|nagar|colony|district|city|state|zip|pincode|pin code|india)\b/i.test(
          value
        );

      if (
        hasNumber &&
        hasAddressWord &&
        value.length <=
          300
      ) {
        addresses.push(
          value
        );
      }
    }
  );

  return uniqueValues(
    addresses
  );
}

function extractPhoneFromUpiId(
  upiId
) {
  if (
    !upiId ||
    !upiId.includes(
      "@"
    )
  ) {
    return "";
  }

  const localPart =
    upiId
      .split(
        "@"
      )[0]
      .trim();

  const digits =
    localPart.replace(
      /\D/g,
      ""
    );

  if (
    digits.length ===
      12 &&
    digits.startsWith(
      "91"
    )
  ) {
    const indianNumber =
      digits.slice(
        2
      );

    if (
      isIndianMobileNumber(
        indianNumber
      )
    ) {
      return indianNumber;
    }
  }

  if (
    digits.length ===
      10 &&
    isIndianMobileNumber(
      digits
    )
  ) {
    return digits;
  }

  return "";
}

function isIndianMobileNumber(
  digits
) {
  return (
    digits.length ===
      10 &&
    /^[6-9]\d{9}$/.test(
      digits
    )
  );
}

function cleanDetectedValue(
  value
) {
  return value
    .replace(
      /^[("'“”]+/,
      ""
    )
    .replace(
      /[.,;:!?'"“”)\]]+$/,
      ""
    )
    .trim();
}

function uniqueValues(
  values
) {
  return [
    ...new Set(
      values.filter(
        Boolean
      )
    )
  ];
}


/*
  ============================================================
  31. Render payment fields
  ============================================================
*/

function renderPixFields(
  result
) {
  if (
    result.type !==
    "pix"
  ) {
    pixSection.classList.add(
      "hidden"
    );

    return;
  }

  pixSection.classList.remove(
    "hidden"
  );

  pixMerchantName.textContent =
    result.merchantName ||
    "";

  pixMerchantCity.textContent =
    result.merchantCity ||
    "";
}

function renderQrisFields(
  result
) {
  if (
    result.type !==
    "qris"
  ) {
    qrisSection.classList.add(
      "hidden"
    );

    return;
  }

  qrisSection.classList.remove(
    "hidden"
  );

  qrisMerchantName.textContent =
    result.merchantName ||
    "";

  qrisNationalMerchantId.textContent =
    result.nationalMerchantId ||
    "";
}

/*
  ============================================================
  Render SMS QR details
  ------------------------------------------------------------
  Displays the SMS recipient, formatted number, country
  information, validation status, and optional message.
  ============================================================
*/
function renderSmsDetails(
  result
) {
  if (
    !result ||
    result.type !==
    "sms"
  ) {
    smsDetails.classList.add(
      "hidden"
    );

    smsRecipient.textContent =
      "";

    smsMessage.textContent =
      "";

    smsMessageField.classList.add(
      "hidden"
    );

    return;
  }

  smsDetails.classList.remove(
    "hidden"
  );

  smsRecipient.textContent =
    result.formattedNumber ||
    result.address ||
    "";

  smsMessage.textContent =
    result.message ||
    "";

  smsMessageField.classList.toggle(
    "hidden",
    !result.message
  );
}
/*
  ============================================================
  Render telephone QR details
  ------------------------------------------------------------
  Displays the formatted phone number, country, calling code,
  and structural validation result.
  ============================================================
*/
function renderPhoneDetails(
  result
) {
  if (
    !result ||
    result.type !==
    "phone"
  ) {
    phoneDetails.classList.add(
      "hidden"
    );

    phoneFormattedNumber.textContent =
      "";

    phoneCountry.textContent =
      "";

    phoneCountryCallingCode.textContent =
      "";

    phoneValidationStatus.textContent =
      "";

    return;
  }

  phoneDetails.classList.remove(
    "hidden"
  );

  phoneFormattedNumber.textContent =
    result.formattedNumber ||
    result.address ||
    "";

  phoneCountry.textContent =
    result.country ||
    "Unknown";

  phoneCountryCallingCode.textContent =
    result.countryCallingCode ||
    "Unknown";

  phoneValidationStatus.textContent =
    result.validationStatus ||
    "Could not validate";
}
function renderAddressField(
  result
) {
  resetUpiPhoneDisplay();
  
  if (
    result.type ===
    "website"
  ) {
    addressSection.classList.add(
      "hidden"
    );

    return;
  }
  
  if (
    result.type ===
      "pix" ||
    result.type ===
      "qris"
  ) {
    addressSection.classList.add(
      "hidden"
    );

    return;
  }

  addressSection.classList.remove(
    "hidden"
  );

  if (
    result.type ===
    "upi"
  ) {
    addressLabel.textContent =
      "UPI ID";
  } else if (
    result.type ===
    "phone"
  ) {
    addressLabel.textContent =
      "Phone number";
  } else {
    addressLabel.textContent =
      "ID or address";
  }

  resultAddress.textContent =
    result.address ||
    "";

  if (
    result.type ===
    "upi"
  ) {
    const phone =
      extractPhoneFromUpiId(
        result.address
      );

    if (
      phone
    ) {
      upiPhoneNumber.textContent =
        phone;

      upiPhoneSection.classList.remove(
        "hidden"
      );
    }
  }
}

function resetUpiPhoneDisplay() {
  upiPhoneSection.classList.add(
    "hidden"
  );

  upiPhoneNumber.textContent =
    "";
}


/*
  ============================================================
  32. Render payment details
  ============================================================
*/

function renderDetails(
  result
) {
  details.innerHTML =
    "";

  const fields = [
    [
      "Payee",
      result.payeeName
    ],
    [
      "Amount",
      result.amount
    ],
    [
      "Currency",
      result.currency
    ],
    [
      "Country",
      result.country
    ],
    [
      "Merchant City",
      result.merchantCity
    ],
    [
      "Label",
      result.label
    ],
    [
      "Message",
      result.message
    ],
    [
      "Note",
      result.note
    ],
    [
      "Pix key",
      result.pixKey
    ],
    [
      "Transaction ID",
      result.transactionId
    ],
    [
      "Merchant account ID",
      result.merchantAccountId
    ],
    [
      "Merchant criteria",
      result.merchantCriteria
    ],
    [
      "Chain ID",
      result.chainId
    ],
    [
      "Token contract",
      result.tokenContract
    ],
    [
      "Token mint",
      result.tokenMint
    ]
  ];

  fields.forEach(
    ([name, value]) => {
      if (
        !value
      ) {
        return;
      }

      const row =
        document.createElement(
          "div"
        );

      const label =
        document.createElement(
          "span"
        );

      const content =
        document.createElement(
          "span"
        );

      row.className =
        "detail";

      label.className =
        "detail-name";

      content.className =
        "detail-value";

      label.textContent =
        name;

      content.textContent =
        value;

      row.appendChild(
        label
      );

      row.appendChild(
        content
      );

      details.appendChild(
        row
      );
    }
  );
}


/*
  ============================================================
  33. Reset Snapshot and website sections
  ============================================================
*/

function resetSnapshotVisibility() {
  qrOnlyImage.classList.remove(
    "hidden"
  );

  copyQrButton.classList.remove(
    "hidden"
  );

  snapshotTextBlock.classList.add(
    "hidden"
  );

  detectedItems.classList.add(
    "hidden"
  );

  noDetectedItems.classList.add(
    "hidden"
  );

  detectedEmails.classList.add(
    "hidden"
  );

  detectedPhones.classList.add(
    "hidden"
  );

  detectedUrls.classList.add(
    "hidden"
  );

  detectedAddresses.classList.add(
    "hidden"
  );

  emailList.innerHTML =
    "";

  phoneList.innerHTML =
    "";

  urlList.innerHTML =
    "";

  addressList.innerHTML =
    "";
}

function resetAllSections() {
  resultCard.classList.add(
    "hidden"
  );

  paymentInfo.classList.remove(
    "hidden"
  );

  addressSection.classList.remove(
    "hidden"
  );

  pixSection.classList.add(
    "hidden"
  );

  qrisSection.classList.add(
    "hidden"
  );

  imageSection.classList.add(
    "hidden"
  );

  rawPayloadSection.classList.add(
    "hidden"
  );

  rawPayloadText.value =
    "";

  details.innerHTML =
    "";

  copyStatus.textContent =
    "";

  resetUpiPhoneDisplay();
  resetWebsiteDisplay();
  resetEmailDisplay();
  resetSnapshotVisibility();
  resetContactDisplay();
  resetEventDisplay();
  renderPhoneDetails(
    null
  );
}


/*
  ============================================================
  34. Result type and final UI helpers
  ============================================================
*/

function getResultType(
  result
) {
  if (
    result.type ===
    "upi"
  ) {
    return "UPI ID";
  }

  if (
    result.type ===
    "pix"
  ) {
    return "Pix QR";
  }

  if (
    result.type ===
    "qris"
  ) {
    return "QRIS";
  }

  if (
    result.type ===
    "crypto"
  ) {
    return "Crypto address";
  }

  if (
    result.type ===
    "email"
  ) {
    return "Email QR";
  }
  if (
    result.type ===
    "website"
  ) {
    return "Website QR";
  }
  
  if (
    result.type ===
    "phone"
  ) {
    return "Phone number";
  }
  
  if (
    result.type ===
    "sms"
  ) {
    return "SMS message";
  }
  
  if (
    result.type ===
    "contact"
  ) {
    return "Contact QR";
  }
  
  if (
    result.type ===
    "event"
  ) {
    return "Calendar event";
  }
  
  return "Payment data";
}

function showEmpty(
  message
) {
  emptyState.textContent =
    message;

  emptyState.classList.remove(
    "hidden"
  );

  resultCard.classList.add(
    "hidden"
  );
}
