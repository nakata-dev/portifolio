# COMPRAR & VENDA PRO v1.1.0 — Demonstrativo Financeiro

## Base
- Evolução direta da v1.0.0 Base Oficial.
- Schema de dados atualizado de 3 para 4, com migração automática.

## Principais mudanças
- Demonstrativo financeiro reorganizado por cliente e acordo.
- Separação entre valor original, total recebido, principal em aberto, principal vencido, correção e saldo atualizado.
- Regra única de correção pela poupança nos empréstimos.
- Cálculo parcela por parcela, somente sobre parcelas vencidas e por meses completos.
- Taxa mensal padrão configurável e taxa registrada individualmente em cada acordo.
- Pagamentos parciais sem apagar ou reduzir o valor original do contrato.
- Histórico auditável de pagamentos, estornos e atualizações.
- Parcelas agora guardam valor contratado, valor pago e saldo restante.
- Proteção contra alteração do plano financeiro depois que existem pagamentos.
- Relatório para copiar, compartilhar, imprimir ou salvar em PDF.

## Observação importante
A taxa de 0,67% ao mês continua como referência inicial configurável. O aplicativo não consulta automaticamente a TR ou séries oficiais; o usuário deve revisar a taxa usada em cada acordo.
