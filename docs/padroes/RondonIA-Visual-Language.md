# RondonIA Visual Language

## Posição no Produto

O RondonIA Visual Language, ou RVL, · a camada visual acima do Design System.

O Design System define componentes, contratos, estados e consistência técnica. O RVL define a expressão visual, a hierarquia, o silêncio da interface e a forma como o DNA da marca aparece no produto.

Toda nova tela deve consultar este documento antes de ser implementada.

## Princípios

- Premium.
- Ultra clean.
- Poucas cores.
- Silêncio visual.
- Foco na operação.
- Identidade da marca acima do framework.
- Interface conduz por hierarquia, não por efeitos.

## DNA Parametrizável por Cliente

Cada cliente deve ter um DNA visual próprio, parametrizado antes da implementação das telas.

Parâmetros obrigatórios:

- Cor estrutural.
- Cor de ação.
- Superfícies.
- Texto.
- Modo dia.
- Modo noite.

## DNA Alvorada v1

O DNA visual mantém a paleta da marca como acento e assinatura, mas a base operacional do RondonIA OS passa a ser neutra para preservar usabilidade, contraste e padronização entre clientes.

### Modo Dia

- Plano 0 / Fundo: branco quente `#F7F7F4`
- Plano 1 / Operação: branco `#FFFFFF`
- Foco: branco com acento oliva discreto
- Texto: grafite quente `#1F1F1A`
- Assinatura da marca: Pantone 3995 C `#685C20`
- Ação: Pantone 1655 / Laranja Alvorada `#F04A2A`

### Modo Noite

- Plano 0 / Fundo: preto/grafite profundo `#0D0D0B`
- Plano 1 / Operação: grafite elevado `#151513`
- Texto: branco quente `#F7F2EC`
- Assinatura da marca: Pantone 474 C `#F3C4A2`
- Ação: Pantone 1655 / Laranja Alvorada `#F04A2A`

### Plano 2

- Modo dia: superfície oliva Pantone 3995 C `#685C20`; leitura em branco quente/cinza quente.
- Modo noite: superfície Pantone 474 C `#F3C4A2`; leitura em oliva Pantone 3995 C.

### Assinatura da Marca

- Logo no modo dia: oliva Pantone 3995 C `#685C20`.
- Logo no modo noite: pêssego Pantone 474 C `#F3C4A2`.
- Laranja Alvorada `#F04A2A` é cor de ação, não cor principal da logo na interface.
- A marca deve estar presente sem competir com botões, alertas ou estados operacionais.

## RVL-001 — Campo Editável

Nenhum componente editável pode parecer bloqueado.

- Campo editável deve aceitar clique/toque em toda a sua área útil.
- O usuário nunca deve precisar descobrir onde clicar.
- Estado visual de edição deve ser claro, mas discreto.
- Campos não devem parecer caixas tradicionais de ERP.
- Foco pode usar borda ultra fina, sem outline pesado.

## RVL-002 — Botão Principal

O botão principal mantém presença por cor, contraste e hierarquia.

- Usar a cor de ação do DNA.
- Texto com contraste claro.
- Sem sombra difusa externa.
- Sem glow.
- Sem efeito spray.
- Estado inativo com aproximadamente 75% de opacidade.

## RVL-003 · Iconografia Operacional

A iconografia operacional · parte da linguagem principal do RondonIA OS.

- ícone comunica.
- Texto confirma.
- A mesma semântica visual deve se repetir em todo o sistema.
- ícones devem ser simples, reconhecíveis e funcionais.
- Não usar iconografia decorativa quando ela não acrescenta leitura operacional.

## RVL-004 — Saúde Operacional

A Saúde Operacional representa tendência e confiabilidade do ambiente, não apenas um evento instantâneo.

- Usar índice operacional preparado para média por período.
- A janela recomendada para evolução · média móvel de 5 minutos.
- Adaptar os itens exibidos por perfil.
- Sinalizar somente quando houver impacto operacional.
- Em telas com Menu Geral, a Saúde do Sistema deve viver dentro do menu três linhas; o ícone do menu pode receber sinalização semafórica quando houver impacto real.
- O menu três linhas também pode sinalizar outros alertas globais elegíveis, desde que não duplique informação já apresentada no corpo da tela.
- O menu pode pulsar suavemente no primeiro acesso/retorno para informar a saúde atual; depois disso, sinaliza conforme configuração e impacto operacional.
- A lista de saúde de cada cliente deve exibir apenas canais, hardwares, APIs e integrações captados pelo sistema.
- Quando um item deixar de ser captado, seu histórico deve permanecer registrado para comparação quando voltar, incluindo marca, configuração aplicada, período e impacto operacional.
- A Saúde do Sistema deve preparar relatórios por período, com leitura enxuta e gráficos comparativos quando necessário para suporte, auditoria ou envio digital.
- Não marcar vermelho por um evento isolado sem confirmação de tendência.

Estados do ISO:

- Verde: 95?100%.
- Amarelo: 80?94%.
- Laranja: 60?79%.
- Vermelho: abaixo de 60%.

## RVL-005 — Atenção Contextual

A Atenção Contextual organiza pendências por urgência, importância e perfil.

- `info`: discreto.
- `attention`: amarelo.
- `important`: laranja.
- `critical`: vermelho.

Regras:

- ícone comunica.
- Texto confirma.
- Não piscar.
- Não usar som nesta versão.
- Não vibrar nesta versão.
- Preparar alarme e vibração apenas para evento crítico quando a tela estiver off.
- Nunca interromper sem motivo.

## RVL-006 · Responsividade Intencional

Nenhuma tela principal deve deixar grandes áreas vazias sem intenção de design.

- A interface deve usar a altura disponível com harmonia.
- Não preencher espaço com conteúdo artificial.
- Mobile estreito deve priorizar toque, leitura e grids simples.
- Tablet deve aumentar respiro, área clicável e proporção visual.
- Desktop não deve esticar componentes exageradamente.

## RAW-001 — Configuração Contextual

Configurações devem manter o contexto operacional visível.

- Evitar tela cheia quando não for necessário.
- Preferir popover expandido, sheet leve ou card contextual.
- Usar switches/on-off quando possível.
- Usar seleção única para filtros mutuamente exclusivos.
- Usar seleção múltipla quando fizer sentido operacional.
- Bloquear combinações inválidas.
- Permitir sugestáo do sistema.
- Respeitar perfil, unidade, período e função.

## RVL-007 · Planos Visuais Simplificados

A linguagem visual do RondonIA OS usa poucos planos para reduzir ruído.

- Separar blocos por ritmo, alinhamento, espaço e proporção.
- Não usar mudanças constantes de cor para explicar a tela.
- O operador deve perceber temperatura e identidade, não camadas artificiais.

## RVL-008 — Tela Principal Sem Rolagem

Telas principais operacionais devem caber na viewport do dispositivo elegível.

- A tela principal não deve depender de scroll vertical.
- A responsividade deve adaptar proporções, respiros, altura dos cards e acabamento.
- Popovers, menus e painéis internos podem ter rolagem própria quando necessário.

## RVL-009 — Grid ?ptico

Toda tela operacional deve seguir um grid invisível.

- Logo, textos, títulos, ícones, menus e cards devem parecer parte de uma única composição.
- Menus de widgets configuráveis devem compartilhar o mesmo eixo sempre que possível.
- O alinhamento visual tem prioridade sobre alinhamento puramente matemático.

## RVL-010 — Modelo de 3 Planos

### Plano 0 — Ambiente

Fundo da tela. Modo dia usa off-white quente; modo noite usa oliva profundo.

### Plano 1 — Operação

área operacional: Operação Agora, Jornada Hoje, módulos, cards e widgets.

Todos os elementos operacionais compartilham a mesma superfície. A separação acontece por respiro, composição, hierarquia e tipografia.

### Plano 2 — Contexto

Menus, popovers, configuração, ajuda e modais.

Deve parecer flutuar naturalmente sobre a operação, sem glow, sem sombra pesada e sem borda tradicional.

## RVL-011 — Configuração Contextual sem Ruído

Configurações devem parecer ferramentas contextuais, não formulários extensos.

- Manter o contexto visível.
- Evitar telas cheias.
- Evitar textos explicativos longos.
- Priorizar organização visual, agrupamento e chips compactos.
- Usar componentes progressivos quando necessário.
- Rolagem em popovers deve ser o último recurso.

## RVL-012 — Composição Editorial

A interface conduz o olhar.

- A hierarquia · criada pela composição.
- O operador nunca procura informação.
- A informação encontra o operador.
- Ritmo visual · mais importante que quantidade de componentes.
- Respiros, massas e proporções substituem linhas divisórias.

## RVL-013 — Contexto Contrasta

Elementos do Plano 2 devem destacar-se pela temperatura da superfície, nunca por efeitos gráficos.

- Modo dia usa oliva.
- Modo noite usa bege quente.
- Não usar glow.
- Não usar sombra pesada.
- Não usar bordas tradicionais.

## RVL-014 — Escala Operacional

A Escala Operacional faz parte do RondonIA Visual Language e do RondonIA Adaptive Workspace.

Opções:

- `aa`: Escala Pequena.
- `Aa`: Escala Normal.
- `AA`: Escala Grande.

Princípios:

- A escala não altera apenas a fonte.
- Fonte, respiros, altura de componentes e área clicável devem adaptar-se proporcionalmente.
- A escala deve afetar a tela operacional inteira, não apenas um grupo de ícones ou controles.
- Componentes com medidas fixas devem aderir à escala global por variável, unidade relativa ou camada equivalente.
- A preferência deve ser salva por operador.
- O próprio controle no header deve indicar a escala ativa.

## RVL-015 — Navegação Natural

Widgets operacionais representam resumos.

- Não existe ação de expandir widget.
- Ao tocar em um widget, abrir sua tela correspondente.
- O retorno acontece pelo botão Back.
- Os tràs pontos permanecem apenas para configuração do widget, quando existir.

## RVL-016 — Inversão de Temperatura

Ferramentas contextuais usam temperatura oposta ao Plano 1.

- Modo dia: Plano 1 usa neutros claros; Plano 2 usa oliva.
- Modo noite: Plano 1 usa oliva; Plano 2 usa bege quente.
- O contraste vem da temperatura da superfície, não de efeito visual.

## RVL-022 — Configuração Progressiva

Controles contextuais devem comunicar estado com legibilidade e descoberta natural.

- Opções disponíveis permanecem totalmente legíveis.
- Somente itens realmente indisponíveis podem parecer desabilitados.
Padrão preferencial:

- Lista compacta com valor atual · direita.
- Dropdown contextual ao tocar.
- Cada critério aparece em uma linha de controle.
- Nome do critério · esquerda.
- Valor atual · direita.
- Ao tocar na linha, abrir dropdown compacto apenas com as opções daquele critério.
- O dropdown abre como continuação da própria linha, abaixo dela, sem repetir o nome do critério como cabeçalho interno.
- Ao selecionar uma opção, o dropdown fecha automaticamente.
- O cabeçalho do painel contextual não deve repetir o nome do widget quando o contexto visual já indica a origem da configuração.
Segmented control:

- Permitido apenas quando houver poucas opções e ganho claro de leitura.
- Multi-seleção usa dropdown contextual com seleção discreta.
- Em seleção múltipla, opções agregadoras como `Todos` são exclusivas: se `Todos` estiver ativo, nenhuma outra opção fica selecionada junto.
- Evitar chips sempre expostos, blocos internos, cartões dentro de cartões e aparência de formulário.
- Mais de 8 opções devem evoluir para dropdown com busca.
- Configuração avançada deve abrir tela específica, sem sobrecarregar o modal contextual.
- A largura do painel contextual deve respeitar a proporção do conteúdo escrito.
- Usar largura mínima confortável, largura máxima responsiva e evitar sobras laterais exageradas.
- A configuração deve ser limpa, previsível e permitir descoberta das opções sem poluir.
- RAW poderá reorganizar futuramente as opções frequentes conforme uso do operador, sempre com confirmação.

Estados oficiais:

- Selecionado: fundo oliva, texto claro e peso semibold.
- Disponível: fundo transparente ou neutro, texto legível e contorno extremamente discreto.
- Desabilitado: opacidade reduzida apenas quando realmente indisponível.

## RVL-018 — Confirmação Explícita

Telas de configuração devem confirmar conclusão da ação.

- Toda configuração deve oferecer `Cancelar`.
- Toda configuração deve oferecer `Salvar Alterações`.
- Ao salvar, o botão deve comunicar `Salvando...`.
- Ao concluir, o botão deve comunicar `✓ Salvo`.
- Nunca fechar silenciosamente após uma ação de salvar.

## RVL-018.1 · Sugestáo do Sistema

Configurações contextuais podem oferecer sugestáo do sistema como estado ativo.

Regras:

- Usar checkbox ou toggle discreto.
- Quando ativo, aplicar as opções padrão do sistema.
- Se o operador alterar qualquer opção manualmente, sair automaticamente do modo sugestáo.
- Se o operador ativar novamente, restaurar as opções padrão.
- O estado deve ser legível e não parecer uma ação avulsa.

## RVL-019 — Fechamento Contextual

Popovers e configurações contextuais fecham automaticamente ao clicar fora.

Exceções:

1. Se houver alterações não salvas, solicitar confirmação antes de fechar.
2. Se for uma operação crítica, nunca fechar automaticamente.

## RVL-020 — Inversão de Leitura

Quando um painel contextual utilizar superfície escura, toda sua leitura principal passa automaticamente para branco quente e cinza quente.

Modo dia:

- Superfície do Plano 2: oliva.
- Texto principal: branco quente.
- Texto secundário: cinza quente.
- ícones: branco quente.
- Destaques: branco.

Modo noite:

- Superfície do Plano 2: bege quente.
- Texto principal: oliva.
- Texto secundário: oliva suavizado.
- ícones: oliva.
- Destaques: oliva estrutural.

Regras:

- Nunca usar texto oliva sobre superfície oliva.
- Opções disponíveis devem permanecer legíveis.
- Baixa opacidade deve indicar apenas item realmente indisponível.

## RVL-021 — Comunicação Editorial

A comunicação editorial faz parte da experiência operacional.

- Um conceito, um ícone.
- Textos curtos.
- Português correto.
- Acentuação obrigatória.
- Legibilidade acima de efeitos visuais.
- ícones devem permanecer somente quando agregarem significado.
- Opções disponíveis nunca devem parecer desabilitadas.

## RVL-023 · Indicadores Operacionais

Todo indicador operacional deve conter:

1. ícone.
2. Número.
3. Label.

Princípio:

Todo resumo operacional comunica primeiro pela forma, depois pelo número e por último pelo texto.

Regras:

- Nunca usar apenas número + texto em resumos operacionais.
- O ícone comunica a natureza da informação.
- O número comunica intensidade.
- O label confirma o significado.
- A composição deve seguir o mesmo padrão visual dos indicadores de `Operação Agora`.

## RVL-024 — Não Duplicar Informação Operacional

Uma mesma informação operacional não deve ser apresentada simultaneamente em dois níveis da interface, salvo quando houver justificativa arquitetural.

Exemplo:

- Se `Atenção` já aparece em `Operação Agora`, o header não deve repetir o mesmo indicador como controle global.
- O header deve priorizar controles globais.
- A área operacional deve concentrar informações de operação.

## RVL-025 — Contexto Permanente da Operação

Toda tela operacional deve informar claramente:

- Título da tela.
- Modo Operacional Atual.
- Unidade Atual.

Regras:

- A primeira linha do Header deve exibir o nome do colaborador vinculado ao cadastro.
- O nome exibido deve respeitar o nome preferencial do colaborador.
- Se houver colaboradores com nomes iguais, usar nome + sobrenome para diferenciar.
- Quando houver nomes iguais, o colaborador mais antigo na empresa mantém preferência pelo nome curto já utilizado.
- A segunda linha do Header deve exibir `Cargo • Unidade`.
- Exemplo: `João` na primeira linha e `Gerente • Matriz` na segunda.
- A regra vale para todos os headers operacionais elegíveis.
- O Header deve mostrar o modo operacional em uso, não o perfil base.
- O perfil base pertence · identidade e auditoria, não ao título operacional da tela.
- O contexto deve acompanhar trocas futuras de modo operacional e unidade.
- Exemplo: `Atendimento · Matriz`.
- Nenhum título principal de módulo deve quebrar em mais de duas linhas.
- Sempre que possível, o título principal deve permanecer em uma linha.
- Subtítulos operacionais essenciais não devem ser truncados.
- Se faltar espaço, reduzir levemente fonte, espaçamento ou densidade dos controles antes de cortar contexto essencial.

## RVL-026 — Expansíveis Integrados

Todo controle expansível elegível deve parecer parte do componente que expande.

Regras:

- A alça ou símbolo de expansão deve ficar dentro da superfície do componente.
- A alça não deve criar faixa extra, aumentar a altura principal ou parecer solta.
- Em docks operacionais, a alça não ocupa vaga de item e não altera a proporção dos ícones.
- Em resumos, filtros e linhas retráteis, a alça não cria linha exclusiva nem desloca os indicadores.
- A alça deve ser opticamente centralizada em relação ao conjunto que controla.
- Alças equivalentes no mesmo fluxo devem ter o mesmo teor de destaque visual, especialmente entre resumo superior e rodapé.
- No modo escuro, a alça usa branco quente como leitura principal; no modo claro, usa oliva/grafite suave.
- O destaque deve estar no próprio símbolo, não em cápsula, bolha ou fundo pesado.
- O estado recolhido/expandido deve continuar intuitivo por chevron ou símbolo equivalente.
- Hover/foco seguem a mesma linguagem de superfície suave do componente.
- A regra vale para componentes atuais e futuros.

## RVL-027 — Status Educativo

Indicadores de status devem comunicar primeiro por forma e cor, com texto apenas sob demanda.

Regras:

- Bolinhas ou marcadores simples bastam quando o estado já está associado a um item.
- O marcador deve ser clicável ou focável quando houver espaço para explicar seu significado.
- A explicação deve usar texto curto e operacional.
- Quando o marcador já comunica o status, ícones próximos devem permanecer neutros para não duplicar leitura.
- O padrão vale para Agenda, filtros, listas, docks, itens operacionais e todos os elegíveis futuros.
- Verde indica informação ativa.
- Amarelo indica atenção.
- Vermelho indica crítico.
- Azul indica exceção informativa rara.
- A cor não deve virar decoração; ela sempre precisa explicar uma condição real.

## RVL-028 — Dock por Contexto

A Dock Operacional pode adaptar sua distribuição conforme o tipo de tela.

Regras:

- Tela inicial do perfil: a dock pode usar distribuição mais aberta, semelhante à navegação Android, quando houver espaço.
- Telas internas ou de módulo: a dock retorna ao padrão operacional expansível, mais compacto e contextual.
- A dock inicial prioriza reconhecimento rápido dos destinos principais.
- A dock interna prioriza controle, contexto e redução de dispersão.
- A linguagem visual permanece a mesma: ícone, nome curto, badge quando necessário e destaque suave no ativo.
- Linhas fixas e linhas expandidas da mesma dock devem usar a mesma composição: ícone acima, texto abaixo, mesmo tamanho, mesmo traço e mesmo respiro.
- A expansão não pode criar outra linguagem, como lista horizontal, texto lateral ou ícone menor sem justificativa.
- Badges de dock devem ficar ancorados ao ícone correspondente, nunca soltos no canto do botão.
- Quando houver espaço, o nome do destino deve aparecer completo; abreviações só são permitidas quando evitarem quebra ou colisão visual.
- A tela pode reduzir margens laterais da dock para acomodar rótulos completos, desde que preserve respiro e alinhamento óptico.
- Ícones de dock utilizam traço leve e consistente para não competir com texto, badges ou ações principais.
- Rótulos curtos devem usar linguagem comum do operador. Quando `Configurações` não couber, preferir `Ajustes` a abreviações técnicas como `Config.`.

## RVL-029 — Configuração Curta no Expansível

Quando um expansível já comunica o estado de configuração de um widget, ele pode oferecer ajustes rápidos no próprio painel.

Regras:

- O expansível deve mostrar primeiro o estado atual, como `Padrão do sistema`.
- Ao abrir, deve preferir lista compacta com valor atual à direita.
- As linhas precisam ter área confortável de toque/clique.
- Toda linha que abre opções deve exibir indicador de expansível, como chevron.
- A lista de opções abre no próprio contexto da linha, sem parecer outra tela.
- Quando houver alternância entre configuração rápida e completa, essa alternância também deve ser expansível/listada, não um texto solto.
- Ao abrir em contexto, o painel usa Plano 2 para comunicar ferramenta/configuração.
- O menu de três pontos permanece para configuração completa.
- O caminho curto nunca deve substituir configurações avançadas quando elas existirem.
- A interação deve reduzir caminho sem poluir a tela principal.
- Se nada foi alterado, não repetir ações como `Usar padrão do sistema`.
- Depois de alteração, exibir ações explícitas como `Cancelar` e `Salvar`.
- `Voltar ao padrão` aparece apenas como ação secundária quando houver alteração.
- O padrão vale para Agenda e futuros widgets configuráveis.

## RVL-030 — Alertas Semafóricos Configuráveis

Alertas operacionais devem ser configuráveis no mesmo padrão de configuração curta.

Regras:

- O alerta pode ser aberto pelo ícone/indicador do item relacionado.
- O estado do alerta usa semáforo proporcional ao prazo, período e tarefa.
- Verde indica alerta programado sem risco imediato.
- Amarelo indica proximidade do horário ou atenção.
- Vermelho indica alerta disparado e não visto, atraso ou criticidade.
- Azul indica alerta visto ou exceção informativa.
- O operador deve conseguir cancelar o alerta quando o contexto físico/operacional exigir.
- Quando houver alerta não visto, a interface deve comunicar isso sem piscar, som ou glow.

## RVL-031 — Plano de Superfícies Funcionais

Telas operacionais devem usar fundo sólido contínuo, com separação por áreas funcionais claras.

Princípios:

- Plano 0 representa o fundo geral da operação.
- Plano 1 representa áreas funcionais: header, contexto, trabalho principal, apoio e navegação.
- Plano 2 representa elementos de interação: campos, botões discretos, itens ativos e áreas clicáveis.
- A separação entre áreas deve acontecer por diferença sutil de superfície, respiro, divisor fino, agrupamento visual e contraste moderado.
- No modo dia, usar três planos visuais para evitar baixo contraste: off-white como fundo, superfícies brancas/elevadas para áreas e cinza quente claro para interações.
- No modo escuro, usar três planos visuais: preto/grafite profundo no Plano 0, grafite elevado perceptível no Plano 1 e grafite mais claro no Plano 2.
- O modo escuro não pode ser preto chapado; áreas funcionais precisam ser reconhecíveis e campos de interação precisam ter contraste próprio.
- Divisores no modo escuro devem ser discretos, mas visíveis o suficiente para orientar a leitura.
- A hierarquia visual de interfaces escuras modernas, como Codex, pode servir como referência de contraste, camadas e densidade visual, sem copiar layout.
- Header nunca deve se fundir visualmente com a primeira área operacional.
- Toda tela operacional deve diferenciar barra de localização/global, área de contexto operacional, área principal de trabalho e navegação inferior.
- Evitar cards pesados, sombras fortes, blocos concorrendo entre si, aparência de dashboard, aparência bancária ou aparência de CRM.
- Cada área precisa ter função única e reconhecível: localização, contexto, trabalho principal, apoio ou navegação.
- A lista ou área de trabalho principal deve continuar sendo o foco visual da tela.

## RVL-032 — Régua Óptica Operacional

Toda tela operacional deve possuir uma régua óptica própria.

Princípios:

- A régua é definida pelas extremidades visuais mais fortes da tela, não apenas por padding matemático.
- O elemento usado como referência é uma baliza da tela inteira, não o limite do ajuste.
- Header, conteúdo, ações, listas, horários, indicadores, menus, popovers e dock devem conversar com essa régua.
- Sub-réguas internas são permitidas quando organizam melhor a leitura, como status antes do texto ou horário à direita.
- A régua deve ser validada visualmente e, quando possível, medida no DOM.
- O alinhamento deve seguir a percepção do operador: elementos não podem parecer soltos, colados ou pertencentes a outro bloco.
- A referência de qualidade é a organização de interfaces operacionais maduras, como WhatsApp Android: áreas simples, extremidades consistentes, ações presas ao lado certo e navegação inferior previsível.

Aplicação:

- Primeiro identificar as balizas principais da tela.
- Depois distribuir todos os elementos elegíveis da tela, não apenas o componente citado.
- Por fim ajustar peso, proporção, respiro e hierarquia para manter leitura rápida e sensação profissional.

## RVL-033 — DNA WhatsApp Android para telas mobile-first

O RondonIA OS usa o WhatsApp Android como referência principal de aproveitamento de espaço, proporção, margens, distribuição e alinhamento visual percebido em experiências mobile-first.

Esta referência orienta a experiência, sem copiar layout, identidade ou componentes do WhatsApp.

Princípios globais:

- Aproveitar a largura útil com margens compactas e confortáveis.
- Reduzir recuos laterais e áreas mortas que não tenham função operacional.
- Alinhar header, conteúdo, ações e navegação inferior pela percepção visual do operador.
- Preferir alinhamento óptico a um grid matemático rígido quando houver conflito entre cálculo e percepção.
- Distribuir ícones, rótulos, badges e contadores com leitura imediata e área de toque suficiente.
- Manter header e dock reconhecíveis como partes do mesmo sistema visual.
- Respeitar safe-area dentro do próprio dock, sem transformá-la em faixa vazia aparente.
- Preservar hierarquia simples, leitura rápida, densidade equilibrada e sensação mobile-first.

Aplicação por família de tela:

- Telas operacionais densas, como Gerente, Central de Atendimento, Venda, Caixa, Produção, Delivery, Acompanhamento e Agenda operacional, devem aproveitar mais a largura, aproximar o conteúdo útil das extremidades e evitar recuos laterais mortos.
- Telas de foco único, como Login, PIN, confirmação, erro, estados vazios e onboarding, devem preservar foco e harmonia, sem esticar o conteúdo artificialmente.
- O DNA é global, mas sua aplicação deve respeitar a função, a densidade e a jornada de cada tela.

Dock operacional:

- A faixa pode ocupar toda a largura, mas seus itens também devem aproveitar a largura útil.
- A primeira e a última posições devem se aproximar das extremidades úteis sem encostar na borda física.
- Linhas secundárias devem reutilizar os mesmos slots da linha principal; posições sem ação permanecem vazias, sem recentralizar a linha.
- Item ativo e badges devem ser claros, legíveis e presos ao elemento correto.

Aplicação imediata e evolução:

- O Centro de Operações adota esta régua no dock do Gerente.
- A Central de Atendimento deve seguir a mesma referência em etapa própria, sem alteração automática de sua estrutura atual.

## RVL-034 — Alinhamento Óptico de Ícones e Rótulos

Pares formados por ícone e rótulo devem ser alinhados pela percepção visual, não apenas pelo centro geométrico do SVG ou do slot.

Princípios:

- A palavra/rótulo define a régua de leitura do item.
- O ícone deve parecer centralizado em relação ao rótulo e ao eixo do item.
- O centro geométrico do SVG é ponto de partida, não garantia de alinhamento visual.
- Ícones com massa visual assimétrica podem receber compensação óptica específica.
- A compensação deve mover o ícone, não a palavra, quando o rótulo já estiver na régua correta.
- A compensação deve ser mínima, normalmente entre 1 e 3 px, e validada visualmente.
- Linhas-guia e sobreposições coloridas são permitidas apenas como diagnóstico temporário; não permanecem na UI final.
- O ajuste não pode alterar significado, área de toque, ordem dos itens ou hierarquia operacional.

Aplicação obrigatória:

- Header.
- Dock/rodapé.
- Resumos superiores.
- Filtros.
- Menus.
- Indicadores.
- Atalhos internos.
- Todos os componentes futuros com ícone + texto.

Regra:

Quando cálculo e percepção divergirem, prevalece o alinhamento óptico aprovado.

## RVL-035 — Dock Ativo por Massa Óptica

O item ativo de uma dock, rodapé ou faixa de atalhos deve destacar a intenção operacional do item, não a coluna inteira do layout.

Nome oficial do padrão:

**DNA Dock Ativo por Massa Óptica**

Princípios:

- O destaque ativo envolve o conjunto real formado por ícone, rótulo e área mínima confortável de toque.
- O destaque não deve nascer apenas no ícone, nem ocupar o slot inteiro quando isso gerar peso visual excessivo.
- Ícone e rótulo devem permanecer centralizados entre si dentro da mesma massa óptica.
- A superfície ativa deve ter respiro suficiente para leitura, mas não pode invadir visualmente o espaço dos itens vizinhos.
- A largura da superfície deve acompanhar o rótulo, o ícone e o respiro mínimo aprovado.
- A altura deve acolher ícone e rótulo sem parecer card, botão pesado ou cápsula dominante.
- Hover, foco e ativo devem usar a mesma família de superfície, variando apenas intensidade.
- Badges permanecem presos ao ícone ou elemento de origem, sem alterar o eixo do conjunto.
- Quando houver guia visual, o centro óptico do conjunto ativo deve bater com o eixo aprovado da tela.

Aplicação obrigatória:

- Dock inferior.
- Rodapés operacionais.
- Atalhos fixos de telas principais.
- Faixas de navegação com ícone + rótulo.
- Elementos futuros que tenham comportamento equivalente ao dock.

Checklist antes de aprovar:

- O destaque cobre ícone e rótulo?
- O ícone está centralizado visualmente sobre o rótulo?
- O destaque está centralizado no mesmo eixo do conjunto?
- O destaque respeita as margens e a régua óptica da tela?
- O destaque não compete com itens vizinhos?
- O modo dia e o modo noite mantêm o mesmo teor de destaque?

## CAO — Centro de Atenção Operacional

O RondonIA OS não utiliza Centro de Notificações.

O padrão oficial · o Centro de Atenção Operacional, ou CAO.

O CAO organiza:

- Críticas.
- Importantes.
- Atenção.
- Informações.

## Padrão Login Geral

A tela de Login Geral · a tela piloto do DNA Visual Alvorada v1.

- Usa a logo oficial como principal elemento visual.
- Usa `OperatorIdField` para identificação de operador.
- Campo de PIN centralizado.
- Foco natural entre campos.
- Botão principal segue RVL-002.
- Modal Redefinir PIN segue o mesmo DNA visual.

## Aplicação Obrigatória

Toda nova tela deve consultar este documento antes de ser implementada.

Prioridade visual:

1. DNA da marca.
2. Hierarquia operacional.
3. Simplicidade.
4. Consistência com o Design System.

O framework nunca deve parecer mais forte que a identidade da marca.
