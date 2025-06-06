/**
 * @oas [post] /store/customers
 * operationId: PostCustomers
 * summary: Register Customer
 * description: Register a customer. Use the `/auth/customer/emailpass/register` API route first to retrieve the registration token and pass it in the header of the request.
 * externalDocs:
 *   url: https://docs.medusajs.com/v2/resources/storefront-development/customers/register
 *   description: "Storefront guide: How to register a customer."
 * x-authenticated: true
 * parameters:
 *   - name: x-publishable-api-key
 *     in: header
 *     description: Publishable API Key created in the Medusa Admin.
 *     required: true
 *     schema:
 *       type: string
 *       externalDocs:
 *         url: https://docs.medusajs.com/api/store#publishable-api-key
 *   - name: fields
 *     in: query
 *     description: Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default
 *       fields. without prefix it will replace the entire default fields.
 *     required: false
 *     schema:
 *       type: string
 *       title: fields
 *       description: Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default
 *         fields. without prefix it will replace the entire default fields. This API route restricts the fields that can be selected. Learn how to override the retrievable fields in 
 *         the [Retrieve Custom Links](https://docs.medusajs.com/learn/fundamentals/api-routes/retrieve-custom-links) documentation.
 *       externalDocs:
 *         url: "#select-fields-and-relations"
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         $ref: "#/components/schemas/StoreCreateCustomer"
 * x-codeSamples:
 *   - lang: JavaScript
 *     label: JS SDK
 *     source: |-
 *       import Medusa from "@medusajs/js-sdk"
 * 
 *       let MEDUSA_BACKEND_URL = "http://localhost:9000"
 * 
 *       if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
 *         MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
 *       }
 * 
 *       export const sdk = new Medusa({
 *         baseUrl: MEDUSA_BACKEND_URL,
 *         debug: process.env.NODE_ENV === "development",
 *         publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
 *       })
 * 
 *       const token = await sdk.auth.register("customer", "emailpass", {
 *         "email": "customer@gmail.com",
 *         "password": "supersecret"
 *       })
 * 
 *       sdk.store.customer.create(
 *         {
 *           "email": "customer@gmail.com"
 *         },
 *         {},
 *         {
 *           Authorization: `Bearer ${token}`
 *         }
 *       )
 *       .then(({ customer }) => {
 *         console.log(customer)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/store/customers' \
 *       -H 'Authorization: Bearer {token}' \
 *       -H 'Content-Type: application/json' \
 *       -H 'x-publishable-api-key: {your_publishable_api_key}' \
 *       --data-raw '{
 *         "email": "Monserrate.Leannon88@yahoo.com",
 *         "company_name": "{value}",
 *         "first_name": "{value}",
 *         "last_name": "{value}",
 *         "phone": "{value}"
 *       }'
 * tags:
 *   - Customers
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           $ref: "#/components/schemas/StoreCustomerResponse"
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
 * x-workflow: createCustomerAccountWorkflow
 * security:
 *   - cookie_auth: []
 *   - jwt_token: []
 * 
*/

