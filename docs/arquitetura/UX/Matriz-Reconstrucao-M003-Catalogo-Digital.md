# Matriz de Reconstrucao M-003 - Catalogo Digital

## Objetivo

Auditar o estado atual do M-003 Catalogo Digital antes de qualquer reconstrucao funcional ou visual.

Esta matriz nao autoriza implementacao automatica. Ela registra onde o modulo esta, o que funciona, o que diverge do DNA aprovado e qual caminho de reconstrucao deve ser seguido sem substituir codigo funcional de forma cega.

## Referencias

- `docs/arquitetura/DMI/DMI-Jornada-Cliente-Catalogo-Digital.md`
- `docs/arquitetura/MHO/MHO-Jornada-Cliente-Catalogo-Digital.md`
- `docs/arquitetura/planos/Plano-Fase-1-Jornada-Cliente-Catalogo.md`
- `docs/arquitetura/UX/DNA-Cardapio-Digital-Aprovado.md`
- `docs/arquitetura/UX/UX-Cardapio-Digital-Telas-Modais.md`
- `docs/arquitetura/UX/Matriz-Reconciliacao-Cardapio-Foundation.md`

## Localizacao Atual

| Parte | Local atual | Observacao |
|---|---|---|
| Rota publica principal | `/cardapio` | Ligada em `src/App.tsx`. |
| Alias publico | `/catalogo` | Ligado em `src/App.tsx`. |
| Pagina principal | `src/pages/catalog/page.tsx` | Contem header, saudacao, promocoes, busca, categorias, cards, footer e carrinho visual local. |
| Listagem de categorias | `src/pages/catalog/page.tsx` | `nav` horizontal com chips e fallback local. |
| Listagem de produtos | `src/pages/catalog/page.tsx` | `CategoryProducts`, `SearchResults`, `ProductCard`, `ProductCardSkeleton`. |
| Card de produto | `src/pages/catalog/page.tsx` | `ProductCard` interno, nao separado em arquivo proprio. |
| Ficha de produto | `src/pages/catalog/_components/ProductSheet.tsx` | Sheet inferior com foto, preco base, tamanho, observacao, ajuda, quantidade e adicionar. |
| Carrinho visual | `src/pages/catalog/page.tsx` | Estado local `visualCart`; nao persistido em OJC nesta tela. |
| Backend de categorias/produtos | `convex/catalog/categories.ts`, `convex/catalog/products.ts`, `convex/catalog/list.ts` | Queries e seed de categorias/produtos. |
| Backend OJC catalogo | `convex/ojc/catalogo.ts` | Sessoes, carrinho snapshot, ajuda, vinculos e conversao para pedido existente. Nao esta ligado a UI publica nesta etapa. |
| Estilos globais | `src/index.css` | Tokens RVL, tema claro/escuro, scrollbar e fontes. |
| Assets locais | `src/assets/branding/alvorada-*` | Assets de marca existem, mas a tela usa composicao textual da marca. |
| Screenshots existentes | `docs/screenshots/*` | Existem muitos prints de outras telas; nao havia print oficial de catalogo encontrado no repositorio antes desta auditoria. |

## Evidencias Produzidas

Pasta:

```text
docs/screenshots/auditoria-m003-catalogo-digital/
```

Arquivos:

- `01-catalogo-principal-escuro.png`
- `02-cabecalho-menu-aberto.png`
- `03-promocoes-abertas.png`
- `04-busca-pizza.png`
- `05-ficha-produto-pizza-variacoes.png`
- `06-produto-com-variacao-grande.png`
- `07-carrinho-com-item.png`
- `08-card-produto-recorte.png`
- `09-catalogo-principal-claro.png`
- `10-catalogo-principal-escuro-mobile.png`
- `11-ficha-produto-sem-complementos.png`

Observacao: o print `11-ficha-produto-sem-complementos.png` evidencia ausencia de secao de complementos na ficha atual; nao foi criado estado visual artificial.

## Auditoria Funcional

| Item | Estado | Evidencia / motivo |
|---|---|---|
| Carregamento de categorias | funcional | Carrega categorias do backend ou fallback local. |
| Troca entre categorias | funcional | Chips horizontais atualizam `activeCategoryId`. |
| Rolagem entre categorias | funcional | `overflow-x-auto` com `scrollbar-hide`; depende de largura/conteudo. |
| Busca | funcional | Campo filtra por `api.catalog.products.search` ou fallback local. |
| Promocoes | parcial | Expande/recolhe, mas conteudo e placeholder, sem fonte operacional real. |
| Abertura da ficha | funcional | Toque no card abre `ProductSheet`. |
| Ampliacao da foto | parcial | Foto aparece ampliada na sheet, mas nao ha acao independente de zoom/ampliar imagem. |
| Variacoes | parcial | Suporta apenas `sizes` simples; nao cobre variacoes completas da Foundation. |
| Complementos | ausente | Nao ha UI, schema de produto ou contrato ligado na ficha atual. |
| Observacoes | parcial | Campo visual na ficha; nao persiste no carrinho visual nem OJC. |
| Quantidade | funcional parcial | Ajusta quantidade no sheet e total do botao; ao adicionar, carrinho visual soma apenas 1 unidade do produto. |
| Adicionar ao carrinho | parcial | Atualiza `visualCart` local; nao persiste em OJC. |
| Editar item | ausente | Nao existe tela/modal de carrinho editavel. |
| Remover item | ausente | Nao existe lista de carrinho com remover. |
| Subtotal e total | parcial | Total geral aparece no footer; subtotal/lista por item nao existe. |
| Persistencia durante navegacao | parcial | Estado React persiste enquanto a pagina permanece montada; perde em reload e nao cria sessao. |
| Botao Ajuda/WhatsApp | parcial | Ajuda visual existe; nao dispara OJC, WhatsApp ou Central. |
| Estado aberta/fechada | parcial | `isStoreOpen` fixo como `true`; fechado nao testavel por dado real. |
| Tema dia/noite | funcional | Alternancia via `next-themes`. |

## Auditoria Visual Contra DNA Aprovado

| Componente | Decisao homologada | Implementacao atual | Divergencia | Risco | Proposta | Prioridade | Arquivos afetados | Screenshot necessario |
|---|---|---|---|---|---|---|---|---|
| Abertura | Produtos visiveis cedo, sem splash de marca | Produtos aparecem cedo em viewport movel | Direcao geral correta | Baixo | Preservar estrutura e refinar proporcoes | ajuste fino | `src/pages/catalog/page.tsx` | Sim |
| Header | H1: uma linha com `[Logo/esteira] [Ola, Joao! v] [relogio Aberta v] [tema] [menu]` | Composicao antiga superada: status em segunda linha, promocoes fixas e carrinho vazio na abertura | Organizacao antiga nao segue mais o DNA recente | Alto se mantiver duas linhas ou faixa fixa sem dado real | Substituir por cabecalho H1, esteira contextual, painel pessoal, status na linha e menu institucional | urgente | `src/pages/catalog/page.tsx`, `docs/arquitetura/UX/UX-Cardapio-Digital-Telas-Modais.md` | Sim |
| Status Aberta | `Aberta` com icone de relogio | Texto `Aberta` em pill verde, sem icone | Falta semantica visual | Status pode parecer tag generica | Inserir relogio fino sem poluir | ajuste fino | `src/pages/catalog/page.tsx` | Sim |
| Menu | Tres pontos, acoes secundarias | Tres pontos vertical funcional | Correto, mas sem icones e fechamento por fora nao auditado | Medio | Ajustar superficie e comportamento de fechamento | ajuste fino | `src/pages/catalog/page.tsx` | Sim |
| Promocoes | Expansiveis, compactas, ate 2/3 itens reais | Expandem com textos placeholder | Conteudo nao operacional | Pode parecer mock definitivo | Manter como fallback sinalizado ate fonte real | essencial | `src/pages/catalog/page.tsx` | Sim |
| Busca | Compacta, alinhada a regua, placeholder claro | Funcional e compacta | Boa base; validar margens no refinamento | Baixo | Refinar regua optica | ajuste fino | `src/pages/catalog/page.tsx` | Sim |
| Categorias | Chips com texto, sem scrollbar aparente | Chips funcionais com emoji + texto | Categorias fallback nao homologadas; emoji pode destoar da Foundation | Medio | Usar fallback apenas como preview e categorias homologadas no cadastro real | essencial | `src/pages/catalog/page.tsx`, `convex/catalog/*` futuro | Sim |
| Produto/foto | Foto protagonista | Foto 64x64 lateral | Foto existe, mas ainda pouco protagonista em alguns cards | Visual menos apetitoso | Aumentar protagonismo sem virar marketplace pesado | essencial | `src/pages/catalog/page.tsx` | Sim |
| Produto/selos | Selos equilibrados | `mais pedido` e `de sempre`; alguns sempre aparecem | Selos podem virar ruído se permanentes | Medio | Definir elegibilidade real por produto/promocao | essencial | `src/pages/catalog/page.tsx`, backend futuro | Sim |
| Produto/preco + `+` | Preco sem cifrao fundido ao `+` | Preco e `+` no mesmo botao | Correto conceitualmente | Baixo | Refinar massa optica e clique | ajuste fino | `src/pages/catalog/page.tsx` | Sim |
| Produto/card | Sem card pesado, sem marketplace generico | Card leve com foto, texto e acao | Ainda usa borda/card padrao e composicao de app dev | Medio | Polir superficies, densidade e foto | essencial | `src/pages/catalog/page.tsx` | Sim |
| Ficha/foto | Foto ampliada | Foto no topo da sheet | Funcional, sem zoom independente | Medio | Manter sheet e avaliar zoom somente se homologado | ajuste fino | `ProductSheet.tsx` | Sim |
| Ficha/variacoes | Variações claras | Tamanhos simples | Parcial; nao cobre sabor/massa/volume | Alto | Modelar variacoes antes de backend real | essencial | `ProductSheet.tsx`, schema futuro | Sim |
| Ficha/complementos | Complementos disponiveis quando aplicavel | Ausente | Lacuna funcional | Alto | Criar contrato antes de implementar UI final | urgente | DMI/MHO/schema futuro, `ProductSheet.tsx` | Sim |
| Ficha/observacao | Observacao por item | Campo visual | Nao entra no snapshot visual | Alto | Persistir no item do carrinho/OJC quando fase permitir | essencial | `ProductSheet.tsx`, OJC futuro | Sim |
| Carrinho vazio | Estado claro e contextual | Footer mostra carrinho vazio | Funcional visual | Baixo | Preservar linguagem sem Pedido | ajuste fino | `src/pages/catalog/page.tsx` | Sim |
| Carrinho com item | Quantidade, total, ver carrinho | Footer mostra quantidade e total | Nao tem lista, editar/remover | Alto | Implementar carrinho visual completo antes de OJC persistente | essencial | `src/pages/catalog/page.tsx` + componente futuro | Sim |
| Ajuda | Sempre acessivel, preserva contexto | Botao Ajuda visual | Nao cria evento OJC | Medio | Manter visual ate F1.2; depois ligar a sessao | essencial | `src/pages/catalog/page.tsx`, `convex/ojc/catalogo.ts` futuro | Sim |
| Tema claro/escuro | Dia/noite preservados | Funcional | Precisa polimento visual fino | Baixo | Ajustar por superficie sem quebrar RVL | ajuste fino | `src/index.css`, `src/pages/catalog/page.tsx` | Sim |
| Dados reais | Fallback nao e fonte real | Fallback local + seed Convex com encoding quebrado | Risco de homologar mock | Alto | Corrigir seed/encoding e separar fallback de cadastro real | urgente | `convex/catalog/*`, docs | Sim |
| Separacao Catalogo/Carrinho/Pedido/Venda | Inviolavel | UI nao cria pedido/venda | Correto | Baixo | Preservar | essencial | Todos | Nao |

## Plano de Reconstrucao em Fases

## M-003.H2 - Modal do Cliente, Horario Retratil e Esteira

| Item | Decisao homologada | Implementacao atual | Divergencia | Risco | Proposta | Prioridade | Arquivos afetados | Screenshot necessario |
|---|---|---|---|---|---|---|---|---|
| Painel do cliente | Exatamente tres areas: Identidade, Participacoes, Pedido/Jornada | Painel H2 estruturado nas tres areas, sem Area 4 | Backend de cliente ainda inexistente | Inventar dados pessoais ou beneficios falsos | Manter estado vazio honesto e edicao demonstrativa | essencial | `src/pages/catalog/page.tsx`, `docs/arquitetura/UX/UX-Cardapio-Digital-Telas-Modais.md` | Sim |
| Area 1 - Identidade | Foto opcional, nome, `Editar informacoes` | Implementada com nome, avatar simbolico e edicao contextual | Persistencia real ausente | Cliente acreditar em cadastro permanente | Sinalizar demonstracao ate contrato de cliente | essencial | `src/pages/catalog/page.tsx` | Sim |
| Area 2 - Participacoes | Minhas promocoes, acoes, cupons/beneficios, fidelidade/progresso | Implementada como componente compartilhado com estado vazio | Sem fonte real de campanha/cupom | Misturar oferta geral com beneficio pessoal | Reutilizar componente na esteira e painel | essencial | `src/pages/catalog/page.tsx` | Sim |
| Area 3 - Pedido/Jornada | Pedido atual quando houver; sem pedido, estado vazio | Implementada como componente compartilhado; sem pedido em andamento | Sem contrato de pedido/status real | Confundir catalogo com Pedido operacional | Manter linguagem de jornada, sem criar Pedido | essencial | `src/pages/catalog/page.tsx` | Sim |
| Cliente nao identificado | Header mostra `Ola!`; cardapio nunca bloqueia; pedir somente nome | Implementado via estado local/controlado e fluxo progressivo | Sem backend de cliente | Criar cadastro ficticio definitivo | Manter local/preparado ate contrato OJC/cliente | essencial | `src/pages/catalog/page.tsx` | Sim |
| Edicao do cliente | Dentro da Area 1; nome/foto/salvar/cancelar | Implementada como superficie controlada | Sem persistencia real | Prometer gravacao permanente | Sinalizar demonstracao | ajuste fino | `src/pages/catalog/page.tsx` | Sim |
| Status operacional | `[relogio] Aberta v` na primeira linha; retratil contextual | Implementado com canais em atualizacao | Sem fonte real de horarios/canais | Informar disponibilidade falsa | Manter estado controlado ate backend de horarios | essencial | `src/pages/catalog/page.tsx` | Sim |
| Esteira da logo | Expansao horizontal a partir da marca; destinos reutilizam Areas 2 e 3 | Implementada em linha, com Promocoes, Acoes, Beneficios e Pedidos | Sem backend dos destinos | Criar carrossel decorativo sem utilidade | Manter como porta de jornada e fechar por escolha/clique fora/Escape | essencial | `src/pages/catalog/page.tsx` | Sim |
| Superficie unica | Apenas uma superficie aberta por vez | Implementada via `activeHeaderSurface` unico | Requer auditoria visual em viewports estreitos | Sobreposicao de popovers | Validar 408, 360 e 320 px | ajuste fino | `src/pages/catalog/page.tsx` | Sim |
| Linhas-guia | Temporarias para afericao; remover no final | Mantidas apenas para auditoria visual | Podem vazar na homologacao final | Poluir versao final | Produzir evidencias limpas e remover antes do aceite final | urgente antes do final | `src/pages/catalog/page.tsx` | Sim |

### Fase A - Travar diagnostico e referencias

- Preservar screenshots desta auditoria.
- Separar claramente fallback, seed e fonte real.
- Corrigir typos/encoding nos textos exibidos antes de refinamento visual.
- Confirmar se ha prints externos aprovados a importar como referencia, sem copiar codigo.

### Fase B - Reconstrucao visual segura da abertura

- Header compacto com logo/esteira aprovada.
- Status `Aberta/Fechada` com relogio fino.
- Promocoes compactas e expansivas.
- Busca, categorias e cards na regua optica mobile.
- Produtos visiveis cedo.

### Fase C - Produto e ficha

- Produto como entidade unica.
- Variacoes sem duplicar produto.
- Complementos estruturados.
- Observacao por item.
- Sheet com quantidade e preco atualizado.

### Fase D - Carrinho visual completo

- Lista do carrinho.
- Editar item.
- Remover item.
- Subtotal e total.
- Continuar escolhendo.
- Pedir ajuda sem criar Pedido.

### Fase E - Ligacao OJC planejada

- Criar/recuperar sessao de catalogo.
- Persistir snapshot do carrinho.
- Registrar ajuda/contexto.
- Relacionar conversa quando aplicavel.
- Nao converter para Pedido sem contrato OJC/ROR.

## Riscos de Regressao

- Trocar fallback por cadastro real sem homologacao.
- Confundir carrinho visual com Pedido operacional.
- Quebrar rota publica sem login.
- Perder tema claro/escuro.
- Duplicar produto por tamanho/sabor.
- Criar complemento como produto.
- Persistir observacao no cadastro fixo do produto.
- Introduzir UI de marketplace generico.
- Reabrir Central/Venda/Caixa/Producao/Delivery fora do escopo.
- Corrigir visual removendo funcionalidade existente de busca/ficha/carrinho local.

## Pendencias de Referencia Visual

- Print original aprovado do Catalogo Digital, se existir fora deste repositorio.
- Print do header em esteira aprovado, se existir.
- Print de card de produto aprovado, se existir.
- Print de ficha com complementos aprovado, se existir.
- Definicao visual final para loja fechada.
- Definicao visual final para carrinho completo.

## Conclusao

O M-003 possui base funcional parcial e util para reconstrucao controlada. A rota publica existe, a vitrine abre sem login, categorias/produtos aparecem, busca e ficha funcionam, tema alterna e carrinho visual local soma itens. As lacunas principais estao em complementos, carrinho completo, persistencia OJC, ajuda real, estado fechado real, encoding de seed/backend e divergencias visuais em relacao ao DNA aprovado.

Recomendacao: nao substituir a tela inteira. Reconstruir por camadas, preservando comportamento funcional existente e validando cada fase com screenshot.

## M-003.H2.1 - Enxugamento das Superficies, Fechamento Contextual e Status Retratil

| Tela/componente | Decisao homologada | Implementacao atual | Divergencia | Risco | Proposta | Prioridade | Arquivos afetados | Screenshot necessario |
|---|---|---|---|---|---|---|---|---|
| Painel cliente | Exatamente tres areas: Identidade, Participacoes e Pedido atual | Painel H2 tinha cards mais pesados e atalhos extras | Excesso de superficie e repeticao de destinos | Medio | Enxugar para tres areas, sem `Ultimo pedido` ou `Pedir novamente` sem fonte real | essencial | `src/pages/catalog/page.tsx` | Sim |
| Edicao cliente | Nome, foto opcional, Salvar e Cancelar | Edicao local existente | Necessita confirmar descarte apenas quando houver alteracao | Medio | Usar confirmacao contextual somente com formulario sujo | essencial | `src/pages/catalog/page.tsx` | Sim |
| Fechamento contextual | Clique fora, Escape, mesmo gatilho, outra superficie ou acao conclusiva fecham a superficie | Fechamento parcial ja existia | Confirmacao precisava respeitar edicao suja | Medio | Centralizar fechamento em `activeHeaderSurface` e bloquear troca quando houver alteracao nao salva | essencial | `src/pages/catalog/page.tsx` | Sim |
| Status operacional | `[relogio] Aberta [v]` retrai para `[relogio] [v]` apos 7s | Status H2 exibia texto permanente | Ocupa espaco maior que o necessario no header | Baixo | Reutilizar duracao de 7s do deslizante de Agenda e manter superficie enxuta | ajuste fino | `src/pages/catalog/page.tsx` | Sim |
| Superficie de status | Apenas `Horarios` e `Horarios e canais em atualizacao.` sem dados falsos | H2 possuia lista Balcao/Retirada/Entrega como placeholder | Pode parecer disponibilidade operacional real | Alto | Remover cards de canal ate existir contrato de horarios | urgente | `src/pages/catalog/page.tsx` | Sim |
| Menu tres pontos | Menu contextual por rota, cliente, permissao e capacidade | Lista fixa institucional | Pode expor opcoes fora de contexto ou duplicar esteira | Medio | Criar contrato `getCatalogMenuItems({ route, customerIdentified, userRole, permissions, capabilities })` | essencial | `src/pages/catalog/page.tsx` | Sim |
| Esteira/destinos | Promocoes, Acoes e Beneficios reutilizam Participacoes; Pedidos reutiliza Pedido atual | H2 ja mapeava destinos, mas com areas mais pesadas | Ruido visual e duplicidade | Baixo | Reutilizar componentes enxutos das areas 2 e 3 | ajuste fino | `src/pages/catalog/page.tsx` | Sim |

## M-003.H2.2 - Proporcao das Superficies, Avatar no Cabecalho e Menu Contextual

| Tela/componente | Decisao homologada | Implementacao atual | Divergencia | Risco | Proposta | Prioridade | Arquivos afetados | Screenshot necessario |
|---|---|---|---|---|---|---|---|---|
| Avatar/cumprimento | Avatar acima do cumprimento como gatilho unico | Cumprimento era textual e horizontal | Identidade pessoal pouco evidente | Medio | Centralizar avatar sobre saudacao sem aumentar header de forma perceptivel | essencial | `src/pages/catalog/page.tsx` | Sim |
| Foto local | Editar foto no padrao leve, sem persistencia real | Botao generico de foto opcional | Parecer upload definitivo sem backend | Medio | Estado demonstrativo local com adicionar/trocar/remover e registro da limitacao | essencial | `src/pages/catalog/page.tsx`, `docs/arquitetura/UX/UX-Cardapio-Digital-Telas-Modais.md` | Sim |
| Painel cliente | Popover compacto, cerca de 52% a 62% em 408 px quando possivel | Painel H2.1 ainda ocupava largura quase total | Cobrir produtos sem necessidade | Alto | Superficie ancorada e responsiva por conteudo | urgente | `src/pages/catalog/page.tsx` | Sim |
| Horario | Superficie compacta com `Horarios / Em atualizacao.` | Texto mais longo | Ruido e largura excessiva | Baixo | Enxugar texto e largura | ajuste fino | `src/pages/catalog/page.tsx` | Sim |
| Menu tres pontos | Menu da tela sem duplicar gatilhos proprios | Incluia Horarios, Meus dados e Meu pedido em H2.1 | Duplicidade conceitual | Medio | Manter Sobre, Como chegar, Falar, Compartilhar e Termos | essencial | `src/pages/catalog/page.tsx` | Sim |
| Logo simples | Marca preservada com halo/contorno discreto | Logo sem base tonal | Perda de definicao em claro/escuro | Baixo | Contorno no container sem alterar o asset oficial | ajuste fino | `src/pages/catalog/page.tsx` | Sim |

## M-003.H2.3 - Identidade com Avatar Lateral e Superficies Ajustadas ao Conteudo

| Tela/componente | Decisao homologada | Implementacao atual | Divergencia | Risco | Proposta | Prioridade | Arquivos afetados | Screenshot necessario |
|---|---|---|---|---|---|---|---|---|
| Identidade no cabecalho | `[avatar] [Ola,] / [Joao! v]` com avatar lateral | H2.2 usava avatar acima do cumprimento | Altura e hierarquia ainda podiam competir com a logo | Medio | Usar avatar lateral maior, texto em duas linhas e bloco compacto | essencial | `src/pages/catalog/page.tsx` | Sim |
| Acao do avatar | Avatar gerencia exclusivamente foto | Avatar fazia parte do gatilho do painel do cliente | Mistura conceitual entre dados e foto | Alto | Separar gatilho: avatar abre foto; saudacao abre cliente | urgente | `src/pages/catalog/page.tsx` | Sim |
| Superficie de foto | Popover pequeno ancorado ao avatar | Acoes de foto estavam dentro da edicao do cliente | Modal grande para acao pequena | Medio | Criar superficie `photo` com Adicionar ou Visualizar/Trocar/Remover | essencial | `src/pages/catalog/page.tsx` | Sim |
| Painel cliente | Altura e largura apenas do conteudo real | H2.2 ja estava menor, mas ainda podia ser ajustado | Cobertura visual desnecessaria | Baixo | Manter tres areas, texto minimo e largura de 14rem | ajuste fino | `src/pages/catalog/page.tsx` | Sim |
| Fechamento externo | Todas as superficies fecham por clique fora, Escape, X, mesmo gatilho ou outra superficie | Fonte unica `activeHeaderSurface` | Necessario revalidar com nova superficie de foto | Medio | Reusar fechamento existente para `photo` | essencial | `src/pages/catalog/page.tsx` | Sim |

## M-003.H2.4 - Simplificacao do Modal do Cliente e Remocao do Avatar do Cabecalho

| Tela/componente | Decisao homologada | Implementacao atual | Divergencia | Risco | Proposta | Prioridade | Arquivos afetados | Screenshot necessario |
|---|---|---|---|---|---|---|---|---|
| Cabecalho | `[Logo] [Ola,] / [Joao! v] [Status] [Tema] [Menu]` | Avatar lateral H2.3 competia com a logo | Excesso de identidade visual no topo | Medio | Remover avatar/camera e manter cumprimento como gatilho unico de cliente | urgente | `src/pages/catalog/page.tsx` | Sim |
| Cumprimento | Duas linhas compactas, nome primario e seta junto ao nome | H2.3 misturava avatar e texto | Logo perdia autoridade visual | Medio | Manter `Ola,` secundario e `Joao! v` primario | essencial | `src/pages/catalog/page.tsx` | Sim |
| Modal do cliente | Apenas Participacoes | H2.3 ainda tinha identidade, editar e Pedido atual | Duplicava cadastro/pedido sem backend real | Alto | Deixar somente Promocoes, Acoes, Beneficios, Fidelidade e estado vazio honesto | urgente | `src/pages/catalog/page.tsx` | Sim |
| Foto do cliente | Pertence a cadastro futuro, nao ao cabecalho | H2.3 tinha superficie `photo` e avatar com camera | Parecer upload funcional definitivo | Alto | Remover estado local de foto, gatilho, superficie e icones exclusivos | urgente | `src/pages/catalog/page.tsx`, docs | Sim |
| Pedidos no menu | Capacidade futura somente com dados reais | H2.3 mostrava Pedido atual no painel/esteira | Confundir Catalogo com Pedido operacional | Alto | Ocultar pedidos ate existir contrato funcional; registrar capacidade futura | essencial | `src/pages/catalog/page.tsx`, docs | Sim |
| Participacoes | Promocoes, Acoes, Beneficios e Fidelidade compartilhados | H2.3 tinha Promocoes, Acoes, Beneficios e Pedidos | Faltava Fidelidade e havia pedido sem contrato | Medio | Trocar Pedidos por Fidelidade e reutilizar o mesmo componente | essencial | `src/pages/catalog/page.tsx` | Sim |
| Fechamento | Modal consultivo fecha por clique fora, Escape, X, mesmo gatilho e outra superficie | H2.3 tinha confirmacao por edicao suja | Confirmacao desnecessaria em painel consultivo | Baixo | Remover fluxo de descarte e manter fechamento simples | essencial | `src/pages/catalog/page.tsx` | Sim |

## M-003.H2.5 - Estado de Boas-vindas e Homologacao do Cabecalho

| Tela/componente | Decisao homologada | Implementacao atual | Divergencia | Risco | Proposta | Prioridade | Arquivos afetados | Screenshot necessario |
|---|---|---|---|---|---|---|---|---|
| Cliente identificado | `[Logo] [Ola,] / [Joao! v] [Status] [Tema] [Menu]` | Composicao H2.4 aprovada | Nenhuma | Baixo | Preservar alinhamento, proporcao e hierarquia | essencial | `src/pages/catalog/page.tsx` | Sim |
| Cliente nao identificado | `[Logo] [Seja] / [Bem-vindo(a)! v] [Status] [Tema] [Menu]` | Antes caia para `Cliente` | Estado generico e menos humano | Medio | Aplicar saudacao em duas linhas no mesmo slot do cliente identificado | essencial | `src/pages/catalog/page.tsx` | Sim |
| Fluxo inicial | Pedir apenas nome, sem login/cadastro | Fluxo H2.4 nao diferenciava cliente novo | Poder parecer autenticacao ou cadastro definitivo | Medio | Abrir superficie progressiva com `Que bom ter voce aqui`, `Como podemos chamar voce?`, Nome, Continuar, Agora nao | essencial | `src/pages/catalog/page.tsx` | Sim |
| Agora nao | Fecha e mantem cliente sem identificacao | Ausente | Bloquear uso do catalogo | Alto | Fechar superficie sem salvar e manter cardapio disponivel | urgente | `src/pages/catalog/page.tsx` | Sim |
| Nome local | Estado local, nao persistencia definitiva | Ausente | Simular backend inexistente | Alto | Atualizar nome apenas na sessao visual atual | essencial | `src/pages/catalog/page.tsx`, docs | Sim |
| Confirmacao | Apenas se houver nome digitado nao salvo | H2.4 era consultivo sem confirmacao | Perder digitacao acidentalmente | Baixo | Confirmar descarte somente nesse caso | ajuste fino | `src/pages/catalog/page.tsx` | Sim |
| Painel identificado | Somente Participacoes | H2.4 correto | Nenhuma | Baixo | Preservar | essencial | `src/pages/catalog/page.tsx` | Sim |

## M-003.H2.6 - Controle Tipografico aa / Aa / AA

| Tela/componente | Decisao homologada | Implementacao atual | Divergencia | Risco | Proposta | Prioridade | Arquivos afetados | Screenshot necessario |
|---|---|---|---|---|---|---|---|---|
| Origem do controle | Usar `aa / Aa / AA` como escala operacional de texto | Padrao encontrado em Dashboard, RDS e RVL; sem fator historico especifico do Catalogo | Fatores antigos do M-003 nao localizados | Medio | Consolidar fatores H2.6 como `0.90 / 1.00 / 1.15` e documentar como atuais | essencial | `src/pages/catalog/page.tsx`, docs | Sim |
| Aplicacao tecnica | Escalar texto por token sem mexer na estrutura | M-003 tinha tamanhos fixos em varias partes | Controle poderia alterar icones ou layout por engano | Alto | Usar `data-text-scale` e `--catalog-text-scale`, sem `zoom`, sem `transform` e sem escala global | urgente | `src/pages/catalog/page.tsx`, `src/pages/catalog/_components/ProductSheet.tsx` | Sim |
| Cabecalho inicial | Exibir `aa Aa AA` temporariamente e recolher para `Aa` | Controle inexistente no cabecalho do catalogo | Usuario nao teria descoberta inicial do recurso | Medio | Exibir por 7000ms, mesmo tempo do status retratil, depois recolher | essencial | `src/pages/catalog/page.tsx` | Sim |
| Superficie de texto | `Texto` + `aa Aa AA`, pequena e ancorada ao gatilho | Inexistente | Excesso de ocupacao se virar modal grande | Medio | Criar superficie de cabecalho `text`, fecha por escolha, clique fora, Escape, mesmo gatilho ou outra superficie | essencial | `src/pages/catalog/page.tsx` | Sim |
| Persistencia | Escolha local por dispositivo, sem backend | Inexistente | Simular preferencia definitiva em banco | Baixo | Persistir somente em `localStorage` com `alvorada_catalog_text_scale` | essencial | `src/pages/catalog/page.tsx` | Sim |
| Textos da vitrine | Busca, categorias, cards, selos e estados vazios respondem ao nivel | Parte dos textos era fixa | `AA` poderia ficar incoerente ou cortar | Alto | Trocar textos por tokens do catalogo mantendo icones/dimensoes | urgente | `src/pages/catalog/page.tsx` | Sim |
| Ficha e carrinho | ProductSheet e carrinho acompanham o mesmo nivel | Ficha tinha classes fixas | Inconsistencia entre abertura e ficha | Medio | Aplicar tokens no ProductSheet e no resumo do carrinho visual local | essencial | `src/pages/catalog/_components/ProductSheet.tsx`, `src/pages/catalog/page.tsx` | Sim |
| Contencao responsiva | 408, 360 e 320 px sem quebra estrutural | Ainda nao validado apos H2.6 | Cabecalho ou cards podem estourar em AA | Alto | Validar por screenshots limpos e com linhas-guia em claro/escuro | urgente | screenshots | Sim |
