/**
 * @oas [delete] /admin/invites/{id}
 * operationId: DeleteInvitesId
 * summary: Delete Invite
 * description: Delete an invite.
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     description: The invite's ID.
 *     required: true
 *     schema:
 *       type: string
 * x-codeSamples:
 *   - lang: JavaScript
 *     label: JS SDK
 *     source: |-
 *       import Medusa from "@medusajs/js-sdk"
 * 
 *       export const sdk = new Medusa({
 *         baseUrl: import.meta.env.VITE_BACKEND_URL || "/",
 *         debug: import.meta.env.DEV,
 *         auth: {
 *           type: "session",
 *         },
 *       })
 * 
 *       sdk.admin.invite.delete("invite_123")
 *       .then(({ deleted }) => {
 *         console.log(deleted)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: curl -X DELETE '{backend_url}/admin/invites/{id}'
 * tags:
 *   - Invites
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           description: The deletion's details.
 *           required:
 *             - id
 *             - object
 *             - deleted
 *           properties:
 *             id:
 *               type: string
 *               title: id
 *               description: The invite's ID.
 *             object:
 *               type: string
 *               title: object
 *               description: The name of the deleted object.
 *               default: invite
 *             deleted:
 *               type: boolean
 *               title: deleted
 *               description: Whether the invite was deleted.
 *   "400":
 *     $ref: "#/components/responses/400_error"
 *   "401":
 *     $ref: "#/components/responses/unauthorized"
 *   "404":
 *     $ref: "#/components/responses/not_found_error"
 *   "409":
 *     $ref: "#/components/responses/invalid_state_error"
 *   "422":
 *     $ref: "#/components/responses/invalid_request_error"
 *   "500":
 *     $ref: "#/components/responses/500_error"
 * x-workflow: deleteInvitesWorkflow
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 *   - jwt_token: []
 * 
*/

