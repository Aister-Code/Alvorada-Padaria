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
