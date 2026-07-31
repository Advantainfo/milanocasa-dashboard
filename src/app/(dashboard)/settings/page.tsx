import { getCompanySettings } from "@/server/repositories/settings.repo"
import { CompanySettingsForm } from "@/components/settings/company-settings-form"
import { ChangePasswordForm } from "@/components/settings/change-password-form"

export default async function SettingsPage() {
  const settings = await getCompanySettings()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm">
          Manage your company details and account security.
        </p>
      </div>
      <div className="max-w-2xl space-y-6">
        <CompanySettingsForm settings={settings} />
        <ChangePasswordForm />
      </div>
    </div>
  )
}
