import { MarkdownTheme } from "../../theme.js"
import Handlebars from "handlebars"
import { DeclarationReflection, SignatureReflection } from "typedoc"
import { cleanUpHookInput, getHookChildren, getProjectChild } from "utils"
import beautifyCode from "../../utils/beautify-code.js"

export default function (theme: MarkdownTheme) {
  Handlebars.registerHelper(
    "workflowHooks",
    function (this: SignatureReflection): string {
      if (!this.parent?.documents || !theme.project) {
        return ""
      }

      const hooks = this.parent.documents.filter(
        (document) => document.comment?.modifierTags.has("@hook")
      )

      if (!hooks.length) {
        return ""
      }

      let str = `${Handlebars.helpers.titleLevel()} Hooks\n\nHooks allow you to inject custom functionalities into the workflow. You'll receive data from the workflow, as well as additional data sent through an HTTP request.\n\nLearn more about [Hooks](https://docs.medusajs.com/learn/fundamentals/workflows/workflow-hooks) and [Additional Data](https://docs.medusajs.com/learn/fundamentals/api-routes/additional-data).\n\n`

      Handlebars.helpers.incrementCurrentTitleLevel()

      const hooksTitleLevel = Handlebars.helpers.titleLevel()
      const hookChildren = getHookChildren(this.parent)

      hooks.forEach((hook) => {
        const hookReflection =
          hookChildren.find((child) => {
            if (child.name !== hook.name) {
              return false
            }

            if (child.signatures?.length) {
              return true
            }

            return (
              child.type?.type === "reflection" &&
              child.type.declaration.signatures?.length
            )
          }) ||
          ((this.parent.getChildByName(hook.name) ||
            getProjectChild(theme.project!, hook.name)) as
            | DeclarationReflection
            | undefined)

        const signatures =
          hookReflection?.signatures ||
          (hookReflection?.type?.type === "reflection"
            ? hookReflection.type.declaration.signatures
            : [])

        if (
          !hookReflection ||
          !signatures?.length ||
          !signatures[0].parameters?.length
        ) {
          return
        }

        str += `\n\n${hooksTitleLevel} ${hook.name}\n\n`

        if (hookReflection.comment?.summary) {
          str += `${Handlebars.helpers.comment(
            hookReflection.comment.summary
          )}\n\n`
        }

        const hookExample = hookReflection.comment?.getTag(`@example`)

        if (hookExample) {
          Handlebars.helpers.incrementCurrentTitleLevel()
          const innerTitleLevel = Handlebars.helpers.titleLevel()

          str += `${innerTitleLevel} Example\n\n\`\`\`ts\n${beautifyCode(
            Handlebars.helpers.comment(hookExample.content)
          )}\n\`\`\`\n\n${innerTitleLevel} Input\n\n`

          Handlebars.helpers.decrementCurrentTitleLevel()
        }

        str += `Handlers consuming this hook accept the following input.\n\n`

        str += Handlebars.helpers.parameterComponent.call(
          cleanUpHookInput(signatures[0].parameters),
          {
            hash: {
              sectionTitle: hook.name,
            },
          },
          {
            openedLevel: 1,
          }
        )
      })

      Handlebars.helpers.decrementCurrentTitleLevel()

      return str
    }
  )
}
