# OJC-ME — Máquina Oficial da Jornada do Cliente

Este documento congela a Máquina de Estados da Orquestração da Jornada do Cliente (OJC).

A Jornada é a fonte da verdade operacional.

## Princípios

- Pedido não inicia jornada.
- Entidades não são estados.
- Conversa, Sessão de Catálogo, Pedido e Transferência são entidades governadas pela Jornada.
- Memória do Cliente é contexto permanente, não estado.
- CAO aponta para a Jornada.
- ISO apoia a Jornada.
- Blockchain registra eventos da Jornada.
- Nenhuma tela OJC deve ser construída sem respeitar estes estados.

## Entidades Governadas

- `conversasWhatsApp`
- `mensagensWhatsApp`
- `sessoesCatalogo`
- `pedidos`
- `transferenciasTrabalho`
- futuras entidades de canal, pagamento, produção, entrega e pós-venda

## Contexto Permanente

`CustomerTimeline` é a memória operacional do cliente.

Ela acompanha a jornada em qualquer etapa, sem substituir eventos permanentes do sistema.

Informações previstas:

- compras;
- contatos;
- pedidos;
- encomendas;
- promoções;
- contas a receber em modo consulta;
- preferências;
- observações;
- canais utilizados.

Filtros previstos:

- período;
- produto;
- categoria;
- canal;
- unidade;
- operador;
- forma de pagamento;
- status.

## Estados Oficiais

### 01. Jornada Iniciada

Objetivo: registrar que um cliente entrou em contato por qualquer canal.

Responsável: sistema.

Operador vê: origem, canal, horário e identificador disponível.

Ações: assumir, ignorar se inválido, vincular cliente.

Próximos estados: Comunicação Recebida, Conversa Nova, Sessão de Catálogo Ativa.

Eventos: mensagem recebida, catálogo aberto, atendimento presencial, atendimento telefônico, canal futuro.

### 02. Comunicação Recebida

Objetivo: registrar a entrada operacional do cliente.

Responsável: atendimento.

Operador vê: canal, última interação e cliente conhecido ou não.

Ações: responder, assumir, identificar cliente, abrir histórico.

Próximos estados: Conversa Nova, Conversa Assumida.

Eventos: mensagem recebida, ligação recebida, interação no catálogo.

### 03. Conversa Nova

Objetivo: triagem inicial.

Responsável: atendimento ou gerente.

Operador vê: cliente, mensagem, tempo aguardando e prioridade.

Ações: assumir, transferir, marcar lida.

Próximos estados: Conversa Assumida, Trabalho Transferido, Jornada Abandonada.

Eventos: operador assume, transferência criada, tempo limite excedido.

### 04. Conversa Assumida

Objetivo: atendimento com responsável oficial.

Responsável: operador que assumiu.

Operador vê: histórico, cliente e próxima ação sugerida.

Ações: responder, identificar cliente, criar sessão, transferir.

Próximos estados: Cliente em Identificação, Cliente Identificado, Atendimento Assistido.

Eventos: conversa assumida, cliente identificado, ajuda solicitada.

### 05. Cliente em Identificação

Objetivo: confirmar quem é o cliente.

Responsável: atendimento.

Operador vê: telefone, nome informado e possíveis clientes encontrados.

Ações: vincular cliente existente, cadastro rápido, continuar sem cadastro.

Próximos estados: Cliente Identificado, Contexto Carregado.

Eventos: cliente selecionado, cliente criado, identificação ignorada.

### 06. Cliente Identificado

Objetivo: vincular a jornada a um cliente conhecido.

Responsável: atendimento.

Operador vê: nome, telefone, endereço e histórico resumido.

Ações: abrir contexto, iniciar sessão, responder, transferir.

Próximos estados: Contexto Carregado.

Eventos: cliente vinculado.

### 07. Contexto Carregado

Objetivo: entregar contexto operacional suficiente para decidir o próximo passo.

Responsável: atendimento.

Operador vê: pedidos recentes, sessão aberta, pendências e observações.

Ações: continuar sessão, criar sessão, iniciar pedido, transferir.

Próximos estados: Sessão de Catálogo Criada, Sessão de Catálogo Ativa, Atendimento Assistido.

Eventos: sessão encontrada, sessão criada, atendimento iniciado.

### 08. Sessão de Catálogo Criada

Objetivo: iniciar intenção de compra sem criar pedido.

Responsável: sistema ou atendimento.

Operador vê: canal, cliente, sessão e status inicial.

Ações: enviar catálogo, acompanhar, assumir.

Próximos estados: Sessão de Catálogo Ativa, Ajuda Solicitada, Jornada Abandonada.

Eventos: sessão criada, link enviado, cliente interage.

### 09. Sessão de Catálogo Ativa

Objetivo: cliente navega ou monta carrinho.

Responsável: cliente, com atendimento em observação.

Operador vê: itens snapshot, valor estimado e última atividade.

Ações: assumir, enviar ajuda, converter em pedido após confirmação.

Próximos estados: Carrinho em Construção, Ajuda Solicitada, Pedido em Confirmação, Jornada Abandonada.

Eventos: carrinho atualizado, ajuda solicitada, abandono detectado.

### 10. Ajuda Solicitada

Objetivo: cliente pediu suporte.

Responsável: atendimento.

Operador vê: motivo, contexto e carrinho quando houver.

Ações: assumir, responder, transferir.

Próximos estados: Atendimento Assistido, Trabalho Transferido.

Eventos: ajuda acionada, operador assume, transferência criada.

### 11. Atendimento Assistido

Objetivo: operador conduz a jornada.

Responsável: atendimento.

Operador vê: conversa, cliente, sessão e ações rápidas.

Ações: responder, montar pedido, transferir para caixa, produção, delivery ou gerente.

Próximos estados: Carrinho em Construção, Pedido em Confirmação, Trabalho Transferido.

Eventos: item adicionado, pedido iniciado, transferência criada.

### 12. Carrinho em Construção

Objetivo: intenção de compra com itens.

Responsável: cliente ou atendimento.

Operador vê: itens, observações, endereço e total estimado.

Ações: editar itens, confirmar dados, converter em pedido.

Próximos estados: Pedido em Confirmação, Jornada Abandonada.

Eventos: carrinho atualizado, confirmação iniciada, abandono detectado.

### 13. Pedido em Confirmação

Objetivo: validação final antes de criar pedido real.

Responsável: atendimento.

Operador vê: cliente, itens, entrega, observações e canal.

Ações: confirmar pedido, voltar ao carrinho, cancelar.

Próximos estados: Pedido Criado, Jornada Cancelada.

Eventos: cliente confirma, operador cancela, dados incompletos.

### 14. Pedido Criado

Objetivo: pedido entra no domínio operacional.

Responsável: atendimento inicialmente; depois produção, caixa ou delivery conforme fluxo.

Operador vê: número do pedido, status e vínculo com conversa/sessão.

Ações: acompanhar, transferir, informar cliente.

Próximos estados: Produção em Andamento, Caixa / Pagamento, Entrega em Andamento.

Eventos: pedido criado, pedido enviado à produção, pagamento solicitado.

### 15. Trabalho Transferido

Objetivo: passar responsabilidade formalmente.

Responsável: origem até aceite.

Operador vê: destino, motivo, ação esperada e contexto completo.

Ações: aceitar, cancelar, reenviar.

Próximos estados: Trabalho Aceito, Conversa Assumida, Atendimento Assistido.

Eventos: transferência criada, destino aceita, origem cancela.

### 16. Trabalho Aceito

Objetivo: destino assumiu responsabilidade.

Responsável: perfil ou operador destino.

Operador vê: contexto recebido, origem e próxima ação.

Ações: concluir, devolver, transferir novamente.

Próximos estados: Produção em Andamento, Caixa / Pagamento, Entrega em Andamento, Atendimento Assistido.

Eventos: transferência aceita, tarefa concluída, transferência devolvida.

### 17. Produção em Andamento

Objetivo: pedido está sendo preparado.

Responsável: produção.

Operador vê: status de produção.

Ações: atualizar status, avisar atendimento, transferir problema.

Próximos estados: Entrega em Andamento, Atendimento Assistido, Pós-venda.

Eventos: pedido em produção, pedido pronto, ocorrência de produção.

### 18. Entrega em Andamento

Objetivo: pedido saiu ou será entregue.

Responsável: delivery.

Operador vê: endereço, status e contato.

Ações: atualizar rota, informar cliente, transferir problema.

Próximos estados: Caixa / Pagamento, Pós-venda.

Eventos: saiu para entrega, entrega concluída, problema de rota.

### 19. Caixa / Pagamento

Objetivo: fechamento financeiro quando aplicável.

Responsável: caixa.

Operador vê: pedido, valor, forma e pendência.

Ações: registrar pagamento, sinalizar pendência, concluir.

Próximos estados: Pós-venda, Jornada Encerrada.

Eventos: pagamento pendente, pagamento confirmado, falha de pagamento.

### 20. Pós-venda

Objetivo: confirmar satisfação ou resolver pendência.

Responsável: atendimento.

Operador vê: pedido entregue, histórico e observações.

Ações: enviar mensagem, registrar retorno, encerrar.

Próximos estados: Jornada Encerrada.

Eventos: cliente responde, operador encerra, reclamação registrada.

### 21. Jornada Encerrada

Objetivo: atendimento concluído sem pendências.

Responsável: sistema ou operador.

Operador vê: resumo.

Ações: reabrir se necessário.

Próximos estados: Jornada Iniciada quando houver novo contato.

Eventos: encerramento manual, encerramento automático.

### 22. Jornada Abandonada

Objetivo: cliente parou sem concluir.

Responsável: atendimento ou sistema.

Operador vê: última ação, carrinho e tempo parado.

Ações: retomar, encerrar, transferir.

Próximos estados: Atendimento Assistido, Jornada Encerrada.

Eventos: timeout, retomada pelo cliente, encerramento.

### 23. Jornada Cancelada

Objetivo: encerramento por desistência, erro ou solicitação.

Responsável: operador.

Operador vê: motivo.

Ações: registrar motivo, encerrar.

Próximos estados: Jornada Encerrada.

Eventos: cancelamento confirmado.

## Fluxo Textual

```text
Contato recebido
→ Jornada Iniciada
→ Comunicação Recebida
→ Conversa Nova
→ Conversa Assumida
→ Cliente em Identificação
→ Cliente Identificado
→ Contexto Carregado
→ Sessão de Catálogo Criada ou Sessão de Catálogo Ativa
→ Ajuda Solicitada ou Carrinho em Construção
→ Atendimento Assistido
→ Pedido em Confirmação
→ Pedido Criado
→ Produção / Entrega / Caixa
→ Pós-venda
→ Jornada Encerrada
```

## Transferência de Trabalho

```text
Origem cria transferência
→ Destino recebe no CAO
→ Destino aceita
→ Responsabilidade muda
→ Destino conclui
→ Jornada continua no novo estado
```

A transferência deve carregar:

- origem;
- destino;
- motivo;
- ação esperada;
- cliente;
- conversa;
- sessão;
- pedido, se houver;
- prioridade;
- operador de origem;
- operador destino, se definido.

## CAO

O Centro de Atenção Operacional aponta para a Jornada.

Estados que podem gerar CAO:

- Conversa Nova;
- Ajuda Solicitada;
- Sessão de Catálogo Ativa com abandono;
- Pedido em Confirmação parado;
- Trabalho Transferido pendente;
- Produção em Andamento com problema;
- Entrega em Andamento com atraso;
- Caixa / Pagamento com pendência;
- Pós-venda com reclamação.

## ISO

O Índice de Saúde Operacional apoia a Jornada.

Dependências previstas:

- comunicação depende de canal;
- catálogo depende de disponibilidade do catálogo e sincronização;
- pedido depende de banco e sincronização;
- produção pode depender de impressão e sincronização;
- entrega pode depender de comunicação;
- caixa pode depender de banco e TEF futuro.

## Blockchain

Blockchain registra eventos permanentes da Jornada.

Não governa estados diretamente.

Eventos futuros elegíveis:

- jornada iniciada;
- cliente identificado;
- pedido criado;
- transferência criada;
- transferência aceita;
- pagamento confirmado;
- jornada encerrada.

## RAW

Pontos configuráveis futuramente:

- tempo de atraso por canal;
- tempo de abandono;
- prioridade por perfil;
- filtros da Central de Atendimento;
- regras de transferência;
- widgets visíveis;
- mensagens rápidas;
- preferências do operador.

## Regra de Implementação

Toda tela OJC deve:

- ler ou derivar seu comportamento a partir da Jornada;
- não transformar entidade em estado;
- não criar estado visual inexistente na máquina;
- manter a Memória do Cliente como contexto permanente.

## Consolidação Central de Atendimento — Conversas, Repasses e Recebimento Assistido

Padrões registrados:

- Resumo Retrátil: a faixa superior da Central de Atendimento deve ficar fechada por padrão, exibindo apenas ícones, números quando existirem e cor somente quando houver atividade.
- Carrinhos, Cardápio e Produtos são conceitos diferentes:
  - Carrinhos: acompanhamento operacional de carrinhos/sessões iniciadas, paradas ou pedindo ajuda.
  - Cardápio: ação enviada ao cliente dentro da conversa.
  - Produtos: consulta interna do atendente para preço, orçamento e composição futura de pedido.
- Repasses substituem `Transferências` na linguagem operacional da Central.
- Encaminhar é a ação direta na conversa para repassar trabalho a outro perfil/setor.
- Relatórios são contextuais à tela ativa e não ocupam vaga de módulo principal.

### Orçamento

Orçamento é ferramenta do Atendimento.

Fluxo previsto:

1. Atendente consulta Produtos.
2. Monta orçamento.
3. Envia orçamento ao cliente.
4. Se o cliente aceitar, converte em pedido ou adiciona a pedido existente quando permitido.
5. Se o pedido existente não puder ser editado, cria Pedido Complementar.

### Pedido Complementar e Entrega Agrupada

Se o cliente fizer novo pedido após pedido anterior:

- Pedido anterior editável: adicionar ao pedido existente.
- Pedido anterior não editável: criar Pedido Complementar.

Se o pedido anterior ainda não saiu para entrega, perguntar se o cliente aceita entregar junto.

Se aceitar:

- manter pedidos separados;
- criar vínculo de Entrega Agrupada;
- avisar Conferência, Delivery e Motoboy.

Avisos previstos:

- Conferência: `Aguardar pedido complementar.`
- Delivery: `Sai junto com pedido #...`
- Motoboy: `Levar pedidos vinculados juntos.`

Pedido complementar segue ROR própria. Cestinha só quando a rota exigir.

### Recebimento Assistido

Atendente pode registrar recebimento assistido, mas Caixa confirma.

Fluxo:

1. Operador informa/recebe valor.
2. Sistema cria pendência para Caixa.
3. Caixa confere.
4. Caixa confirma pagamento, troco, vale ou ajuste.
5. Venda é finalizada pelo Caixa.

Aplicável em Atendimento, Balcão, Mesa, Delivery, Motoboy e Gerente em modo operacional.

Pendência para Caixa deve carregar: pedidoId, clienteId, origem, operadorQueRecebeu, valorInformado, formaInformada, comprovante opcional, precisaTroco, valorTroco opcional, observação, destinoCaixa e status.

Status previstos: pendente_conferencia, conferido, recusado, troco_entregue, acerto_pendente e concluido.
