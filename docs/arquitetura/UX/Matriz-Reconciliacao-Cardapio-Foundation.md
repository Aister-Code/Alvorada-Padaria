# Matriz de Reconciliacao - Cardapio Digital x Foundation Externa

## Objetivo

Registrar a reconciliacao entre a referencia externa homologada `.rondon`, os documentos atuais do RondonIA OS e o estado atual do Cardapio Digital.

Este documento e apenas documental. Ele nao copia arquivos externos, nao move assets, nao altera codigo, nao altera backend e nao substitui documentos atuais automaticamente.

## Escopo Comparado

### Referencia externa considerada

Origem: `C:\Rondon IA\Alvorada Padaria\.rondon`

Arquivos considerados:

- `.rondon/knowledge/VISUAL-FOUNDATION-001.md`
- `.rondon/knowledge/CATALOG-FOUNDATION-001.md`
- `.rondon/knowledge/BRAND-FOUNDATION-001.md`
- `.rondon/knowledge/OPERATION-FOUNDATION-001.md`
- `.rondon/knowledge/LOGIN-FOUNDATION-001.md`
- `.rondon/knowledge/COMPANY-FOUNDATION-001.md`
- `.rondon/knowledge/AI-FOUNDATION-001.md`
- `.rondon/knowledge/ARQUITETURA-CONSOLIDADA-ALVORADA.md`
- `.rondon/assets/alvorada/README.md`
- `.rondon/assets/alvorada/colors/palette.json`
- `.rondon/assets/alvorada/typography/typography.md`

Observacoes de leitura:

- ha problemas de encoding/mojibake nos arquivos externos;
- o conteudo foi interpretado conceitualmente e reescrito em linguagem limpa;
- paleta e tipografia externas aparecem pendentes ou nulas em alguns pontos;
- os assets oficiais externos podem estar ausentes ou incompletos;
- a pasta `.rondon` e referencia homologada externa, nao codigo-fonte do projeto atual.

### Fontes internas consideradas

- `docs/arquitetura/DMI/DMI-Jornada-Cliente-Catalogo-Digital.md`
- `docs/arquitetura/MHO/MHO-Jornada-Cliente-Catalogo-Digital.md`
- `docs/arquitetura/planos/Plano-Fase-1-Jornada-Cliente-Catalogo.md`
- `docs/arquitetura/UX/DNA-Cardapio-Digital-Aprovado.md`
- `docs/arquitetura/UX/UX-Cardapio-Digital-Telas-Modais.md`
- `docs/padroes/RondonIA-Visual-Language.md`
- `docs/ojc/OJC-ME.md`
- `docs/ojc/OJC-UI.md`
- `src/pages/catalog/page.tsx`
- `src/pages/catalog/_components/ProductSheet.tsx`
- `convex/catalog/categories.ts`
- `convex/catalog/products.ts`
- `convex/ojc/catalogo.ts`
- `convex/schema.ts`

## Matriz de Reconciliacao

| Tema | Foundation externa `.rondon` | DMI/MHO/Plano/UX atuais | Codigo atual | Decisao final recomendada |
|---|---|---|---|---|
| Heranca RIA-DS/RVL | Alvorada herda RIA-DS integralmente. Excecoes homologadas: logo, paleta e tipografia. | RVL atual define linguagem visual, regua optica, soft surfaces, modo operacional e DNA mobile-first. | Existem ajustes locais visuais no Catalogo e outras telas. | Manter RVL/RIA-DS como base. Logo, paleta e tipografia sao excecoes locais. Nao criar padrao local novo sem aprovacao. |
| Marca | Nome fantasia ALVORADA, assinatura Padaria/Lanchonete/Pizzaria e uso de assets oficiais. | DNA do Cardapio exige marca compacta, sem splash/banner. | Header usa marca compacta textual, nao asset externo. | Preservar marca compacta no Cardapio. Nao substituir por asset externo ate fonte oficial confiavel estar disponivel no projeto atual. |
| Paleta e tipografia | Paleta/tipografia aparecem como excecoes homologadas, mas arquivos externos estao pendentes/nulos. | Projeto atual ja tem RVL/paleta operacional aplicada. | `src/index.css` tem tokens RVL atuais. | Nao substituir paleta/tipografia atual automaticamente. Usar `.rondon` como alerta e aguardar fonte oficial validada. |
| Categorias | Categorias homologadas: Lanches Tradicionais, Hamburgueres Artesanais, Pizzas Salgadas, Pizzas Doces, Porcoes, Caldos, Sucos, Bebidas, Cervejas. | UX/DNA recente usa exemplos genericos como Padaria, Lanches, Pizzas, Bebidas e Sobremesas. | Fallback atual usa Padaria, Lanches, Pizzas, Bebidas, Sobremesas. Seed backend usa Padaria, Lanchonete, Pizzaria, Conveniencia, Bebidas. | Classificar categorias recentes como fallback/placeholder visual. Categorias da Foundation devem orientar o cadastro real, salvo nova homologacao. |
| Produto | Produto e entidade unica. Nao duplicar por tamanho, sabor, massa, quantidade, volume ou complemento. | DMI/MHO fala em produto, variacoes, observacoes e carrinho como intencao. | `products` tem `hasSizes` e `sizes`, mas ainda nao modela complementos e variacoes completas. | Produto deve ser unico. Variacoes devem representar tamanho/sabor/massa/volume quando aplicavel. Nao criar produto duplicado por variacao. |
| Variacoes | Variacoes pertencem ao produto e nunca geram novo produto. | DMI/MHO ja preve variacoes na ficha do produto. | Schema tem `sizes` como array simples em `products`. | Expandir DMI/MHO antes de implementar catalogo real para modelar variacoes de forma mais completa e auditavel. |
| Complementos | Complementos pertencem ao produto e nunca criam novo produto. | UX/DNA cita ficha do produto, mas complementos ainda nao estao detalhados como contrato. | Schema atual nao tem tabela/campo estruturado de complementos. | Complementos precisam entrar no DMI/MHO e depois no schema/contrato antes do cadastro real. |
| Observacoes | Observacoes pertencem ao pedido ou item do pedido; nao alteram cadastro fixo do produto. | DMI/MHO mencionam observacoes na ficha/carrinho. | `ProductSheet` tem campo de observacao visual; `sessoesCatalogo` tem `observacoes` geral; `itensSnapshot` aceita `observacao` no contrato MVP comentado. | Observacao deve ser por item/snapshot de carrinho e depois por item do pedido, nao atributo fixo do produto. |
| Carrinho | Foundation do catalogo nao transforma carrinho em pedido. | DMI/MHO/Plano definem carrinho como intencao e bloqueiam criacao direta de Pedido. | VisualCart atual e local/visual. OJC tem `sessoesCatalogo` com `itensSnapshot`, `quantidadeItens`, `valorEstimado`. | Carrinho OJC deve guardar snapshot operacional do item escolhido, com produto, variacoes, complementos, observacao, quantidade e preco vigente. |
| Pedido e Venda | Foundation nao autoriza venda/pedido direto pelo catalogo. | DMI/MHO reforcam Catalogo != Carrinho != Pedido != Venda. | `converterSessaoEmPedido` apenas vincula sessao a pedido existente; nao cria pedido direto. | Preservar separacao. Catalogo nao cria Pedido direto; Pedido nasce por contrato OJC/ROR; Venda/Caixa fecha financeiro. |
| Multiunidade | Arquitetura externa e multiunidade desde a origem. | DMI/MHO usam `unit` como dado minimo de sessao e eventos. | `sessoesCatalogo`, pedidos, clientes e conversas usam `unit`; categories/products nao usam `unit`. | Catalogo deve nascer preparado para Matriz/Filiais. Preco, disponibilidade e visibilidade por unidade precisam de contrato futuro. |
| Login e identificacao | Login operacional sempre por ID do usuario, nunca nome; senha/PIN numerico de 4 digitos definido pelo gerente. | Catalogo publico e sessao anonima nao devem exigir login operacional. Atendimento vindo da Central usa operador/perfil. | Rota publica `/cardapio` e `/catalogo` abre sem login; operadores existem no backend. | Preservar login operacional por ID/PIN. Catalogo publico usa sessao anonima ou identificacao por canal, sem confundir com login de operador. |
| IA | IA observa, aprende e sugere; nao decide e nao altera sistema automaticamente. | DMI/MHO permitem IA/autoatendimento, mas bloqueiam decisao automatica de Pedido. | Central tem conceitos IA/Humano; Catalogo ainda nao integra IA real. | IA pode ajudar triagem e sugestao. IA nao cria Pedido, nao altera carrinho sem acao clara e nao confirma pedido sozinha. |
| Estados operacionais | Vocabulário fechado para empresa, equipe, producao, atendimento, delivery, estoque, caixa e cliente. | MHO e OJC definem estados de sessao e jornada. | `sessoesCatalogo.status` tem navegando, carrinho, aguardando, abandonada, assumida, convertida, encerrada. | Manter vocabulário fechado. Novos estados precisam passar por DMI/MHO/OJC antes de schema. |
| Fallback visual | Foundation separa arquitetura de instancia real do catalogo. | UX/DNA permite fallback apenas para preview/erro controlado. | `src/pages/catalog/page.tsx` usa fallback local e seed de preview. | Fallback e placeholder visual, nao fonte real. Cadastro real deve seguir categorias e modelagem homologadas. |

## Categorias

### Homologadas pela Foundation externa

- Lanches Tradicionais
- Hamburgueres Artesanais
- Pizzas Salgadas
- Pizzas Doces
- Porcoes
- Caldos
- Sucos
- Bebidas
- Cervejas

### Placeholder/fallback visual recente

- Padaria
- Lanches
- Pizzas
- Bebidas
- Sobremesas

### Seed/backend atual de preview

- Padaria
- Lanchonete
- Pizzaria
- Conveniencia
- Bebidas

### Decisao recomendada

As categorias recentes e o seed atual devem ser tratados como fallback ou massa visual de preview. O cadastro real deve ser orientado pelas categorias homologadas da Foundation externa, salvo nova decisao formal do produto.

## Produto, Variacao, Complemento e Observacao

Regra reconciliada:

```text
Categoria
-> Produto
-> Variacoes
-> Complementos
-> Observacoes do item/pedido
```

Decisoes:

1. Produto e entidade unica.
2. Variacao nao cria produto novo.
3. Tamanho, sabor, massa, quantidade e volume devem ser variacoes quando aplicavel.
4. Complemento pertence ao produto.
5. Complemento nao cria produto novo.
6. Observacao pertence ao item/carrinho/pedido.
7. Observacao nao altera cadastro fixo do produto.

Exemplo:

Errado:

```text
Pizza Calabresa P
Pizza Calabresa M
Pizza Calabresa G
```

Correto:

```text
Produto: Pizza Calabresa
Variacoes: P, M, G
```

## Impacto na Jornada do Cliente

1. Rota publica do cardapio: permanece publica, sem login operacional, e deve carregar catalogo visual.
2. Sessao OJC: deve usar `unit`, origem, identificador de sessao e snapshots, sem criar Pedido automaticamente.
3. Carrinho: deve representar intencao e guardar snapshot operacional do item escolhido.
4. Cadastro real de produtos: deve seguir categorias homologadas e entidade Produto unica.
5. Ficha do produto: deve suportar variacoes, complementos, quantidade e observacao por item.
6. Complementos: precisam de contrato DMI/MHO antes do schema final.
7. Observacoes: devem ser registradas por item/carrinho/pedido, nao no cadastro de produto.
8. Conversao futura para Pedido: depende de validacao OJC/ROR.
9. Pedido complementar: deve seguir regra de pedido editavel vs Pedido Complementar.
10. Central de Atendimento: acompanha contexto, ajuda e intencao, sem duplicar Venda/Caixa/Producao/Delivery.
11. Venda/Caixa/Producao/Delivery: recebem Pedido validado, nao sessao bruta de catalogo.

## Decisoes Recomendadas

1. Categorias recentes genericas sao fallback/placeholder visual, nao cadastro final.
2. Categorias homologadas da Foundation devem orientar cadastro real.
3. Produto deve ser entidade unica.
4. Variacoes representam tamanho/sabor/massa/volume quando aplicavel.
5. Complementos pertencem ao produto.
6. Observacoes pertencem ao item/pedido.
7. Catalogo nao cria Pedido direto.
8. Carrinho OJC deve guardar snapshot operacional do item escolhido.
9. Paleta/tipografia externas nao substituem RVL atual enquanto estiverem pendentes/nulas.
10. `.rondon` e referencia homologada externa, nao codigo-fonte do projeto atual.
11. Assets externos nao devem ser copiados ou reinterpretados automaticamente.
12. IA e apenas sugestiva/assistiva, nao decisoria.
13. Multiunidade deve ser preservada desde a modelagem do catalogo.

## Pontos que Devem Entrar em DMI/MHO

- modelagem de Produto, Variacao e Complemento;
- categorias homologadas para cadastro real;
- relacao entre categoria comercial e categoria visual/fallback;
- `unit`/multiunidade no catalogo;
- disponibilidade por unidade;
- preco por unidade, se aplicavel;
- produto ativo/inativo por unidade;
- snapshot do carrinho;
- observacoes por item;
- complementos por produto;
- fallback visual vs fonte real;
- IA apenas sugestiva;
- status operacionais com vocabulario fechado;
- regra objetiva de produto produzido vs revendido;
- relacao entre carrinho validado, Pedido editavel e Pedido Complementar.

## Bloqueios e Cuidados

- Nao copiar textos externos literalmente por causa de mojibake.
- Nao substituir paleta/tipografia atual por arquivos externos nulos.
- Nao tratar fallback local como cadastro real.
- Nao criar Pedido, Venda ou Producao a partir do Catalogo sem contrato OJC/ROR.
- Nao duplicar logica da Central.
- Nao duplicar logica de Venda, Caixa, Producao ou Delivery.
- Nao criar novas categorias finais sem reconciliacao formal.

## Conclusao

A Foundation externa reforca as separacoes ja presentes no DMI/MHO atual: Catalogo, Carrinho, Pedido e Venda permanecem conceitos distintos. O principal conflito identificado esta nas categorias: as categorias recentes do preview e do seed atual nao devem ser assumidas como cadastro final. A modelagem real do Catalogo deve ser orientada pela cadeia Categoria -> Produto -> Variacoes -> Complementos -> Observacoes, preservando multiunidade, RVL/RIA-DS e IA apenas sugestiva.
