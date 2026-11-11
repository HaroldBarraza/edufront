const CLOUD_NAME = "aqcwmu7d";
const UPLOAD_PRESET = "sgaf-entregas";


export interface ArchivoSubido {
  url: string;
  nombre: string;
  mimeType: string;
}

export async function subirArchivoCloudinary(file: File): Promise<ArchivoSubido> {
  if (!CLOUD_NAME) {
    throw new Error(
      'Cloudinary no está configurado. Falta VITE_CLOUDINARY_CLOUD_NAME en .env',
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  const res = await fetch(endpoint, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error subiendo archivo a Cloudinary: ${err}`);
  }
  const data = (await res.json()) as { secure_url: string };

  return {
    url: data.secure_url,
    nombre: file.name,
    mimeType: file.type,
  };
}
