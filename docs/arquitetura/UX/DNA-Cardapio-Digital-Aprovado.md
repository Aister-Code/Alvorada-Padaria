# DNA - Cardapio Digital Aprovado

## Objetivo

Consolidar o DNA visual, operacional e arquitetural aprovado para o Cardapio Digital do RondonIA OS.

Este documento e guia de construcao. A tela atual de `/cardapio` nao deve ser usada como referencia aprovada quando divergir deste DNA.

## Documentos Base

- `docs/arquitetura/DMI/DMI-Jornada-Cliente-Catalogo-Digital.md`
- `docs/arquitetura/MHO/MHO-Jornada-Cliente-Catalogo-Digital.md`
- `docs/arquitetura/planos/Plano-Fase-1-Jornada-Cliente-Catalogo.md`
- `docs/arquitetura/UX/UX-Cardapio-Digital-Telas-Modais.md`
- `docs/padroes/RondonIA-Visual-Language.md`
- `docs/ojc/OJC-ME.md`
- `docs/ojc/OJC-UI.md`

Referencias visuais obrigatorias:

- RVL-034 - Alinhamento Optico de Icones e Rotulos.
- RVL-035 - Dock Ativo por Massa Optica, quando aplicavel.
- DNA WhatsApp Android: aproveitamento, fluidez, margens compactas, alinhamento optico e leitura rapida.

## Principio Central

Catalogo Digital e a porta publica da Jornada do Cliente.

Ele nao e Venda.
Ele nao e Caixa.
Ele nao e Producao.
Ele nao cria Pedido direto.

Separacoes obrigatorias:

- Catalogo != Carrinho.
- Carrinho != Pedido.
- Pedido != Venda.
- Central != Producao/Caixa/Delivery.

Fluxo aprovado:

```text
Cliente abre Cardapio
-> sessao OJC e criada ou recuperada
-> cliente navega produtos
-> monta carrinho
-> pede ajuda ou confirma intencao
-> Central acompanha ou assume
-> carrinho vira Pedido somente apos validacao OJC/ROR
-> Pedido segue Producao/Caixa/Delivery
```

## Papel na OJC

Na OJC, o Cardapio aparece como `Sessao de Catalogo Criada`, `Sessao de Catalogo Ativa` e `Carrinho em Construcao`.

Para o operador, conforme OJC-UI, isso aparece como contexto de `Catalogo / Intencao de Compra`, nao como Pedido operacional.

O cliente ve:

- catalogo publico;
- categorias;
- produtos;
- ficha do produto;
- carrinho;
- ajuda contextual;
- status simples quando houver contrato aprovado.

O operador ve futuramente:

- sessao;
- canal de origem;
- itens snapshot;
- valor estimado;
- ajuda solicitada;
- possivel abandono;
- vinculo com conversa quando existir.

## Tela Principal Aprovada

A tela principal do Cardapio deve seguir esta ordem:

1. Header compacto da marca.
2. Saudacao curta.
3. Promocoes expansives.
4. Busca.
5. Categorias.
6. Produtos visiveis cedo.
7. Barra inferior contextual com Ajuda e Carrinho.

Regra essencial:

- produtos devem aparecer rapidamente;
- a tela nao pode parecer splash de marca;
- a abertura nao pode ter area vazia dominante;
- a tela nao pode parecer marketplace generico.

## Wireframe Textual da Abertura

```text
[A ALVORADA]        [Aberta] [tema] [menu] [carrinho 0]
Bom dia, o que vai querer hoje?
Cardapio aberto para escolha.

[Promocoes de hoje v]
[Buscar produto...]

[Padaria] [Lanches] [Pizzas] [Bebidas] [Sobremesas]

[foto]  X-Salada
        Pao, carne, queijo...
        de sempre . hoje
        18 +

[foto]  Suco Natural
        Laranja espremida...
        mais pedido
        8 +

[Ajuda]             Carrinho vazio / Continuar
```

## Header Aprovado

O header aprovado nao usa logo completa grande dominando a tela.

Usar:

- marca/assinatura compacta Alvorada;
- status Aberta/Fechada;
- alternancia dia/noite, se aplicavel;
- menu tres pontos;
- carrinho com estado claro.

Regras:

- logo compacta, nao institucional grande;
- nao usar bloco alto tipo banner/splash;
- nao empurrar produtos para baixo;
- status visivel e discreto;
- acoes alinhadas no extremo direito;
- carrinho nao pode ficar solto sem contexto.

Medidas de referencia:

- topbar: 52px a 56px;
- header + saudacao: ideal 88px a 104px;
- maximo absoluto: 112px;
- marca: altura maxima 36px a 42px;
- icones: area de toque 32px;
- icone visual: 17px a 19px;
- espacamento entre acoes: 4px a 6px;
- padding lateral: 12px a 14px.

## Logo / Marca

Padrao aprovado:

- assinatura compacta;
- simbolo `A` + texto `ALVORADA`, ou logo completa reduzida dentro das medidas;
- altura maxima entre 36px e 42px;
- largura maxima entre 112px e 124px;
- alinhamento pela regua esquerda do conteudo.

Nao usar:

- logo com 70px ou mais de altura;
- logo centralizada sozinha;
- logo completa dominando a primeira dobra;
- bloco laranja/vermelho alto apenas para marca.

## Saudacao

Padrao:

```text
Bom dia, o que vai querer hoje?
Cardapio aberto para escolha.
```

Regras:

- saudacao curta;
- linguagem simples;
- titulo com aproximadamente 16px;
- subtitulo entre 11px e 12px;
- altura total da saudacao entre 32px e 40px;
- nao usar texto longo;
- nao competir com produtos.

## Promocoes

Promocoes devem ser:

- compactas;
- expansives/recolhiveis;
- nao dominantes;
- opcionais quando nao houver promocao real.

Nao transformar promocao em banner pesado.

## Busca

A busca deve ser:

- visivel;
- simples;
- alinhada a regua visual da tela;
- compacta;
- com placeholder `Buscar produto...`.

## Categorias

Categorias devem:

- aparecer com texto legivel;
- usar chips leves;
- permitir rolagem horizontal por toque;
- esconder scrollbar visual;
- manter primeira categoria selecionada quando fizer sentido.

Exemplos:

- Salgados
- Lanches
- Pizzas
- Bebidas
- Sobremesas

Nao mostrar capsulas vazias.

## Card de Produto Aprovado

Cada produto deve conter:

- foto ou placeholder visual;
- nome;
- descricao curta;
- selos equilibrados;
- preco sem cifrao;
- botao `+` integrado ao preco.

Modelo conceitual:

```text
[foto]  X-Salada
        Pao, carne, queijo...
        de sempre . hoje
        18 +
```

Regras:

- preco e `+` devem parecer uma unidade;
- nao usar cifrao;
- nao usar card pesado;
- nao usar borda forte em todos os produtos;
- nao usar sombra forte;
- nao parecer marketplace generico;
- nome nao deve truncar cedo demais;
- permitir nome em ate 2 linhas quando necessario;
- descricao deve ser curta e secundaria;
- selos devem ser discretos e uteis.

Selos possiveis:

- de sempre;
- promocao;
- hoje;
- novo;
- mais pedido.

## Ficha / Sheet do Produto

A ficha deve abrir como sheet inferior mobile.

Conteudo:

1. foto ampliada;
2. nome;
3. descricao;
4. preco base;
5. opcoes/tamanho, quando houver;
6. quantidade;
7. observacao;
8. botao Adicionar;
9. Ajuda sobre este produto, se aplicavel.

Regras:

- Adicionar nao cria Pedido direto;
- nao cria Venda;
- nao envia para Producao;
- representa item no carrinho/intencao conforme fase;
- sheet deve manter linguagem de escolha, nao de confirmacao operacional.

## Carrinho Aprovado

Carrinho representa intencao, nao Pedido.

Estado vazio:

```text
Carrinho vazio
Escolha um produto para comecar
```

Estado com itens:

- quantidade;
- total;
- lista resumida;
- alterar quantidade;
- remover item;
- pedir ajuda;
- continuar escolhendo.

Nao usar nesta fase:

- Finalizar pedido;
- Confirmar pedido;
- Enviar para producao.

Preferir:

- Ver carrinho;
- Continuar escolhendo;
- Pedir ajuda.

## Ajuda Contextual

Ajuda deve estar sempre acessivel.

Pontos possiveis:

- barra inferior;
- ficha do produto;
- carrinho;
- menu.

Funcao:

- pedir ajuda sobre produto;
- pedir ajuda sobre carrinho;
- chamar atendimento;
- preservar contexto da sessao.

Textos permitidos:

- Ajuda;
- Chamar atendimento;
- Tenho uma duvida.

Ajuda nao cria Pedido.
Ajuda nao substitui Central.
Ajuda preserva contexto para a OJC.

## Menu do Cardapio

Menu tres pontos deve conter opcoes simples:

- Horario de atendimento;
- Formas de pagamento;
- Endereco/retirada;
- Ajuda;
- Sobre a Alvorada;
- Compartilhar cardapio, futuro;
- Ver conversa/atendimento, futuro.

Regra:

- nao poluir o header;
- nao expor acoes internas operacionais;
- manter menu como acao secundaria.

## Estados Visuais

### Carregando

- skeleton ou texto curto;
- nunca tela preta vazia;
- categorias nao podem parecer capsulas vazias permanentes;
- produtos devem ter skeleton de card.

### Sem Produtos

Texto:

```text
Nenhum produto disponivel agora.
```

### Loja Fechada

- manter cardapio visivel;
- sinalizar `Fechada agora`;
- cliente pode olhar o cardapio;
- nao prometer preparo imediato.

### Erro / Fallback

- fallback pode existir apenas para preview visual;
- fallback nao e fonte da verdade;
- fallback nao cria Pedido;
- fallback nao cria Venda;
- fallback nao cria OJC.

## Diagnostico da Tela Atual

A tela atual de `/cardapio` serve como diagnostico, nao como referencia aprovada.

Pontos fora do DNA aprovado:

- logo/header ainda deve ser controlado para nao dominar a tela;
- produtos devem aparecer cada vez mais cedo;
- categorias ja foram corrigidas para texto, mas precisam permanecer legiveis;
- cards ainda precisam seguir fielmente o padrao aprovado;
- carrinho precisa comunicar estado sem sugerir Pedido;
- ajuda precisa permanecer contextual;
- nao pode haver scrollbar horizontal aparente;
- nao pode haver area vazia dominante;
- visual nao pode parecer marketplace generico.

## Criterios de Aceite Visual

O Cardapio so pode ser aprovado visualmente se:

1. marca compacta aparece sem dominar a tela;
2. status Aberta/Fechada e claro;
3. produtos aparecem cedo;
4. categorias tem texto;
5. produtos tem nome legivel;
6. preco + `+` estao integrados;
7. carrinho tem estado claro;
8. ajuda aparece;
9. nao ha area vazia dominante;
10. nao ha scrollbar horizontal aparente;
11. visual nao parece marketplace generico;
12. nao sugere criacao de Pedido antes da hora;
13. respeita RVL-034 em icones, rotulos e conjuntos;
14. respeita RVL-035 em barra inferior/dock quando aplicavel;
15. preserva Catalogo != Carrinho != Pedido != Venda.

## O Que Nao Pode Ser Feito

Sem novo escopo, nao pode:

- criar Pedido operacional direto pelo catalogo;
- converter carrinho em Pedido;
- confirmar Venda;
- enviar item para Producao;
- integrar pagamento/recebimento assistido;
- integrar WhatsApp API real;
- implementar IA completa;
- alterar Caixa, Producao, Delivery ou Venda;
- reabrir visual da Central homologada sem escopo especifico;
- tratar fallback local como fonte oficial;
- construir UI que contrarie OJC-ME/OJC-UI.

## Checklist Antes de Qualquer Novo Ajuste

Antes de alterar `/cardapio`:

1. Confirmar se o ajuste e visual, OJC ou operacional.
2. Confirmar que nao cria Pedido/Venda.
3. Conferir DMI, MHO e Plano Fase 1.
4. Aplicar RVL-034 na regua optica.
5. Aplicar RVL-035 na barra inferior quando houver destaque.
6. Garantir produtos visiveis cedo.
7. Garantir carrinho como intencao, nao Pedido.
8. Garantir Ajuda contextual.
9. Rodar `git diff --check`.
10. Rodar build quando houver codigo.
