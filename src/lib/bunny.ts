import crypto from "crypto";

export function generateBunnyToken(videoId: string): string {
  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const securityKey = process.env.BUNNY_SECURITY_KEY;

  if (!libraryId || !securityKey) {
    throw new Error(
      "BUNNY_LIBRARY_ID and BUNNY_SECURITY_KEY environment variables are required."
    );
  }

  // Set expiration time to 1 hour (3600 seconds) from now
  const expirationTime = Math.floor(Date.now() / 1000) + 3600;

  // Create the signature: sha256(securityKey + videoId + expirationTime)
  const hash = crypto
    .createHash("sha256")
    .update(`${securityKey}${videoId}${expirationTime}`)
    .digest("hex");

  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${hash}&expires=${expirationTime}`;
}
