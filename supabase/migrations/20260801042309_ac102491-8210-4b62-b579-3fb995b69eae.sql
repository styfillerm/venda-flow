CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  nome text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

REVOKE ALL ON public.clients, public.suppliers, public.products, public.sales, public.expenses FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients, public.suppliers, public.products, public.sales, public.expenses TO authenticated;
GRANT ALL ON public.clients, public.suppliers, public.products, public.sales, public.expenses TO service_role;

ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_id_user_id_key UNIQUE (id, user_id);
ALTER TABLE public.clients ADD CONSTRAINT clients_id_user_id_key UNIQUE (id, user_id);
ALTER TABLE public.products ADD CONSTRAINT products_id_user_id_key UNIQUE (id, user_id);

ALTER TABLE public.products DROP CONSTRAINT products_fornecedor_id_fkey;
ALTER TABLE public.products ADD CONSTRAINT products_fornecedor_owner_fkey FOREIGN KEY (fornecedor_id, user_id) REFERENCES public.suppliers(id, user_id) ON DELETE SET NULL (fornecedor_id);
ALTER TABLE public.sales DROP CONSTRAINT sales_cliente_id_fkey;
ALTER TABLE public.sales DROP CONSTRAINT sales_produto_id_fkey;
ALTER TABLE public.sales ADD CONSTRAINT sales_cliente_owner_fkey FOREIGN KEY (cliente_id, user_id) REFERENCES public.clients(id, user_id) ON DELETE SET NULL (cliente_id);
ALTER TABLE public.sales ADD CONSTRAINT sales_produto_owner_fkey FOREIGN KEY (produto_id, user_id) REFERENCES public.products(id, user_id) ON DELETE SET NULL (produto_id);

ALTER TABLE public.products ADD CONSTRAINT products_values_nonnegative CHECK (valor_compra >= 0 AND valor_venda >= 0 AND estoque >= 0 AND estoque_minimo >= 0);
ALTER TABLE public.sales ADD CONSTRAINT sales_values_valid CHECK (quantidade > 0 AND valor_unitario >= 0 AND desconto >= 0 AND valor_total >= 0);
ALTER TABLE public.expenses ADD CONSTRAINT expenses_value_nonnegative CHECK (valor >= 0);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.adjust_stock_on_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  available_stock integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.produto_id IS NOT NULL THEN
      UPDATE public.products
      SET estoque = estoque + OLD.quantidade
      WHERE id = OLD.produto_id AND user_id = OLD.user_id;
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.produto_id IS NOT NULL THEN
    UPDATE public.products
    SET estoque = estoque + OLD.quantidade
    WHERE id = OLD.produto_id AND user_id = OLD.user_id;
  END IF;

  IF NEW.produto_id IS NOT NULL THEN
    SELECT estoque INTO available_stock
    FROM public.products
    WHERE id = NEW.produto_id AND user_id = NEW.user_id
    FOR UPDATE;

    IF available_stock IS NULL THEN
      RAISE EXCEPTION 'Produto inválido ou não pertence ao usuário';
    END IF;
    IF available_stock < NEW.quantidade THEN
      RAISE EXCEPTION 'Estoque insuficiente: disponível %, solicitado %', available_stock, NEW.quantidade;
    END IF;

    UPDATE public.products
    SET estoque = estoque - NEW.quantidade
    WHERE id = NEW.produto_id AND user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.adjust_stock_on_sale() FROM PUBLIC, anon, authenticated;

CREATE INDEX IF NOT EXISTS products_user_id_idx ON public.products(user_id);
CREATE INDEX IF NOT EXISTS products_supplier_owner_idx ON public.products(fornecedor_id, user_id);
CREATE INDEX IF NOT EXISTS sales_user_id_data_idx ON public.sales(user_id, data DESC);
CREATE INDEX IF NOT EXISTS sales_client_owner_idx ON public.sales(cliente_id, user_id);
CREATE INDEX IF NOT EXISTS sales_product_owner_idx ON public.sales(produto_id, user_id);
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS suppliers_user_id_idx ON public.suppliers(user_id);
CREATE INDEX IF NOT EXISTS expenses_user_id_data_idx ON public.expenses(user_id, data DESC);