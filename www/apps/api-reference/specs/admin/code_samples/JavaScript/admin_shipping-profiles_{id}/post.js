import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_BACKEND_URL || "/",
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
})

sdk.admin.shippingProfile.update("sp_123", {
  name: "Updated Shipping Profile",
})
.then(({ shipping_profile }) => {
  console.log(shipping_profile)
})