import { randomUUID } from "node:crypto";

const REPOSITORY = "Dapa77405/webultah";
const BRANCH = "main";
const UPLOAD_DIRECTORY = "public/uploads";
const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const GITHUB_API = "https://api.github.com";

function json(response, status, body) {
  response.setHeader("Cache-Control", "no-store");
  return response.status(status).json(body);
}

function contentsUrl(path) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${GITHUB_API}/repos/${REPOSITORY}/contents/${encodedPath}`;
}

function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function listFiles() {
  const url = new URL(contentsUrl(UPLOAD_DIRECTORY));
  url.searchParams.set("ref", BRANCH);
  const response = await fetch(url, { headers: githubHeaders() });
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`GitHub photo listing failed (${response.status}).`);
  const files = await response.json();
  if (!Array.isArray(files)) throw new Error("GitHub returned an invalid photo listing.");
  return files.filter((file) => file.type === "file" && typeof file.name === "string" && typeof file.sha === "string");
}

async function updateFile(path, method, body) {
  const response = await fetch(contentsUrl(path), {
    method,
    headers: { ...githubHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`GitHub photo update failed (${response.status}).`);
  if (response.status === 204) return null;
  return response.json();
}

function photoFileInfo(name) {
  const match = /^photo-(\d+)-(\d+)-[a-f0-9-]+\.(jpg|png|webp|gif|avif)$/i.exec(name);
  if (!match) return null;
  const index = Number(match[1]) - 1;
  const timestamp = Number(match[2]);
  if (!Number.isInteger(index) || index < 0 || index >= 6 || !Number.isFinite(timestamp)) return null;
  return { index, timestamp };
}

async function getPhotos() {
  const files = await listFiles();
  const latest = new Map();
  for (const file of files) {
    const info = photoFileInfo(file.name);
    if (!info) continue;
    const current = latest.get(info.index);
    if (!current || info.timestamp > current.timestamp || (info.timestamp === current.timestamp && file.name > current.name)) {
      latest.set(info.index, { ...info, name: file.name });
    }
  }
  return Array.from(latest, ([index, photo]) => ({
    index,
    url: `https://raw.githubusercontent.com/${REPOSITORY}/${BRANCH}/${UPLOAD_DIRECTORY}/${encodeURIComponent(photo.name)}`,
  }));
}

async function uploadPhoto(request, response) {
  const { index, contentType, image } = request.body ?? {};
  const extension = IMAGE_EXTENSIONS[contentType];
  if (!Number.isInteger(index) || index < 0 || index >= 6 || !extension || typeof image !== "string") {
    return json(response, 400, { error: "Data foto tidak valid." });
  }
  if (image.length > Math.ceil(MAX_PHOTO_SIZE / 3) * 4 + 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(image)) {
    return json(response, 413, { error: "Ukuran foto maksimal 2 MB atau format datanya tidak valid." });
  }
  const bytes = Buffer.from(image, "base64");
  if (bytes.length === 0 || bytes.length > MAX_PHOTO_SIZE || bytes.toString("base64") !== image) {
    return json(response, 413, { error: "Ukuran foto maksimal 2 MB atau format datanya tidak valid." });
  }

  const currentFiles = (await listFiles()).filter((file) => photoFileInfo(file.name)?.index === index);
  const timestamp = Date.now();
  const filename = `photo-${index + 1}-${timestamp}-${randomUUID()}.${extension}`;
  const path = `${UPLOAD_DIRECTORY}/${filename}`;
  await updateFile(path, "PUT", {
    message: `Upload shared birthday photo ${index + 1}`,
    branch: BRANCH,
    content: bytes.toString("base64"),
  });

  let cleanupWarning = false;
  for (const file of currentFiles) {
    try {
      await updateFile(`${UPLOAD_DIRECTORY}/${file.name}`, "DELETE", {
        message: `Replace shared birthday photo ${index + 1}`,
        branch: BRANCH,
        sha: file.sha,
      });
    } catch (error) {
      cleanupWarning = true;
      console.error("Could not remove an older shared photo.", error);
    }
  }

  return json(response, 200, {
    url: `https://raw.githubusercontent.com/${REPOSITORY}/${BRANCH}/${UPLOAD_DIRECTORY}/${encodeURIComponent(filename)}`,
    cleanupWarning,
  });
}

export default async function handler(request, response) {
  if (!process.env.GITHUB_TOKEN) {
    return json(response, 503, { error: "Token GitHub belum dikonfigurasi di Vercel." });
  }
  if (request.method === "GET") {
    try {
      return json(response, 200, { photos: await getPhotos() });
    } catch (error) {
      console.error("Could not load shared photos from GitHub.", error);
      return json(response, 502, { error: "Foto bersama tidak dapat dimuat dari GitHub." });
    }
  }
  if (request.method === "POST") {
    try {
      return await uploadPhoto(request, response);
    } catch (error) {
      console.error("Could not save shared photo to GitHub.", error);
      return json(response, 502, { error: "Foto gagal disimpan ke GitHub. Periksa izin token dan konfigurasi repo." });
    }
  }
  response.setHeader("Allow", "GET, POST");
  return json(response, 405, { error: "Metode permintaan tidak didukung." });
}
