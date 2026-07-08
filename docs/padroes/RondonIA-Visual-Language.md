# RondonIA Visual Language

## Posicao no Produto

O RondonIA Visual Language, ou RVL, e a camada visual acima do Design System.

O Design System define componentes, contratos, estados e consistencia tecnica.
O RVL define a expressao visual, a hierarquia, o silencio da interface e a forma como o DNA da marca aparece no produto.

Toda nova tela deve consultar este documento antes de ser implementada.

## Principios

- Premium.
- Ultra clean.
- Poucas cores.
- Silencio visual.
- Foco na operacao.
- Identidade da marca acima do framework.
- Interface conduz por hierarquia, nao por efeitos.

## DNA Parametrizavel por Cliente

Cada cliente deve ter um DNA visual proprio, parametrizado antes da implementacao das telas.

Parametros obrigatorios:

- Cor estrutural.
- Cor de acao.
- Superficies.
- Texto.
- Modo dia.
- Modo noite.

O objetivo e manter um sistema reconhecivel como RondonIA OS, mas com identidade viva e especifica para cada marca.

## DNA Alvorada v1

### Modo Dia

- Fundo: `#D5D4C8`
- Campos: `#E4E2D7`
- Foco: `#E8E6DC`
- Texto: `#5D5822`
- Acao: `#F04A2A`

### Modo Noite

- Fundo: `#5D5822`
- Campos: `#696328`
- Texto: `#F8C6AA`
- Acao: `#F04A2A`

## RVL-001 â€” Campo Editavel

Nenhum componente editavel pode parecer bloqueado.

Regras:

- Campo editavel deve aceitar clique/toque em toda a sua area util.
- O usuario nunca deve precisar descobrir onde clicar.
- Estado visual de edicao deve ser claro, mas discreto.
- Campos nao devem parecer caixas tradicionais de ERP.
- Bordas fixas devem ser evitadas.
- Foco pode usar borda ultra fina, sem outline pesado.

## RVL-002 â€” Botao Principal

O botao principal mantem presenca por cor, contraste e hierarquia.

Regras:

- Usar a cor de acao do DNA.
- Texto com contraste claro.
- Sem sombra difusa externa.
- Sem glow.
- Sem efeito spray.
- Estado inativo com aproximadamente 75% de opacidade.
- A presenca do botao deve vir da hierarquia visual, nao de efeitos decorativos.

## RVL-003 - Iconografia Operacional

A iconografia operacional e parte da linguagem principal do RondonIA OS.

Regras:

- Icone comunica.
- Texto confirma.
- A mesma semantica visual deve se repetir em todo o sistema.
- Icones devem ser simples, reconheciveis e funcionais.
- Nao usar iconografia decorativa quando ela nao acrescenta leitura operacional.
- Nao usar animacoes, glow ou efeitos para compensar falta de hierarquia.

## RVL-004 - Saude Operacional

A Saude Operacional representa tendencia e confiabilidade do ambiente, nao apenas um evento instantaneo.

Regras:

- Usar indice operacional preparado para media por periodo.
- A janela recomendada para evolucao e media movel de 5 minutos.
- Adaptar os itens exibidos por perfil.
- Sinalizar somente quando houver impacto operacional.
- Nao marcar vermelho por um evento isolado sem confirmacao de tendencia.
- Estados devem seguir leitura semaforica discreta.

Estados do ISO:

- Verde: 95-100%.
- Amarelo: 80-94%.
- Laranja: 60-79%.
- Vermelho: abaixo de 60%.

## RVL-005 - Atencao Contextual

A Atencao Contextual organiza pendencias por urgencia, importancia e perfil.

Prioridades:

- `info`: discreto.
- `attention`: amarelo.
- `important`: laranja.
- `critical`: vermelho.

Regras:

- Icone comunica.
- Texto confirma.
- Nao piscar.
- Nao usar som nesta versao.
- Nao vibrar nesta versao.
- Preparar alarme e vibracao apenas para evento critico quando a tela estiver off.
- Nunca interromper sem motivo.
- O destaque visual deve ser pequeno, objetivo e coerente com o DNA visual.

## RVL-006 - Responsividade Intencional

Nenhuma tela principal deve deixar grandes areas vazias sem intencao de design.

Regras:

- A interface deve usar a altura disponivel com harmonia.
- Nao preencher espaco com conteudo artificial.
- Mobile estreito deve priorizar toque, leitura e grids simples.
- Tablet deve aumentar respiro, area clicavel e proporcao visual.
- Desktop nao deve esticar componentes exageradamente.
- A leitura principal deve continuar possivel em ate 5 segundos.
- A responsividade deve preservar o DNA visual antes de preservar densidade.

## RAW-001 - Configuracao Contextual

Configuracoes devem manter o contexto operacional visivel.

Regras:

- Evitar tela cheia quando nao for necessario.
- Preferir popover expandido, sheet leve ou card contextual.
- Usar switches/on-off quando possivel.
- Usar selecao unica para filtros mutuamente exclusivos.
- Usar selecao multipla quando fizer sentido operacional.
- Bloquear combinacoes invalidas.
- Permitir sugestao do sistema.
- Respeitar perfil, unidade, periodo e funcao.
- O operador deve conseguir configurar sem perder a leitura da tela principal.

## RVL-007 - Planos Visuais Simplificados

A linguagem visual do RondonIA OS usa poucos planos para reduzir ruido.

Regra:

- Evitar hierarquias excessivas de superficie.
- Separar blocos por ritmo, alinhamento, espaco e proporcao.
- Nao usar mudancas constantes de cor para explicar a tela.
- O operador deve perceber temperatura e identidade, nao camadas artificiais.

## RVL-008 - Tela Principal Sem Rolagem

Telas principais operacionais devem caber na viewport do dispositivo elegivel.

Regras:

- A tela principal nao deve depender de scroll vertical.
- A responsividade deve adaptar proporcoes, respiros, altura dos cards e acabamento.
- Popovers, menus e paineis internos podem ter rolagem propria quando necessario.
- Se faltar espaco, reduzir proporcionalmente elementos antes de permitir rolagem.
- Se sobrar espaco, distribuir blocos e area clicavel com harmonia.
- Nao adicionar conteudo artificial para preencher tela.

## RVL-009 - Grid Optico

Toda tela operacional deve seguir um grid invisivel.

Regras:

- Logo, textos, titulos, icones, menus e cards devem parecer parte de uma unica composicao.
- Menus de widgets configuraveis devem compartilhar o mesmo eixo sempre que possivel.
- O alinhamento visual tem prioridade sobre alinhamento puramente matematico.
- Nenhum elemento deve parecer solto, deslocado ou flutuando fora do ritmo.
- A tela deve conduzir leitura sem esforco: header, operacao, jornada e modulos.

## RVL-010 - Modelo de 3 Planos

Este e o modelo oficial de superficies do RondonIA OS.

### Plano 0 - Ambiente

Representa o ambiente da aplicacao.

Uso:

- Fundo da tela.
- Modo dia: off-white quente.
- Modo noite: oliva profundo.
- Sem textura.
- Sem ruido.
- Sem gradiente forte.

### Plano 1 - Operacao

Representa toda a area operacional.

Uso:

- Operacao Agora.
- Jornada Hoje.
- Modulos.
- Cards e widgets operacionais.

Regra:

- Todos os elementos operacionais compartilham a mesma superficie.
- A separacao acontece por respiro, composicao, hierarquia e tipografia.
- Nao criar diferencas artificiais de cor entre blocos operacionais.

### Plano 2 - Contexto

Representa elementos temporarios ou contextuais.

Uso:

- Menus.
- Popovers.
- Configuracao.
- Ajuda.
- Modais.

Regra:

- Pode usar uma superficie ligeiramente diferente.
- Deve parecer flutuar naturalmente sobre a operacao.
- Sem glow.
- Sem sombra pesada.
- Sem borda tradicional.
- Quando necessario, usar apenas linha optica extremamente discreta.

## RVL-011 - Configuracao Contextual sem Ruido

Configuracoes devem parecer ferramentas contextuais, nao formularios extensos.

Regras:

- Manter o contexto visivel.
- Evitar telas cheias.
- Evitar textos explicativos longos.
- Priorizar organizacao visual, agrupamento e chips compactos.
- Usar componentes progressivos quando necessario: grupos recolhiveis, tabs, etapas ou paginacao interna.
- Rolagem em popovers deve ser o ultimo recurso.
- A configuracao deve continuar agradavel mesmo sem backend conectado.

## RVL-012 - Composicao Editorial

A interface conduz o olhar.

Principios:

- A hierarquia e criada pela composicao.
- O operador nunca procura informacao.
- A informacao encontra o operador.
- Ritmo visual e mais importante que quantidade de componentes.
- Respiros, massas e proporcoes substituem linhas divisorias.
- A tela deve ser lida naturalmente: header, operacao, jornada e modulos.
- A interface nao deve chamar atencao; o trabalho do operador deve chamar atencao.

## RVL-013 - Contexto Contrasta

Elementos do Plano 2 devem destacar-se pela temperatura da superficie, nunca por efeitos graficos.

Regras:

- Plano 2 inclui menus, popovers, configuracoes, ajuda e modais.
- Modo dia usa branco quente.
- Modo noite usa bege quente.
- A separacao deve acontecer pela temperatura da superficie.
- Nao usar glow.
- Nao usar sombra pesada.
- Nao usar bordas tradicionais.
- Se necessario, usar apenas linha optica extremamente discreta.
- Chips em estado normal devem ter baixo contraste.
- Chips ativos usam oliva com texto claro.

## RVL-014 - Escala Tipografica Global

O operador pode escolher a escala da interface.

Opcoes:

- Pequeno.
- Normal.
- Grande.

Principios:

- A escala nao altera apenas a fonte.
- Fonte, respiros, altura de componentes e area clicavel devem adaptar-se proporcionalmente.
- O ajuste deve respeitar o DNA visual e nao quebrar a composicao.
- Popovers, modais e widgets devem acompanhar a escala.
- A preferencia deve ser salva por operador.

## RAW-002 - Preferencias por Operador

O RondonIA OS deve preparar preferencias persistentes por operador.

Preferencias previstas:

- Tema.
- Tamanho da interface.
- Widgets expandidos ou compactos.
- Favoritos.
- Configuracoes dos widgets.

Regras:

- Preferencias locais podem ser usadas enquanto nao houver backend dedicado.
- A estrutura deve estar pronta para migracao futura para persistencia real.
- A preferencia nunca deve alterar regra de negocio.
- O operador deve poder adaptar a interface sem perder contexto operacional.

## RVL-016 - Inversao de Temperatura

Ferramentas contextuais usam temperatura oposta ao Plano 1.

Principio:

- Plano 2 inclui menus, popovers, configuracoes, ajuda e modais.
- Plano 2 deve contrastar naturalmente com o Plano 1.
- O contraste deve vir da temperatura da superficie, nao de efeito visual.

Exemplo:

- Modo Dia: Plano 1 usa neutros claros; Plano 2 usa oliva.
- Modo Noite: Plano 1 usa oliva; Plano 2 usa bege quente.

Objetivo:

- Criar leitura imediata de contexto.
- Evitar que configuracoes parecam parte permanente da operacao.
- Preservar silencio visual.

Nunca depender de:

- Glow.
- Sombra pesada.
- Bordas tradicionais.

## Padrao Login Geral

A tela de Login Geral e a tela piloto do DNA Visual Alvorada v1.

Padroes:

- Usa a logo oficial como principal elemento visual.
- Usa `OperatorIdField` para identificacao de operador.
- Campo de PIN centralizado.
- Foco natural entre campos.
- Botao principal segue RVL-002.
- Modal Redefinir PIN segue o mesmo DNA visual.
- Modo dia e modo noite devem preservar a mesma hierarquia.

## OperatorIdField

Comportamento:

- Campo vazio ou em edicao mostra apenas o ID centralizado.
- Ao completar o tamanho configurado do ID, valida automaticamente.
- Quando valido, exibe `ID | Nome`.
- O nome e apenas visual e nunca faz parte do valor editavel.
- Ao clicar/tocar em qualquer area do campo, entra em reedicao.
- Ao reeditar, esconde o nome e mostra somente o ID.
- Enter, Tab e blur confirmam a validacao.

## Aplicacao Obrigatoria

Toda nova tela deve consultar este documento antes de ser implementada.

Quando houver duvida visual, a prioridade deve ser:

1. DNA da marca.
2. Hierarquia operacional.
3. Simplicidade.
4. Consistencia com o Design System.

O framework nunca deve parecer mais forte que a identidade da marca.

