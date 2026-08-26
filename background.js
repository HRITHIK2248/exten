"use strict";

console.log("[background] loaded");

/*
  ============================================================
  Keyboard shortcuts
  ------------------------------------------------------------
  scan-qr:
    Starts QR scanning directly in the background script.

  snapshot:
    Starts the webpage Snapshot selector.

  clear-result:
    Removes the saved latest result.
  ============================================================
*/

if (
  browser.commands &&
  browser.commands.onCommand
) {
  browser.commands.onCommand.addListener(
    handleKeyboardCommand
  );
}


/*
  ============================================================
  Handle keyboard commands
  ============================================================
*/

async function handleKeyboardCommand(
  command
) {
  try {
    /*
      Find the active tab in the current browser window.
    */
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
      console.warn(
        "[background] No active tab for shortcut:",
        command
      );

      return;
    }


    /*
      QR shortcut

      Important:
      Call autoScanVisibleTab() directly.

      Do not send START_AUTO_SCAN through
      browser.runtime.sendMessage() here, because this
      code is already running inside background.js.
    */
    if (
      command ===
      "scan-qr"
    ) {
      await autoScanVisibleTab(
        tab.id
      );

      return;
    }


    /*
      Snapshot shortcut

      This sends the same message used by the Snapshot
      button in popup.js.
    */
    if (
      command ===
      "snapshot"
    ) {
      await browser.tabs.sendMessage(
        tab.id,
        {
          type:
            "START_SNAPSHOT_SELECTION"
        }
      );

      return;
    }


    /*
      Clear-result shortcut

      Remove the same storage key used by the Clear result
      button in popup.js.
    */
    if (
      command ===
      "clear-result"
    ) {
      await browser.storage.local.remove(
        "latestResult"
      );

      /*
        Remove any visible webpage scan status.
        This is optional, so failure is ignored.
      */
      try {
        await browser.tabs.sendMessage(
          tab.id,
          {
            type:
              "HIDE_SCAN_STATUS"
          }
        );
      } catch {
        /*
          Some pages do not have a content script.
        */
      }

      return;
    }
  } catch (error) {
    console.warn(
      "[background] Keyboard shortcut failed:",
      command,
      error
    );
  }
}

const DEFAULT_SCREENSHOT_SETTINGS = {
  borderSpacing: 12,
  borderThickness: 6,
  arrowSize: 0.11,
  arrowDirection: "auto"
};

browser.runtime.onMessage.addListener(
  (message, sender) => {
    if (
      message.type ===
      "START_AUTO_SCAN"
    ) {
      const tabId =
        message.tabId ||
        sender.tab?.id;

      if (!tabId) {
        return false;
      }

      autoScanVisibleTab(
        tabId
      );

      return false;
    }

    if (
      message.type ===
      "CAPTURE_SELECTED_AREA"
    ) {
      const tabId =
        sender.tab?.id;

      if (!tabId) {
        return false;
      }

      captureAndExtract(
        message,
        tabId
      );

      return false;
    }
    if (
  message.type ===
  "SNAPSHOT_SELECTION"
) {
  const tabId =
    sender.tab?.id;

  if (
    !tabId
  ) {
    return false;
  }

  captureSnapshotSelection(
    message,
    tabId
  );

  return false;
}

    return false;
  }
);

async function autoScanVisibleTab(
  tabId
) {
  try {
    await sendPageMessage(
      tabId,
      {
        type:
          "HIDE_SCAN_STATUS"
      }
    );

    const tab =
      await browser.tabs.get(
        tabId
      );

    const screenshot =
      await browser.tabs.captureVisibleTab(
        tab.windowId,
        {
          format: "png"
        }
      );

    await sendStatus(
      tabId,
      "Searching for QR code..."
    );

    const decoded =
      await decodeFullScreenshot(
        screenshot
      );

    const result =
      extractRecipient(
        decoded.data
      );
     /*
  ============================================================
  Save raw decoded QR information
  ------------------------------------------------------------
  decoded.data is the exact text returned by jsQR.

  This is saved before payment parsing so that the popup can
  display the original QR payload for UPI, Pix, QRIS, crypto,
  website links, and unsupported QR formats.
  ============================================================
*/

    result.rawPayload =
      decoded.data;
    result.scannedAt =
      Date.now();

    result.qrLocation =
      decoded.location;

    const images =
      await createQrImages(
        screenshot,
        decoded.location,
        tab.url || ""
      );

    result.highlightedScreenshot =
      images.highlightedScreenshot;

    result.qrOnlyImage =
      images.qrOnlyImage;

    if (
      result.ok
    ) {
      await automaticallyCopyResult(
        result
      );
    } else {
      result.copiedAutomatically =
        false;
    }

    await saveAndShowResult(
      tabId,
      result,
      tab
    );
  } catch (error) {
    await handleScanError(
      tabId,
      error
    );
  }
}

async function captureAndExtract(
  message,
  tabId
) {
  try {
    await sendPageMessage(
      tabId,
      {
        type:
          "HIDE_SCAN_STATUS"
      }
    );

    const tab =
      await browser.tabs.get(
        tabId
      );

    const screenshot =
      await browser.tabs.captureVisibleTab(
        tab.windowId,
        {
          format: "png"
        }
      );

    const result =
      await decodeSelectedArea(
        screenshot,
        message.selection
      );

    result.scannedAt =
      Date.now();

    if (
      result.ok
    ) {
      await automaticallyCopyResult(
        result
      );
    } else {
      result.copiedAutomatically =
        false;
    }

    await saveAndShowResult(
      tabId,
      result,
      tab
    );
  } catch (error) {
    await handleScanError(
      tabId,
      error
    );
  }
}
async function captureSnapshotSelection(
  message,
  tabId
) {
  try {
    const tab =
      await browser.tabs.get(
        tabId
      );

    const screenshot =
      await browser.tabs.captureVisibleTab(
        tab.windowId,
        {
          format: "png"
        }
      );

    const result =
      await createSnapshotImage(
        screenshot,
        message.selection,
        tab.url || ""
      );

    result.scannedAt =
      Date.now();
      
    result.selectedText =
      message.selectedText ||
      "";  

    result.ok =
      true;

    result.type =
      "snapshot";

    result.network =
      "Webpage snapshot";

    result.copiedAutomatically =
      false;

    await browser.storage.local.set({
      latestResult: result
    });

    await sendResult(
      tabId,
      result
    );

    await openResultPopup(
      tab
    );
  } catch (error) {
    await handleScanError(
      tabId,
      error
    );
  }
}

async function automaticallyCopyResult(
  result
) {
  if (
    result.type ===
    "pix"
  ) {
    await copyToClipboard(
      `Merchant Name: ${
        result.merchantName
      }\nMerchant City: ${
        result.merchantCity
      }`
    );

    result.copiedAutomatically =
      true;

    return;
  }

  if (
    result.type ===
    "qris"
  ) {
    await copyToClipboard(
      `Merchant Name: ${
        result.merchantName
      }\nNational Merchant ID: ${
        result.nationalMerchantId
      }`
    );

    result.copiedAutomatically =
      true;

    return;
  }

  if (
    result.address
  ) {
    await copyToClipboard(
      result.address
    );

    result.copiedAutomatically =
      true;

    return;
  }

  result.copiedAutomatically =
    false;
}

async function saveAndShowResult(
  tabId,
  result,
  tab
) {
  await browser.storage.local.set({
    latestResult: result
  });

  await sendResult(
    tabId,
    result
  );

  const safeTab =
    tab ||
    await getSafeTab(
      tabId
    );

  await openResultPopup(
    safeTab
  );
}

async function handleScanError(
  tabId,
  error
) {
  const result = {
    ok: false,
    copiedAutomatically: false,
    scannedAt: Date.now(),
    error:
      error.message ||
      "Automatic QR scan failed."
  };

  await browser.storage.local.set({
    latestResult: result
  });

  await sendResult(
    tabId,
    result
  );

  const tab =
    await getSafeTab(
      tabId
    );

  await openResultPopup(
    tab
  );
}

async function getSafeTab(
  tabId
) {
  try {
    return await browser.tabs.get(
      tabId
    );
  } catch {
    return null;
  }
}

async function openResultPopup(
  tab
) {
  try {
    if (
      tab &&
      typeof tab.windowId ===
        "number"
    ) {
      await browser.browserAction.openPopup({
        windowId:
          tab.windowId
      });
    } else {
      await browser.browserAction.openPopup();
    }
  } catch (error) {
    console.warn(
      "[background] Could not open popup:",
      error
    );
  }
}

async function sendPageMessage(
  tabId,
  message
) {
  try {
    await browser.tabs.sendMessage(
      tabId,
      message
    );
  } catch {
    // Content script unavailable.
  }
}

async function sendStatus(
  tabId,
  text
) {
  await sendPageMessage(
    tabId,
    {
      type:
        "QR_SCAN_STATUS",
      text
    }
  );
}

async function sendResult(
  tabId,
  result
) {
  await sendPageMessage(
    tabId,
    {
      type:
        "PAYMENT_RESULT",
      result
    }
  );
}

async function decodeFullScreenshot(
  screenshot
) {
  if (
    typeof jsQR !==
    "function"
  ) {
    throw new Error(
      "jsQR.js did not load."
    );
  }

  const image =
    await loadImage(
      screenshot
    );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    image.naturalWidth;

  canvas.height =
    image.naturalHeight;

  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );

  context.drawImage(
    image,
    0,
    0
  );

  const imageData =
    context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

  const qrResult =
    jsQR(
      imageData.data,
      imageData.width,
      imageData.height,
      {
        inversionAttempts:
          "attemptBoth"
      }
    );

  if (
    !qrResult
  ) {
    throw new Error(
      "QR code was not found in the visible webpage."
    );
  }

  return {
    data:
      qrResult.data.trim(),
    location:
      qrResult.location
  };
}

async function decodeSelectedArea(
  screenshot,
  selection
) {
  if (
    typeof jsQR !==
    "function"
  ) {
    throw new Error(
      "jsQR.js did not load."
    );
  }

  const image =
    await loadImage(
      screenshot
    );

  const scaleX =
    image.naturalWidth /
    selection.viewportWidth;

  const scaleY =
    image.naturalHeight /
    selection.viewportHeight;

  const x =
    Math.max(
      0,
      Math.round(
        selection.left *
        scaleX
      )
    );

  const y =
    Math.max(
      0,
      Math.round(
        selection.top *
        scaleY
      )
    );

  const width =
    Math.min(
      image.naturalWidth -
        x,
      Math.round(
        selection.width *
        scaleX
      )
    );

  const height =
    Math.min(
      image.naturalHeight -
        y,
      Math.round(
        selection.height *
        scaleY
      )
    );

  if (
    width < 40 ||
    height < 40
  ) {
    return {
      ok: false,
      error:
        "Selected area is too small."
    };
  }

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    width;

  canvas.height =
    height;

  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );

  context.drawImage(
    image,
    x,
    y,
    width,
    height,
    0,
    0,
    width,
    height
  );

  const imageData =
    context.getImageData(
      0,
      0,
      width,
      height
    );

  const qrResult =
    jsQR(
      imageData.data,
      imageData.width,
      imageData.height,
      {
        inversionAttempts:
          "attemptBoth"
      }
    );

  if (
    !qrResult
  ) {
    return {
      ok: false,
      error:
        "QR code not found in the selected area."
    };
  }

  const result =
    extractRecipient(
      qrResult.data.trim()
    );
  /*
  ============================================================
  Save raw decoded information for selected-area scans
  ============================================================
*/

  result.rawPayload =
    qrResult.data.trim();
  result.qrLocation =
    qrResult.location;

  return result;
}

async function createQrImages(
  screenshot,
  location,
  pageUrl
) {
  if (
    !location ||
    !location.topLeftCorner ||
    !location.topRightCorner ||
    !location.bottomRightCorner ||
    !location.bottomLeftCorner
  ) {
    throw new Error(
      "QR location was not returned by the decoder."
    );
  }

  const settings =
    await getScreenshotSettings();

  const image =
    await loadImage(
      screenshot
    );

  const sourceCanvas =
    document.createElement(
      "canvas"
    );

  sourceCanvas.width =
    image.naturalWidth;

  sourceCanvas.height =
    image.naturalHeight;

  const sourceContext =
    sourceCanvas.getContext(
      "2d"
    );

  sourceContext.drawImage(
    image,
    0,
    0
  );

  const points = [
    location.topLeftCorner,
    location.topRightCorner,
    location.bottomRightCorner,
    location.bottomLeftCorner
  ];

  const bounds =
    getBounds(
      points,
      sourceCanvas.width,
      sourceCanvas.height
    );

  const qrMargin =
    Math.max(
      8,
      Math.round(
        Math.min(
          bounds.width,
          bounds.height
        ) * 0.025
      )
    );

  const cropLeft =
    Math.max(
      0,
      bounds.left -
        qrMargin
    );

  const cropTop =
    Math.max(
      0,
      bounds.top -
        qrMargin
    );

  const cropRight =
    Math.min(
      sourceCanvas.width,
      bounds.right +
        qrMargin
    );

  const cropBottom =
    Math.min(
      sourceCanvas.height,
      bounds.bottom +
        qrMargin
    );

  const cropWidth =
    cropRight -
    cropLeft;

  const cropHeight =
    cropBottom -
    cropTop;

  const headerHeight =
    35;

  const footerHeight =
    18;

  const highlightedCanvas =
    document.createElement(
      "canvas"
    );

  highlightedCanvas.width =
    sourceCanvas.width;

  highlightedCanvas.height =
    headerHeight +
    sourceCanvas.height +
    footerHeight;

  const highlightedContext =
    highlightedCanvas.getContext(
      "2d"
    );

  highlightedContext.fillStyle =
    "#ffffff";

  highlightedContext.fillRect(
    0,
    0,
    highlightedCanvas.width,
    highlightedCanvas.height
  );

  highlightedContext.fillStyle =
    "#111111";

  highlightedContext.font =
    "18px Arial";

  highlightedContext.textBaseline =
    "middle";

  highlightedContext.fillText(
    `URL: ${
      pageUrl ||
      "Unavailable"
    }`,
    10,
    headerHeight / 2
  );

  highlightedContext.drawImage(
    sourceCanvas,
    0,
    headerHeight
  );

  const highlightPadding =
    settings.borderSpacing;

  const highlightPoints =
    expandPoints(
      points,
      bounds,
      highlightPadding
    ).map(
      (point) => ({
        x:
          point.x,
        y:
          point.y +
          headerHeight
      })
    );

  highlightedContext.save();

  highlightedContext.beginPath();

  highlightedContext.moveTo(
    highlightPoints[0].x,
    highlightPoints[0].y
  );

  highlightPoints.slice(
    1
  ).forEach(
    (point) => {
      highlightedContext.lineTo(
        point.x,
        point.y
      );
    }
  );

  highlightedContext.closePath();

  highlightedContext.lineWidth =
    settings.borderThickness;

  highlightedContext.strokeStyle =
    "#ff1744";

  highlightedContext.stroke();

  highlightedContext.restore();

  drawQrArrow(
    highlightedContext,
    {
      left:
        bounds.left,
      top:
        bounds.top +
        headerHeight,
      right:
        bounds.right,
      bottom:
        bounds.bottom +
        headerHeight,
      width:
        bounds.width,
      height:
        bounds.height
    },
    highlightPadding,
    settings.arrowSize,
    settings.arrowDirection,
    highlightedCanvas.width,
    highlightedCanvas.height
  );

  const timestamp =
    new Date().toLocaleString(
      "en-IN",
      {
        timeZone:
          "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }
    );

  highlightedContext.fillStyle =
    "#111111";

  highlightedContext.font =
    "17px Arial";

  highlightedContext.fillText(
    `Timestamp: ${
      timestamp
    } IST`,
    10,
    headerHeight +
      sourceCanvas.height +
      footerHeight / 2
  );

  const qrCanvas =
    document.createElement(
      "canvas"
    );

  qrCanvas.width =
    cropWidth;

  qrCanvas.height =
    cropHeight;

  const qrContext =
    qrCanvas.getContext(
      "2d"
    );

  qrContext.drawImage(
    sourceCanvas,
    cropLeft,
    cropTop,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return {
    highlightedScreenshot:
      highlightedCanvas.toDataURL(
        "image/png"
      ),
    qrOnlyImage:
      qrCanvas.toDataURL(
        "image/png"
      )
  };
}
async function createSnapshotImage(
  screenshot,
  selection,
  pageUrl
) {
  const settings =
    await getScreenshotSettings();

  const image =
    await loadImage(
      screenshot
    );

  const sourceCanvas =
    document.createElement(
      "canvas"
    );

  sourceCanvas.width =
    image.naturalWidth;

  sourceCanvas.height =
    image.naturalHeight;

  const sourceContext =
    sourceCanvas.getContext(
      "2d"
    );

  sourceContext.drawImage(
    image,
    0,
    0
  );

  const scaleX =
    sourceCanvas.width /
    selection.viewportWidth;

  const scaleY =
    sourceCanvas.height /
    selection.viewportHeight;

  const selectedBounds = {
    left:
      Math.round(
        selection.left *
        scaleX
      ),

    top:
      Math.round(
        selection.top *
        scaleY
      ),

    right:
      Math.round(
        (selection.left +
          selection.width) *
        scaleX
      ),

    bottom:
      Math.round(
        (selection.top +
          selection.height) *
        scaleY
      )
  };

  selectedBounds.width =
    selectedBounds.right -
    selectedBounds.left;

  selectedBounds.height =
    selectedBounds.bottom -
    selectedBounds.top;

  const headerHeight =
    35;

  const footerHeight =
    18;

  const outputCanvas =
    document.createElement(
      "canvas"
    );

  outputCanvas.width =
    sourceCanvas.width;

  outputCanvas.height =
    headerHeight +
    sourceCanvas.height +
    footerHeight;

  const outputContext =
    outputCanvas.getContext(
      "2d"
    );

  outputContext.fillStyle =
    "#ffffff";

  outputContext.fillRect(
    0,
    0,
    outputCanvas.width,
    outputCanvas.height
  );

  outputContext.fillStyle =
    "#111111";

  outputContext.font =
    "18px Arial";

  outputContext.textBaseline =
    "middle";

  outputContext.fillText(
    `URL: ${
      pageUrl ||
      "Unavailable"
    }`,
    10,
    headerHeight / 2
  );

  outputContext.drawImage(
    sourceCanvas,
    0,
    headerHeight
  );

  const padding =
    settings.borderSpacing;

  const left =
    selectedBounds.left -
    padding;

  const top =
    selectedBounds.top +
    headerHeight -
    padding;

  const right =
    selectedBounds.right +
    padding;

  const bottom =
    selectedBounds.bottom +
    headerHeight +
    padding;

  outputContext.save();

  outputContext.strokeStyle =
    "#ff1744";

  outputContext.lineWidth =
    settings.borderThickness;

  outputContext.strokeRect(
    left,
    top,
    right -
      left,
    bottom -
      top
  );

  outputContext.restore();

  drawSnapshotArrow(
    outputContext,
    {
      left,
      top,
      right,
      bottom,
      width:
        right -
        left,
      height:
        bottom -
        top
    },
    padding,
    settings.arrowSize,
    settings.arrowDirection,
    outputCanvas.width,
    outputCanvas.height
  );

  const timestamp =
    new Date().toLocaleString(
      "en-IN",
      {
        timeZone:
          "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }
    );

  outputContext.fillStyle =
    "#111111";

  outputContext.font =
    "17px Arial";

  outputContext.fillText(
    `Timestamp: ${
      timestamp
    } IST`,
    10,
    headerHeight +
      sourceCanvas.height +
      footerHeight / 2
  );

  return {
    highlightedScreenshot:
      outputCanvas.toDataURL(
        "image/png"
      ),
    qrOnlyImage:
      ""
  };
}
function drawSnapshotArrow(
  context,
  bounds,
  padding,
  arrowSize,
  arrowDirection,
  canvasWidth,
  canvasHeight
) {
  const arrowLength =
    Math.max(
      24,
      Math.round(
        Math.min(
          bounds.width,
          bounds.height
        ) * arrowSize
      )
    );

  const triangleSize =
    Math.max(
      9,
      Math.round(
        arrowLength * 0.30
      )
    );

  const leftSpace =
    bounds.left;

  const rightSpace =
    canvasWidth -
    bounds.right;

  let direction;

  if (
    arrowDirection ===
    "left"
  ) {
    direction =
      "right";
  } else if (
    arrowDirection ===
    "right"
  ) {
    direction =
      "left";
  } else {
    direction =
      rightSpace <
      leftSpace
        ? "right"
        : "left";
  }

  const centerY =
    bounds.top +
    bounds.height / 2;

  let startX;
  let targetX;

  if (
    direction ===
    "right"
  ) {
    startX =
      bounds.left -
      padding -
      arrowLength;

    targetX =
      bounds.left -
      padding;
  } else {
    startX =
      bounds.right +
      padding +
      arrowLength;

    targetX =
      bounds.right +
      padding;
  }

  startX =
    Math.max(
      18,
      Math.min(
        canvasWidth -
          18,
        startX
      )
    );

  targetX =
    Math.max(
      18,
      Math.min(
        canvasWidth -
          18,
        targetX
      )
    );

  const lineEndX =
    direction ===
    "right"
      ? targetX -
        triangleSize
      : targetX +
        triangleSize;

  context.save();

  context.strokeStyle =
    "#ff1744";

  context.fillStyle =
    "#ff1744";

  context.lineWidth =
    Math.max(
      3,
      Math.round(
        Math.min(
          canvasWidth,
          canvasHeight
        ) * 0.0025
      )
    );

  context.lineCap =
    "round";

  context.lineJoin =
    "round";

  context.beginPath();

  context.moveTo(
    startX,
    centerY
  );

  context.lineTo(
    lineEndX,
    centerY
  );

  context.stroke();

  context.beginPath();

  if (
    direction ===
    "right"
  ) {
    context.moveTo(
      targetX,
      centerY
    );

    context.lineTo(
      targetX -
        triangleSize,
      centerY -
        triangleSize
    );

    context.lineTo(
      targetX -
        triangleSize,
      centerY +
        triangleSize
    );
  } else {
    context.moveTo(
      targetX,
      centerY
    );

    context.lineTo(
      targetX +
        triangleSize,
      centerY -
        triangleSize
    );

    context.lineTo(
      targetX +
        triangleSize,
      centerY +
        triangleSize
    );
  }

  context.closePath();
  context.fill();

  context.restore();
}

async function getScreenshotSettings() {
  const stored =
    await browser.storage.local.get({
      borderSpacing: 12,
      borderThickness: 6,
      arrowSize: 0.11,
      arrowDirection: "auto"
    });

  return {
    borderSpacing:
      clampNumber(
        stored.borderSpacing,
        1,
        100,
        12
      ),

    borderThickness:
      clampNumber(
        stored.borderThickness,
        1,
        30,
        6
      ),

    arrowSize:
      clampNumber(
        stored.arrowSize,
        0.03,
        0.30,
        0.11
      ),

    arrowDirection:
      ["auto", "left", "right"].includes(
        stored.arrowDirection
      )
        ? stored.arrowDirection
        : "auto"
  };
}

function clampNumber(
  value,
  minimum,
  maximum,
  fallback
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return fallback;
  }

  return Math.max(
    minimum,
    Math.min(
      maximum,
      number
    )
  );
}

function expandPoints(
  points,
  bounds,
  padding
) {
  return points.map(
    (point) => {
      let x =
        Number(point.x);

      let y =
        Number(point.y);

      if (
        x <=
        bounds.left +
          bounds.width / 2
      ) {
        x -= padding;
      } else {
        x += padding;
      }

      if (
        y <=
        bounds.top +
          bounds.height / 2
      ) {
        y -= padding;
      } else {
        y += padding;
      }

      return {
        x,
        y
      };
    }
  );
}

function drawQrArrow(
  context,
  bounds,
  padding,
  arrowSize,
  arrowDirection,
  canvasWidth,
  canvasHeight
) {
  const arrowLength =
    Math.max(
      24,
      Math.round(
        Math.min(
          bounds.width,
          bounds.height
        ) * arrowSize
      )
    );

  const qrGap =
    Math.max(
      20,
      padding + 8
    );

  const triangleSize =
    Math.max(
      9,
      Math.round(
        arrowLength * 0.30
      )
    );

  const leftSpace =
    bounds.left;

  const rightSpace =
    canvasWidth -
    bounds.right;

  const edgeThreshold =
    Math.max(
      60,
      arrowLength +
        qrGap +
        triangleSize +
        10
    );

  let direction;

  if (
    arrowDirection ===
    "left"
  ) {
    direction =
      "right";
  } else if (
    arrowDirection ===
    "right"
  ) {
    direction =
      "left";
  } else if (
    rightSpace <
    edgeThreshold
  ) {
    direction =
      "right";
  } else if (
    leftSpace <
    edgeThreshold
  ) {
    direction =
      "left";
  } else {
    direction =
      rightSpace >=
      leftSpace
        ? "right"
        : "left";
  }

  const centerY =
    bounds.top +
    bounds.height / 2;

  let startX;
  let targetX;

  if (
    direction ===
    "right"
  ) {
    startX =
      bounds.left -
      qrGap -
      arrowLength;

    targetX =
      bounds.left -
      qrGap;
  } else {
    startX =
      bounds.right +
      qrGap +
      arrowLength;

    targetX =
      bounds.right +
      qrGap;
  }

  startX =
    Math.max(
      18,
      Math.min(
        canvasWidth -
          18,
        startX
      )
    );

  targetX =
    Math.max(
      18,
      Math.min(
        canvasWidth -
          18,
        targetX
      )
    );

  const lineEndX =
    direction ===
    "right"
      ? targetX -
        triangleSize
      : targetX +
        triangleSize;

  context.save();

  context.strokeStyle =
    "#ff1744";

  context.fillStyle =
    "#ff1744";

  context.lineWidth =
    Math.max(
      3,
      Math.round(
        Math.min(
          canvasWidth,
          canvasHeight
        ) * 0.0025
      )
    );

  context.lineCap =
    "round";

  context.lineJoin =
    "round";

  context.beginPath();

  context.moveTo(
    startX,
    centerY
  );

  context.lineTo(
    lineEndX,
    centerY
  );

  context.stroke();

  context.beginPath();

  if (
    direction ===
    "right"
  ) {
    context.moveTo(
      targetX,
      centerY
    );

    context.lineTo(
      targetX -
        triangleSize,
      centerY -
        triangleSize
    );

    context.lineTo(
      targetX -
        triangleSize,
      centerY +
        triangleSize
    );
  } else {
    context.moveTo(
      targetX,
      centerY
    );

    context.lineTo(
      targetX +
        triangleSize,
      centerY -
        triangleSize
    );

    context.lineTo(
      targetX +
        triangleSize,
      centerY +
        triangleSize
    );
  }

  context.closePath();
  context.fill();

  context.restore();
}

function getBounds(
  points,
  width,
  height
) {
  const xs =
    points.map(
      (point) =>
        Number(point.x)
    );

  const ys =
    points.map(
      (point) =>
        Number(point.y)
    );

  const left =
    Math.max(
      0,
      Math.floor(
        Math.min(
          ...xs
        )
      )
    );

  const top =
    Math.max(
      0,
      Math.floor(
        Math.min(
          ...ys
        )
      )
    );

  const right =
    Math.min(
      width,
      Math.ceil(
        Math.max(
          ...xs
        )
      )
    );

  const bottom =
    Math.min(
      height,
      Math.ceil(
        Math.max(
          ...ys
        )
      )
    );

  return {
    left,
    top,
    right,
    bottom,
    width:
      right -
      left,
    height:
      bottom -
      top
  };
}

function extractRecipient(
  payload
) {
  if (
    isQrisPayload(
      payload
    )
  ) {
    return parseQrisPayload(
      payload
    );
  }

  if (
    isPixPayload(
      payload
    )
  ) {
    return parsePixPayload(
      payload
    );
  }

  if (
    /^upi:\/\/pay\?/i.test(
      payload
    )
  ) {
    return extractUpiRecipient(
      payload
    );
  }

  if (
    /^bitcoin:/i.test(
      payload
    )
  ) {
    return extractBitcoinRecipient(
      payload
    );
  }

  if (
    /^ethereum:/i.test(
      payload
    )
  ) {
    return extractEthereumRecipient(
      payload
    );
  }

  if (
    /^solana:/i.test(
      payload
    )
  ) {
    return extractSolanaRecipient(
      payload
    );
  }

  if (
    /^litecoin:/i.test(
      payload
    )
  ) {
    return extractSchemeAddress(
      payload,
      "litecoin",
      "Litecoin"
    );
  }

  if (
    /^dogecoin:/i.test(
      payload
    )
  ) {
    return extractSchemeAddress(
      payload,
      "dogecoin",
      "Dogecoin"
    );
  }

  if (
    /^bitcoincash:/i.test(
      payload
    )
  ) {
    return extractSchemeAddress(
      payload,
      "bitcoincash",
      "Bitcoin Cash"
    );
  }

  if (
    /^monero:/i.test(
      payload
    )
  ) {
    return extractSchemeAddress(
      payload,
      "monero",
      "Monero"
    );
  }

  if (
    /^tron:/i.test(
      payload
    )
  ) {
    return extractSchemeAddress(
      payload,
      "tron",
      "TRON"
    );
  }

  if (
    isBitcoinAddress(
      payload
    )
  ) {
    return success(
      "Bitcoin",
      payload
    );
  }

  if (
    isEvmAddress(
      payload
    )
  ) {
    return success(
      "EVM-compatible crypto",
      payload
    );
  }

  if (
    isTronAddress(
      payload
    )
  ) {
    return success(
      "TRON",
      payload
    );
  }

  if (
    isXrpAddress(
      payload
    )
  ) {
    return success(
      "XRP",
      payload
    );
  }

  if (
    isStellarAddress(
      payload
    )
  ) {
    return success(
      "Stellar",
      payload
    );
  }

  if (
    isCardanoAddress(
      payload
    )
  ) {
    return success(
      "Cardano",
      payload
    );
  }

  if (
    isSolanaAddress(
      payload
    )
  ) {
    return success(
      "Solana",
      payload
    );
  }
  
  if (
    /^https?:\/\//i.test(
      payload
    )
  ) {
    return {
      ok: true,
      type: "website",
      network: "Website",
      address: payload,
      copiedAutomatically: false
    };
  }
  
  if (
    /^mailto:/i.test(
      payload
    )
  ) {
    return {
      ok: true,
      type: "email",
      network: "Email",
      address:
        payload
          .replace(
            /^mailto:/i,
            ""
          )
          .split(
            "?"
          )[0]
          .trim(),
      copiedAutomatically: false
    };
  }
  
  if (
    /^MATMSG:/i.test(
      payload
    )
  ) {
    return parseMatmsgPayload(
      payload
    );
  }
  
  if (
    /^tel:/i.test(
      payload
    )
  ) {
    return extractPhoneRecipient(
      payload
    );
  }
  
  if (
    /^sms:/i.test(
      payload
    )
  ) {
    return extractSmsRecipient(
      payload
    );
  }

  if (
    /^smsto:/i.test(
      payload
    )
  ) {
    return extractSmsRecipient(
      payload
    );
  }
  
  if (
    /^BEGIN:VCARD/i.test(
      payload.trim()
    ) &&
    /END:VCARD/i.test(
      payload.trim()
    )
  ) {
    return parseVcardPayload(
      payload
    );
  }
  if (
    /^MECARD:/i.test(
      payload.trim()
    )
  ) {
    return parseMecardPayload(
      payload
    );
  }
  if (
    (
      /^BEGIN:VCALENDAR/i.test(
        payload.trim()
      ) ||
      /^BEGIN:VEVENT/i.test(
        payload.trim()
      )
    ) &&
    (
      /END:VCALENDAR/i.test(
        payload.trim()
      ) ||
      /END:VEVENT/i.test(
        payload.trim()
      )
    )
  ) {
  return parseCalendarPayload(
    payload
  );
}
  
  if (
    /^ln[a-z0-9]+$/i.test(
      payload
    )
  ) {
    return {
      ok: false,
      error:
        "This is a Bitcoin Lightning invoice, not a reusable wallet address."
    };
  }

  return {
    ok: false,
    error:
      "QR detected, but no supported payment data was found."
  };
}

function isQrisPayload(
  payload
) {
  if (
    !/^000201/i.test(
      payload
    ) ||
    !/5802ID/i.test(
      payload
    )
  ) {
    return false;
  }

  const fields =
    parseTlvFields(
      payload
    );

  if (
    !fields.ok
  ) {
    return false;
  }

  return (
    findQrisMerchantAccount(
      fields.values
    ) !== null
  );
}

function parseQrisPayload(
  payload
) {
  const fields =
    parseTlvFields(
      payload
    );

  if (
    !fields.ok
  ) {
    return {
      ok: false,
      error:
        fields.error
    };
  }

  const merchantAccount =
    findQrisMerchantAccount(
      fields.values
    );

  if (
    !merchantAccount
  ) {
    return {
      ok: false,
      error:
        "QRIS detected, but National Merchant ID was not found."
    };
  }

  const merchantName =
    fields.values["59"] ||
    "";

  const nationalMerchantId =
    merchantAccount.values["02"] ||
    "";

  if (
    !merchantName ||
    !nationalMerchantId
  ) {
    return {
      ok: false,
      error:
        "QRIS Merchant Name or National Merchant ID is missing."
    };
  }

  return {
    ok: true,
    type: "qris",
    network: "QRIS",
    merchantName,
    nationalMerchantId,
    merchantCity:
      fields.values["60"] ||
      "",
    amount:
      fields.values["54"] ||
      "",
    currency:
      fields.values["53"] ||
      "",
    country:
      fields.values["58"] ||
      "",
    merchantAccountId:
      merchantAccount.values["00"] ||
      "",
    merchantCriteria:
      merchantAccount.values["03"] ||
      "",
    copiedAutomatically: false
  };
}

function findQrisMerchantAccount(
  topLevelValues
) {
  const tags =
    Object.keys(
      topLevelValues
    ).filter(
      (tag) =>
        Number(tag) >= 26 &&
        Number(tag) <= 51
    );

  for (
    const tag of tags
  ) {
    const nested =
      parseTlvFields(
        topLevelValues[tag]
      );

    if (
      !nested.ok
    ) {
      continue;
    }

    if (
      nested.values["00"] ===
      "ID.CO.QRIS.WWW"
    ) {
      return nested;
    }
  }

  return null;
}

function isPixPayload(
  payload
) {
  return (
    /^000201/i.test(
      payload
    ) &&
    payload.includes(
      "br.gov.bcb.pix"
    )
  );
}

function parsePixPayload(
  payload
) {
  const fields =
    parseTlvFields(
      payload
    );

  if (
    !fields.ok
  ) {
    return {
      ok: false,
      error:
        fields.error
    };
  }

  const merchantName =
    fields.values["59"] ||
    "";

  const merchantCity =
    fields.values["60"] ||
    "";

  if (
    !merchantName ||
    !merchantCity
  ) {
    return {
      ok: false,
      error:
        "Pix Merchant Name or Merchant City is missing."
    };
  }

  const merchantAccount =
    fields.values["26"] ||
    "";

  const nested =
    parseTlvFields(
      merchantAccount
    );

  return {
    ok: true,
    type: "pix",
    network: "Pix",
    merchantName,
    merchantCity,
    pixKey:
      nested.ok
        ? nested.values["01"] ||
          ""
        : "",
    amount:
      fields.values["54"] ||
      "",
    currency:
      fields.values["53"] ||
      "",
    country:
      fields.values["58"] ||
      "",
    transactionId:
      getNestedValue(
        fields.values["62"] ||
          "",
        "05"
      ),
    copiedAutomatically: false
  };
}

function parseTlvFields(
  payload
) {
  const values = {};
  let position = 0;

  while (
    position < payload.length
  ) {
    if (
      position + 4 >
      payload.length
    ) {
      return {
        ok: false,
        error:
          "Invalid QR field structure."
      };
    }

    const tag =
      payload.slice(
        position,
        position + 2
      );

    const lengthText =
      payload.slice(
        position + 2,
        position + 4
      );

    const length =
      Number(
        lengthText
      );

    if (
      !/^\d{2}$/.test(
        tag
      ) ||
      !/^\d{2}$/.test(
        lengthText
      )
    ) {
      return {
        ok: false,
        error:
          "Invalid QR field length."
      };
    }

    const valueStart =
      position + 4;

    const valueEnd =
      valueStart + length;

    if (
      valueEnd >
      payload.length
    ) {
      return {
        ok: false,
        error:
          "QR field exceeds payload length."
      };
    }

    values[tag] =
      payload.slice(
        valueStart,
        valueEnd
      );

    position =
      valueEnd;
  }

  return {
    ok: true,
    values
  };
}

/*
  ============================================================
  Parse MATMSG email QR payload
  ------------------------------------------------------------
  Reads MATMSG payloads containing TO, SUB, and BODY fields.

  Example:
    MATMSG:TO:person@example.com;SUB:Subject;BODY:Message;;

  Returns normalized email data for popup rendering.
  ============================================================
*/
function parseMatmsgPayload(
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

  const parts =
    value.split(
      ";"
    );

  parts.forEach(
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

  if (
    !to
  ) {
    return {
      ok: false,
      error:
        "MATMSG email recipient was not found."
    };
  }

  return {
    ok: true,
    type: "email",
    network: "Email",
    address: to,
    emailFormat: "MATMSG",
    emailTo: to,
    emailSubject:
      fields.SUB ||
      "",
    emailBody:
      fields.BODY ||
      "",
    copiedAutomatically: false
  };
}

function getNestedValue(
  payload,
  wantedTag
) {
  const parsed =
    parseTlvFields(
      payload
    );

  if (
    !parsed.ok
  ) {
    return "";
  }

  return (
    parsed.values[
      wantedTag
    ] || ""
  );
}

function extractUpiRecipient(
  payload
) {
  try {
    const url =
      new URL(
        payload
      );

    const address =
      url.searchParams
        .get(
          "pa"
        )
        ?.trim();

    if (
      !address
    ) {
      return {
        ok: false,
        error:
          "UPI ID was not found."
      };
    }

    return {
      ok: true,
      type: "upi",
      network: "UPI",
      address,
      upiId: address,
      payeeName:
        url.searchParams
          .get(
            "pn"
          ) || "",
      amount:
        url.searchParams
          .get(
            "am"
          ) || "",
      currency:
        url.searchParams
          .get(
            "cu"
          ) || "",
      note:
        url.searchParams
          .get(
            "tn"
          ) || "",
      copiedAutomatically: false
    };
  } catch {
    return {
      ok: false,
      error:
        "The UPI payment QR is invalid."
    };
  }
}

function extractBitcoinRecipient(
  payload
) {
  const value =
    payload.replace(
      /^bitcoin:/i,
      ""
    );

  const parts =
    value.split(
      "?"
    );

  const address =
    parts[0].trim();

  if (
    !isBitcoinAddress(
      address
    )
  ) {
    return {
      ok: false,
      error:
        "No valid Bitcoin address was found."
    };
  }

  const parameters =
    new URLSearchParams(
      parts[1] || ""
    );

  return {
    ok: true,
    type: "crypto",
    network: "Bitcoin",
    address,
    amount:
      parameters.get(
        "amount"
      ) || "",
    label:
      parameters.get(
        "label"
      ) || "",
    message:
      parameters.get(
        "message"
      ) || "",
    copiedAutomatically: false
  };
}

function extractEthereumRecipient(
  payload
) {
  const value =
    payload.replace(
      /^ethereum:/i,
      ""
    );

  const queryIndex =
    value.indexOf(
      "?"
    );

  const base =
    queryIndex === -1
      ? value
      : value.slice(
          0,
          queryIndex
        );

  const query =
    queryIndex === -1
      ? ""
      : value.slice(
          queryIndex + 1
        );

  const parameters =
    new URLSearchParams(
      query
    );

  const transferRecipient =
    parameters.get(
      "address"
    );

  if (
    transferRecipient &&
    isEvmAddress(
      transferRecipient
    )
  ) {
    return {
      ok: true,
      type: "crypto",
      network:
        "Ethereum/EVM token payment",
      address:
        transferRecipient,
      tokenContract:
        base.split(
          "/"
        )[1] || "",
      copiedAutomatically: false
    };
  }

  const slashIndex =
    base.indexOf(
      "/"
    );

  const target =
    slashIndex === -1
      ? base
      : base.slice(
          0,
          slashIndex
        );

  const address =
    target.split(
      "@"
    )[0];

  if (
    isEvmAddress(
      address
    )
  ) {
    return {
      ok: true,
      type: "crypto",
      network:
        "Ethereum/EVM",
      address,
      chainId:
        target.includes(
          "@"
        )
          ? target.split(
              "@"
            )[1]
          : "",
      copiedAutomatically: false
    };
  }

  return {
    ok: false,
    error:
      "No Ethereum recipient address was found."
  };
}

function extractSolanaRecipient(
  payload
) {
  const value =
    payload.replace(
      /^solana:/i,
      ""
    );

  const address =
    value.split(
      "?"
    )[0].trim();

  if (
    !isSolanaAddress(
      address
    )
  ) {
    return {
      ok: false,
      error:
        "No valid Solana recipient address was found."
    };
  }

  const parameters =
    new URLSearchParams(
      value.split(
        "?"
      )[1] || ""
    );

  return {
    ok: true,
    type: "crypto",
    network: "Solana",
    address,
    tokenMint:
      parameters.get(
        "spl-token"
      ) || "",
    amount:
      parameters.get(
        "amount"
      ) || "",
    label:
      parameters.get(
        "label"
      ) || "",
    message:
      parameters.get(
        "message"
      ) || "",
    copiedAutomatically: false
  };
}
/*
  ============================================================
  Parse SMS QR payload
  ------------------------------------------------------------
  Reads sms: and smsto: QR payloads containing a phone number
  and an optional pre-filled message.

  Supported examples:
    sms:+919876543210?body=Hello
    smsto:+919876543210:Hello

  The message is displayed as a draft only. The extension does
  not send SMS messages automatically.
  ============================================================
*/
function extractSmsRecipient(
  payload
) {
  const rawValue =
    payload
      .trim()
      .replace(
        /^sms(?:to)?:/i,
        ""
      );

  let phone =
    "";

  let message =
    "";

  if (
    /^sms:/i.test(
      payload
    )
  ) {
    const questionIndex =
      rawValue.indexOf(
        "?"
      );

    const phonePart =
      questionIndex ===
        -1
        ? rawValue
        : rawValue.slice(
            0,
            questionIndex
          );

    const queryPart =
      questionIndex ===
        -1
        ? ""
        : rawValue.slice(
            questionIndex + 1
          );

    const parameters =
      new URLSearchParams(
        queryPart
      );

    phone =
      phonePart.trim();

    message =
      parameters.get(
        "body"
      ) ||
      "";
  } else {
    const separatorIndex =
      rawValue.indexOf(
        ":"
      );

    if (
      separatorIndex ===
      -1
    ) {
      phone =
        rawValue.trim();
    } else {
      phone =
        rawValue
          .slice(
            0,
            separatorIndex
          )
          .trim();

      message =
        rawValue
          .slice(
            separatorIndex + 1
          )
          .trim();
    }
  }

  if (
    !phone
  ) {
    return {
      ok: false,
      error:
        "SMS recipient phone number was not found."
    };
  }

  const phoneResult =
    parsePhoneNumberForResult(
      phone
    );

  return {
    ok: true,
    type: "sms",
    network: "SMS",
    address: phone,
    formattedNumber:
      phoneResult.formattedNumber,
    internationalNumber:
      phoneResult.internationalNumber,
    nationalNumber:
      phoneResult.nationalNumber,
    country:
      phoneResult.country,
    countryCallingCode:
      phoneResult.countryCallingCode,
    isValid:
      phoneResult.isValid,
    validationStatus:
      phoneResult.validationStatus,
    message,
    copiedAutomatically: false
  };
}

/*
  ============================================================
  Parse telephone QR payload
  ------------------------------------------------------------
  Reads tel: QR payloads, formats the phone number, identifies
  the country, and checks whether the number has a valid
  country-specific structure.

  The validation is structural only. It does not confirm that
  the number is active or belongs to a particular person.
  ============================================================
*/
function extractPhoneRecipient(
  payload
) {
  const value =
    payload
      .trim()
      .replace(
        /^tel:/i,
        ""
      );

  const rawNumber =
    value
      .split(
        ";"
      )[0]
      .trim();

  if (
    !rawNumber
  ) {
    return {
      ok: false,
      error:
        "Phone number was not found."
    };
  }

  const parsed =
    parsePhoneNumberForResult(
      rawNumber
    );

  return {
    ok: true,
    type: "phone",
    network: "Telephone",
    address: rawNumber,
    formattedNumber:
      parsed.formattedNumber,
    internationalNumber:
      parsed.internationalNumber,
    nationalNumber:
      parsed.nationalNumber,
    country:
      parsed.country,
    countryCallingCode:
      parsed.countryCallingCode,
    isValid:
      parsed.isValid,
    validationStatus:
      parsed.validationStatus,
    copiedAutomatically: false
  };
}

function parsePhoneNumberForResult(
  rawNumber
) {
  const fallback =
    {
      formattedNumber:
        rawNumber,
      internationalNumber:
        rawNumber,
      nationalNumber:
        rawNumber,
      country:
        "Unknown",
      countryCallingCode:
        "",
      isValid:
        false,
      validationStatus:
        "Could not validate"
    };

  if (
    typeof libphonenumber ===
    "undefined"
  ) {
    return fallback;
  }

  try {
    const parsed =
      libphonenumber
        .parsePhoneNumberFromString(
          rawNumber
        );

    if (
      !parsed
    ) {
      return fallback;
    }

    const isValid =
      parsed.isValid();

    return {
      formattedNumber:
        isValid
          ? parsed.formatInternational()
          : rawNumber,

      internationalNumber:
        parsed.number ||
        rawNumber,

      nationalNumber:
        isValid
          ? parsed.formatNational()
          : rawNumber,

      country:
        parsed.country ||
        "Unknown",

      countryCallingCode:
        parsed.countryCallingCode
          ? `+${parsed.countryCallingCode}`
          : "",

      isValid,

      validationStatus:
        isValid
          ? "Structurally valid"
          : "Invalid phone number"
    };
  } catch {
    return fallback;
  }
}

/*
  ============================================================
  Parse vCard contact QR payload
  ------------------------------------------------------------
  Reads vCard contact fields such as FN, ORG, TITLE, TEL,
  EMAIL, ADR, URL, and NOTE.

  Example:
    BEGIN:VCARD
    VERSION:3.0
    FN:Jane Smith
    TEL:+919876543210
    EMAIL:jane@example.com
    END:VCARD
  ============================================================
*/
function parseVcardPayload(
  payload
) {
  const normalized =
    payload
      .replace(
        /\r\n[ \t]/g,
        ""
      )
      .replace(
        /\n[ \t]/g,
        ""
      );

  const lines =
    normalized.split(
      /\r?\n/
    );

  const contact = {
    name: "",
    organization: "",
    title: "",
    phones: [],
    emails: [],
    address: "",
    website: "",
    note: ""
  };

  lines.forEach(
    (line) => {
      const separator =
        line.indexOf(
          ":"
        );

      if (
        separator ===
        -1
      ) {
        return;
      }

      const property =
        line
          .slice(
            0,
            separator
          )
          .split(
            ";"
          )[0]
          .trim()
          .toUpperCase();

      const value =
        unescapeVcardValue(
          line.slice(
            separator + 1
          )
        );

      if (
        !value
      ) {
        return;
      }

      if (
        property ===
        "FN"
      ) {
        contact.name =
          value;
      } else if (
        property ===
        "ORG"
      ) {
        contact.organization =
          value;
      } else if (
        property ===
        "TITLE"
      ) {
        contact.title =
          value;
      } else if (
        property ===
        "TEL"
      ) {
        contact.phones.push(
          value
        );
      } else if (
        property ===
        "EMAIL"
      ) {
        contact.emails.push(
          value
        );
      } else if (
        property ===
        "ADR"
      ) {
        contact.address =
          formatVcardAddress(
            value
          );
      } else if (
        property ===
        "URL"
      ) {
        contact.website =
          value;
      } else if (
        property ===
        "NOTE"
      ) {
        contact.note =
          value;
      }
    }
  );

  contact.phones =
    uniquePayloadValues(
      contact.phones
    );

  contact.emails =
    uniquePayloadValues(
      contact.emails
    );

  if (
    !contact.name &&
    contact.phones.length ===
      0 &&
    contact.emails.length ===
      0
  ) {
    return {
      ok: false,
      error:
        "Contact QR was detected, but no contact information was found."
    };
  }

  return {
    ok: true,
    type: "contact",
    network: "vCard",
    contactName:
      contact.name,
    contactOrganization:
      contact.organization,
    contactTitle:
      contact.title,
    contactPhones:
      contact.phones,
    contactEmails:
      contact.emails,
    contactAddress:
      contact.address,
    contactWebsite:
      contact.website,
    contactNote:
      contact.note,
    copiedAutomatically: false
  };
}
/*
  ============================================================
  Parse MECARD contact QR payload
  ------------------------------------------------------------
  Reads compact MECARD contact fields such as N, ORG, TEL,
  EMAIL, ADR, URL, and NOTE.

  Example:
    MECARD:N:Smith,Jane;ORG:Example Company;TEL:+919876543210;EMAIL:jane@example.com;URL:https://example.com;;
  ============================================================
*/
function parseMecardPayload(
  payload
) {
  const value =
    payload
      .trim()
      .replace(
        /^MECARD:/i,
        ""
      )
      .replace(
        /;;$/,
        ""
      );

  const contact = {
    name: "",
    organization: "",
    title: "",
    phones: [],
    emails: [],
    address: "",
    website: "",
    note: ""
  };

  const fields =
    splitMecardFields(
      value
    );

  fields.forEach(
    (field) => {
      const separator =
        field.indexOf(
          ":"
        );

      if (
        separator ===
        -1
      ) {
        return;
      }

      const key =
        field
          .slice(
            0,
            separator
          )
          .trim()
          .toUpperCase();

      const fieldValue =
        unescapeMecardValue(
          field.slice(
            separator + 1
          )
        );

      if (
        !fieldValue
      ) {
        return;
      }

      if (
        key ===
        "N"
      ) {
        contact.name =
          formatMecardName(
            fieldValue
          );
      } else if (
        key ===
        "ORG"
      ) {
        contact.organization =
          fieldValue;
      } else if (
        key ===
        "TITLE"
      ) {
        contact.title =
          fieldValue;
      } else if (
        key ===
        "TEL"
      ) {
        contact.phones.push(
          fieldValue
        );
      } else if (
        key ===
        "EMAIL"
      ) {
        contact.emails.push(
          fieldValue
        );
      } else if (
        key ===
        "ADR"
      ) {
        contact.address =
          fieldValue;
      } else if (
        key ===
        "URL"
      ) {
        contact.website =
          fieldValue;
      } else if (
        key ===
        "NOTE"
      ) {
        contact.note =
          fieldValue;
      }
    }
  );

  contact.phones =
    uniquePayloadValues(
      contact.phones
    );

  contact.emails =
    uniquePayloadValues(
      contact.emails
    );

  if (
    !contact.name &&
    contact.phones.length ===
      0 &&
    contact.emails.length ===
      0
  ) {
    return {
      ok: false,
      error:
        "MECARD contact information was not found."
    };
  }

  return {
    ok: true,
    type: "contact",
    network: "MECARD",
    contactName:
      contact.name,
    contactOrganization:
      contact.organization,
    contactTitle:
      contact.title,
    contactPhones:
      contact.phones,
    contactEmails:
      contact.emails,
    contactAddress:
      contact.address,
    contactWebsite:
      contact.website,
    contactNote:
      contact.note,
    copiedAutomatically: false
  };
}
function splitMecardFields(
  value
) {
  const fields =
    [];

  let current =
    "";

  let escaped =
    false;

  for (
    const character of value
  ) {
    if (
      escaped
    ) {
      current +=
        character;

      escaped =
        false;

      continue;
    }

    if (
      character ===
      "\\"
    ) {
      current +=
        character;

      escaped =
        true;

      continue;
    }

    if (
      character ===
      ";"
    ) {
      if (
        current
      ) {
        fields.push(
          current
        );
      }

      current =
        "";

      continue;
    }

    current +=
      character;
  }

  if (
    current
  ) {
    fields.push(
      current
    );
  }

  return fields;
}
/*
  ============================================================
  Parse calendar event QR payload
  ------------------------------------------------------------
  Reads iCalendar payloads containing a VCALENDAR and VEVENT
  block.

  Supported fields include SUMMARY, DTSTART, DTEND,
  LOCATION, DESCRIPTION, URL, and UID.

  The event is displayed only. It is not automatically added
  to the user's calendar.
  ============================================================
*/
function parseCalendarPayload(
  payload
) {
  const normalized =
    payload
      .replace(
        /\r\n[ \t]/g,
        ""
      )
      .replace(
        /\n[ \t]/g,
        ""
      );

  const lines =
    normalized.split(
      /\r?\n/
    );

  const event = {
    uid: "",
    title: "",
    start: "",
    end: "",
    location: "",
    description: "",
    url: "",
    organizer: ""
  };

  let insideEvent =
    false;

  lines.forEach(
    (line) => {
      const cleanLine =
        line.trim();

      if (
        cleanLine.toUpperCase() ===
        "BEGIN:VEVENT"
      ) {
        insideEvent =
          true;

        return;
      }

      if (
        cleanLine.toUpperCase() ===
        "END:VEVENT"
      ) {
        insideEvent =
          false;

        return;
      }

      if (
        !insideEvent
      ) {
        return;
      }

      const separator =
        cleanLine.indexOf(
          ":"
        );

      if (
        separator ===
        -1
      ) {
        return;
      }

      const property =
        cleanLine
          .slice(
            0,
            separator
          )
          .split(
            ";"
          )[0]
          .trim()
          .toUpperCase();

      const value =
        unescapeCalendarValue(
          cleanLine.slice(
            separator + 1
          )
        );

      if (
        property ===
        "UID"
      ) {
        event.uid =
          value;
      } else if (
        property ===
        "SUMMARY"
      ) {
        event.title =
          value;
      } else if (
        property ===
        "DTSTART"
      ) {
        event.start =
          value;
      } else if (
        property ===
        "DTEND"
      ) {
        event.end =
          value;
      } else if (
        property ===
        "LOCATION"
      ) {
        event.location =
          value;
      } else if (
        property ===
        "DESCRIPTION"
      ) {
        event.description =
          value;
      } else if (
        property ===
        "URL"
      ) {
        event.url =
          value;
      } else if (
        property ===
        "ORGANIZER"
      ) {
        event.organizer =
          value;
      }
    }
  );

  if (
    !event.title &&
    !event.start &&
    !event.end
  ) {
    return {
      ok: false,
      error:
        "Calendar QR was detected, but no event information was found."
    };
  }

  return {
    ok: true,
    type: "event",
    network: "Calendar",
    eventUid:
      event.uid,
    eventTitle:
      event.title,
    eventStart:
      event.start,
    eventEnd:
      event.end,
    eventLocation:
      event.location,
    eventDescription:
      event.description,
    eventUrl:
      event.url,
    eventOrganizer:
      event.organizer,
    copiedAutomatically: false
  };
}
function unescapeCalendarValue(
  value
) {
  return value
    .replace(
      /\\n/gi,
      "\n"
    )
    .replace(
      /\\,/g,
      ","
    )
    .replace(
      /\\;/g,
      ";"
    )
    .replace(
      /\\\\/g,
      "\\"
    )
    .trim();
}

function unescapeMecardValue(
  value
) {
  return value
    .replace(
      /\\n/gi,
      "\n"
    )
    .replace(
      /\\,/g,
      ","
    )
    .replace(
      /\\;/g,
      ";"
    )
    .replace(
      /\\\\/g,
      "\\"
    )
    .trim();
}

function formatMecardName(
  value
) {
  const parts =
    value.split(
      ","
    );

  if (
    parts.length >=
    2
  ) {
    return [
      parts[1].trim(),
      parts[0].trim()
    ]
      .filter(
        Boolean
      )
      .join(
        " "
      );
  }

  return value.trim();
}

function unescapeVcardValue(
  value
) {
  return value
    .replace(
      /\\n/gi,
      "\n"
    )
    .replace(
      /\\,/g,
      ","
    )
    .replace(
      /\\;/g,
      ";"
    )
    .replace(
      /\\\\/g,
      "\\"
    )
    .trim();
}

function formatVcardAddress(
  value
) {
  const parts =
    value.split(
      ";"
    );

  return parts
    .filter(
      Boolean
    )
    .join(
      ", "
    )
    .trim();
}

function uniquePayloadValues(
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

function extractSchemeAddress(
  payload,
  scheme,
  network
) {
  const value =
    payload.replace(
      new RegExp(
        `^${scheme}:`,
        "i"
      ),
      ""
    );

  const address =
    value.split(
      "?"
    )[0].trim();

  if (
    !address
  ) {
    return {
      ok: false,
      error:
        `${network} address was not found.`
    };
  }

  return {
    ok: true,
    type: "crypto",
    network,
    address,
    copiedAutomatically: false
  };
}

function success(
  network,
  address
) {
  return {
    ok: true,
    type: "crypto",
    network,
    address,
    copiedAutomatically: false
  };
}

function isBitcoinAddress(
  value
) {
  return (
    /^(bc1)[a-z0-9]{11,87}$/i.test(
      value
    ) ||
    /^(tb1)[a-z0-9]{11,87}$/i.test(
      value
    ) ||
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(
      value
    )
  );
}

function isEvmAddress(
  value
) {
  return /^0x[a-fA-F0-9]{40}$/.test(
    value
  );
}

function isTronAddress(
  value
) {
  return /^T[a-zA-Z0-9]{33}$/.test(
    value
  );
}

function isXrpAddress(
  value
) {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(
    value
  );
}

function isStellarAddress(
  value
) {
  return /^G[A-Z2-7]{55}$/.test(
    value
  );
}

function isCardanoAddress(
  value
) {
  return /^addr(_test)?1[a-z0-9]+$/i.test(
    value
  );
}

function isSolanaAddress(
  value
) {
  return (
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(
      value
    ) &&
    !/^G[A-Z2-7]{55}$/.test(
      value
    )
  );
}

async function copyToClipboard(
  text
) {
  const textArea =
    document.createElement(
      "textarea"
    );

  textArea.value =
    text;

  textArea.style.position =
    "fixed";

  textArea.style.left =
    "-9999px";

  document.body.appendChild(
    textArea
  );

  textArea.select();

  const copied =
    document.execCommand(
      "copy"
    );

  textArea.remove();

  if (
    !copied
  ) {
    throw new Error(
      "Could not copy QR details."
    );
  }
}

function loadImage(
  dataUrl
) {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      image.onload = () => {
        resolve(image);
      };

      image.onerror = () => {
        reject(
          new Error(
            "Could not load screenshot."
          )
        );
      };

      image.src =
        dataUrl;
    }
  );
}
