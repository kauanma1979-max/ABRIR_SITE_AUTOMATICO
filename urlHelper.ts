/**
 * URL and Launch utilities
 */

export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function extractDomain(url: string): string {
  try {
    const normalized = normalizeUrl(url);
    const parsed = new URL(normalized);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//i, '').split('/')[0] || url;
  }
}

export function getFaviconUrl(url: string): string {
  const domain = extractDomain(url);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

export function isValidUrl(url: string): boolean {
  try {
    const normalized = normalizeUrl(url);
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

export interface BatchLaunchOptions {
  urls: { id: string; url: string; title: string }[];
  delayMs: number;
  onProgress?: (current: number, total: number) => void;
  onLinkOpened?: (id: string) => void;
  onFinish?: (openedCount: number, blockedCount: number) => void;
}

export class LaunchController {
  private isCancelled: boolean = false;

  public cancel() {
    this.isCancelled = true;
  }

  public async launch(options: BatchLaunchOptions): Promise<{ opened: number; blocked: number }> {
    this.isCancelled = false;
    let opened = 0;
    let blocked = 0;
    const { urls, delayMs, onProgress, onLinkOpened, onFinish } = options;
    const total = urls.length;

    for (let i = 0; i < total; i++) {
      if (this.isCancelled) {
        break;
      }

      const item = urls[i];
      const validUrl = normalizeUrl(item.url);

      try {
        const openedWindow = window.open(validUrl, '_blank', 'noopener,noreferrer');
        // When browser blocks popup, window.open returns null or undefined
        if (!openedWindow || openedWindow.closed || typeof openedWindow.closed === 'undefined') {
          blocked++;
        } else {
          opened++;
          onLinkOpened?.(item.id);
        }
      } catch {
        blocked++;
      }

      onProgress?.(i + 1, total);

      // Delay between tabs if requested and more items remain
      if (delayMs > 0 && i < total - 1 && !this.isCancelled) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    onFinish?.(opened, blocked);
    return { opened, blocked };
  }
}
