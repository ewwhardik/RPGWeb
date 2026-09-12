import { describe, it, expect } from "vitest";
import { checkRateLimit, getClientIp } from "../rateLimit";

describe("Sliding-Window Rate Limiter", () => {
  it("allows initial requests within the designated limit threshold", () => {
    const id = "test_user_initial_" + Math.random();
    const result = checkRateLimit(id, 5, 10000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.resetTime).toBeGreaterThan(Date.now());
  });

  it("blocks rapid-fire requests once threshold limit is exhausted", () => {
    const id = "test_spammer_" + Math.random();
    const limit = 3;

    // First 3 requests should succeed
    expect(checkRateLimit(id, limit, 10000).success).toBe(true);
    expect(checkRateLimit(id, limit, 10000).success).toBe(true);
    expect(checkRateLimit(id, limit, 10000).success).toBe(true);

    // 4th request must be denied
    const blockedResult = checkRateLimit(id, limit, 10000);
    expect(blockedResult.success).toBe(false);
    expect(blockedResult.remaining).toBe(0);
  });

  it("isolates distinct client identifiers independently", () => {
    const idA = "adventurer_alpha_" + Math.random();
    const idB = "adventurer_beta_" + Math.random();

    checkRateLimit(idA, 2, 10000);
    checkRateLimit(idA, 2, 10000);
    expect(checkRateLimit(idA, 2, 10000).success).toBe(false);

    // idB should still be allowed
    expect(checkRateLimit(idB, 2, 10000).success).toBe(true);
  });

  it("extracts client IP from x-forwarded-for header safely", () => {
    const mockReqWithIp = new Request("http://localhost:3000", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
    });
    expect(getClientIp(mockReqWithIp)).toBe("203.0.113.195");

    const mockReqWithoutIp = new Request("http://localhost:3000");
    expect(getClientIp(mockReqWithoutIp)).toBe("127.0.0.1");
  });
});
