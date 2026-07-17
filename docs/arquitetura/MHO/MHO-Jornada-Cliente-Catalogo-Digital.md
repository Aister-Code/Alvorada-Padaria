# MHO - Jornada do Cliente pelo Catalogo Digital

## Objetivo da Homologacao

Confirmar que a Jornada do Cliente pelo Catalogo Digital funciona como jornada operacional governada pela OJC, sem transformar Catalogo em Venda, Carrinho em Pedido ou Central em modulo de Producao/Caixa/Delivery.

Este MHO usa como base o DMI `docs/arquitetura/DMI/DMI-Jornada-Cliente-Catalogo-Digital.md`.

A homologacao deve responder:

- como saberemos que a jornada esta correta;
- quais fluxos precisam ser testados;
- quais perfis participam;
- quais estados precisam ser validados;
- quais eventos devem ser gerados;
- quais integracoes nao podem ser quebradas;
- o que bloqueia aprovacao.

## Regra Principal

Catalogo Digital nao cria Pedido direto sem contrato OJC/ROR.

Carrinho nao e Pedido.

Pedido nao e Venda.

Venda/Caixa confirma o dominio financeiro.

Producao/Separacao recebe Pedido, nao sessao de catalogo.

Central organiza conversa, contexto e intencao; nao duplica Venda, Caixa, Producao ou Delivery.

## Contrato de Homologacao Reconciliado

Este MHO valida tambem as decisoes consolidadas na matriz `docs/arquitetura/UX/Matriz-Reconciliacao-Cardapio-Foundation.md`.

### Categorias homologadas

O cadastro real do catalogo so pode ser homologado se usar como referencia as categorias da Foundation externa:

- Lanches Tradicionais
- Hamburgueres Artesanais
- Pizzas Salgadas
- Pizzas Doces
- Porcoes
- Caldos
- Sucos
- Bebidas
- Cervejas

Categorias como Padaria, Lanches, Pizzas, Bebidas e Sobremesas sao consideradas placeholders/fallback visual, nao cadastro real definitivo.

### Modelo Produto / Variacao / Complemento / Observacao

O modelo homologavel e:

```text
Categoria
-> Produto
-> Variacoes
-> Complementos
-> Observacoes
```

Criterios:

- Produto nao pode ser duplicado por tamanho.
- Produto nao pode ser duplicado por sabor.
- Produto nao pode ser duplicado por massa.
- Produto nao pode ser duplicado por volume.
- Produto nao pode ser duplicado por complemento.
- Variacoes devem ser tratadas como variacoes.
- Complementos devem ser tratados como complementos.
- Observacoes devem ficar no item/carrinho/pedido, nunca no cadastro fixo do produto.

### Multiunidade / unit

O Catalogo deve ser homologado sem bloquear Matriz, Filiais e `unit`.

Criterios:

- disponibilidade pode variar por unidade;
- preco pode variar por unidade quando necessario;
- visibilidade pode variar por unidade;
- o MVP pode usar unidade padrao, mas a modelagem nao pode impedir multiunidade futura.

### Snapshot do carrinho

O carrinho OJC deve preservar snapshot completo do item escolhido.

Dados minimos do snapshot:

- produtoId;
- categoriaId;
- variacaoId quando houver;
- complementos selecionados;
- observacao do item;
- nomeSnapshot;
- descricaoSnapshot;
- precoSnapshot;
- unit;
- imagemSnapshot quando aplicavel.

O carrinho nao deve depender apenas do produto vivo, pois produto, preco e disponibilidade podem mudar depois.

### Fallback visual vs fonte real

Fallback visual pode existir para preview/desenvolvimento, mas nao pode ser tratado como fonte da verdade.

Criterios:

- seed generico nao e cadastro homologado;
- fallback local nao e cadastro real;
- cadastro real segue a Foundation reconciliada;
- dados mockados nao podem ser exibidos como definitivos.

### IA

IA observa, aprende e sugere.

IA nao decide, nao altera catalogo, nao altera carrinho, nao confirma pedido, nao cria Pedido e nao fecha Venda automaticamente.

IA pode auxiliar triagem, sugestao e orientacao, sempre com rastreabilidade.

### Status operacionais fechados

Estados de sessao de catalogo, carrinho, pedido, atendimento, pagamento e entrega devem usar vocabulario fechado.

Qualquer novo status precisa ser registrado no DMI/MHO antes de implementacao.

## Perfis a Homologar

### Cliente

Precisa enxergar:

- catalogo publico;
- categorias e produtos ativos;
- ficha do produto;
- carrinho claro;
- ajuda contextual;
- status simples quando houver pedido.

Pode executar:

- abrir link do cardapio;
- navegar;
- abrir produto;
- adicionar/remover item;
- alterar quantidade;
- pedir ajuda;
- confirmar intencao de compra;
- acompanhar status.

Nao pode executar:

- criar Pedido operacional direto;
- alterar rota de pedido;
- acessar informacoes internas.

Recebe alertas quando:

- precisa confirmar carrinho;
- humano assume;
- pedido muda de status;
- falta informacao para concluir.

Muda de dominio quando:

- pede ajuda;
- carrinho vira intencao de pedido;
- pedido operacional e criado.

### IA / Autoatendimento

Precisa enxergar:

- sessao;
- carrinho;
- pergunta do cliente;
- limite de atuacao.

Pode executar:

- orientar cliente;
- explicar produtos/status simples;
- coletar informacoes leves;
- chamar humano.

Nao pode executar:

- confirmar pedido fora do contrato OJC/ROR;
- receber pagamento;
- alterar pedido operacional;
- esconder necessidade de humano.

Recebe alertas quando:

- carrinho fica parado;
- ajuda e solicitada;
- falha de catalogo/canal impede continuidade.

Muda de dominio quando:

- precisa humano;
- validacao operacional e exigida;
- pagamento ou excecao entra no fluxo.

### Atendente Humano

Precisa enxergar:

- conversa;
- cliente;
- sessao de catalogo;
- carrinho;
- historico resumido;
- proxima acao.

Pode executar:

- assumir conversa;
- assumir sessao;
- responder cliente;
- revisar carrinho;
- validar dados;
- iniciar pedido conforme regra;
- repassar para outro perfil.

Nao pode executar:

- substituir Caixa;
- duplicar Venda;
- criar Pedido ignorando ROR;
- tratar Producao como conversa.

Recebe alertas quando:

- ajuda foi solicitada;
- carrinho esta parado;
- cliente novo precisa cadastro;
- pedido precisa validacao;
- repasse foi recebido.

Muda de dominio quando:

- pedido e criado;
- pagamento vai para Caixa;
- itens vao para Producao/Separacao;
- entrega vai para Delivery.

### Gerente

Precisa enxergar:

- gargalos da jornada;
- sessoes paradas;
- carrinhos abandonados;
- repasses criticos;
- saude do catalogo/canal;
- indicadores por periodo.

Pode executar:

- configurar tempos elegiveis;
- assumir ou redistribuir demandas;
- auditar historico;
- liberar excecoes conforme permissao;
- validar melhoria de fluxo.

Nao pode executar:

- quebrar rastreabilidade;
- transformar excecao local em regra sem DNA/DMI/MHO;
- burlar dominios operacionais.

Recebe alertas quando:

- abandono passa do limite;
- canal/catalogo falha;
- repasse critico nao e aceito;
- pedido fica preso entre dominios.

Muda de dominio quando:

- delega para Atendimento, Caixa, Producao ou Delivery;
- aprova excecao que precisa virar regra.

### Producao / Separacao

Precisa enxergar:

- Pedido operacional;
- itens;
- observacoes;
- prioridade;
- aviso de pedido complementar ou entrega agrupada.

Pode executar:

- preparar/separar;
- atualizar status produtivo;
- sinalizar falta, atraso ou problema.

Nao pode executar:

- alterar carrinho;
- responder cliente como canal principal;
- receber pagamento.

Recebe alertas quando:

- pedido entra na fila;
- pedido complementar exige espera;
- item exige atencao.

Muda de dominio quando:

- pedido fica pronto;
- problema volta para Atendimento/Gerente;
- entrega/retirada assume.

### Caixa

Precisa enxergar:

- pedido;
- valor;
- forma de pagamento;
- recebimento assistido;
- troco;
- pendencias financeiras.

Pode executar:

- conferir pagamento;
- confirmar venda;
- recusar inconsistencia;
- registrar troco/acerto;
- finalizar venda.

Nao pode executar:

- transformar carrinho em pedido sem validacao;
- assumir conversa como atendimento principal;
- alterar producao sem rota.

Recebe alertas quando:

- ha pagamento pendente;
- atendimento registrou recebimento assistido;
- venda precisa conferencia.

Muda de dominio quando:

- pagamento e confirmado;
- pendencia volta para Atendimento/Gerente;
- pedido segue entrega/retirada.

### Delivery / Motoboy

Precisa enxergar:

- pedido pronto;
- endereco;
- cliente;
- status;
- observacoes;
- agrupamento de entrega.

Pode executar:

- assumir rota;
- confirmar saida;
- confirmar entrega;
- sinalizar problema.

Nao pode executar:

- alterar carrinho;
- confirmar pagamento fora da regra de Caixa;
- mudar pedido base.

Recebe alertas quando:

- pedido esta pronto;
- entrega agrupada deve aguardar complemento;
- cliente precisa contato.

Muda de dominio quando:

- entrega conclui;
- pagamento volta ao Caixa;
- problema volta ao Atendimento/Gerente.

### Sistema / OJC

Precisa enxergar:

- entidades vinculadas;
- estados;
- eventos;
- tempos;
- prioridade;
- rastreabilidade.

Pode executar:

- criar/recuperar sessao;
- registrar evento append-only;
- atualizar estado;
- sinalizar abandono;
- conectar conversa, sessao, cliente e pedido;
- acionar alertas.

Nao pode executar:

- inventar Pedido sem contrato;
- apagar historico;
- substituir validacao humana quando exigida.

Recebe alertas quando:

- canal falha;
- sessao fica parada;
- transicao obrigatoria nao ocorre;
- entidade fica sem vinculo minimo.

Muda de dominio quando:

- evento exige responsavel humano;
- Pedido nasce;
- ROR assume.

## Fluxos Obrigatorios de Homologacao

1. Cliente abre link do catalogo.
2. Sessao e criada ou recuperada.
3. Cliente navega categorias/produtos.
4. Cliente abre ficha do produto.
5. Cliente adiciona item ao carrinho.
6. Cliente altera quantidade/remove item.
7. Cliente pede ajuda.
8. Central recebe demanda.
9. Atendente assume sessao.
10. Cliente abandona carrinho.
11. Central ve carrinho abandonado.
12. Carrinho vira intencao de pedido.
13. Atendente valida dados.
14. Pedido operacional e criado.
15. Pedido segue para Producao/Separacao.
16. Recebimento assistido e registrado quando aplicavel.
17. Caixa confirma pagamento.
18. Cliente acompanha status.
19. Cliente faz pedido complementar.
20. Sessao e encerrada.

## Criterios de Estado de `sessoesCatalogo`

### aberta

Condicao de entrada: cliente abre link e a sessao e criada ou recuperada.

Condicao de saida: cliente navega, abandona ou sessao encerra.

Evento esperado: `catalogo_aberto`.

Impacto na Central: nao deve aparecer como alerta por padrao.

Bloqueios de transicao: nao pode criar Pedido; nao pode gerar carrinho sem item.

### navegando

Condicao de entrada: cliente visualiza categoria/produto sem carrinho relevante.

Condicao de saida: adiciona item, pede ajuda, abandona ou encerra.

Evento esperado: `produto_visualizado`.

Impacto na Central: baixo; aparece apenas como contexto quando aplicavel.

Bloqueios de transicao: nao pode acionar Producao/Caixa/Delivery.

### carrinho_iniciado

Condicao de entrada: primeiro item e adicionado.

Condicao de saida: ajuda solicitada, atendimento assume, abandono ou conversao em intencao.

Evento esperado: `item_adicionado_carrinho`.

Impacto na Central: aparece como Carrinho quando relevante.

Bloqueios de transicao: nao pode virar Pedido sem validacao OJC/ROR.

### ajuda_solicitada

Condicao de entrada: cliente toca Ajuda ou falha exige suporte.

Condicao de saida: IA/Humano assume, sessao abandona ou encerra.

Evento esperado: `ajuda_solicitada`.

Impacto na Central: deve gerar demanda visivel em IA/Humano.

Bloqueios de transicao: ajuda nao pode ficar invisivel para a Central.

### em_atendimento

Condicao de entrada: IA/Humano assume a sessao.

Condicao de saida: carrinho abandonado, intencao validada, pedido criado ou sessao encerrada.

Evento esperado: `sessao_assumida`.

Impacto na Central: deve aparecer vinculada a conversa/cliente ativo.

Bloqueios de transicao: responsavel nao pode ser indefinido.

### carrinho_abandonado

Condicao de entrada: sessao com carrinho fica parada alem do parametro configurado.

Condicao de saida: cliente retoma, operador assume ou sessao encerra.

Evento esperado: `carrinho_abandonado`.

Impacto na Central: deve aparecer como alerta limpo.

Bloqueios de transicao: abandono nao pode criar Pedido nem Venda.

### convertido_em_pedido

Condicao de entrada: carrinho validado, dados conferidos e Pedido operacional criado/vinculado.

Condicao de saida: acompanhamento de status ou encerramento.

Evento esperado: `pedido_criado_a_partir_catalogo`.

Impacto na Central: deixa de ser carrinho ativo e passa a contexto de Pedido.

Bloqueios de transicao: nao pode converter sem Pedido real e rastreavel.

### encerrada

Condicao de entrada: pedido convertido, desistência, cancelamento, encerramento manual ou timeout.

Condicao de saida: nova jornada futura.

Evento esperado: `sessao_encerrada`.

Impacto na Central: sai de alertas ativos e permanece no historico.

Bloqueios de transicao: nao pode apagar historico nem perder vinculos.

## Eventos OJC a Validar

### `catalogo_aberto`

Quando ocorre: abertura do link publico ou link enviado pela Central.

Dados minimos: unit, origem, timestamp, identificador disponivel, token de sessao quando houver.

Quem dispara: Sistema/OJC.

Quem consome: Catalogo, OJC, Central quando relevante, relatorios.

Como auditar: verificar existencia do evento e vinculo com sessao.

### `sessao_catalogo_criada`

Quando ocorre: criacao ou recuperacao oficial da sessao.

Dados minimos: sessaoId, unit, canalOrigem, clienteId opcional, telefone opcional, conversaId opcional.

Quem dispara: Sistema/OJC.

Quem consome: Catalogo, Central, relatorios.

Como auditar: comparar sessao ativa com evento inicial.

### `produto_visualizado`

Quando ocorre: cliente abre ficha ou detalhe de produto.

Dados minimos: sessaoId, produtoId, categoriaId, timestamp.

Quem dispara: Catalogo.

Quem consome: OJC, relatorios futuros.

Como auditar: conferir trilha da sessao.

### `item_adicionado_carrinho`

Quando ocorre: cliente ou atendente adiciona item.

Dados minimos: sessaoId, produtoId, categoriaId, quantidade, variacaoId quando houver, complementos selecionados, observacao do item, nomeSnapshot, descricaoSnapshot, precoSnapshot, subtotalSnapshot, unit e imagemSnapshot quando aplicavel.

Quem dispara: Catalogo ou Atendimento assistido.

Quem consome: OJC, Central, relatorios.

Como auditar: conferir evento contra snapshot/itens do carrinho.

### `item_removido_carrinho`

Quando ocorre: item sai do carrinho.

Dados minimos: sessaoId, produtoId/itemId, quantidade anterior, timestamp.

Quem dispara: Cliente ou Atendente.

Quem consome: OJC e relatorios.

Como auditar: conferir que o item saiu sem apagar historico.

### `quantidade_alterada`

Quando ocorre: quantidade de item muda.

Dados minimos: sessaoId, itemId/produtoId, quantidade anterior, nova quantidade.

Quem dispara: Cliente ou Atendente.

Quem consome: OJC, Central quando carrinho estiver em atendimento.

Como auditar: comparar evento com estado final do carrinho.

### `ajuda_solicitada`

Quando ocorre: cliente pede ajuda no catalogo.

Dados minimos: sessaoId, unit, canal, cliente/telefone quando houver, motivo opcional, timestamp.

Quem dispara: Cliente via Catalogo.

Quem consome: Central, IA/Humano, Gerente quando critico.

Como auditar: evento precisa gerar demanda visivel.

### `sessao_assumida`

Quando ocorre: IA/Humano/Gerente assume sessao.

Dados minimos: sessaoId, operadorId ou tipo IA, perfil, timestamp.

Quem dispara: Central/OJC.

Quem consome: Central, OJC, auditoria.

Como auditar: responsavel da sessao deve bater com evento.

### `carrinho_abandonado`

Quando ocorre: carrinho parado acima do parametro.

Dados minimos: sessaoId, tempo parado, quantidadeItens, valorEstimado, timestamp.

Quem dispara: Sistema/OJC.

Quem consome: Central, Gerente, relatorios.

Como auditar: conferir tempo configurado e alerta gerado.

### `carrinho_convertido_em_intencao`

Quando ocorre: carrinho passa para validacao de pedido.

Dados minimos: sessaoId, clienteId/telefone, itens, valorEstimado, modalidade, operador quando houver.

Quem dispara: Atendente ou Sistema/OJC apos confirmacao.

Quem consome: Atendimento, Venda/Pedido.

Como auditar: nao pode haver Pedido sem esta etapa ou equivalente aprovado.

### `pedido_criado_a_partir_catalogo`

Quando ocorre: Pedido operacional nasce a partir da sessao.

Dados minimos: sessaoId, pedidoId, conversaId opcional, clienteId opcional, operadorId, timestamp.

Quem dispara: Venda/Pedido ou OJC por contrato aprovado.

Quem consome: Central, Pedido, Producao, Caixa, Delivery, relatorios.

Como auditar: Pedido deve existir e estar vinculado.

### `pedido_complementar_solicitado`

Quando ocorre: cliente pede mais itens apos pedido existente.

Dados minimos: pedidoOriginalId, pedidoComplementarId quando criado, sessaoId, criterio usado, agrupamentoEntrega.

Quem dispara: Atendente/Sistema apos validacao.

Quem consome: Atendimento, Producao/Separacao, Delivery, Caixa.

Como auditar: pedidos permanecem separados e vinculados.

### `status_pedido_consultado`

Quando ocorre: cliente consulta status pelo WhatsApp, catalogo ou link.

Dados minimos: pedidoId, canal, statusExibido, timestamp.

Quem dispara: Cliente ou Sistema/OJC.

Quem consome: OJC e relatorios.

Como auditar: status exibido nao pode expor complexidade interna.

### `sessao_encerrada`

Quando ocorre: sessao fecha por conversao, desistencia, cancelamento ou regra de tempo.

Dados minimos: sessaoId, motivo, timestamp, pedidoId opcional.

Quem dispara: Sistema/OJC ou operador autorizado.

Quem consome: OJC, Central e relatorios.

Como auditar: sessao sai dos ativos, mas historico permanece.

## Cadastro Express / Completo

### Cadastro Express

Criterios minimos:

- nome ou identificacao simples;
- telefone;
- endereco somente se delivery;
- referencia/observacao quando necessario;
- consentimento/contexto operacional minimo quando aplicavel.

Suficiente quando:

- cliente esta em atendimento rapido;
- pedido e simples;
- retirada, balcao ou mesa nao exigem endereco completo;
- delivery tem endereco minimo suficiente;
- nao ha necessidade fiscal ou recorrencia detalhada.

Nao e suficiente quando:

- pedido exige CPF;
- endereco esta incompleto;
- ha restricao, conta, recorrencia ou relatorio que precise cadastro completo;
- gerente/unidade configurou exigencia maior.

### Cadastro Completo

Criterios minimos:

- nome completo;
- telefone;
- endereco completo;
- complemento;
- referencia;
- CPF quando necessario;
- observacoes;
- historico/recorrencia.

Suficiente quando:

- cliente recorrente precisa memoria operacional;
- delivery precisa endereco confiavel;
- pagamento/recebimento exige conferencia;
- relatorios e pos-venda dependem de dados completos.

## Identificador de Sessao

Regra de homologacao:

- WhatsApp: telefone normalizado e conversa sao identificadores fortes.
- Link enviado pela Central: conversa + token de sessao devem recuperar o contexto.
- Link publico: token de sessao deve ser gerado.
- Navegador/localStorage: permitido apenas como apoio temporario.
- Rastreabilidade operacional nunca depende somente do frontend.

Bloqueio: se a sessao nao puder ser auditada no backend, a jornada nao esta homologada.

## Abandono e Retomada

Criterios:

- carrinho vira abandonado quando sessao com itens fica parada alem do parametro configurado;
- tempo definitivo e parametro de negocio, nao valor fixo no MHO;
- abandono deve aparecer na Central quando houver impacto operacional;
- IA/Humano recebe alerta conforme prioridade, canal e perfil;
- cliente pode retomar se a sessao ainda estiver valida;
- sessao deve encerrar quando expirar, converter ou for encerrada por operador/sistema.

Bloqueio: carrinho abandonado invisivel para a Central quando deveria exigir acao.

## Pedido Editavel vs Pedido Complementar

Regra de homologacao:

- Se pedido existente ainda permite edicao, complementar no mesmo pedido.
- Se pedido ja esta em etapa que nao permite edicao, criar Pedido Complementar.
- Se entrega ainda nao saiu, perguntar se deseja agrupar entrega.

Sempre manter:

- rastreabilidade separada;
- eventos;
- vinculo com conversa/sessao;
- aviso para Producao/Separacao, Delivery e Caixa quando aplicavel.

Bloqueio: pedido complementar sem vinculo com pedido original ou sem evento.

## Recebimento Assistido

Criterios:

- Atendente pode registrar informacao de pagamento.
- Caixa confirma.
- Venda e dominio financeiro.
- Catalogo/Central nao fecham venda diretamente.
- Registro deve gerar pendencia clara para Caixa.

Dados minimos da pendencia:

- pedidoId;
- clienteId ou telefone;
- origem;
- operador que recebeu/informou;
- valor informado;
- forma informada;
- comprovante opcional;
- necessidade de troco;
- valor de troco quando houver;
- observacao;
- destino Caixa;
- status.

Bloqueio: pagamento confirmado fora do Caixa.

## Status para o Cliente

Canais:

- WhatsApp quando conversa existir;
- Catalogo quando sessao publica existir;
- link/status simplificado no futuro.

Status simples:

- recebido;
- em preparo;
- pronto;
- saiu para entrega;
- entregue;
- aguardando pagamento quando aplicavel.

Regra: nao expor estados internos, nomes tecnicos, ROR, OJC, CAO ou detalhes de producao que confundam o cliente.

## Integracoes que Nao Podem Quebrar

- Central homologada no commit `3852c4a`.
- Venda/Pedido como dominio operacional.
- Caixa como confirmador financeiro.
- Producao/Separacao como executora de Pedido.
- Delivery/Retirada/Balcao/Mesa como conclusao operacional.
- OJC como fonte de jornada.
- ROR como rota de item, pedido e etapa.
- RAW como contexto de operador, unidade, modo e configuracoes.
- RVL/RDS como consistencia visual.

## Criterios de Bloqueio

Bloqueiam aprovacao:

- Catalogo criando Pedido direto sem OJC/ROR.
- Carrinho confundido com Pedido.
- Pedido confundido com Venda.
- Central duplicando Producao/Caixa/Delivery.
- Cadastro real usando categorias de fallback como se fossem definitivas.
- Produto duplicado por tamanho, sabor, massa, volume ou complemento.
- Complemento modelado como produto novo sem contrato.
- Observacao salva como cadastro fixo do produto.
- Carrinho sem snapshot completo do item escolhido.
- Modelagem que bloqueia multiunidade futura.
- IA decidindo ou alterando catalogo/carrinho/pedido automaticamente.
- Status livre ou ambiguo sem DMI/MHO.
- Ausencia de eventos.
- Ausencia de rastreabilidade.
- Ajuda do catalogo sem aparecer na Central.
- Carrinho abandonado invisivel.
- Pedido complementar sem rastreabilidade.
- Pagamento confirmado fora do Caixa.
- Sessao dependente apenas de frontend/localStorage.
- Status para cliente expondo complexidade interna.
- Dados demonstrativos parecendo definitivos.

## Checklist de Homologacao

- DMI consultado.
- OJC-ME e OJC-UI consultados.
- ROR consultado.
- RAW considerado.
- RVL/RDS considerados.
- Perfis testados.
- Fluxos obrigatorios testados.
- Estados de `sessoesCatalogo` validados.
- Eventos append-only validados.
- Cadastro Express/Completo validado.
- Identificador de sessao validado.
- Abandono e retomada validados.
- Pedido complementar validado.
- Recebimento assistido validado.
- Status para cliente validado.
- Categorias homologadas validadas.
- Placeholders/fallbacks identificados como nao definitivos.
- Produto unico por item comercial validado.
- Variacoes validadas como variacoes.
- Complementos validados como complementos.
- Observacoes validadas no item/carrinho/pedido.
- Snapshot completo do carrinho validado.
- `unit`/multiunidade validado.
- Fallback visual validado como nao fonte real.
- IA validada como sugestiva, nao decisoria.
- Status operacionais fechados validados.
- Nenhum dominio duplicado.
- Build OK quando houver codigo.
- `git diff --check` OK quando houver alteracao.

## Fluxos Minimos para MVP

- abrir link do catalogo;
- criar/recuperar sessao;
- navegar categorias/produtos;
- abrir ficha;
- adicionar/remover/alterar item;
- persistir carrinho;
- pedir ajuda;
- Central receber ajuda;
- Atendente assumir sessao;
- converter carrinho em intencao;
- criar Pedido operacional por contrato;
- exibir status simples;
- encerrar sessao.

## Fluxos Futuros

- IA completa;
- pagamento online;
- fidelidade/promocoes inteligentes;
- relatorios avancados;
- rastreamento real do motoboy;
- personalizacao por cliente;
- blockchain/auditoria imutavel;
- link publico com campanhas;
- status publico completo;
- automacoes de retomada.

## Riscos

- Implementar frontend antes do contrato OJC.
- Criar schema sem eventos definidos.
- Reabrir Central homologada fora de escopo.
- Duplicar carrinho entre Catalogo e Central.
- Criar Pedido cedo demais.
- Misturar recebimento assistido com venda finalizada.
- Deixar abandono invisivel.
- Perder rastreabilidade do cliente anonimo.

## Pendencias

- Definir campos finais do Cadastro Express/Completo por modalidade.
- Definir identificador de sessao por origem.
- Definir tempos de abandono e retomada por unidade/perfil.
- Definir tabela/contrato de eventos append-only.
- Definir regra objetiva de pedido editavel vs Pedido Complementar.
- Definir status para cliente fora do WhatsApp.
- Definir contrato do recebimento assistido com Caixa.
- Definir MHO visual do Catalogo publico quando a tela for implementada.
- Definir modelagem final de Produto, Variacao e Complemento.
- Definir contrato de categorias homologadas para cadastro real.
- Definir disponibilidade, preco e visibilidade por unidade.
- Definir schema/contrato de snapshot completo do carrinho.
- Definir observacoes por item e seu caminho ate o Pedido.
- Definir politica de fallback visual vs fonte real.
- Definir vocabulario fechado para qualquer novo status operacional.

## Criterios para Aprovar Implementacao

A implementacao so pode ser aprovada quando:

- o Catalogo cria ou recupera sessao rastreavel;
- carrinho persiste sem virar Pedido automaticamente;
- carrinho guarda snapshot completo do item escolhido;
- cadastro real usa categorias homologadas ou excecao formalmente aprovada;
- produto nao e duplicado por variacao;
- variacoes, complementos e observacoes seguem o contrato reconciliado;
- `unit`/multiunidade nao e bloqueado;
- fallback visual nao e tratado como fonte real;
- IA nao decide nem altera automaticamente;
- status operacionais usam vocabulario fechado;
- ajuda aparece na Central;
- Central assume sem duplicar outros dominios;
- Pedido nasce apenas apos validacao OJC/ROR;
- Caixa confirma financeiro;
- Producao/Separacao recebe Pedido;
- Delivery/Retirada/Balcao/Mesa seguem o pedido;
- eventos minimos sao auditaveis;
- status para cliente e simples;
- erros e bloqueios orientam o usuario sem termos tecnicos.
