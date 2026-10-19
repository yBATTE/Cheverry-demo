import { MongoClient } from "mongodb";
let connection;
export async function database() {
  if (!process.env.MONGODB_URI)
    throw Object.assign(
      new Error("Falta configurar la conexión a la base de datos."),
      { status: 503 },
    );
  if (!connection) {
    const client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
    });
    connection = client
      .connect()
      .then(() => ({
        client,
        db: client.db(process.env.MONGODB_DB || "cheverry_academia"),
      }))
      .catch((e) => {
        connection = undefined;
        throw e;
      });
  }
  return connection;
}
export async function rateLimit(db, key, max, seconds = 900) {
  const slot = Math.floor(Date.now() / (seconds * 1000));
  const record = await db
    .collection("limits")
    .findOneAndUpdate(
      { _id: `${key}:${slot}` },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date((slot + 2) * seconds * 1000) },
      },
      { upsert: true, returnDocument: "after" },
    );
  if (record.count > max)
    throw Object.assign(new Error("Demasiados intentos. Probá más tarde."), {
      status: 429,
    });
}
export async function indexes(db) {
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db
    .collection("enrollments")
    .createIndex({ userId: 1, courseId: 1 }, { unique: true });
  await db
    .collection("sessions")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db
    .collection("limits")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("orders").createIndex({ createdAt: -1 });
  await db.collection("orders").createIndex({ email: 1, courseId: 1 });
}
