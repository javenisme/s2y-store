/**
 * @schema OrderReturnItem
 * type: object
 * description: The item's items.
 * x-schemaName: OrderReturnItem
 * required:
 *   - id
 *   - return_id
 *   - order_id
 *   - item_id
 *   - quantity
 * properties:
 *   id:
 *     type: string
 *     title: id
 *     description: The return item's ID.
 *   quantity:
 *     type: number
 *     title: quantity
 *     description: The return item's quantity.
 *   received_quantity:
 *     type: number
 *     title: received_quantity
 *     description: The received quantity of the item. This quantity is added to the stocked inventory quantity of the item.
 *   reason_id:
 *     type: string
 *     title: reason_id
 *     description: The ID of the return reason associated with the item.
 *   item_id:
 *     type: string
 *     title: item_id
 *     description: The ID of the associated order item.
 *   return_id:
 *     type: string
 *     title: return_id
 *     description: The ID of the return this return item belongs to.
 *   metadata:
 *     type: object
 *     description: The return item's metadata, can hold custom key-value pairs.
 *   order_id:
 *     type: string
 *     title: order_id
 *     description: The ID of the order the return belongs to.
 *   created_at:
 *     type: string
 *     format: date-time
 *     title: created_at
 *     description: The date the item was created.
 *   updated_at:
 *     type: string
 *     format: date-time
 *     title: updated_at
 *     description: The date the item was updated.
 *   damaged_quantity:
 *     type: number
 *     title: damaged_quantity
 *     description: The item's damaged quantity.
 * 
*/

