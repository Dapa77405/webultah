const PHOTO_COUNT = 6;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

type PhotoResponse = { index: number; url: string };
type UploadResponse = { url: string; cleanupWarning?: boolean };

async function readJson<T>(response: Response): Promise<T> {
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error || "Permintaan foto gagal.");
  return result;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Foto tidak dapat dibaca."));
        return;
      }
      const separator = reader.result.indexOf(",");
      if (separator < 0) {
        reject(new Error("Format foto tidak dapat dibaca."));
        return;
      }
      resolve(reader.result.slice(separator + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Foto tidak dapat dibaca."));
    reader.readAsDataURL(file);
  });
}

export async function loadPhotos(): Promise<(string | null)[]> {
  const response = await fetch("/api/photos", { cache: "no-store" });
  const result = await readJson<{ photos: PhotoResponse[] }>(response);
  const photos: (string | null)[] = Array(PHOTO_COUNT).fill(null);
  for (const photo of result.photos) {
    if (Number.isInteger(photo.index) && photo.index >= 0 && photo.index < PHOTO_COUNT && typeof photo.url === "string") {
      photos[photo.index] = photo.url;
    }
  }
  return photos;
}

export async function savePhoto(index: number, file: File, password: string): Promise<UploadResponse> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Gunakan foto JPG, PNG, WebP, GIF, atau AVIF.");
  }
  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error("Ukuran foto maksimal 2 MB.");
  }

  const response = await fetch("/api/photos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Upload-Password": password,
    },
    body: JSON.stringify({ index, contentType: file.type, image: await fileToBase64(file) }),
  });
  return readJson<UploadResponse>(response);
}
