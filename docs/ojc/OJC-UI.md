# OJC-UI — Visualização Operacional da Jornada do Cliente

Este documento define como a Máquina Oficial da Jornada do Cliente aparece ao operador.

A interface deve simplificar a jornada, não expor a complexidade técnica.

## Princípios

- Jornada governa a interface.
- Entidades não aparecem como estados principais.
- Conversa, Sessão, Pedido e Transferência aparecem como blocos de contexto.
- Memória do Cliente aparece sob demanda.
- CAO aponta para a Jornada.
- ISO apoia a leitura operacional.
- Blockchain não aparece como fluxo de tela; apenas como registro/auditoria quando necessário.

## Modelo de Tela

A Central de Atendimento deve priorizar:

```text
Comunicação Agora
→ Jornada Hoje
→ Conversas / Jornadas ativas
→ Cliente Atual
→ Próxima Ação
```

Detalhes ficam sob demanda:

- histórico;
- contas a receber em consulta;
- promoções;
- cashback futuro;
- pedidos anteriores;
- endereços;
- preferências;
- observações;
- restrições;
- encomendas.

## Estados Agrupados para o Operador

Para reduzir ruído, os 23 estados oficiais aparecem em grupos simples.

### Novo Contato

Estados técnicos:

- Jornada Iniciada;
- Comunicação Recebida;
- Conversa Nova.

Operador vê:

- cliente ou telefone;
- canal;
- última mensagem;
- tempo aguardando;
- prioridade.

Ações visíveis:

- assumir;
- responder;
- identificar cliente;
- transferir.

### Em Atendimento

Estados técnicos:

- Conversa Assumida;
- Cliente em Identificação;
- Cliente Identificado;
- Contexto Carregado;
- Ajuda Solicitada;
- Atendimento Assistido.

Operador vê:

- conversa;
- cliente atual;
- contexto resumido;
- próxima ação;
- CustomerTimeline disponível.

Ações visíveis:

- responder;
- vincular cliente;
- cadastro rápido;
- abrir histórico;
- iniciar sessão;
- transferir trabalho.

### Catálogo / Intenção de Compra

Estados técnicos:

- Sessão de Catálogo Criada;
- Sessão de Catálogo Ativa;
- Carrinho em Construção.

Operador vê:

- sessão;
- canal de origem;
- itens snapshot;
- valor estimado;
- ajuda solicitada;
- abandono possível.

Ações visíveis:

- enviar catálogo;
- assumir sessão;
- continuar atendimento;
- revisar carrinho;
- confirmar pedido.

### Confirmação

Estados técnicos:

- Pedido em Confirmação.

Operador vê:

- cliente;
- itens;
- entrega;
- observações;
- canal original;
- pendências antes da criação.

Ações visíveis:

- confirmar pedido;
- voltar ao carrinho;
- cancelar.

### Pedido em Operação

Estados técnicos:

- Pedido Criado;
- Produção em Andamento;
- Entrega em Andamento;
- Caixa / Pagamento.

Operador vê:

- número do pedido;
- status;
- responsável atual;
- próxima etapa;
- vínculo com conversa ou sessão.

Ações visíveis:

- acompanhar;
- informar cliente;
- transferir problema;
- consultar pagamento quando permitido.

### Transferido

Estados técnicos:

- Trabalho Transferido;
- Trabalho Aceito.

Operador vê:

- origem;
- destino;
- motivo;
- ação esperada;
- status de aceite;
- contexto completo.

Ações visíveis:

- aceitar;
- concluir;
- devolver;
- cancelar quando for origem.

### Pós-venda

Estados técnicos:

- Pós-venda.

Operador vê:

- pedido entregue;
- retorno do cliente;
- ocorrência se houver;
- histórico recente.

Ações visíveis:

- enviar mensagem;
- registrar retorno;
- transferir problema;
- encerrar jornada.

### Finalizada

Estados técnicos:

- Jornada Encerrada;
- Jornada Abandonada;
- Jornada Cancelada.

Operador vê:

- motivo;
- resumo;
- última ação;
- possibilidade de retomada quando aplicável.

Ações visíveis:

- reabrir;
- encerrar definitivamente;
- consultar histórico.

## CustomerTimeline

`CustomerTimeline` aparece como contexto permanente.

Ela deve estar disponível em qualquer etapa após identificação do cliente e parcialmente disponível por telefone antes disso.

Modo parcial:

- telefone normalizado;
- canal;
- conversa atual;
- sessões anteriores por telefone.

Modo completo:

- compras;
- contatos;
- pedidos;
- encomendas;
- promoções;
- contas a receber em consulta;
- preferências;
- observações;
- canais utilizados.

Filtros:

- período;
- produto;
- categoria;
- canal;
- unidade;
- operador;
- forma de pagamento;
- status.

Regra: a timeline informa, mas não governa o estado.

## CAO na Interface

CAO deve mostrar atenção por jornada, não por entidade isolada.

Exemplos:

- cliente aguardando resposta;
- ajuda solicitada;
- carrinho abandonado;
- transferência pendente;
- entrega atrasada;
- pagamento pendente;
- reclamação no pós-venda.

O operador deve conseguir abrir a Jornada diretamente a partir do CAO.

## ISO na Interface

ISO aparece como apoio contextual.

Exemplos:

- falha de WhatsApp afeta Comunicação Recebida;
- falha de catálogo afeta Sessão de Catálogo;
- falha de banco afeta Pedido Criado ou Caixa;
- falha de impressão afeta Produção.

Regra: ISO ajuda a explicar bloqueios, mas não substitui responsabilidade operacional.

## Blockchain na Interface

Blockchain aparece apenas quando houver necessidade de auditoria ou rastreabilidade.

Não deve poluir a operação diária.

Possíveis exibições:

- selo de evento registrado;
- trilha de auditoria;
- comprovante operacional;
- histórico imutável da jornada.

## Próxima Ação

Cada grupo visual deve exibir uma próxima ação clara.

Exemplos:

- Assumir conversa;
- Identificar cliente;
- Responder cliente;
- Enviar catálogo;
- Confirmar pedido;
- Aguardar produção;
- Informar entrega;
- Encerrar jornada.

## Simplificação Visual

A tela não deve mostrar todos os estados técnicos ao mesmo tempo.

Ela deve traduzir estados em linguagem operacional:

- Novo contato;
- Em atendimento;
- Catálogo;
- Confirmação;
- Pedido em operação;
- Transferido;
- Pós-venda;
- Finalizada.

## Regra de Implementação

Toda tela OJC deve:

- apresentar a Jornada como unidade principal;
- mostrar entidades como contexto;
- preservar o estado atual;
- oferecer próxima ação evidente;
- manter CustomerTimeline acessível sem roubar foco;
- respeitar RVL, RAW, CAO e ISO.
