import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/index.js";
async function call(req) {
  const headers = {};
  const response = {
    statusCode: 200,
    setHeader: (key, value) => {
      headers[key] = value;
    },
    end: (value) => {
      response.value = value;
    },
  };
  await handler(
    { method: "POST", url: "/api?action=order", headers: {}, ...req },
    response,
  );
  return {
    status: response.statusCode,
    body: JSON.parse(response.value),
    headers,
  };
}
test("API blocks forged POSTs before reaching the database", async () => {
  process.env.APP_URL = "https://academia.test";
  const response = await call({
    headers: {
      origin: "https://otro.test",
      "content-type": "application/json",
    },
    body: {},
  });
  assert.equal(response.status, 403);
  assert.equal(response.headers["Cache-Control"], "private, no-store");
});
test("API enforces HTTP methods and rejects oversized uploads", async () => {
  assert.equal((await call({ method: "GET" })).status, 405);
  const response = await call({
    headers: {
      origin: "https://academia.test",
      "content-type": "application/json",
    },
    body: { file: "a".repeat(3 * 1024 * 1024) },
  });
  assert.equal(response.status, 413);
});
test("API reports missing configuration without exposing secrets", async () => {
  delete process.env.MONGODB_URI;
  const response = await call({ method: "GET", url: "/api?action=catalog" });
  assert.equal(response.status, 503);
  assert.match(response.body.error, /base de datos/);
});
