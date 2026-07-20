# COMPRAR & VENDA PRO v1.4.1 — Hotfix Juros sobre Saldo Geral

## Base
- Correção direta da v1.4.0 — Central Profissional de Recebimentos.
- Schema atualizado de 7 para 8 para forçar a reparação segura dos acordos já salvos.

## Causa corrigida
- Vendas antigas podiam ter `loanRate: null`.
- Em JavaScript, `Number(null)` resulta em `0`.
- A migração da v1.4.0 aceitava esse zero como taxa válida, deixando os juros compostos em R$ 0,00 mesmo com parcelas atrasadas.

## Correções
- Taxa nula, vazia, inválida ou zero passa a receber a taxa-padrão da poupança quando os juros estão ativos.
- Acordos salvos no storage v7 são migrados automaticamente para v8.
- Taxa ativa deve ser maior que zero; para não cobrar juros, deve-se desativar a cobrança no acordo.
- O cálculo e as telas usam uma função única de normalização da taxa.
- O cartão de juros agora mostra base, taxa mensal aplicada e quantidade de meses completos.
- Mantida a regra: juros compostos sobre todo o saldo principal em aberto desde o primeiro vencimento não pago.

## Arquivos
- `index.html`
- `styles.css`
- `app.js`
- `VERSION.md`
- `VALIDACAO.md`
