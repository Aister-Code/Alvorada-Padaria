# UX - Cardapio Digital: Telas e Modais

## Objetivo

Especificar a arquitetura visual e operacional do Cardapio Digital antes de alterar a tela `/cardapio`.

Este documento nao libera implementacao automatica. Ele define o resultado visual esperado para orientar a proxima etapa sem misturar dominios.

Referencias obrigatorias:

- `docs/arquitetura/DMI/DMI-Jornada-Cliente-Catalogo-Digital.md`
- `docs/arquitetura/MHO/MHO-Jornada-Cliente-Catalogo-Digital.md`
- `docs/arquitetura/planos/Plano-Fase-1-Jornada-Cliente-Catalogo.md`
- `docs/padroes/RondonIA-Visual-Language.md` - RVL-034 e RVL-035
- DNA WhatsApp Android: margens compactas, leitura rapida, aproveitamento de area e fluidez

## Regras Arquiteturais Inviolaveis

- Catalogo nao cria Pedido direto.
- Carrinho nao e Pedido.
- Pedido nao e Venda.
- Sessao de catalogo representa contexto vivo de navegacao.
- Carrinho representa intencao de compra, nao entidade operacional de Pedido.
- Central acompanha conversa, contexto, ajuda e intencao.
- Venda/Caixa confirmam o dominio financeiro.
- Producao/Separacao recebe Pedido, nao sessao de catalogo.
- OJC sera integrado por fases e deve preservar rastreabilidade.
- Fallback visual/local nao e fonte da verdade; serve apenas para preview ou erro controlado.

## Principio Visual

O Cardapio Digital deve parecer uma experiencia mobile-first de escolha rapida, nao um dashboard, CRM ou marketplace generico.

Aplicar:

- base solida;
- superficies leves;
- areas funcionais claras;
- margens compactas;
- primeiros produtos visiveis ja na abertura;
- rolagem horizontal sem scrollbar aparente;
- icones e rotulos alinhados por massa optica;
- botoes de acao com toque confortavel;
- linguagem simples e direta.

Evitar:

- cards pesados;
- sombras fortes;
- blocos concorrendo entre si;
- area inferior vazia dominante;
- capsulas sem texto;
- carrinho solto sem estado;
- header alto demais;
- botao separado demais do preco;
- linguagem de confirmacao de Pedido antes do contrato OJC/ROR.

## Regua Optica

A tela deve usar uma regua optica compacta:

- extremo esquerdo util: margem visual dos cards/produtos;
- extremo direito util: limite externo do carrinho/menu/header e cards;
- header, busca, categorias, produtos, sheet e barra inferior devem respeitar a mesma largura util;
- sub-reguas internas sao permitidas para foto, preco, chips e acoes;
- alinhamento visual prevalece sobre centro geometrico quando houver divergencia.

Aplicar RVL-034 em:

- header;
- chips de categoria;
- cards de produto;
- preco + botao;
- barra inferior;
- menu;
- ajuda contextual;
- sheet do produto.

Aplicar RVL-035 quando houver barra inferior com item ativo, carrinho ou atalhos fixos.

## Tela Principal / Abertura

A abertura de `/cardapio` deve conter, nesta ordem:

1. Header compacto da marca.
2. Saudacao curta.
3. Promocoes expansives.
4. Busca.
5. Categorias.
6. Produtos.
7. Barra inferior contextual.

### Wireframe Conceitual

```text
[Logo Alvorada]        Aberta  [tema] [menu] [carrinho 0]
Bom dia, o que vai querer hoje?

[Promocoes de hoje v]
[Buscar produto...]

[Padaria] [Lanchonete] [Pizzaria] [Bebidas] ...

[foto]  Pao Frances
        Fresquinho, assado na hora...
        de sempre . hoje
        0,75 +

[foto]  Croissant de Presunto e Queijo
        Folhado, recheado...
        mais pedido
        7,50 +

[Ajuda]        Carrinho vazio / Ver carrinho
```

## Header Compacto

Deve conter:

- logo Alvorada;
- status `Aberta` ou `Fechada`;
- alternancia dia/noite, se aplicavel;
- menu tres pontos;
- carrinho com quantidade/estado.

Regras:

- header deve ser compacto;
- nao deve empurrar produtos para fora da primeira dobra;
- carrinho nao pode parecer solto;
- carrinho vazio deve comunicar estado;
- carrinho com itens deve mostrar quantidade;
- menu tres pontos concentra acoes secundarias;
- status da loja deve ser claro, mas nao dominante.

## Saudacao Curta

Objetivo: dar contexto humano sem ocupar altura demais.

Exemplos:

- `Bom dia, o que vai querer hoje?`
- `Boa tarde, escolha seu pedido.`
- `O que vai sair hoje?`

Regras:

- maximo de uma linha em mobile estreito quando possivel;
- sem texto explicativo longo;
- nao pode competir com busca e produtos.

## Promocoes Expansiveis

Comportamento:

- estado inicial compacto;
- abre/recolhe por toque;
- pode mostrar ate 2 ou 3 promocoes em destaque;
- nao domina a tela.

Wireframe:

```text
[Promocoes de hoje v]

Expandido:
[Promocoes de hoje ^]
  - Combo cafe + pao de queijo
  - Pizza grande com refrigerante
```

## Busca

Campo sempre visivel na abertura.

Placeholder:

```text
Buscar produto...
```

Regras:

- altura compacta e toque confortavel;
- icone de busca discreto;
- limpar busca quando houver texto;
- resultados devem preservar cards legiveis;
- busca vazia volta para categoria selecionada.

## Categorias

Categorias devem ser chips legiveis com texto.

Regras:

- rolagem horizontal sem scrollbar aparente;
- primeira categoria selecionada na abertura;
- texto nunca pode sumir;
- chip ativo deve ter contraste claro;
- chips nao podem aparecer como capsulas vazias;
- largura dos chips acompanha texto e respiro minimo.

Exemplo:

```text
[Padaria] [Lanchonete] [Pizzaria] [Bebidas]
```

## Lista de Produtos

A primeira dobra deve mostrar produtos reais ou skeletons claros, nunca uma area vazia dominante.

Cada produto deve conter:

- foto;
- nome;
- descricao curta;
- selos quando houver;
- preco sem cifrao;
- botao `+` integrado ao preco.

Selos permitidos:

- `de sempre`;
- `promocao`;
- `hoje`;
- `novo`;
- `mais pedido`.

Wireframe:

```text
[foto]  X-Salada
        Pao, carne, queijo...
        de sempre . hoje
        18 +
```

Regras:

- foto com proporcao estavel;
- nome forte, descricao secundaria legivel;
- preco em destaque controlado;
- botao `+` proximo ao preco, sem virar botao isolado demais;
- sem cifrao;
- sem card pesado;
- sem sombra forte;
- sem excesso de borda;
- card precisa ser tocavel para abrir a ficha.

## Ficha / Sheet do Produto

A ficha deve abrir como sheet inferior mobile.

Conteudo:

1. foto ampliada;
2. nome;
3. descricao;
4. preco base;
5. opcoes/tamanho, se houver;
6. quantidade;
7. observacao;
8. botao `Adicionar`;
9. ajuda sobre este produto, se aplicavel.

Wireframe:

```text
----------------------------
[foto ampliada]

Pizza Calabresa
Molho, mussarela, calabresa...

Preco base: 45

Tamanho
[Broto] [Media] [Grande]

Quantidade
[-] 1 [+]

Observacao
[Sem cebola, por favor...]

[Ajuda sobre este produto]
[Adicionar . 45]
----------------------------
```

Regras:

- sheet nao deve esconder completamente a origem sem necessidade;
- fechar tocando fora ou por acao clara;
- botao `Adicionar` nao significa criar Pedido;
- adicionar pode ser visual ou persistencia futura conforme fase;
- nao criar Pedido;
- nao criar Venda;
- nao enviar para Producao.

## Carrinho Visual

Carrinho representa intencao/carrinho, nao Pedido.

### Estado Vazio

Texto:

```text
Carrinho vazio
Escolha um produto para comecar
```

### Estado Com Itens

Deve mostrar:

- quantidade;
- total estimado;
- lista resumida;
- alterar quantidade;
- remover item;
- pedir ajuda;
- continuar escolhendo.

Wireframe:

```text
Carrinho
2 itens . total 52,50

1x X-Burguer Artesanal      22
[-] 1 [+]            [remover]

1x Suco Natural             8
[-] 1 [+]            [remover]

[Continuar escolhendo] [Pedir ajuda]
```

Linguagem permitida:

- `Ver carrinho`;
- `Continuar`;
- `Pedir ajuda`.

Evitar nesta fase:

- `Finalizar pedido`;
- `Confirmar pedido`;
- qualquer texto que sugira Pedido operacional criado.

## Barra Inferior Contextual

Deve ficar sempre disponivel quando fizer sentido no mobile.

Estados:

```text
Vazio:
[Ajuda]                  Carrinho vazio

Com itens:
[Ajuda]        2 itens . 52,50 [Ver carrinho]
```

Regras:

- nao competir com a lista;
- respeitar safe-area;
- usar DNA de massa optica se houver destaque ativo;
- manter Ajuda sempre acessivel;
- carrinho com quantidade precisa ser claro.

## Ajuda Contextual

Ajuda deve estar sempre acessivel em:

- barra inferior;
- ficha do produto;
- carrinho;
- menu.

Funcoes previstas:

- pedir ajuda sobre produto;
- pedir ajuda sobre carrinho;
- chamar atendimento humano/IA;
- preservar contexto da sessao.

Textos sugeridos:

- `Ajuda`;
- `Chamar atendimento`;
- `Tenho uma duvida`.

Wireframe:

```text
Ajuda
Sobre o que voce precisa?

[Produto atual]
[Carrinho]
[Falar com atendimento]
```

Regras:

- nao implementar envio real sem fase aprovada;
- contexto da sessao deve ser preservado quando OJC for ligado;
- ajuda nao cria Pedido;
- ajuda pode abrir Central em fase futura.

## Menu do Cardapio

Menu tres pontos deve conter acoes simples.

Itens:

- Horario de atendimento;
- Formas de pagamento;
- Endereco/retirada;
- Ajuda;
- Sobre a Alvorada;
- Ver conversa/atendimento, futuro;
- Compartilhar cardapio, futuro.

Regras:

- nao poluir header;
- menu abre em superficie leve;
- itens com icone + texto quando aplicavel;
- fechar ao tocar fora;
- nao exibir opcoes internas operacionais.

Wireframe:

```text
[menu tres pontos]
  Horario de atendimento
  Formas de pagamento
  Endereco/retirada
  Ajuda
  Sobre a Alvorada
  Compartilhar cardapio (futuro)
```

## Estados Visuais

### Carregando

Regras:

- usar skeleton ou texto curto;
- nunca tela preta vazia;
- categorias podem aparecer como skeleton com largura real, mas nao como capsulas vazias permanentes;
- produtos devem ter skeleton de card com foto, texto e preco.

Texto opcional:

```text
Carregando cardapio...
```

### Sem Produtos

Texto:

```text
Nenhum produto disponivel agora
```

Complemento:

```text
Voce pode chamar atendimento para consultar opcoes.
```

### Loja Fechada

Cardapio continua visivel.

Texto:

```text
Fechada agora
Voce pode olhar o cardapio
```

Regras:

- produtos podem continuar navegaveis;
- adicionar ao carrinho pode ficar condicionado a regra futura;
- ajuda continua acessivel.

### Erro / Fallback

Quando o backend nao responder:

- mostrar vitrine local apenas como preview;
- comunicar de forma discreta se necessario;
- nao tratar fallback como fonte da verdade;
- nao criar Pedido, Venda ou Carrinho operacional a partir do fallback.

## Estados de Loja

### Aberta

- status visivel no header;
- produtos ativos;
- carrinho e ajuda ativos conforme fase.

### Fechada

- status visivel no header;
- catalogo navegavel;
- linguagem evita prometer preparo imediato;
- ajuda pode explicar horario/retirada.

## Comportamento Mobile

Regras:

- tela otimizada para largura estreita;
- header compacto;
- produtos visiveis na primeira dobra;
- toque minimo confortavel nos botoes principais;
- rolagem vertical natural;
- rolagem horizontal apenas em categorias/promocoes, sem scrollbar aparente;
- sheet do produto sobe da base;
- barra inferior respeita safe-area;
- textos nao podem cortar de forma incoerente;
- imagens mantem proporcao estavel.

## Criterios de Aceite Visual

A tela principal so pode ser considerada pronta quando:

- produtos aparecem na abertura ou skeleton claro aparece enquanto carrega;
- categorias tem texto legivel;
- nao existe scrollbar horizontal aparente;
- primeira categoria esta selecionada;
- area inferior nao fica vazia sem funcao;
- header mostra marca, estado, menu e carrinho;
- carrinho tem estado vazio/com itens;
- ajuda esta acessivel;
- cards de produto mostram foto, nome, descricao, selos, preco e `+`;
- ficha do produto abre como sheet inferior;
- carrinho nao usa linguagem de Pedido;
- estados loading/vazio/erro/loja fechada estao definidos;
- visual respeita RVL-034;
- barra inferior, quando ativa, respeita RVL-035;
- Catalogo, Carrinho, Pedido e Venda permanecem separados.

## O Que Nao Pode Ser Implementado Ainda Sem Novo Escopo

- Criar Pedido operacional direto pelo catalogo.
- Converter carrinho em Pedido.
- Confirmar Venda.
- Enviar item para Producao.
- Integrar pagamento/recebimento assistido.
- Integrar WhatsApp API real.
- Implementar IA completa.
- Alterar Caixa, Producao, Delivery ou Venda.
- Reabrir visual da Central homologada sem escopo especifico.
- Tratar fallback local como fonte de dados oficial.

## Checklist Antes da Implementacao Visual

Antes de codar a tela:

- confirmar rota oficial: `/cardapio`, `/catalogo`, `/c/:token` ou outra;
- confirmar se fallback visual permanece apenas para preview;
- confirmar campos minimos do carrinho visual;
- confirmar texto do status aberta/fechada;
- confirmar quais promocoes aparecem na abertura;
- confirmar quais selos sao elegiveis na Fase 1;
- confirmar se `Adicionar` sera apenas local/visual ou ja persistido em OJC;
- confirmar como Ajuda sera exibida sem criar Pedido;
- confirmar que Central so sera tocada se estritamente necessario.
