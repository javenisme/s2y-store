import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

import { IInventoryService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/**
 * The IDs of the reservations to delete.
 */
export type DeleteReservationsStepInput = string[]

export const deleteReservationsStepId = "delete-reservations"
/**
 * This step deletes one or more reservations.
 */
export const deleteReservationsStep = createStep(
  deleteReservationsStepId,
  async (ids: DeleteReservationsStepInput, { container }) => {
    const service = container.resolve<IInventoryService>(Modules.INVENTORY)

    await service.softDeleteReservationItems(ids)

    return new StepResponse(void 0, ids)
  },
  async (prevIds, { container }) => {
    if (!prevIds?.length) {
      return
    }

    const service = container.resolve<IInventoryService>(Modules.INVENTORY)

    await service.restoreReservationItems(prevIds)
  }
)
