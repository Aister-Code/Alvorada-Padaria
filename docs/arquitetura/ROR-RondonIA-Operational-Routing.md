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
