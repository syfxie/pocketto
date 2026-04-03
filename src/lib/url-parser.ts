import { Platform } from "./types";

interface ParsedUrl {
  platform: Platform;
  author: string | null;
  postId: string | null;
}

export function parseSourceUrl(url: string): ParsedUrl {
  try {
    const u = new URL(url);
    const hostname = u.hostname.replace("www.", "");

    // TikTok
    if (hostname.includes("tiktok.com") || hostname === "vm.tiktok.com") {
      const authorMatch = u.pathname.match(/@([^/]+)/);
      const videoMatch = u.pathname.match(/video\/(\d+)/);
      return {
        platform: "tiktok",
        author: authorMatch ? `@${authorMatch[1]}` : null,
        postId: videoMatch ? videoMatch[1] : null,
      };
    }

    // RedNote / Xiaohongshu
    if (
      hostname.includes("xiaohongshu.com") ||
      hostname.includes("xhslink.com")
    ) {
      const noteMatch = u.pathname.match(/\/(?:explore|discovery\/item)\/([a-f0-9]+)/);
      return {
        platform: "rednote",
        author: null,
        postId: noteMatch ? noteMatch[1] : null,
      };
    }

    // Instagram
    if (hostname.includes("instagram.com")) {
      const postMatch = u.pathname.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
      const authorMatch = u.pathname.match(/^\/([A-Za-z0-9_.]+)\/?$/);
      return {
        platform: "instagram",
        author: authorMatch ? `@${authorMatch[1]}` : null,
        postId: postMatch ? postMatch[1] : null,
      };
    }

    // YouTube
    if (
      hostname.includes("youtube.com") ||
      hostname === "youtu.be"
    ) {
      const videoId =
        u.searchParams.get("v") || u.pathname.replace("/", "");
      return {
        platform: "youtube",
        author: null,
        postId: videoId || null,
      };
    }

    return { platform: "other", author: null, postId: null };
  } catch {
    return { platform: "other", author: null, postId: null };
  }
}

export function isDuplicateUrl(existingUrls: string[], newUrl: string): boolean {
  const parsed = parseSourceUrl(newUrl);
  if (!parsed.postId) return existingUrls.includes(newUrl);

  return existingUrls.some((url) => {
    const existing = parseSourceUrl(url);
    return (
      existing.platform === parsed.platform &&
      existing.postId === parsed.postId
    );
  });
}
