const clock = document.getElementById("clock");
const counterBtn = document.getElementById("counter-btn");
let count = 0;

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString();
}
updateClock();
setInterval(updateClock, 1000);

counterBtn.addEventListener("click", () => {
  count += 1;
  counterBtn.textContent = `Clicked ${count} ${count === 1 ? "time" : "times"}`;
});

document.querySelectorAll("[data-theme]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.body.dataset.theme = btn.dataset.theme;
  });
});
