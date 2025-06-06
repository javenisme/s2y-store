import { z } from "zod"
import {
  applyAndAndOrOperators,
  booleanString,
} from "../../utils/common-validators"
import {
  createFindParams,
  createOperatorMap,
  createSelectParams,
  WithAdditionalData,
} from "../../utils/validators"

export const AdminCustomerParams = createSelectParams()

export const AdminCustomerGroupInCustomerParams = z.object({
  id: z.union([z.string(), z.array(z.string())]).optional(),
  name: z.union([z.string(), z.array(z.string())]).optional(),
  created_at: createOperatorMap().optional(),
  updated_at: createOperatorMap().optional(),
  deleted_at: createOperatorMap().optional(),
})

export const AdminCustomersParamsFields = z.object({
  q: z.string().optional(),
  id: z
    .union([z.string(), z.array(z.string()), createOperatorMap()])
    .optional(),
  email: z.union([z.string(), z.array(z.string())]).optional(),
  groups: z
    .union([
      AdminCustomerGroupInCustomerParams,
      z.string(),
      z.array(z.string()),
    ])
    .optional(),
  company_name: z.union([z.string(), z.array(z.string())]).optional(),
  first_name: z.union([z.string(), z.array(z.string())]).optional(),
  last_name: z.union([z.string(), z.array(z.string())]).optional(),
  has_account: booleanString().optional(),
  created_by: z.union([z.string(), z.array(z.string())]).optional(),
  created_at: createOperatorMap().optional(),
  updated_at: createOperatorMap().optional(),
  deleted_at: createOperatorMap().optional(),
})

export const AdminCustomersParams = createFindParams({
  limit: 50,
  offset: 0,
})
  .merge(AdminCustomersParamsFields)
  .merge(applyAndAndOrOperators(AdminCustomersParamsFields))

export const CreateCustomer = z.object({
  email: z.string().email().nullish(),
  company_name: z.string().nullish(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  phone: z.string().nullish(),
  metadata: z.record(z.unknown()).nullish(),
})
export const AdminCreateCustomer = WithAdditionalData(CreateCustomer)

export const UpdateCustomer = z.object({
  email: z.string().email().nullish(),
  company_name: z.string().nullish(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  phone: z.string().nullish(),
  metadata: z.record(z.unknown()).nullish(),
})
export const AdminUpdateCustomer = WithAdditionalData(UpdateCustomer)

export const CreateCustomerAddress = z.object({
  address_name: z.string().nullish(),
  is_default_shipping: z.boolean().optional(),
  is_default_billing: z.boolean().optional(),
  company: z.string().nullish(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  address_1: z.string().nullish(),
  address_2: z.string().nullish(),
  city: z.string().nullish(),
  country_code: z.string().nullish(),
  province: z.string().nullish(),
  postal_code: z.string().nullish(),
  phone: z.string().nullish(),
  metadata: z.record(z.unknown()).nullish(),
})
export const AdminCreateCustomerAddress = WithAdditionalData(
  CreateCustomerAddress
)

export const AdminUpdateCustomerAddress = AdminCreateCustomerAddress

export const AdminCustomerAddressParams = createSelectParams()

export const AdminCustomerAddressesParams = createFindParams({
  offset: 0,
  limit: 50,
}).merge(
  z.object({
    q: z.string().optional(),
    company: z.union([z.string(), z.array(z.string())]).optional(),
    city: z.union([z.string(), z.array(z.string())]).optional(),
    country_code: z.union([z.string(), z.array(z.string())]).optional(),
    province: z.union([z.string(), z.array(z.string())]).optional(),
    postal_code: z.union([z.string(), z.array(z.string())]).optional(),
  })
)

export type AdminCustomerParamsType = z.infer<typeof AdminCustomerParams>
export type AdminCustomersParamsType = z.infer<typeof AdminCustomersParams>
export type AdminCreateCustomerType = z.infer<typeof CreateCustomer>
export type AdminUpdateCustomerType = z.infer<typeof UpdateCustomer>
export type AdminCustomerAddressParamsType = z.infer<
  typeof AdminCustomerAddressParams
>
export type AdminCreateCustomerAddressType = z.infer<
  typeof CreateCustomerAddress
>
