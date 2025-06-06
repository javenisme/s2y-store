import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_BACKEND_URL || "/",
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
})

sdk.admin.draftOrder.updateActionItem("order_123", "action_123", {
  quantity: 2,
})
.then(({ draft_order_preview }) => {
  console.log(draft_order_preview)
})