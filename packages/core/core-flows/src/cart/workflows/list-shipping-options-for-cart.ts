import {
  createHook,
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep, validatePresenceOfStep } from "../../common"
import { useRemoteQueryStep } from "../../common/steps/use-remote-query"
import { cartFieldsForPricingContext } from "../utils/fields"
import {
  AdditionalData,
  ListShippingOptionsForCartWorkflowInput,
} from "@medusajs/types"
import { isDefined } from "@medusajs/framework/utils"
import { pricingContextResult } from "../utils/schemas"

export const listShippingOptionsForCartWorkflowId =
  "list-shipping-options-for-cart"
/**
 * This workflow lists the shipping options of a cart. It's executed by the
 * [List Shipping Options Store API Route](https://docs.medusajs.com/api/store#shipping-options_getshippingoptions).
 *
 * :::note
 *
 * This workflow doesn't retrieve the calculated prices of the shipping options. If you need to retrieve the prices of the shipping options,
 * use the {@link listShippingOptionsForCartWithPricingWorkflow} workflow.
 *
 * :::
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to wrap custom logic around to retrieve the shipping options of a cart
 * in your custom flows.
 *
 * @example
 * const { result } = await listShippingOptionsForCartWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     option_ids: ["so_123"]
 *   }
 * })
 *
 * @summary
 *
 * List a cart's shipping options.
 * 
 * @property hooks.setPricingContext - This hook is executed before the shipping options are retrieved. You can consume this hook to return any custom context useful for the prices retrieval of shipping options.
 * 
 * For example, assuming you have the following custom pricing rule:
 * 
 * ```json
 * {
 *   "attribute": "location_id",
 *   "operator": "eq",
 *   "value": "sloc_123",
 * }
 * ```
 * 
 * You can consume the `setPricingContext` hook to add the `location_id` context to the prices calculation:
 * 
 * ```ts
 * import { listShippingOptionsForCartWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 * 
 * listShippingOptionsForCartWorkflow.hooks.setPricingContext((
 *   { cart, fulfillmentSetIds, additional_data }, { container }
 * ) => {
 *   return new StepResponse({
 *     location_id: "sloc_123", // Special price for in-store purchases
 *   });
 * });
 * ```
 * 
 * The shipping options' prices will now be retrieved using the context you return.
 * 
 * :::note
 * 
 * Learn more about prices calculation context in the [Prices Calculation](https://docs.medusajs.com/resources/commerce-modules/pricing/price-calculation) documentation.
 * 
 * :::
 */
export const listShippingOptionsForCartWorkflow = createWorkflow(
  listShippingOptionsForCartWorkflowId,
  (
    input: WorkflowData<
      ListShippingOptionsForCartWorkflowInput & AdditionalData
    >
  ) => {
    const cartQuery = useQueryGraphStep({
      entity: "cart",
      filters: { id: input.cart_id },
      fields: [
        ...cartFieldsForPricingContext,
        "items.*",
        "items.variant.manage_inventory",
        "items.variant.inventory_items.inventory_item_id",
        "items.variant.inventory_items.inventory.requires_shipping",
        "items.variant.inventory_items.inventory.location_levels.*",
      ],
      options: { throwIfKeyNotFound: true },
    }).config({ name: "get-cart" })

    const cart = transform({ cartQuery }, ({ cartQuery }) => cartQuery.data[0])

    validatePresenceOfStep({
      entity: cart,
      fields: ["sales_channel_id", "region_id", "currency_code"],
    })

    const scFulfillmentSetQuery = useQueryGraphStep({
      entity: "sales_channels",
      filters: { id: cart.sales_channel_id },
      fields: [
        "stock_locations.fulfillment_sets.id",
        "stock_locations.id",
        "stock_locations.name",
        "stock_locations.address.*",
      ],
    }).config({ name: "sales_channels-fulfillment-query" })

    const scFulfillmentSets = transform(
      { scFulfillmentSetQuery },
      ({ scFulfillmentSetQuery }) => scFulfillmentSetQuery.data[0]
    )

    const { fulfillmentSetIds } = transform(
      { scFulfillmentSets },
      ({ scFulfillmentSets }) => {
        const fulfillmentSetIds = new Set<string>()

        scFulfillmentSets.stock_locations.forEach((stockLocation) => {
          stockLocation.fulfillment_sets.forEach((fulfillmentSet) => {
            fulfillmentSetIds.add(fulfillmentSet.id)
          })
        })

        return {
          fulfillmentSetIds: Array.from(fulfillmentSetIds),
        }
      }
    )

    const setPricingContext = createHook(
      "setPricingContext",
      {
        cart: cart,
        fulfillmentSetIds,
        additional_data: input.additional_data,
      },
      {
        resultValidator: pricingContextResult,
      }
    )
    const setPricingContextResult = setPricingContext.getResult()

    const queryVariables = transform(
      { input, fulfillmentSetIds, cart, setPricingContextResult },
      ({ input, fulfillmentSetIds, cart, setPricingContextResult }) => {
        return {
          id: input.option_ids,

          context: {
            is_return: input.is_return ? "true" : "false",
            enabled_in_store: !isDefined(input.enabled_in_store)
              ? "true"
              : input.enabled_in_store
              ? "true"
              : "false",
          },

          filters: {
            fulfillment_set_id: fulfillmentSetIds,

            address: {
              country_code: cart.shipping_address?.country_code,
              province_code: cart.shipping_address?.province,
              city: cart.shipping_address?.city,
              postal_expression: cart.shipping_address?.postal_code,
            },
          },

          calculated_price: {
            context: {
              ...cart,
              ...(setPricingContextResult ? setPricingContextResult : {}),
              currency_code: cart.currency_code,
              region_id: cart.region_id,
              region: cart.region,
              customer_id: cart.customer_id,
              customer: cart.customer,
            },
          },
        }
      }
    )

    const shippingOptions = useRemoteQueryStep({
      entry_point: "shipping_options",
      fields: [
        "id",
        "name",
        "price_type",
        "service_zone_id",
        "shipping_profile_id",
        "provider_id",
        "data",
        "service_zone.fulfillment_set_id",
        "service_zone.fulfillment_set.type",
        "service_zone.fulfillment_set.location.id",
        "service_zone.fulfillment_set.location.address.*",

        "type.id",
        "type.label",
        "type.description",
        "type.code",

        "provider.id",
        "provider.is_enabled",

        "rules.attribute",
        "rules.value",
        "rules.operator",

        "calculated_price.*",
        "prices.*",
        "prices.price_rules.*",
      ],
      variables: queryVariables,
    }).config({ name: "shipping-options-query" })

    const shippingOptionsWithPrice = transform(
      { shippingOptions, cart },
      ({ shippingOptions, cart }) =>
        shippingOptions.map((shippingOption) => {
          const price = shippingOption.calculated_price

          const locationId =
            shippingOption.service_zone.fulfillment_set.location.id

          const itemsAtLocationWithoutAvailableQuantity = cart.items.filter(
            (item) => {
              if (!item.variant?.manage_inventory) {
                return false
              }

              return item.variant.inventory_items.some((inventoryItem) => {
                if (!inventoryItem.inventory.requires_shipping) {
                  return false
                }

                const level = inventoryItem.inventory.location_levels.find(
                  (locationLevel) => {
                    return locationLevel.location_id === locationId
                  }
                )

                return !level ? true : level.available_quantity < item.quantity
              })
            }
          )

          return {
            ...shippingOption,
            amount: price?.calculated_amount,
            is_tax_inclusive: !!price?.is_calculated_price_tax_inclusive,
            insufficient_inventory:
              itemsAtLocationWithoutAvailableQuantity.length > 0,
          }
        })
    )

    return new WorkflowResponse(shippingOptionsWithPrice, {
      hooks: [setPricingContext] as const,
    })
  }
)
