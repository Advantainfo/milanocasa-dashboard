-- Milano Casa dashboard: initial schema.
-- Soft deletes (deleted_at) are used on every financial/business table so a
-- "Delete" in the UI never destroys history; all reads filter deleted_at IS NULL.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE order_status AS ENUM ('new', 'in_production', 'ready', 'delivered', 'paid');
CREATE TYPE payment_method AS ENUM ('cash', 'bank', 'card');
CREATE TYPE expense_category AS ENUM (
  'materials',
  'transport',
  'fuel',
  'rent',
  'utilities',
  'equipment',
  'other'
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users ----------------------------------------------------------------

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  failed_login_attempts int NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- company_settings (singleton row) --------------------------------------

CREATE TABLE company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true,
  company_name text NOT NULL DEFAULT 'Milano Casa',
  logo_url text,
  currency text NOT NULL DEFAULT 'EUR',
  vat_percentage numeric(5, 2) NOT NULL DEFAULT 22.00,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT company_settings_singleton_check CHECK (singleton),
  CONSTRAINT company_settings_singleton_unique UNIQUE (singleton)
);

INSERT INTO company_settings (company_name) VALUES ('Milano Casa');

-- customers ---------------------------------------------------------------

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  vat_number text,
  address text,
  email text,
  phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_customers_name_trgm ON customers USING gin (name gin_trgm_ops);
CREATE INDEX idx_customers_company_trgm ON customers USING gin (company gin_trgm_ops);
CREATE INDEX idx_customers_deleted_at ON customers (deleted_at);
CREATE UNIQUE INDEX idx_customers_vat_number_unique
  ON customers (lower(vat_number))
  WHERE vat_number IS NOT NULL AND vat_number <> '' AND deleted_at IS NULL;

-- orders --------------------------------------------------------------------

CREATE SEQUENCE order_number_seq START 1;

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,
  furniture_description text NOT NULL,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sale_price numeric(12, 2) NOT NULL CHECK (sale_price >= 0),
  delivery_date date,
  status order_status NOT NULL DEFAULT 'new',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('order_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_delivery_date ON orders (delivery_date);
CREATE INDEX idx_orders_deleted_at ON orders (deleted_at);

-- payments --------------------------------------------------------------------

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders (id) ON DELETE RESTRICT,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL DEFAULT current_date,
  method payment_method NOT NULL,
  reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_payments_order_id ON payments (order_id);
CREATE INDEX idx_payments_payment_date ON payments (payment_date);
CREATE INDEX idx_payments_deleted_at ON payments (deleted_at);

-- expenses --------------------------------------------------------------------

CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category expense_category NOT NULL,
  supplier text,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  invoice_number text,
  expense_date date NOT NULL DEFAULT current_date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_expenses_category ON expenses (category);
CREATE INDEX idx_expenses_expense_date ON expenses (expense_date);
CREATE INDEX idx_expenses_deleted_at ON expenses (deleted_at);
CREATE UNIQUE INDEX idx_expenses_supplier_invoice_unique
  ON expenses (supplier, invoice_number)
  WHERE invoice_number IS NOT NULL AND invoice_number <> '' AND deleted_at IS NULL;

-- order_balances view ---------------------------------------------------------
-- Single source of truth for "remaining balance": sale_price minus every
-- non-deleted payment recorded against the order. Never stored, never drifts.

CREATE VIEW order_balances AS
SELECT
  o.id AS order_id,
  o.sale_price,
  COALESCE(SUM(p.amount), 0)::numeric(12, 2) AS paid_amount,
  (o.sale_price - COALESCE(SUM(p.amount), 0))::numeric(12, 2) AS remaining_balance
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.sale_price;
