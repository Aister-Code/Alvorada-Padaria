# RondonIA Visual Language

## Posição no Produto

O RondonIA Visual Language, ou RVL, é a camada visual acima do Design System.

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

### Modo Dia

- Fundo: `#D5D4C8`
- Campos: `#E4E2D7`
- Foco: `#E8E6DC`
- Texto: `#5D5822`
- Ação: `#F04A2A`

### Modo Noite

- Fundo: `#5D5822`
- Campos: `#696328`
- Texto: `#F8C6AA`
- Ação: `#F04A2A`

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

## RVL-003 — Iconografia Operacional

A iconografia operacional é parte da linguagem principal do RondonIA OS.

- Ícone comunica.
- Texto confirma.
- A mesma semântica visual deve se repetir em todo o sistema.
- Ícones devem ser simples, reconhecíveis e funcionais.
- Não usar iconografia decorativa quando ela não acrescenta leitura operacional.

## RVL-004 — Saúde Operacional

A Saúde Operacional representa tendência e confiabilidade do ambiente, não apenas um evento instantâneo.

- Usar índice operacional preparado para média por período.
- A janela recomendada para evolução é média móvel de 5 minutos.
- Adaptar os itens exibidos por perfil.
- Sinalizar somente quando houver impacto operacional.
- Não marcar vermelho por um evento isolado sem confirmação de tendência.

Estados do ISO:

- Verde: 95–100%.
- Amarelo: 80–94%.
- Laranja: 60–79%.
- Vermelho: abaixo de 60%.

## RVL-005 — Atenção Contextual

A Atenção Contextual organiza pendências por urgência, importância e perfil.

- `info`: discreto.
- `attention`: amarelo.
- `important`: laranja.
- `critical`: vermelho.

Regras:

- Ícone comunica.
- Texto confirma.
- Não piscar.
- Não usar som nesta versão.
- Não vibrar nesta versão.
- Preparar alarme e vibração apenas para evento crítico quando a tela estiver off.
- Nunca interromper sem motivo.

## RVL-006 — Responsividade Intencional

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
- Permitir sugestão do sistema.
- Respeitar perfil, unidade, período e função.

## RVL-007 — Planos Visuais Simplificados

A linguagem visual do RondonIA OS usa poucos planos para reduzir ruído.

- Separar blocos por ritmo, alinhamento, espaço e proporção.
- Não usar mudanças constantes de cor para explicar a tela.
- O operador deve perceber temperatura e identidade, não camadas artificiais.

## RVL-008 — Tela Principal Sem Rolagem

Telas principais operacionais devem caber na viewport do dispositivo elegível.

- A tela principal não deve depender de scroll vertical.
- A responsividade deve adaptar proporções, respiros, altura dos cards e acabamento.
- Popovers, menus e painéis internos podem ter rolagem própria quando necessário.

## RVL-009 — Grid Óptico

Toda tela operacional deve seguir um grid invisível.

- Logo, textos, títulos, ícones, menus e cards devem parecer parte de uma única composição.
- Menus de widgets configuráveis devem compartilhar o mesmo eixo sempre que possível.
- O alinhamento visual tem prioridade sobre alinhamento puramente matemático.

## RVL-010 — Modelo de 3 Planos

### Plano 0 — Ambiente

Fundo da tela. Modo dia usa off-white quente; modo noite usa oliva profundo.

### Plano 1 — Operação

Área operacional: Operação Agora, Jornada Hoje, módulos, cards e widgets.

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

- A hierarquia é criada pela composição.
- O operador nunca procura informação.
- A informação encontra o operador.
- Ritmo visual é mais importante que quantidade de componentes.
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
- A preferência deve ser salva por operador.
- O próprio controle no header deve indicar a escala ativa.

## RVL-015 — Navegação Natural

Widgets operacionais representam resumos.

- Não existe ação de expandir widget.
- Ao tocar em um widget, abrir sua tela correspondente.
- O retorno acontece pelo botão Back.
- Os três pontos permanecem apenas para configuração do widget, quando existir.

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

- Lista compacta com valor atual à direita.
- Dropdown contextual ao tocar.
- Cada critério aparece em uma linha de controle.
- Nome do critério à esquerda.
- Valor atual à direita.
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

## RVL-018.1 — Sugestão do Sistema

Configurações contextuais podem oferecer sugestão do sistema como estado ativo.

Regras:

- Usar checkbox ou toggle discreto.
- Quando ativo, aplicar as opções padrão do sistema.
- Se o operador alterar qualquer opção manualmente, sair automaticamente do modo sugestão.
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
- Ícones: branco quente.
- Destaques: branco.

Modo noite:

- Superfície do Plano 2: bege quente.
- Texto principal: oliva.
- Texto secundário: oliva suavizado.
- Ícones: oliva.
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
- Ícones devem permanecer somente quando agregarem significado.
- Opções disponíveis nunca devem parecer desabilitadas.

## RVL-023 — Indicadores Operacionais

Todo indicador operacional deve conter:

1. Ícone.
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

- O Header deve mostrar o modo operacional em uso, não o perfil base.
- O perfil base pertence à identidade e auditoria, não ao título operacional da tela.
- O contexto deve acompanhar trocas futuras de modo operacional e unidade.
- Exemplo: `Atendimento • Matriz`.
- Nenhum título principal de módulo deve quebrar em mais de duas linhas.
- Sempre que possível, o título principal deve permanecer em uma linha.
- Subtítulos operacionais essenciais não devem ser truncados.
- Se faltar espaço, reduzir levemente fonte, espaçamento ou densidade dos controles antes de cortar contexto essencial.

## CAO — Centro de Atenção Operacional

O RondonIA OS não utiliza Centro de Notificações.

O padrão oficial é o Centro de Atenção Operacional, ou CAO.

O CAO organiza:

- Críticas.
- Importantes.
- Atenção.
- Informações.

## Padrão Login Geral

A tela de Login Geral é a tela piloto do DNA Visual Alvorada v1.

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
