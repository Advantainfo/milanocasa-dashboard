-- Order costing and job type: material/labour cost with a DB-computed
-- expected profit, plus a job type distinguishing personal sales from
-- projects shared with a partner (feeds the future Partner Account).

CREATE TYPE order_job_type AS ENUM ('personal_sale', 'shared_project');

ALTER TABLE orders
  ADD COLUMN job_type order_job_type NOT NULL DEFAULT 'personal_sale',
  ADD COLUMN material_cost numeric(12, 2) NOT NULL DEFAULT 0 CHECK (material_cost >= 0),
  ADD COLUMN labour_cost numeric(12, 2) NOT NULL DEFAULT 0 CHECK (labour_cost >= 0),
  ADD COLUMN expected_profit numeric(12, 2)
    GENERATED ALWAYS AS (sale_price - material_cost - labour_cost) STORED;

CREATE INDEX idx_orders_job_type ON orders (job_type);
