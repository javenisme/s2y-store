import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_BACKEND_URL || "/",
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
})

sdk.admin.product.create({
  title: "Shirt",
  options: [{
    title: "Default",
    values: ["Default Option"]
  }],
  variants: [
    {
      title: "Default",
      options: {
        Default: "Default Option"
      },
      prices: []
    }
  ],
  shipping_profile_id: "sp_123"
})
.then(({ product }) => {
  console.log(product)
})