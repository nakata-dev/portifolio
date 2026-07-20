# Validação da v1.4.1

## Verificações
- JavaScript validado com `node --check`.
- HTML verificado sem IDs duplicados.
- Migração de `cvpro:data:v7` para `cvpro:data:v8` verificada.
- Venda antiga com `loanRate: null` reparada para 0,67% ao mês.
- Venda migrada com `loanRate: 0` e juros ativos reparada para 0,67% ao mês.
- Juros desativados continuam desativados.

## Cenário de regressão
- Saldo principal geral: R$ 4.200,00.
- Primeira parcela vencida e não paga: 14/04/2026.
- Data de conferência: 20/07/2026.
- Períodos completos: 3 meses.
- Taxa: 0,67% ao mês.
- Fórmula: 4.200 × (1 + 0,0067)^3.
- Juros esperados: R$ 84,99.
- Saldo geral atualizado esperado: R$ 4.284,99.

O hotfix impede que uma taxa nula herdada de versões antigas seja interpretada como zero.
