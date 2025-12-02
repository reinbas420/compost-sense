import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SoilPercents {
  capacitive_percent: number | null;
  resistive_percent: number | null;
}

/**
 * Compute calibrated soil percentages from raw readings.
 * - If both raw values are >4000, consider the reading invalid (returns nulls).
 * - Capacitive percent calibration uses piecewise linear mapping with anchors:
 *   <=1000 -> 20, 1000..1500 -> 20..40, 1500..2500 -> 40..80,
 *   2500..3000 -> 80..100, >=3000 -> 100
 * - Resistive percent is computed from its raw value using same mapping, then
 *   blended with the capacitive percent (70% capacitive, 30% resistive) when both exist.
 */
export function computeSoilPercents(
  capacitive_raw?: number | null,
  resistive_raw?: number | null
): SoilPercents {
  const bothPresent = capacitive_raw != null && resistive_raw != null;
  if (capacitive_raw != null && resistive_raw != null && capacitive_raw > 4000 && resistive_raw > 4000) {
    return { capacitive_percent: null, resistive_percent: null };
  }

  const mapRawToPercent = (raw?: number | null) => {
    if (raw == null) return null;
    // Clamp to 0..4095 sensor range if needed
    const r = Math.max(0, Math.min(4095, raw));
    if (r <= 1000) return 20;
    if (r >= 3000) return 100;
    if (r >= 2500) {
      // 2500 -> 80, 3000 -> 90
      return 80 + ((r - 2500) / (3000 - 2500)) * 10;
    }
    if (r > 1500) {
      // 1500 -> 40, 2500 -> 80
      return 40 + ((r - 1500) / (2500 - 1500)) * 40;
    }
    // 1000 -> 20, 1500 -> 40
    return 20 + ((r - 1000) / (1500 - 1000)) * 20;
  };

  const capPct = mapRawToPercent(capacitive_raw);
  const resPctRaw = mapRawToPercent(resistive_raw);

  let finalResPct: number | null = null;
  if (resPctRaw == null && capPct == null) {
    finalResPct = null;
  } else if (resPctRaw == null && capPct != null) {
    finalResPct = capPct;
  } else if (resPctRaw != null && capPct == null) {
    finalResPct = resPctRaw;
  } else {
    // Blend: give more weight to capacitive calibration
    finalResPct = capPct! * 0.7 + resPctRaw! * 0.3;
  }

  return {
    capacitive_percent: capPct == null ? null : Math.round(capPct * 10) / 10,
    resistive_percent: finalResPct == null ? null : Math.round(finalResPct * 10) / 10,
  };
}
