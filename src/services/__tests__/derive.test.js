import { describe, it, expect } from "vitest";
import { deriveMonthlyImpact, deriveHealthScore } from "../derive.js";

describe("deriveMonthlyImpact", () => {
  it("scales savings and CO2 with days elapsed and dailyKWh", () => {
    const tenDays = deriveMonthlyImpact({ dailyKWh: 20, date: new Date(2026, 7, 10) });
    const twentyDays = deriveMonthlyImpact({ dailyKWh: 20, date: new Date(2026, 7, 20) });
    expect(tenDays.monthGeneratedKWh).toBeCloseTo(200, 5);
    expect(twentyDays.monthGeneratedKWh).toBeCloseTo(400, 5);
    expect(twentyDays.savings).toBeGreaterThan(tenDays.savings);
    expect(twentyDays.co2AvoidedKg).toBeGreaterThan(tenDays.co2AvoidedKg);
  });

  it("never returns negative figures for zero generation", () => {
    const zero = deriveMonthlyImpact({ dailyKWh: 0, date: new Date(2026, 7, 15) });
    expect(zero.savings).toBe(0);
    expect(zero.co2AvoidedKg).toBe(0);
    expect(zero.monthGeneratedKWh).toBe(0);
  });

  it("keeps self-consumed + exported equal to total generated", () => {
    const impact = deriveMonthlyImpact({ dailyKWh: 18, date: new Date(2026, 7, 12) });
    expect(impact.selfConsumedKWh + impact.exportedKWh).toBeCloseTo(impact.monthGeneratedKWh, 5);
  });
});

describe("deriveHealthScore", () => {
  it("scores a curve that matches expectations near 100", () => {
    const curve = Array.from({ length: 10 }, (_, i) => ({ expected: 4, generation: 4 - i * 0.01 }));
    expect(deriveHealthScore(curve)).toBeGreaterThanOrEqual(90);
  });

  it("penalizes a sudden cliff-style drop more than a mild shortfall", () => {
    const mildShortfall = Array.from({ length: 10 }, () => ({ expected: 4, generation: 3.6 }));
    const cliffDrop = [
      { expected: 4, generation: 4 },
      { expected: 4, generation: 4 },
      { expected: 4, generation: 1 },
      { expected: 4, generation: 1 },
    ];
    expect(deriveHealthScore(cliffDrop)).toBeLessThan(deriveHealthScore(mildShortfall));
  });

  it("returns 100 for an empty curve instead of throwing", () => {
    expect(deriveHealthScore([])).toBe(100);
  });
});
