const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

let environment = new checkoutNodeJssdk.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

let client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);

module.exports = { client };
