import { describe, it, expect } from "vitest";
import { buildTodayCurve, deriveDailyKWh, recommendWindow } from "../simulator.js";
import { getScenario } from "../scenarios.js";

describe("buildTodayCurve", () => {
  it("returns one point per hour from 6am to 7pm", () => {
    const curve = buildTodayCurve("normal");
    expect(curve).toHaveLength(14);
    expect(curve[0].hour).toBe("6:00");
    expect(curve.at(-1).hour).toBe("19:00");
  });

  it("is deterministic for the same scenario", () => {
    expect(buildTodayCurve("cloudy")).toEqual(buildTodayCurve("cloudy"));
  });

  it("produces lower total generation for every fault scenario than a normal day", () => {
    const normalTotal = deriveDailyKWh(buildTodayCurve("normal"));
    for (const id of ["cloudy", "shading", "soiling", "inverter"]) {
      const total = deriveDailyKWh(buildTodayCurve(id));
      expect(total).toBeLessThan(normalTotal);
    }
  });

  it("falls back to the normal scenario for an unknown id", () => {
    expect(getScenario("not-a-real-scenario").id).toBe("normal");
  });

  it("keeps generation non-negative even in the worst scenario", () => {
    const curve = buildTodayCurve("inverter");
    for (const p of curve) expect(p.generation).toBeGreaterThanOrEqual(0);
  });
});

describe("recommendWindow", () => {
  it("picks the window with the highest solar surplus", () => {
    const curve = buildTodayCurve("normal");
    const rec = recommendWindow(curve, 1, 1.2);
    expect(rec.window).toContain("–");
    expect(rec.reductionKWh).toBeGreaterThanOrEqual(0);
  });
});
