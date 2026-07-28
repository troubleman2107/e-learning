"use server";

import crypto from "crypto";

/**
 * Extracts Cloudinary public_id from a full Cloudinary URL.
 * Example input: https://res.cloudinary.com/swmsqt0m/image/upload/v1700000000/vietlearn_thumbnails/sample.jpg
 * Returns: vietlearn_thumbnails/sample
 */
export async function extractCloudinaryPublicId(url: string): Promise<string | null> {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    let path = parts[1]; // e.g. "v1700000000/vietlearn_thumbnails/sample.jpg"
    // Remove version tag if present (v12345678/)
    path = path.replace(/^v\d+\//, "");
    // Remove file extension (.jpg, .png, .webp, etc.)
    const lastDotIndex = path.lastIndexOf(".");
    const publicId = lastDotIndex !== -1 ? path.substring(0, lastDotIndex) : path;
    return publicId || null;
  } catch (err) {
    return null;
  }
}

/**
 * Deletes an image asset from Cloudinary using Destroy REST API.
 */
export async function deleteCloudinaryImage(urlOrPublicId: string): Promise<boolean> {
  if (!urlOrPublicId) return false;

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "swmsqt0m";
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const publicId = urlOrPublicId.includes("res.cloudinary.com")
    ? await extractCloudinaryPublicId(urlOrPublicId)
    : urlOrPublicId;

  if (!publicId) return false;

  if (!apiKey || !apiSecret) {
    console.warn(
      `[Cloudinary] Skipped deleting asset "${publicId}": CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET environment variables are missing.`
    );
    return false;
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const strToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

    const formData = new URLSearchParams();
    formData.append("public_id", publicId);
    formData.append("timestamp", timestamp);
    formData.append("api_key", apiKey);
    formData.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.warn(`[Cloudinary] Failed to delete image ${publicId}: ${res.status} ${text}`);
      return false;
    }

    const data = await res.json();
    console.log(`[Cloudinary] Successfully deleted image ${publicId}:`, data.result);
    return data.result === "ok";
  } catch (error) {
    console.error(`[Cloudinary] Error deleting image ${publicId}:`, error);
    return false;
  }
}

/**
 * Creates a folder on Cloudinary using Folders REST API.
 */
export async function createCloudinaryFolder(folderPath: string): Promise<boolean> {
  if (!folderPath) return false;

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "swmsqt0m";
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.warn(
      `[Cloudinary] Skipped creating folder "${folderPath}": CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET environment variables are missing.`
    );
    return false;
  }

  try {
    const authHeader = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/folders/${encodeURIComponent(folderPath)}`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.warn(`[Cloudinary] Failed to create folder "${folderPath}": ${res.status} ${text}`);
      return false;
    }

    console.log(`[Cloudinary] Successfully created folder "${folderPath}"`);
    return true;
  } catch (error) {
    console.error(`[Cloudinary] Error creating folder "${folderPath}":`, error);
    return false;
  }
}

/**
 * Deletes a folder on Cloudinary using Folders REST API.
 */
export async function deleteCloudinaryFolder(folderPath: string): Promise<boolean> {
  if (!folderPath) return false;

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "swmsqt0m";
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.warn(
      `[Cloudinary] Skipped deleting folder "${folderPath}": CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET environment variables are missing.`
    );
    return false;
  }

  try {
    const authHeader = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/folders/${encodeURIComponent(folderPath)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.warn(`[Cloudinary] Failed to delete folder "${folderPath}": ${res.status} ${text}`);
      return false;
    }

    console.log(`[Cloudinary] Successfully deleted folder "${folderPath}"`);
    return true;
  } catch (error) {
    console.error(`[Cloudinary] Error deleting folder "${folderPath}":`, error);
    return false;
  }
}
