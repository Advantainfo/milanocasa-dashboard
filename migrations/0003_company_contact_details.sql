-- Company contact details for the customer-facing order PDF header:
-- VAT number, address, phone, email. Editable via Settings, same as the
-- existing company_name/logo_url/vat_percentage fields.

ALTER TABLE company_settings
  ADD COLUMN vat_number text,
  ADD COLUMN address text,
  ADD COLUMN phone text,
  ADD COLUMN email text;

UPDATE company_settings SET vat_number = '0887886626' WHERE singleton = true;
