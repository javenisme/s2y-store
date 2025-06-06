import {
  IPaymentProvider,
  ProviderWebhookPayload,
  WebhookActionResult,
  CapturePaymentInput,
  CapturePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
} from "@medusajs/types"

export abstract class AbstractPaymentProvider<TConfig = Record<string, unknown>>
  implements IPaymentProvider
{
  /**
   * @ignore
   */
  protected readonly container: Record<string, unknown>
  /**
   * This method validates the options of the provider set in `medusa-config.ts`.
   * Implementing this method is optional. It's useful if your provider requires custom validation.
   *
   * If the options aren't valid, throw an error.
   *
   * @param options - The provider's options.
   *
   * @example
   * class MyPaymentProviderService extends AbstractPaymentProvider<Options> {
   *   static validateOptions(options: Record<any, any>) {
   *     if (!options.apiKey) {
   *       throw new MedusaError(
   *         MedusaError.Types.INVALID_DATA,
   *         "API key is required in the provider's options."
   *       )
   *     }
   *   }
   * }
   */
  static validateOptions(options: Record<any, any>): void | never {}

  /**
   * The constructor allows you to access resources from the [module's container](https://docs.medusajs.com/learn/fundamentals/modules/container)
   * using the first parameter, and the module's options using the second parameter.
   *
   * :::note
   *
   * A module's options are passed when you register it in the Medusa application.
   *
   * :::
   *
   * @param {Record<string, unknown>} cradle - The module's container cradle used to resolve resources.
   * @param {Record<string, unknown>} config - The options passed to the Payment Module provider.
   * @typeParam TConfig - The type of the provider's options passed as a second parameter.
   *
   * @example
   * import { AbstractPaymentProvider } from "@medusajs/framework/utils"
   * import { Logger } from "@medusajs/framework/types"
   *
   * type Options = {
   *   apiKey: string
   * }
   *
   * type InjectedDependencies = {
   *   logger: Logger
   * }
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<Options> {
   *   protected logger_: Logger
   *   protected options_: Options
   *   // assuming you're initializing a client
   *   protected client
   *
   *   constructor(
   *     container: InjectedDependencies,
   *     options: Options
   *   ) {
   *     super(container, options)
   *
   *     this.logger_ = container.logger
   *     this.options_ = options
   *
   *     // TODO initialize your client
   *   }
   *   // ...
   * }
   *
   * export default MyPaymentProviderService
   */
  protected constructor(
    cradle: Record<string, unknown>,
    /**
     * @ignore
     */
    protected readonly config: TConfig = {} as TConfig // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {
    this.container = cradle
  }

  /**
   * @ignore
   */
  static _isPaymentProvider = true

  /**
   * @ignore
   */
  static isPaymentProvider(object): boolean {
    return object?.constructor?._isPaymentProvider
  }

  /**
   * Each payment provider has a unique identifier defined in its class. The provider's ID
   * will be stored as `pp_{identifier}_{id}`, where `{id}` is the provider's `id`
   * property in the `medusa-config.ts`.
   *
   * @example
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   static identifier = "my-payment"
   *   // ...
   * }
   */
  public static identifier: string

  /**
   * @ignore
   *
   * Return a unique identifier to retrieve the payment plugin provider
   */
  public getIdentifier(): string {
    const ctr = this.constructor as typeof AbstractPaymentProvider

    if (!ctr.identifier) {
      throw new Error(`Missing static property "identifier".`)
    }

    return ctr.identifier
  }

  /**
   * This method is used to capture a payment. The payment is captured in one of the following scenarios:
   *
   * - The {@link authorizePayment} method returns the status `captured`, which automatically executed this method after authorization.
   * - The merchant requests to capture the payment after its associated payment session was authorized.
   * - A webhook event occurred that instructs the payment provider to capture the payment session. Learn more about handing webhook events in [this guide](https://docs.medusajs.com/resources/commerce-modules/payment/webhook-events).
   *
   * In this method, use the third-party provider to capture the payment.
   *
   * @param input - The input to capture the payment. The `data` field should contain the data from the payment provider. when the payment was created.
   * @returns The new data to store in the payment's `data` property. Throws in case of an error.
   *
   * @example
   * // other imports...
   * import {
   *   CapturePaymentInput,
   *   CapturePaymentOutput,
   * } from "@medusajs/framework/types"
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async capturePayment(
   *     input: CapturePaymentInput
   *   ): Promise<CapturePaymentOutput> {
   *     const externalId = input.data?.id
   *
   *       // assuming you have a client that captures the payment
   *     const newData = await this.client.capturePayment(externalId)
   *     return {data: newData}
   *   }
   *   // ...
   * }
   */
  abstract capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput>

  /**
   * This method authorizes a payment session. When authorized successfully, a payment is created by the Payment
   * Module which can be later captured using the {@link capturePayment} method.
   *
   * Refer to [this guide](https://docs.medusajs.com/resources/commerce-modules/payment/payment-flow#3-authorize-payment-session)
   * to learn more about how this fits into the payment flow and how to handle required actions.
   *
   * To automatically capture the payment after authorization, return the status `captured`.
   *
   * @param input - The input to authorize the payment. The `data` field should contain the data from the payment provider. when the payment was created.
   * @returns The status of the authorization, along with the `data` field about the payment. Throws in case of an error.
   *
   * @example
   * // other imports...
   * import {
   *   AuthorizePaymentInput,
   *   AuthorizePaymentOutput,
   *   PaymentSessionStatus
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async authorizePayment(
   *     input: AuthorizePaymentInput
   *   ): Promise<AuthorizePaymentOutput> {
   *     const externalId = input.data?.id
   *
   *     // assuming you have a client that authorizes the payment
   *     const paymentData = await this.client.authorizePayment(externalId)
   *
   *     return {
   *       data: paymentData,
   *       status: "authorized"
   *     }
   *   }
   *
   *   // ...
   * }
   */
  abstract authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput>

  /**
   * This method cancels a payment.
   *
   * @param input - The input to cancel the payment. The `data` field should contain the data from the payment provider. when the payment was created.
   * @returns The new data to store in the payment's `data` property, if any. Throws in case of an error.
   *
   * @example
   * // other imports...
   * import {
   *   PaymentProviderError,
   *   PaymentProviderSessionResponse,
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async cancelPayment(
   *     input: CancelPaymentInput
   *   ): Promise<CancelPaymentOutput> {
   *     const externalId = input.data?.id
   *
   *     // assuming you have a client that cancels the payment
   *     const paymentData = await this.client.cancelPayment(externalId)
   *     return { data: paymentData }
   *   }
   *
   *   // ...
   * }
   */
  abstract cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput>

  /**
   * This method is used when a payment session is created. It can be used to initiate the payment
   * in the third-party session, before authorizing or capturing the payment later.
   *
   * @param input - The input to create the payment session.
   * @returns The new data to store in the payment's `data` property. Throws in case of an error.
   *
   * @example
   * // other imports...
   * import {
   *   InitiatePaymentInput,
   *   InitiatePaymentOutput,
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async initiatePayment(
   *     input: InitiatePaymentInput
   *   ): Promise<InitiatePaymentOutput> {
   *     const {
   *       amount,
   *       currency_code,
   *       context: customerDetails
   *     } = input
   *
   *     // assuming you have a client that initializes the payment
   *     const response = await this.client.init(
   *       amount, currency_code, customerDetails
   *     )
   *
   *     return {
   *       id: response.id,
   *       data: response,
   *     }
   *   }
   *
   *   // ...
   * }
   */
  abstract initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput>

  /**
   * This method is used when a payment session is deleted, which can only happen if it isn't authorized, yet.
   *
   * Use this to delete or cancel the payment in the third-party service.
   *
   * @param input - The input to delete the payment session. The `data` field should contain the data from the payment provider. when the payment was created.
   * @returns The new data to store in the payment's `data` property, if any. Throws in case of an error.
   *
   * @example
   * // other imports...
   * import {
   *   DeletePaymentInput,
   *   DeletePaymentOutput,
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async deletePayment(
   *     input: DeletePaymentInput
   *   ): Promise<DeletePaymentOutput> {
   *     const externalId = input.data?.id
   *
   *     // assuming you have a client that cancels the payment
   *     await this.client.cancelPayment(externalId)
   *     return {}
   *   }
   *
   *   // ...
   * }
   */
  abstract deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput>

  /**
   * This method gets the status of a payment session based on the status in the third-party integration.
   *
   * @param input - The input to get the payment status. The `data` field should contain the data from the payment provider. when the payment was created.
   * @returns The payment session's status. It can also return additional `data` from the payment provider.
   *
   * @example
   * // other imports...
   * import {
   *   GetPaymentStatusInput,
   *   GetPaymentStatusOutput,
   *   PaymentSessionStatus
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async getPaymentStatus(
   *     input: GetPaymentStatusInput
   *   ): Promise<GetPaymentStatusOutput> {
   *     const externalId = input.data?.id
   *
   *     // assuming you have a client that retrieves the payment status
   *     const status = await this.client.getStatus(externalId)
   *
   *     switch (status) {
   *       case "requires_capture":
   *           return {status: "authorized"}
   *         case "success":
   *           return {status: "captured"}
   *         case "canceled":
   *           return {status: "canceled"}
   *         default:
   *           return {status: "pending"}
   *      }
   *   }
   *
   *   // ...
   * }
   */
  abstract getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput>

  /**
   * This method refunds an amount of a payment previously captured.
   *
   * @param input - The input to refund the payment. The `data` field should contain the data from the payment provider. when the payment was created.
   * @returns The new data to store in the payment's `data` property, or an error object.
   *
   * @example
   * // other imports...
   * import {
   *   RefundPaymentInput,
   *   RefundPaymentOutput,
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async refundPayment(
   *     input: RefundPaymentInput
   *   ): Promise<RefundPaymentOutput> {
   *     const externalId = input.data?.id
   *
   *     // assuming you have a client that refunds the payment
   *     const newData = await this.client.refund(
   *         externalId,
   *         input.amount
   *       )
   *
   *     return {data: newData}
   *   }
   *   // ...
   * }
   */
  abstract refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput>

  /**
   * Retrieves the payment's data from the third-party service.
   *
   * @param input - The input to retrieve the payment. The `data` field should contain the data from the payment provider when the payment was created.
   * @returns The payment's data as found in the the payment provider.
   *
   * @example
   * // other imports...
   * import {
   *   RetrievePaymentInput,
   *   RetrievePaymentOutput,
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async retrievePayment(
   *     input: RetrievePaymentInput
   *   ): Promise<RetrievePaymentOutput> {
   *     const externalId = input.data?.id
   *
   *     // assuming you have a client that retrieves the payment
   *     return await this.client.retrieve(externalId)
   *   }
   *   // ...
   * }
   */
  abstract retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput>

  /**
   * Update a payment in the third-party service that was previously initiated with the {@link initiatePayment} method.
   *
   * @param input - The input to update the payment. The `data` field should contain the data from the payment provider. when the payment was created.
   * @returns The new data to store in the payment's `data` property. Throws in case of an error.
   *
   * @example
   * // other imports...
   * import {
   *   UpdatePaymentInput,
   *   UpdatePaymentOutput,
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async updatePayment(
   *     input: UpdatePaymentInput
   *   ): Promise<UpdatePaymentOutput> {
   *     const { amount, currency_code, context } = input
   *     const externalId = input.data?.id
   * 
   *     // Validate context.customer
   *     if (!context || !context.customer) {
   *       throw new Error("Context must include a valid customer.");
   *     }
   *
   *     // assuming you have a client that updates the payment
   *     const response = await this.client.update(
   *       externalId,
   *         {
   *           amount,
   *           currency_code,
   *           context.customer
   *         }
   *       )
   *
   *     return response
   *   }
   *
   *   // ...
   * }
   */
  abstract updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput>

  /**
   * This method is executed when a webhook event is received from the third-party payment provider. Use it
   * to process the action of the payment provider.
   *
   * Learn more in [this documentation](https://docs.medusajs.com/resources/commerce-modules/payment/webhook-events)
   *
   * @param data - The webhook event's data
   * @returns The webhook result. If the `action`'s value is `captured`, the payment is captured within Medusa as well.
   * If the `action`'s value is `authorized`, the associated payment session is authorized within Medusa.
   *
   * @example
   * // other imports...
   * import {
   *   BigNumber
   * } from "@medusajs/framework/utils"
   * import {
   *   ProviderWebhookPayload,
   *   WebhookActionResult
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async getWebhookActionAndData(
   *     payload: ProviderWebhookPayload["payload"]
   *   ): Promise<WebhookActionResult> {
   *     const {
   *       data,
   *       rawData,
   *       headers
   *     } = payload
   *
   *     try {
   *       switch(data.event_type) {
   *         case "authorized_amount":
   *           return {
   *             action: "authorized",
   *             data: {
   *               session_id: (data.metadata as Record<string, any>).session_id,
   *               amount: new BigNumber(data.amount as number)
   *             }
   *           }
   *         case "success":
   *           return {
   *             action: "captured",
   *             data: {
   *               session_id: (data.metadata as Record<string, any>).session_id,
   *               amount: new BigNumber(data.amount as number)
   *             }
   *           }
   *         default:
   *           return {
   *             action: "not_supported"
   *           }
   *       }
   *     } catch (e) {
   *       return {
   *         action: "failed",
   *         data: {
   *           session_id: (data.metadata as Record<string, any>).session_id,
   *           amount: new BigNumber(data.amount as number)
   *         }
   *       }
   *     }
   *   }
   *
   *   // ...
   * }
   */
  abstract getWebhookActionAndData(
    data: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult>
}
