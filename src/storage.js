export async function readReceipt(file) {
  if (!file || !file.size) return null;
  if (
    !["image/jpeg", "image/png", "application/pdf"].includes(file.type) ||
    file.size > 2 * 1024 * 1024
  )
    throw new Error("Usá un JPG, PNG o PDF de hasta 2 MB.");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer el comprobante."));
    reader.readAsDataURL(file);
  });
}
