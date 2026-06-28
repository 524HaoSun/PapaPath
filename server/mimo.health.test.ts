import { describe, it, expect } from "vitest";

describe("MiMo API key health check", () => {
  it("MIMO_API_KEY is set in environment", () => {
    const key = process.env.MIMO_API_KEY;
    expect(key).toBeTruthy();
    expect(key!.length).toBeGreaterThan(10);
  });

  it("can reach MiMo API with the provided key", async () => {
    const key = process.env.MIMO_API_KEY;
    const baseUrl = process.env.MIMO_API_URL ?? "https://token-plan-cn.xiaomimimo.com/v1";

    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "mimo-v2.5",
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 5,
      }),
    });

    expect(resp.status).toBeLessThan(500);
    const data = await resp.json() as { choices?: unknown[] };
    expect(data.choices).toBeDefined();
  }, 30_000);
});
