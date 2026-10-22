"use strict";
(() => {
  const base =
    "https://exil5t8gmkmhqw70.public.blob.vercel-storage.com/hoodies/v3-studio-20261022/";
  const sizes = ["S", "M", "L", "XL", "2XL", "3XL"];
  const catalog = [
    {
      id: "nix",
      name: "Nix",
      story: "He used to work for Vernon.",
      still: "episode-02-film-v2.png",
      description:
        "Nix’s side-eye says what you were thinking. His oversized back portrait and the special Saints release logo up front make it official: “Who the fuck is we?”",
    },
    {
      id: "rook",
      name: "Rook",
      story: "The one they’re getting back.",
      still: "episode-01-film-v2.png",
      description:
        "Rook doesn’t need a speech. Her portrait takes the back, with the special Saints release logo up front and the full mark below her stare.",
    },
  ];
  const $ = (s) => document.querySelector(s);
  const source = (id, view) => `${base}${id}-${view}.webp`;
  const views = [
    ["back", "Back"],
    ["front", "Front"],
    ["detail", "Portrait"],
  ];
  let selection = { product: "nix", size: "S" };
  window.SOBLShop = {
    selection: () => ({ ...selection }),
    select(product, size) {
      if (!catalog.some((p) => p.id === product) || !sizes.includes(size))
        return;
      selection = { product, size };
      window.dispatchEvent(
        new CustomEvent("sobl:selection", { detail: { ...selection } }),
      );
    },
  };
  $("#products").innerHTML = catalog
    .map(
      (p, i) => `
    <article class="product" data-product="${p.id}" data-view="back" data-size="S" data-size-chosen="false">
      <div class="product-index eyebrow"><span>0${i + 1} / ${p.id.toUpperCase()}</span><span>100 EDITIONS</span></div>
      <div class="image-area"><img class="product-image" src="${source(p.id, "back")}" alt="${p.name} black hoodie, back view" width="900" height="1000" loading="lazy"><div class="detail-lens" aria-hidden="true"></div><button class="piece-arrow home-gallery-arrow previous" aria-label="Previous ${p.name} image">←</button><button class="piece-arrow home-gallery-arrow next" aria-label="Next ${p.name} image">→</button><button class="zoom-trigger" aria-label="Enlarge ${p.name} hoodie image"></button></div>
      <div class="views" role="group" aria-label="${p.name} product views">${views.map(([v, n]) => `<button data-view="${v}" aria-pressed="${v === "back"}">${n}</button>`).join("")}<span class="image-caption">MOVE CLOSER</span></div>
      <div class="product-heading"><h3>${p.name} <em>hoodie</em></h3><span class="price">$150 <small>USD</small></span></div>
      <button class="piece-link line-link" data-open-piece="${p.id}">View piece <span>↗</span></button><details class="home-information home-disclosure"><summary>Information <span class="home-plus" aria-hidden="true"></span></summary><div class="home-information-body"><p class="home-story">${p.story}</p><p class="description">${p.description}</p><div class="color-row"><span class="swatch"></span> BLACK / BONE · LIMITED RELEASE EDITION</div>
      <dl class="piece-metadata"><div><dt>Character</dt><dd>${p.name}</dd></div><div><dt>Edition</dt><dd>100 pieces</dd></div><div><dt>Movie release</dt><dd>Dec 04, 2026</dd></div></dl>
      <a class="home-film-frame" href="/saints-cast?character=${p.id}#characters"><img src="https://vnmsfx.com/assets/saints/film-finish/v2/${p.still}" alt="${p.name} in Saints of Bad Luck" width="1984" height="864" loading="lazy"><span>From the film / ${p.name} ↗</span></a>
      <div class="details"><details><summary>The release edition</summary><p>Limited to 100 Nix hoodies and 100 Rook hoodies, across all sizes. Special Saints of Bad Luck logo treatment on the front, oversized character artwork on the back. The collection will go on sale ahead of the December 4, 2026 movie release, as soon as checkout and fulfillment are ready.</p></details><details><summary>Size & fit</summary><p>Available sizes: S, M, L, XL, 2XL and 3XL. The production blank, fabric and exact garment measurements will be confirmed before sale. These images are design mockups.</p></details><details><summary>Delivery & returns</summary><p>Orders are not open yet. Shipping rates, production timing and the returns policy will be added with the fulfillment service before checkout opens.</p></details></div><a class="home-character-link line-link" href="/saints-cast?character=${p.id}#characters">Meet ${p.name} ↗</a></div></details>
      <details class="home-size-picker home-disclosure"><summary>Choose your size <span class="home-plus" aria-hidden="true"></span></summary><div class="sizes" role="group" aria-label="${p.name} size">${sizes.map((s) => `<button aria-pressed="false" data-size="${s}">${s}</button>`).join("")}</div>
      <button class="button dark add-bag" disabled>Get early access <span>↗</span></button><p class="home-access-note">Sales open soon. No payment today.</p></details>

    </article>`,
    )
    .join("");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  document.querySelectorAll(".product").forEach((card) => {
    const image = card.querySelector(".product-image");
    const area = card.querySelector(".image-area");
    const lens = card.querySelector(".detail-lens");
    let revision = 0;
    async function show(view) {
      const ticket = ++revision;
      const next = new Image();
      next.src = source(card.dataset.product, view);
      try {
        await next.decode();
      } catch {
        return;
      }
      if (ticket !== revision) return;
      image.src = next.src;
      image.alt = `${card.dataset.product === "nix" ? "Nix" : "Rook"} black hoodie, ${view} view`;
      lens.style.backgroundImage = `url("${next.src}")`;
    }
    card.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => {
        card.dataset.view = button.dataset.view;
        card
          .querySelectorAll("[data-view]")
          .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
        show(button.dataset.view);
      });
    });
    card.querySelectorAll(".home-gallery-arrow").forEach((button) => {
      button.addEventListener("click", () => {
        const index = views.findIndex(([view]) => view === card.dataset.view);
        const step = button.classList.contains("next") ? 1 : -1;
        const [view] = views[(index + step + views.length) % views.length];
        card.querySelector(`.views [data-view="${view}"]`).click();
      });
    });
    area.addEventListener("pointermove", (e) => {
      if (!finePointer.matches || e.target.closest(".home-gallery-arrow")) {
        lens.classList.remove("visible");
        return;
      }
      const r = area.getBoundingClientRect(),
        x = e.clientX - r.left,
        y = e.clientY - r.top;
      const width = Math.min(160, r.width * 0.4),
        zoom = 1.9;
      lens.style.width = lens.style.height = `${width}px`;
      lens.style.left = `${Math.min(r.width - width, Math.max(0, x - width / 2))}px`;
      lens.style.top = `${Math.min(r.height - width, Math.max(0, y - width / 2))}px`;
      lens.style.backgroundImage = `url("${image.src}")`;
      lens.style.backgroundSize = `${r.width * zoom}px ${r.height * zoom}px`;
      lens.style.backgroundPosition = `${width / 2 - x * zoom}px ${width / 2 - y * zoom}px`;
      lens.classList.add("visible");
    });
    area.addEventListener("pointerleave", () =>
      lens.classList.remove("visible"),
    );
    card.querySelectorAll("[data-size]").forEach((button) =>
      button.addEventListener("click", () => {
        card.dataset.size = button.dataset.size;
        card.dataset.sizeChosen = "true";
        card.querySelector(".add-bag").disabled = false;
        card
          .querySelectorAll("[data-size]")
          .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
        window.SOBLShop.select(card.dataset.product, button.dataset.size);
      }),
    );
    card
      .querySelector(".zoom-trigger")
      .addEventListener("click", () => openZoom(card));
  });
  let zoomScale = 1,
    galleryProduct = "nix",
    galleryView = "back";
  const scaleZoom = () => {
    $("#zoom-image").style.width = `${zoomScale * 100}%`;
  };
  function gallery(view) {
    galleryView = view;
    $("#zoom-image").src = source(galleryProduct, view);
    $("#zoom-image").alt =
      `${galleryProduct === "nix" ? "Nix" : "Rook"} hoodie, ${view} view`;
    $("#zoom-title").textContent =
      `${galleryProduct.toUpperCase()} / ${view.toUpperCase()}`;
    $("#zoom-views")
      .querySelectorAll("button")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.gallery === view)),
      );
    zoomScale = 1;
    scaleZoom();
    $("#zoom-scroll").scrollTo(0, 0);
  }
  function openZoom(card) {
    galleryProduct = card.dataset.product;
    $("#zoom-views").innerHTML = views
      .map(([v, n]) => `<button data-gallery="${v}">${n}</button>`)
      .join("");
    gallery(card.dataset.view);
    $("#zoom").showModal();
  }
  window.addEventListener("sobl:inspect", (e) => {
    if (catalog.some((p) => p.id === e.detail?.product) && views.some(([v]) => v === e.detail?.view))
      openZoom({ dataset: { product: e.detail.product, view: e.detail.view } });
  });
  $("#zoom-views").addEventListener("click", (e) => {
    const b = e.target.closest("[data-gallery]");
    if (b) gallery(b.dataset.gallery);
  });
  $("#zoom-in").onclick = () => {
    zoomScale = Math.min(2, zoomScale + 0.25);
    scaleZoom();
  };
  $("#zoom-out").onclick = () => {
    zoomScale = Math.max(1, zoomScale - 0.25);
    scaleZoom();
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-close]");
    if (b) $("#" + b.dataset.close).close();
  });
  document.querySelectorAll("dialog").forEach((d) =>
    d.addEventListener("click", (e) => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }),
  );
  const hero = $("#hero-video"),
    full = $("#full-video"),
    dialog = $("#full-film");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  function motionPreference() {
    if (reduced.matches) {
      hero.autoplay = false;
      hero.pause();
    } else {
      hero.muted = true;
      hero.play().catch(() => {});
    }
  }
  motionPreference();
  reduced.addEventListener("change", motionPreference);
  let resume = false;
  $("#film-full").onclick = () => {
    resume = !hero.paused;
    hero.pause();
    dialog.showModal();
    full.currentTime = 0;
    full.play().catch(() => {});
  };
  dialog.addEventListener("close", () => {
    full.pause();
    if (resume && !reduced.matches) hero.play().catch(() => {});
  });
  hero.addEventListener("timeupdate", () => {
    $("#shot-caption").textContent =
      hero.currentTime > 6.5
        ? "NIX / THE RELEASE EDITION"
        : "ROOK / THE RELEASE EDITION";
  });
  document.documentElement.classList.add("motion-ready");
})();
