import test from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryReplSet } from "mongodb-memory-server-core";
import { Binary } from "mongodb";
import handler from "../api/index.js";
import { database, indexes } from "../server/db.js";
import { hashPassword } from "../server/security.js";

test(
  "real database workflow: approve, email retry, activation, course authorization and rejection",
  { timeout: 180000 },
  async (t) => {
    const mongo = await MongoMemoryReplSet.create({
      binary: { version: "7.0.14" },
      replSet: {
        count: 1,
        args: ["--setParameter", "diagnosticDataCollectionEnabled=false"],
      },
    });
    process.env.MONGODB_URI = mongo.getUri();
    process.env.MONGODB_DB = "workflow_test";
    process.env.APP_URL = "http://localhost:5173";
    process.env.PAYMENT_ALIAS = "alias.prueba";
    process.env.RESEND_API_KEY = "test";
    process.env.EMAIL_FROM = "test@example.com";
    const { db, client } = await database();
    const originalFetch = globalThis.fetch;
    let failMail = false;
    const emails = [];
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "https://api.resend.com/emails");
      if (failMail) return { ok: false };
      emails.push(JSON.parse(options.body));
      return { ok: true, json: async () => ({ id: `mail-${emails.length}` }) };
    };
    t.after(async () => {
      globalThis.fetch = originalFetch;
      await client.close();
      await mongo.stop();
    });
    await indexes(db);
    await db
      .collection("users")
      .insertOne({
        _id: "admin",
        name: "Admin",
        email: "admin@test.com",
        role: "admin",
        passwordHash: await hashPassword("admin-test-password"),
      });
    await db.collection("courses").insertMany([
      {
        _id: "papeleria",
        title: "Papelería",
        price: 50000,
        available: true,
        lessons: [{ title: "Guía", materialId: "guide" }],
      },
      {
        _id: "otro",
        title: "Otro",
        price: 80000,
        available: true,
        lessons: [{ title: "Otra", materialId: "other" }],
      },
    ]);
    await db
      .collection("materials")
      .insertOne({
        _id: "guide",
        courseId: "papeleria",
        mime: "image/webp",
        bytes: new Binary(Buffer.from("private-guide")),
      });
    async function request(action, body, cookie, extra = {}) {
      const req = {
        url: "/api?" + new URLSearchParams({ action, ...extra.params }),
        method: body === undefined ? "GET" : "POST",
        body,
        socket: { remoteAddress: "127.0.0.1" },
        headers: {
          origin: extra.origin || process.env.APP_URL,
          "content-type": "application/json",
          ...(cookie ? { cookie } : {}),
        },
      };
      const headers = {};
      const res = {
        statusCode: 200,
        setHeader(k, v) {
          headers[k.toLowerCase()] = v;
        },
        end(value) {
          this.body = value;
        },
      };
      await handler(req, res);
      const json = headers["content-type"]?.startsWith("application/json")
        ? JSON.parse(res.body)
        : null;
      return {
        status: res.statusCode,
        body: json,
        bytes: res.body,
        headers,
        cookie: headers["set-cookie"]?.split(";")[0],
      };
    }
    assert.equal((await request("orders")).status, 401);
    assert.equal(
      (
        await request("material", undefined, null, {
          params: { courseId: "papeleria", id: "guide" },
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await request(
          "login",
          { email: "admin@test.com", password: "admin-test-password" },
          null,
          { origin: "https://attacker.test" },
        )
      ).status,
      403,
    );
    const admin = await request("login", {
      email: "admin@test.com",
      password: "admin-test-password",
    });
    assert.equal(admin.status, 200);
    assert.match(admin.headers["set-cookie"], /HttpOnly/);
    const purchase = {
      requestId: "00000000-0000-4000-8000-000000000001",
      courseId: "papeleria",
      name: "Alumno Test",
      email: "buyer@test.com",
      file:
        "data:application/pdf;base64," +
        Buffer.from("%PDF-1.7\nexample").toString("base64"),
    };
    assert.equal((await request("order", purchase)).status, 201);
    assert.equal((await request("order", purchase)).status, 201);
    assert.equal(await db.collection("orders").countDocuments({}), 1);
    const pendingLogin = await request("login", {
      email: purchase.email,
      password: "no-access-yet",
    });
    assert.equal(pendingLogin.status, 401);
    failMail = true;
    const approved = await request(
      "approve",
      { id: purchase.requestId },
      admin.cookie,
    );
    assert.equal(approved.status, 200);
    assert.equal(
      (await db.collection("orders").findOne({ _id: purchase.requestId }))
        .mailStatus,
      "failed",
    );
    assert.equal(await db.collection("enrollments").countDocuments({}), 1);
    failMail = false;
    assert.equal(
      (await request("retry-mail", { id: purchase.requestId }, admin.cookie))
        .status,
      200,
    );
    const secret = emails.at(-1).text.match(/#activar\/([a-f0-9]+)/)[1];
    assert.equal(
      (
        await request("activate", {
          token: secret,
          password: "alumno-test-password",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await request("activate", {
          token: secret,
          password: "otra-clave-12345",
        })
      ).status,
      400,
    );
    const student = await request("login", {
      email: purchase.email,
      password: "alumno-test-password",
    });
    assert.equal(student.status, 200);
    assert.equal(
      (await request("orders", undefined, student.cookie)).status,
      403,
    );
    assert.equal(
      (
        await request("classroom", undefined, student.cookie, {
          params: { courseId: "otro" },
        })
      ).status,
      403,
    );
    const course = await request("classroom", undefined, student.cookie, {
      params: { courseId: "papeleria" },
    });
    assert.equal(course.status, 200);
    const guide = await request("material", undefined, student.cookie, {
      params: { courseId: "papeleria", id: "guide" },
    });
    assert.equal(guide.bytes.toString(), "private-guide");
    assert.equal(
      (
        await request("material", undefined, student.cookie, {
          params: { courseId: "papeleria", id: "other" },
        })
      ).status,
      404,
    );
    const savedProgress = await request(
      "progress",
      {
        courseId: "papeleria",
        progress: { done: [0, 0, 999], checks: [0, 999] },
      },
      student.cookie,
    );
    assert.equal(savedProgress.status, 200);
    assert.deepEqual(
      (
        await request("classroom", undefined, student.cookie, {
          params: { courseId: "papeleria" },
        })
      ).body.progress,
      { done: [0], checks: [0] },
    );
    await Promise.all([
      request("approve", { id: purchase.requestId }, admin.cookie),
      request("approve", { id: purchase.requestId }, admin.cookie),
    ]);
    assert.equal(await db.collection("enrollments").countDocuments({}), 1);
    assert.equal(emails.length, 1);
    const other = {
      ...purchase,
      courseId: "otro",
      requestId: "00000000-0000-4000-8000-000000000002",
    };
    await request("order", other);
    await request("approve", { id: other.requestId }, admin.cookie);
    assert.equal(
      await db.collection("users").countDocuments({ email: purchase.email }),
      1,
    );
    assert.equal(
      (await request("my-courses", undefined, student.cookie)).body.courses
        .length,
      2,
    );
    assert.match(emails.at(-1).text, /contraseña habitual/);
    const third = {
      ...purchase,
      email: "rejected@test.com",
      requestId: "00000000-0000-4000-8000-000000000003",
    };
    await request("order", third);
    assert.equal(
      (
        await request(
          "reject",
          { id: third.requestId, reason: "Importe incorrecto" },
          admin.cookie,
        )
      ).status,
      200,
    );
    assert.equal(
      (await request("approve", { id: third.requestId }, admin.cookie)).status,
      409,
    );
    assert.equal(
      await db.collection("users").countDocuments({ email: third.email }),
      0,
    );
    await request("recover", { email: purchase.email });
    const reset = emails.at(-1).text.match(/#activar\/([a-f0-9]+)/)[1];
    await request("activate", {
      token: reset,
      password: "new-student-password",
    });
    assert.equal(
      (await request("me", undefined, student.cookie)).body.user,
      null,
    );
    assert.equal(
      (
        await request("login", {
          email: purchase.email,
          password: "alumno-test-password",
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await request("login", {
          email: purchase.email,
          password: "new-student-password",
        })
      ).status,
      200,
    );
  },
);
