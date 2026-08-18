const DAY = {
  background: "#F8FAF4",
  shapes: ["#60a5fa", "#3b82f6", "#818cf8", "#6366f1"],
  ring: "#06B6D4",
};

const NIGHT = {
  background: "#3A2A5C",
  shapes: ["#D8B4FE", "#F472B6", "#C084FC", "#FB7185"],
  ring: "#FBBF24",
};

const TWILIGHT_MS = 30 * 60 * 1000;

export function hexToRgb(hex) {
  const raw = hex.replace("#", "");

  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }) {
  const toHex = (n) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function lerpColor(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);

  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  });
}

export function getSkyPalette({ sunrise, sunset, now = Date.now() }) {
  const sr = sunrise * 1000;
  const ss = sunset * 1000;

  let d;

  if (now <= sr - TWILIGHT_MS || now >= ss + TWILIGHT_MS) {
    d = 0;
  } else if (now >= sr + TWILIGHT_MS && now <= ss - TWILIGHT_MS) {
    d = 1;
  } else if (now < sr + TWILIGHT_MS) {
    d = (now - (sr - TWILIGHT_MS)) / (2 * TWILIGHT_MS);
  } else {
    d = 1 - (now - (ss - TWILIGHT_MS)) / (2 * TWILIGHT_MS);
  }

  d = Math.min(1, Math.max(0, d));

  return {
    background: lerpColor(NIGHT.background, DAY.background, d),
    shapes: DAY.shapes.map((dayColor, i) =>
      lerpColor(NIGHT.shapes[i], dayColor, d),
    ),
    ring: lerpColor(NIGHT.ring, DAY.ring, d),
  };
}
