/* =========================================================
   ATELIER NOIR — Interactions
   GSAP • ScrollTrigger • Lenis
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* =======================================================
     LOADING SCREEN
     ======================================================= */
  const loader = document.getElementById("loader");
  const loaderCount = document.getElementById("loaderCount");
  const loaderBar = document.getElementById("loaderBar");

  function initSite() {
    document.body.classList.remove("loading");
    initLenis();
    initHero();
    initScrollReveals();
    initStats();
    initSplitText();
    initParallax();
    initServices();
    initBeforeAfter();
    initFaq();
    initForm();
    initProcessLine();
    if (!isTouch) { initCursor(); initMagnetic(); }
    ScrollTrigger.refresh();
  }

  if (prefersReduced) {
    loader.style.display = "none";
    initSite();
  } else {
    const tl = gsap.timeline();
    tl.to(".loader__letters", { y: 0, duration: 1, ease: "power3.out", delay: 0.2 });

    let progress = { v: 0 };
    tl.to(progress, {
      v: 100, duration: 1.8, ease: "power2.inOut",
      onUpdate: () => {
        const val = Math.round(progress.v);
        loaderCount.textContent = val;
        loaderBar.style.width = val + "%";
      }
    }, 0.3);

    tl.to(".loader__inner", { y: -30, opacity: 0, duration: 0.6, ease: "power2.in" }, "+=0.15");
    tl.to(loader, {
      yPercent: -100, duration: 0.9, ease: "power3.inOut",
      onComplete: () => { loader.style.display = "none"; }
    }, "-=0.2");
    tl.add(initSite, "-=0.6");
  }

  /* =======================================================
     LENIS SMOOTH SCROLL
     ======================================================= */
  let lenis;
  function initLenis() {
    if (prefersReduced || typeof Lenis === "undefined") return;
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Anchor links
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.4 });
        document.body.classList.remove("menu-open");
      });
    });
  }

  /* =======================================================
     NAVIGATION
     ======================================================= */
  const nav = document.getElementById("nav");
  const onScrollNav = () => {
    if (window.scrollY > 60) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScrollNav);
  onScrollNav();

  // Burger / mobile menu
  document.getElementById("burger").addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
  });
  document.querySelectorAll(".mobile-menu a").forEach((a) =>
    a.addEventListener("click", () => document.body.classList.remove("menu-open"))
  );

  /* =======================================================
     HERO INTRO
     ======================================================= */
  function initHero() {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(".hero__title .line > span", { y: 0, duration: 1.1, stagger: 0.12 })
      .to(".hero__eyebrow", { opacity: 1, y: 0, duration: 0.8 }, "-=0.8")
      .to(".hero__sub", { opacity: 1, y: 0, duration: 0.8 }, "-=0.6")
      .to(".hero__actions", { opacity: 1, y: 0, duration: 0.8 }, "-=0.6");

    gsap.set(".hero__eyebrow, .hero__sub, .hero__actions", { y: 30 });

    // Graceful video fallback
    const heroVideo = document.getElementById("heroVideo");
    if (heroVideo) {
      heroVideo.addEventListener("error", () => {
        heroVideo.style.display = "none";
      }, true);
      heroVideo.play().catch(() => {
        heroVideo.style.display = "none";
      });
    }

    // Parallax hero media on scroll
    if (!prefersReduced) {
      gsap.to(".hero__media", {
        yPercent: 18, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
      gsap.to(".hero__content", {
        yPercent: 30, opacity: 0.3, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

  /* =======================================================
     GENERIC SCROLL REVEALS
     ======================================================= */
  function initScrollReveals() {
    gsap.utils.toArray("[data-reveal]").forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    // Stagger benefit list and service rows via parent groups handled individually above.
  }

  /* =======================================================
     SPLIT TEXT — word-level reveal (spaces preserved)
     Each word is wrapped in <span class="word"> so real
     whitespace text-nodes sit between spans — no space
     collapse, no invisible-span tricks.
     ======================================================= */
  function initSplitText() {
    gsap.utils.toArray(".split-text").forEach((el) => {
      const text = el.textContent.trim();
      el.innerHTML = "";

      // Split into words; place real text-node spaces between word-spans
      const words = text.split(" ");
      words.forEach((word, i) => {
        const span = document.createElement("span");
        span.className = "word";
        // overflow:hidden clips the slide-up without hiding neighbours
        span.style.cssText = "display:inline-block;overflow:hidden;vertical-align:bottom;";

        const inner = document.createElement("span");
        inner.className = "word__inner";
        inner.style.cssText = "display:inline-block;";
        inner.textContent = word;
        span.appendChild(inner);
        el.appendChild(span);

        // Real whitespace text-node — browsers render this correctly
        if (i < words.length - 1) {
          el.appendChild(document.createTextNode(" "));
        }
      });

      const inners = el.querySelectorAll(".word__inner");
      gsap.set(inners, { yPercent: 110, opacity: 0 });
      gsap.to(inners, {
        yPercent: 0,
        opacity:  1,
        duration: 0.75,
        ease:     "power3.out",
        stagger:  0.045,
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });
  }


  /* =======================================================
     COUNTERS
     ======================================================= */
  function initStats() {
    gsap.utils.toArray(".counter").forEach((el) => {
      const target = +el.dataset.target;
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: () => {
          gsap.to(obj, {
            v: target, duration: 2, ease: "power2.out",
            onUpdate: () => { el.textContent = Math.round(obj.v); }
          });
        }
      });
    });
  }

  /* =======================================================
     PARALLAX IMAGES
     ======================================================= */
  function initParallax() {
    if (prefersReduced) return;
    gsap.utils.toArray("[data-parallax]").forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 40;
      gsap.to(el, {
        y: speed, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  /* =======================================================
     SERVICES — image follows cursor
     ======================================================= */
  function initServices() {
    if (isTouch) return;
    gsap.utils.toArray(".service").forEach((service) => {
      const img = service.querySelector(".service__hover-img");
      if (!img) return;
      service.addEventListener("mousemove", (e) => {
        const rect = service.getBoundingClientRect();
        const y = e.clientY - rect.top;
        gsap.to(img, { y: y - img.offsetHeight / 2, duration: 0.6, ease: "power3.out" });
      });
    });
  }

  /* =======================================================
     BEFORE / AFTER SLIDER
     ======================================================= */
  function initBeforeAfter() {
    const slider = document.getElementById("baSlider");
    const before = document.getElementById("baBefore");
    const handle = document.getElementById("baHandle");
    if (!slider) return;
    let dragging = false;

    const setPos = (clientX) => {
      const rect = slider.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      before.style.width = pct + "%";
      handle.style.left = pct + "%";
    };

    const down = () => (dragging = true);
    const up = () => (dragging = false);
    const move = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(x);
    };

    slider.addEventListener("mousedown", (e) => { down(); setPos(e.clientX); });
    slider.addEventListener("touchstart", (e) => { down(); setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move, { passive: true });
  }

  /* =======================================================
     FAQ ACCORDION
     ======================================================= */
  function initFaq() {
    document.querySelectorAll(".faq__item").forEach((item) => {
      const q = item.querySelector(".faq__q");
      const a = item.querySelector(".faq__a");
      q.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        document.querySelectorAll(".faq__item").forEach((other) => {
          other.classList.remove("open");
          other.querySelector(".faq__a").style.height = "0px";
        });
        if (!isOpen) {
          item.classList.add("open");
          a.style.height = a.scrollHeight + "px";
        }
      });
    });
  }

  /* =======================================================
     PROCESS PROGRESS LINE
     ======================================================= */
  function initProcessLine() {
    const bar = document.getElementById("processProgress");
    if (!bar) return;
    gsap.to(bar, {
      width: "100%", ease: "none",
      scrollTrigger: { trigger: ".process__timeline", start: "top 70%", end: "bottom 70%", scrub: true }
    });
  }

  /* =======================================================
     LEAD FORM
     ======================================================= */
  function initForm() {
    const form = document.getElementById("leadForm");
    const success = document.getElementById("leadSuccess");
    if (!form) return;

    const validators = {
      name: (v) => v.trim().length >= 2,
      phone: (v) => /^[+\d][\d\s-]{7,}$/.test(v.trim()),
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
    };

    form.addEventListener("submit", (e) => {
      let valid = true;
      Object.keys(validators).forEach((key) => {
        const input = form.elements[key];
        if (!validators[key](input.value)) {
          input.classList.add("invalid");
          valid = false;
        } else {
          input.classList.remove("invalid");
        }
      });
      if (!valid) {
        e.preventDefault();
        gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.45, ease: "elastic.out(1,0.4)" });
        return;
      }

      // If a real form endpoint is configured, allow the browser to submit.
      if (form.action && form.action.includes("formsubmit.co")) return;

      // Fallback behavior for local/demo mode without backend endpoint.
      e.preventDefault();
      gsap.to(form, {
        opacity: 0, y: 20, duration: 0.5, ease: "power2.in",
        onComplete: () => {
          form.style.pointerEvents = "none";
          success.classList.add("show");
        }
      });
    });
  }

  /* =======================================================
     CUSTOM CURSOR
     ======================================================= */
  function initCursor() {
    const dot = document.getElementById("cursor");
    const ring = document.getElementById("cursorFollow");
    let mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      gsap.set(dot, { x: mx, y: my });
    });

    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      gsap.set(ring, { x: rx, y: ry });
    });

    document.querySelectorAll("a, button, [data-magnetic], .service, .project, .ba__slider").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
    });
  }

  /* =======================================================
     MAGNETIC BUTTONS
     ======================================================= */
  function initMagnetic() {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = el.classList.contains("project") ? 12 : 28;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: (x / r.width) * strength, y: (y / r.height) * strength, duration: 0.6, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.4)" });
      });
    });
  }

  // Re-measure open FAQ on resize
  window.addEventListener("resize", () => {
    const open = document.querySelector(".faq__item.open .faq__a");
    if (open) open.style.height = open.scrollHeight + "px";
  });
});

// add loading class immediately
document.body.classList.add("loading");
