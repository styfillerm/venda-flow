## Diagnóstico (verificado no banco)

Consultei as permissões do banco: **nenhuma das tabelas (`clients`, `suppliers`, `products`, `sales`, `expenses`) tem permissão de acesso concedida** para as funções `authenticated`/`service_role`. Sem isso, toda inserção volta com erro de permissão, mesmo com as regras de segurança (RLS) corretas. Também confirmei que **não existe nenhum usuário cadastrado** e que todas as tabelas estão com 0 registros.

Além disso, o formulário de fornecedores chama `addSupplier` sem `try/catch`, então o erro estourou silenciosamente — o botão parece "não fazer nada". Esse mesmo padrão existe nas outras telas de cadastro.

## Plano

1. **Migração no banco**: conceder as permissões de acesso à API de dados para as 5 tabelas (`authenticated`: ler/criar/editar/excluir; `service_role`: total). Não altera nenhuma regra de segurança — cada usuário continua vendo apenas os próprios dados.
2. **Tratamento de erro nos formulários**: envolver os `onSubmit` de Fornecedores, Clientes, Produtos, Vendas, Financeiro e Estoque em `try/catch`, exibindo `toast.error` com a mensagem retornada pelo banco (inclusive "Não autenticado"), para que nunca mais falhe em silêncio.
3. **Verificação**: após aplicar, testo o fluxo de cadastro de fornecedor no preview autenticado e confirmo que a linha aparece na tabela do banco.

## Observação

Se o cadastro tiver sido tentado sem login (não há usuários criados ainda), é preciso criar a conta em `/auth` primeiro — depois da correção o sistema avisará isso claramente na tela.

## Detalhes técnicos

- SQL: `GRANT SELECT, INSERT, UPDATE, DELETE ON public.<tabela> TO authenticated; GRANT ALL ON public.<tabela> TO service_role;` para cada uma das 5 tabelas. Sem `anon`, pois todas as policies usam `auth.uid()`.
- Frontend: apenas os handlers de submit/exclusão nas rotas `src/routes/_app.*.tsx`; a camada de serviços já propaga o `error` do Supabase.
