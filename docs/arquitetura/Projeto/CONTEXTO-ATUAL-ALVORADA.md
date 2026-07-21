# Contexto Atual - ERP Alvorada

## Data e branch do checkpoint

- Data de registro: 2026-07-20.
- Branch atual: `feature/m005-caixa`.
- Esta memoria registra o estado apos o checkpoint funcional da M-003.M2.

## Ultimo commit confirmado

`d4fdffc | d4fdffcdcb99ccd835f98a3a57f8a55deb9f29d7 | 2026-07-20 20:58:39 -0400 | feat: implementar catalogo mestre e opcoes`

## Git status atual

Estado esperado apos o commit funcional da M-003.M2:

### A. Checkpoint funcional concluido

- `d4fdffc - feat: implementar catalogo mestre e opcoes`
- enviado para `origin/feature/m005-caixa`.

### B. Pendencias funcionais antigas fora da M-003.M2

- `src/pages/dashboard/_components/DashboardMenu.tsx`
- `src/pages/whatsapp/page.tsx`

Esses dois arquivos permaneceram fora do checkpoint da M-003.M2 e nao devem
ser misturados com o checkpoint documental da memoria.

## Estado por modulo

| Modulo | Estado resumido |
| --- | --- |
| M-001 Login Geral | Implementado/documentado; manter padrao de acesso por operador/perfil. |
| M-002 Gerente | Visual operacional refinado; pendencia antiga em `DashboardMenu.tsx`. |
| M-002.1 Usuarios | DMI/MHO existentes; administracao presente no dashboard. |
| M-003 Catalogo Digital | CATALOG-INSTANCE/MODEL homologados; M1/M1.5 e M2 commitadas/enviadas; M3 ainda nao iniciada. |
| M-004 Venda Balcao | Operacional legado com pedido persistido; protegido contra produto sem `products.price` legado no checkpoint M2. |
| M-005 Caixa | DMI/MHO existem; branch atual carrega o nome do modulo. |
| M-006 Central | Homologada nos commits `abb171b` e `3852c4a`; pendencia antiga em `whatsapp/page.tsx`. |

## Etapa ativa

Proximo marco: M-003.M3 - Complementos, Upgrades e Pizzas.

## Estado da M-003.M2

A M-003.M2 esta homologada tecnicamente, commitada e enviada em:

`d4fdffc | d4fdffcdcb99ccd835f98a3a57f8a55deb9f29d7 | feat: implementar catalogo mestre e opcoes`

A auditoria defensiva de `convex/venda/pedidos.ts` foi a ultima validacao antes
do checkpoint e nao e pendencia atual.

## Proxima decisao esperada

1. Aguardar autorizacao para iniciar M-003.M3.
2. M-003.M3 deve tratar Complementos, Upgrades e Pizzas.
3. Nao migrar produtos nem imagens antes das etapas previstas.

## Proibicoes atuais

- nao migrar os 59 produtos;
- nao criar seed real;
- nao inserir dados Convex reais;
- nao implementar imagens;
- nao preencher precos pendentes;
- nao iniciar M-003.M3 sem autorizacao explicita;
- nao misturar `DashboardMenu.tsx` e `whatsapp/page.tsx` com checkpoints futuros.

## Resumo do catalogo real

- 9 categorias;
- 59 produtos;
- 94 variacoes/opcoes;
- 52 produzidos;
- 7 revendidos;
- 0 mistos;
- 1 upgrade comercial;
- 2 ocorrencias de upgrade;
- 121 precos confirmados;
- 2 precos pendentes;
- 1 preco aguardando confirmacao;
- 12 pendencias documentais/operacionais.

Fonte: [CATALOG-INSTANCE-ALVORADA-001](../Catalogo/CATALOG-INSTANCE-ALVORADA-001.md).

## Documentos principais para continuar

1. [Projeto Mestre](../RONDONIA-APPS-PROJETO-MESTRE.md)
2. [Retomada de Nova Conversa](RETOMADA-NOVA-CONVERSA.md)
3. [M-003.M2](../Catalogo/M-003.M2-Catalogo-Mestre-e-Opcoes.md)
4. [CATALOG-MODEL](../Catalogo/CATALOG-MODEL-ALVORADA-001.md)
5. [CATALOG-INSTANCE](../Catalogo/CATALOG-INSTANCE-ALVORADA-001.md)

## Como atualizar este arquivo

Atualizar em todo checkpoint relevante, mudanca de branch, homologacao,
inicio/conclusao de etapa, migracao, decisao arquitetural ou nova pendencia
bloqueadora.
