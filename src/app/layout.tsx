import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { DictionaryProvider } from "@/lib/i18n/dictionary-provider"
import { getServerDictionary } from "@/lib/i18n/get-dictionary"

// Monospace-forward theme (see globals.css) - Geist Mono is loaded as the
// only typeface and used for both --font-sans and --font-mono.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Milano Casa | Dashboard",
  description: "Internal business management dashboard for Milano Casa.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { locale, dictionary } = await getServerDictionary()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <DictionaryProvider locale={locale} dictionary={dictionary}>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </DictionaryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
