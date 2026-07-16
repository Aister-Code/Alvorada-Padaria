# DMI - Jornada do Cliente pelo Catalogo Digital

## Objetivo

Guiar a implementacao da jornada do cliente a partir do Catalogo Digital, conectando catalogo publico, OJC, Central de Atendimento, Pedido, Venda/Caixa, Producao/Separacao e Delivery/Retirada/Balcao/Mesa.

Este DMI nao libera implementacao automatica. Ele define o caminho correto para que a jornada seja construida sem misturar entidades, estados e dominios operacionais.

Referencia atual: a Central de Atendimento / Conversas esta homologada no commit `3852c4a - feat: refinar interacoes da central de atendimento`. Ela nao deve ser reaberta sem pedido especifico.

## Principio Central

Catalogo Digital nao cria Pedido direto sem contrato OJC/ROR.

A jornada correta e:

```text
Cliente abre Catalogo
-> cria ou recupera sessao
-> navega produtos
-> monta carrinho
-> pede ajuda ou confirma intencao
-> Central assume ou acompanha
-> carrinho vira Pedido conforme regras da Venda/ROR
-> Pedido segue Producao/Separacao/Caixa/Delivery
-> cliente acompanha status
```

Separacao obrigatoria:

- Sessao de Catalogo: contexto vivo da navegacao do cliente.
- Carrinho: intencao de compra, ainda sem valor operacional de pedido.
- Conversa: comunicacao e suporte pelo canal, principalmente WhatsApp.
- Cliente: pessoa identificada ou parcialmente identificada.
- Pedido: entidade operacional validada, com numero e rota.
- Venda: fechamento financeiro/recebimento, dominio do Caixa.
- Producao/Separacao: execucao dos itens do pedido.
- Entrega/Retirada/Balcao/Mesa: forma de conclusao operacional.

Regra: carrinho nao e pedido; pedido nao e venda; venda nao nasce no catalogo.

## Perfil Principal

Cliente externo, com acompanhamento do Sistema/OJC e apoio da Central de Atendimento.

## Perfis Envolvidos

### 1. Cliente

Ve: catalogo publico, categorias, produtos, ficha do produto, carrinho, ajuda e status simples.

Pode fazer:

- abrir link do cardapio;
- navegar por categorias;
- abrir ficha de produto;
- adicionar/remover item;
- alterar quantidade;
- pedir ajuda;
- confirmar intencao de compra;
- acompanhar status quando houver pedido.

Nao pode fazer:

- criar pedido operacional direto sem validacao;
- alterar rota de producao, caixa ou entrega;
- acessar informacoes internas.

Recebe alerta quando:

- carrinho precisa confirmacao;
- atendimento humano assume;
- pedido muda de status;
- falta informacao para concluir.

Passa para outro dominio quando:

- ajuda e solicitada;
- carrinho vira intencao de pedido;
- pedido e criado e entra na rota operacional.

### 2. IA / Autoatendimento

Ve: contexto limitado da sessao, carrinho e perguntas simples.

Pode fazer:

- orientar navegacao;
- sugerir produtos quando permitido;
- explicar status simples;
- coletar informacoes leves;
- acionar humano quando houver duvida, falha ou pedido sensivel.

Nao pode fazer:

- confirmar pedido fora das regras OJC/ROR;
- receber pagamento;
- alterar pedido operacional sem permissao;
- esconder transferencia para humano quando necessaria.

Recebe alerta quando:

- carrinho fica parado;
- cliente pede ajuda;
- falha de canal/catalogo impede continuidade.

Passa para outro dominio quando:

- precisa humano;
- pedido precisa validacao operacional;
- pagamento ou excecao entra no fluxo.

### 3. Atendente Humano

Ve: conversa, cliente, sessao de catalogo, carrinho, historico resumido e proxima acao.

Pode fazer:

- assumir conversa;
- assumir sessao de catalogo;
- responder cliente;
- revisar carrinho;
- validar dados;
- iniciar pedido conforme regras;
- repassar para Caixa, Producao, Delivery ou Gerente.

Nao pode fazer:

- substituir Caixa no fechamento financeiro;
- duplicar logica de Venda;
- criar pedido ignorando ROR;
- tratar producao como item de chat.

Recebe alerta quando:

- ajuda foi solicitada;
- carrinho esta parado;
- cliente novo precisa cadastro;
- pedido precisa confirmacao;
- repasse foi recebido.

Passa para outro dominio quando:

- pedido e criado;
- pagamento precisa Caixa;
- item precisa Producao/Separacao;
- entrega precisa Delivery.

### 4. Gerente

Ve: saude da jornada, indicadores, gargalos, sessoes paradas, pedidos e repasses criticos.

Pode fazer:

- configurar tempos e regras elegiveis;
- assumir ou redistribuir demandas;
- auditar historico;
- liberar excecoes conforme perfil;
- validar melhoria de fluxo.

Nao pode fazer:

- misturar regra local sem registrar no DNA/DMI/MHO quando virar padrao;
- quebrar rastreabilidade;
- usar painel gerencial como atalho para burlar dominios.

Recebe alerta quando:

- abandono passa do limite;
- canal/catalogo falha;
- repasse critico nao e aceito;
- pedido fica preso entre dominios.

Passa para outro dominio quando:

- delega para Atendimento, Caixa, Producao ou Delivery;
- aprova excecao que precisa virar regra.

### 5. Producao / Separacao

Ve: pedido operacional, itens, observacoes de preparo/separacao e prioridade.

Pode fazer:

- preparar/separar itens;
- atualizar status produtivo;
- sinalizar falta, atraso ou problema.

Nao pode fazer:

- alterar carrinho de catalogo;
- responder cliente como canal principal;
- receber pagamento.

Recebe alerta quando:

- pedido entra em producao/separacao;
- pedido complementar deve aguardar agrupamento;
- item exige atencao.

Passa para outro dominio quando:

- pedido fica pronto;
- existe problema para Atendimento/Gerente;
- entrega/retirada deve assumir.

### 6. Caixa

Ve: pedido, valor, forma de pagamento, recebimento assistido, troco e pendencias financeiras.

Pode fazer:

- conferir pagamento;
- confirmar venda;
- recusar recebimento inconsistente;
- registrar troco/acerto;
- finalizar venda conforme regra.

Nao pode fazer:

- transformar carrinho em pedido sem validacao operacional;
- assumir conversa como atendimento principal;
- alterar producao sem rota.

Recebe alerta quando:

- ha pagamento pendente;
- atendimento registrou recebimento assistido;
- venda precisa conferencia.

Passa para outro dominio quando:

- pagamento foi confirmado;
- pendencia financeira volta para Atendimento/Gerente;
- pedido segue entrega/retirada.

### 7. Delivery / Motoboy

Ve: pedido pronto para entrega, endereco, cliente, status, observacoes e agrupamentos.

Pode fazer:

- assumir rota;
- confirmar saida;
- confirmar entrega;
- sinalizar problema de endereco ou contato.

Nao pode fazer:

- alterar carrinho;
- confirmar pagamento sem regra de caixa/recebimento;
- mudar pedido base.

Recebe alerta quando:

- pedido esta pronto;
- entrega agrupada deve aguardar pedido complementar;
- cliente precisa contato.

Passa para outro dominio quando:

- entrega conclui;
- pagamento volta ao Caixa;
- problema volta ao Atendimento/Gerente.

### 8. Sistema / OJC

Ve: eventos, estados, entidades vinculadas, tempos, prioridade e rastreabilidade.

Pode fazer:

- criar/recuperar sessao;
- registrar eventos append-only;
- atualizar estado da sessao;
- sinalizar abandono;
- conectar conversa, sessao, cliente e pedido;
- acionar alertas.

Nao pode fazer:

- inventar pedido sem contrato de negocio;
- substituir decisao humana quando a regra exigir validacao;
- apagar historico necessario para auditoria.

Recebe alerta quando:

- canal falha;
- sessao fica parada;
- transicao obrigatoria nao acontece;
- entidade fica sem vinculo minimo.

Passa para outro dominio quando:

- evento exige responsavel humano;
- pedido nasce;
- rota operacional assume.

## Etapas da Jornada

### 1. Entrada pelo link do cardapio

Cliente acessa link publico enviado pela Central, QR Code, bio, site ou canal futuro.

Resultado esperado: registrar origem, unidade, campanha opcional e identificador inicial quando existir.

### 2. Criacao ou recuperacao da sessao

O sistema cria uma nova sessao ou recupera uma sessao aberta compativel com telefone, navegador, token ou conversa.

Resultado esperado: `sessoesCatalogo` representa a navegacao atual, sem criar pedido.

### 3. Identificacao leve do cliente

Quando possivel, capturar telefone, nome informado, origem e vinculo com `clientes`.

Resultado esperado: permitir jornada sem cadastro completo, mas preparar cadastro Express/Completo.

### 4. Navegacao por categorias/produtos

Cliente ve categorias e produtos ativos, com leitura mobile-first e sem excesso de cards pesados.

Resultado esperado: cliente entende rapido onde tocar e o que esta comprando.

### 5. Ficha do produto

Produto abre com nome, imagem quando houver, descricao curta, preco, variacoes, observacoes e acao de adicionar.

Resultado esperado: ficha resolve decisao de compra sem virar tela complexa.

### 6. Adicao ao carrinho

Ao adicionar item, o carrinho da sessao e atualizado.

Resultado esperado: evento `item_adicionado_carrinho` e snapshot de carrinho atualizado.

### 7. Carrinho em andamento

Cliente revisa itens, quantidades, observacoes, valor estimado e forma desejada de recebimento.

Resultado esperado: carrinho comunica intencao, mas ainda nao vira pedido.

### 8. Pedido de ajuda

Cliente aciona ajuda contextual.

Resultado esperado: sessao muda para ajuda solicitada, Central recebe demanda e IA/Humano pode atuar.

### 9. Carrinho abandonado

Sessao parada alem do tempo configurado vira abandono operacional.

Resultado esperado: alerta limpo na Central/Gerente, sem assediar cliente automaticamente sem regra.

### 10. Atendimento humano assume

Atendente assume conversa ou sessao.

Resultado esperado: cliente nao perde contexto; atendente ve carrinho, mensagens e dados disponiveis.

### 11. Conversao carrinho -> intencao de pedido

Carrinho validado vira intencao de pedido.

Resultado esperado: checar dados minimos, modalidade, disponibilidade e regras ROR.

### 12. Validacao do pedido

Antes de criar pedido, validar cliente, itens, valores, entrega/retirada/balcao/mesa, observacoes e restricoes.

Resultado esperado: reduzir erro operacional antes de acionar producao/caixa/delivery.

### 13. Criacao do Pedido operacional

Pedido e criado no dominio de Venda/Pedido, com numero e vinculos.

Resultado esperado: `pedidos` recebe `conversaWhatsAppId` e/ou `sessaoCatalogoId` futuro quando houver contrato.

### 14. Envio para Producao/Separacao

Pedido segue a rota operacional definida por ROR.

Resultado esperado: Producao/Separacao recebe pedido, nao sessao de catalogo.

### 15. Recebimento/Caixa quando aplicavel

Pagamento, troco, comprovante e recebimento assistido entram no dominio Caixa.

Resultado esperado: venda finalizada somente pelo fluxo financeiro permitido.

### 16. Delivery/retirada/balcao/mesa

Pedido segue modalidade definida e responsavel correspondente.

Resultado esperado: entrega/retirada/balcao/mesa nao alteram carrinho; apenas conduzem pedido.

### 17. Acompanhamento de status pelo cliente

Cliente pode consultar status simples.

Resultado esperado: mostrar linguagem comum: recebido, preparando, pronto, saiu para entrega, entregue.

### 18. Pedido complementar

Se cliente pedir mais itens apos pedido existente, avaliar se pedido ainda aceita edicao.

Regra:

- se pedido permite edicao, complementar pedido existente;
- se nao permite, criar Pedido Complementar;
- se entrega ainda nao saiu, perguntar se deseja agrupar entrega;
- manter rastreabilidade separada.

### 19. Encerramento da sessao

Sessao encerra quando pedido e convertido, cliente desiste, atendimento encerra ou tempo/regra exige.

Resultado esperado: historico preservado para relatorio e retomada.

### 20. Historico do cliente

Eventos e entidades alimentam a memoria operacional.

Resultado esperado: proxima interacao mostra contexto sem expor complexidade tecnica.

## Estados da Sessao de Catalogo

### aberta

Significado: link acessado e sessao criada/recuperada.

Entrada: `catalogo_aberto`.

Saida: navegacao iniciada, abandono ou encerramento.

Evento gerado: `catalogo_aberto`.

Quem pode avancar: Sistema/OJC.

Impacto na Central: normalmente invisivel ate haver carrinho, ajuda ou abandono.

### navegando

Significado: cliente esta explorando produtos sem carrinho relevante.

Entrada: categoria/produto visualizado.

Saida: carrinho iniciado, ajuda solicitada, abandono ou encerramento.

Evento gerado: `produto_visualizado`.

Quem pode avancar: Cliente ou Sistema/OJC.

Impacto na Central: baixo; pode aparecer apenas em contexto do cliente.

### carrinho_iniciado

Significado: existe intencao de compra com item no carrinho.

Entrada: primeiro item adicionado.

Saida: ajuda solicitada, em atendimento, abandonado ou convertido em pedido.

Evento gerado: `item_adicionado_carrinho`.

Quem pode avancar: Cliente, Atendente ou Sistema/OJC.

Impacto na Central: entra em Carrinhos quando relevante.

### ajuda_solicitada

Significado: cliente pediu suporte sobre catalogo/carrinho.

Entrada: botao Ajuda ou falha guiada.

Saida: em atendimento, abandono, encerramento.

Evento gerado: `ajuda_solicitada`.

Quem pode avancar: Cliente aciona; Atendente/IA assume.

Impacto na Central: gera demanda IA/Humano e alerta de atendimento.

### em_atendimento

Significado: responsavel humano/IA assumiu a sessao.

Entrada: sessao assumida.

Saida: carrinho abandonado, convertido em pedido ou encerrada.

Evento gerado: `sessao_assumida`.

Quem pode avancar: Atendente, Gerente ou Sistema/OJC conforme regra.

Impacto na Central: aparece vinculada a conversa/cliente ativo.

### carrinho_abandonado

Significado: sessao com intencao ficou parada alem do tempo configurado.

Entrada: timeout configurado.

Saida: retomada, em atendimento ou encerrada.

Evento gerado: `carrinho_abandonado`.

Quem pode avancar: Sistema/OJC, Atendente ou Cliente ao retomar.

Impacto na Central: gera alerta limpo, sem virar pedido.

### convertido_em_pedido

Significado: carrinho validado virou pedido operacional.

Entrada: confirmacao e criacao/vinculo de pedido.

Saida: encerrada ou acompanhamento de status.

Evento gerado: `pedido_criado_a_partir_catalogo`.

Quem pode avancar: Atendente/Sistema depois da validacao de regras.

Impacto na Central: deixa de ser carrinho e passa a contexto de Pedido.

### encerrada

Significado: sessao nao exige mais acao.

Entrada: pedido criado, desistencia, cancelamento ou encerramento manual/automatico.

Saida: nova sessao futura.

Evento gerado: `sessao_encerrada`.

Quem pode avancar: Sistema/OJC ou operador autorizado.

Impacto na Central: sai dos alertas ativos, permanece no historico.

## Eventos OJC Propostos

Eventos devem ser append-only. Estado atual pode ser derivado ou atualizado, mas o historico nao deve ser perdido.

| Evento | Uso | Situacao atual |
| --- | --- | --- |
| `catalogo_aberto` | registra entrada pelo link | futuro |
| `sessao_catalogo_criada` | registra sessao criada/recuperada | parcialmente suportado por `criarSessaoCatalogo` |
| `produto_visualizado` | mede interesse e funil | futuro |
| `item_adicionado_carrinho` | marca inicio/intensidade do carrinho | parcialmente suportado por snapshot em `atualizarCarrinhoSessao` |
| `item_removido_carrinho` | rastreia mudanca de intencao | parcialmente suportado por snapshot, sem evento proprio |
| `quantidade_alterada` | rastreia ajuste de quantidade | parcialmente suportado por snapshot, sem evento proprio |
| `ajuda_solicitada` | abre demanda para atendimento | parcialmente suportado por `solicitarAjuda` |
| `sessao_assumida` | define responsavel pela sessao | parcialmente suportado por `assumirSessao` |
| `carrinho_abandonado` | alerta abandono | parcialmente suportado por `marcarAbandonada` |
| `carrinho_convertido_em_intencao` | separa carrinho de pedido | futuro |
| `pedido_criado_a_partir_catalogo` | vincula pedido a origem catalogo | parcialmente suportado por `converterSessaoEmPedido`, mas sem criacao direta |
| `pedido_complementar_solicitado` | controla nova compra com pedido existente | futuro |
| `status_pedido_consultado` | registra acompanhamento pelo cliente | futuro |
| `sessao_encerrada` | encerra contexto ativo | parcialmente suportado por `encerrarSessao` |

## Relacao com a Central de Atendimento

Central nao e modulo de producao. Central organiza conversas, intencoes e contexto.

Regras:

- Carrinho do Catalogo aparece na Central quando ha sessao relevante.
- Ajuda do Catalogo gera demanda para IA/Humano.
- Central pode assumir sessao e conversar com o cliente.
- Pedido aprovado sai da Central e segue ROR.
- Central pode acompanhar status para responder ao cliente.
- Central nao duplica logica de Venda, Caixa, Producao ou Delivery.
- Cardapio enviado pela Central deve gerar link/sessao rastreavel, nao apenas mensagem solta.

## Relacao com Pedido e Venda

Carrinho nao e Pedido.

Pedido nao e Venda.

Venda nao nasce no Catalogo.

Catalogo gera intencao/carrinho. Pedido nasce quando validado por regra operacional. Venda/Caixa fecha pagamento/recebimento. Producao recebe Pedido, nao sessao de catalogo.

Fluxo esperado:

```text
Carrinho validado
-> Intencao de pedido
-> Validacao operacional
-> Pedido criado
-> ROR define proximas etapas
-> Caixa/Venda confirma financeiro quando aplicavel
```

## Pedido Complementar

Se cliente pedir mais itens apos pedido existente:

- pedido editavel: adicionar ao pedido existente, mantendo evento;
- pedido nao editavel: criar Pedido Complementar;
- entrega ainda nao saiu: perguntar se cliente deseja agrupar entrega;
- entrega agrupada nao mistura pedidos, apenas vincula logistica;
- Conferencia/Producao/Delivery devem receber aviso claro.

## UX / RVL

Diretrizes:

- Catalogo publico simples e mobile-first.
- DNA WhatsApp Android para fluidez, aproveitamento e leitura.
- RVL-034 para alinhamento optico operacional.
- RVL-035 para docks operacionais quando aplicavel.
- Nao parecer marketplace generico.
- Nao parecer app bancario.
- Nao poluir com cards pesados.
- Cliente deve entender sem treinamento.
- Textos devem ser curtos, comuns e orientados a acao.

Elementos obrigatorios quando aplicavel:

- botao Ajuda contextual;
- botao Cardapio enviado pela Central;
- carrinho sempre claro;
- ficha de produto objetiva;
- status simples do pedido;
- mensagens de erro em linguagem humana;
- estados vazios compreensiveis.

## Nao Escopo do MVP

Nao entra agora:

- pagamento online completo;
- integracao real WhatsApp API;
- IA completa;
- blockchain;
- relatorios avancados;
- fidelidade/promocoes inteligentes;
- multiplas regras fiscais;
- rastreamento real do motoboy;
- personalizacao avancada por cliente.

Mesmo fora do MVP, a arquitetura deve deixar espaco para estes recursos sem refazer a jornada.

## Lacunas Atuais

Com base na auditoria do estado atual:

- rota publica do Catalogo Digital inexistente no app principal;
- frontend do catalogo nao usa OJC;
- adicionar produto nao persiste carrinho;
- sessao nao e criada ao abrir catalogo;
- ajuda nao retorna para Central;
- carrinho nao vira pedido;
- cliente nao acompanha status;
- cadastro Express/Completo nao esta integrado ao catalogo;
- pagamento assistido nao esta integrado ao catalogo;
- eventos append-only ainda nao existem como tabela propria;
- carrinho esta em snapshot JSON, sem itens normalizados de sessao;
- envio de cardapio pela Central ainda esta preparado, mas nao conectado ao canal real.

## Decisoes Aprovadas

- Catalogo Digital e entrada de jornada, nao criador direto de pedido.
- Sessao de Catalogo, Carrinho, Conversa, Cliente, Pedido, Venda, Producao e Entrega sao conceitos separados.
- Central acompanha e assume intencoes, mas nao duplica Venda/Caixa/Producao.
- Pedido so nasce depois de validacao operacional.
- Pedido complementar deve manter rastreabilidade propria.
- Eventos OJC devem ser append-only.
- Cliente deve conseguir navegar e pedir ajuda sem treinamento.
- MVP deve ser simples, mas preparado para evolucao.

## Duvidas em Aberto

- Qual identificador minimo sera usado para recuperar sessao anonima: telefone, token de link, navegador ou conversa?
- Quando o cliente abre cardapio sem WhatsApp, qual canal vira origem principal?
- Quais campos entram no cadastro Express do catalogo?
- Qual tempo padrao define carrinho abandonado por unidade/perfil?
- Quem pode configurar mensagens automaticas de retomada?
- Como sera exibido status ao cliente fora do WhatsApp?
- Qual regra define pedido editavel versus Pedido Complementar?
- Como sera o contrato entre recebimento assistido e Caixa no MVP?

## Pontos Obrigatorios para o MHO

- Campos minimos do Cadastro Express/Completo.
- Identificador de sessao.
- Tempos de abandono e retomada.
- Contrato de eventos append-only.
- Regra objetiva de pedido editavel vs Pedido Complementar.
- Status do pedido para cliente fora do WhatsApp.

## Riscos de Implementacao

- Criar pedido cedo demais e quebrar ROR.
- Duplicar carrinho entre catalogo publico e Central.
- Criar fluxo sem rastreabilidade de eventos.
- Misturar recebimento financeiro com atendimento.
- Reabrir a Central homologada sem necessidade.
- Criar UX de marketplace e perder DNA operacional.
- Usar dados demonstrativos como se fossem dados reais.
- Fazer schema antes de consolidar DMI/MHO e contratos de eventos.

## Fases Sugeridas de Implementacao

### Fase 1 - Contrato da Jornada

- validar DMI;
- criar/ajustar MHO do Catalogo Digital;
- definir eventos OJC;
- definir estados finais de `sessoesCatalogo`;
- validar relacao com Pedido/Venda/ROR.

### Fase 2 - Catalogo Publico com Sessao

- criar rota publica;
- criar/recuperar sessao;
- listar categorias/produtos;
- abrir ficha de produto;
- persistir carrinho;
- registrar eventos essenciais.

### Fase 3 - Ajuda e Central

- botao Ajuda no catalogo;
- alertar Central;
- vincular sessao a conversa;
- permitir assumir sessao;
- preservar Central homologada e evoluir por contrato.

### Fase 4 - Conversao em Pedido

- validar dados;
- converter carrinho em intencao;
- criar pedido operacional;
- vincular pedido, sessao e conversa;
- acionar ROR.

### Fase 5 - Status e Pos-venda

- cliente acompanha status;
- pedido complementar;
- entrega agrupada;
- historico do cliente;
- relatorios simples.

## Arquivos Provavelmente Afetados Futuramente

- `src/App.tsx`
- `src/pages/catalog/page.tsx`
- `src/pages/catalog/_components/ProductSheet.tsx`
- `src/pages/whatsapp/page.tsx`
- `src/pages/venda/page.tsx`
- `src/pages/acompanhamento/page.tsx`
- `convex/schema.ts`
- `convex/catalog/categories.ts`
- `convex/catalog/products.ts`
- `convex/catalog/list.ts`
- `convex/ojc/catalogo.ts`
- `convex/ojc/whatsapp.ts`
- `convex/ojc/transferencias.ts`
- `convex/venda/pedidos.ts`
- futuro `convex/ojc/eventos.ts`
- futuro `docs/arquitetura/MHO/MHO-Catalogo-Digital.md`

## O Que Validar Antes de Codar

- rota publica do catalogo;
- regra de identificacao/recuperacao de sessao;
- campos minimos do carrinho;
- tabela/evento append-only;
- estados finais da sessao;
- tempo de abandono;
- regra de ajuda para IA/Humano;
- contrato carrinho -> intencao -> pedido;
- regra de pedido complementar;
- exibicao de status para cliente;
- limites do MVP.

## Checklist de Implementacao Futura

- DMI aprovado.
- MHO do Catalogo Digital criado.
- OJC-ME e OJC-UI consultados.
- ROR consultado para pedido, producao e entrega.
- RVL/RDS/RAW aplicados.
- Central homologada preservada ate haver escopo explicito.
- Backend desenhado antes de frontend funcional.
- Eventos append-only definidos.
- Build e diff-check executados quando houver codigo.
