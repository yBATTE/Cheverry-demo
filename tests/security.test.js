import test from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  receipt,
  email,
  mayAccess,
  enforceOrigin,
} from "../server/security.js";
test("password hashes use unique salts and reject incorrect passwords", async () => {
  const a = await hashPassword("clave-de-prueba-123"),
    b = await hashPassword("clave-de-prueba-123");
  assert.notEqual(a, b);
  assert.equal(await verifyPassword("clave-de-prueba-123", a), true);
  assert.equal(await verifyPassword("otra-clave", a), false);
  assert.equal(await verifyPassword("x", null), false);
  await assert.rejects(hashPassword("corta"));
});
test("receipt validation rejects false MIME and oversize files", () => {
  assert.throws(() =>
    receipt(
      "data:image/png;base64," + Buffer.from("not png").toString("base64"),
    ),
  );
  assert.throws(() =>
    receipt(
      "data:application/pdf;base64," +
        Buffer.alloc(2 * 1024 * 1024 + 1).toString("base64"),
    ),
  );
  assert.equal(
    receipt(
      "data:application/pdf;base64," +
        Buffer.from("%PDF-1.7\ntest").toString("base64"),
    ).mime,
    "application/pdf",
  );
});
test("students may only access their own enrollment; admin requires a user", () => {
  assert.equal(mayAccess(null, { userId: "one" }), false);
  assert.equal(
    mayAccess({ _id: "two", role: "student" }, { userId: "one" }),
    false,
  );
  assert.equal(
    mayAccess({ _id: "one", role: "student" }, { userId: "one" }),
    true,
  );
  assert.equal(mayAccess({ _id: "admin", role: "admin" }, null), true);
});
test("email and cross-origin request validation", () => {
  assert.equal(email(" A@B.COM "), "a@b.com");
  assert.throws(() => email({ $ne: "" }));
  process.env.APP_URL = "https://academia.test";
  assert.throws(() =>
    enforceOrigin({
      headers: {
        origin: "https://attacker.test",
        "content-type": "application/json",
      },
    }),
  );
  enforceOrigin({
    headers: {
      origin: "https://academia.test",
      "content-type": "application/json",
    },
  });
});
