const REVIEW_SUMMARY_TEXT = "4.5★ from 590+ Google reviews";
const PHONE_LINK = "tel:01162559466";

const openingHours = {
  1: { day: "Monday", opens: 8, closes: 18 },
  2: { day: "Tuesday", opens: 8, closes: 18 },
  3: { day: "Wednesday", opens: 8, closes: 18 },
  4: { day: "Thursday", opens: 8, closes: 18 },
  5: { day: "Friday", opens: 8, closes: 18 },
  6: { day: "Saturday", opens: 8, closes: 18 }
};

function getLondonDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false
  }).formatToParts(date);

  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    dayIndex: weekdayNames.indexOf(lookup.weekday),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute)
  };
}

function getNextOpenDay(dayIndex) {
  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = (dayIndex + offset) % 7;
    if (openingHours[candidate]) return openingHours[candidate].day;
  }
  return "Monday";
}

function getOpeningStatus(date = new Date()) {
  const { dayIndex, hour, minute } = getLondonDateParts(date);
  const today = openingHours[dayIndex];
  const currentMinutes = hour * 60 + minute;

  if (today) {
    const opens = today.opens * 60;
    const closes = today.closes * 60;
    if (currentMinutes >= opens && currentMinutes < closes) {
      return "Open now — closes at 6:00 PM";
    }
    if (currentMinutes < opens) {
      return `Closed now — opens ${today.day} at 8:00 AM`;
    }
  }

  return `Closed now — opens ${getNextOpenDay(dayIndex)} at 8:00 AM`;
}

function updateOpeningStatus() {
  const status = getOpeningStatus();
  document.querySelectorAll("#opening-status, #visit-opening-status").forEach((element) => {
    element.textContent = status;
  });
}

function setupReviewSummary() {
  document.querySelectorAll("[data-review-summary]").forEach((element) => {
    element.textContent = REVIEW_SUMMARY_TEXT;
  });
}

function setupPhoneLinks() {
  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.setAttribute("href", PHONE_LINK);
  });
}

function setupMobileNavigation() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-navigation");
  if (!header || !toggle || !nav) return;

  function closeMenu() {
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function setupRevealAnimation() {
  const revealGroups = [
    ...document.querySelectorAll("main > section:not(.hero), footer"),
    ...document.querySelectorAll(".why-grid article, .stock-card, .product-grid article, .service-list article, .quote-grid blockquote, .faq-grid details")
  ];

  revealGroups.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
  });

  if (!("IntersectionObserver" in window)) {
    revealGroups.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

  revealGroups.forEach((element) => revealObserver.observe(element));
}

document.addEventListener("DOMContentLoaded", () => {
  setupReviewSummary();
  setupPhoneLinks();
  setupMobileNavigation();
  setupRevealAnimation();
  updateOpeningStatus();
  window.setInterval(updateOpeningStatus, 60 * 1000);
});
