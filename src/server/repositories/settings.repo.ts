import "server-only"

import { queryOne } from "@/lib/db"

export interface CompanySettings {
  companyName: string
  logoUrl: string | null
  currency: string
  vatPercentage: string
  vatNumber: string | null
  address: string | null
  phone: string | null
  email: string | null
}

export async function getCompanySettings(): Promise<CompanySettings> {
  const row = await queryOne<{
    company_name: string
    logo_url: string | null
    currency: string
    vat_percentage: string
    vat_number: string | null
    address: string | null
    phone: string | null
    email: string | null
  }>(
    `SELECT company_name, logo_url, currency, vat_percentage, vat_number, address, phone, email
     FROM company_settings WHERE singleton = true`
  )

  return {
    companyName: row?.company_name ?? "Milano Casa",
    logoUrl: row?.logo_url ?? null,
    currency: row?.currency ?? "EUR",
    vatPercentage: row?.vat_percentage ?? "22.00",
    vatNumber: row?.vat_number ?? null,
    address: row?.address ?? null,
    phone: row?.phone ?? null,
    email: row?.email ?? null,
  }
}

export interface CompanySettingsInput {
  companyName: string
  logoUrl: string
  currency: string
  vatPercentage: number
  vatNumber: string
  address: string
  phone: string
  email: string
}

export async function updateCompanySettings(input: CompanySettingsInput): Promise<void> {
  await queryOne(
    `UPDATE company_settings
     SET company_name = $1, logo_url = $2, currency = $3, vat_percentage = $4,
         vat_number = $5, address = $6, phone = $7, email = $8, updated_at = now()
     WHERE singleton = true`,
    [
      input.companyName,
      input.logoUrl || null,
      input.currency,
      input.vatPercentage,
      input.vatNumber || null,
      input.address || null,
      input.phone || null,
      input.email || null,
    ]
  )
}
