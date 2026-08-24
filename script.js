/* =========================================================
   WREAL X — OFFICIAL WEBSITE
   Main JavaScript
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

  /*
   Backend API base URL.

   When the backend is deployed separately, change this to
   something like:

   https://api.yourdomain.com

   If the frontend and backend are served from the same
   domain, leave it as an empty string.
  */

  API_BASE_URL: "",


  /*
   How long the site should wait before trying to show
   the newsletter popup after the visitor begins scrolling.
  */

  NEWSLETTER_SCROLL_DELAY: 900,


  /*
   Minimum scroll distance before the newsletter popup
   is considered eligible.
  */

  NEWSLETTER_SCROLL_DISTANCE: 120,


  /*
   Back-to-top button appears after this many pixels.
  */

  BACK_TO_TOP_DISTANCE: 500,


  /*
   Refresh interval for live statistics.

   5 minutes is deliberately conservative so the website
   does not repeatedly hammer external APIs.
  */

  STATS_REFRESH_INTERVAL: 5 * 60 * 1000

};


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);


const $$ = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));


/* =========================================================
   PAGE READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  initializeYear();

  initializeMobileNavigation();

  initializeScrollReveal();

  initializeBackToTop();

  initializeCookieConsent();

  initializeNewsletterPopup();

  initializeSmoothAnchors();

  initializeStats();

  initializeVideoStats();

  initializeExternalLinks();

});


/* =========================================================
   CURRENT YEAR
========================================================= */

function initializeYear() {

  const yearElement = $("#year");

  if (!yearElement) {
    return;
  }

  yearElement.textContent =
    new Date().getFullYear();

}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function initializeMobileNavigation() {

  const navLinks = $(".navlinks");

  if (!navLinks) {
    return;
  }


  /*
   * Close the mobile menu when a navigation link
   * is selected.
   */

  $$(".navlinks a").forEach(link => {

    link.addEventListener("click", () => {

      navLinks.classList.remove("mobile-open");

    });

  });


  /*
   * Close mobile navigation when the user clicks outside it.
   */

  document.addEventListener("click", event => {

    const menuButton =
      $(".menu");

    if (!menuButton) {
      return;
    }

    const clickedInsideMenu =
      navLinks.contains(event.target);

    const clickedButton =
      menuButton.contains(event.target);


    if (
      !clickedInsideMenu &&
      !clickedButton
    ) {

      navLinks.classList.remove("mobile-open");

    }

  });

}


/* =========================================================
   SMOOTH ANCHOR NAVIGATION
========================================================= */

function initializeSmoothAnchors() {

  $$("a[href^='#']").forEach(anchor => {

    anchor.addEventListener("click", event => {

      const href =
        anchor.getAttribute("href");

      if (
        !href ||
        href === "#"
      ) {
        return;
      }


      const target =
        document.querySelector(href);

      if (!target) {
        return;
      }


      event.preventDefault();


      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        70;


      window.scrollTo({
        top,
        behavior: "smooth"
      });

    });

  });

}


/* =========================================================
   SCROLL REVEAL
========================================================= */

function initializeScrollReveal() {

  const elements =
    $$(".scroll-reveal");

  if (!elements.length) {
    return;
  }


  /*
   * IntersectionObserver gives us a lightweight
   * scroll animation without running a handler on
   * every pixel of scrolling.
   */

  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) {
            return;
          }


          entry.target.classList.add(
            "is-visible"
          );


          observer.unobserve(
            entry.target
          );

        });

      },
      {
        threshold: 0.12,

        rootMargin:
          "0px 0px -45px 0px"
      }
    );


  elements.forEach(element => {

    observer.observe(element);

  });

}


/* =========================================================
   BACK TO TOP
========================================================= */

function initializeBackToTop() {

  const button =
    $(".backtop");

  if (!button) {
    return;
  }


  function updateBackTop() {

    if (
      window.scrollY >
      CONFIG.BACK_TO_TOP_DISTANCE
    ) {

      button.classList.add(
        "visible"
      );

    } else {

      button.classList.remove(
        "visible"
      );

    }

  }


  window.addEventListener(
    "scroll",
    updateBackTop,
    { passive: true }
  );


  updateBackTop();

}


/* =========================================================
   COOKIE CONSENT
========================================================= */

function initializeCookieConsent() {

  const banner =
    $("#cookieBanner");

  const accept =
    $("#acceptCookies");

  const reject =
    $("#rejectCookies");


  if (
    !banner ||
    !accept ||
    !reject
  ) {
    return;
  }


  const COOKIE_NAME =
    "wrealx_cookie_consent";


  /*
   * If the visitor already made a choice,
   * don't display the banner again.
   */

  const previousChoice =
    getCookie(COOKIE_NAME);


  if (previousChoice) {

    banner.remove();

    return;

  }


  accept.addEventListener(
    "click",
    () => {

      setCookie(
        COOKIE_NAME,
        "accepted",
        365
      );


      dismissCookieBanner();

    }
  );


  reject.addEventListener(
    "click",
    () => {

      setCookie(
        COOKIE_NAME,
        "rejected",
        365
      );


      dismissCookieBanner();

    }
  );

}


/* =========================================================
   DISMISS COOKIE BANNER
========================================================= */

function dismissCookieBanner() {

  const banner =
    $("#cookieBanner");

  if (!banner) {
    return;
  }


  banner.style.opacity = "0";

  banner.style.transform =
    "translateY(20px)";


  banner.style.pointerEvents =
    "none";


  setTimeout(() => {

    banner.remove();

  }, 250);

}


/* =========================================================
   COOKIE HELPERS
========================================================= */

function setCookie(
  name,
  value,
  days
) {

  const expires =
    new Date(
      Date.now() +
      days * 24 * 60 * 60 * 1000
    ).toUTCString();


  document.cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;

}


function getCookie(name) {

  const encodedName =
    encodeURIComponent(name) + "=";


  const cookies =
    document.cookie.split(";");


  for (
    let cookie of cookies
  ) {

    cookie =
      cookie.trim();


    if (
      cookie.startsWith(
        encodedName
      )
    ) {

      return decodeURIComponent(
        cookie.substring(
          encodedName.length
        )
      );

    }

  }


  return null;

}


/* =========================================================
   NEWSLETTER POPUP
========================================================= */

function initializeNewsletterPopup() {

  const modal =
    $("#newsletterModal");

  if (!modal) {
    return;
  }


  /*
   * Don't repeatedly interrupt visitors who already
   * dismissed the popup.
   */

  const dismissed =
    sessionStorage.getItem(
      "wrealx_newsletter_dismissed"
    );


  if (dismissed === "true") {
    return;
  }


  let popupShown = false;

  let scrollTimer = null;


  function maybeShowNewsletter() {

    if (popupShown) {
      return;
    }


    if (
      window.scrollY <
      CONFIG.NEWSLETTER_SCROLL_DISTANCE
    ) {
      return;
    }


    popupShown = true;


    scrollTimer =
      setTimeout(() => {

        openNewsletter();

      }, CONFIG.NEWSLETTER_SCROLL_DELAY);


    window.removeEventListener(
      "scroll",
      maybeShowNewsletter
    );

  }


  window.addEventListener(
    "scroll",
    maybeShowNewsletter,
    { passive: true }
  );


  /*
   * Clicking the dark background closes the popup.
   */

  modal.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {

        closeNewsletter();

      }

    }
  );


  /*
   * Escape key closes the popup.
   */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        modal.classList.contains("open")
      ) {

        closeNewsletter();

      }

    }
  );


  /*
   * Make the close function available to the inline
   * onclick handler in index.html.
   */

  window.closeNewsletter =
    closeNewsletter;


  function openNewsletter() {

    if (scrollTimer) {

      clearTimeout(
        scrollTimer
      );

    }


    modal.classList.add(
      "open"
    );


    modal.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.style.overflow =
      "hidden";

  }


  function closeNewsletter() {

    modal.classList.remove(
      "open"
    );


    modal.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.style.overflow =
      "";


    sessionStorage.setItem(
      "wrealx_newsletter_dismissed",
      "true"
    );

  }

}


/* =========================================================
   API HELPERS
========================================================= */

function apiUrl(path) {

  if (!CONFIG.API_BASE_URL) {
    return path;
  }


  return (
    CONFIG.API_BASE_URL.replace(/\/$/, "") +
    "/" +
    path.replace(/^\//, "")
  );

}


/* =========================================================
   FETCH JSON
========================================================= */

async function fetchJSON(
  url,
  options = {}
) {

  const response =
    await fetch(
      url,
      {
        ...options,

        headers: {
          "Accept":
            "application/json",

          ...(options.headers || {})
        }
      }
    );


  if (!response.ok) {

    throw new Error(
      `Request failed: ${response.status}`
    );

  }


  return response.json();

}


/* =========================================================
   NUMBER FORMATTING
========================================================= */

function formatNumber(value) {

  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(
      Number(value)
    )
  ) {

    return "—";

  }


  const number =
    Number(value);


  return new Intl.NumberFormat(
    "en-US",
    {
      notation: "compact",
      maximumFractionDigits: 1
    }
  ).format(number);

}


/* =========================================================
   LIVE ARTIST STATISTICS
========================================================= */

function initializeStats() {

  /*
   * The frontend expects the backend to expose:

       GET /api/stats

   * Example response:

       {
         "youtubeSubscribers": 1200,
         "youtubeViews": 42000,
         "youtubeVideos": 7,
         "soundcloudPlays": 15000
       }

   * If the API isn't available, the page simply leaves
   * these values as "—".
   */

  updateArtistStats();


  /*
   * Refresh periodically.

   * This makes the frontend capable of displaying
   * changing numbers without requiring the visitor
   * to reload the page.
   */

  window.setInterval(
    updateArtistStats,
    CONFIG.STATS_REFRESH_INTERVAL
  );

}


/* =========================================================
   UPDATE ARTIST STATISTICS
========================================================= */

async function updateArtistStats() {

  const statElements = {

    youtubeSubscribers:
      $('[data-stat="youtubeSubscribers"]'),

    youtubeViews:
      $('[data-stat="youtubeViews"]'),

    youtubeVideos:
      $('[data-stat="youtubeVideos"]'),

    soundcloudPlays:
      $('[data-stat="soundcloudPlays"]')

  };


  /*
   * No backend configured yet.
   *
   * This is intentional. A browser should not expose
   * private API credentials such as a YouTube API key.
   *
   * The backend file we'll add later will handle that.
   */

  if (!CONFIG.API_BASE_URL) {

    return;

  }


  try {

    const data =
      await fetchJSON(
        apiUrl(
          "/api/stats"
        )
      );


    if (
      statElements.youtubeSubscribers
    ) {

      statElements
        .youtubeSubscribers
        .textContent =
        formatNumber(
          data.youtubeSubscribers
        );

    }


    if (
      statElements.youtubeViews
    ) {

      statElements
        .youtubeViews
        .textContent =
        formatNumber(
          data.youtubeViews
        );

    }


    if (
      statElements.youtubeVideos
    ) {

      statElements
        .youtubeVideos
        .textContent =
        formatNumber(
          data.youtubeVideos
        );

    }


    if (
      statElements.soundcloudPlays
    ) {

      statElements
        .soundcloudPlays
        .textContent =
        formatNumber(
          data.soundcloudPlays
        );

    }


  } catch (error) {

    console.warn(
      "Wreal X statistics unavailable:",
      error
    );

  }

}


/* =========================================================
   YOUTUBE VIDEO STATISTICS
========================================================= */

function initializeVideoStats() {

  const videoElements =
    $$("[data-video-views]");


  if (!videoElements.length) {
    return;
  }


  /*
   * The frontend expects:

       GET /api/youtube/videos?id=VIDEO_ID

   * Example response:

       {
         "viewCount": 12345
       }
   */


  if (!CONFIG.API_BASE_URL) {

    return;

  }


  videoElements.forEach(
    element => {

      const videoId =
        element.getAttribute(
          "data-video-views"
        );


      if (!videoId) {
        return;
      }


      updateVideoViewCount(
        element,
        videoId
      );

    }
  );

}


async function updateVideoViewCount(
  element,
  videoId
) {

  try {

    const data =
      await fetchJSON(
        apiUrl(
          `/api/youtube/videos?id=${encodeURIComponent(videoId)}`
        )
      );


    element.textContent =
      `Views: ${formatNumber(data.viewCount)}`;


  } catch (error) {

    console.warn(
      `Could not load YouTube statistics for ${videoId}:`,
      error
    );

  }

}


/* =========================================================
   EXTERNAL LINKS
========================================================= */

function initializeExternalLinks() {

  $$("a[target='_blank']").forEach(
    link => {

      /*
       * Security:
       * Prevent the newly opened page from getting
       * access to the original window.
       */

      const currentRel =
        link.getAttribute("rel") || "";


      if (
        !currentRel.includes(
          "noopener"
        )
      ) {

        link.setAttribute(
          "rel",
          `${currentRel} noopener noreferrer`.trim()
        );

      }

    }
  );

}


/* =========================================================
   IMAGE FALLBACK
========================================================= */

document.addEventListener(
  "error",
  event => {

    const target =
      event.target;


    if (
      target &&
      target.tagName === "IMG"
    ) {

      target.classList.add(
        "image-load-error"
      );

    }

  },
  true
);


/* =========================================================
   VISIBILITY / TAB HANDLING
========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    /*
     * We don't stop the site entirely when the visitor
     * changes tabs, but this gives us a clean place for
     * future live-data optimizations.
     */

    if (
      document.visibilityState === "visible"
    ) {

      /*
       * Refresh stats when the visitor comes back.
       */

      if (
        CONFIG.API_BASE_URL
      ) {

        updateArtistStats();

      }

    }

  }
);


/* =========================================================
   SAFE GLOBAL ERROR HANDLING
========================================================= */

window.addEventListener(
  "unhandledrejection",
  event => {

    console.warn(
      "Wreal X website background task failed:",
      event.reason
    );

  }
);


/* =========================================================
   END
========================================================= */
