"use strict";
(() => {
  const cards = [...document.querySelectorAll(".product")];
  const sizes = ["S", "M", "L", "XL", "2XL", "3XL"];
  const views = [["back", "Back"], ["front", "Front"], ["detail", "Portrait"]];
  const base = "https://exil5t8gmkmhqw70.public.blob.vercel-storage.com/hoodies/v1/";
  const dialog = document.createElement("dialog");
  dialog.id = "piece";
  dialog.setAttribute("aria-labelledby", "piece-name");
  dialog.innerHTML = `
    <div class="piece-nav"><button class="piece-back" aria-label="Back to collection">← <span>The collection</span></button><a href="/saints-of-bad-luck">Saints of Bad Luck</a><div class="piece-switch" role="group" aria-label="Choose character"><button data-piece="nix">Nix</button><button data-piece="rook">Rook</button></div></div>
    <div class="piece-content">
      <div class="piece-stage" aria-label="Product gallery" aria-roledescription="carousel">
        <div class="piece-track">${views.map(([view]) => `<div class="piece-slide"><img data-piece-image="${view}" alt="" width="900" height="1000"></div>`).join("")}</div>
        <button class="piece-arrow previous" aria-label="Previous image">←</button><button class="piece-arrow next" aria-label="Next image">→</button>
        <button class="piece-inspect">Inspect detail <span>↗</span></button>
      </div>
      <div class="piece-view-controls" role="group" aria-label="Product views">${views.map(([view, label]) => `<button data-piece-view="${view}">${label}</button>`).join("")}</div>
      <div class="piece-info">
        <p class="eyebrow">Saints of Bad Luck / The release edition</p>
        <h2 id="piece-name"></h2>
        <p class="piece-price">$150 <span>USD</span></p>
        <details class="piece-information piece-disclosure">
          <summary>Information <span class="piece-disclosure-icon" aria-hidden="true"></span></summary>
          <div class="piece-information-body">
            <p class="piece-description"></p>
            <p class="piece-color eyebrow">Black / bone · 100 of this character</p>
            <div class="piece-details details"></div>
          </div>
        </details>
        <details class="piece-size-picker piece-disclosure">
          <summary>Choose your size <span class="piece-disclosure-icon" aria-hidden="true"></span></summary>
          <div class="piece-sizes" role="group" aria-label="Hoodie size">${sizes.map(size => `<button data-piece-size="${size}" aria-pressed="false">${size}</button>`).join("")}</div>
          <button class="button dark piece-signup" disabled>Get early access <span>↗</span></button>
          <p class="piece-access-note">Sales open soon. Sign up to reserve your hoodie. No payment today.</p>
        </details>
        <a class="piece-film line-link" href="/saints-of-bad-luck">Meet your bad influences <span>↗</span></a>
      </div>
      <p class="piece-colophon eyebrow">VNMSFX Originals · Wear the bad influence.</p>
    </div>`;
  document.body.append(dialog);
  const $ = selector => dialog.querySelector(selector);
  let product = "nix", index = 0, chosenSize = null;
  const originalTitle = document.title;
  const getCard = () => cards.find(card => card.dataset.product === product);
  function syncSize(selection) {
    if (selection.product !== product) return;
    if (chosenSize) chosenSize = selection.size;
    $(".piece-signup").disabled = !chosenSize;
    dialog.querySelectorAll("[data-piece-size]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.pieceSize === chosenSize));
    });
  }
  function view(next) {
    index = (next + views.length) % views.length;
    $(".piece-track").style.transform = `translateX(-${index * 100}%)`;
    dialog.querySelectorAll(".piece-slide").forEach((slide, i) => slide.setAttribute("aria-hidden", String(i !== index)));
    dialog.querySelectorAll("[data-piece-view]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.pieceView === views[index][0]));
    });
  }
  function select(id) {
    product = id;
    chosenSize = null;
    $(".piece-information").open = false;
    $(".piece-size-picker").open = false;
    const card = getCard();
    const name = id === "nix" ? "Nix" : "Rook";
    $("#piece-name").innerHTML = `${name} <em>hoodie</em>`;
    $(".piece-description").textContent = card.querySelector(".description").textContent;
    $(".piece-details").innerHTML = card.querySelector(".details").innerHTML;
    dialog.querySelectorAll("[data-piece-image]").forEach(image => {
      image.src = `${base}${id}-${image.dataset.pieceImage}.webp`;
      image.alt = `${name} black hoodie, ${image.dataset.pieceImage} view — design mockup`;
    });
    dialog.querySelectorAll("[data-piece]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.piece === id)));
    view(0);
    window.SOBLShop.select(id, card.dataset.size);
    const url = new URL(location.href);
    url.searchParams.set("piece", id);
    history.replaceState(null, "", url);
    document.title = `${name} Hoodie — Saints of Bad Luck`;
  }
  function open(id) {
    if (!cards.some(card => card.dataset.product === id)) return;
    select(id);
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add("piece-open");
    dialog.scrollTop = 0;
  }
  document.querySelectorAll("[data-open-piece]").forEach(button => button.addEventListener("click", () => open(button.dataset.openPiece)));
  $(".piece-back").onclick = () => dialog.close();
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("piece-open");
    const url = new URL(location.href);
    url.searchParams.delete("piece");
    history.replaceState(null, "", url);
    document.title = originalTitle;
  });
  dialog.querySelectorAll("[data-piece]").forEach(button => button.onclick = () => select(button.dataset.piece));
  dialog.querySelectorAll("[data-piece-view]").forEach(button => button.onclick = () => view(views.findIndex(([v]) => v === button.dataset.pieceView)));
  dialog.querySelectorAll("[data-piece-size]").forEach(button => button.onclick = () => {
    const size = button.dataset.pieceSize;
    chosenSize = size;
    const card = getCard();
    card.querySelector(`[data-size="${size}"]`).click();
  });
  window.addEventListener("sobl:selection", event => syncSize(event.detail));
  $(".previous").onclick = () => view(index - 1);
  $(".next").onclick = () => view(index + 1);
  $(".piece-inspect").onclick = () => window.dispatchEvent(new CustomEvent("sobl:inspect", { detail: { product, view: views[index][0] } }));
  $(".piece-signup").onclick = () => {
    if (!sizes.includes(chosenSize)) return;
    window.SOBLShop.select(product, chosenSize);
    window.dispatchEvent(new CustomEvent("sobl:early-access"));
  };
  dialog.addEventListener("keydown", event => {
    if (document.querySelector("#early-access[open], #zoom[open]")) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      if (event.target.matches("input, select, textarea")) return;
      event.preventDefault();
      view(index + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  let touchX = null;
  $(".piece-stage").addEventListener("touchstart", event => { touchX = event.touches.length === 1 ? event.touches[0].clientX : null; }, { passive: true });
  $(".piece-stage").addEventListener("touchend", event => {
    if (touchX === null) return;
    const delta = event.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 50) view(index + (delta < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });
  const initial = new URL(location.href).searchParams.get("piece");
  if (initial) open(initial);
})();
