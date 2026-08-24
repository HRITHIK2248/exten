"use strict";

const DEFAULT_SETTINGS = {
  borderSpacing: 12,
  borderThickness: 6,
  arrowSize: 0.11,
  arrowDirection: "auto"
};

const borderSpacingInput =
  document.getElementById(
    "borderSpacing"
  );

const borderThicknessInput =
  document.getElementById(
    "borderThickness"
  );

const arrowSizeInput =
  document.getElementById(
    "arrowSize"
  );

const arrowDirectionInput =
  document.getElementById(
    "arrowDirection"
  );

const saveButton =
  document.getElementById(
    "saveButton"
  );

const status =
  document.getElementById(
    "status"
  );

const previewCanvas =
  document.getElementById(
    "previewCanvas"
  );

const previewContext =
  previewCanvas.getContext(
    "2d"
  );

restoreSettings();

saveButton.addEventListener(
  "click",
  saveSettings
);

[
  borderSpacingInput,
  borderThicknessInput,
  arrowSizeInput,
  arrowDirectionInput
].forEach(
  (input) => {
    input.addEventListener(
      "input",
      drawPreview
    );

    input.addEventListener(
      "change",
      drawPreview
    );
  }
);

async function restoreSettings() {
  const settings =
    await browser.storage.local.get(
      DEFAULT_SETTINGS
    );

  borderSpacingInput.value =
    settings.borderSpacing;

  borderThicknessInput.value =
    settings.borderThickness;

  arrowSizeInput.value =
    settings.arrowSize;

  arrowDirectionInput.value =
    settings.arrowDirection ||
    "auto";

  drawPreview();
}

async function saveSettings() {
  try {
    const settings = {
      borderSpacing:
        clamp(
          Number(
            borderSpacingInput.value
          ),
          1,
          100
        ),

      borderThickness:
        clamp(
          Number(
            borderThicknessInput.value
          ),
          1,
          30
        ),

      arrowSize:
        clamp(
          Number(
            arrowSizeInput.value
          ),
          0.03,
          0.30
        ),

      arrowDirection:
        ["auto", "left", "right"].includes(
          arrowDirectionInput.value
        )
          ? arrowDirectionInput.value
          : "auto"
    };

    await browser.storage.local.set(
      settings
    );

    borderSpacingInput.value =
      settings.borderSpacing;

    borderThicknessInput.value =
      settings.borderThickness;

    arrowSizeInput.value =
      settings.arrowSize;

    arrowDirectionInput.value =
      settings.arrowDirection;

    drawPreview();

    status.textContent =
      "Settings saved successfully.";

    status.style.color =
      "#087f5b";

    saveButton.textContent =
      "Saved";

    setTimeout(() => {
      status.textContent =
        "";

      saveButton.textContent =
        "Save settings";
    }, 2500);
  } catch (error) {
    status.textContent =
      `Save failed: ${
        error.message
      }`;

    status.style.color =
      "#b42318";
  }
}

function clamp(
  value,
  minimum,
  maximum
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return minimum;
  }

  return Math.max(
    minimum,
    Math.min(
      maximum,
      value
    )
  );
}

function drawPreview() {
  const spacing =
    clamp(
      Number(
        borderSpacingInput.value
      ),
      1,
      100
    );

  const thickness =
    clamp(
      Number(
        borderThicknessInput.value
      ),
      1,
      30
    );

  const arrowSize =
    clamp(
      Number(
        arrowSizeInput.value
      ),
      0.03,
      0.30
    );

  const selectedSide =
    arrowDirectionInput.value;

  previewContext.clearRect(
    0,
    0,
    previewCanvas.width,
    previewCanvas.height
  );

  previewContext.fillStyle =
    "#ffffff";

  previewContext.fillRect(
    0,
    0,
    previewCanvas.width,
    previewCanvas.height
  );

  const qrLeft =
    145;

  const qrTop =
    75;

  const qrSize =
    110;

  drawSampleQr(
    previewContext,
    qrLeft,
    qrTop,
    qrSize
  );

  previewContext.strokeStyle =
    "#ff1744";

  previewContext.lineWidth =
    thickness;

  previewContext.strokeRect(
    qrLeft -
      spacing,
    qrTop -
      spacing,
    qrSize +
      spacing * 2,
    qrSize +
      spacing * 2
  );

  drawPreviewArrow(
    previewContext,
    qrLeft,
    qrTop,
    qrSize,
    spacing,
    arrowSize,
    selectedSide
  );
}

function drawSampleQr(
  context,
  left,
  top,
  size
) {
  const cell =
    size / 21;

  context.fillStyle =
    "#111111";

  context.fillRect(
    left,
    top,
    size,
    size
  );

  context.fillStyle =
    "#ffffff";

  drawFinder(
    context,
    left,
    top,
    cell
  );

  drawFinder(
    context,
    left +
      size -
      cell * 7,
    top,
    cell
  );

  drawFinder(
    context,
    left,
    top +
      size -
      cell * 7,
    cell
  );

  context.fillStyle =
    "#111111";

  for (
    let row = 8;
    row < 21;
    row++
  ) {
    for (
      let column = 8;
      column < 21;
      column++
    ) {
      if (
        (row + column) %
          3 !==
        0
      ) {
        context.fillRect(
          left +
            column *
              cell,
          top +
            row *
              cell,
          cell,
          cell
        );
      }
    }
  }
}

function drawFinder(
  context,
  left,
  top,
  cell
) {
  context.fillStyle =
    "#ffffff";

  context.fillRect(
    left,
    top,
    cell * 7,
    cell * 7
  );

  context.fillStyle =
    "#111111";

  context.fillRect(
    left +
      cell,
    top +
      cell,
    cell * 5,
    cell * 5
  );

  context.fillStyle =
    "#ffffff";

  context.fillRect(
    left +
      cell * 2,
    top +
      cell * 2,
    cell * 3,
    cell * 3
  );
}

function drawPreviewArrow(
  context,
  qrLeft,
  qrTop,
  qrSize,
  spacing,
  arrowSize,
  selectedSide
) {
  const arrowLength =
    Math.max(
      24,
      Math.round(
        qrSize *
          arrowSize
      )
    );

  const triangleSize =
    Math.max(
      9,
      Math.round(
        arrowLength * 0.30
      )
    );

  const qrCenterY =
    qrTop +
    qrSize / 2;

  let direction;

  if (
    selectedSide ===
    "left"
  ) {
    direction =
      "right";
  } else if (
    selectedSide ===
    "right"
  ) {
    direction =
      "left";
  } else {
    direction =
      "right";
  }

  let startX;
  let targetX;

  if (
    direction ===
    "right"
  ) {
    startX =
      qrLeft -
      spacing -
      arrowLength;

    targetX =
      qrLeft -
      spacing;
  } else {
    startX =
      qrLeft +
      qrSize +
      spacing +
      arrowLength;

    targetX =
      qrLeft +
      qrSize +
      spacing;
  }

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
    3;

  context.lineCap =
    "round";

  context.lineJoin =
    "round";

  context.beginPath();

  context.moveTo(
    startX,
    qrCenterY
  );

  context.lineTo(
    lineEndX,
    qrCenterY
  );

  context.stroke();

  context.beginPath();

  if (
    direction ===
    "right"
  ) {
    context.moveTo(
      targetX,
      qrCenterY
    );

    context.lineTo(
      targetX -
        triangleSize,
      qrCenterY -
        triangleSize
    );

    context.lineTo(
      targetX -
        triangleSize,
      qrCenterY +
        triangleSize
    );
  } else {
    context.moveTo(
      targetX,
      qrCenterY
    );

    context.lineTo(
      targetX +
        triangleSize,
      qrCenterY -
        triangleSize
    );

    context.lineTo(
      targetX +
        triangleSize,
      qrCenterY +
        triangleSize
    );
  }

  context.closePath();
  context.fill();

  context.restore();
}
