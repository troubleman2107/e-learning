"use server";

import { prisma } from "@/lib/prisma";

export async function getBunnyStreamConfig() {
  const libraryId =
    process.env.BUNNY_STREAM_LIBRARY_ID || process.env.BUNNY_LIBRARY_ID;
  const apiKey =
    process.env.BUNNY_STREAM_API_KEY ||
    process.env.BUNNY_SECURITY_KEY ||
    process.env.BUNNY_API_KEY;

  if (!libraryId || !apiKey) {
    throw new Error(
      "BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY (or BUNNY_SECURITY_KEY) environment variables are required."
    );
  }

  return { libraryId, apiKey };
}

/**
 * Checks if the course in DB already has a bunnyCollectionId.
 * If yes, returns it. If not, creates a collection in Bunny Stream API,
 * saves the collection guid into the Course record in Neon DB, and returns it.
 */
export async function getOrCreateBunnyCollection(
  courseId: string,
  courseTitle: string
): Promise<string> {
  const { libraryId, apiKey } = await getBunnyStreamConfig();

  if (courseId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { bunnyCollectionId: true },
    });

    if (course?.bunnyCollectionId) {
      return course.bunnyCollectionId;
    }
  }

  const res = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/collections`,
    {
      method: "POST",
      headers: {
        AccessKey: apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ name: courseTitle }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to create Bunny collection: ${res.status} ${errorText}`
    );
  }

  const data = await res.json();
  const collectionId = data.guid;

  if (!collectionId) {
    throw new Error("Bunny API did not return a valid collection guid.");
  }

  if (courseId) {
    await prisma.course.update({
      where: { id: courseId },
      data: { bunnyCollectionId: collectionId },
    });
  }

  return collectionId;
}

/**
 * Creates a video entry in Bunny Stream Library under the given collectionId.
 * Returns the newly created video's guid (videoId).
 */
export async function createBunnyVideoEntry(
  title: string,
  collectionId: string
): Promise<string> {
  const { libraryId, apiKey } = await getBunnyStreamConfig();

  const res = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ title, collectionId }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to create Bunny video entry: ${res.status} ${errorText}`
    );
  }

  const data = await res.json();
  const videoId = data.guid;

  if (!videoId) {
    throw new Error("Bunny API did not return a valid video guid.");
  }

  return videoId;
}

/**
 * Deletes a video entry from Bunny Stream Library by videoId.
 */
export async function deleteBunnyVideoEntry(videoId: string): Promise<boolean> {
  if (!videoId) return false;

  try {
    const { libraryId, apiKey } = await getBunnyStreamConfig();
    const res = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: "DELETE",
        headers: {
          AccessKey: apiKey,
          accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.warn(`[Bunny] Failed to delete video ${videoId}: ${res.status} ${text}`);
      return false;
    }

    console.log(`[Bunny] Successfully deleted video ${videoId}`);
    return true;
  } catch (error) {
    console.error(`[Bunny] Error deleting video ${videoId}:`, error);
    return false;
  }
}

/**
 * Deletes a collection from Bunny Stream Library by collectionId.
 */
export async function deleteBunnyCollection(collectionId: string): Promise<boolean> {
  if (!collectionId) return false;

  try {
    const { libraryId, apiKey } = await getBunnyStreamConfig();
    const res = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/collections/${collectionId}`,
      {
        method: "DELETE",
        headers: {
          AccessKey: apiKey,
          accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.warn(`[Bunny] Failed to delete collection ${collectionId}: ${res.status} ${text}`);
      return false;
    }

    console.log(`[Bunny] Successfully deleted collection ${collectionId}`);
    return true;
  } catch (error) {
    console.error(`[Bunny] Error deleting collection ${collectionId}:`, error);
    return false;
  }
}

/**
 * Fetches the duration (length in seconds) of a video from Bunny Stream Library.
 */
export async function getBunnyVideoDuration(videoId: string): Promise<number> {
  if (!videoId) return 0;
  try {
    const { libraryId, apiKey } = await getBunnyStreamConfig();
    const res = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        headers: {
          AccessKey: apiKey,
          accept: "application/json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data.length === "number" ? Math.round(data.length) : 0;
  } catch (error) {
    console.error(`[Bunny] Error fetching duration for video ${videoId}:`, error);
    return 0;
  }
}

/**
 * Fetches all video durations in a collection (or entire library if no collectionId).
 * Returns a map of videoId -> length (in seconds).
 */
export async function getBunnyCollectionVideoDurations(
  collectionId?: string
): Promise<Record<string, number>> {
  try {
    const { libraryId, apiKey } = await getBunnyStreamConfig();
    const url = collectionId
      ? `https://video.bunnycdn.com/library/${libraryId}/videos?collection=${collectionId}&itemsPerPage=100`
      : `https://video.bunnycdn.com/library/${libraryId}/videos?itemsPerPage=100`;

    const res = await fetch(url, {
      headers: {
        AccessKey: apiKey,
        accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return {};
    const data = await res.json();
    const map: Record<string, number> = {};
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        if (item.guid && typeof item.length === "number") {
          map[item.guid] = Math.round(item.length);
        }
      }
    }
    return map;
  } catch (error) {
    console.error("[Bunny] Error fetching collection video durations:", error);
    return {};
  }
}
