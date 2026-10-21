"use strict";
const {
  PRODUCTS,
  SIZES,
  assertTestKey,
  skuKey,
} = require("../server/merch/catalog");
function readiness(env) {
  const required = [
    "MERCH_STRIPE_SECRET_KEY",
    "MERCH_STRIPE_WEBHOOK_SECRET",
    "MERCH_SITE_ORIGIN",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  let validTestKey = false;
  try {
    assertTestKey(env.MERCH_STRIPE_SECRET_KEY);
    validTestKey = true;
  } catch {}
  return {
    mode: "test-only",
    liveCheckoutEnabled: false,
    productionEnabled: false,
    checkoutSwitch: env.MERCH_CHECKOUT_ENABLED === "true",
    validTestKey,
    missingTestConfiguration: required.filter((k) => !env[k]),
    missingSupplierMappings: PRODUCTS.flatMap((p) =>
      SIZES.map((size) => skuKey({ id: p.id, size })),
    ).filter((k) => !/^APQ-[A-Za-z0-9]+$/.test(env[k] || "")),
    samplesApproved: env.MERCH_SAMPLES_APPROVED === "true",
    supplierProtocolVerified: env.MERCH_APLIIQ_PROTOCOL_VERIFIED === "true",
    databaseMigration: "verify separately; never inferred from key presence",
  };
}
if (require.main === module)
  console.log(JSON.stringify(readiness(process.env), null, 2));
module.exports = { readiness };
