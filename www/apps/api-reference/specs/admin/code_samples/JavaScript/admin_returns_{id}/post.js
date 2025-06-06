import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_BACKEND_URL || "/",
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
})

sdk.admin.return.updateRequest("return_123", {
  location_id: "sloc_123",
})
.then(({ return }) => {
  console.log(return)
})