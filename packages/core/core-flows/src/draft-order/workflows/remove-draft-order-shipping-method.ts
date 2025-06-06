import {
  ChangeActionType,
  OrderChangeStatus,
  PromotionActions,
} from "@medusajs/framework/utils"
import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { OrderChangeDTO, OrderDTO } from "@medusajs/types"
import { useRemoteQueryStep } from "../../common"
import {
  createOrderChangeActionsWorkflow,
  previewOrderChangeStep,
  updateOrderTaxLinesWorkflow,
} from "../../order"
import { validateDraftOrderChangeStep } from "../steps/validate-draft-order-change"
import { draftOrderFieldsForRefreshSteps } from "../utils/fields"
import { refreshDraftOrderAdjustmentsWorkflow } from "./refresh-draft-order-adjustments"

export const removeDraftOrderShippingMethodWorkflowId =
  "remove-draft-order-shipping-method"

interface RemoveDraftOrderShippingMethodWorkflowInput {
  /**
   * The ID of the draft order to add the shipping methods to.
   */
  order_id: string
  /**
   * The ID of the shipping method to remove.
   */
  shipping_method_id: string
}

export const removeDraftOrderShippingMethodWorkflow = createWorkflow(
  removeDraftOrderShippingMethodWorkflowId,
  function (input: WorkflowData<RemoveDraftOrderShippingMethodWorkflowInput>) {
    const order: OrderDTO = useRemoteQueryStep({
      entry_point: "orders",
      fields: draftOrderFieldsForRefreshSteps,
      variables: { id: input.order_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "order-query" })

    const orderChange: OrderChangeDTO = useRemoteQueryStep({
      entry_point: "order_change",
      fields: ["id", "status", "version"],
      variables: {
        filters: {
          order_id: input.order_id,
          status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
        },
      },
      list: false,
    }).config({ name: "order-change-query" })

    validateDraftOrderChangeStep({ order, orderChange })

    updateOrderTaxLinesWorkflow.runAsStep({
      input: {
        order_id: order.id,
      },
    })

    const appliedPromoCodes = transform(order, (order) => {
      const promotionLink = (order as any).promotion_link

      if (!promotionLink) {
        return []
      }

      if (Array.isArray(promotionLink)) {
        return promotionLink.map((promo) => promo.promotion.code)
      }

      return [promotionLink.promotion.code]
    })

    // If any the order has any promo codes, then we need to refresh the adjustments.
    when(
      appliedPromoCodes,
      (appliedPromoCodes) => appliedPromoCodes.length > 0
    ).then(() => {
      const refetchedOrder = useRemoteQueryStep({
        entry_point: "orders",
        fields: draftOrderFieldsForRefreshSteps,
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
      }).config({ name: "refetched-order-query" })

      refreshDraftOrderAdjustmentsWorkflow.runAsStep({
        input: {
          order: refetchedOrder,
          promo_codes: appliedPromoCodes,
          action: PromotionActions.REPLACE,
        },
      })
    })

    const orderChangeActionInput = transform(
      {
        input,
        order,
        orderChange,
      },
      ({ order, orderChange, input }) => {
        return [
          {
            action: ChangeActionType.SHIPPING_REMOVE,
            reference: "order_shipping_method",
            order_change_id: orderChange.id,
            reference_id: input.shipping_method_id,
            order_id: order.id,
          },
        ]
      }
    )

    createOrderChangeActionsWorkflow.runAsStep({
      input: orderChangeActionInput,
    })

    return new WorkflowResponse(previewOrderChangeStep(order.id))
  }
)
