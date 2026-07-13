# 00 — Mapa Mestre RondonIA OS / Alvorada

Este documento é o índice obrigatório de implementação do RondonIA OS no projeto Alvorada.

Nenhuma tela, módulo, fluxo, widget ou painel deve ser implementado sem consultar este mapa e os documentos referenciados.

## 1. Método Oficial de Trabalho

Toda implementação deve responder primeiro à operação e só depois à interface.

Regras oficiais:

- Mostrar decisão, não informação: a tela deve orientar o próximo passo, não despejar dados.
- Uma informação, um lugar: não duplicar a mesma informação operacional em níveis diferentes sem justificativa arquitetural.
- Toda tela principal possui Estado Vazio e Estado Operacional completo.
- Toda tela deve ser avaliada contra referências de qualidade, sem copiar aparência: Apple, WhatsApp, Linear, Notion, Stripe, Google, Figma e produtos equivalentes.
- A decisão visual deve favorecer clareza, velocidade, pouco ruído e operação com baixa carga cognitiva.

Ordem obrigatória:

1. RBG — RondonIA Builder Gate.
2. DMI do módulo.
3. MHO do módulo.
4. RVL.
5. RDS.
6. RAW.
7. MOP.
8. JOS.
9. ROR quando houver rota operacional.
10. OJC quando houver jornada de cliente.
11. Homologação visual e operacional.

Regra: não começar por interface. Começar pela jornada, responsabilidade, dados, permissões e estado operacional.

## 2. DNA Visual

O DNA visual é parametrizado por cliente.

Para Alvorada:

- Modo dia Plano 0: Pantone 474 C `#F3C4A2`.
- Modo noite Plano 0: Pantone 3995 C `#685C20`.
- Ação: Laranja Alvorada `#F04A2A`.
- Texto e ícones seguem a gramática RVL.
- Plano 2 usa inversão de temperatura.

Referência: `docs/padroes/RondonIA-Visual-Language.md`.

## 3. Herança Obrigatória por Tipo de Tela

### Tela de Login

- Logo oficial.
- DNA visual do cliente.
- Campo ID + Nome.
- PIN centralizado.
- Redefinição de PIN no mesmo padrão.

### Tela Operacional Principal

- Header operacional.
- Modo Operacional Atual.
- Unidade Atual.
- ISO.
- Escala Operacional.
- Tema.
- Menu Geral.
- Estado vazio e estado operacional completo.
- Indicadores com ícone, número e label.

### Tela de Jornada

- Jornada em foco.
- Próxima Ação única.
- Contexto permanente.
- Transferência de Trabalho quando aplicável.
- CAO apontando para a jornada.

### Tela Administrativa

- Header operacional.
- Permissões explícitas.
- Estados de confirmação.
- Auditoria.
- Ajuda contextual.

## 4. Componentes Obrigatórios

Referência: `docs/arquitetura/Componentes-Obrigatorios.md`.

Obrigatórios por padrão:

- Header Operacional.
- Menu Operacional.
- ISO.
- Escala Operacional.
- Tema.
- Ajuda.
- Indicadores.
- Modais Plano 2.
- Painéis contextuais.
- Estados vazios.
- Confirmações explícitas.
- Fechamento contextual.
- Dock Operacional Adaptativa quando aplic?vel.

## 5. Header Padrão

O Header deve exibir:

- Voltar quando aplicável.
- Título da tela.
- Modo Operacional Atual.
- Unidade Atual.
- ISO.
- Escala Operacional (`aa`, `Aa`, `AA`).
- Tema.
- Menu Geral.

Regra: o Header mostra o modo operacional, não o perfil base.

## 6. Menu Padrão

Ordem oficial:

1. Trocar Unidade.
2. Trocar Modo Operacional.
3. Meu Perfil.
4. Ajuda.
5. Configurações.
6. Sair.

A troca de modo e unidade não exige novo login.

## 7. Modais/Painéis Padrão

- Pertencem ao Plano 2.
- Devem contrastar por temperatura.
- Não usam glow, sombra pesada ou borda tradicional.
- Fecham ao clicar fora quando seguro.
- Se houver alterações não salvas, pedem confirmação.
- Operações críticas não fecham automaticamente.
- Configurações usam Cancelar e Salvar Alterações.

## 8. Indicadores Padrão

Todo indicador operacional possui:

1. Ícone.
2. Número.
3. Label.

A forma comunica primeiro, o número comunica intensidade e o label confirma.

## 9. Estados Obrigatórios

Toda tela elegível deve prever:

- Carregando.
- Estado vazio operacional.
- Estado com dados reais.
- Estado demonstrativo quando necessário.
- Erro.
- Sucesso.
- Permissão negada.
- Operação crítica.
- Sem conexão ou saúde degradada quando aplicável.

## 10. Modo Operacional

Usuário é quem a pessoa é.

Modo Operacional é o que ela está fazendo agora.

A tela deve sempre considerar:

```text
perfilBase + modoOperacionalAtual + unidadeAtual + ação
```

Referência: `docs/arquitetura/RAW-RondonIA-Adaptive-Workspace.md`.

## 11. Unidade

Unidade Atual representa onde a ação está ocorrendo.

A troca de unidade:

- é rápida;
- não exige logout;
- respeita permissões;
- altera contexto operacional;
- deve ser auditada.

## 12. Permissões

Permissões são governadas pela MOP.

Perfil Base nunca muda durante a sessão.

Modo Operacional e Unidade podem mudar conforme autorização.

Referência: `docs/arquitetura/MOP-Matriz-Operacional-de-Perfis.md`.

## 13. Módulos Opcionais por Cliente

Módulos obrigatórios iniciais:

- Login Geral.
- Centro de Operações.
- Venda.
- Caixa.
- Usuários/Administração.

Módulos opcionais conforme operação:

- Central de Atendimento.
- Produção.
- Delivery.
- Estoque.
- Gestão.
- Financeiro.
- Catálogo Digital.
- Customer Memory completa.
- Relatórios avançados.
- Integrações externas.

Regra: módulo opcional só aparece quando fizer sentido para o cliente, fase e maturidade.

## 14. Níveis de Liberação por Fase de Implantação

### Fase 0 — Base

- Login.
- Identidade visual.
- Operadores.
- Centro de Operações mínimo.

### Fase 1 — Núcleo Operacional

- Venda.
- Caixa.
- Usuários.
- Centro de Operações homologado.

### Fase 2 — Jornada Assistida

- Central de Atendimento.
- OJC.
- Transferências.
- Sessão de Catálogo.
- Produção e Delivery quando aplicável.

### Fase 3 — Controle

- Estoque.
- ROR avançado.
- Customer Memory mais completa.
- CAO ampliado.

### Fase 4 — Gestão

- Gestão.
- Financeiro.
- Relatórios.
- Auditoria ampliada.

### Fase 5 — Premium

- BI.
- IA.
- Omnichannel real.
- Automação avançada.
- Integrações fiscais/financeiras avançadas.

## 15. Níveis de Maturidade do Usuário/Cliente

### Inicial

- Poucas opções.
- Orientação explícita.
- Estados vazios didáticos.
- Módulos essenciais.

### Intermediário

- Configurações simples.
- Transferências.
- OJC.
- Mais contexto sob demanda.

### Avançado

- Operação multiunidade.
- ROR avançado.
- Relatórios.
- Gestão por exceção.

### Premium

- Automação.
- Integrações.
- BI.
- IA assistida.

## 16. Escola/Treinamento/Orientação Gradual

A Escola RondonIA orienta o avanço da maturidade.

Regras:

- Não liberar complexidade antes da maturidade operacional.
- Treinar por modo operacional.
- Ensinar primeiro a jornada, depois a tela.
- Usar cenários reais e demonstrativos.
- Homologar entendimento, não apenas aparência.

Documento oficial: `docs/arquitetura/Escola-RondonIA.md`.

## 17. ROR

Rota Operacional define por quais setores ou etapas um item/pedido deve passar.

Prioridade:

```text
Canal -> Grupo de Produto -> Produto -> Exceção do Pedido
```

Exceção nunca altera cadastro base.

Referência: `docs/arquitetura/ROR-RondonIA-Operational-Routing.md`.

## 18. OJC

A Orquestração da Jornada do Cliente governa a jornada desde contato até encerramento.

Entidades não são estados.

Conversa, Sessão de Catálogo, Pedido e Transferência são entidades governadas pela Jornada.

Referências:

- `docs/ojc/OJC-ME.md`.
- `docs/ojc/OJC-UI.md`.

## 19. Customer Memory

Customer Memory é contexto permanente, não estado.

Inclui:

- compras;
- contatos;
- pedidos;
- encomendas;
- promoções;
- contas a receber em consulta;
- preferências;
- observações;
- canais utilizados.

Deve aparecer sob demanda, sem poluir a tela principal.

## 20. Transferências de Trabalho

Transferência muda responsabilidade, não reinicia jornada.

Destino recebe:

- contexto completo;
- origem;
- motivo;
- ação esperada;
- prioridade;
- CAO quando aplicável.

## 21. JOS

A Jornada Operacional do Sistema entende o produto como ciclo contínuo:

```text
Login -> Centro de Operações -> Modo Operacional -> Módulo -> Jornada -> Transferência/Conclusão -> Centro
```

Referência: `docs/arquitetura/JOS-Jornada-Operacional-do-Sistema.md`.

## 22. MOP

Matriz Operacional de Perfis governa:

- perfil base;
- modos permitidos;
- unidades;
- permissões;
- troca de modo;
- troca de unidade;
- auditoria.

Referência: `docs/arquitetura/MOP-Matriz-Operacional-de-Perfis.md`.

## 23. Blockchain/Eventos Permanentes

Eventos permanentes devem registrar fatos operacionais imutáveis ou auditáveis.

Entram como candidatos:

- login e sessão;
- alteração de permissão;
- criação/alteração/cancelamento de pedido;
- transferência de trabalho;
- mudança de status operacional;
- exceção de rota;
- pagamento;
- encerramento de jornada.

Ponto ainda em aberto: definir quais eventos vão para blockchain, ledger interno ou apenas log operacional.

## 24. Checklist Obrigatório Antes de Implementação

- RBG respondido.
- DMI consultado.
- MHO previsto.
- Perfil principal definido.
- Modo operacional definido.
- Unidade considerada.
- Permissões avaliadas pela MOP.
- Módulos opcionais avaliados.
- Fase de implantação validada.
- Maturidade do usuário/cliente validada.
- ROR avaliado quando houver rota.
- OJC avaliada quando houver cliente/jornada.
- Dados reais e placeholders separados.
- Estados obrigatórios definidos.
- Modais/painéis definidos.
- Indicadores definidos.
- Riscos de duplicidade de domínio avaliados.

## 25. Checklist Obrigatório Antes de Homologação

- Build OK quando houver código.
- Modo dia validado.
- Modo noite validado.
- Mobile, tablet e desktop conferidos.
- Estado vazio validado.
- Estado operacional completo validado.
- Header correto.
- Menu correto.
- ISO correto.
- Escala correta.
- Tema correto.
- Ajuda acessível.
- Troca de modo considerada.
- Troca de unidade considerada.
- Indicadores com ícone, número e label.
- Modais/painéis no padrão.
- Textos legíveis e acentuados.
- Permissões validadas.
- Módulos opcionais coerentes com fase e maturidade.
- Screenshots entregues no formato `[ANEXAR: arquivo.png]` quando necessário.


## 26. Dock Operacional Adaptativa

A Dock Operacional Adaptativa é o padrão preferencial para atalhos frequentes em telas operacionais principais.

Princípios:

- Poucos atalhos fixos.
- Operação com uma mão.
- Pouco texto.
- Ícone, nome curto e badge quando necessário.
- Item ativo seguindo o DNA Dock Ativo por Massa Óptica definido no RVL-035.
- Alça retrátil discreta para destinos secundários.
- A Dock permanece visível quando a expansão abre.
- Não utilizar um quinto item `Mais` quando a alça resolver a expansão.

Referência de simplicidade: WhatsApp Android, sem copiar sua aparência.

## 27. Matriz Técnica de Permissões por Ação

Toda ação deve ser classificada tecnicamente antes de implementação.

Eixos obrigatórios:

- Perfil Base.
- Modo Operacional Atual.
- Unidade Atual.
- Ação solicitada.
- Tipo de permissão: consulta, execução, autorização, administração.
- Sensibilidade: baixa, média, alta, crítica.
- Auditoria: nenhuma, operacional, obrigatória, crítica.

Modelo mínimo:

| Ação | Consulta | Execução | Autorização | Administração | Auditoria |
| --- | --- | --- | --- | --- | --- |
| Ver pedido | perfis envolvidos | - | - | - | operacional |
| Criar pedido | Atendimento/Venda/Gerência | modo autorizado | Gerência em exceção | - | obrigatória |
| Fechar venda | Caixa/Gerência | Caixa | Gerência em exceção | - | crítica |
| Alterar permissão | - | - | Gerência/Admin | Admin | crítica |
| Transferir trabalho | perfis envolvidos | responsável atual | Gerência em exceção | - | obrigatória |

## 28. Política de Módulos Premium/Opcionais

Classificação oficial:

- Obrigatório: necessário para operação mínima.
- Opcional: depende do processo do cliente.
- Futuro: previsto, mas não liberado na implantação atual.
- Premium: exige maturidade, treinamento e contrato específico.

Regras:

- Módulo opcional não aparece antes da fase correta.
- Módulo premium não aparece como promessa visual em cliente sem liberação.
- Funcionalidade futura pode existir em arquitetura, mas não deve parecer disponível.
- A liberação depende de fase, maturidade e autorização comercial/operacional.

## 29. Critérios Objetivos de Maturidade

### Inicial

Critérios:

- Operador executa fluxo principal sem ajuda.
- Erros comuns foram treinados.
- Estado vazio e próxima ação são compreendidos.

### Intermediário

Critérios:

- Operador lida com exceções simples.
- Usa transferência de trabalho corretamente.
- Entende modo operacional e unidade.

### Avançado

Critérios:

- Equipe opera com múltiplos módulos.
- Gerente entende CAO, ISO, ROR e RAW.
- Exceções são registradas sem alterar cadastro base.

### Premium

Critérios:

- Cliente usa indicadores e gestão por exceção.
- Treinamento avançado concluído.
- Processos internos estão documentados.
- Automação não gera dependência sem supervisão.

## 30. Escola RondonIA

A Escola RondonIA governa treinamento e liberação gradual.

Trilhas mínimas:

- Operador: login, modo operacional, unidade, módulo principal e próxima ação.
- Líder: transferências, CAO, exceções e acompanhamento.
- Gerente: Centro de Operações, MOP, ROR, RAW, ISO e implantação gradual.
- Administração: permissões, auditoria e suporte.

Regra de liberação:

- A função só é liberada quando o operador entende o objetivo, o estado vazio, o estado operacional e a exceção principal.
- Complexidade é liberada por maturidade, não por disponibilidade técnica.

## Regra Mestre — Relatórios Contextuais e Dock Operacional

Relatórios são contextuais à tela ativa quando servem para histórico, auditoria leve ou consulta operacional imediata.

Regras:

- Relatórios ficam no menu contextual da tela ativa.
- Relatórios não ocupam vaga na dock operacional.
- A primeira visão do relatório deve ser simples, com filtros curtos e sem tabela pesada.
- A dock inferior representa módulos operacionais herdados do Centro de Operações.
- Abas internas de um módulo devem aparecer como atalhos contextuais compactos, não como nova dock.

Na Central de Atendimento:

- Header interno mostra `CONVERSAS` como contexto ativo.
- Dock do gerente mantém Venda, Atendimento, Produção e Gestão.
- Pedidos, Clientes e Agenda são contextos internos da área Atendimento.
- Conversas segue padrão WhatsApp/RondonIA: lista limpa, filtros sem cápsulas, avatar com origem, urgência no contorno e ações diretas por conversa.

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
