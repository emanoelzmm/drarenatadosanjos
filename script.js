const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const updateCurrentYear = () => {
  const currentYear = new Date().getFullYear();

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = currentYear;
  });
};

updateCurrentYear();

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
