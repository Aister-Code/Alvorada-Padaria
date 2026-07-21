# RondonIA Apps - Projeto Mestre

## Sumario

1. [Finalidade](#1-finalidade)
2. [RondonIA Apps](#2-rondonia-apps)
3. [ERP Alvorada](#3-erp-alvorada)
4. [Principios arquiteturais](#4-principios-arquiteturais)
5. [Stack tecnica](#5-stack-tecnica)
6. [DNA da RondonIA Apps](#6-dna-da-rondonia-apps)
7. [Dominios da plataforma](#7-dominios-da-plataforma)
8. [Modulos e status](#8-modulos-e-status)
9. [Decisoes vigentes](#9-decisoes-vigentes)
10. [Roadmap](#10-roadmap)
11. [Pendencias](#11-pendencias)
12. [Checkpoints](#12-checkpoints)
13. [Como continuar](#13-como-continuar)
14. [Governanca](#14-governanca)
15. [Glossario](#15-glossario)

## 1. Finalidade

Este documento e o mapa mestre arquitetural do projeto RondonIA Apps / ERP
Alvorada. Ele existe para orientar novas conversas, Codex, Hercules, futuros
desenvolvedores e auditorias.

Ele nao e uma transcricao da conversa e nao substitui documentos
especializados. A fonte da verdade continua sendo o repositorio, os dados
persistidos quando existirem e os documentos homologados.

Use este arquivo como indice de leitura, ponto de retomada e registro de
governanca. Para o estado operacional atual, leia primeiro
[Contexto Atual](Projeto/CONTEXTO-ATUAL-ALVORADA.md). Para uma nova conversa,
use [Retomada de Contexto](Projeto/RETOMADA-NOVA-CONVERSA.md).

## 2. RondonIA Apps

RondonIA Apps e a plataforma operacional que esta sendo formada a partir do
ERP Alvorada. O Alvorada e o primeiro produto de referencia, mas as decisoes
devem evitar acoplamento indevido ao cliente inicial quando a regra for de
plataforma.

Principios confirmados:

- evoluir por modulos, com DMI/MHO antes de implementacoes relevantes;
- preservar dominios e fronteiras operacionais;
- usar IA como camada sugestiva, assistiva e auditavel, sem decisao automatica
  sobre catalogo, carrinho, pedido, venda ou pagamento;
- reaproveitar linguagem visual, operacional e arquitetural para outros
  nichos sem apagar particularidades da Alvorada.

Fontes: [Mapa Mestre RondonIA OS](00-MAPA-MESTRE-RONDONIA-OS.md),
[RAW](RAW-RondonIA-Adaptive-Workspace.md),
[ROR](ROR-RondonIA-Operational-Routing.md), [OJC-ME](../ojc/OJC-ME.md).

## 3. ERP Alvorada

O produto de referencia atende a Alvorada Padaria, com matriz/filial,
padaria, lanchonete e pizzaria, operacao diurna e noturna, atendimento por
canais como WhatsApp e operacao interna por perfis.

Perfis e dominios ja recorrentes:

- gerente;
- atendente;
- venda/balcao;
- caixa;
- producao/separacao;
- delivery;
- estoque;
- administracao de usuarios;
- cliente no cardapio digital.

O papel do sistema e reduzir atrito operacional, preservar historico,
organizar jornadas e evitar que uma tela vire deposito de informacao sem
proxima acao clara.

## 4. Principios arquiteturais

Principios vigentes, com fontes especializadas:

| Principio | Regra vigente | Fonte |
| --- | --- | --- |
| Banco como fonte da verdade | Estado operacional persistido prevalece sobre mock/fallback. | [CATALOG-MODEL](Catalogo/CATALOG-MODEL-ALVORADA-001.md), [DMI Catalogo](DMI/DMI-Jornada-Cliente-Catalogo-Digital.md) |
| Pedido nasce persistido | Pedido operacional tem numero, estado e snapshots; nao nasce como carrinho visual. | [DMI Venda](DMI/DMI-Venda.md), [MHO Venda](MHO/MHO-Venda.md) |
| Pedido != Venda | Pedido e execucao operacional; Venda/Caixa fecha financeiro. | [DMI Catalogo](DMI/DMI-Jornada-Cliente-Catalogo-Digital.md), [MHO Catalogo](MHO/MHO-Jornada-Cliente-Catalogo-Digital.md) |
| Carrinho != Pedido | Carrinho e intencao; pedido depende de contrato OJC/ROR. | [DNA Cardapio](UX/DNA-Cardapio-Digital-Aprovado.md) |
| Catalogo != Carrinho != Pedido != Producao != Venda | Cada dominio tem responsabilidade propria. | [DMI Catalogo](DMI/DMI-Jornada-Cliente-Catalogo-Digital.md) |
| Append-only quando fizer sentido | Eventos de jornada e historico sensivel devem preservar rastreabilidade. | [OJC-ME](../ojc/OJC-ME.md), [CATALOG-MODEL](Catalogo/CATALOG-MODEL-ALVORADA-001.md) |
| Snapshots historicos | Conversao/carrinho/pedido preservam dados da epoca. | [CATALOG-MODEL](Catalogo/CATALOG-MODEL-ALVORADA-001.md) |
| Sem hard delete operacional | Entidades usadas operacionalmente nao devem desaparecer do historico. | [CATALOG-MODEL](Catalogo/CATALOG-MODEL-ALVORADA-001.md) |
| documentKey estavel | Chave documental nao depende de nome/slug e nao deve ser reutilizada. | [M-003.M1](Catalogo/M-003.M1-Schema-e-Contratos.md), [CATALOG-MODEL](Catalogo/CATALOG-MODEL-ALVORADA-001.md) |
| Compatibilidade de transicao | Campo legado pode conviver com modelo novo se protegido. | [M-003.M2](Catalogo/M-003.M2-Catalogo-Mestre-e-Opcoes.md) |
| Sem preco inventado | Valor pendente nao vira zero, minimo ou estimativa decisoria. | [CATALOG-INSTANCE](Catalogo/CATALOG-INSTANCE-ALVORADA-001.md) |
| Arquitetura antes da implementacao | DMI/MHO/Plano precedem mudancas de dominio. | [Mapa Mestre](00-MAPA-MESTRE-RONDONIA-OS.md) |

## 5. Stack tecnica

Confirmado no repositorio atual:

- React;
- Vite;
- TypeScript;
- Tailwind;
- Convex;
- rotas publicas `/cardapio` e `/catalogo` para Catalogo Digital;
- branch de trabalho atual: `feature/m005-caixa`;
- ultimo commit confirmado: `d4fdffc - feat: implementar catalogo mestre e opcoes`;
- uso de Hercules/Codex como apoio de revisao e implementacao, com retorno
  documentado quando solicitado.

Nao transformar detalhes temporarios de preview, fallback ou ambiente local em
regra permanente sem fonte homologada.

## 6. DNA da RondonIA Apps

O DNA combina RIA-DS/RDS, RVL, RAW, ROR, OJC e validacao visual real.

Regras vigentes:

- premium e polido, sem ruido visual;
- super clean, denso quando a tarefa for operacional;
- percepcao do usuario acima de metricas isoladas;
- alinhamento optico e reguas visuais quando necessario;
- referencia WhatsApp Android para margens, toque, conversa e docks;
- modais compactos, contextuais e fechando ao clicar fora quando aprovado;
- tipografia escalavel `aa`, `Aa`, `AA` no Cardapio Digital;
- screenshots reais como evidencia de homologacao visual.

Diferenciar sempre:

- principio permanente de plataforma;
- decisao especifica de uma tela;
- experimento ainda pendente.

Fontes: [RondonIA Visual Language](../padroes/RondonIA-Visual-Language.md),
[RDS](RDS-RondonIA-Design-System.md), [DNA Cardapio](UX/DNA-Cardapio-Digital-Aprovado.md),
[Prancha M-003](UX/Prancha-Validacao-Visual-M003-Catalogo-Digital.md).

## 7. Dominios da plataforma

| Dominio | Responsabilidade | Fronteiras |
| --- | --- | --- |
| Autenticacao | Login, operador, unidade e acesso. | Nao decide venda, caixa ou catalogo. |
| Gestao | Centro operacional, agenda, menus, usuarios e configuracoes. | Nao duplica fluxo de atendimento ou venda. |
| Catalogo | Vitrine, cadastro mestre, produtos, opcoes e disponibilidade. | Nao cria pedido direto. |
| Cliente/OJC | Sessao, jornada, ajuda, abandono, retomada e conversao futura. | Nao fecha venda sem ROR/Venda/Caixa. |
| Atendimento | Conversa, triagem, respostas, repasse e contexto. | Nao duplica Caixa/Producao/Delivery. |
| Pedido | Entidade operacional validada. | Nao e venda financeira. |
| Producao | Execucao/separacao de itens do pedido. | Recebe pedido, nao carrinho. |
| Venda | Abertura operacional de atendimento/pedido no balcao. | Nao substitui Caixa. |
| Caixa | Recebimento, venda financeira, pagamento e conta a receber. | Nao recalcula catalogo. |
| Estoque/Compras | Futuro controle de insumos, origem e CMV. | Depende da origem produto produzido/revendido/misto. |
| Delivery | Entrega, retirada e conclusao operacional. | Nao fecha pagamento sozinho. |
| IA | Sugestao, triagem, auditoria e apoio. | Nao decide nem altera dado critico sem contrato. |

## 8. Modulos e status

| Modulo | Objetivo | Status atual | Proximo marco |
| --- | --- | --- | --- |
| M-001 Login Geral | Entrada operacional por operador/perfil. | Implementado em base operacional; padrao documentado. | Manter compatibilidade com novos perfis. |
| M-002 Painel do Gerente | Tela principal do gerente, agenda, dock e menu. | Refinado visualmente; ha pendencia local antiga em `DashboardMenu.tsx`. | Nao misturar com M-003.M2. |
| M-002.1 Usuarios | Operadores e acessos. | DMI/MHO existentes; UI presente em dashboard. | Evoluir quando houver demanda propria. |
| M-003 Catalogo Digital | Cardapio publico, catalogo real e jornada cliente. | CATALOG-INSTANCE e CATALOG-MODEL homologados; M1/M1.5 e M2 commitadas/enviadas. | Iniciar M3 somente apos autorizacao. |
| M-004 Venda Balcao | Abertura e itens de pedido operacional. | Implementado legado com Convex; separado de Caixa. | Integracao futura com catalogo estruturado via contrato. |
| M-004.1 / M-004.2 | Acompanhamento/operacionalizacao associada ao pedido. | Codigo de acompanhamento existe; detalhamento depende docs locais. | Confirmar fronteiras antes de alterar. |
| M-005 Caixa | Recebimento financeiro. | Branch atual carrega nome `feature/m005-caixa`; DMI/MHO existem. | Nao misturar com Catalogo sem ROR. |
| M-006 Central de Atendimento | Conversas/WhatsApp, repasse e chat. | Homologada em commits `abb171b` e `3852c4a`; ha pendencia local antiga em `whatsapp/page.tsx`. | Preservar sem reabrir fora de pedido especifico. |

### Estado especifico M-003

- CATALOG-INSTANCE homologado documentalmente em `efc2f4e`.
- CATALOG-MODEL homologado documentalmente em `1c4b377`.
- M-003.M1 e M-003.M1.5 commitadas em `9dc9391`.
- M-003.M2 homologada tecnicamente, commitada e enviada em `d4fdffc`.
- M-003.M3 nao iniciada.
- Nenhum dos 59 produtos reais foi migrado.
- Nenhuma imagem foi implementada.
- Nenhum preco pendente foi preenchido.

## 9. Decisoes vigentes

| Tema | Decisao vigente | Fonte | Pendencia |
| --- | --- | --- | --- |
| Identidade | Logo/DNA Alvorada aplicado por cliente, sem acoplar plataforma inteira. | [Mapa Mestre](00-MAPA-MESTRE-RONDONIA-OS.md) | Manter parametrizacao. |
| Login | Login geral por ID/nome/PIN e perfis. | [Login Geral](../padroes/LoginGeral.md) | Evolucao de permissoes conforme MOP. |
| Catalogo | Catalogo publico nao cria pedido direto. | [DMI Catalogo](DMI/DMI-Jornada-Cliente-Catalogo-Digital.md) | Proximo marco: M-003.M3. |
| Imagens | Propria/oficial > generica provisoria > placeholder. | [CATALOG-INSTANCE](Catalogo/CATALOG-INSTANCE-ALVORADA-001.md) | M-003.M4. |
| Pizzas | Sabores como produtos proprios; dois sabores so M/G; politica financeira pendente. | [CATALOG-MODEL](Catalogo/CATALOG-MODEL-ALVORADA-001.md) | M-003.M3. |
| Opcoes | Variacoes/opcoes separadas de produto; preco pendente nao vende. | [M-003.M2](Catalogo/M-003.M2-Catalogo-Mestre-e-Opcoes.md) | M2 commitada em `d4fdffc`. |
| Complementos | MVP prioriza vinculo explicito por produto. | [CATALOG-MODEL](Catalogo/CATALOG-MODEL-ALVORADA-001.md) | Outros adicionais. |
| Upgrade | `+100 g de batata` e upgrade comercial, nao variacao simples. | [CATALOG-INSTANCE](Catalogo/CATALOG-INSTANCE-ALVORADA-001.md) | Modelagem operacional. |
| OJC | Carrinho e sessao antes de pedido; snapshots na conversao. | [OJC-ME](../ojc/OJC-ME.md) | M-003.M5. |
| Atendimento | Central nao duplica Venda/Caixa/Producao/Delivery. | [MHO Catalogo](MHO/MHO-Jornada-Cliente-Catalogo-Digital.md) | Preservar homologacao. |
| Multiunidade | Modelagem deve preparar disponibilidade/preco por `unit`. | [DMI Catalogo](DMI/DMI-Jornada-Cliente-Catalogo-Digital.md) | Decisoes por unidade. |
| IA | Sugere e auxilia; nao decide catalogo/pedido/venda. | [MHO Catalogo](MHO/MHO-Jornada-Cliente-Catalogo-Digital.md) | Contratos futuros. |

## 10. Roadmap

Sequencia homologada do Catalogo:

1. M-003.M1 - Schema e Contratos.
2. M-003.M1.5 - Auditoria.
3. M-003.M2 - Catalogo Mestre e Opcoes.
4. M-003.M3 - Complementos, Upgrades e Pizzas.
5. M-003.M4 - Imagens.
6. M-003.M5 - OJC tipado e Snapshots.
7. M-003.M6 - Dry-run.
8. M-003.M7 - Migracao dos 59 produtos.
9. M-003.M8 - Validacao funcional e visual.

Etapa atual: M-003.M2 concluida/checkpoint funcional em `d4fdffc`. Proximo marco: M-003.M3 - Complementos, Upgrades e Pizzas, ainda nao iniciado.

## 11. Pendencias

Pendencias consolidadas do catalogo real:

| Item | Modulo | Impacto | Bloqueio |
| --- | --- | --- | --- |
| Coca-Cola 600 ml | Catalogo/Venda | Preco/embalagem pendente. | Migracao/ativacao comercial do item. |
| Coca-Cola 1 litro | Catalogo/Venda | Confirmacao de produto/preco. | Migracao/ativacao comercial do item. |
| Tuchaua 2 litros | Catalogo/Venda | Confirmacao de produto/preco. | Migracao/ativacao comercial do item. |
| Outros adicionais | Complementos | Escopo e aplicacao indefinidos. | M-003.M3. |
| +100 g de batata | Upgrade | Definir adicional/combo/upsell/upgrade. | M-003.M3. |
| Pizza dois sabores | Pizza | Politica de calculo pendente. | M-003.M3/Migracao. |
| Porcao mista | Porcoes | Composicao pendente. | Migracao/descricao. |
| Descricoes das porcoes | Porcoes | Conteudo de catalogo incompleto. | Migracao visual. |
| Laranja | Sucos | Confirmar variacao/preco. | Migracao/ativacao. |
| Laranja com leite condensado | Sucos | Confirmar variacao/preco. | Migracao/ativacao. |
| File/File Mignon | Catalogo | Grafia/documento pendente. | Documental, nao schema. |
| Disponibilidade por unidade | Multiunidade | Define exibicao e venda por matriz/filial. | Migracao completa. |

Responsavel de negocio: Alvorada. Responsavel tecnico: registrar sem inventar.

## 12. Checkpoints

Tabela resumida. Detalhes em
[Checkpoints e Commits](Projeto/CHECKPOINTS-E-COMMITS.md).

| Hash | Mensagem | Etapa | Status |
| --- | --- | --- | --- |
| `abb171b` | feat: refinar central de atendimento | Central | Homologado |
| `3852c4a` | feat: refinar interacoes da central de atendimento | Central | Homologado |
| `2b891a0` | docs: criar dmi e mho da jornada cliente catalogo | Catalogo/Jornada | Homologado |
| `004ff64` | docs: criar plano fase 1 da jornada cliente catalogo | Catalogo/Jornada | Homologado |
| `63657e1` | docs: consolidar dna e ux do cardapio digital | UX/DNA | Homologado |
| `efc2f4e` | docs: homologar instancia do catalogo alvorada | Catalogo real | Homologado |
| `1c4b377` | docs: homologar modelo tecnico do catalogo alvorada | Catalogo model | Homologado |
| `9dc9391` | feat: estruturar schema e contratos do catalogo real | M-003.M1/M1.5 | Confirmado |
| `d4fdffc` | feat: implementar catalogo mestre e opcoes | M-003.M2 | Homologado/commitado |

## 13. Como continuar

1. Ler [Retomada de Contexto](Projeto/RETOMADA-NOVA-CONVERSA.md).
2. Ler [Contexto Atual](Projeto/CONTEXTO-ATUAL-ALVORADA.md).
3. Consultar este Projeto Mestre.
4. Abrir documentos especializados da etapa ativa.
5. Verificar `git status --short`.
6. Conferir ultimo commit real.
7. Nao assumir que arquivos locais estao commitados.
8. Nao iniciar proxima etapa sem homologacao.
9. Pedir confirmacao de recebimento quando houver handoff Codex/Hercules.
10. Produzir evidencias antes de afirmar conclusao.

## 14. Governanca

Regras em [Governanca da Memoria](Projeto/GOVERNANCA-DA-MEMORIA.md).

Atualizar contexto/projeto quando houver checkpoint relevante, nova decisao,
mudanca de branch, migracao, homologacao ou bloqueio.

## 15. Glossario

| Termo | Definicao |
| --- | --- |
| ADR | Registro de decisao arquitetural. `docs/ADRs.md` existe como reconstruido/parcial. |
| DMI | Documento de Modelagem Inicial. Define responsabilidade e fronteiras antes do codigo. |
| MHO | Manual/Homologacao Operacional. Define criterios de aceite e validacao. |
| RIA-DS/RDS | Design system/gramatica visual da RondonIA Apps. |
| RVL | RondonIA Visual Language. Regras de linguagem visual e optica. |
| OJC | Orquestracao da Jornada do Cliente. |
| ROR | RondonIA Operational Routing. Rotas operacionais entre dominios. |
| KDS | Kitchen Display System; termo de producao/cozinha ainda pendente de detalhamento local. |
| documentKey | Chave documental estavel e imutavel para migracao/modelo. |
| snapshot | Copia historica dos dados relevantes no momento operacional. |
| Catalogo mestre | Cadastro atual editavel do catalogo real. |
| Upgrade comercial | Oferta adicional separada de variacao tradicional, como `+100 g de batata`. |
| Produzido/Revendido/Misto | Origem documental do produto para Producao, Estoque, Compras, CMV e IA futura. |
