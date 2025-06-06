/**
 * @oas [post] /store/customers/me/addresses
 * operationId: PostCustomersMeAddresses
 * summary: Create Address for Logged-In Customer
 * x-sidebar-summary: Create Address
 * description: Create an address for the logged-in customer.
 * externalDocs:
 *   url: https://docs.medusajs.com/v2/resources/storefront-development/customers/addresses#add-customer-address
 *   description: "Storefront guide: How to create an address for the logged-in customer."
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
 *       fields. without prefix it will replace the entire default fields. This API route restricts the fields that can be selected. Learn how to override the retrievable fields in 
 *       the [Retrieve Custom Links](https://docs.medusajs.com/learn/fundamentals/api-routes/retrieve-custom-links) documentation.
 *     required: false
 *     schema:
 *       type: string
 *       title: fields
 *       description: Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default
 *         fields. without prefix it will replace the entire default fields. This API route restricts the fields that can be selected. Learn how to override the retrievable fields in 
 *         the [Retrieve Custom Links](https://docs.medusajs.com/learn/fundamentals/api-routes/retrieve-custom-links) documentation.
 *       externalDocs:
 *         url: "#select-fields-and-relations"
 * security:
 *   - cookie_auth: []
 *   - jwt_token: []
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         description: The address's details.
 *         properties:
 *           first_name:
 *             type: string
 *             title: first_name
 *             description: The customer's first name.
 *           last_name:
 *             type: string
 *             title: last_name
 *             description: The customer's last name.
 *           phone:
 *             type: string
 *             title: phone
 *             description: The customer's phone.
 *           company:
 *             type: string
 *             title: company
 *             description: The address's company.
 *           address_1:
 *             type: string
 *             title: address_1
 *             description: The address's first line.
 *           address_2:
 *             type: string
 *             title: address_2
 *             description: The address's second line.
 *           city:
 *             type: string
 *             title: city
 *             description: The address's city.
 *           country_code:
 *             type: string
 *             title: country_code
 *             description: The address's country code.
 *           province:
 *             type: string
 *             title: province
 *             description: The address's province.
 *           postal_code:
 *             type: string
 *             title: postal_code
 *             description: The address's postal code.
 *           address_name:
 *             type: string
 *             title: address_name
 *             description: The address's name.
 *           is_default_shipping:
 *             type: boolean
 *             title: is_default_shipping
 *             description: Whether the address is used by default for shipping during checkout.
 *           is_default_billing:
 *             type: boolean
 *             title: is_default_billing
 *             description: Whether the address is used by default for billing during checkout.
 *           metadata:
 *             type: object
 *             description: Holds custom key-value pairs.
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
 *       sdk.store.customer.createAddress({
 *         country_code: "us"
 *       })
 *       .then(({ customer }) => {
 *         console.log(customer)
 *       })
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/store/customers/me/addresses' \
 *       -H 'Authorization: Bearer {access_token}' \
 *       -H 'Content-Type: application/json' \
 *       -H 'x-publishable-api-key: {your_publishable_api_key}' \
 *       --data-raw '{
 *         "metadata": {},
 *         "first_name": "{value}",
 *         "last_name": "{value}",
 *         "phone": "{value}",
 *         "company": "{value}",
 *         "address_1": "{value}",
 *         "address_2": "{value}",
 *         "city": "{value}",
 *         "country_code": "{value}",
 *         "province": "{value}",
 *         "postal_code": "{value}",
 *         "address_name": "{value}"
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
 * x-workflow: createCustomerAddressesWorkflow
 * 
*/

