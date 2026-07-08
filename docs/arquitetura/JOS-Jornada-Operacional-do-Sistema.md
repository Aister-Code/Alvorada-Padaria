# JOS — Jornada Operacional do Sistema

## Objetivo

Documentar a jornada operacional completa do RondonIA OS.

O sistema deve ser entendido como um ciclo contínuo:

```text
Login
↓
Centro de Operações
↓
Modo Operacional
↓
Módulo
↓
Jornada do Módulo
↓
Transferências
↓
Conclusão
↓
Centro de Operações
↓
Nova Jornada
↓
Logout
```

## Princípios Gerais

- Toda jornada começa no Centro de Operações.
- Toda jornada termina retornando ao Centro de Operações.
- Transferências mudam responsabilidade, não reiniciam a jornada.
- Customer Memory acompanha toda a operação.
- OJC governa as jornadas.
- CAO governa atenção.
- ISO governa saúde.
- ROR governa a rota operacional.
- RAW governa adaptação do operador.
- MOP governa perfis, permissões, modos operacionais e unidades.
- Login identifica a pessoa; Modo Operacional define o que ela faz agora.

## MacroJornada

### 1. Login

Objetivo: identificar o operador uma única vez.

Resultado:

- identidade validada;
- perfil base conhecido;
- unidade inicial definida;
- modos operacionais autorizados carregados.

Saída natural:

```text
Login → Centro de Operações
```

### 2. Centro de Operações

Objetivo: ser o ponto inicial, final e de retomada de toda operação.

O operador vê:

- Operação Agora;
- Jornada Hoje;
- módulos operacionais;
- ISO;
- Escala Operacional;
- Tema;
- Menu Geral;
- modo operacional atual;
- unidade atual.

Saída natural:

```text
Centro de Operações → Módulo
```

Retorno natural:

```text
Módulo concluído → Centro de Operações
```

### 3. Modo Operacional

Objetivo: representar o que o operador está fazendo agora.

Exemplos:

- Atendimento;
- Caixa;
- Venda Balcão;
- Delivery;
- Produção;
- Gerência;
- Estoque;
- Financeiro;
- Administração.

Regra:

```text
Usuário = quem a pessoa é.
Modo Operacional = o que ela está fazendo agora.
Unidade = onde ela está trabalhando.
```

### 4. Módulo

Objetivo: abrir uma jornada operacional específica.

Exemplos:

- Central de Atendimento;
- Venda;
- Caixa;
- Produção;
- Delivery;
- Estoque;
- Gestão;
- Usuários.

### 5. Jornada do Módulo

Objetivo: conduzir uma unidade de trabalho até conclusão, transferência ou abandono.

Toda jornada deve possuir:

- estado atual;
- responsável atual;
- próxima ação;
- contexto;
- origem;
- saída clara.

### 6. Transferências

Objetivo: mover responsabilidade entre perfis, setores ou operadores.

Regra:

- transferência não reinicia jornada;
- transferência preserva contexto;
- destino recebe ação esperada;
- CAO sinaliza a responsabilidade pendente.

### 7. Conclusão

Objetivo: encerrar a jornada sem pendências.

Critérios possíveis:

- pedido entregue;
- atendimento encerrado;
- pagamento resolvido;
- produção concluída;
- entrega concluída;
- transferência concluída;
- ocorrência registrada;
- tarefa finalizada.

### 8. Retorno

Após conclusão, abandono ou cancelamento, o operador retorna ao Centro de Operações.

```text
Conclusão → Centro de Operações → Nova Jornada
```

### 9. Logout

Objetivo: encerrar sessão do operador.

Logout não encerra automaticamente jornadas abertas.

Jornadas abertas devem permanecer com:

- responsável atual;
- status;
- prioridade;
- contexto;
- possibilidade de transferência ou retomada.

## Módulos

Toda entrada em módulo deve respeitar a MOP — Matriz Operacional de Perfis.

Antes de executar ações, o sistema deve considerar:

```text
Perfil Base
↓
Modo Operacional Atual
↓
Unidade Atual
↓
Ação
```

### Central de Atendimento

Objetivo: conduzir a jornada do cliente desde o contato até pedido, transferência, pós-venda ou encerramento.

Quem utiliza:

- Atendimento;
- Gerente;
- Delivery quando houver comunicação;
- Caixa em consulta ou transferência;
- Produção em casos de retorno ao cliente.

Entrada:

- mensagem recebida;
- atendimento presencial;
- telefone;
- catálogo digital;
- ajuda solicitada;
- transferência recebida.

Estados:

- novo contato;
- em atendimento;
- cliente em identificação;
- contexto carregado;
- catálogo ativo;
- ajuda solicitada;
- pedido em confirmação;
- pedido criado;
- transferido;
- pós-venda;
- encerrado;
- abandonado;
- cancelado.

Saída:

- jornada encerrada;
- pedido criado;
- transferência para outro perfil;
- abandono registrado.

Retorno ao Centro:

- após encerrar atendimento;
- após transferir responsabilidade;
- após iniciar pedido e deixar o fluxo com outro responsável.

Possíveis transferências:

- Atendimento → Caixa;
- Atendimento → Produção;
- Atendimento → Delivery;
- Atendimento → Gerente.

Relação com OJC:

- módulo principal da OJC;
- conversa, sessão, pedido e transferência são entidades governadas pela Jornada.

Relação com CAO:

- contato novo;
- ajuda solicitada;
- cliente aguardando resposta;
- transferência pendente;
- reclamação.

Relação com ISO:

- depende de canal de comunicação;
- depende de sincronização;
- depende de catálogo quando aplicável.

Relação com ROR:

- ao criar pedido, a rota operacional define próximas etapas.

Relação com RAW:

- muda comportamento conforme modo Atendimento, Gerência, Caixa ou Delivery.

### Venda

Objetivo: registrar pedido ou venda operacional.

Quem utiliza:

- Venda Balcão;
- Atendimento;
- Gerente;
- Caixa quando autorizado.

Entrada:

- cliente presencial;
- pedido iniciado pela Central;
- sessão de catálogo convertida;
- atendimento telefônico;
- venda rápida.

Estados:

- pedido aberto;
- itens adicionados;
- dados do cliente;
- dados de entrega;
- aguardando confirmação;
- enviado à produção;
- aguardando caixa;
- cancelado.

Saída:

- pedido criado;
- pedido enviado à produção;
- pedido enviado ao caixa;
- pedido cancelado.

Retorno ao Centro:

- após confirmar pedido;
- após cancelar;
- após transferir etapa.

Possíveis transferências:

- Venda → Produção;
- Venda → Caixa;
- Venda → Delivery;
- Venda → Atendimento.

Relação com OJC:

- pedido pode nascer de uma jornada de cliente;
- pedido não inicia jornada.

Relação com CAO:

- pedido parado;
- dados incompletos;
- exceção de rota;
- cancelamento.

Relação com ISO:

- depende de banco;
- pode depender de impressão e sync.

Relação com ROR:

- rota operacional aplicada por canal, grupo, produto e exceção.

Relação com RAW:

- modo Venda Balcão prioriza rapidez;
- modo Atendimento preserva contexto do cliente;
- modo Gerência permite exceções.

### Caixa

Objetivo: resolver pagamentos, fechamento e conferência financeira operacional.

Quem utiliza:

- Caixa;
- Gerente;
- Financeiro em consulta.

Entrada:

- pedido aguardando pagamento;
- venda balcão;
- transferência de atendimento;
- pendência financeira;
- fechamento parcial ou diário.

Estados:

- aguardando pagamento;
- pagamento em análise;
- pago;
- pagamento recusado;
- venda fechada;
- pendência registrada.

Saída:

- pagamento confirmado;
- pendência transferida;
- venda encerrada.

Retorno ao Centro:

- após fechar venda;
- após transferir pendência;
- após concluir conferência.

Possíveis transferências:

- Caixa → Atendimento;
- Caixa → Gerente;
- Caixa → Financeiro;
- Caixa → Delivery em exceções.

Relação com OJC:

- consulta e atualiza status financeiro de jornadas com pedido.

Relação com CAO:

- pagamento pendente;
- divergência;
- transferência financeira.

Relação com ISO:

- depende de banco;
- futuramente TEF;
- sincronização.

Relação com ROR:

- rota pode exigir caixa antes ou depois de produção/entrega.

Relação com RAW:

- modo Caixa registra auditoria financeira.

### Produção

Objetivo: preparar itens conforme rota operacional.

Quem utiliza:

- Produção;
- Gerente.

Entrada:

- pedido enviado à produção;
- item com rota produtiva;
- encomenda;
- transferência operacional.

Estados:

- aguardando produção;
- em produção;
- pronto;
- conferência;
- ocorrência;
- cancelado.

Saída:

- pronto para entrega;
- pronto para retirada;
- ocorrência transferida;
- cancelamento informado.

Retorno ao Centro:

- após atualizar status;
- após concluir fila;
- após transferir problema.

Possíveis transferências:

- Produção → Atendimento;
- Produção → Delivery;
- Produção → Gerente;
- Produção → Caixa quando houver impacto financeiro.

Relação com OJC:

- atendimento acompanha produção para informar cliente.

Relação com CAO:

- atraso;
- item parado;
- ocorrência;
- pedido crítico.

Relação com ISO:

- pode depender de impressão;
- depende de sync.

Relação com ROR:

- só recebe itens cuja rota inclui Produção.

Relação com RAW:

- modo Produção reduz foco em cliente e prioriza fila operacional.

### Delivery

Objetivo: conduzir entrega e contato de rota.

Quem utiliza:

- Delivery;
- Atendimento;
- Gerente.

Entrada:

- pedido pronto para entrega;
- rota criada;
- transferência de atendimento;
- ocorrência de entrega.

Estados:

- aguardando motoboy;
- em rota;
- entregue;
- não localizado;
- ocorrência;
- retornado.

Saída:

- entregue;
- ocorrência transferida;
- cliente informado;
- retorno ao caixa ou atendimento.

Retorno ao Centro:

- após entrega;
- após registrar ocorrência;
- após transferir problema.

Possíveis transferências:

- Delivery → Atendimento;
- Delivery → Caixa;
- Delivery → Gerente.

Relação com OJC:

- atualiza jornada do cliente no momento de entrega.

Relação com CAO:

- entrega atrasada;
- cliente não localizado;
- ocorrência crítica.

Relação com ISO:

- depende de comunicação;
- pode depender de integração futura de rota.

Relação com ROR:

- só entra se rota exigir delivery.

Relação com RAW:

- modo Delivery prioriza entregas e ocorrências.

### Estoque

Objetivo: controlar disponibilidade, inventário e insumos.

Quem utiliza:

- Estoque;
- Gerente;
- Produção em consulta.

Entrada:

- baixa operacional;
- reposição;
- conferência;
- alerta de falta;
- tarefa da Jornada Hoje.

Estados:

- item disponível;
- baixo estoque;
- ruptura;
- conferência;
- reposição;
- ajuste.

Saída:

- estoque atualizado;
- alerta resolvido;
- transferência para gerente ou produção.

Retorno ao Centro:

- após ajuste;
- após conferência;
- após transferência.

Possíveis transferências:

- Estoque → Gerente;
- Estoque → Produção;
- Estoque → Financeiro.

Relação com OJC:

- pode impactar promessa ao cliente.

Relação com CAO:

- ruptura;
- item crítico;
- divergência.

Relação com ISO:

- depende de banco e sync.

Relação com ROR:

- produto indisponível pode alterar rota ou bloquear venda.

Relação com RAW:

- modo Estoque prioriza conferência e disponibilidade.

### Gestão

Objetivo: acompanhar operação, exceções e decisões.

Quem utiliza:

- Gerente;
- Administração;
- Financeiro em recortes específicos.

Entrada:

- Centro de Operações;
- CAO;
- relatórios;
- exceções;
- transferências críticas.

Estados:

- operação normal;
- atenção;
- crítico;
- análise;
- decisão;
- encerrado.

Saída:

- decisão tomada;
- transferência criada;
- ajuste autorizado;
- acompanhamento encerrado.

Retorno ao Centro:

- após decisão;
- após delegar;
- após resolver exceção.

Possíveis transferências:

- Gerente → Atendimento;
- Gerente → Caixa;
- Gerente → Produção;
- Gerente → Delivery;
- Gerente → Estoque;
- Gerente → Financeiro.

Relação com OJC:

- gerente pode intervir em jornadas de cliente.

Relação com CAO:

- principal destino de críticas e importantes.

Relação com ISO:

- monitora saúde operacional.

Relação com ROR:

- autoriza exceções de rota.

Relação com RAW:

- modo Gerência pode assumir outros modos sem trocar identidade.

### Usuários / Administração

Objetivo: gerenciar acessos, operadores, permissões e suporte.

Quem utiliza:

- Gerente;
- Administração;
- Superadmin.

Entrada:

- solicitação de PIN;
- cadastro de operador;
- ajuste de permissão;
- suporte.

Estados:

- operador ativo;
- operador inativo;
- PIN pendente;
- permissão em revisão;
- suporte solicitado.

Saída:

- acesso liberado;
- acesso removido;
- solicitação resolvida.

Retorno ao Centro:

- após salvar alteração;
- após aprovar ou recusar.

Possíveis transferências:

- Administração → Gerente;
- Gerente → Administração;
- Usuários → Suporte.

Relação com OJC:

- indireta, por responsáveis e auditoria.

Relação com CAO:

- PIN pendente;
- acesso bloqueado;
- operador sem permissão.

Relação com ISO:

- depende de autenticação e banco.

Relação com ROR:

- sem relação direta.

Relação com RAW:

- define modos autorizados por operador.

## Perfis

### Atendimento

Início do turno:

- login;
- conferir modo Atendimento;
- abrir Central de Atendimento;
- verificar Comunicação Agora.

Operação principal:

- assumir jornadas;
- responder cliente;
- identificar cliente;
- usar Customer Memory;
- enviar catálogo;
- iniciar pedido;
- transferir trabalho.

Exceções:

- cliente crítico;
- reclamação;
- pagamento;
- produção atrasada;
- entrega problemática.

Encerramento:

- encerrar jornadas sem pendência;
- transferir o que não for do atendimento;
- retornar ao Centro.

### Caixa

Início do turno:

- login;
- modo Caixa;
- verificar pendências de pagamento.

Operação principal:

- receber vendas;
- validar pagamentos;
- fechar pedidos;
- registrar pendências.

Exceções:

- divergência de valor;
- pagamento recusado;
- cliente com pendência;
- autorização gerencial.

Encerramento:

- fechar fila;
- registrar pendências;
- retornar ao Centro.

### Produção

Início do turno:

- login;
- modo Produção;
- verificar fila produtiva.

Operação principal:

- preparar itens;
- atualizar status;
- sinalizar pronto;
- registrar ocorrência.

Exceções:

- item indisponível;
- atraso;
- erro de pedido;
- ajuste de rota.

Encerramento:

- concluir produção;
- transferir ocorrências;
- retornar ao Centro.

### Delivery

Início do turno:

- login;
- modo Delivery;
- verificar entregas.

Operação principal:

- assumir rota;
- atualizar saída;
- registrar entrega;
- comunicar ocorrência.

Exceções:

- cliente não localizado;
- endereço incorreto;
- atraso;
- retorno.

Encerramento:

- concluir entrega;
- informar atendimento ou caixa;
- retornar ao Centro.

### Estoque

Início do turno:

- login;
- modo Estoque;
- verificar alertas.

Operação principal:

- conferir itens;
- atualizar disponibilidade;
- registrar reposição;
- sinalizar ruptura.

Exceções:

- divergência;
- item crítico;
- impacto em produção ou venda.

Encerramento:

- concluir conferência;
- transferir pendências;
- retornar ao Centro.

### Gerente

Início do turno:

- login;
- modo Gerência;
- revisar Centro de Operações;
- verificar CAO e ISO.

Operação principal:

- monitorar operação;
- assumir modos autorizados;
- resolver exceções;
- autorizar ajustes;
- delegar transferências.

Exceções:

- cliente crítico;
- falha operacional;
- divergência financeira;
- ruptura de estoque;
- operador sem acesso.

Encerramento:

- validar pendências;
- concluir exceções;
- retornar ao Centro.

### Financeiro

Início do turno:

- login;
- modo Financeiro;
- verificar pendências financeiras.

Operação principal:

- consultar recebíveis;
- acompanhar fechamento;
- validar divergências;
- apoiar caixa e gerente.

Exceções:

- diferença de caixa;
- conta pendente;
- registro incorreto.

Encerramento:

- registrar análise;
- transferir exceções;
- retornar ao Centro.

### Administração

Início do turno:

- login;
- modo Administração;
- verificar acessos e suporte.

Operação principal:

- gerenciar operadores;
- permissões;
- configurações;
- suporte operacional.

Exceções:

- falha de acesso;
- permissão incorreta;
- bloqueio de operador.

Encerramento:

- concluir ajustes;
- retornar ao Centro.

## Encerramentos

Tipos de encerramento:

- concluído;
- transferido;
- abandonado;
- cancelado;
- pendente para outro perfil;
- encerrado por sistema;
- encerrado por gerente.

Toda jornada encerrada deve manter:

- estado final;
- responsável;
- contexto;
- motivo quando aplicável;
- eventos permanentes;
- vínculo com Customer Memory.

## Retorno ao Centro de Operações

O retorno ao Centro deve ser natural e previsível.

Exemplos:

```text
Atendimento encerra jornada
→ Centro de Operações
→ Nova jornada
```

```text
Produção conclui pedido
→ Centro de Operações
→ Próximo item
```

```text
Gerente transfere exceção
→ Centro de Operações
→ Monitoramento
```

## Pontos Cegos

- Falta entidade explícita `jornadasCliente`.
- Falta entidade geral para jornadas não ligadas a cliente.
- Falta política oficial de SLA por módulo.
- Falta regra para múltiplas unidades simultâneas.
- Falta definição de troca de modo operacional na interface.
- Falta trilha blockchain implementada.
- Falta política de reabertura de jornadas encerradas.
- Falta regra de encerramento automático por sistema.
- Falta padronizar como Customer Memory aparece fora da OJC.

## Sugestões Antes do Congelamento

1. Criar entidade conceitual ou técnica para Jornada Operacional geral.
2. Definir SLA por módulo, perfil e prioridade.
3. Definir matriz de modos operacionais autorizados.
4. Definir padrão de encerramento por módulo.
5. Definir quando CAO deve apontar para jornada, módulo ou operador.
6. Definir quais eventos serão registrados em blockchain.
7. Definir como RAW salva preferências por operador, unidade e modo.
8. Definir relação entre Jornada Operacional geral e OJC.

## Resultado Esperado

O colaborador deve conseguir:

```text
entrar no sistema
→ escolher ou manter contexto operacional
→ abrir uma jornada
→ executar a próxima ação
→ transferir responsabilidade quando necessário
→ concluir ou encerrar
→ voltar ao Centro de Operações
→ iniciar novo ciclo
→ sair do sistema ao fim do turno
```

O RondonIA OS deve se comportar como um ciclo operacional contínuo, não como um conjunto isolado de telas.
