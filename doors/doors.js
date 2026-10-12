const DOOR_COUNT = 10;
const LOSE_TEXT = "Apple Cash your Brother 10 bucks";

const BUNNY_SVG = `
<svg viewBox="0 0 100 120" role="img" aria-label="A cute bunny">
  <ellipse cx="35" cy="28" rx="9" ry="26" fill="#f4eee8" stroke="#8a7a6a" stroke-width="2"/>
  <ellipse cx="65" cy="28" rx="9" ry="26" fill="#f4eee8" stroke="#8a7a6a" stroke-width="2"/>
  <ellipse cx="35" cy="30" rx="4" ry="18" fill="#f5b5c4"/>
  <ellipse cx="65" cy="30" rx="4" ry="18" fill="#f5b5c4"/>
  <ellipse cx="50" cy="80" rx="30" ry="30" fill="#f4eee8" stroke="#8a7a6a" stroke-width="2"/>
  <circle cx="39" cy="74" r="4" fill="#2b1f14"/>
  <circle cx="61" cy="74" r="4" fill="#2b1f14"/>
  <circle cx="40.2" cy="72.8" r="1.3" fill="#fff"/>
  <circle cx="62.2" cy="72.8" r="1.3" fill="#fff"/>
  <ellipse cx="50" cy="84" rx="4" ry="3" fill="#f08aa4"/>
  <path d="M50 87 v4 M50 91 q-5 5 -10 2 M50 91 q5 5 10 2" fill="none" stroke="#8a7a6a" stroke-width="2" stroke-linecap="round"/>
  <circle cx="30" cy="86" r="5" fill="#f9c4cf" opacity="0.7"/>
  <circle cx="70" cy="86" r="5" fill="#f9c4cf" opacity="0.7"/>
</svg>`;

const doorsEl = document.getElementById("doors");
const messageEl = document.getElementById("message");
const resetBtn = document.getElementById("reset");

let bunnyDoor;
let finished;

function newGame() {
  bunnyDoor = Math.floor(Math.random() * DOOR_COUNT);
  finished = false;
  messageEl.textContent = "Choose wisely...";
  resetBtn.hidden = true;
  doorsEl.innerHTML = "";

  for (let i = 0; i < DOOR_COUNT; i++) {
    const door = document.createElement("button");
    door.className = "door";
    door.setAttribute("aria-label", `Door ${i + 1}`);

    const behind = document.createElement("div");
    behind.className = "behind";
    if (i === bunnyDoor) {
      behind.innerHTML = BUNNY_SVG;
    } else {
      behind.textContent = LOSE_TEXT;
    }

    const front = document.createElement("div");
    front.className = "front";
    front.textContent = i + 1;

    door.append(behind, front);
    door.addEventListener("click", () => openDoor(door, i));
    doorsEl.append(door);
  }
}

function openDoor(door, index) {
  if (finished || door.classList.contains("open")) return;

  door.classList.add("open");
  door.disabled = true;

  if (index === bunnyDoor) {
    finished = true;
    messageEl.textContent = "You found the bunny! 🐰";
    resetBtn.hidden = false;
    doorsEl.querySelectorAll(".door").forEach((d) => (d.disabled = true));
  } else {
    messageEl.textContent = "Oh no! Try another door...";
  }
}

resetBtn.addEventListener("click", newGame);
newGame();
