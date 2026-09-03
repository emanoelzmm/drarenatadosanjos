(() => {
  "use strict";

  const GTM_ID = "GTM-PK2P5VGX";
  const STORAGE_KEY = "dra-renata-measurement-consent-v2";
  const CONSENT_DURATION_MS = 180 * 24 * 60 * 60 * 1000;
  const COOKIE_DURATION_SECONDS = CONSENT_DURATION_MS / 1000;

  const deniedConsent = {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  };

  const measurementConsent = {
    ...deniedConsent,
    ad_storage: "granted",
    analytics_storage: "granted",
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", deniedConsent);

  let gtmLoaded = false;
  let lastFocusedElement = null;

  const readChoice = () => {
    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);

      if (!storedValue) return null;

      const storedChoice = JSON.parse(storedValue);
      const isValidChoice = ["accepted", "rejected"].includes(storedChoice.choice);
      const isCurrent = Date.now() - storedChoice.savedAt < CONSENT_DURATION_MS;

      if (!isValidChoice || !isCurrent) {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return storedChoice;
    } catch {
      return null;
    }
  };

  const saveChoice = (choice) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice, savedAt: Date.now() }),
      );
    } catch {
      // A escolha continua válida nesta página quando o armazenamento está indisponível.
    }
  };

  const loadGtm = () => {
    if (gtmLoaded || document.querySelector(`script[data-gtm-id="${GTM_ID}"]`)) return;

    gtmLoaded = true;
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

    const gtmScript = document.createElement("script");
    gtmScript.async = true;
    gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    gtmScript.dataset.gtmId = GTM_ID;
    document.head.append(gtmScript);
  };

  const enableMeasurement = (rememberChoice = true) => {
    window.gtag("consent", "update", measurementConsent);
    window.gtag("set", "cookie_expires", COOKIE_DURATION_SECONDS);
    window.gtag("set", "allow_google_signals", false);
    window.gtag("set", "allow_ad_personalization_signals", false);
    if (rememberChoice) saveChoice("accepted");
    loadGtm();
  };

  const clearMeasurementCookies = () => {
    const cookieNames = document.cookie
      .split(";")
      .map((cookie) => cookie.split("=")[0].trim())
      .filter(
        (name) =>
          name === "_ga" ||
          name.startsWith("_ga_") ||
          name === "_fbp" ||
          name === "_fbc",
      );

    cookieNames.forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.drarenatadosanjos.com.br; SameSite=Lax`;
    });
  };

  const storedChoice = readChoice();

  if (storedChoice?.choice === "accepted") {
    enableMeasurement(false);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const banner = document.querySelector("[data-cookie-consent]");

    if (!banner) return;

    const acceptButton = banner.querySelector("[data-cookie-accept]");
    const rejectButtons = banner.querySelectorAll("[data-cookie-reject]");
    const preferenceButtons = document.querySelectorAll("[data-cookie-preferences]");

    const showBanner = (moveFocus = false) => {
      if (moveFocus) lastFocusedElement = document.activeElement;
      banner.hidden = false;

      if (moveFocus) banner.querySelector("[data-cookie-reject]")?.focus();
    };

    const hideBanner = () => {
      banner.hidden = true;

      if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus();
      }

      lastFocusedElement = null;
    };

    const rejectMeasurement = () => {
      const measurementWasLoaded = gtmLoaded;

      window.gtag("consent", "update", deniedConsent);
      saveChoice("rejected");
      clearMeasurementCookies();
      hideBanner();

      if (measurementWasLoaded) {
        window.setTimeout(() => window.location.reload(), 50);
      }
    };

    acceptButton?.addEventListener("click", () => {
      enableMeasurement();
      hideBanner();
    });

    rejectButtons.forEach((button) => {
      button.addEventListener("click", rejectMeasurement);
    });

    preferenceButtons.forEach((button) => {
      button.addEventListener("click", () => showBanner(true));
    });

    banner.addEventListener("keydown", (event) => {
      if (event.key === "Escape") rejectMeasurement();
    });

    if (!storedChoice) showBanner();
  });
})();
