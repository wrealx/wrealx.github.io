/* =====================================================
   WREAL X — OFFICIAL WEBSITE
   Frontend JavaScript
===================================================== */

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    function () {

        initNavigation();

        initHeader();

        initCookieBanner();

        initNewsletter();

        initChatButton();

        initYear();

    }
);


/* =====================================================
   MOBILE NAVIGATION
===================================================== */

function initNavigation() {

    const button =
        document.getElementById(
            "menuButton"
        );

    const nav =
        document.getElementById(
            "siteNav"
        );


    if (!button || !nav) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            const open =
                nav.classList.toggle(
                    "open"
                );


            button.setAttribute(
                "aria-expanded",
                String(open)
            );


            document.body.classList.toggle(
                "menu-open",
                open
            );

        }
    );


    nav.querySelectorAll("a")
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        nav.classList.remove(
                            "open"
                        );

                        button.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        document.body.classList.remove(
                            "menu-open"
                        );

                    }
                );

            }
        );

}


/* =====================================================
   HEADER ON SCROLL
===================================================== */

function initHeader() {

    const header =
        document.querySelector(
            ".site-header"
        );


    if (!header) {
        return;
    }


    function updateHeader() {

        if (
            window.scrollY > 40
        ) {

            header.classList.add(
                "scrolled"
            );

        } else {

            header.classList.remove(
                "scrolled"
            );

        }

    }


    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );


    updateHeader();

}


/* =====================================================
   COOKIE CONSENT
===================================================== */

function initCookieBanner() {

    const banner =
        document.getElementById(
            "cookieBanner"
        );

    const accept =
        document.getElementById(
            "acceptCookies"
        );

    const reject =
        document.getElementById(
            "rejectCookies"
        );


    if (
        !banner ||
        !accept ||
        !reject
    ) {

        return;

    }


    const saved =
        localStorage.getItem(
            "wrealx_cookie_consent"
        );


    if (saved) {

        banner.remove();

        return;

    }


    function closeBanner(
        choice
    ) {

        localStorage.setItem(
            "wrealx_cookie_consent",
            choice
        );


        banner.style.opacity =
            "0";

        banner.style.transform =
            "translateY(25px)";


        banner.style.pointerEvents =
            "none";


        setTimeout(
            function () {

                banner.remove();

            },
            280
        );

    }


    accept.addEventListener(
        "click",
        function () {

            closeBanner(
                "accepted"
            );

        }
    );


    reject.addEventListener(
        "click",
        function () {

            closeBanner(
                "rejected"
            );

        }
    );

}


/* =====================================================
   NEWSLETTER POPUP
===================================================== */

function initNewsletter() {

    const modal =
        document.getElementById(
            "newsletterModal"
        );

    const close =
        document.getElementById(
            "closeNewsletter"
        );


    if (!modal) {
        return;
    }


    /*
     * Once dismissed during this browser session,
     * don't repeatedly interrupt the visitor.
     */

    if (
        sessionStorage.getItem(
            "wrealx_newsletter_closed"
        ) === "true"
    ) {

        return;

    }


    let triggered =
        false;


    function openNewsletter() {

        if (triggered) {
            return;
        }


        triggered = true;


        modal.classList.add(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function closeNewsletter() {

        modal.classList.remove(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        sessionStorage.setItem(
            "wrealx_newsletter_closed",
            "true"
        );

    }


    /*
     * Show when the visitor starts scrolling.
     */

    function handleScroll() {

        if (
            window.scrollY >= 120
        ) {

            openNewsletter();

            window.removeEventListener(
                "scroll",
                handleScroll
            );

        }

    }


    window.addEventListener(
        "scroll",
        handleScroll,
        {
            passive: true
        }
    );


    if (close) {

        close.addEventListener(
            "click",
            closeNewsletter
        );

    }


    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modal
            ) {

                closeNewsletter();

            }

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                modal.classList.contains(
                    "open"
                )
            ) {

                closeNewsletter();

            }

        }
    );

}


/* =====================================================
   TAWK CHAT BUTTON
===================================================== */

function initChatButton() {

    const button =
        document.getElementById(
            "openChatButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            /*
             * Tawk exposes Tawk_API globally after
             * its script has loaded.
             */

            if (
                window.Tawk_API &&
                typeof window.Tawk_API.maximize ===
                    "function"
            ) {

                window.Tawk_API.maximize();

                return;

            }


            /*
             * If Tawk hasn't loaded yet, tell the
             * visitor to use the floating widget.
             */

            button.innerHTML =
                '<i class="fa-regular fa-comments"></i> Chat Loading…';


            setTimeout(
                function () {

                    button.innerHTML =
                        '<i class="fa-regular fa-comments"></i> Open Live Chat';

                },
                2500
            );

        }
    );

}


/* =====================================================
   CURRENT YEAR
===================================================== */

function initYear() {

    const year =
        document.getElementById(
            "year"
        );


    if (!year) {
        return;
    }


    year.textContent =
        new Date()
            .getFullYear();

}


/* =====================================================
   EXTERNAL LINKS
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        document
            .querySelectorAll(
                'a[target="_blank"]'
            )
            .forEach(
                function (link) {

                    link.setAttribute(
                        "rel",
                        "noopener noreferrer"
                    );

                }
            );

    }
);
