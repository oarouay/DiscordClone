"use client";

import { useState, useEffect } from "react";

export interface LinkPreviewData {
  url: string;
  title?: string | null;
  description?: string | null;
  favicon?: string;
}

const previewCache = new Map<string, LinkPreviewData>();

export function useLinkPreview(url: string) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check cache first
    if (previewCache.has(url)) {
      setPreview(previewCache.get(url) || null);
      return;
    }

    const fetchPreview = async () => {
      setLoading(true);
      setError(null);

      try {
        // Extract domain for favicon
        const domain = new URL(url).hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;

        // Fetch the page with a timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // No timeout as per user preference
        
        let title: string | null = null;

        // Try to fetch and parse the page
        try {
          await fetch(url, {
            method: "GET",
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; LinkPreview/1.0)",
            },
            mode: "no-cors",
            signal: controller.signal,
          });

          // With no-cors, we can't access the response body, so we'll just use basic info
          title = new URL(url).hostname;
        } catch {
          // Silently fail - we'll show minimal preview
          title = new URL(url).hostname;
        } finally {
          clearTimeout(timeout);
        }

        const previewData: LinkPreviewData = {
          url,
          title: title || new URL(url).hostname,
          description: null,
          favicon: faviconUrl,
        };

        // Cache the result
        previewCache.set(url, previewData);
        setPreview(previewData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch preview");
        
        // Still cache a minimal preview
        const minimalPreview: LinkPreviewData = {
          url,
          title: new URL(url).hostname,
          favicon: `https://www.google.com/s2/favicons?sz=32&domain=${new URL(url).hostname}`,
        };
        previewCache.set(url, minimalPreview);
        setPreview(minimalPreview);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  return { preview, loading, error };
}
