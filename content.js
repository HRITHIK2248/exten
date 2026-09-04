"use strict";

/*
  ============================================================
  1. Selection state
  ------------------------------------------------------------
  These variables remember whether Snapshot mode is active,
  where the mouse drag started, and which overlay elements
  are currently displayed on the webpage.
  ============================================================
*/

let selectionActive =
  false;

let selectionStartX =
  0;

let selectionStartY =
  0;

let selectionOverlay =
  null;

let selectionBox =
  null;


/*
  ============================================================
  2. Message listener
  ------------------------------------------------------------
  The popup or background script sends commands here.

  START_SNAPSHOT_SELECTION:
    Starts the red area-selection tool.

  START_SELECTION:
    Keeps compatibility with any older selection workflow.

  HIDE_SCAN_STATUS:
    Removes an old scan status message.

  QR_SCAN_STATUS:
    Displays a temporary status message.

  PAYMENT_RESULT:
    Displays a payment result on the webpage.
  ============================================================
*/
browser.runtime.onMessage.addListener(
  (message) => {
    if (
      message.type ===
      "START_SNAPSHOT_SELECTION"
    ) {
      startSnapshotSelection();

      return false;
    }

    if (
      message.type ===
      "START_SELECTION"
    ) {
      startSelection();

      return false;
    }

    if (
      message.type ===
      "HIDE_SCAN_STATUS"
    ) {
      removeScanStatus();

      return false;
    }

    if (
      message.type ===
      "QR_SCAN_STATUS"
    ) {
      showMessage(
        "Status",
        message.text,
        "neutral"
      );

      return false;
    }

    if (
      message.type ===
      "PAYMENT_RESULT"
    ) {
      showPaymentResult(
        message.result
      );

      return false;
    }

    if (
      message.type ===
      "ANALYZE_WEBPAGE"
    ) {
    const text =
        collectPageText();

      const links =
        collectPageLinks();
      
      console.log("[Link Collector] Returned links:", links.length, links.slice(0, 10));
      
      console.log(
        "[content] Page analysis text length:",
        text.length
      );

      console.log(
        "[content] Page analysis link count:",
        links.length
      );

      return Promise.resolve({
        ok: true,
        text,
        links
      }); 
    }
    return false;
  }
);



/*
  ============================================================
  3. Start Snapshot selection
  ------------------------------------------------------------
  Creates a full-page transparent overlay.

  The overlay captures the mouse drag without changing the
  actual webpage content. The red rectangle shows the area
  selected by the user.
  ============================================================
*/

function startSnapshotSelection() {
  if (
    selectionActive
  ) {
    return;
  }

  selectionActive =
    true;

  selectionOverlay =
    document.createElement(
      "div"
    );

  selectionBox =
    document.createElement(
      "div"
    );

  selectionOverlay.id =
    "__qr_snapshot_overlay__";

  selectionBox.id =
    "__qr_snapshot_selection__";

  selectionOverlay.style.position =
    "fixed";

  selectionOverlay.style.inset =
    "0";

  selectionOverlay.style.zIndex =
    "2147483646";

  selectionOverlay.style.cursor =
    "crosshair";

  selectionOverlay.style.background =
    "rgba(0, 0, 0, 0.08)";

  selectionBox.style.position =
    "fixed";

  selectionBox.style.display =
    "none";

  selectionBox.style.zIndex =
    "2147483647";

  selectionBox.style.border =
    "2px solid #ff1744";

  selectionBox.style.background =
    "rgba(255, 23, 68, 0.08)";

  selectionOverlay.appendChild(
    selectionBox
  );

  document.documentElement.appendChild(
    selectionOverlay
  );

  selectionOverlay.addEventListener(
    "mousedown",
    handleSelectionStart
  );

  selectionOverlay.addEventListener(
    "mousemove",
    handleSelectionMove
  );

  selectionOverlay.addEventListener(
    "mouseup",
    handleSelectionEnd
  );

  document.addEventListener(
    "keydown",
    handleSelectionEscape,
    true
  );
}


/*
  ============================================================
  4. Mouse selection handlers
  ------------------------------------------------------------
  These functions control the drag operation:

  mousedown:
    Saves the starting point.

  mousemove:
    Updates the visible red selection box.

  mouseup:
    Calculates the final area, extracts only useful text,
    and sends the snapshot request to the background script.
  ============================================================
*/

function handleSelectionStart(
  event
) {
  if (
    event.button !==
    0
  ) {
    return;
  }

  selectionStartX =
    event.clientX;

  selectionStartY =
    event.clientY;

  selectionBox.style.display =
    "block";

  updateSelectionBox(
    event.clientX,
    event.clientY
  );

  event.preventDefault();
}

function handleSelectionMove(
  event
) {
  if (
    !selectionBox ||
    selectionBox.style.display !==
      "block"
  ) {
    return;
  }

  updateSelectionBox(
    event.clientX,
    event.clientY
  );

  event.preventDefault();
}

function handleSelectionEnd(event) {
  if (
    !selectionBox ||
    selectionBox.style.display !== "block"
  ) {
    return;
  }

  const selection =
    getSelectionRectangle(
      event.clientX,
      event.clientY
    );

  if (
    selection.width < 10 ||
    selection.height < 10
  ) {
    cancelSnapshotSelection();
    return;
  }

  const selectedText =
    extractTextFromArea(
      selection
    );

  console.log(
    "[content] Snapshot selected text:",
    selectedText
  );

  removeSelectionOverlay();

  browser.runtime.sendMessage({
    type: "SNAPSHOT_SELECTION",
    selection,
    selectedText
  });

  event.preventDefault();
}


/*
  ============================================================
  5. Draw and calculate the selection rectangle
  ------------------------------------------------------------
  This keeps the visible red rectangle aligned with the
  user's mouse movement.
  ============================================================
*/

function updateSelectionBox(
  currentX,
  currentY
) {
  const selection =
    getSelectionRectangle(
      currentX,
      currentY
    );

  selectionBox.style.left =
    `${selection.left}px`;

  selectionBox.style.top =
    `${selection.top}px`;

  selectionBox.style.width =
    `${selection.width}px`;

  selectionBox.style.height =
    `${selection.height}px`;
}

function getSelectionRectangle(
  currentX,
  currentY
) {
  const left =
    Math.min(
      selectionStartX,
      currentX
    );

  const top =
    Math.min(
      selectionStartY,
      currentY
    );

  const right =
    Math.max(
      selectionStartX,
      currentX
    );

  const bottom =
    Math.max(
      selectionStartY,
      currentY
    );

  return {
    left,

    top,

    width:
      right -
      left,

    height:
      bottom -
      top,

    viewportWidth:
      window.innerWidth,

    viewportHeight:
      window.innerHeight
  };
}


/*
  ============================================================
  analysize webpage 
 
  ============================================================
*/

function extractTextFromArea(selection) {
  const selectedParts = [];
  const root = document.body;

  if (!root) {
    return "";
  }

  const walker =
    document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT
    );

  let node;

  while (
    (node = walker.nextNode())
  ) {
    const text =
      node.nodeValue
        .replace(/\s+/g, " ")
        .trim();

    if (!text) {
      continue;
    }

    const parent =
      node.parentElement;

    if (
      !parent ||
      shouldIgnoreElement(parent)
    ) {
      continue;
    }

    const range =
      document.createRange();

    range.selectNodeContents(node);

    const rectangles =
      Array.from(
        range.getClientRects()
      );

    const overlaps =
      rectangles.some(
        (rect) =>
          rect.right >
            selection.left &&
          rect.left <
            selection.left +
              selection.width &&
          rect.bottom >
            selection.top &&
          rect.top <
            selection.top +
              selection.height
      );

    if (!overlaps) {
      continue;
    }

    selectedParts.push(text);
  }

  return [
    ...new Set(selectedParts)
  ].join("\n");
}





function analyzeCurrentWebpage() {
  const text =
    getReadablePageText();

  return {
    ok: true,
    text
  };
}

function getReadablePageText() {
  const clone =
    document.body.cloneNode(
      true
    );

  clone
    .querySelectorAll(
      "script, style, noscript, template, svg, canvas, input, textarea, select, option, iframe"
    )
    .forEach(
      (element) => {
        element.remove();
      }
    );

  return (
    clone.innerText ||
    clone.textContent ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();
}












/*
  ============================================================
  7. Decide which elements should be ignored
  ------------------------------------------------------------
  We ignore scripts, styles, metadata, form controls, and the
  extension's own overlay.
  ============================================================
*/

function shouldIgnoreElement(
  element
) {
  const ignoredTags = [
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "TEMPLATE",
    "SVG",
    "CANVAS",
    "INPUT",
    "TEXTAREA",
    "SELECT",
    "OPTION"
  ];

  if (
    ignoredTags.includes(
      element.tagName
    )
  ) {
    return true;
  }

  if (
    element.closest(
      "#__qr_snapshot_overlay__"
    )
  ) {
    return true;
  }

  return false;
}


/*
  ============================================================
  8. Check whether an element is visible
  ------------------------------------------------------------
  getBoundingClientRect() provides viewport coordinates.
  We also check display, visibility, opacity, and dimensions.
  ============================================================
*/

function isVisibleElement(
  element,
  rect
) {
  const styles =
    window.getComputedStyle(
      element
    );

  if (
    styles.display ===
      "none" ||
    styles.visibility ===
      "hidden" ||
    Number(
      styles.opacity
    ) ===
      0
  ) {
    return false;
  }

  if (
    rect.width <=
      0 ||
    rect.height <=
      0
  ) {
    return false;
  }

  /*
    Analyze only content that overlaps the browser screen
    at the moment Analyze webpage is clicked.
  */
  const overlapsViewport =
    rect.bottom >
      0 &&
    rect.right >
      0 &&
    rect.top <
      window.innerHeight &&
    rect.left <
      window.innerWidth;

  if (
    !overlapsViewport
  ) {
    return false;
  }

  return true;
}
/*
  ============================================================
  9. Check rectangle overlap
  ------------------------------------------------------------
  Returns true when the webpage element and the selected
  rectangle share any visible area.
  ============================================================
*/

function rectOverlapsSelection(
  rect,
  selection
) {
  return (
    rect.right >
      selection.left &&
    rect.left <
      selection.left +
        selection.width &&
    rect.bottom >
      selection.top &&
    rect.top <
      selection.top +
        selection.height
  );
}


/*
  ============================================================
  10. Avoid parent-element duplicates
  ------------------------------------------------------------
  A parent such as <div> may contain a heading, paragraph,
  email, and address. We skip that parent when it contains
  another visible text-bearing element.

  This makes the extracted text much smaller and cleaner.
  ============================================================
*/

function containsTextChild(
  element
) {
  const children =
    element.querySelectorAll(
      ":scope > *"
    );

  for (
    const child of children
  ) {
    if (
      shouldIgnoreElement(
        child
      )
    ) {
      continue;
    }

    const rect =
      child.getBoundingClientRect();

    if (
      !isVisibleElement(
        child,
        rect
      )
    ) {
      continue;
    }

    const childText =
      getElementText(
        child
      );

    if (
      childText
    ) {
      return true;
    }
  }

  return false;
}


/*
  ============================================================
  11. Read and normalize visible text
  ------------------------------------------------------------
  innerText represents rendered text more closely than
  textContent, so it is preferable for webpage Snapshot data.
  ============================================================
*/

function getElementText(
  element
) {
  const text =
    element.innerText ||
    "";

  const cleanText =
    text
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  if (
    !cleanText ||
    cleanText.length >
      500
  ) {
    return "";
  }

  return cleanText;
}


/*
  ============================================================
  12. Keyboard cancellation
  ------------------------------------------------------------
  Pressing Escape cancels Snapshot mode and removes the
  overlay without sending any data.
  ============================================================
*/

function handleSelectionEscape(
  event
) {
  if (
    event.key ===
    "Escape"
  ) {
    cancelSnapshotSelection();
  }
}

function cancelSnapshotSelection() {
  removeSelectionOverlay();
}

function removeSelectionOverlay() {
  if (
    selectionOverlay
  ) {
    selectionOverlay.remove();
  }

  selectionOverlay =
    null;

  selectionBox =
    null;

  selectionActive =
    false;

  document.removeEventListener(
    "keydown",
    handleSelectionEscape,
    true
  );
}


/*
  ============================================================
  13. Compatibility helper
  ------------------------------------------------------------
  Some older code may send START_SELECTION. This helper keeps
  that message working by starting the same Snapshot tool.
  ============================================================
*/

function startSelection() {
  startSnapshotSelection();
}


/*
  ============================================================
  14. Scan status messages
  ------------------------------------------------------------
  Removes the temporary scan status created by another part
  of the extension.
  ============================================================
*/

function removeScanStatus() {
  const status =
    document.getElementById(
      "__qr_selection_result__"
    );

  if (
    status
  ) {
    status.remove();
  }
}


/*
  ============================================================
  15. Payment result message
  ------------------------------------------------------------
  Displays the result of a QR/payment scan on the webpage.

  This section is separate from Snapshot text extraction and
  does not copy Snapshot webpage text.
  ============================================================
*/

function showPaymentResult(
  result
) {
  selectionActive =
    false;

  if (
    result &&
    result.type ===
    "snapshot"
  ) {
    showMessage(
      "Snapshot captured",
      "The selected webpage area was captured successfully.",
      "success"
    );

    return;
  }

  if (
    !result ||
    !result.ok
  ) {
    showMessage(
      "Address not found",
      result?.error ||
        "No supported recipient address was found.",
      "error"
    );

    return;
  }

  showMessage(
    `${result.network} address copied`,
    result.address ||
      "Payment details copied.",
    "success"
  );
}


/*
  ============================================================
  16. Display a temporary webpage message
  ------------------------------------------------------------
  Creates a small notification on the webpage.

  This does not copy any webpage text.
  ============================================================
*/

function showMessage(
  title,
  text,
  type
) {
  const oldMessage =
    document.getElementById(
      "__qr_payment_message__"
    );

  if (
    oldMessage
  ) {
    oldMessage.remove();
  }

  const message =
    document.createElement(
      "div"
    );

  const titleElement =
    document.createElement(
      "strong"
    );

  const textElement =
    document.createElement(
      "span"
    );

  message.id =
    "__qr_payment_message__";

  message.style.position =
    "fixed";

  message.style.right =
    "20px";

  message.style.bottom =
    "20px";

  message.style.zIndex =
    "2147483647";

  message.style.maxWidth =
    "360px";

  message.style.padding =
    "12px 14px";

  message.style.borderRadius =
    "8px";

  message.style.fontFamily =
    "Arial, sans-serif";

  message.style.fontSize =
    "13px";

  message.style.lineHeight =
    "1.4";

  message.style.color =
    "#ffffff";

  message.style.boxShadow =
    "0 4px 14px rgba(0, 0, 0, 0.25)";

  if (
    type ===
    "error"
  ) {
    message.style.background =
      "#b42318";
  } else if (
    type ===
    "success"
  ) {
    message.style.background =
      "#087f5b";
  } else {
    message.style.background =
      "#344054";
  }

  titleElement.textContent =
    title;

  textElement.textContent =
    ` ${text}`;

  message.appendChild(
    titleElement
  );

  message.appendChild(
    textElement
  );

  document.documentElement.appendChild(
    message
  );

  setTimeout(
    () => {
      message.remove();
    },
    3500
  );
}

function collectPageText() {
  const parts =
    [];

  const seen =
    new Set();

  const root =
    document.body ||
    document.documentElement;

  if (
    !root
  ) {
    return "";
  }

  const ignoredSelector =
    [
      "script",
      "style",
      "noscript",
      "template",
      "svg",
      "canvas",
      "iframe",
      "#__qr_snapshot_overlay__",
      "#__qr_snapshot_selection__",
      "#__qr_payment_message__"
    ].join(
      ","
    );

  /*
    Read text from the complete document, including content
    below the currently visible viewport. We do not use
    getBoundingClientRect() or isVisibleElement() here.
  */
  const walker =
    document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT
    );

  let node;

  while (
    (node = walker.nextNode())
  ) {
    const parent =
      node.parentElement;

    if (
      !parent ||
      parent.closest(
        ignoredSelector
      )
    ) {
      continue;
    }

    const text =
      node.nodeValue
        .replace(
          /\s+/g,
          " "
        )
        .trim();

    if (
      !text
    ) {
      continue;
    }

    const key =
      text.toLowerCase();

    if (
      seen.has(
        key
      )
    ) {
      continue;
    }

    seen.add(
      key
    );

    parts.push(
      text
    );
  }

    /*
    Include every normal web-link destination in the page.
    link.href returns the browser-resolved absolute URL, so it
    also captures relative href values such as /instagram.
  */
  root
    .querySelectorAll(
      "a[href], area[href]"
    )
    .forEach(
      (link) => {
        if (
          link.closest(
            ignoredSelector
          )
        ) {
          return;
        }

        const href =
          (
            link.href ||
            ""
          )
            .trim();

        if (
          !/^https?:\/\//i.test(
            href
          )
        ) {
          return;
        }

        const key =
          href.toLowerCase();

        if (
          seen.has(
            key
          )
        ) {
          return;
        }

        seen.add(
          key
        );

        parts.push(
          href
        );
      }
    );

  /*
    Also include explicit telephone and email link values.
    They are not placed in the URL list, but allow your normal
    phone/email extraction to inspect them.
  */
  root
    .querySelectorAll(
      'a[href^="tel:"], a[href^="mailto:"]'
    )
    .forEach(
      (link) => {
        if (
          link.closest(
            ignoredSelector
          )
        ) {
          return;
        }

        const rawHref =
          (
            link.getAttribute(
              "href"
            ) ||
            ""
          )
            .trim();

        const value =
          rawHref
            .replace(
              /^tel:/i,
              ""
            )
            .replace(
              /^mailto:/i,
              ""
            )
            .trim();

        if (
          !value
        ) {
          return;
        }

        const key =
          value.toLowerCase();

        if (
          seen.has(
            key
          )
        ) {
          return;
        }

        seen.add(
          key
        );

        parts.push(
          value
        );
      }
    );
  return parts.join(
    "\n"
  );
}


function collectTelegramLinks() {
  const telegramLinks = new Set();

  function searchForTelegramUrl(value) {
    if (typeof value !== "string") {
      return;
    }

    const matches = value.match(
      /https?:\/\/(?:t\.me|telegram\.me|telegram\.dog)\/[^\s"'<>\\]+/gi
    );

    if (matches) {
      for (const url of matches) {
        telegramLinks.add(url.replace(/[),.;]+$/, ""));
      }
    }
  }

  // Search visible page HTML for Telegram URLs.
  searchForTelegramUrl(document.documentElement.innerHTML);

  // Search inline scripts, if the site placed a URL there.
  for (const script of document.scripts) {
    searchForTelegramUrl(script.textContent || "");
  }

  return [...telegramLinks];
}


function collectTawkLinks() {
  const tawkLinks =
    new Set();

  function searchForTawkUrl(
    value
  ) {
    if (
      typeof value !==
      "string"
    ) {
      return;
    }

    const normalized =
      value.replace(
        /\\\//g,
        "/"
      );

    const matches =
      normalized.match(
        /https?:\/\/(?:embed\.)?tawk\.to\/(?:chat\/)?[a-z0-9]+\/[a-z0-9]+/gi
      );

    if (
      !matches
    ) {
      return;
    }

    matches.forEach(
      (url) => {
        const ids =
          url.match(
            /tawk\.to\/(?:chat\/)?([a-z0-9]+)\/([a-z0-9]+)/i
          );

        if (
          !ids
        ) {
          return;
        }

        tawkLinks.add(
          `https://tawk.to/chat/${ids[1]}/${ids[2]}`
        );
      }
    );
  }

  searchForTawkUrl(
    document.documentElement.innerHTML
  );

  Array.from(
    document.scripts
  ).forEach(
    (script) => {
      searchForTawkUrl(
        script.src ||
        ""
      );

      searchForTawkUrl(
        script.textContent ||
        ""
      );
    }
  );

  return [
    ...tawkLinks
  ];
}



function collectApkLinks() {
  const apkLinks =
    new Set();

  const apkMimeType =
    "application/vnd.android.package-archive";

  document
    .querySelectorAll(
      "a[href], area[href]"
    )
    .forEach(
      (link) => {
        const href =
          (
            link.href ||
            ""
          )
            .trim();

        const rawHref =
          (
            link.getAttribute(
              "href"
            ) ||
            ""
          )
            .trim();

        const downloadName =
          (
            link.getAttribute(
              "download"
            ) ||
            ""
          )
            .trim();

        const type =
          (
            link.getAttribute(
              "type"
            ) ||
            ""
          )
            .toLowerCase()
            .trim();

        const linkText =
          (
            link.textContent ||
            ""
          )
            .replace(
              /\s+/g,
              " "
            )
            .trim();

        const hasApkUrl =
          /\.apk(?:[?#]|$)/i.test(
            href
          ) ||
          /\.apk(?:[?#]|$)/i.test(
            rawHref
          );

        const hasApkFilename =
          /\.apk$/i.test(
            downloadName
          );

        const hasApkMimeType =
          type ===
          apkMimeType;

        const hasApkText =
          /\b(?:download|get|install)\s+(?:the\s+)?apk\b|\bandroid\s+apk\b/i.test(
            linkText
          );

        if (
          (
            hasApkUrl ||
            hasApkFilename ||
            hasApkMimeType ||
            hasApkText
          ) &&
          /^https?:\/\//i.test(
            href
          )
        ) {
          apkLinks.add(
            href
          );
        }
      }
    );

  return [
    ...apkLinks
  ];
}


function collectUrlsFromPageHtml() {
  const urls =
    new Set();

  const html =
    (
      document.documentElement.innerHTML ||
      ""
    ).replace(
      /\\\//g,
      "/"
    );

  const matches =
    html.match(
      /https?:\/\/[^\s"'<>\\]+/gi
    ) || [];

  matches.forEach(
    (value) => {
      const candidate =
        value.replace(
          /[),.;]+$/,
          ""
        );

      try {
        const url =
          new URL(
            candidate
          );

        if (
          url.protocol ===
            "https:" ||
          url.protocol ===
            "http:"
        ) {
          urls.add(
            url.href
          );
        }
      } catch {
        // Ignore a non-valid URL-like string.
      }
    }
  );

  return [
    ...urls
  ];
}


function collectPageLinks() {
  const links = new Set();
  const scannedDocuments = new Set();

  function scanDocument(doc, sourceName = "page") {
    // Do not scan the same page twice.
    if (!doc || scannedDocuments.has(doc)) {
      return;
    }

    scannedDocuments.add(doc);

    // Collect normal links from this document.
    const anchors = doc.querySelectorAll("a[href]");

    console.log(
      `[Link Collector] ${sourceName}: found ${anchors.length} links`
    );

    for (const anchor of anchors) {
      const href = anchor.href?.trim();

      if (
        href &&
        (href.startsWith("https://") || href.startsWith("http://"))
      ) {
        links.add(href);
      }
    }

    // Look for iframes/frames inside this document.
    const frames = doc.querySelectorAll("iframe, frame");

    console.log(
      `[Link Collector] ${sourceName}: found ${frames.length} frame(s)`
    );

    for (let index = 0; index < frames.length; index++) {
      const frame = frames[index];

      try {
        const frameDocument = frame.contentDocument;

        // If Firefox allows access, scan that embedded page too.
        if (frameDocument) {
          const frameUrl =
            frameDocument.location?.href ||
            frame.src ||
            "unknown frame URL";

          scanDocument(
            frameDocument,
            `${sourceName} → frame ${index}: ${frameUrl}`
          );
        }
      } catch (error) {
        // This normally happens for a frame from another website.
        console.warn(
          `[Link Collector] Cannot read frame ${index} inside ${sourceName}`,
          error
        );
      }
    }
  }

  // Begin with the main webpage. The function will then scan its frames,
  // and frames within frames, when the browser permits it.
  scanDocument(document, `main page: ${location.href}`);

  // Add Telegram URLs that are stored in page configuration/JavaScript
  // rather than normal <a href="..."> elements.
  for (const telegramUrl of collectTelegramLinks()) {
    links.add(telegramUrl);
  }
  
  
  for (const tawkUrl of collectTawkLinks()) {
    links.add(tawkUrl);
  }
  
  for (
    const apkUrl of
    collectApkLinks()
  ) {
    links.add(
      apkUrl
    );
  }
  
  for (
    const pageUrl of
    collectUrlsFromPageHtml()
  ) {
    links.add(
      pageUrl
    );
  }
  
  const result = [...links];

  console.log(
    `[Link Collector] Total unique HTTP(S) links: ${result.length}`
  );

  console.log(
    "[Link Collector] Telegram links found:",
    result.filter((url) =>
      /(?:t\.me|telegram\.me|telegram\.dog)/i.test(url)
    )
  );

  return result;
}
