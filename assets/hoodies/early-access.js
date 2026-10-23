"use strict";
(() => {
  const sizes = ["S", "M", "L", "XL", "2XL", "3XL"];
  const labels = {
    S: "Small",
    M: "Medium",
    L: "Large",
    XL: "XL",
    "2XL": "2XL",
    "3XL": "3XL",
  };
  const dialog = document.createElement("dialog");
  dialog.id = "early-access";
  dialog.setAttribute("aria-labelledby", "early-title");
  dialog.innerHTML =
    '<div class="dialog-head"><h2 id="early-title">Your <em>bad influence.</em></h2><button type="button" class="icon-button" aria-label="Close early access">✕</button></div><p class="early-intro">Get the first word when hoodie orders open.</p><div class="signup-panel"></div>';
  document.body.append(dialog);
  function fields(id) {
    return `<form class="signup-form"><div class="signup-fields"><label for="${id}-email">Email address</label><input id="${id}-email" name="email" type="email" placeholder="Your email address" autocomplete="email" maxlength="254" required><div class="early-choices"><div><label for="${id}-product">Your character</label><select id="${id}-product" name="product" required><option value="nix">Nix</option><option value="rook">Rook</option></select></div><div><label for="${id}-size">Your size</label><select id="${id}-size" name="size" required>${sizes.map((s) => `<option value="${s}">${labels[s]}</option>`).join("")}</select></div></div><div class="early-honey" aria-hidden="true"><label>Company website<input name="company_website" tabindex="-1" autocomplete="off"></label></div><label class="early-consent"><input type="checkbox" name="consent" required><span>Email me about the Saints of Bad Luck hoodie release.</span></label><button class="button" type="submit">Get early access <span>↗</span></button><p class="early-note">Reserve your character and size preference. No payment today.<br>No paid order is placed. <a href="/saints-about#reservations">How reservations work</a><br>Release emails only. <a href="/privacy#hoodie-early-access">Privacy</a> · <a href="mailto:brandon@vnmsfx.com?subject=Saints%20hoodie%20question">Questions?</a></p></div><div class="signup-receipt" hidden><span class="eyebrow receipt-choice"></span><h3>You’re on<br><em>the list.</em></h3><p>Your character and size preference are saved. No payment has been taken. We’ll email you when sales open.</p><button type="button" class="line-link signup-again">Choose another character ↗</button></div><p class="signup-status" role="status" aria-live="polite"></p></form>`;
  }
  const panels = [
    document.querySelector("#inline-signup"),
    dialog.querySelector(".signup-panel"),
  ];
  const controllers = panels.map((panel, i) => {
    panel.innerHTML = fields(i ? "early" : "inline");
    const form = panel.querySelector("form"),
      status = panel.querySelector(".signup-status"),
      submit = panel.querySelector("[type=submit]"),
      body = panel.querySelector(".signup-fields"),
      receipt = panel.querySelector(".signup-receipt");
    let epoch = 0,
      busy = false,
      abort;
    function sync({ product, size }) {
      form.elements.product.value = product;
      form.elements.size.value = size;
    }
    function reset() {
      epoch++;
      abort?.abort();
      busy = false;
      form.reset();
      body.hidden = false;
      receipt.hidden = true;
      status.textContent = "";
      submit.disabled = false;
      sync(window.SOBLShop.selection());
    }
    form.elements.product.addEventListener("change", () =>
      window.SOBLShop.select(
        form.elements.product.value,
        form.elements.size.value,
      ),
    );
    form.elements.size.addEventListener("change", () =>
      window.SOBLShop.select(
        form.elements.product.value,
        form.elements.size.value,
      ),
    );
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (busy || !form.reportValidity()) return;
      const data = new FormData(form),
        payload = {
          email: data.get("email"),
          product: data.get("product"),
          size: data.get("size"),
          consent: data.get("consent") === "on",
          company_website: data.get("company_website"),
        };
      busy = true;
      const ticket = ++epoch;
      abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), 20000);
      submit.disabled = true;
      status.textContent = "Saving your signup…";
      try {
        const result = await window.SOBLSignup.save(
          payload,
          window.fetch.bind(window),
          abort.signal,
        );
        if (ticket !== epoch) return;
        form.reset();
        body.hidden = true;
        receipt.hidden = false;
        panel.querySelector(".receipt-choice").textContent =
          `${result.product.toUpperCase()} / ${labels[result.size].toUpperCase()}`;
        status.textContent = "Your signup is saved.";
      } catch (error) {
        if (ticket !== epoch) return;
        status.textContent =
          error.name === "AbortError"
            ? "Your signup could not be confirmed. Please try again."
            : error.message ||
              "Your signup could not be saved. Please try again.";
        submit.disabled = false;
      } finally {
        clearTimeout(timer);
        if (ticket === epoch) busy = false;
      }
    });
    panel.querySelector(".signup-again").onclick = () => {
      reset();
      form.elements.product.focus();
    };
    sync(window.SOBLShop.selection());
    return { sync, reset };
  });
  function update(selection) {
    controllers.forEach((c) => c.sync(selection));
    document
      .querySelectorAll("[data-character]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.character === selection.product),
        ),
      );
  }
  window.addEventListener("sobl:selection", (e) => update(e.detail));
  document
    .querySelectorAll("[data-character]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          window.SOBLShop.select(
            b.dataset.character,
            window.SOBLShop.selection().size,
          )),
    );
  function open(product, size) {
    if (product) window.SOBLShop.select(product, size);
    controllers[1].reset();
    dialog.showModal();
    dialog.querySelector("[name=email]").focus();
  }
  window.addEventListener("sobl:early-access", () => open());
  document.querySelector("#open-bag").onclick = () => open();
  document.querySelectorAll(".add-bag").forEach(
    (b) =>
      (b.onclick = () => {
        const card = b.closest(".product");
        open(card.dataset.product, card.dataset.size);
      }),
  );
  dialog.querySelector(".icon-button").onclick = () => dialog.close();
  dialog.addEventListener("close", () => controllers[1].reset());
})();
