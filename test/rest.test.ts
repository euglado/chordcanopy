import assert from "node:assert/strict";
import { test } from "node:test";
import { Routes } from "discord.js";
import { makeRest } from "../src/rest.ts";

for (const status of [503, 429, "ECONNRESET"] as const)
  test(`REST sends only once after ${status}`, async () => {
    let requests = 0;
    const rest = makeRest("fixture-not-a-real-token", async () => {
      requests++;
      if (status === "ECONNRESET")
        throw Object.assign(new Error("connection reset"), {
          code: "ECONNRESET",
        });
      const response = new Response(
        JSON.stringify(
          status === 429
            ? { message: "rate limited", retry_after: 0.001, global: false }
            : { message: "server error", code: 0 },
        ),
        {
          status,
          headers: {
            "content-type": "application/json",
            ...(status === 429
              ? {
                  "retry-after": "0.001",
                  "x-ratelimit-remaining": "0",
                  "x-ratelimit-reset-after": "0.001",
                  "x-ratelimit-limit": "1",
                }
              : {}),
          },
        },
      );
      return {
        body: null,
        bodyUsed: false,
        headers: response.headers,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        arrayBuffer: () => response.arrayBuffer(),
        json: () => response.json(),
        text: () => response.text(),
      };
    });
    await assert.rejects(
      rest.post(Routes.channelMessages("22222222222222222"), {
        body: {
          content: "C D E",
          nonce: "88888888888888888",
          enforce_nonce: true,
        },
      }),
    );
    assert.equal(requests, 1);
  });
