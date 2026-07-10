# RIM — RondonIA Implementation Manual

Manual mestre de implementação do RondonIA OS.

Este documento define a ordem obrigatória de consulta antes de qualquer implementação, alteração visual ou homologação.

Referência superior: `docs/arquitetura/00-MAPA-MESTRE-RONDONIA-OS.md`.

## Ordem Obrigatória de Consulta

Antes de implementar qualquer tela, módulo, widget ou jornada, consultar nesta ordem:

1. `00-MAPA-MESTRE-RONDONIA-OS.md` — mapa mestre e regras globais.
2. RBG — RondonIA Builder Gate.
3. DHA — DNA Hereditário de Aplicação.
4. `docs/padroes/RondonIA-Visual-Language.md` — RVL.
5. `docs/arquitetura/RDS-RondonIA-Design-System.md` — RDS.
6. `docs/arquitetura/Componentes-Obrigatorios.md` — componentes obrigatórios.
7. `docs/arquitetura/RAW-RondonIA-Adaptive-Workspace.md` — modo operacional, unidade e preferências.
8. `docs/arquitetura/MOP-Matriz-Operacional-de-Perfis.md` — permissões e auditoria.
9. DMI do módulo em `docs/arquitetura/DMI/`.
10. MHO do módulo em `docs/arquitetura/MHO/`.
11. `docs/arquitetura/JOS-Jornada-Operacional-do-Sistema.md` — ciclo operacional.
12. `docs/arquitetura/ROR-RondonIA-Operational-Routing.md` quando houver rota.
13. `docs/ojc/OJC-ME.md` e `docs/ojc/OJC-UI.md` quando houver jornada de cliente.
14. `docs/arquitetura/Referencias-Big-Players.md` como referência de qualidade.
15. `docs/arquitetura/Sentimentos-da-Tela.md` para intenção emocional da tela.
16. `docs/arquitetura/Escola-RondonIA.md` para linguagem simples, ajuda contextual e liberação gradual.

Regra: se qualquer item obrigatório estiver indefinido, a implementação deve parar e voltar para arquitetura.

## 1. RBG — RondonIA Builder Gate

O RBG é o portão de arquitetura.

Antes de construir, responder:

- Qual jornada está sendo atendida?
- Qual perfil opera?
- Qual modo operacional está ativo?
- Qual unidade está ativa?
- Qual rota operacional se aplica?
- Quais dados são reais?
- Quais dados são placeholder?
- O que fica fora do MVP?
- Existe risco de duplicar domínio?
- Qual fase de implantação permite essa entrega?
- Qual maturidade do usuário/cliente é necessária?

## 2. DHA — DNA Hereditário de Aplicação

Toda tela herda antes de existir:

- Identidade do cliente.
- Paleta parametrizada.
- Logo oficial.
- Tipografia aprovada.
- Modo dia e modo noite.
- Linguagem operacional.
- Componentes obrigatórios.
- RVL.
- RDS.
- RAW.
- MOP.
- CAO.
- ISO.
- ROR quando houver rota.
- OJC quando houver cliente/jornada.

## 3. RVL — RondonIA Visual Language

O RVL governa expressão visual, planos, iconografia, comunicação editorial, contexto e indicadores.

Documento: `docs/padroes/RondonIA-Visual-Language.md`.

## 4. RDS — RondonIA Design System

O RDS executa tecnicamente a linguagem aprovada.

Documento: `docs/arquitetura/RDS-RondonIA-Design-System.md`.

## 5. RAW — RondonIA Adaptive Workspace

O RAW separa:

```text
Identidade -> Unidade Atual -> Modo Operacional Atual
```

Documento: `docs/arquitetura/RAW-RondonIA-Adaptive-Workspace.md`.

## 6. ROR — RondonIA Operational Routing

O ROR define a rota operacional de itens, pedidos e etapas.

Documento: `docs/arquitetura/ROR-RondonIA-Operational-Routing.md`.

## 7. OJC — Orquestração da Jornada do Cliente

A OJC governa conversas, sessões de catálogo, pedidos, transferências e memória do cliente pela Jornada.

Documentos:

- `docs/ojc/OJC-ME.md`.
- `docs/ojc/OJC-UI.md`.

## 8. JOS — Jornada Operacional do Sistema

A JOS descreve o ciclo contínuo do sistema.

Documento: `docs/arquitetura/JOS-Jornada-Operacional-do-Sistema.md`.

## 9. MOP — Matriz Operacional de Perfis

A MOP governa permissões, modos, unidades e auditoria.

Documento: `docs/arquitetura/MOP-Matriz-Operacional-de-Perfis.md`.

## 10. DMI por Módulo

Todo módulo deve consultar seu DMI antes de implementação.

Pasta: `docs/arquitetura/DMI/`.

Cada DMI deve conter:

- o que herda automaticamente;
- o que é específico do módulo;
- componentes obrigatórios;
- estados obrigatórios;
- modais obrigatórios;
- menus obrigatórios;
- regras de permissões;
- módulos opcionais relacionados;
- nível de implantação;
- nível de maturidade;
- checklist de implementação;
- checklist de homologação.

## 11. MHO por Módulo

Todo módulo deve consultar seu MHO antes de homologação.

Pasta: `docs/arquitetura/MHO/`.

Cada MHO deve conferir:

- herança da tela;
- header;
- menu;
- modo operacional;
- unidade;
- ISO;
- escala;
- tema;
- ajuda;
- troca de modo;
- troca de unidade;
- indicadores com ícone, número e label;
- modais no padrão;
- textos legíveis e acentuados;
- estado vazio;
- estado operacional completo;
- responsividade;
- permissões;
- módulos opcionais;
- fase de implantação;
- maturidade do usuário.

## 12. Biblioteca de Componentes Obrigatórios

Documento: `docs/arquitetura/Componentes-Obrigatorios.md`.

## 13. Biblioteca de Referências / Big Players

Documento: `docs/arquitetura/Referencias-Big-Players.md`.

## 14. Biblioteca de Sentimentos da Tela

Documento: `docs/arquitetura/Sentimentos-da-Tela.md`.

## 15. Implantação Gradual

Níveis oficiais:

- Fase 0: base.
- Fase 1: núcleo operacional.
- Fase 2: jornada assistida.
- Fase 3: controle.
- Fase 4: gestão.
- Fase 5: premium.

Regra: não liberar complexidade antes da maturidade operacional.

## 16. Checklists Obrigatórios

Os checklists finais estão no Mapa Mestre.

Documento: `docs/arquitetura/00-MAPA-MESTRE-RONDONIA-OS.md`.


## Linguagem Simples e Ajuda Contextual

Toda tela deve usar linguagem do dia a dia do operador.

Regras:

- Evitar nomes técnicos na interface.
- O nome exibido deve ser o termo que o colaborador entende.
- `Agenda` pode substituir `Jornada Hoje` quando for mais claro.
- `Pendências` é melhor que `Notificações` quando a função for operacional.
- `Atendimento` é melhor que `WhatsApp` quando a função for central de recepção.
- Ajuda contextual deve explicar tela, ícones, menus, etapa atual e limites do módulo.

A ajuda deve ser acessível pelo Menu da tela sempre que houver Menu Operacional.

## Funções de Outro Módulo

Quando o operador tentar executar algo que pertence a outro módulo, o sistema deve orientar:

- `Esta função pertence ao módulo Caixa.`
- `Solicite ao gerente ou transfira esta tarefa.`

Regra: orientar sem punir, preservando contexto e sugerindo transferência quando aplicável.

## Escola RondonIA

A Escola RondonIA governa treinamento por tela, módulo, perfil e maturidade.

Documento: `docs/arquitetura/Escola-RondonIA.md`.

## Relatórios Contextuais

Relatórios não são módulo principal quando servem apenas ao histórico do contexto ativo.

Regra:

- Toda tela ou contexto que puder gerar histórico deve oferecer `Relatórios` no menu contextual da tela ativa.
- O painel de relatórios deve abrir como contexto, não como tela cheia, salvo quando a complexidade justificar.
- A primeira visão deve ser simples, com filtros curtos por período, atividade, operador/atendente, canal, status e transferências quando aplicável.
- Relatório contextual não substitui módulos de Gestão, Financeiro ou Administração.

Na Central de Atendimento, `Relatórios` pertence ao menu de `Conversas`.

## Central de Atendimento — Padrão Conversas

A tela principal da Central de Atendimento deve seguir linguagem WhatsApp/RondonIA:

- Header mostra apenas o contexto ativo, por exemplo `CONVERSAS`.
- Subtítulo de módulo aparece somente na abertura do módulo, não nas telas internas.
- Dock inferior representa módulos operacionais, não abas internas.
- Contextos internos como Pedidos, Clientes e Agenda ficam como atalhos compactos da área Atendimento.
- Filtros superiores não usam caixas fixas; cor e número aparecem somente quando houver atividade.
- Cada conversa deve caber em até três linhas: identificação, mensagem pendente e ações compactas/chat.
- Origem do contato é comunicada no avatar; urgência é comunicada no contorno.

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

## Ajuste Final — Conversas WhatsApp/RondonIA

Regras complementares aprovadas:

- O Resumo Superior é dinâmico: IA e Humano permanecem fixos; Carrinhos, Repasses e outros indicadores sobem ou descem conforme quantidade e prioridade.
- A linha superior é retrátil; quando fechada, mostra somente ícones e números quando houver atividade.
- A linha inferior permanece sempre visível.
- O destaque/pulso acontece somente no ícone que recebeu nova atividade.
- A alça retrátil da dock deve sinalizar alertas ocultos quando módulos recolhidos tiverem pendência, atenção ou crítica.
- O avatar da conversa deve ficar centralizado verticalmente em relação às três linhas do item.
- O carrinho compacto fica à esquerda do campo de mensagem e mostra apenas quantidade no estado compacto.
- O Cardápio mostra símbolo + texto quando o chat está fechado e apenas símbolo quando o chat está aberto.
