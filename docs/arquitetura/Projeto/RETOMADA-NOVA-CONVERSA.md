# Retomada de Contexto - RondonIA Apps / ERP Alvorada

## Instrucao ao novo assistente

Leia os documentos indicados antes de propor implementacao. Nao contradiga
decisoes homologadas sem apontar a fonte e solicitar nova decisao. Nao misture
pendencias locais antigas com a etapa ativa.

## Leitura obrigatoria, em ordem

1. [Contexto Atual](CONTEXTO-ATUAL-ALVORADA.md)
2. [Projeto Mestre](../RONDONIA-APPS-PROJETO-MESTRE.md)
3. Documento especializado da etapa ativa.
4. Para catalogo: [CATALOG-MODEL](../Catalogo/CATALOG-MODEL-ALVORADA-001.md) e [CATALOG-INSTANCE](../Catalogo/CATALOG-INSTANCE-ALVORADA-001.md)
5. `git status --short` e ultimo commit.

## Estado atual em ate 20 linhas

1. Projeto: RondonIA Apps / ERP Alvorada.
2. Branch: `feature/m005-caixa`.
3. Ultimo checkpoint funcional: `d4fdffc - feat: implementar catalogo mestre e opcoes`.
4. M-003.M2 esta homologada, commitada e enviada.
5. Proximo marco: M-003.M3 - Complementos, Upgrades e Pizzas.
6. M-003.M3 nao foi iniciada.
7. CATALOG-INSTANCE esta homologado documentalmente.
8. CATALOG-MODEL esta homologado documentalmente.
9. M-003.M1/M1.5 estao commitadas.
10. Nenhum dos 59 produtos reais foi migrado.
11. Nenhum seed real foi criado.
12. Nenhuma imagem foi implementada.
13. Nenhum preco pendente foi preenchido.
14. `DashboardMenu.tsx` possui pendencia antiga fora da M-003.M2.
15. `whatsapp/page.tsx` possui pendencia antiga fora da M-003.M2.
16. Central foi homologada em `abb171b` e `3852c4a`.
17. Catalogo nao cria Pedido direto.
18. Carrinho nao e Pedido; Pedido nao e Venda.
19. Banco/dados persistidos prevalecem sobre fallback quando o assunto e estado executado.
20. Proxima acao depende de autorizacao para iniciar M-003.M3.

## Proxima acao

Confirmar se o usuario autoriza iniciar M-003.M3. Nao iniciar migracao, seed
real, imagens ou preenchimento de precos pendentes.

## Regras de trabalho

- arquitetura antes de implementacao;
- documento antes de codigo quando aplicavel;
- nao misturar modulos;
- evidencias antes de conclusao;
- banco como fonte da verdade;
- screenshots confrontados com relatorio quando houver UX;
- pedir confirmacao e retorno Codex/Hercules em handoffs;
- commits isolados;
- sem hard delete operacional;
- sem precos inventados;
- sem migration/seed real sem autorizacao.

## Prompt de retomada

```text
Estamos continuando o ERP Alvorada da RondonIA Apps.
Leia primeiro:
- docs/arquitetura/Projeto/CONTEXTO-ATUAL-ALVORADA.md
- docs/arquitetura/RONDONIA-APPS-PROJETO-MESTRE.md
- docs/arquitetura/Catalogo/M-003.M2-Catalogo-Mestre-e-Opcoes.md
- docs/arquitetura/Catalogo/CATALOG-MODEL-ALVORADA-001.md
- docs/arquitetura/Catalogo/CATALOG-INSTANCE-ALVORADA-001.md

Depois confira git status e ultimo commit.
Nao inicie M-003.M3 ate reconciliar Git, pendencias locais e autorizacao.
```
