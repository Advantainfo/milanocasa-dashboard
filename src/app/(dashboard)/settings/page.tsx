import type { Metadata } from "next"
import { getCompanySettings } from "@/server/repositories/settings.repo"
import { CompanySettingsForm } from "@/components/settings/company-settings-form"
import { ChangePasswordForm } from "@/components/settings/change-password-form"
import { getServerDictionary } from "@/lib/i18n/get-dictionary"

export const metadata: Metadata = { title: "Settings | Milano Casa" }

export default async function SettingsPage() {
  const { dictionary: dict } = await getServerDictionary()
  const settings = await getCompanySettings()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{dict.settings.title}</h2>
        <p className="text-muted-foreground text-sm">{dict.settings.subtitle}</p>
      </div>
      <div className="max-w-2xl space-y-6">
        <CompanySettingsForm settings={settings} />
        <ChangePasswordForm />
      </div>
    </div>
  )
}
