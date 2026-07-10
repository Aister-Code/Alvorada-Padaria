# ROR — RondonIA Operational Routing

## Conceito

Rota Operacional define por quais setores, etapas ou responsáveis um item ou pedido deve passar.

Ela orienta o caminho operacional padrão, sem obrigar o operador a decidir manualmente a cada atendimento.

## Prioridade de Definição

A rota operacional deve respeitar esta ordem:

```text
Canal
↓
Grupo de Produto
↓
Produto
↓
Exceção do Pedido
```

## Regra Operacional

O operador trabalha com a rota padrão aplicada automaticamente.

Só altera a rota em caso de exceção.

Exceções devem ser explícitas, pontuais e vinculadas ao atendimento, item ou pedido específico.

## Exemplos

### Pizza Delivery

Rota:

```text
Produção
→ Conferência
→ Cestinha
→ Delivery
→ Caixa
```

Uso:

- pedido veio por canal delivery;
- produto pertence ao grupo pizzaria;
- exige produção;
- exige conferência;
- exige preparo de embalagem/cestinha;
- exige entrega;
- exige fechamento no caixa.

### Bebida Balcão

Rota:

```text
Conveniência
→ Caixa
```

Uso:

- venda presencial;
- produto pronto;
- não exige produção;
- não exige delivery.

### Pedido com Exceção

Rota padrão:

```text
Produção
→ Conferência
→ Cestinha
→ Delivery
→ Caixa
```

Exceção:

```text
Produção
→ Conferência
→ Delivery
→ Caixa
```

Uso:

- remove `Cestinha` apenas naquele atendimento;
- não altera o cadastro base do produto;
- não altera a rota padrão do grupo;
- não altera futuras vendas.

## Impactos

### OJC

A Jornada do Cliente passa a conhecer o caminho operacional esperado.

Isso permite indicar:

- próxima etapa;
- setor responsável;
- atraso;
- transferência necessária;
- exceção aplicada.

### Produção

Produção recebe apenas o que pertence à sua rota.

Itens que não exigem preparo não devem poluir a fila de produção.

### Delivery

Delivery entra na rota somente quando o canal, produto ou exceção exigir entrega.

### Caixa

Caixa aparece como etapa quando houver fechamento, pagamento, conferência financeira ou registro de venda.

### CAO

O Centro de Atenção Operacional pode apontar atrasos ou bloqueios por etapa da rota.

Exemplos:

- produção atrasada;
- conferência pendente;
- delivery sem responsável;
- caixa aguardando pagamento.

### Jornada Hoje

Jornada Hoje pode usar rotas para prever tarefas operacionais do dia.

Exemplos:

- encomendas com produção antecipada;
- entregas programadas;
- pedidos que exigem conferência extra.

### Transferências de Trabalho

Transferências passam a carregar contexto de rota.

Exemplo:

```text
Origem: Atendimento
Destino: Produção
Motivo: item exige preparo
Ação esperada: iniciar etapa Produção da rota
```

## Princípio

Exceção nunca altera cadastro base.

Toda exceção deve viver no contexto operacional em que foi aplicada:

- atendimento;
- sessão;
- item;
- pedido;
- jornada.

O cadastro base permanece íntegro para futuras operações.

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
