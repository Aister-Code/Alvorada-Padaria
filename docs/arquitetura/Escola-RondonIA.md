# Escola RondonIA

A Escola RondonIA é a camada de treinamento, orientação gradual e liberação de maturidade operacional do RondonIA OS.

Ela garante que o colaborador aprenda primeiro a jornada e depois a tela.

## Princípios

- Linguagem simples.
- Treinamento por tela.
- Treinamento por módulo.
- Trilha por perfil.
- Liberação gradual conforme maturidade.
- Complexidade só é liberada quando houver domínio operacional.
- O gerente acompanha o progresso da equipe.

## Linguagem Simples

Toda orientação deve usar o termo que o colaborador entende no dia a dia.

Exemplos:

- Usar `Agenda` quando for mais claro que `Jornada Hoje`.
- Usar `Pendências` quando for mais claro que `Notificações`.
- Usar `Atendimento` quando a função for central de recepção, mesmo que a origem seja WhatsApp.
- Evitar nomes técnicos quando o operador precisa decidir rápido.

Regra: o nome exibido pertence à operação, não à engenharia.

## Treinamento por Tela

Cada tela deve ter orientação mínima sobre:

- para que serve;
- quem usa;
- o que olhar primeiro;
- qual é a próxima ação;
- quais ícones aparecem;
- quais menus existem;
- quais funções pertencem a outros módulos;
- quais erros comuns podem acontecer.

## Treinamento por Módulo

Cada módulo deve possuir uma trilha operacional curta:

1. Objetivo do módulo.
2. Estado vazio.
3. Estado operacional completo.
4. Ação principal.
5. Exceções comuns.
6. Transferência de Trabalho quando aplicável.
7. Critérios de conclusão.

## Trilhas por Perfil

### Operador

- Login.
- Modo Operacional.
- Unidade.
- Módulo principal.
- Próxima ação.
- Ajuda contextual.

### Atendimento

- Central de Atendimento.
- Customer Memory resumida.
- Sessão de Catálogo.
- Transferência para Caixa, Produção, Delivery ou Gerência.

### Caixa

- Fila de pagamentos.
- Fechamento de venda.
- Pendências financeiras.
- Transferência de divergência.

### Produção

- Fila de produção.
- Status de item/pedido.
- Ocorrências.
- Sinalização de pronto.

### Delivery

- Entregas.
- Rota.
- Ocorrências.
- Transferência para Atendimento ou Gerência.

### Gerente

- Centro de Operações.
- MOP.
- RAW.
- ROR.
- OJC.
- CAO.
- ISO.
- Liberação gradual de módulos.
- Acompanhamento da aprendizagem.

## Atribuição de Aprendizagem

O gerente poderá futuramente atribuir treinamentos por:

- colaborador;
- perfil;
- modo operacional;
- unidade;
- módulo;
- erro recorrente;
- nova função liberada.

Cada aprendizagem pode ter:

- prazo;
- responsável;
- status;
- evidência de conclusão;
- confirmação do colaborador;
- observação do gerente.

## Progresso e Confirmação

O colaborador confirma conclusão quando entende:

- o objetivo da tela;
- os ícones principais;
- os menus;
- a próxima ação;
- o que fazer em exceção;
- quando transferir para outro módulo.

O gerente acompanha:

- pendente;
- em andamento;
- concluído;
- vencido;
- revisar.

## Sugestão Automática de Treinamento

O sistema poderá sugerir treinamento quando identificar:

- erro recorrente;
- dúvida frequente;
- uso incorreto de módulo;
- tentativa de executar função de outro módulo;
- função nova liberada;
- mudança de modo operacional;
- baixa maturidade em uma jornada.

## Função de Outro Módulo

Quando o operador procurar ou tentar executar algo que pertence a outro módulo, o sistema deve orientar com linguagem simples.

Exemplos:

- `Esta função pertence ao módulo Caixa.`
- `Solicite ao gerente ou transfira esta tarefa.`
- `Pagamento é responsabilidade do Caixa.`
- `Produção não altera valores. Transfira para Caixa ou Gerência.`

Regra: a orientação deve ensinar sem punir.

## Relação com DMI e MHO

Todo DMI deve prever:

- ajuda contextual;
- termos simples;
- funções de outros módulos;
- treinamento associado;
- maturidade necessária.

Todo MHO deve validar:

- se a linguagem é compreensível;
- se a ajuda explica a tela;
- se os ícones estão explicados;
- se a função de outro módulo orienta corretamente;
- se a Escola RondonIA está vinculada ao módulo.
