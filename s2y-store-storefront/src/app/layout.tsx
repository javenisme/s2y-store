import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { StagewiseToolbar } from "@stagewise/toolbar-next"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

const stagewiseConfig = { plugins: [] }

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
        {process.env.NODE_ENV === "development" && (
          <StagewiseToolbar config={stagewiseConfig} />
        )}
      </body>
    </html>
  )
}
