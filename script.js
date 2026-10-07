const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const updateCurrentYear = () => {
  const currentYear = new Date().getFullYear();

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = currentYear;
  });
};

updateCurrentYear();

document.querySelectorAll("[data-case-carousel]").forEach((carousel) => {
  const slides = [...carousel.querySelectorAll("[data-case-slide]")];
  const viewport = carousel.querySelector("[data-case-viewport]");
  const controls = carousel.querySelector("[data-case-controls]");
  const previous = carousel.querySelector("[data-case-previous]");
  const next = carousel.querySelector("[data-case-next]");
  const counter = carousel.querySelector("[data-case-counter]");
  const pagination = carousel.querySelector("[data-case-dots]");

  if (slides.length < 2 || !viewport || !controls || !previous || !next || !counter || !pagination) return;

  let currentIndex = 0;
  let animation;
  let gesture;
  const formatNumber = (number) => String(number).padStart(2, "0");

  const dots = slides.map((slide, index) => {
    slide.setAttribute("aria-label", `Caso ${index + 1} de ${slides.length}`);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "case-carousel__dot";
    dot.setAttribute("aria-label", `Ver caso ${index + 1} de ${slides.length} de perfiloplastia`);
    dot.setAttribute("aria-controls", viewport.id);
    dot.addEventListener("click", () => showSlide(index));
    pagination.append(dot);
    return dot;
  });

  const updateState = () => {
    slides.forEach((slide, index) => {
      slide.hidden = index !== currentIndex;
      if (index === currentIndex) {
        dots[index].setAttribute("aria-current", "true");
      } else {
        dots[index].removeAttribute("aria-current");
      }
    });
    counter.textContent = `Caso ${formatNumber(currentIndex + 1)} de ${formatNumber(slides.length)}`;
  };

  const showSlide = (index) => {
    const nextIndex = (index + slides.length) % slides.length;
    if (nextIndex === currentIndex) return;

    const direction = index > currentIndex ? 1 : -1;
    animation?.cancel();
    currentIndex = nextIndex;
    updateState();

    if (!reduceMotion.matches) {
      animation = slides[currentIndex].animate(
        { opacity: [0, 1], transform: [`translateX(${direction * 12}px)`, "translateX(0)"] },
        { duration: 240, easing: "ease-out" },
      );
    }
  };

  previous.addEventListener("click", () => showSlide(currentIndex - 1));
  next.addEventListener("click", () => showSlide(currentIndex + 1));

  carousel.addEventListener("keydown", (event) => {
    const destinations = {
      ArrowLeft: currentIndex - 1,
      ArrowRight: currentIndex + 1,
      Home: 0,
      End: slides.length - 1,
    };
    if (!(event.key in destinations)) return;

    event.preventDefault();
    showSlide(destinations[event.key]);
  });

  viewport.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;

    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointerup", (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;

    const deltaX = event.clientX - gesture.x;
    const deltaY = event.clientY - gesture.y;
    gesture = undefined;

    if (Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      showSlide(currentIndex + (deltaX < 0 ? 1 : -1));
    }
  });

  viewport.addEventListener("pointercancel", () => { gesture = undefined; });
  viewport.addEventListener("lostpointercapture", () => { gesture = undefined; });
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) animation?.cancel();
  });

  updateState();
  carousel.tabIndex = 0;
  controls.hidden = false;
});

document.querySelectorAll(".accordion details").forEach((details) => {
  const summary = details.querySelector("summary");
  const content = details.querySelector(".accordion__content");

  if (!summary || !content) return;

  let animation;
  let isClosing = false;
  let isOpening = false;

  const finishAnimation = (open) => {
    details.open = open;
    details.style.height = "";
    details.style.overflow = "";
    animation = undefined;
    isClosing = false;
    isOpening = false;
  };

  const animateHeight = (startHeight, endHeight, open) => {
    animation?.cancel();
    animation = details.animate(
      { height: [`${startHeight}px`, `${endHeight}px`] },
      { duration: 260, easing: "ease-out" },
    );
    animation.onfinish = () => finishAnimation(open);
    animation.oncancel = () => {
      isClosing = false;
      isOpening = false;
    };
  };

  const close = () => {
    isClosing = true;
    isOpening = false;
    animateHeight(details.offsetHeight, summary.offsetHeight, false);
  };

  const open = () => {
    const startHeight = details.offsetHeight;
    details.style.height = `${startHeight}px`;
    details.open = true;
    isOpening = true;
    isClosing = false;

    window.requestAnimationFrame(() => {
      animateHeight(startHeight, summary.offsetHeight + content.offsetHeight, true);
    });
  };

  summary.addEventListener("click", (event) => {
    if (reduceMotion.matches) return;

    event.preventDefault();
    details.style.overflow = "hidden";

    if (isClosing || !details.open) {
      open();
    } else if (isOpening || details.open) {
      close();
    }
  });
});
