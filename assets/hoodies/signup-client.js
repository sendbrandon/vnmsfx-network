/* Shared request boundary: neither UI may confirm an unpersisted signup. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SOBLSignup = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  return {
    async save(payload, request = globalThis.fetch, signal) {
      const response = await request("/api/saints-merch?action=early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
      });
      let result;
      try {
        result = await response.json();
      } catch {
        throw Error(
          "Signups are temporarily unavailable. Please try again shortly.",
        );
      }
      if (!response.ok || result.ok !== true || result.persisted !== true)
        throw Error(
          result.error || "We could not confirm your signup. Please try again.",
        );
      return { product: payload.product, size: payload.size };
    },
  };
});
