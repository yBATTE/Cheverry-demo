export async function api(action, body, params = {}) {
  const response = await fetch(
    `/api?${new URLSearchParams({ action, ...params })}`,
    {
      method: body === undefined ? "GET" : "POST",
      credentials: "same-origin",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  );
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "No pudimos conectar con la academia. Intentá nuevamente en unos instantes.",
    );
  }
  if (!response.ok)
    throw new Error(data.error || "No se pudo completar la operación.");
  return data;
}
export const materialUrl = (courseId, id, download = false) =>
  `/api?${new URLSearchParams({ action: "material", courseId, id, ...(download ? { download: "1" } : {}) })}`;
