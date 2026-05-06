(() => {
  const body = document.body;
  const root = document.documentElement;
  const urlParams = new URLSearchParams(window.location.search);
  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches || urlParams.has("instant");
  const ticketUrl =
    "https://www.eventbrite.com/e/depth-sessions001-house-music-night-hoffs-margate-tickets-1986761825101";
  const djProfiles = {
    "alfie-turner": {
      name: "Alfie Turner",
      copy:
        "Warmth at the edge of the room. Patient rhythm, soulful pressure, slow-release movement.",
      signal: "Warm / patient",
      texture: "Soulful grain",
      pressure: "Slow build",
    },
    "billy-young": {
      name: "Billy Young",
      copy:
        "Deep swing and close-focus groove. Built for the point where conversation gives way to sound.",
      signal: "Deep / rolling",
      texture: "Low-lit groove",
      pressure: "Room-led",
    },
    gaffa: {
      name: "GAFFA",
      copy:
        "Percussive weight, clipped motion, late-room intensity. Direct lines through the basement dark.",
      signal: "Percussive",
      texture: "Sharp edges",
      pressure: "High tension",
    },
    lou: {
      name: "Lou",
      copy:
        "Soulful cuts and low-lit texture. The lift before the room tightens and the floor moves inward.",
      signal: "Soulful / fluid",
      texture: "Soft tension",
      pressure: "Open current",
    },
    "louis-pardo": {
      name: "Louis Pardo",
      copy:
        "Deep house pressure with a cinematic pull. Sound for the final descent below the surface.",
      signal: "Deep house",
      texture: "Submerged swing",
      pressure: "Final descent",
    },
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const setTicketLinks = () => {
    document.querySelectorAll("[data-ticket-link]").forEach((link) => {
      link.href = ticketUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  };

  const setupStickyCta = () => {
    const hero = document.querySelector(".hero");
    const fixedCta = document.querySelector(".fixed-cta");
    let ticking = false;

    if (!hero || !fixedCta) return;

    const setVisible = (isVisible) => {
      body.classList.toggle("fixed-cta-visible", isVisible);
      fixedCta.setAttribute("aria-hidden", String(!isVisible));
      fixedCta.tabIndex = isVisible ? 0 : -1;
    };

    const update = () => {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      const hasPassedHero = window.scrollY >= heroBottom - 8;

      setVisible(hasPassedHero);
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  };

  const setupDjModal = () => {
    const modal = document.getElementById("dj-modal");
    const title = document.getElementById("dj-modal-title");
    const copy = document.getElementById("dj-modal-copy");
    const signal = document.getElementById("dj-modal-signal");
    const texture = document.getElementById("dj-modal-texture");
    const pressure = document.getElementById("dj-modal-pressure");
    const triggers = [...document.querySelectorAll("[data-dj-profile]")];
    const closeButtons = [...document.querySelectorAll("[data-close-dj-modal]")];
    let activeTrigger = null;

    if (!modal || !title || !copy || !signal || !texture || !pressure || !triggers.length) {
      return;
    }

    const getFocusable = () =>
      [
        ...modal.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        ),
      ].filter((element) => element.offsetParent !== null);

    const openModal = (profileKey, trigger) => {
      const profile = djProfiles[profileKey];
      if (!profile) return;

      activeTrigger = trigger;
      title.textContent = profile.name;
      copy.textContent = profile.copy;
      signal.textContent = profile.signal;
      texture.textContent = profile.texture;
      pressure.textContent = profile.pressure;

      modal.hidden = false;
      body.classList.add("modal-open");
      window.requestAnimationFrame(() => {
        modal.classList.add("is-open");
        modal.querySelector(".dj-modal__close")?.focus();
      });
    };

    const closeModal = () => {
      if (modal.hidden) return;

      modal.classList.remove("is-open");
      body.classList.remove("modal-open");
      window.setTimeout(() => {
        modal.hidden = true;
        activeTrigger?.focus();
        activeTrigger = null;
      }, prefersReducedMotion ? 0 : 240);
    };

    const trapFocus = (event) => {
      if (event.key !== "Tab" || modal.hidden) return;

      const focusable = getFocusable();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        openModal(trigger.dataset.djProfile, trigger);
      });
    });

    closeButtons.forEach((button) => {
      button.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      trapFocus(event);
    });
  };

  const setupReveals = () => {
    const revealTargets = [...document.querySelectorAll(".reveal")];

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target;
          const delay = Number(target.dataset.revealDelay || 0);

          window.setTimeout(() => target.classList.add("is-visible"), delay);

          observer.unobserve(target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.16,
      }
    );

    revealTargets.forEach((target, index) => {
      target.dataset.revealDelay = String((index % 4) * 90);
      observer.observe(target);
    });
  };

  const setupPhaseTracking = () => {
    const phases = [...document.querySelectorAll("[data-phase]")];
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const phase = entry.target.dataset.phase || "surface";
          body.dataset.phase = phase;
          body.classList.toggle("is-depth", phase === "depth");
        });
      },
      {
        threshold: 0.42,
      }
    );

    phases.forEach((phase) => observer.observe(phase));
  };

  const setupParallax = () => {
    const parallaxTargets = [...document.querySelectorAll("[data-parallax]")];
    const driftTargets = [...document.querySelectorAll("[data-drift]")];
    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight || 1;
      const maxScroll = Math.max(1, document.body.scrollHeight - viewportHeight);
      const progress = clamp(scrollY / maxScroll, 0, 1);

      root.style.setProperty("--scroll-progress", progress.toFixed(4));

      parallaxTargets.forEach((target) => {
        const speed = Number(target.dataset.speed || 0.12);
        const rect = target.getBoundingClientRect();
        const isFixedLayer = target.closest(".depth-field");
        const localProgress = isFixedLayer
          ? scrollY / viewportHeight
          : (rect.top - viewportHeight) / viewportHeight;
        const distance = isFixedLayer
          ? scrollY * speed * 0.22
          : localProgress * speed * -120;

        target.style.setProperty("--parallax-y", `${distance.toFixed(2)}px`);
      });

      driftTargets.forEach((target) => {
        const speed = Number(target.dataset.speed || 0.1);
        const rect = target.getBoundingClientRect();
        const centerOffset = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
        const y = clamp(centerOffset, -1.4, 1.4) * speed * -82;
        const scale = 1 + clamp(1 - Math.abs(centerOffset), 0, 1) * speed * 0.045;

        target.style.setProperty("--drift-y", `${y.toFixed(2)}px`);
        target.style.setProperty("--drift-scale", scale.toFixed(4));
      });

      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    if (prefersReducedMotion) {
      root.style.setProperty("--scroll-progress", "0");
      return;
    }

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  };

  window.addEventListener("DOMContentLoaded", () => {
    setTicketLinks();
    setupStickyCta();
    setupDjModal();
    setupReveals();
    setupPhaseTracking();
    setupParallax();
  });
})();
