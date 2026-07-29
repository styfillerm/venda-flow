## Objetivo

Ativar o **Lovable Cloud** (Postgres + Auth) e migrar todo o CRUD do `localStorage` para o banco de dados real, mantendo **todas as tabelas vazias** para o cliente cadastrar manualmente.

## Etapas

### 1. Ativar Lovable Cloud
Provisiona banco Postgres, autenticação e storage automaticamente (sem contas externas).

### 2. Criar schema no banco (migração SQL)
Tabelas em `public`, todas vazias, com RLS + GRANTs corretos:

- `clients` (nome, cpf_cnpj, telefone, email, cidade, endereco, observacoes)
- `suppliers` (empresa, cnpj, responsavel, telefone, email, endereco)
- `products` (nome, codigo, categoria, fornecedor_id, valor_compra, valor_venda, estoque, estoque_minimo, status)
- `sales` (cliente_id, produto_id, quantidade, valor_unitario, desconto, valor_total, forma_pagamento, data)
- `expenses` (descricao, categoria, valor, data)

Cada tabela terá:
- `id uuid`, `user_id uuid` (dono), `created_at timestamptz`
- RLS habilitado com policies `auth.uid() = user_id` (cada usuário vê só seus dados)
- Trigger para decrementar/incrementar estoque em `sales` automaticamente
- **Nenhum INSERT** — bases 100% vazias

### 3. Substituir camada de dados
- Reescrever `src/services/index.ts` para usar o cliente Supabase gerado (`@/integrations/supabase/client`) no lugar do `mock-store`
- Remover `src/lib/mock-store.ts` e a chamada `seedIfEmpty()` do `DataContext`
- Manter a mesma interface (`list/create/update/remove`) para não quebrar as páginas
- Ajustar `DataContext` para recarregar após login

### 4. Autenticação real
Substituir o auto-login por login real (email + senha + Google), já que o banco exige `auth.uid()` para funcionar com RLS:
- Tela de login/cadastro simples com o mesmo visual roxo/dourado
- Redirecionamento para `/dashboard` após login
- Rota protegida via `_authenticated/` layout
- Logout no menu do usuário

### 5. Acesso ao banco de dados
Após concluído, você terá acesso ao painel administrativo do banco pela aba **Cloud** aqui no Lovable:
- **Cloud → Users** — gerenciar usuários cadastrados
- **Cloud → Tables** — visualizar/editar registros de todas as tabelas em tempo real
- **Cloud → Advanced settings → Export data** — baixar dump completo do banco quando quiser

Não existe usuário/senha separado de "banco de dados" pra logar em outra ferramenta — o acesso é feito direto pelo painel do Lovable Cloud, que já está autenticado com sua conta. Assim que a Cloud for ativada, essa aba aparece no topo do projeto.

## Detalhes técnicos

- Frontend continua idêntico visualmente (tema PodGYN roxo + dourado, cabeçalho, sidebar)
- Contexto de dados (`DataContext`) permanece — só troca a fonte
- Regras de negócio (débito de estoque em venda, KPIs do dashboard) migram para triggers SQL onde fizer sentido, o resto continua no frontend
- Sem seeds, sem dados fictícios — pronto pro cliente popular
