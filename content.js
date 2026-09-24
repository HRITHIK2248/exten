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
      return analyzeDynamicWebpage();
    }
    
    if (
      message.type ===
      "FIND_SAFE_DOWNLOAD_CONTROLS"
    ) {
      return findSafeDownloadControls();
    }
    if (
      message.type ===
      "CLICK_SAFE_DOWNLOAD_CONTROL"
    ) {
      return Promise.resolve(
        clickSafeDownloadControl(
          message.selector
        )
      );
    }
    
    
    if (
      message.type ===
      "GET_DOWNLOAD_PAGE_DIAGNOSTIC"
    ) {
      const pageText =
        (
          document.body?.innerText ||
          ""
        )
          .replace(
            /\s+/g,
            " "
          )
          .trim();

      return Promise.resolve(
        {
          ok: true,

          url:
            window.location.href,

          visibility:
            document.visibilityState,

          textHasQuickInstallation:
            /quick\s+installation/i.test(
              pageText
            ),

          textPreview:
            pageText.slice(
              0,
              500
            )
        }
      );
    }
    
    if (
      message.type ===
      "DEBUG_INSTALLATION_TEXT"
    ) {
      return Promise.resolve(
        debugInstallationText()
      );
    }
    
   
    
   return false;
  }
);

function debugInstallationText() {
  const matches =
    [];

  const root =
    document.body ||
    document.documentElement;

  if (!root) {
    return {
      ok: false,
      error: "No document root found."
    };
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
      (
        node.nodeValue ||
        ""
      )
        .replace(
          /\s+/g,
          " "
        )
        .trim();

    if (
      !/^(quick|complete)\s+installation$/i.test(
        text
      )
    ) {
      continue;
    }

    const parent =
      node.parentElement;

    const parentInfo =
      parent
        ? {
            tagName:
              parent.tagName,

            className:
              typeof parent.className ===
              "string"
                ? parent.className
                : "",

            text:
              (
                parent.innerText ||
                parent.textContent ||
                ""
              )
                .replace(
                  /\s+/g,
                  " "
                )
                .trim()
                .slice(
                  0,
                  300
                ),

            outerHTML:
              parent.outerHTML.slice(
                0,
                1000
              ),

            parentTagName:
              parent.parentElement?.tagName ||
              "",

            parentClassName:
              typeof parent.parentElement?.className ===
              "string"
                ? parent.parentElement.className
                : "",

            parentOuterHTML:
              parent.parentElement?.outerHTML?.slice(
                0,
                1500
              ) || ""
          }
        : null;

    matches.push({
      text,
      parent: parentInfo
    });
  }

  return {
    ok: true,
    url: window.location.href,
    matchCount: matches.length,
    matches
  };
}

async function analyzeDynamicWebpage() {
  const mergedText =
    new Set();

  const mergedLinks =
    new Set();

  const mergedSubpageUrls =
    new Set();

  const mergedDirectFiles =
    new Set();

  const mergedPossibleEndpoints =
    new Set();

  const mergedDownloadActions =
    new Set();

  async function mergeCurrentScan() {
    const text =
      collectPageText();

    const links =
      collectPageLinks();

    const subpageUrls =
      await collectSameSiteSubpageUrls();

    const downloadCandidates =
      collectDownloadCandidates();

    text
      .split(/\r?\n/)
      .map(
        (value) =>
          value.trim()
      )
      .filter(
        Boolean
      )
      .forEach(
        (value) =>
          mergedText.add(
            value
          )
      );

    links.forEach(
      (url) =>
        mergedLinks.add(
          url
        )
    );

    subpageUrls.forEach(
      (url) =>
        mergedSubpageUrls.add(
          url
        )
    );

    (
      downloadCandidates.directFiles ||
      []
    ).forEach(
      (url) =>
        mergedDirectFiles.add(
          url
        )
    );

    (
      downloadCandidates.possibleEndpoints ||
      []
    ).forEach(
      (url) =>
        mergedPossibleEndpoints.add(
          url
        )
    );

    (
      downloadCandidates.downloadActions ||
      []
    ).forEach(
      (action) =>
        mergedDownloadActions.add(
          action
        )
    );
  }

  function wait(
    milliseconds
  ) {
    return new Promise(
      (resolve) => {
        setTimeout(
          resolve,
          milliseconds
        );
      }
    );
  }

  let rescanTimer =
    null;

  const observer =
    new MutationObserver(
      () => {
        clearTimeout(
          rescanTimer
        );

        rescanTimer =
          setTimeout(
            () => {
              mergeCurrentScan().catch(
                (error) => {
                  console.warn(
                    "[content] Dynamic rescan failed:",
                    error
                  );
                }
              );
            },
            250
          );
      }
    );

  await mergeCurrentScan();

  observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "href",
        "src",
        "onclick",
        "data-url",
        "data-download",
        "data-href",
        "data-link",
        "class",
        "aria-label",
        "title"
      ]
    }
  );

  await wait(
    700
  );

  await mergeCurrentScan();

  await wait(
    1800
  );

  await mergeCurrentScan();

  await wait(
    2500
  );

  observer.disconnect();

  return {
    ok: true,

    text:
      [
        ...mergedText
      ].join(
        "\n"
      ),

    links:
      [
        ...mergedLinks
      ],

    subpageUrls:
      [
        ...mergedSubpageUrls
      ],

    downloadCandidates: {
      directFiles:
        [
          ...mergedDirectFiles
        ],

      possibleEndpoints:
        [
          ...mergedPossibleEndpoints
        ],

      downloadActions:
        [
          ...mergedDownloadActions
        ]
    },

    pageUrl:
      window.location.href
  };
}




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
  })
    .then(
      () => {
        console.log(
          "[content] Snapshot message delivered."
        );
      }
    )
    .catch(
      (error) => {
        console.error(
          "[content] Snapshot message failed:",
          error
        );
      }
    );

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
      'a[href^="tel:"]'
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

        const phone =
          rawHref
            .replace(
              /^tel:/i,
              ""
            )
            .trim();

        if (
          !phone
        ) {
          return;
        }

        const formattedPhone =
          phone.replace(
            /^(\+\d{1,3})(\d{5})(\d{5})$/,
            "$1 $2 $3"
          );

        const key =
          formattedPhone.toLowerCase();

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
          formattedPhone
        );
      }
    );

  root
    .querySelectorAll(
      'a[href^="mailto:"]'
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

        const email =
          rawHref
            .replace(
              /^mailto:/i,
              ""
            )
            .trim();

        if (
          !email
        ) {
          return;
        }

        const key =
          email.toLowerCase();

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
          email
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
  
  const htmlMatches =
    document.documentElement.innerHTML.match(
      /https?:\/\/[^\s"'<>\\]+\.apk(?:\?[^\s"'<>\\]*)?/gi
    ) || [];

  htmlMatches.forEach(
    (url) => {
      apkLinks.add(
        url.replace(
          /[),.;]+$/,
          ""
        )
      );
    }
  );
  
  console.log(
    "[APK Collector]",
    [...apkLinks]
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
  
  const apkLinks =
    collectApkLinks();

  for (
    const apkUrl of
    apkLinks
  ) {
    links.add(
      apkUrl
    );
  }

  console.log(
    "[Link Collector] APK links found:",
    apkLinks
  );
  
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

function collectDownloadCandidates() {
  const directFiles =
    new Set();

  const possibleEndpoints =
    new Set();

  const directFilePattern =
    /\.(?:apk|xapk|apks|aab|ipa|mobileconfig|plist|config|cfg|conf|ini|exe|msi|msix|msixbundle|dmg|pkg|deb|rpm|appimage|iso|img|bin|zip|rar|7z|tar|gz|bz2|xz)(?:[?#]|$)/i;

  const endpointPathPattern =
    /(?:^|\/)(?:download|downloads|download-app|downloadapp|get-app|getapp|install|installer|apk|android|app-download|file-download|files)(?:\/|$|\?|#)/i;

  const downloadKeywordPattern =
    /\b(?:download|install|get\s+app|get\s+the\s+app|android|apk|ios|windows|mac|macos|linux)\b|下载|立即下载|安装|应用|APP/i;

  function addDirectFile(
    value
  ) {
    const url =
      resolveHttpUrl(
        value
      );

    if (
      url &&
      directFilePattern.test(
        url
      )
    ) {
      directFiles.add(
        url
      );
    }
  }

  function addPossibleEndpoint(
    value
  ) {
    const url =
      resolveHttpUrl(
        value
      );

    if (
      !url
    ) {
      return;
    }

    if (
      directFilePattern.test(
        url
      )
    ) {
      directFiles.add(
        url
      );

      return;
    }

    try {
      const parsed =
        new URL(
          url
        );

      const looksLikeEndpoint =
        endpointPathPattern.test(
          parsed.pathname
        ) ||
        /(?:download|install|apk|android|app|file)/i.test(
          parsed.search
        );

      if (
        looksLikeEndpoint
      ) {
        possibleEndpoints.add(
          parsed.href
        );
      }
    } catch {
      // Ignore invalid values.
    }
  }

  function resolveHttpUrl(
    value
  ) {
    if (
      typeof value !==
      "string"
    ) {
      return "";
    }

    const cleanValue =
      value
        .trim()
        .replace(
          /\\\//g,
          "/"
        )
        .replace(
          /^[("'`]+|[)"'`,.;]+$/g,
          ""
        );

    if (
      !cleanValue ||
      /^(?:javascript|data|mailto|tel|sms|smsto):/i.test(
        cleanValue
      )
    ) {
      return "";
    }

    try {
      const url =
        new URL(
          cleanValue,
          window.location.href
        );

      if (
        url.protocol !==
          "http:" &&
        url.protocol !==
          "https:"
      ) {
        return "";
      }

      url.hash =
        "";

      return url.href;
    } catch {
      return "";
    }
  }

  function collectUrlsFromText(
    value,
    contextText = ""
  ) {
    if (
      typeof value !==
      "string" ||
      !value
    ) {
      return;
    }

    const normalized =
      value.replace(
        /\\\//g,
        "/"
      );

    const absoluteUrls =
      normalized.match(
        /https?:\/\/[^\s"'<>\\]+/gi
      ) || [];

    absoluteUrls.forEach(
      (url) => {
        addDirectFile(
          url
        );

        if (
          downloadKeywordPattern.test(
            contextText
          )
        ) {
          addPossibleEndpoint(
            url
          );
        }
      }
    );

    const relativeUrls =
      normalized.match(
        /(?:\/(?:[a-z0-9._~!$&'()*+,;=:@%-]+\/?)+)(?:\?[^\s"'<>\\]*)?/gi
      ) || [];

    relativeUrls.forEach(
      (url) => {
        addDirectFile(
          url
        );

        if (
          endpointPathPattern.test(
            url
          ) ||
          downloadKeywordPattern.test(
            contextText
          )
        ) {
          addPossibleEndpoint(
            url
          );
        }
      }
    );
  }

  document
    .querySelectorAll(
      "a[href], area[href], button, [role='button'], [onclick], [data-url], [data-download], [data-href], [data-link], form[action], iframe[src], frame[src], object[data], embed[src]"
    )
    .forEach(
      (element) => {
        const elementText =
          (
            element.innerText ||
            element.textContent ||
            ""
          )
            .replace(
              /\s+/g,
              " "
            )
            .trim();

        const attributes = [
          "href",
          "src",
          "data",
          "action",
          "onclick",
          "data-url",
          "data-download",
          "data-href",
          "data-link"
        ];

        attributes.forEach(
          (attributeName) => {
            const attributeValue =
              (
                element.getAttribute(
                  attributeName
                ) ||
                ""
              ).trim();

            if (
              !attributeValue
            ) {
              return;
            }

            addDirectFile(
              attributeValue
            );

            if (
              endpointPathPattern.test(
                attributeValue
              ) ||
              downloadKeywordPattern.test(
                elementText
              )
            ) {
              addPossibleEndpoint(
                attributeValue
              );
            }

            collectUrlsFromText(
              attributeValue,
              elementText
            );
          }
        );

        Array.from(
          element.attributes || []
        ).forEach(
          (attribute) => {
            if (
              !/^data-/i.test(
                attribute.name
              )
            ) {
              return;
            }

            const attributeValue =
              (
                attribute.value ||
                ""
              ).trim();

            addDirectFile(
              attributeValue
            );

            if (
              endpointPathPattern.test(
                attributeValue
              ) ||
              downloadKeywordPattern.test(
                elementText
              )
            ) {
              addPossibleEndpoint(
                attributeValue
              );
            }

            collectUrlsFromText(
              attributeValue,
              elementText
            );
          }
        );
      }
    );

  Array.from(
    document.scripts
  ).forEach(
    (script) => {
      const source =
        script.src ||
        "";

      const content =
        script.textContent ||
        "";

      addDirectFile(
        source
      );

      collectUrlsFromText(
        source,
        "script"
      );

      collectUrlsFromText(
        content,
        "download android apk install"
      );
    }
  );

  console.log(
    "[Download Collector] Direct files:",
    [...directFiles]
  );

  console.log(
    "[Download Collector] Possible endpoints:",
    [...possibleEndpoints]
  );

  const downloadActions =
    collectDownloadActions();

  return {
    directFiles:
      [...directFiles],

    possibleEndpoints:
      [...possibleEndpoints],

    downloadActions
 };
}

function findSafeDownloadControls() {
  const controlAttribute =
    "data-qr-download-control";

  const root =
    document.body ||
    document.documentElement;

  if (!root) {
    return {
      ok: false,
      version: "TEXT-NODE-FINDER-V1",
      controls: []
    };
  }

  const wantedLabels =
    new Map(
      [
        [
          "quick installation",
          "Quick installation"
        ],
        [
          "complete installation",
          "Complete Installation"
        ]
      ]
    );

  const found =
    new Map();

  const walker =
    document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT
    );

  let node;

  while (
    (node = walker.nextNode())
  ) {
    const label =
      (
        node.nodeValue ||
        ""
      )
        .replace(
          /\s+/g,
          " "
        )
        .trim();

    const normalizedLabel =
      label.toLowerCase();

    if (
      !wantedLabels.has(
        normalizedLabel
      )
    ) {
      continue;
    }

    const element =
      node.parentElement;

    if (!element) {
      continue;
    }

    /*
      Confirm we found the expected Vue control rather than
      unrelated page text.
    */
    const expectedClass =
      normalizedLabel ===
      "quick installation"
        ? "btn1"
        : "btn2";

    if (
      !element.classList.contains(
        expectedClass
      )
    ) {
      continue;
    }

    if (
      found.has(
        normalizedLabel
      )
    ) {
      continue;
    }

    found.set(
      normalizedLabel,
      {
        element,
        label:
          wantedLabels.get(
            normalizedLabel
          )
      }
    );
  }

  const controls =
    [
      "quick installation",
      "complete installation"
    ]
      .map(
        (
          normalizedLabel,
          index
        ) => {
          const foundControl =
            found.get(
              normalizedLabel
            );

          if (!foundControl) {
            return null;
          }

          const controlId =
            `qr-download-${Date.now()}-${index}`;

          foundControl.element.setAttribute(
            controlAttribute,
            controlId
          );

          return {
            label:
              foundControl.label,

            selector:
              `[${controlAttribute}="${controlId}"]`,

            className:
              foundControl.element.className
          };
        }
      )
      .filter(
        Boolean
      );

  return {
    ok: true,
    version: "TEXT-NODE-FINDER-V1",
    controls
  };
}


function clickSafeDownloadControl(
  selector
) {
  if (
    typeof selector !==
    "string" ||
    !selector
  ) {
    return {
      ok: false,
      error: "Missing control selector."
    };
  }

  let element;

  try {
    element =
      document.querySelector(
        selector
      );
  } catch {
    return {
      ok: false,
      error: "Invalid control selector."
    };
  }

  if (
    !element
  ) {
    return {
      ok: false,
      error: "Download control no longer exists."
    };
  }

  if (
    element.closest(
      "form"
    )
  ) {
    return {
      ok: false,
      error: "Refused to click a form control."
    };
  }

  const label =
    (
      element.getAttribute(
        "aria-label"
      ) ||
      element.getAttribute(
        "title"
      ) ||
      element.value ||
      element.innerText ||
      element.textContent ||
      ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim()
      .slice(
        0,
        160
      );

  element.scrollIntoView(
    {
      block: "center",
      inline: "center"
    }
  );

  element.click();

  return {
    ok: true,
    label:
      label ||
      "Download control"
  };
}


function collectDownloadActions() {
  const actions =
    new Set();

  const interactiveSelector =
    [
      "a[href]",
      "button",
      "input[type='button']",
      "input[type='submit']",
      "[role='button']",
      "[onclick]",
      "[data-url]",
      "[data-download]",
      "[data-href]",
      "[data-link]"
    ].join(
      ", "
    );

  const directFilePattern =
    /\.(?:apk|xapk|apks|aab|ipa|mobileconfig|plist|config|cfg|conf|ini|exe|msi|msix|msixbundle|dmg|pkg|deb|rpm|appimage|iso|img|bin|zip|rar|7z|tar|gz|bz2|xz)(?:[?#]|$)/i;

  const downloadPathPattern =
    /(?:^|\/)(?:download|downloads|get-app|getapp|download-app|downloadapp|install|installer|apk|android|release|releases|file-download|files)(?:\/|$|\?|#)/i;

  const downloadWordPattern =
    /\b(?:download|install|get\s+(?:the\s+)?app|get\s+it|apk|xapk|apks|aab|latest\s+(?:version|release)|mobile\s+app)\b|下载|立即下载|安装|应用|app下载|डाउनलोड|डाउनलोड करें|ऐप डाउनलोड|इंस्टॉल|تحميل|تنزيل|تحميل التطبيق|تثبيت|скачать|загрузить|установить|приложение|télécharger|installer|application|descargar|instalar|aplicación|baixar|instalar|aplicativo|herunterladen|installieren|app herunterladen|scarica|installare|applicazione|ダウンロード|アプリをダウンロード|インストール|다운로드|설치|앱 다운로드|indir|yükle|uygulama/i;

  const androidPattern =
    /\b(?:android|apk|xapk|apks|aab|google\s*play|play\s*store)\b/i;

  const iosPattern =
    /\b(?:ios|iphone|ipad|app\s*store|testflight)\b/i;

  function normalizeText(
    value
  ) {
    return (
      value ||
      ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  }

  function getAttributeValues(
    element
  ) {
    return [
      element.getAttribute(
        "href"
      ),

      element.getAttribute(
        "src"
      ),

      element.getAttribute(
        "onclick"
      ),

      element.getAttribute(
        "data-url"
      ),

      element.getAttribute(
        "data-download"
      ),

      element.getAttribute(
        "data-href"
      ),

      element.getAttribute(
        "data-link"
      ),

      element.getAttribute(
        "aria-label"
      ),

      element.getAttribute(
        "title"
      ),

      element.id,

      element.className
    ]
      .filter(
        (value) =>
          typeof value ===
          "string"
      )
      .join(
        " "
      );
  }

  function getResolvedUrl(
    element
  ) {
    const rawUrl =
      element.getAttribute(
        "href"
      ) ||
      element.getAttribute(
        "data-url"
      ) ||
      element.getAttribute(
        "data-download"
      ) ||
      element.getAttribute(
        "data-href"
      ) ||
      element.getAttribute(
        "data-link"
      ) ||
      "";

    if (
      !rawUrl ||
      /^(?:javascript|data|mailto|tel|sms|smsto):/i.test(
        rawUrl
      )
    ) {
      return "";
    }

    try {
      const url =
        new URL(
          rawUrl,
          window.location.href
        );

      if (
        url.protocol !==
          "http:" &&
        url.protocol !==
          "https:"
      ) {
        return "";
      }

      url.hash =
        "";

      return url.href;
    } catch {
      return "";
    }
  }

  function getImageHints(
    element
  ) {
    return Array.from(
      element.querySelectorAll(
        "img[alt], img[title], svg[aria-label], [aria-label], [title]"
      )
    )
      .map(
        (child) =>
          [
            child.getAttribute(
              "alt"
            ),

            child.getAttribute(
              "title"
            ),

            child.getAttribute(
              "aria-label"
            )
          ]
            .filter(
              Boolean
            )
            .join(
              " "
            )
      )
      .join(
        " "
      );
  }

  function getNearbyContext(
    element
  ) {
    const parent =
      element.parentElement;

    if (
      !parent
    ) {
      return "";
    }

    return normalizeText(
      parent.innerText ||
      parent.textContent ||
      ""
    ).slice(
      0,
      280
    );
  }

  function detectPlatform(
    combinedText
  ) {
    if (
      androidPattern.test(
        combinedText
      )
    ) {
      return "Android";
    }

    if (
      iosPattern.test(
        combinedText
      )
    ) {
      return "iOS";
    }

    return "";
  }

  function getElementLabel(
    element
  ) {
    return normalizeText(
      element.getAttribute(
        "aria-label"
      ) ||
      element.getAttribute(
        "title"
      ) ||
      element.value ||
      element.innerText ||
      element.textContent ||
      ""
    ).slice(
      0,
      160
    );
  }

  const seenElements =
    new Set();

  document
    .querySelectorAll(
      interactiveSelector
    )
    .forEach(
      (element) => {
        if (
          seenElements.has(
            element
          )
        ) {
          return;
        }

        seenElements.add(
          element
        );

        const label =
          getElementLabel(
            element
          );

        const url =
          getResolvedUrl(
            element
          );

        const attributes =
          getAttributeValues(
            element
          );

        const imageHints =
          getImageHints(
            element
          );

        const nearbyContext =
          getNearbyContext(
            element
          );

        const combinedText =
          [
            label,
            url,
            attributes,
            imageHints,
            nearbyContext
          ]
            .filter(
              Boolean
            )
            .join(
              " "
            );

        const evidence =
          [];

        let score =
          0;

        if (
          url &&
          directFilePattern.test(
            url
          )
        ) {
          score +=
            7;

          evidence.push(
            "direct app-file URL"
          );
        }

        if (
          url &&
          downloadPathPattern.test(
            new URL(
              url
            ).pathname
          )
        ) {
          score +=
            4;

          evidence.push(
            "download-style URL"
          );
        }

        if (
          /(?:data-download|data-url|data-href|data-link)/i.test(
            element.outerHTML
          )
        ) {
          score +=
            3;

          evidence.push(
            "download data attribute"
          );
        }

        if (
          downloadWordPattern.test(
            label
          )
        ) {
          score +=
            3;

          evidence.push(
            "download-related label"
          );
        }

        const platform =
          detectPlatform(
            combinedText
          );

        if (
          platform
        ) {
          score +=
            2;

          evidence.push(
            `${platform} clue`
          );
        }

        if (
          element.tagName ===
          "A"
        ) {
          score +=
            1;

          evidence.push(
            "link"
          );
        }

        if (
          element.tagName ===
          "BUTTON" ||
          element.getAttribute(
            "role"
          ) ===
          "button" ||
          element.hasAttribute(
            "onclick"
          )
        ) {
          score +=
            1;

          evidence.push(
            "interactive control"
          );
        }

        /*
          Do not show generic controls. Require either:
          - a direct/app download URL,
          - a download endpoint plus an action clue,
          - a download label,
          - or a platform clue combined with a download-related
            URL/data attribute.
        */
        const hasStrongSignal =
          directFilePattern.test(
            url
          ) ||
          (
            downloadPathPattern.test(
              url
            ) &&
            (
              downloadWordPattern.test(
                combinedText
              ) ||
              platform
            )
          ) ||
          downloadWordPattern.test(
            combinedText
          ) ||
          (
            platform &&
            /(?:download|install|release|version|file|data-url|data-download)/i.test(
              combinedText
            )
          );

        if (
          !hasStrongSignal ||
          score <
            3
        ) {
          return;
        }

        const confidence =
          score >=
          7
            ? "High"
            : score >=
              5
              ? "Medium"
              : "Low";

        const tagName =
          (
            element.tagName ||
            "element"
          ).toLowerCase();

        const displayLabel =
          label ||
          element.getAttribute(
            "aria-label"
          ) ||
          element.getAttribute(
            "title"
          ) ||
          "Unlabeled control";

        const action =
          platform
            ? `${platform}: ${displayLabel}`
            : displayLabel;

        actions.add(
          action
        );
      }
    );
  
  /*
    Vue/SPA fallback:
    Some sites make an entire card or <div> clickable through a
    framework event listener. The final DOM may contain only a
    child <span> with "Download APP", without a normal <button>,
    <a>, or inline onclick attribute.

    We use the download text only to locate a label, then report
    its nearest meaningful parent card—not the text <span> itself.
  */
  document
    .querySelectorAll(
      "span, strong, b, em, p, label, div"
    )
    .forEach(
      (labelElement) => {
        const labelText =
          normalizeText(
            labelElement.innerText ||
            labelElement.textContent ||
            ""
          );

        if (
          !labelText ||
          labelText.length >
            120 ||
          !downloadWordPattern.test(
            labelText
          )
        ) {
          return;
        }

        let candidate =
          labelElement.parentElement;

        let fallback =
          null;

        for (
          let depth = 0;
          candidate &&
          depth < 5;
          depth++
        ) {
          const candidateText =
            normalizeText(
              candidate.innerText ||
              candidate.textContent ||
              ""
            );

          if (
            !candidateText ||
            candidateText.length >
              280
          ) {
            candidate =
              candidate.parentElement;

            continue;
          }

          const attributes =
            getAttributeValues(
              candidate
            );

          const imageHints =
            getImageHints(
              candidate
            );

          const combinedText =
            [
              candidateText,
              attributes,
              imageHints
            ]
              .filter(
                Boolean
              )
              .join(
                " "
              );

          const hasFrameworkOrControlClue =
            candidate.hasAttribute(
              "role"
            ) ||
            candidate.hasAttribute(
              "tabindex"
            ) ||
            candidate.hasAttribute(
              "onclick"
            ) ||
            /(?:cursor|button|btn|card|download|install|app|android|apk|release)/i.test(
              attributes
            );

          const style =
            window.getComputedStyle(
              candidate
            );

          const looksPointerClickable =
            style.cursor ===
            "pointer";

          if (
            hasFrameworkOrControlClue ||
            looksPointerClickable
          ) {
            fallback =
              candidate;

            break;
          }

          candidate =
            candidate.parentElement;
        }

        if (
          !fallback
        ) {
          return;
        }

        const fallbackLabel =
          getElementLabel(
            fallback
          );

        const fallbackUrl =
          getResolvedUrl(
            fallback
          );

        const fallbackAttributes =
          getAttributeValues(
            fallback
          );

        const fallbackHints =
          getImageHints(
            fallback
          );

        const fallbackCombinedText =
          [
            labelText,
            fallbackLabel,
            fallbackUrl,
            fallbackAttributes,
            fallbackHints
          ]
            .filter(
              Boolean
            )
            .join(
              " "
            );

        const platform =
          detectPlatform(
            fallbackCombinedText
          );

        const tagName =
          (
            fallback.tagName ||
            "element"
          ).toLowerCase();

        const displayLabel =
          labelText ||
          fallbackLabel ||
          "Download control";

        const action =
          platform
            ? `${platform}: ${displayLabel}`
            : displayLabel;

        actions.add(
          action
        );
      }
    );
  
  return [
    ...actions
  ];
}


async function collectSameSiteRoutesFromBundles(
  pageUrl
) {
  const page =
    new URL(
      pageUrl
    );

  const scriptUrls =
    [
      ...document.scripts
    ]
      .map(
        (script) =>
          script.src
      )
      .filter(
        (scriptUrl) => {
          try {
            return (
              scriptUrl &&
              new URL(
                scriptUrl
              ).origin ===
                page.origin
            );
          } catch (
            error
          ) {
            return false;
          }
        }
      )
      .slice(
        0,
        20
      );

  const routePaths =
    new Set();

  for (
    const scriptUrl of scriptUrls
  ) {
    try {
      const response =
        await fetch(
          scriptUrl,
          {
            credentials:
              "same-origin"
          }
        );

      if (
        !response.ok
      ) {
        continue;
      }

      const text =
        await response.text();

      const routeMatches =
        text.matchAll(
          /(?:path|redirect)\s*:\s*["'`](\/[^"'`\\\s]{1,160})["'`]/g
        );

      for (
        const match of routeMatches
      ) {
        const routePath =
          match?.[1];

        if (
          !routePath ||
          routePath === "/" ||
          routePath.endsWith(
            ".json"
          ) ||
          routePath.endsWith(
            ".js"
          ) ||
          routePath.endsWith(
            ".css"
          )
        ) {
          continue;
        }

        routePaths.add(
          routePath
        );
      }
    } catch (
      error
    ) {
      console.warn(
        "[content] Could not inspect script bundle:",
        scriptUrl,
        error
      );
    }
  }

  const usesHashRouting =
    (
      page.hash &&
      page.hash.startsWith(
        "#/"
      )
    ) ||
    [
      ...document.querySelectorAll(
        'a[href^="#/"]'
      )
    ].length > 0;

  const routeUrls =
    [];

  for (
    const routePath of routePaths
  ) {
    try {
      const routeUrl =
        usesHashRouting
          ? `${page.origin}/#${routePath}`
          : new URL(
              routePath,
              page.origin
            ).href;

      routeUrls.push(
        routeUrl
      );
    } catch (
      error
    ) {
      // Ignore malformed route values in bundles.
    }
  }

  console.log(
    "[content] Same-site routes found in bundles:",
    routeUrls
  );

  return [
    ...new Set(
      routeUrls
    )
  ];
}


async function collectSameSiteSubpageUrls() {
  const currentPageUrl =
    new URL(
      window.location.href
    );

  const subpageUrls =
    new Set();

  document
    .querySelectorAll(
      "a[href], area[href]"
    )
    .forEach(
      (link) => {
        const rawHref =
          (
            link.getAttribute(
              "href"
            ) ||
            ""
          )
            .trim();

        if (
          !rawHref ||
          rawHref.startsWith(
            "#"
          ) ||
          /^(?:mailto|tel|sms|smsto|javascript|data):/i.test(
            rawHref
          )
        ) {
          return;
        }

        let candidateUrl;

        try {
          candidateUrl =
            new URL(
              rawHref,
              currentPageUrl.href
            );
        } catch {
          return;
        }

        if (
          candidateUrl.protocol !==
            "http:" &&
          candidateUrl.protocol !==
            "https:"
        ) {
          return;
        }

        /*
          Keep only URLs from the exact same website origin.
          Any external linked website is ignored.
        */
        if (
          candidateUrl.origin !==
          currentPageUrl.origin
        ) {
          return;
        }

        /*
          A #fragment does not mean a separate subpage.
        */
        candidateUrl.hash =
          "";

        /*
          Do not add the current page itself.
        */
        if (
          candidateUrl.href ===
          currentPageUrl.href
        ) {
          return;
        }

        subpageUrls.add(
          candidateUrl.href
        );
      }
    );

  const bundleRouteUrls =
    await collectSameSiteRoutesFromBundles(
      currentPageUrl
    );

  const mergedSubpageUrls =
    [
      ...new Set(
        [
          ...subpageUrls,
          ...bundleRouteUrls
        ]
      )
    ];

  console.log(
    "[content] Combined same-site subpage URLs:",
    mergedSubpageUrls
  );

  return mergedSubpageUrls;
}

document.addEventListener(
  "click",
  (event) => {
    const target =
      event.target.closest(
        "a, button, div, span, li, p, section, [role='button'], [onclick], [data-url], [data-download], [data-href], [data-link]"
      );

    if (
      !target
    ) {
      return;
    }

    const text =
      (
        target.innerText ||
        target.textContent ||
        ""
      )
        .replace(
          /\s+/g,
          " "
        )
        .trim()
        .slice(
          0,
          160
        );

    const className =
      typeof target.className ===
      "string"
        ? target.className
        : "";

    const isDownloadAction =
      /\b(?:download|install|get\s+(?:the\s+)?app|apk|xapk|apks|aab|android\s+app|mobile\s+app)\b/i.test(
        text
      ) ||
      /(?:^|[\s_-])(?:btn|button|action|cta)(?:\d+|[\s_-]|$)|(?:download|install|android|apk|app)/i.test(
        className
      );

    if (
      !isDownloadAction
    ) {
      return;
    }

    browser.runtime.sendMessage({
      type:
        "APK_DOWNLOAD_BUTTON_CLICKED",

      pageUrl:
        window.location.href,

      element: {
        tagName:
          target.tagName,

        text,

        href:
          target.getAttribute(
            "href"
          ) ||
          "",

        className,

        dataUrl:
          target.getAttribute(
            "data-url"
          ) ||
          "",

        dataDownload:
          target.getAttribute(
            "data-download"
          ) ||
          "",

        dataHref:
          target.getAttribute(
            "data-href"
          ) ||
          "",

        dataLink:
          target.getAttribute(
            "data-link"
          ) ||
          ""
      },

      detectedAt:
        new Date().toISOString()
    });
  },
  true
);



