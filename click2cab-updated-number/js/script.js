/* ==========================================================================
   CLICK2CAB — SITE SCRIPT
   ==========================================================================
   New to JavaScript? Here's the short version of how this file works:

   1. The CONFIG block right below is the ONLY part most people need to
      touch. Change a value there and it updates every page of the site.
   2. Below CONFIG are small, separate functions -- each one does ONE job
      (opening the mobile menu, submitting the booking form, etc.).
   3. At the very bottom, "DOMContentLoaded" runs all of those functions
      once the page has finished loading.

   You do not need to understand every line to safely edit CONFIG.
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. CONFIG -- your business details. Edit these, save, and every page
//    (call buttons, WhatsApp buttons, and the phone number shown in text)
//    updates automatically. No need to hunt through 16 HTML files.
// --------------------------------------------------------------------------
var CONFIG = {
  // Phone number used for "tel:" links, in international format with a "+".
  PHONE: "+919361261350",

  // The same number, formatted the way you want it to LOOK on the page.
  // This must appear in the HTML wrapped in <span class="js-phone-display">
  // for it to be found and updated (it already is, on every page).
  PHONE_DISPLAY: "+91 93612 61350",

  // WhatsApp number for "wa.me" links -- digits only, no "+", no spaces.
  WHATSAPP_NUMBER: "919361261350",

  // Default pre-filled WhatsApp message for generic "Book on WhatsApp"
  // buttons that don't specify their own message.
  DEFAULT_WA_MESSAGE: "Hi Click2Cab, I would like to book a taxi.",
};

(function () {
  "use strict";

  // ------------------------------------------------------------------------
  // 2. HELPER FUNCTIONS -- each one does a single, clearly-named job.
  // ------------------------------------------------------------------------

  /**
   * Makes every "Call Now" link use the phone number from CONFIG above,
   * and every visible phone number span show CONFIG.PHONE_DISPLAY.
   * Run this after changing CONFIG.PHONE or CONFIG.PHONE_DISPLAY.
   */
  function syncPhoneNumbersFromConfig() {
    document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
      link.setAttribute("href", "tel:" + CONFIG.PHONE);
    });

    document.querySelectorAll(".js-phone-display").forEach(function (el) {
      el.textContent = CONFIG.PHONE_DISPLAY;
    });
  }

  /**
   * Makes every WhatsApp link use the number from CONFIG above, while
   * keeping each link's own pre-filled message (some buttons say
   * "book a taxi to Madurai", others just "book a taxi" -- we don't
   * want to overwrite that wording, only the phone number).
   */
  function syncWhatsAppNumbersFromConfig() {
    document.querySelectorAll('a[href*="wa.me/"]').forEach(function (link) {
      var href = link.getAttribute("href");
      var updated = href.replace(/wa\.me\/\d+/, "wa.me/" + CONFIG.WHATSAPP_NUMBER);
      link.setAttribute("href", updated);
    });
  }

  /**
   * Optional convenience: any element marked data-call-btn or data-wa-btn
   * gets its link built entirely from CONFIG. Handy if you add new
   * buttons later and don't want to type the number/link yourself --
   * just add the attribute and this fills in the rest.
   */
  function wireUpDataAttributeButtons() {
    document.querySelectorAll("[data-call-btn]").forEach(function (el) {
      el.setAttribute("href", "tel:" + CONFIG.PHONE);
    });
    document.querySelectorAll("[data-wa-btn]").forEach(function (el) {
      var message = el.getAttribute("data-wa-text") || CONFIG.DEFAULT_WA_MESSAGE;
      el.setAttribute(
        "href",
        "https://wa.me/" + CONFIG.WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message)
      );
    });
  }

  /**
   * Turns the hamburger icon into a working mobile menu button, and lets
   * "Services (dropdown)" open on tap (instead of hover) on phones.
   */
  function setUpMobileMenu() {
    var hamburger = document.querySelector(".hamburger");
    var nav = document.querySelector(".primary-nav");
    if (!hamburger || !nav) return;

    hamburger.addEventListener("click", function () {
      nav.classList.toggle("open");
      var isOpen = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!isOpen));
    });

    document.querySelectorAll(".has-dropdown > a").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var isMobileWidth = window.innerWidth <= 920;
        if (isMobileWidth) {
          event.preventDefault();
          link.parentElement.classList.toggle("open");
        }
      });
    });
  }

  /**
   * Highlights the current page's link in the navigation menu (e.g. "Home"
   * is highlighted while you're on index.html).
   */
  function highlightCurrentPageInNav() {
    var currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("nav.primary-nav a[href]").forEach(function (link) {
      var linkPage = link.getAttribute("href").split("/").pop();
      if (linkPage === currentPage) {
        link.classList.add("active");
      }
    });
  }

  /**
   * Shows the "Return Date" field only when "Round Trip" is selected, and
   * hides + clears it for "One Way". Also stops the return date from being
   * set earlier than the pickup date, and keeps the two in sync if the
   * pickup date is changed afterwards.
   */
  function setUpReturnDateField() {
    var form = document.getElementById("booking-form");
    if (!form) return;

    var returnDateField = document.getElementById("return-date-field");
    var returnDateInput = document.getElementById("return-date");
    var pickupDateInput = form.date;
    var tripRadios = form.querySelectorAll('input[name="trip"]');
    if (!returnDateField || !returnDateInput || !tripRadios.length) return;

    function isRoundTripSelected() {
      var checked = form.querySelector('input[name="trip"]:checked');
      return !!checked && checked.value === "Round Trip";
    }

    function updateReturnDateVisibility() {
      var showReturnDate = isRoundTripSelected();
      returnDateField.hidden = !showReturnDate;
      returnDateInput.required = showReturnDate;
      if (!showReturnDate) {
        returnDateInput.value = "";
      }
    }

    // Don't let someone pick a return date before the pickup date.
    function syncReturnDateMinimum() {
      if (pickupDateInput && pickupDateInput.value) {
        returnDateInput.min = pickupDateInput.value;
        if (returnDateInput.value && returnDateInput.value < pickupDateInput.value) {
          returnDateInput.value = pickupDateInput.value;
        }
      }
    }

    tripRadios.forEach(function (radio) {
      radio.addEventListener("change", updateReturnDateVisibility);
    });
    if (pickupDateInput) {
      pickupDateInput.addEventListener("change", syncReturnDateMinimum);
    }

    // Set the correct starting state in case "Round Trip" is pre-selected
    // (e.g. on round-trip-taxi.html, where it's checked by default).
    updateReturnDateVisibility();
    syncReturnDateMinimum();
  }

  /**
   * When someone submits the booking form, this builds a friendly message
   * and opens WhatsApp with it pre-filled, instead of sending the form
   * to a server (this site doesn't have a backend).
   */
  function setUpBookingForm() {
    var form = document.getElementById("booking-form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var statusMessage = document.getElementById("form-msg");
      var pickup = form.pickup.value.trim();
      var drop = form.drop.value.trim();
      var date = form.date.value;
      var time = form.time.value;
      var tripTypeInput = form.querySelector('input[name="trip"]:checked');
      var passengers = form.passengers.value;
      var tripType = tripTypeInput ? tripTypeInput.value : "One Way";
      var isRoundTrip = tripType === "Round Trip";
      var returnDateInput = document.getElementById("return-date");
      var returnDate = returnDateInput ? returnDateInput.value : "";

      var missingRequiredField = !pickup || !drop || !date || !time;
      if (missingRequiredField) {
        if (statusMessage) {
          statusMessage.textContent = "Please fill pickup, drop, date and time to continue.";
        }
        return;
      }

      if (isRoundTrip && !returnDate) {
        if (statusMessage) {
          statusMessage.textContent = "Please choose a return date for your round trip.";
        }
        return;
      }

      var messageLines = [
        "Hi Click2Cab, I would like to book a taxi.",
        "Pickup: " + pickup,
        "Drop: " + drop,
        "Date: " + date,
        "Time: " + time,
        "Trip Type: " + tripType,
      ];
      if (isRoundTrip && returnDate) {
        messageLines.push("Return Date: " + returnDate);
      }
      messageLines.push("Number of Passengers: " + (passengers || "1"));

      var whatsappText = encodeURIComponent(messageLines.join("\n"));

      if (statusMessage) {
        statusMessage.textContent = "Opening WhatsApp with your trip details...";
      }
      window.open("https://wa.me/" + CONFIG.WHATSAPP_NUMBER + "?text=" + whatsappText, "_blank");
    });
  }

  // ------------------------------------------------------------------------
  // 3. RUN EVERYTHING once the page's HTML has finished loading.
  // ------------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    syncPhoneNumbersFromConfig();
    syncWhatsAppNumbersFromConfig();
    wireUpDataAttributeButtons();
    setUpMobileMenu();
    setUpReturnDateField();
    setUpBookingForm();
    highlightCurrentPageInNav();
  });
})();
