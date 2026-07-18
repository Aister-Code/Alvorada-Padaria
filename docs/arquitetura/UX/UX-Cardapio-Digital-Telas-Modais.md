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

1. Header compacto em uma linha.
2. Busca.
3. Categorias.
4. Produtos.
5. Ajuda flutuante e barra inferior contextual somente quando houver item.

### Wireframe Conceitual

```text
[Logo/esteira] [Ola, Joao! v] [relogio Aberta v] [tema] [menu]

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

[? Ajuda flutuante]        [Carrinho contextual apenas com item]
```

## Header Compacto

Deve conter:

- logo Alvorada como origem da esteira de atalhos;
- saudacao clicavel `Ola, Joao!`;
- status operacional clicavel `Aberta` ou `Fechada` com icone de relogio;
- alternancia dia/noite direta;
- menu tres pontos institucional.

Regras:

- header deve permanecer em uma unica linha;
- `Aberta` nao volta para segunda linha;
- a esteira abre a partir da marca e nao cria pagina nova;
- a saudacao abre painel pessoal leve;
- status abre painel operacional leve;
- menu tres pontos concentra somente acoes institucionais;
- tema alterna diretamente claro/escuro;
- apenas uma superficie do header pode estar aberta por vez;
- superficies fecham por clique fora, Escape ou selecao;
- estados sem backend devem ser identificados como demonstrativos ou em atualizacao.

## Esteira da Marca

A marca abre uma esteira horizontal contextual com:

- Promocoes;
- Minhas acoes;
- Cupons/beneficios;
- Pedidos.

Esses atalhos sao portas da jornada do cliente. Enquanto nao houver backend real, cada destino mostra estado vazio/controlado, sem inventar saldo, cupom, progresso ou historico.

## Saudacao e Painel Pessoal

Objetivo: dar contexto humano sem ocupar altura demais.

Composicao:

- `Ola, Joao! v`

Regras:

- a area inteira da saudacao e clicavel;
- nao confundir cliente com operador do ERP;
- o painel pessoal apresenta identificacao atual, alterar identificacao, esquecer identificacao neste aparelho e os mesmos atalhos da esteira;
- estado sem cliente identificado usa `Ola!` e orienta identificacao sem autenticar de fato nesta etapa.

## Status Operacional

Composicao:

```text
[relogio] Aberta v
```

Estados arquiteturalmente suportados:

- Aberta;
- Fechada;
- Abre em breve;
- Encerra em breve;
- Somente retirada;
- Entrega indisponivel.

Enquanto nao houver fonte real de horario, o painel informa `Informacoes de horario em atualizacao`.

## Promocoes

Comportamento:

- nao existe faixa permanente `Promocoes de hoje / Ver` abaixo da busca quando nao houver promocao real;
- promocoes sao acessadas pela esteira, pelo painel pessoal, por selos de produto ou por futura secao condicional;
- quando nao houver fonte real, abrir o painel de promocoes mostra estado vazio/controlado.

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

## H2 - Superficies do Cabecalho

### Regra Geral

Somente uma superficie do cabecalho pode permanecer aberta por vez:

- esteira da logo;
- painel do cliente;
- edicao do cliente;
- promocoes;
- acoes;
- beneficios;
- pedidos;
- horario/status;
- menu institucional.

Todas fecham por novo toque no gatilho, clique fora, Escape ou escolha de destino. A abertura de uma superficie fecha a anterior, sem deslocar permanentemente busca, categorias ou cards.

### Painel do Cliente

O painel do cliente possui exatamente tres areas:

1. Identidade.
2. Participacoes do cliente.
3. Pedido / jornada atual.

Nao existe Area 4.

#### Area 1 - Identidade

Conteudo permitido:

- foto opcional;
- nome simples ou completo;
- acao `Editar informacoes`.

Nao mostrar no painel:

- excluir cadastro;
- inativar cadastro;
- cancelar cadastro;
- controles administrativos.

Cancelamento, inativacao ou ajustes administrativos ficam sob responsabilidade gerencial, mediante solicitacao no chat ou regra operacional aprovada.

`Editar informacoes` permanece dentro da Area 1 e pode abrir superficie controlada com:

- nome;
- foto opcional;
- salvar;
- cancelar.

Enquanto nao houver persistencia real, a edicao deve ser tratada como demonstracao/estado preparado, sem prometer gravacao definitiva.

#### Area 2 - Participacoes do Cliente

Representa somente participacoes individuais:

- Minhas promocoes;
- Minhas acoes;
- Cupons e beneficios;
- Fidelidade / progresso.

Nao mistura ofertas gerais da loja com beneficios pessoais.

Sem backend real, usar estado vazio honesto:

```text
Nenhuma acao ativa agora.

Quando houver promocoes, beneficios ou campanhas para voce,
elas aparecerao aqui.
```

#### Area 3 - Pedido / Jornada Atual

Prioridade:

- pedido atual, quando existir;
- numero do pedido;
- status;
- retirada ou entrega;
- previsao, somente com dado real;
- acao `Acompanhar`.

Sem pedido:

```text
Nenhum pedido em andamento.
```

Atalhos futuros permitidos, sem inventar dados:

- Ultimo pedido;
- Pedir novamente.

### Cliente Nao Identificado

Quando nao houver cliente identificado, o cabecalho mostra:

```text
Ola! v
```

Nao usar nome ficticio.

O cardapio nunca deve ser bloqueado. O primeiro estado do fluxo solicita apenas o nome:

```text
Ola! Que bom ter voce aqui.

Como podemos chamar voce?
```

Acoes:

- Continuar;
- Agora nao.

Depois de informar o nome:

```text
Prazer, [nome]!

Voce pode adicionar uma foto ou completar seus dados depois.
```

Acoes:

- Adicionar foto;
- Continuar.

Telefone, endereco e CPF so podem ser solicitados quando houver finalidade clara e contrato aprovado.

### Horario / Status Operacional Retratil

O status fica na primeira linha do header:

```text
[relogio] Aberta v
```

Nao mover para segunda linha.

Estados arquiteturalmente suportados:

- Aberta;
- Fechada;
- Abre em breve;
- Encerra em breve;
- Somente retirada;
- Entrega indisponivel.

Enquanto nao houver fonte real de horario, usar estado controlado:

```text
Horarios e canais em atualizacao.
```

O cardapio continua disponivel. Pedidos e disponibilidade real dependem do contrato de horarios.

### Esteira da Logo

Ao tocar na marca:

- expansao horizontal parte da logo;
- toque simples, nunca press and hold;
- permanece associada a primeira linha;
- nao cria segunda linha permanente;
- nao empurra permanentemente o catalogo para baixo.

Conteudo:

- Promocoes;
- Minhas acoes;
- Beneficios;
- Pedidos.

Mapeamento:

- Promocoes -> Area 2 filtrada em `Minhas promocoes`;
- Minhas acoes -> Area 2 filtrada em `Minhas acoes`;
- Beneficios -> Area 2 filtrada em `Cupons e beneficios`;
- Pedidos -> Area 3.

A esteira e o modal do cliente reutilizam estados vazios, destinos e componentes de Areas 2 e 3.

### Linhas-guia

As linhas-guia laterais sao temporarias e servem apenas para aferir margens e alinhamento.

Elas podem aparecer em evidencias de auditoria, mas devem ser removidas ao final da homologacao visual.

## H2.1 - Superficies Enxutas, Fechamento Contextual e Status Retratil

### Fechamento Contextual

Todas as superficies do cabecalho devem fechar por:

- clique fora;
- tecla Escape;
- toque no mesmo gatilho;
- abertura de outra superficie;
- acao conclusiva dentro da propria superficie.

Confirmacao so existe quando o formulario de edicao do cliente tiver alteracoes nao salvas.

Texto da confirmacao:

```text
Descartar alteracoes?
Continuar editando
Descartar
```

Superficies consultivas nao pedem confirmacao.

### Painel Cliente Enxuto

O painel do cliente possui exatamente tres areas:

1. Identidade.
2. Participacoes.
3. Pedido atual.

Identidade:

```text
[foto] Joao
Editar
```

Participacoes:

```text
Participacoes
Nenhuma participacao ativa.
Promocoes, acoes e beneficios aparecerao aqui.
```

Pedido atual:

```text
Pedido atual
Nenhum pedido em andamento.
```

Nao exibir `Ultimo pedido`, `Pedir novamente`, excluir, cancelar ou inativar sem fonte real.

### Edicao Cliente

A edicao local inicial permite apenas:

- nome;
- foto opcional;
- Salvar;
- Cancelar.

Cancelar, clique fora ou Escape so disparam confirmacao se houver alteracao nao salva.

### Status Aberta Retratil

O estado inicial mostra:

```text
[relogio] Aberta [v]
```

Apos 7 segundos, seguindo a duracao ja usada no deslizante de Agenda, retrai para:

```text
[relogio] [v]
```

Ao abrir a superficie:

```text
Horarios
Horarios e canais em atualizacao.
```

Nao criar cards de canal sem fonte real.

### Menu Tres Pontos Contextual

O menu deve ser derivado de:

```text
getCatalogMenuItems({ route, customerIdentified, userRole, permissions, capabilities })
```

Cliente nao identificado:

- Sobre;
- Horarios;
- Como chegar;
- Falar;
- Compartilhar;
- Termos.

Cliente identificado pode receber:

- Meus dados;
- Meu pedido.

Nao expor modulos internos nem duplicar promocoes, acoes e beneficios ja presentes na esteira.

## H2.2 - Proporcao das Superficies, Avatar e Menu Contextual

### Proporcao das Superficies

Painel do cliente, horario e menu usam superficie ancorada, largura proporcional ao conteudo e altura automatica.

Regras:

- nao ocupar largura total sem necessidade;
- nao parecer drawer;
- adaptar em 408 px, 360 px e 320 px;
- manter clique fora, Escape e mesmo gatilho como fechamento imediato;
- confirmar fechamento apenas quando a edicao do cliente estiver suja.

### Avatar no Cabecalho

O gatilho do cliente passa a ser:

```text
[avatar]
Ola, Joao! v
```

O avatar fica centralizado com o cumprimento e forma um unico alvo de toque.

### Foto do Cliente

A foto segue demonstracao local ate existir contrato de persistencia:

- visualizar;
- adicionar/trocar;
- remover;
- cancelar;
- salvar junto ao nome apenas em estado local.

Remover foto nao significa excluir cadastro.

### Logo Simples

A logo mantem a marca oficial e recebe apenas contorno/halo discreto no container, sem alterar arquivo da marca.

### Horario

O retratil de horario fica compacto:

```text
Horarios
Em atualizacao.
```

### Menu Tres Pontos

O menu da tela nao duplica gatilhos existentes. Itens finais:

- Sobre;
- Como chegar;
- Falar;
- Compartilhar;
- Termos.

## H2.3 - Identidade com Avatar Lateral e Superficies Ajustadas ao Conteudo

### Identidade no Cabecalho

A identidade do cliente usa avatar lateral e texto em duas linhas:

```text
[avatar] [Ola,]
         [Joao! v]
```

Regras:

- avatar a esquerda;
- `Ola,` menor e secundario;
- nome maior e legivel;
- seta junto ao nome;
- avatar e texto centralizados verticalmente entre si;
- logo preserva maior autoridade institucional.

### Separacao de Acoes

Avatar:

- gerencia exclusivamente foto;
- abre superficie pequena de foto;
- nao abre primeiro o painel completo.

Saudacao/nome/seta:

- abre painel do cliente.

### Superficie de Foto

Sem foto:

```text
Foto
Adicionar foto
```

Com foto:

```text
Foto
Visualizar
Trocar
Remover
```

A superficie e ancorada ao avatar, compacta e fecha por clique fora, Escape, X, novo gatilho ou acao conclusiva.

### Painel Cliente

O painel do cliente continua com tres areas e densidade minima:

```text
Cliente

[avatar] Joao
         Editar

Participacoes
Nenhuma no momento.

Pedido atual
Nenhum em andamento.
```

Nao reservar espaco para conteudo futuro inexistente.

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

## H2.4 - Cliente Sem Avatar no Cabecalho

### Decisao

O avatar foi removido do cabecalho do Cardapio Digital.

Motivo:

- a logo Alvorada permanece como principal referencia visual da abertura;
- a identidade do cliente e suficiente pelo cumprimento e nome;
- foto do cliente pertence ao cadastro, nao ao cabecalho permanente do catalogo.

### Composicao Final do Cabecalho

```text
[Logo] [Ola,]
       [Joao! v] [relogio/status] [tema] [menu]
```

Regras:

- `Ola,` menor e secundario;
- `Joao!` e o nome primario;
- seta integrada ao nome;
- toda a area do cumprimento abre `Participacoes`;
- nao existe avatar, camera ou superficie de foto no cabecalho.

### Modal do Cliente

O modal do cliente passa a ser exclusivamente consultivo:

```text
Participacoes

Promocoes
Acoes
Beneficios
Fidelidade

Nenhuma no momento.
```

Regras:

- sem identidade;
- sem nome;
- sem foto;
- sem editar dados;
- sem pedido atual;
- sem ultimo pedido;
- sem repetir pedido;
- sem espaco reservado para conteudo futuro.

### Pedidos no Menu Contextual

Pedidos sao capacidade futura e so aparecem quando houver dados reais e contrato funcional:

- Pedido atual;
- Acompanhar pedido;
- Ultimos 3 pedidos;
- Mais pedidos.

Sem backend/capacidade real:

- nao mostrar;
- nao desabilitar;
- nao criar placeholder.

### Participacoes

Os destinos `Promocoes`, `Acoes`, `Beneficios` e `Fidelidade` sao compartilhados entre cumprimento e esteira da logo.

Enquanto nao houver backend:

- mostrar apenas o destino;
- mostrar `Nenhuma no momento.`;
- nao inventar pontos, cupons, datas ou campanhas.

## H2.5 - Estado de Boas-vindas e Homologacao do Cabecalho

### Cliente Identificado

Composicao homologada:

```text
[Logo] [Ola,]
       [Joao! v] [relogio/status] [tema] [menu]
```

Preservar:

- alinhamento;
- proporcao;
- hierarquia visual;
- altura do cabecalho;
- ausencia de avatar.

### Cliente Ainda Nao Identificado

Composicao correspondente:

```text
[Logo] [Seja]
       [Bem-vindo(a)! v] [relogio/status] [tema] [menu]
```

Regras:

- `Seja` ocupa a linha superior, menor e leve;
- `Bem-vindo(a)!` ocupa a linha inferior, como texto principal;
- ocupa a mesma posicao de `Ola, / Joao!`;
- nao adiciona avatar;
- nao aumenta a altura do cabecalho;
- nao empurra status, tema ou menu;
- truncamento apenas se indispensavel em 320 px.

### Fluxo Progressivo

Ao tocar em `Seja / Bem-vindo(a)!`, abrir:

```text
Que bom ter voce aqui.

Como podemos chamar voce?

[Nome]

[Continuar]
[Agora nao]
```

Regras:

- o cardapio permanece disponivel;
- `Agora nao` fecha a superficie e mantem cliente sem identificacao;
- nao usar `Cadastre-se`, `Criar conta` ou `Faca login`;
- nao pedir telefone, endereco, CPF ou foto;
- nome informado e apenas estado local ate existir backend;
- clique fora e Escape fecham;
- pedir confirmacao somente se houver nome digitado ainda nao salvo.

### Cliente Identificado

Quando identificado, o painel do cliente permanece somente com:

```text
Participacoes
Promocoes
Acoes
Beneficios
Fidelidade
Nenhuma no momento.
```

## H2.6 - Controle Tipografico aa / Aa / AA

### Origem e Escopo

O controle `aa / Aa / AA` foi consolidado para o M-003 a partir do padrao ja existente no sistema:

- `aa`: texto compacto;
- `Aa`: texto padrao;
- `AA`: texto ampliado.

A busca historica nao localizou fatores antigos especificos do Catalogo Digital. Portanto, os fatores atuais sao consolidacao da H2.6, nao recuperacao de valor historico:

- `compact`: 0.90;
- `normal`: 1.00;
- `large`: 1.15.

### Regras de Implementacao

- usar `data-text-scale="compact|normal|large"` na raiz da tela do catalogo;
- usar `--catalog-text-scale` e tokens semanticos derivados;
- nao usar `zoom`;
- nao usar `transform: scale`;
- nao escalar container global;
- nao alterar tamanho de icones;
- nao alterar logo;
- nao alterar botao `+`;
- nao alterar raios, bordas, colunas, larguras estruturais ou areas minimas de toque;
- aplicar somente em textos e entrelinhas correspondentes.

### Controle no Cabecalho

Na entrada inicial, o cabecalho mostra o controle expandido:

```text
aa  Aa  AA
```

Esse estado permanece pelo mesmo tempo do status operacional retratil:

```text
7000ms
```

Apos esse periodo, o controle recolhe para o gatilho compacto:

```text
Aa
```

Ao tocar em `Aa`, abre uma superficie pequena:

```text
Texto
aa  Aa  AA
```

Regras:

- indicar o nivel ativo;
- fechar ao escolher um nivel;
- fechar ao tocar fora;
- fechar com Escape;
- fechar ao tocar no mesmo gatilho;
- fechar ao abrir outra superficie do cabecalho.

### Persistencia Local

A escolha do tamanho de texto pode ser persistida localmente no dispositivo, sem simular backend:

```text
alvorada_catalog_text_scale
```

### Areas Afetadas

O controle tipografico se aplica aos textos de:

- cumprimento e nome do cliente;
- estado de boas-vindas;
- status operacional;
- busca;
- categorias;
- nomes, descricoes, precos e selos de produto;
- menu;
- horarios;
- Participacoes;
- estados vazios;
- ficha do produto;
- carrinho visual local.

### Criterios de Aceite

- `AA` nao quebra o cabecalho em 408, 360 e 320 px;
- `AA` nao empurra status, tema ou menu;
- `AA` nao corta nome, busca, categorias, cards, ProductSheet ou carrinho;
- `aa` nao deixa textos com aparencia desabilitada;
- modo claro e modo escuro preservados;
- linhas-guia continuam apenas como auditoria visual.
