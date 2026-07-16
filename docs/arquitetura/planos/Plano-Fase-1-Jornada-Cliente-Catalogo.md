# Plano - Fase 1 Jornada Cliente Catalogo Digital

## Objetivo da Fase

Planejar a primeira implementacao funcional da Jornada do Cliente pelo Catalogo Digital, usando como base:

- `docs/arquitetura/DMI/DMI-Jornada-Cliente-Catalogo-Digital.md`
- `docs/arquitetura/MHO/MHO-Jornada-Cliente-Catalogo-Digital.md`
- commit base `2b891a0 - docs: criar dmi e mho da jornada cliente catalogo`

A Fase 1 deve ligar o Catalogo Digital a OJC sem criar Pedido operacional.

Regra principal:

```text
Catalogo gera sessao, carrinho e intencao.
Catalogo nao cria Pedido direto nesta fase.
```

## Escopo da Fase 1

Entram nesta fase:

1. Rota publica do catalogo.
2. Identificacao inicial da sessao.
3. Criacao ou recuperacao de `sessoesCatalogo`.
4. Ligacao do frontend do catalogo com `convex/ojc/catalogo.ts`.
5. Persistencia de carrinho em `itensSnapshot`.
6. Acao de adicionar item.
7. Acao de remover item.
8. Acao de alterar quantidade.
9. Botao Ajuda no catalogo.
10. Ajuda aparecendo para a Central.
11. Relacao com telefone/conversa quando existir.
12. Estado de carrinho iniciado.
13. Estado de ajuda solicitada.
14. Estado de carrinho abandonado quando aplicavel.
15. Visibilidade da sessao/carrinho na Central, apenas se necessaria por leitura.

## Fora de Escopo da Fase 1

Nao entram nesta fase:

- criacao de Pedido operacional;
- conversao carrinho -> pedido;
- Pedido Complementar;
- pagamento;
- recebimento assistido;
- Caixa;
- Producao;
- Delivery;
- integracao real WhatsApp API;
- IA completa;
- cadastro completo obrigatorio;
- relatorios;
- reabertura visual da Central homologada;
- alteracao de regra de Venda/Pedido.

## Estados Envolvidos

### Obrigatorios

- `aberta`
- `navegando`
- `carrinho_iniciado`
- `ajuda_solicitada`
- `carrinho_abandonado`

### Nao obrigatorios nesta fase

- `em_atendimento`, salvo se ja existir e for necessario para Central assumir.
- `convertido_em_pedido`.
- `encerrada`, salvo encerramento simples de sessao.

## Eventos Envolvidos

### Eventos minimos da Fase 1

- `catalogo_aberto`
- `sessao_catalogo_criada`
- `produto_visualizado`
- `item_adicionado_carrinho`
- `item_removido_carrinho`
- `quantidade_alterada`
- `ajuda_solicitada`
- `carrinho_abandonado`

### Eventos fora da Fase 1

- `pedido_criado_a_partir_catalogo`
- `pedido_complementar_solicitado`
- `status_pedido_consultado`

## Arquivos Provaveis

### Frontend

- `src/pages/catalog/page.tsx`
- `src/pages/catalog/_components/ProductSheet.tsx`
- `src/App.tsx`, se for necessario ligar rota publica.

### Backend / OJC

- `convex/ojc/catalogo.ts`
- `convex/schema.ts`, somente se realmente necessario.
- `convex/catalog/categories.ts`
- `convex/catalog/products.ts`
- `convex/catalog/list.ts`

### Central

- `src/pages/whatsapp/page.tsx`

Regra: a Central so deve ser tocada se for necessario para leitura de sessao/carrinho. Nao reabrir visual da Central homologada.

## Sequencia de Implementacao Sugerida

### 1. Confirmar contrato antes de codar

- Validar rota publica desejada.
- Validar identificador de sessao.
- Validar como telefone/conversa entram quando houver link vindo da Central.
- Validar se `itensSnapshot` sera suficiente para MVP.
- Validar se eventos minimos serao tabela propria ou primeiro registrados por campos da sessao.

### 2. Preparar rota publica do catalogo

- Criar rota publica sem exigir login de operador.
- Manter app autenticado intacto.
- Garantir que a rota publica nao exponha dados internos.
- Preservar Catalogo como experiencia mobile-first.

### 3. Criar ou recuperar sessao OJC

- Ao abrir catalogo, criar ou recuperar `sessoesCatalogo`.
- Usar telefone quando vier do WhatsApp.
- Usar token quando for link publico.
- Usar conversa quando enviado pela Central.
- Usar navegador/localStorage apenas como apoio, nunca como unica rastreabilidade.

### 4. Ligar catalogo ao backend OJC

- O frontend do catalogo deve usar `convex/ojc/catalogo.ts` para sessao/carrinho.
- `convex/catalog/*` permanece como fonte de produtos/categorias.
- Nao duplicar carrinho em estado isolado sem sincronizar com OJC.

### 5. Persistir carrinho

- Adicionar item atualiza a sessao.
- Remover item atualiza a sessao.
- Alterar quantidade atualiza a sessao.
- `itensSnapshot`, `quantidadeItens` e `valorEstimado` devem refletir o carrinho atual.
- Carrinho com item deve colocar a sessao em `carrinho_iniciado` ou equivalente aprovado.

### 6. Registrar ajuda

- Botao Ajuda deve chamar `solicitarAjuda` ou contrato equivalente.
- Sessao deve mudar para `ajuda_solicitada`.
- Ajuda deve ficar visivel para Central.
- Cliente deve receber retorno simples de que a ajuda foi solicitada.

### 7. Tratar abandono

- Carrinho parado alem do parametro configurado deve virar `carrinho_abandonado`.
- Nao fixar tempo definitivo sem aprovacao.
- Central deve enxergar abandono quando houver impacto operacional.
- Abandono nao cria Pedido.

### 8. Validar Central por leitura

- Central deve conseguir ver sessoes/carrinhos relevantes.
- Evitar mudanca visual desnecessaria.
- Nao alterar comportamento homologado sem novo escopo.

### 9. Validar UX

- Catalogo publico mobile-first.
- DNA WhatsApp Android para aproveitamento.
- RVL-034 para alinhamento optico.
- Visual limpo, sem marketplace generico.
- Carrinho claro.
- Botao Ajuda contextual.
- Cliente entende que ainda nao confirmou Pedido operacional.

### 10. Fechar Fase 1

- Rodar `git diff --check`.
- Rodar build quando houver codigo.
- Testar fluxo minimo com sessao, carrinho e ajuda.
- Confirmar que nenhum Pedido operacional e criado.

## Criterios de Aceite

A Fase 1 so pode ser aprovada se:

- rota publica do catalogo abrir sem login de operador;
- sessao OJC for criada ou recuperada;
- carrinho persistir em `sessoesCatalogo`;
- adicionar/remover/alterar quantidade funcionar;
- Ajuda do catalogo aparecer para a Central;
- carrinho iniciado ficar visivel quando relevante;
- abandono for tratado quando aplicavel;
- telefone/conversa forem vinculados quando existirem;
- nenhum Pedido operacional for criado;
- Central homologada nao for quebrada;
- Venda/Caixa/Producao/Delivery nao forem duplicados;
- `git diff --check` estiver OK;
- build estiver OK quando houver codigo.

## Riscos e Mitigacoes

### Duplicar carrinho entre catalogo e OJC

Mitigacao: usar OJC como fonte operacional da sessao/carrinho.

### Criar Pedido antes da hora

Mitigacao: bloquear qualquer mutation de Pedido nesta fase.

### Quebrar Central homologada

Mitigacao: alterar Central somente por leitura minima, se inevitavel.

### Sessao sem vinculo confiavel

Mitigacao: usar telefone, token ou conversa; localStorage apenas como apoio.

### Abandono invisivel

Mitigacao: definir criterio de alerta para Central/Gerente antes de implementar.

### Ajuda sem aparecer na Central

Mitigacao: homologar fluxo Ajuda -> `sessoesCatalogo` -> Central.

### Carrinho sem rastreabilidade

Mitigacao: registrar evento ou mudanca auditavel para cada operacao de carrinho.

### UX parecer marketplace generico

Mitigacao: aplicar RVL, DNA WhatsApp Android e linguagem simples.

## Perguntas Pendentes Antes de Codar

- Qual sera a rota publica oficial: `/catalogo`, `/cardapio`, `/c/:token` ou outra?
- O link enviado pela Central deve carregar `conversaWhatsAppId`, telefone, token ou todos?
- O MVP usara tabela de eventos append-only agora ou so preparara contrato?
- `itensSnapshot` sera suficiente para Fase 1 ou precisa entidade de itens de sessao?
- Qual tempo inicial de abandono sera usado como parametro demonstrativo?
- A ajuda deve cair em IA, Humano ou ambos no primeiro MVP?
- Qual mensagem o cliente ve apos pedir ajuda?
- A Central precisa de alguma adaptacao de leitura ou o que ja existe basta?
- Como evitar que link publico anonimo crie sessoes infinitas sem controle?
- Quais dados minimos devem aparecer no carrinho antes de pedir ajuda?

## Checklist de Nao Regressao

- Catalogo nao cria Pedido.
- Carrinho nao e Pedido.
- Pedido nao e Venda.
- Central nao vira modulo de Venda/Caixa/Producao/Delivery.
- Caixa nao entra na Fase 1.
- Producao nao entra na Fase 1.
- Delivery nao entra na Fase 1.
- Pedido Complementar nao entra na Fase 1.
- Recebimento Assistido nao entra na Fase 1.
- Integracao real WhatsApp API nao entra na Fase 1.

