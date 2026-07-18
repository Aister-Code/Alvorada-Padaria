# Prancha de Validacao Visual M-003 - Catalogo Digital

## Objetivo

Congelar uma baseline visual auditavel do M-003 Catalogo Digital antes de qualquer reconstrucao funcional ou visual ampla.

Esta prancha usa:

- os screenshots atuais produzidos na auditoria;
- os prints enviados pelo usuario como referencia visual oficial anterior;
- a implementacao atual em `/cardapio`;
- o DNA aprovado do Cardapio Digital.

Nenhuma alteracao de interface foi realizada nesta etapa.

## Baseline Congelada

| Item | Valor |
|---|---|
| Data da captura | 2026-07-17 14:30:21 -04:00 |
| Branch | `feature/m005-caixa` |
| Commit atual | `f0f7e82` |
| Rota usada | `/cardapio` |
| Alias existente | `/catalogo` |
| Viewport usado | 360 x 740 |
| Origem dos dados exibidos | Convex quando disponivel; fallback/seed visual quando backend esta vazio ou ainda nao responde. |
| Estado do git | Existem alteracoes pendentes funcionais antigas e docs/screenshots novos desta auditoria. |
| Build | OK em `npm.cmd run build`, com avisos conhecidos de env/chunk/CSS import. |

Alteracoes pendentes no momento do congelamento:

```text
M  src/App.tsx
M  src/index.css
M  src/pages/catalog/_components/ProductSheet.tsx
M  src/pages/catalog/page.tsx
M  src/pages/dashboard/_components/DashboardMenu.tsx
M  src/pages/whatsapp/page.tsx
?? docs/arquitetura/UX/Matriz-Reconstrucao-M003-Catalogo-Digital.md
?? docs/arquitetura/UX/Prancha-Validacao-Visual-M003-Catalogo-Digital.md
?? docs/screenshots/auditoria-m003-catalogo-digital/
```

## Referencia Oficial Anterior Recebida

Os arquivos abaixo foram copiados dos prints enviados pelo usuario para a pasta de evidencias desta auditoria:

| Evidencia | Arquivo | Papel |
|---|---|---|
| Referencia oficial anterior principal | `docs/screenshots/auditoria-m003-catalogo-digital/00-referencia-oficial-anterior-principal.png` | Visual aprovado anterior da abertura principal. |
| Referencia oficial anterior expandida | `docs/screenshots/auditoria-m003-catalogo-digital/00-referencia-oficial-anterior-expandida.png` | Visual aprovado anterior com mais categorias abertas. |

Aspectos da referencia oficial anterior que devem orientar a reconstrucao:

- header claro, limpo e compacto;
- logo `A` no extremo esquerdo;
- saudacao central;
- tema e menu no extremo direito;
- estado `Aberta` com ponto verde e seta;
- busca grande e legivel;
- categorias com icone + texto;
- acao `Mais/Menos` para categorias;
- cards claros, leves, arredondados e com boa area interna;
- selo no topo do card;
- imagem/placeholder consistente;
- preco sem cifrao;
- botao `+` isolado e forte, mas integrado ao card;
- ajuda flutuante discreta.

## Prancha de Evidencias Atuais

### 1. Catalogo principal escuro

Arquivo: `docs/screenshots/auditoria-m003-catalogo-digital/01-catalogo-principal-escuro.png`

| Campo | Registro |
|---|---|
| Rota | `/cardapio` |
| Viewport | 360 x 740 |
| Estado | Tema escuro, categoria Padaria ativa, carrinho vazio. |
| Componentes visiveis | Header, status Aberta, tema, menu, carrinho, saudacao, promocoes recolhidas, busca, categorias, lista de produtos, footer Ajuda/Carrinho. |
| Comportamento associado | Abre vitrine publica sem login; produtos aparecem apos carregamento. |
| Preservar | Rota publica, abertura sem login, produtos visiveis cedo, busca e footer contextual. |
| Divergencias | Visual escuro atual diverge da referencia oficial clara; card mais escuro e menos proximo do padrao oficial anterior; categorias usam fallback com emoji. |
| Classificacao | essencial |
| Arquivos responsaveis | `src/pages/catalog/page.tsx`, `src/index.css` |
| Risco de regressao | Quebrar carregamento/listagem ao refinar visual. |

### 2. Cabecalho/menu aberto

Arquivo: `docs/screenshots/auditoria-m003-catalogo-digital/02-cabecalho-menu-aberto.png`

| Campo | Registro |
|---|---|
| Rota | `/cardapio` |
| Viewport | 360 x 740 |
| Estado | Menu tres pontos aberto. |
| Componentes visiveis | Header, menu secundario, acoes: horario, pagamento, endereco, ajuda, sobre. |
| Comportamento associado | Menu abre por toque no tres pontos. |
| Preservar | Menu como concentrador de acoes secundarias. |
| Divergencias | Superficie e itens ainda precisam alinhar ao DNA oficial; falta validar fechamento por toque externo. |
| Classificacao | ajuste fino |
| Arquivos responsaveis | `src/pages/catalog/page.tsx` |
| Risco de regressao | Menu ficar pesado ou poluir header. |

### 3. Promocoes abertas

Arquivo: `docs/screenshots/auditoria-m003-catalogo-digital/03-promocoes-abertas.png`

| Campo | Registro |
|---|---|
| Rota | `/cardapio` |
| Viewport | 360 x 740 |
| Estado | Promocoes expandidas. |
| Componentes visiveis | Bloco de promocoes com textos placeholder. |
| Comportamento associado | Expande/recolhe por toque. |
| Preservar | Promocoes compactas e recolhiveis. |
| Divergencias | Conteudo nao e promocao real; precisa fonte operacional ou fallback sinalizado. |
| Classificacao | essencial |
| Arquivos responsaveis | `src/pages/catalog/page.tsx` |
| Risco de regressao | Placeholder ser confundido com promocao real. |

### 4. Busca

Arquivo: `docs/screenshots/auditoria-m003-catalogo-digital/04-busca-pizza.png`

| Campo | Registro |
|---|---|
| Rota | `/cardapio` |
| Viewport | 360 x 740 |
| Estado | Busca por `pizza`. |
| Componentes visiveis | Campo de busca, resultado filtrado, footer. |
| Comportamento associado | Filtra produtos por nome/descricao. |
| Preservar | Busca funcional com limpar texto. |
| Divergencias | Sem destaque de termo; resultado depende de fallback/seed. |
| Classificacao | ajuste fino |
| Arquivos responsaveis | `src/pages/catalog/page.tsx`, `convex/catalog/products.ts` |
| Risco de regressao | Quebrar busca ao separar fallback e fonte real. |

### 5. Ficha de produto

Arquivo: `docs/screenshots/auditoria-m003-catalogo-digital/05-ficha-produto-pizza-variacoes.png`

| Campo | Registro |
|---|---|
| Rota | `/cardapio` |
| Viewport | 360 x 740 |
| Estado | Sheet inferior da Pizza Calabresa aberta. |
| Componentes visiveis | Foto ampliada, nome, descricao, preco base, tamanhos, observacao, ajuda, quantidade, adicionar. |
| Comportamento associado | Abre ao tocar card; fecha por X ou backdrop; tamanho altera preco. |
| Preservar | Sheet inferior, foto ampliada, quantidade, observacao, botao adicionar. |
| Divergencias | Texto com encoding quebrado em `Preço/Observação`; complementos ausentes; zoom independente ausente. |
| Classificacao | urgente |
| Arquivos responsaveis | `src/pages/catalog/_components/ProductSheet.tsx`, `convex/catalog/products.ts` |
| Risco de regressao | Perder variacoes simples ao introduzir modelo completo. |

### 6. Produto com variacao

Arquivo: `docs/screenshots/auditoria-m003-catalogo-digital/06-produto-com-variacao-grande.png`

| Campo | Registro |
|---|---|
| Rota | `/cardapio` |
| Viewport | 360 x 740 |
| Estado | Variacao Grande selecionada. |
| Componentes visiveis | Tamanhos Broto, Media, Grande e preco atualizado. |
| Comportamento associado | Selecionar tamanho soma `extraPrice`. |
| Preservar | Alteracao de preco por variacao. |
| Divergencias | Variacoes limitadas a `sizes`; nao cobre sabor, massa, volume ou regras completas. |
| Classificacao | essencial |
| Arquivos responsaveis | `ProductSheet.tsx`, `convex/catalog/products.ts` |
| Risco de regressao | Duplicar produto por variacao em vez de modelar variacao. |

### 7. Carrinho com item

Arquivo: `docs/screenshots/auditoria-m003-catalogo-digital/07-carrinho-com-item.png`

| Campo | Registro |
|---|---|
| Rota | `/cardapio` |
| Viewport | 360 x 740 |
| Estado | Um item adicionado no carrinho visual. |
| Componentes visiveis | Carrinho no header com badge, footer com quantidade e total. |
| Comportamento associado | `visualCart` local soma quantidade e valor. |
| Preservar | Carrinho como intencao, sem criar Pedido. |
| Divergencias | Nao ha lista de carrinho, editar, remover, subtotal por item ou persistencia OJC. |
| Classificacao | essencial |
| Arquivos responsaveis | `src/pages/catalog/page.tsx`, futuro componente de carrinho. |
| Risco de regressao | Carrinho virar Pedido ou perder estado local. |

### 8. Card de produto

Arquivo: `docs/screenshots/auditoria-m003-catalogo-digital/08-card-produto-recorte.png`

| Campo | Registro |
|---|---|
| Rota | `/cardapio` |
| Viewport | 360 x 740 |
| Estado | Primeiro card em destaque. |
| Componentes visiveis | Foto, nome, descricao, selos, preco e `+`. |
| Comportamento associado | Toque no corpo abre ficha; toque no preco/+ adiciona ao carrinho. |
| Preservar | Separacao de toque entre abrir ficha e adicionar; preco sem cifrao. |
| Divergencias | Foto atual menor que referencia oficial; card escuro nao conversa com print oficial anterior; selos parecem permanentes. |
| Classificacao | essencial |
| Arquivos responsaveis | `src/pages/catalog/page.tsx` |
| Risco de regressao | Perder comportamento de clique duplo por area. |

### 9. Tema claro

Arquivo: `docs/screenshots/auditoria-m003-catalogo-digital/09-catalogo-principal-claro.png`

| Campo | Registro |
|---|---|
| Rota | `/cardapio` |
| Viewport | 360 x 740 |
| Estado | Tema claro. |
| Componentes visiveis | Abertura completa em modo dia. |
| Comportamento associado | Alternancia por botao de tema. |
| Preservar | Suporte claro/escuro. |
| Divergencias | Modo claro atual ainda nao equivale ao visual oficial anterior; precisa recuperar leveza, margens e hierarquia da referencia. |
| Classificacao | urgente |
| Arquivos responsaveis | `src/pages/catalog/page.tsx`, `src/index.css` |
| Risco de regressao | Melhorar claro e degradar escuro. |

## Inventario Visual da Baseline Atual

As medidas abaixo descrevem a implementacao atual. Nao sao aprovacao automatica.

| Item | Medida / comportamento |
|---|---|
| Viewport | 360 x 740 |
| Largura util principal | 336px em cards/busca/promocoes, com margem lateral de 12px. |
| Header | 360 x 89px; padding `8px 12px 6px`; sticky top. |
| Acoes do header | Botao tema/menu/carrinho com 32 x 32px; espacamento horizontal de 4px visual entre areas. |
| Promocoes | 336 x 29px recolhido; margem 12px; raio 14px. |
| Busca | 336 x 36px; raio 14px; padding horizontal efetivo 36px. |
| Categorias | Nav 360 x 45px; chip ativo 89 x 32px; chips horizontais com overflow. |
| Card de produto | 336 x 90px; margem 12px; padding 8px; raio 14px; borda 1px. |
| Imagem do card | 64 x 64px; raio visual 8px. |
| Area de clique do corpo do card | Aproximadamente 236 x 72px no primeiro item. |
| Botao preco/+ | 72 x 40px; preco 14px, peso 800. |
| Titulo do produto | 14px, peso 700, line-height 17px. |
| Descricao | 11px, line-height 15.125px, cor secundaria. |
| Footer | 360 x 57px; fixo; padding 8px 12px; respeita safe-area no CSS. |
| Botao Ajuda | 78 x 40px. |
| Botao carrinho vazio | 250 x 40px. |
| Sheet produto | 360 x 535px; posicao y 206; max-height aproximado 86vh. |
| Foto da sheet | 360 x 176px. |
| Botao Adicionar sheet | 216 x 44px. |
| Tipografia global | Poppins para sans, Cormorant Garamond para serif. |
| Raios | Predominio de 14px em busca/promocoes/card; sheet com topo arredondado grande. |
| Bordas | Card destaque usa borda primaria translúcida; demais superficies com borda discreta ou ausente. |
| Sombras | Praticamente sem sombras; premium depende mais de superficie/cor. |
| Tema claro/escuro | Funcional via `next-themes`; tokens em `src/index.css`. |

## Busca de Referencias Antigas

### Branches

Branches locais/remotas encontradas:

- `feature/m005-caixa` no commit `f0f7e82`
- `develop`, `main`, `origin/develop`, `origin/main` no commit inicial `5dc8f8b`

Nao ha branch local antiga especifica de catalogo alem da branch atual.

### Commits relacionados

| Commit | Data | Conteudo | Possibilidade de recuperacao |
|---|---|---|---|
| `af03908` | 2026-07-07 01:11:36 -0400 | Criou `src/pages/catalog/page.tsx`, `ProductSheet.tsx` e backend `convex/catalog/*`. | Recuperavel via `git show af03908:<caminho>` sem restaurar. |
| `788678f` | 2026-07-07 13:06:33 -0400 | Aplicou logo Alvorada v1 e modificou `src/pages/catalog/page.tsx`. | Recuperavel via `git show`/diff. |
| `2b891a0` | 2026-07-16 | Criou DMI/MHO Jornada Cliente Catalogo. | Referencia documental. |
| `004ff64` | 2026-07-16 | Criou Plano Fase 1 Jornada Cliente Catalogo. | Referencia documental. |
| `63657e1` | 2026-07-16 13:31:17 -0400 | Criou DNA/UX aprovados do Cardapio. | Referencia documental principal. |
| `ef04479` | 2026-07-16 | Criou Matriz de Reconciliacao Cardapio/Foundation. | Referencia documental principal. |
| `f0f7e82` | 2026-07-17 | Atualizou DMI/MHO com Foundation. | Referencia documental atual. |

### Arquivos removidos

Busca por arquivos removidos em imagens, HTML, PDF, catalogo/cardapio/ProductSheet nao encontrou referencia visual oficial removida.

### Docs/screenshots

Havia muitos screenshots de Central, Gerente, Venda e padroes RVL, mas nenhum screenshot oficial versionado do Catalogo Digital antes desta auditoria.

### Public, src/assets, HTML, prototipos e exports

- Nao existe pasta `public` no estado atual.
- `index.html` existe, mas nao e prototipo de catalogo.
- `src/assets/branding` contem logo e icones Alvorada v1.
- Nao foram encontrados HTML/PDF/prototipos/exports especificos do Catalogo Digital no repositorio.

### Conclusao da busca

A referencia visual oficial anterior nao estava versionada no repositorio. Ela foi fornecida agora pelo usuario via print e congelada nesta prancha como evidencia externa recebida.

## Mapa de Preservacao

### A. Preservar

| Item | Arquivos envolvidos |
|---|---|
| Rotas publicas `/cardapio` e `/catalogo` sem login operacional | `src/App.tsx` |
| Listagem de categorias com selecao ativa | `src/pages/catalog/page.tsx` |
| Busca por produto | `src/pages/catalog/page.tsx`, `convex/catalog/products.ts` |
| Abertura da ficha por toque no card | `src/pages/catalog/page.tsx`, `ProductSheet.tsx` |
| Preco sem cifrao | `src/pages/catalog/page.tsx`, `ProductSheet.tsx` |
| Botao `+` adicionando ao carrinho visual | `src/pages/catalog/page.tsx` |
| Carrinho como intencao, nao Pedido | `src/pages/catalog/page.tsx`, docs DMI/MHO |
| Alternancia dia/noite | `src/pages/catalog/page.tsx`, `src/index.css` |
| Sheet inferior mobile | `ProductSheet.tsx` |
| Separacao Catalogo != Carrinho != Pedido != Venda | DMI, MHO, UX, codigo de OJC |

### B. Refinar

| Item | Arquivos envolvidos |
|---|---|
| Header para recuperar visual oficial anterior | `src/pages/catalog/page.tsx`, `src/assets/branding/*` |
| Regua optica de margem e densidade | `src/pages/catalog/page.tsx`, `src/index.css` |
| Status `Aberta` com semantica visual melhor | `src/pages/catalog/page.tsx` |
| Menu tres pontos e superficie | `src/pages/catalog/page.tsx` |
| Chips de categorias com icones/labels homologados | `src/pages/catalog/page.tsx`, backend futuro |
| Cards com foto mais protagonista e selos menos ruidosos | `src/pages/catalog/page.tsx` |
| Tema claro para se aproximar da referencia oficial | `src/pages/catalog/page.tsx`, `src/index.css` |
| Footer Ajuda/Carrinho | `src/pages/catalog/page.tsx` |

### C. Reconstruir

| Item | Arquivos envolvidos |
|---|---|
| Complementos de produto | `ProductSheet.tsx`, schema/Convex futuro |
| Carrinho completo com lista, editar/remover/subtotal | `src/pages/catalog/page.tsx`, componente futuro |
| Persistencia OJC da sessao/carrinho | `convex/ojc/catalogo.ts`, UI futura |
| Ajuda ligada ao contexto da sessao | `src/pages/catalog/page.tsx`, `convex/ojc/catalogo.ts` futuro |
| Estado loja fechada real | `src/pages/catalog/page.tsx`, fonte operacional futura |
| Seed/backend com encoding correto | `convex/catalog/categories.ts`, `convex/catalog/products.ts` |
| Variacoes completas alem de `sizes` | `ProductSheet.tsx`, schema futuro |
| Fallback visual claramente separado de fonte real | `src/pages/catalog/page.tsx`, docs, backend futuro |

## Classificacao Consolidada

### Urgente

- Recuperar modo claro/visual oficial anterior como referencia principal.
- Corrigir encoding visivel em ficha/seed/backend.
- Definir e implementar complementos antes de cadastro real.
- Garantir fallback visual sem confusao com fonte real.

### Essencial

- Preservar rotas publicas e busca.
- Refinar header, categorias, cards e footer.
- Carrinho visual completo sem virar Pedido.
- Variacoes sem duplicar produto.
- Ajuda contextual sem acionar Pedido/Venda.

### Ajuste fino

- Microespacamentos.
- Superficies e bordas.
- Selos.
- Fechamento do menu ao tocar fora.
- Icones finos.
- Polimento do tema escuro.

## Arquivos que seriam afetados na proxima fase

- `src/pages/catalog/page.tsx`
- `src/pages/catalog/_components/ProductSheet.tsx`
- `src/index.css`
- `src/assets/branding/alvorada-logo-v1.png`
- `src/assets/branding/alvorada-icon-v1.png`
- `convex/catalog/categories.ts`
- `convex/catalog/products.ts`
- `convex/ojc/catalogo.ts` somente quando a fase OJC for aprovada.

## Riscos

- Implementar direto sobre visual atual e perder a referencia oficial anterior.
- Corrigir estetica quebrando busca/ficha/carrinho local.
- Usar categorias placeholder como cadastro definitivo.
- Introduzir Pedido/Venda antes do contrato OJC/ROR.
- Misturar ajuda visual com WhatsApp real antes da fase aprovada.
- Corrigir seed com dados reais sem decidir categorias homologadas.
- Ignorar multiunidade e `unit`.

## Confirmacao

Esta etapa apenas documenta e congela baseline visual. Nenhuma reconstrucao ampla foi iniciada.
