import Phaser from "phaser";
import { FarmScene } from "./scenes/FarmScene";
import "./style.css";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#79a943",
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1280, height: 760 },
  render: { antialias: true, pixelArt: false },
  scene: [FarmScene]
});

const panel = document.querySelector<HTMLDivElement>("#panel")!;
const panelContent = document.querySelector<HTMLDivElement>("#panel-content")!;
const toastEl = document.querySelector<HTMLDivElement>("#toast")!;
let toastTimer = 0;
function toast(message: string) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2200);
}
window.addEventListener("farm-ui", ((event: Event) => {
  const detail = (event as CustomEvent).detail;
  if (detail.type === "stats") {
    document.querySelector("#coins")!.textContent = String(detail.data.coins);
    document.querySelector("#level")!.textContent = String(detail.data.level);
    document.querySelector("#xp")!.textContent = String(detail.data.xp);
    document.querySelector("#quest-text")!.textContent = detail.data.quest;
  } else if (detail.type === "toast") toast(detail.data);
  else if (detail.type === "panel") {
    panelContent.innerHTML = detail.data.html;
    panel.classList.remove("hidden");
    panelContent.querySelectorAll<HTMLButtonElement>("[data-buy]").forEach(button => button.addEventListener("click", () => window.dispatchEvent(new CustomEvent("farm-command", { detail: { type: "buy-seed", seed: button.dataset.buy } }))));
    panelContent.querySelectorAll<HTMLButtonElement>("[data-sell]").forEach(button => button.addEventListener("click", () => window.dispatchEvent(new CustomEvent("farm-command", { detail: { type: "sell", seed: button.dataset.sell } }))));
  }
}) as EventListener);
document.querySelector("#close-panel")!.addEventListener("click", () => panel.classList.add("hidden"));
document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".tool").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  window.dispatchEvent(new CustomEvent("farm-command", { detail: { type: "tool", tool: button.dataset.action } }));
}));
document.querySelectorAll<HTMLButtonElement>("[data-panel]").forEach(button => button.addEventListener("click", () => window.dispatchEvent(new CustomEvent("farm-command", { detail: { type: "open-panel", panel: button.dataset.panel } }))));
window.addEventListener("beforeunload", () => game.events.emit("save-now"));
