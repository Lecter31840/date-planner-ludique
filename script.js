const state = {
  step: 0,
  dateTime: "",
  activities: ["Un repas"],
  otherActivity: "",
};

const screens = Array.from(document.querySelectorAll("[data-step]"));
const noButton = document.querySelector("[data-no]");
const dateInput = document.querySelector("[data-date-input]");
const dateError = document.querySelector("[data-date-error]");
const otherField = document.querySelector("[data-other-field]");
const otherInput = document.querySelector("[data-other-input]");
const confettiLayer = document.querySelector("[data-confetti-layer]");

const noPositions = [
  { x: 88, y: 54 },
  { x: -166, y: 34 },
  { x: -118, y: -72 },
  { x: 136, y: -54 },
  { x: 152, y: 74 },
];

let noPositionIndex = 0;
let confettiTimeout;

function showStep(nextStep) {
  state.step = nextStep;
  screens.forEach((screen) => {
    screen.classList.toggle("is-hidden", Number(screen.dataset.step) !== state.step);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (state.step === 3) {
    renderSummary();
    launchConfetti();
  }
}

function setActivity(button) {
  const activity = button.dataset.activity;
  const isSelected = state.activities.includes(activity);

  if (isSelected && state.activities.length > 1) {
    state.activities = state.activities.filter((item) => item !== activity);
  } else if (!isSelected) {
    state.activities.push(activity);
  }

  document.querySelectorAll("[data-activity]").forEach((activityButton) => {
    activityButton.classList.toggle(
      "selected",
      state.activities.includes(activityButton.dataset.activity),
    );
  });

  otherField.classList.toggle("is-hidden", !state.activities.includes("Autre"));

  if (state.activities.includes("Autre")) {
    otherInput.focus();
  }
}

function formatDate(value) {
  if (!value) return "À choisir";

  const date = new Date(value);
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function getFinalActivity() {
  const customActivity = otherInput.value.trim();
  const activities = state.activities.map((activity) => {
    if (activity === "Autre" && customActivity) return customActivity;
    return activity;
  });

  return activities.join(", ");
}

function renderSummary() {
  document.querySelector("[data-summary-date]").textContent = formatDate(state.dateTime);
  document.querySelector("[data-summary-activity]").textContent = getFinalActivity();
}

function launchConfetti() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  window.clearTimeout(confettiTimeout);
  confettiLayer.replaceChildren();

  const colors = ["#ff5b85", "#ffd76e", "#64bfae", "#b986e8", "#ff9a8b", "#fffafd"];
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 96; index += 1) {
    const piece = document.createElement("span");
    const size = 7 + Math.random() * 8;

    piece.className = "confetti-piece";
    piece.style.setProperty("--x", `${Math.random() * 100}%`);
    piece.style.setProperty("--size", `${size}px`);
    piece.style.setProperty("--color", colors[index % colors.length]);
    piece.style.setProperty("--rotation", `${Math.random() * 180}deg`);
    piece.style.setProperty("--drift", `${-90 + Math.random() * 180}px`);
    piece.style.setProperty("--duration", `${2 + Math.random() * 1.6}s`);
    piece.style.setProperty("--delay", `${Math.random() * 0.55}s`);
    fragment.append(piece);
  }

  confettiLayer.append(fragment);
  confettiTimeout = window.setTimeout(() => confettiLayer.replaceChildren(), 4600);
}

function moveNoButton() {
  noPositionIndex = (noPositionIndex + 1) % noPositions.length;
  const nextPosition = noPositions[noPositionIndex];
  const zoneRect = noButton.closest(".button-zone").getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const baseX = zoneRect.width / 2;
  const baseY = zoneRect.height / 2;
  const minX = -baseX;
  const maxX = zoneRect.width - baseX - buttonRect.width;
  const minY = -baseY;
  const maxY = zoneRect.height - baseY - buttonRect.height;
  const x = Math.min(Math.max(nextPosition.x, minX), maxX);
  const y = Math.min(Math.max(nextPosition.y, minY), maxY);

  noButton.style.transform = `translate(${x}px, ${y}px)`;
}

document.querySelector("[data-start]").addEventListener("click", () => showStep(1));

["pointerenter", "focus", "click", "touchstart"].forEach((eventName) => {
  noButton.addEventListener(eventName, (event) => {
    event.preventDefault();
    moveNoButton();
  });
});

document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", () => showStep(Math.max(0, state.step - 1)));
});

document.querySelector("[data-next-date]").addEventListener("click", () => {
  state.dateTime = dateInput.value;

  if (!state.dateTime) {
    dateError.textContent = "Il faut choisir une date et une heure avant de continuer.";
    dateInput.focus();
    return;
  }

  dateError.textContent = "";
  showStep(2);
});

document.querySelector("[data-activity-group]").addEventListener("click", (event) => {
  const button = event.target.closest("[data-activity]");
  if (!button) return;
  setActivity(button);
});

document.querySelector("[data-next-activity]").addEventListener("click", () => {
  state.otherActivity = otherInput.value.trim();
  showStep(3);
});

document.querySelector("[data-restart]").addEventListener("click", () => {
  state.dateTime = "";
  state.activities = ["Un repas"];
  state.otherActivity = "";

  dateInput.value = "";
  otherInput.value = "";
  dateError.textContent = "";
  noPositionIndex = 0;
  noButton.removeAttribute("style");

  document.querySelectorAll("[data-activity]").forEach((activityButton) => {
    activityButton.classList.toggle("selected", activityButton.dataset.activity === "Un repas");
  });
  otherField.classList.add("is-hidden");
  showStep(0);
});

showStep(0);
