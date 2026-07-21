import { useEffect } from "react";

const SITE_URL = "https://www.goudagiggles.com";

const DEFAULTS = {
  title: "Gouda Giggles Charcuterie | Latham, NY | Boards, Grazing Tables & Workshops",
  description:
    "Gouda Giggles Charcuterie in Latham, NY creates artisanal charcuterie boards (small, medium, large), grazing tables, and workshops for Albany, Schenectady, Troy & the Capital Region. Order online!",
  canonical: `${SITE_URL}/`,
  ogTitle: "Gouda Giggles Charcuterie | Latham, NY | Boards & Grazing Tables",
  ogDescription:
    "Artisanal charcuterie boards, grazing tables & workshops in Latham, NY. Serving Albany, Schenectady, Troy & the Capital Region. Order online!",
  ogImage: `${SITE_URL}/images/product-1.png`,
  twitterTitle: "Gouda Giggles Charcuterie | Latham, NY",
  twitterDescription:
    "Artisanal charcuterie boards & grazing tables for Latham, Albany, Schenectady & Troy, NY. Order online!",
  twitterImage: `${SITE_URL}/images/product-1.png`,
};

interface PageMetaProps {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  jsonLd?: object;
}

function setMeta(selector: string, attrPair: [string, string], content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrPair[0], attrPair[1]);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setPageJsonLd(jsonLd: object | undefined) {
  let el = document.querySelector<HTMLScriptElement>(
    'script[type="application/ld+json"][data-page-meta]',
  );
  if (jsonLd) {
    if (!el) {
      el = document.createElement("script");
      el.setAttribute("type", "application/ld+json");
      el.setAttribute("data-page-meta", "true");
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(jsonLd);
  } else if (el) {
    el.remove();
  }
}

function applyMeta(props: PageMetaProps) {
  const {
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = "website",
    twitterTitle,
    twitterDescription,
    twitterImage,
    jsonLd,
  } = props;

  document.title = title;

  setMeta('meta[name="description"]', ["name", "description"], description);
  setLink("canonical", canonical);

  setMeta('meta[property="og:type"]', ["property", "og:type"], ogType);
  setMeta('meta[property="og:title"]', ["property", "og:title"], ogTitle ?? title);
  setMeta(
    'meta[property="og:description"]',
    ["property", "og:description"],
    ogDescription ?? description,
  );
  setMeta('meta[property="og:url"]', ["property", "og:url"], canonical);
  if (ogImage) {
    setMeta('meta[property="og:image"]', ["property", "og:image"], ogImage);
  }

  setMeta(
    'meta[name="twitter:title"]',
    ["name", "twitter:title"],
    twitterTitle ?? ogTitle ?? title,
  );
  setMeta(
    'meta[name="twitter:description"]',
    ["name", "twitter:description"],
    twitterDescription ?? ogDescription ?? description,
  );
  if (twitterImage ?? ogImage) {
    setMeta(
      'meta[name="twitter:image"]',
      ["name", "twitter:image"],
      (twitterImage ?? ogImage)!,
    );
  }

  setPageJsonLd(jsonLd);
}

function restoreDefaults() {
  document.title = DEFAULTS.title;
  setMeta('meta[name="description"]', ["name", "description"], DEFAULTS.description);
  setLink("canonical", DEFAULTS.canonical);
  setMeta('meta[property="og:type"]', ["property", "og:type"], "website");
  setMeta('meta[property="og:title"]', ["property", "og:title"], DEFAULTS.ogTitle);
  setMeta(
    'meta[property="og:description"]',
    ["property", "og:description"],
    DEFAULTS.ogDescription,
  );
  setMeta('meta[property="og:url"]', ["property", "og:url"], DEFAULTS.canonical);
  setMeta('meta[property="og:image"]', ["property", "og:image"], DEFAULTS.ogImage);
  setMeta('meta[name="twitter:title"]', ["name", "twitter:title"], DEFAULTS.twitterTitle);
  setMeta(
    'meta[name="twitter:description"]',
    ["name", "twitter:description"],
    DEFAULTS.twitterDescription,
  );
  setMeta('meta[name="twitter:image"]', ["name", "twitter:image"], DEFAULTS.twitterImage);
  setPageJsonLd(undefined);
}

/**
 * PageMeta
 *
 * Renders nothing to the DOM but imperatively updates <head> metadata
 * (title, description, canonical, og:*, twitter:*, optional JSON-LD) for
 * the current route. On unmount it restores the homepage defaults so that
 * navigating back to "/" keeps the right metadata.
 *
 * This is the SPA-layer fix. It handles JavaScript-enabled crawlers (Google)
 * and browsers. Static/social bots that skip JS still see the homepage HTML;
 * the long-term fix is prerendering, but this eliminates the wrong-canonical
 * problem that is the most damaging signal.
 */
export function PageMeta(props: PageMetaProps) {
  const {
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    twitterTitle,
    twitterDescription,
    twitterImage,
    jsonLd,
  } = props;

  useEffect(() => {
    applyMeta({
      title,
      description,
      canonical,
      ogTitle,
      ogDescription,
      ogImage,
      ogType,
      twitterTitle,
      twitterDescription,
      twitterImage,
      jsonLd,
    });

    return restoreDefaults;
  }, [
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    twitterTitle,
    twitterDescription,
    twitterImage,
    // JSON.stringify so the effect re-runs when the object content changes
    // (product data loaded async), without causing infinite loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(jsonLd),
  ]);

  return null;
}
