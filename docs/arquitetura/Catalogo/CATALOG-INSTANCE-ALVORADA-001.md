# CATALOG-INSTANCE-ALVORADA-001

Documento oficial de instancia inicial do catalogo real da Alvorada.

Status: EM HOMOLOGACAO DOCUMENTAL

## 1. Identificacao

Objetivo: consolidar documentalmente os produtos reais visiveis no cardapio fisico oficial da Alvorada, sem implementar dados no sistema.

Este documento servira futuramente como base comum para:

- Catalogo Digital;
- Venda Balcao;
- Producao;
- Caixa;
- OJC;
- IA;
- integracoes futuras.

Nenhuma migracao para Convex, seeds, backend ou frontend esta autorizada nesta etapa.

## 2. Fontes Utilizadas

### Fonte primaria

- `C:\Users\aiste\Downloads\Lanches - Alvorada.jpg`
- `C:\Users\aiste\Downloads\Artesanais - Alvorada.jpg`
- `C:\Users\aiste\Downloads\Pizzas - Alvorada.jpg`
- `C:\Users\aiste\Downloads\Porções e caldos - Alvorada.jpg`
- `C:\Users\aiste\Downloads\Sucos - alvorada.jpg`

### Fontes arquiteturais

- `C:\Rondon IA\Alvorada Padaria\.rondon\knowledge\CATALOG-FOUNDATION-001.md`
- `docs/arquitetura/UX/Matriz-Reconciliacao-Cardapio-Foundation.md`
- `docs/arquitetura/DMI/DMI-Jornada-Cliente-Catalogo-Digital.md`
- `docs/arquitetura/MHO/MHO-Jornada-Cliente-Catalogo-Digital.md`
- `docs/arquitetura/UX/UX-Cardapio-Digital-Telas-Modais.md`
- `docs/arquitetura/UX/DNA-Cardapio-Digital-Aprovado.md`

## 3. Regras Gerais

1. Produtos reais foram transcritos somente quando legiveis na fonte fisica.
2. Precos foram registrados exatamente como aparecem na fonte fisica.
3. Ingredientes foram preservados e apenas normalizados em ortografia, espaco, pontuacao e capitalizacao.
4. Descricoes curtas sao objetivas e derivadas apenas da composicao original.
5. Nenhum produto foi criado por inferencia.
6. Nenhum preco foi calculado, arredondado ou corrigido.
7. Nenhuma imagem foi buscada, baixada, gerada ou implementada nesta etapa.
8. O catalogo deve permanecer completo mesmo quando nao houver fotografia propria ou oficial de qualidade.
9. Imagem propria/oficial deve ser usada quando disponivel e adequada; imagem generica provisoria pode ser usada quando representar corretamente o produto; placeholder institucional e apenas ultimo fallback.
10. Dados ilegiveis, ausentes ou aparentemente conflitantes foram marcados como `PENDENTE DE VALIDACAO`.
11. IDs sao documentais e provisorios; nao substituem codigo interno oficial futuro iniciado em `00001`.
12. Origem (`Produzido`, `Revendido`, `Misto`) foi classificada apenas quando havia evidencia suficiente na fonte fisica.
13. Subcategoria e Familia sao informacoes documentais de organizacao; nao alteram a UX.
14. Produtos presentes no cardapio fisico entram como candidatos a exibicao no Catalogo Digital e na Venda Balcao.
15. Envio a Producao permanece dependente de migracao e regra operacional futura.

## 4. Categorias

Categorias usadas nesta instancia:

1. Lanches
2. Artesanais
3. Pizzas Salgadas
4. Pizzas Doces
5. Porcoes
6. Caldos
7. Sucos
8. Bebidas
9. Cervejas

Observacao: a Foundation registra `Lanches Tradicionais` e `Hamburgueres Artesanais`; nesta instancia, foi mantida a nomenclatura solicitada pelo escopo: `Lanches` e `Artesanais`.

## 5. Produtos

Campos padrao:

- Imagem atual: conforme inventario documental de imagens;
- Origem da imagem: `Propria`, `Oficial do fabricante`, `Generica` ou `Placeholder institucional`;
- Status da imagem: `Aprovada`, `Provisoria` ou `Substituir`;
- Texto alternativo: obrigatorio na migracao futura;
- Pendencia de substituicao: obrigatoria quando a imagem nao for propria/oficial aprovada;
- Status documental: `confirmado na fonte fisica`, salvo pendencia indicada;
- Exibir no Catalogo Digital: `sim`;
- Exibir na Venda Balcao: `sim`;
- Enviar a Producao: conforme futura regra operacional;
- Observacoes permitidas: `sim`, como observacao de item/pedido, sem alterar cadastro fixo.

### 5.1 Lanches

Origem documental: `Produzido`, por evidencia de montagem/preparo com ingredientes no cardapio fisico.

Subcategoria documental: `Tradicionais`.

| ID | Produto | Subcategoria | Familia | Origem | Descricao objetiva | Preco base | Pendencias |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| LAN-001 | Misto Quente | Tradicionais | Misto | Produzido | Pao, presunto, mucarela e oregano. | 9,00 | - |
| LAN-002 | Bauru | Tradicionais | Bauru | Produzido | Pao, presunto, mucarela, tomate e oregano. | 11,00 | - |
| LAN-003 | X-Burguer | Tradicionais | X | Produzido | Pao, presunto, mucarela, hamburguer e oregano. | 13,00 | - |
| LAN-004 | Americano | Tradicionais | Americano | Produzido | Pao, presunto, mucarela, ovo, tomate, alface e oregano. | 13,00 | - |
| LAN-005 | X-Salada | Tradicionais | X | Produzido | Hamburguer, presunto, mucarela, milho, tomate, alface e oregano. | 15,00 | - |
| LAN-006 | X-Salada com Catupiry | Tradicionais | X | Produzido | Hamburguer, catupiry, presunto, mucarela, milho, tomate, alface e oregano. | 17,00 | - |
| LAN-007 | Cachorro-Quente | Tradicionais | Cachorro-Quente | Produzido | Salsicha, bacon, calabresa, mucarela, tomate, milho, batata palha e oregano. | 13,00 | - |
| LAN-008 | Cachorro-Quente c/ Catupiry | Tradicionais | Cachorro-Quente | Produzido | Salsicha, bacon, calabresa, catupiry, mucarela, tomate, milho, batata palha e oregano. | 15,00 | - |
| LAN-009 | Cachorro-Quente Prime | Tradicionais | Cachorro-Quente | Produzido | Salsicha, hamburguer, bacon, calabresa, mucarela, tomate, milho, batata palha e oregano. | 17,00 | - |
| LAN-010 | X-Egg | Tradicionais | X | Produzido | Hamburguer, ovo, presunto, mucarela, tomate, alface e oregano. | 17,00 | - |
| LAN-011 | X-Bacon | Tradicionais | X | Produzido | Hamburguer, bacon, presunto, mucarela, tomate, alface e oregano. | 18,00 | - |
| LAN-012 | X-Egg Bacon | Tradicionais | X | Produzido | Hamburguer, bacon, ovo, presunto, mucarela, tomate, alface e oregano. | 19,00 | - |
| LAN-013 | X-Egg Calabresa | Tradicionais | X | Produzido | Hamburguer, calabresa, ovo, presunto, mucarela, tomate, alface e oregano. | 19,00 | - |
| LAN-014 | X-Calabresa | Tradicionais | X | Produzido | Hamburguer, calabresa, presunto, mucarela, tomate, alface e oregano. | 18,00 | - |
| LAN-015 | X-Tudo | Tradicionais | X | Produzido | Hamburguer, salsicha, ovo, bacon, calabresa, presunto, mucarela, tomate, milho, alface e oregano. | 22,00 | - |
| LAN-016 | X-Tudo Prime | Tradicionais | X | Produzido | 2 hamburgueres, salsicha, ovo, bacon, calabresa, catupiry, presunto, mucarela, milho, tomate, alface e oregano. | 27,00 | - |

### 5.2 Artesanais

Origem documental: `Produzido`, por evidencia de montagem/preparo com ingredientes no cardapio fisico.

Subcategoria documental: `Hamburgueres Artesanais`.

| ID | Produto | Subcategoria | Familia | Origem | Descricao objetiva | Preco base | Upgrade comercial | Pendencias |
| --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| ART-001 | Burguer Simples | Hamburgueres Artesanais | Simples | Produzido | Pao brioche, hamburguer artesanal, mucarela, molho cheddar. | 20,00 | +100 g de batata: 30,00 | Upgrade comercial pendente de modelagem operacional. |
| ART-002 | Alvorada Burguer | Hamburgueres Artesanais | Alvorada | Produzido | Pao brioche, hamburguer artesanal, cheddar, bacon, alface e tomate. | 24,00 | - | - |
| ART-003 | Alvorada Burguer Duplo | Hamburgueres Artesanais | Alvorada | Produzido | Pao brioche, 2 hamburgueres artesanais, bacon, barbecue, mucarela e cheddar. | 28,00 | - | - |
| ART-004 | Tropical | Hamburgueres Artesanais | Tropical | Produzido | Pao brioche, hamburguer artesanal, abacaxi, cebola caramelizada, molho barbecue. | 25,00 | - | - |
| ART-005 | Burguer Favorito | Hamburgueres Artesanais | Favorito | Produzido | Pao brioche, hamburguer artesanal, cheddar, cebola caramelizada, banana e farofa de bacon. | 26,00 | - | - |
| ART-006 | Fitness | Hamburgueres Artesanais | Fitness | Produzido | Pao brioche, hamburguer artesanal, palmito, alface, tomate, picles, cebola roxa, mucarela. | 28,00 | - | - |
| ART-007 | Suprema | Hamburgueres Artesanais | Suprema | Produzido | Pao brioche, 2 hamburgueres artesanais, banana da terra, cebola caramelizada, cheddar, mussarela. | 30,00 | - | - |
| ART-008 | Caribe | Hamburgueres Artesanais | Caribe | Produzido | Pao brioche, hamburguer artesanal, molho barbecue, mucarela, abacaxi. | 25,00 | +100 g de batata: 35,00 | Upgrade comercial pendente de modelagem operacional. |

### 5.3 Pizzas Salgadas

Origem documental: `Produzido`, por evidencia de preparo por sabor e tamanho.

Subcategoria documental: conforme familia principal do sabor.

Todas as pizzas salgadas usam variacoes `P`, `M` e `G` para 1 sabor, conforme preco do cardapio fisico.

| ID | Produto | Subcategoria | Familia | Origem | Descricao objetiva | P | M | G | Pendencias |
| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| PIZ-S-001 | Tradicional | Tradicional | Tradicional | Produzido | Presunto, mucarela, tomate, milho, calabresa, azeitona, cebola e oregano. | 42,00 | 50,00 | 60,00 | - |
| PIZ-S-002 | Moda Alvorada | Especial | Moda Alvorada | Produzido | Mucarela, presunto, lombo canadense, tomate, azeitona, palmito, cebola e oregano. | 42,00 | 50,00 | 60,00 | - |
| PIZ-S-003 | Lombo Canadense | Lombo | Lombo Canadense | Produzido | Mucarela, catupiry, lombo canadense, azeitona, cebola e oregano. | 49,00 | 57,00 | 67,00 | - |
| PIZ-S-004 | Calabresa | Calabresa | Calabresa | Produzido | Presunto, mucarela, calabresa, cebola e oregano. | 42,00 | 50,00 | 60,00 | - |
| PIZ-S-005 | Frango | Frango | Frango | Produzido | Frango desfiado, mucarela, tomate, cebola e oregano. | 42,00 | 50,00 | 60,00 | - |
| PIZ-S-006 | Frango com Palmito | Frango | Frango | Produzido | Frango desfiado, mucarela, palmito, tomate, cebola e oregano. | 47,00 | 55,00 | 65,00 | - |
| PIZ-S-007 | Frango com Catupiry | Frango | Frango | Produzido | Frango desfiado, catupiry, mucarela, tomate, cebola e oregano. | 47,00 | 55,00 | 65,00 | - |
| PIZ-S-008 | Strogonoff de File Mignon | Strogonoff | Strogonoff | Produzido | Strogonoff, mucarela e batata palha. | 45,00 | 57,00 | 67,00 | Confirmar grafia operacional de `File`/`File Mignon`. |
| PIZ-S-009 | Quatro Queijos | Queijos | Quatro Queijos | Produzido | Mucarela, Catupiry, parmesao, provolone. | 45,00 | 55,00 | 65,00 | - |
| PIZ-S-010 | Portuguesa | Portuguesa | Portuguesa | Produzido | Presunto, mucarela, tomate, ovos, azeitona, cebola e oregano. | 42,00 | 50,00 | 60,00 | - |
| PIZ-S-011 | Mediterranea | Especial | Mediterranea | Produzido | Calabresa ralada, Catupiry, mucarela, champignon, palmito, cebola e oregano. | 52,00 | 60,00 | 70,00 | - |

### 5.4 Pizzas Doces

Origem documental: `Produzido`, por evidencia de preparo por sabor e tamanho.

Subcategoria documental: `Doces`.

Todas as pizzas doces usam variacoes `P`, `M` e `G` para 1 sabor, conforme preco do cardapio fisico.

| ID | Produto | Subcategoria | Familia | Origem | Descricao objetiva | P | M | G | Pendencias |
| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| PIZ-D-001 | Banana e Doce de Leite | Doces | Banana | Produzido | Mucarela, banana, doce de leite e canela. | 50,00 | 60,00 | 70,00 | - |
| PIZ-D-002 | Californiana | Doces | Frutas | Produzido | Mucarela, pessego em calda, abacaxi em calda, figo em calda, creme de leite. | 50,00 | 60,00 | 70,00 | - |
| PIZ-D-003 | Dois Amores | Doces | Chocolate | Produzido | Mucarela, chocolate ao leite, chocolate branco, creme de leite. | 50,00 | 60,00 | 70,00 | - |

### 5.5 Porcoes

Origem documental: `Produzido`, por evidencia de preparo como porcao no cardapio fisico.

Subcategoria documental: `Porcoes`.

| ID | Produto | Subcategoria | Familia | Origem | Descricao objetiva | Preco base | Pendencias |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| POR-001 | Batata Frita | Porcoes | Batata | Produzido | Batata frita. | 35,00 | Descricao detalhada nao informada no cardapio fisico. |
| POR-002 | Calabresa | Porcoes | Calabresa | Produzido | Calabresa. | 50,00 | Descricao detalhada nao informada no cardapio fisico. |
| POR-003 | Porcao Mista | Porcoes | Mista | Produzido | Porcao mista. | 60,00 | Composicao da porcao mista nao informada no cardapio fisico. |
| POR-004 | Batata Frita c/ Cheddar e Bacon | Porcoes | Batata | Produzido | Batata frita, cheddar e bacon. | 48,00 | Descricao detalhada nao informada no cardapio fisico. |

### 5.6 Caldos

Origem documental: `Produzido`, por evidencia de preparo como caldo e acompanhamentos.

Subcategoria documental: `Caldos`.

| ID | Produto | Subcategoria | Familia | Origem | Descricao objetiva | Variacoes | Acompanhamentos incluidos | Pendencias |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CAL-001 | Caldo de Carne | Caldos | Carne | Produzido | Caldo de carne. | 300 ml: 18,00; 500 ml: 23,00 | Torrada, queijo e cheiro-verde. | - |
| CAL-002 | Caldo de Frango | Caldos | Frango | Produzido | Caldo de frango. | 300 ml: 18,00; 500 ml: 23,00 | Torrada, queijo e cheiro-verde. | - |

### 5.7 Sucos

Origem documental: `Produzido`, por evidencia de preparo por sabor e liquido.

Subcategoria documental: `Naturais`.

Cada sabor e produto unico. Quando aplicavel, as variacoes sao `copo (agua)`, `copo (leite)`, `jarra (agua)` e `jarra (leite)`.

| ID | Produto | Subcategoria | Familia | Origem | Descricao objetiva | Variacoes | Pendencias |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SUC-001 | Suco de Acerola | Naturais | Acerola | Produzido | Natural. Agua ou leite. | Copo (agua): 8,00; Copo (leite): 10,00; Jarra (agua): 16,00; Jarra (leite): 18,00 | - |
| SUC-002 | Suco de Abacaxi | Naturais | Abacaxi | Produzido | Natural. Agua ou leite. | Copo (agua): 8,00; Copo (leite): 10,00; Jarra (agua): 16,00; Jarra (leite): 18,00 | - |
| SUC-003 | Suco de Cupuacu | Naturais | Cupuacu | Produzido | Natural. Agua ou leite. | Copo (agua): 8,00; Copo (leite): 10,00; Jarra (agua): 16,00; Jarra (leite): 18,00 | - |
| SUC-004 | Suco de Goiaba | Naturais | Goiaba | Produzido | Natural. Agua ou leite. | Copo (agua): 8,00; Copo (leite): 10,00; Jarra (agua): 16,00; Jarra (leite): 18,00 | - |
| SUC-005 | Suco de Maracuja | Naturais | Maracuja | Produzido | Natural. Agua ou leite. | Copo (agua): 10,00; Copo (leite): 12,00; Jarra (agua): 18,00; Jarra (leite): 20,00 | - |
| SUC-006 | Suco de Morango | Naturais | Morango | Produzido | Natural. Agua ou leite. | Copo (agua): 10,00; Copo (leite): 12,00; Jarra (agua): 18,00; Jarra (leite): 20,00 | - |
| SUC-007 | Suco de Laranja | Naturais | Laranja | Produzido | Natural. | Copo: 10,00; Jarra: 20,00 | Confirmar se nao existem opcoes agua/leite para este sabor. |
| SUC-008 | Suco de Laranja com Leite Condensado | Naturais | Laranja | Produzido | Natural. Leite condensado. | Copo: 12,00; Jarra: 22,00 | Confirmar composicao final e se entra como suco ou especial. |

### 5.8 Bebidas

Origem documental: `Revendido`, por evidencia de marca/produto embalado.

Subcategoria documental: `Refrigerantes` ou `Agua Mineral`.

Nao criar descricoes longas. Usar marca e volume/embalagem.

| ID | Produto | Subcategoria | Familia | Origem | Descricao objetiva | Variacoes | Pendencias |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BEB-001 | Coca-Cola | Refrigerantes | Coca-Cola | Revendido | Coca-Cola. | Lata: 6,00; 600 ml: PENDENTE DE VALIDACAO; 1 litro: PENDENTE DE VALIDACAO; 2 litros: 15,00 | Precos de 600 ml e 1 litro nao estao legiveis/visiveis na fonte. |
| BEB-002 | Fanta | Refrigerantes | Fanta | Revendido | Fanta. | Lata: 6,00; 600 ml: 8,00; 1 litro: 11,00; 2 litros: 15,00 | - |
| BEB-003 | Tuchaua | Refrigerantes | Tuchaua | Revendido | Tuchaua. | Lata: 6,00; 600 ml: 8,00; 1 litro: 11,00; 2 litros: 10,00 | Confirmar preco de 2 litros. |
| BEB-004 | Agua Mineral | Agua Mineral | Agua Mineral | Revendido | Agua mineral. | Sem gas: 4,00; Com gas: 5,00 | - |

### 5.9 Cervejas

Origem documental: `Revendido`, por evidencia de marca/produto embalado.

Subcategoria documental: `Cervejas`.

| ID | Produto | Subcategoria | Familia | Origem | Descricao objetiva | Variacoes | Pendencias |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CER-001 | Skol | Cervejas | Skol | Revendido | Skol. | Lata: 5,00; 600 ml: 12,00 | - |
| CER-002 | Brahma | Cervejas | Brahma | Revendido | Brahma. | Lata: 5,00; 600 ml: 12,00 | - |
| CER-003 | Original | Cervejas | Original | Revendido | Original. | Lata: 5,00; 600 ml: 13,00 | - |

## 6. Grupos de Variacao

| ID | Nome | Aplicacao | Opcoes | Pendencias |
| --- | --- | --- | --- | --- |
| VAR-PIZZA-001 | Tamanho de pizza de 1 sabor | Pizzas salgadas e doces | P, M, G | - |
| VAR-PIZZA-002 | Tamanho de pizza de 2 sabores | Pizzas salgadas e doces | M, G | Politica de preco de dois sabores pendente. |
| VAR-CALDO-001 | Volume de caldo | Caldos | 300 ml, 500 ml | - |
| VAR-SUCO-001 | Suco padrao | Acerola, Abacaxi, Cupuacu, Goiaba, Maracuja, Morango | Copo (agua), Copo (leite), Jarra (agua), Jarra (leite) | - |
| VAR-SUCO-002 | Suco simples | Laranja | Copo, Jarra | Confirmar se nao ha agua/leite. |
| VAR-SUCO-003 | Suco especial | Laranja com Leite Condensado | Copo, Jarra | Confirmar classificacao. |
| VAR-BEBIDA-001 | Refrigerante por embalagem/volume | Coca-Cola, Fanta, Tuchaua | Lata, 600 ml, 1 litro, 2 litros | Coca-Cola 600 ml e 1 litro pendentes; Tuchaua 2 litros precisa confirmacao. |
| VAR-BEBIDA-002 | Agua mineral | Agua Mineral | Sem gas, com gas | - |
| VAR-CERVEJA-001 | Cerveja por embalagem/volume | Skol, Brahma, Original | Lata, 600 ml | - |

## 7. Upgrade Comercial

`+100 g de batata` foi removido da classificacao de variacao tradicional.

Registro documental:

| ID | Nome | Aplicacao | Precos visiveis | Status |
| --- | --- | --- | --- | --- |
| UPG-ART-001 | +100 g de batata | Burguer Simples; Caribe | Burguer Simples: 30,00; Caribe: 35,00 | PENDENTE DE MODELAGEM OPERACIONAL |

Nao decidir nesta etapa se sera adicional, combo, upsell ou variacao.

## 8. Grupos de Adicionais

| ID | Nome | Aplicacao | Itens | Pendencias |
| --- | --- | --- | --- | --- |
| ADD-ART-001 | Adicionais dos artesanais | Artesanais | Hamburguer: 6,00; Mucarela: 6,00; Bacon: 6,00; Outros adicionais: 3,50 | Detalhar quais itens entram em `Outros adicionais`. |

## 9. Regras Documentais de Imagem

### 9.1 Hierarquia de imagem

1. Imagem propria/oficial da Alvorada, quando disponivel e adequada.
2. Imagem oficial da embalagem ou fabricante, especialmente para produtos revendidos, quando disponivel e autorizada.
3. Imagem generica representativa da categoria, familia ou produto.
4. Placeholder institucional apenas quando nenhuma imagem adequada estiver disponivel.

Nenhum produto deve ser ocultado, excluido ou deixar de compor o catalogo por falta de fotografia propria.

### 9.2 Imagem generica

A imagem generica deve:

- representar corretamente o produto ou sua familia;
- nao conter marca concorrente;
- nao apresentar composicao incompativel com a descricao;
- nao sugerir que seja fotografia real produzida pela Alvorada;
- possuir qualidade visual adequada ao catalogo;
- manter proporcao e enquadramento consistentes;
- ser provisoria e substituivel.

Para pizzas, lanches, porcoes, caldos e sucos:

- preferir imagem generica compativel com a descricao;
- evitar imagens com ingredientes nao presentes;
- quando nao houver correspondencia confiavel, usar imagem da familia ou placeholder institucional.

Para bebidas e cervejas:

- preferir imagem oficial da embalagem e do volume correto;
- nao usar imagem de volume, embalagem ou variante diferente;
- nao trocar marca por imagem generica de concorrente.
- usar imagem generica somente quando nao houver asset adequado de fabricante e sem induzir marca, embalagem ou volume incorretos.

### 9.3 Campos documentais por produto

Todo produto devera possuir, na migracao futura, os seguintes campos:

| Campo | Regra |
| --- | --- |
| Imagem atual | Referencia interna da imagem usada no catalogo ou `PENDENTE`. |
| Origem da imagem | `Propria`, `Oficial do fabricante`, `Generica` ou `Placeholder institucional`. |
| Status da imagem | `Aprovada`, `Provisoria` ou `Substituir`. |
| Texto alternativo | Descricao curta do produto ou embalagem, sem prometer foto real da Alvorada quando for generica. |
| Pendencia de substituicao | Registrar quando a imagem for provisoria ou inadequada. |

Valores permitidos para `Origem da imagem`:

- `Propria`;
- `Oficial do fabricante`;
- `Generica`;
- `Placeholder institucional`.

Valores permitidos para `Status da imagem`:

- `Aprovada`;
- `Provisoria`;
- `Substituir`.

### 9.4 Inventario inicial de imagens

Nesta fase documental:

- nao foi confirmada nenhuma imagem propria da Alvorada;
- nao foi confirmada nenhuma referencia especifica de imagem oficial de fabricante;
- alimentos produzidos ficam previstos com imagem generica provisoria compativel;
- bebidas e cervejas ficam previstas para imagem oficial de fabricante, mas permanecem com placeholder ate confirmacao da embalagem/volume correto;
- nao foram buscadas, baixadas, geradas ou implementadas imagens.

| Grupo | Produtos | Imagem atual | Origem da imagem | Status da imagem | Texto alternativo | Pendencia de substituicao |
| --- | --- | --- | --- | --- | --- | --- |
| Lanches | LAN-001 a LAN-016 | PENDENTE | Generica | Provisoria | Nome do lanche e composicao principal. | Substituir por foto propria ou generica validada por produto/familia. |
| Artesanais | ART-001 a ART-008 | PENDENTE | Generica | Provisoria | Nome do hamburguer artesanal e composicao principal. | Substituir por foto propria ou generica validada por produto/familia. |
| Pizzas Salgadas | PIZ-S-001 a PIZ-S-011 | PENDENTE | Generica | Provisoria | Sabor da pizza e ingredientes principais. | Substituir por foto propria ou generica validada por sabor/familia. |
| Pizzas Doces | PIZ-D-001 a PIZ-D-003 | PENDENTE | Generica | Provisoria | Sabor da pizza doce e ingredientes principais. | Substituir por foto propria ou generica validada por sabor/familia. |
| Porcoes | POR-001 a POR-004 | PENDENTE | Generica | Provisoria | Nome da porcao. | Substituir por foto propria ou generica validada; porcao mista depende de composicao. |
| Caldos | CAL-001 a CAL-002 | PENDENTE | Generica | Provisoria | Nome do caldo e volume selecionado. | Substituir por foto propria ou generica validada. |
| Sucos | SUC-001 a SUC-008 | PENDENTE | Generica | Provisoria | Sabor do suco e liquido disponivel. | Substituir por foto propria ou generica validada; laranja e laranja com leite condensado dependem de confirmacao. |
| Bebidas | BEB-001 a BEB-004 | PENDENTE | Placeholder institucional | Substituir | Marca e volume/embalagem. | Confirmar imagem oficial de fabricante para marca, embalagem e volume corretos. |
| Cervejas | CER-001 a CER-003 | PENDENTE | Placeholder institucional | Substituir | Marca e volume/embalagem. | Confirmar imagem oficial de fabricante para marca, embalagem e volume corretos. |

Inventario individual:

| ID | Produto | Imagem atual | Origem da imagem | Status da imagem | Texto alternativo | Pendencia de substituicao |
| --- | --- | --- | --- | --- | --- | --- |
| LAN-001 | Misto Quente | PENDENTE | Generica | Provisoria | Misto Quente, pao, presunto, mucarela e oregano. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-002 | Bauru | PENDENTE | Generica | Provisoria | Bauru, pao, presunto, mucarela, tomate e oregano. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-003 | X-Burguer | PENDENTE | Generica | Provisoria | X-Burguer, pao, presunto, mucarela e hamburguer. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-004 | Americano | PENDENTE | Generica | Provisoria | Americano, pao, presunto, mucarela, ovo, tomate e alface. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-005 | X-Salada | PENDENTE | Generica | Provisoria | X-Salada, hamburguer, presunto, mucarela, milho, tomate e alface. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-006 | X-Salada com Catupiry | PENDENTE | Generica | Provisoria | X-Salada com Catupiry, hamburguer, catupiry, presunto, mucarela e salada. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-007 | Cachorro-Quente | PENDENTE | Generica | Provisoria | Cachorro-Quente, salsicha, bacon, calabresa, mucarela e batata palha. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-008 | Cachorro-Quente c/ Catupiry | PENDENTE | Generica | Provisoria | Cachorro-Quente com Catupiry, salsicha, bacon, calabresa, catupiry e batata palha. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-009 | Cachorro-Quente Prime | PENDENTE | Generica | Provisoria | Cachorro-Quente Prime, salsicha, hamburguer, bacon, calabresa e batata palha. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-010 | X-Egg | PENDENTE | Generica | Provisoria | X-Egg, hamburguer, ovo, presunto, mucarela, tomate e alface. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-011 | X-Bacon | PENDENTE | Generica | Provisoria | X-Bacon, hamburguer, bacon, presunto, mucarela, tomate e alface. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-012 | X-Egg Bacon | PENDENTE | Generica | Provisoria | X-Egg Bacon, hamburguer, bacon, ovo, presunto, mucarela e salada. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-013 | X-Egg Calabresa | PENDENTE | Generica | Provisoria | X-Egg Calabresa, hamburguer, calabresa, ovo, presunto, mucarela e salada. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-014 | X-Calabresa | PENDENTE | Generica | Provisoria | X-Calabresa, hamburguer, calabresa, presunto, mucarela, tomate e alface. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-015 | X-Tudo | PENDENTE | Generica | Provisoria | X-Tudo, hamburguer, salsicha, ovo, bacon, calabresa, presunto e salada. | Substituir por foto propria ou generica validada do produto/familia. |
| LAN-016 | X-Tudo Prime | PENDENTE | Generica | Provisoria | X-Tudo Prime, 2 hamburgueres, salsicha, ovo, bacon, calabresa, catupiry e salada. | Substituir por foto propria ou generica validada do produto/familia. |
| ART-001 | Burguer Simples | PENDENTE | Generica | Provisoria | Burguer Simples, pao brioche, hamburguer artesanal, mucarela e molho cheddar. | Substituir por foto propria ou generica validada do produto/familia. |
| ART-002 | Alvorada Burguer | PENDENTE | Generica | Provisoria | Alvorada Burguer, pao brioche, hamburguer artesanal, cheddar, bacon, alface e tomate. | Substituir por foto propria ou generica validada do produto/familia. |
| ART-003 | Alvorada Burguer Duplo | PENDENTE | Generica | Provisoria | Alvorada Burguer Duplo, pao brioche, 2 hamburgueres artesanais, bacon, barbecue, mucarela e cheddar. | Substituir por foto propria ou generica validada do produto/familia. |
| ART-004 | Tropical | PENDENTE | Generica | Provisoria | Tropical, pao brioche, hamburguer artesanal, abacaxi, cebola caramelizada e barbecue. | Substituir por foto propria ou generica validada do produto/familia. |
| ART-005 | Burguer Favorito | PENDENTE | Generica | Provisoria | Burguer Favorito, pao brioche, hamburguer artesanal, cheddar, cebola caramelizada, banana e farofa de bacon. | Substituir por foto propria ou generica validada do produto/familia. |
| ART-006 | Fitness | PENDENTE | Generica | Provisoria | Fitness, pao brioche, hamburguer artesanal, palmito, alface, tomate, picles, cebola roxa e mucarela. | Substituir por foto propria ou generica validada do produto/familia. |
| ART-007 | Suprema | PENDENTE | Generica | Provisoria | Suprema, pao brioche, 2 hamburgueres artesanais, banana da terra, cebola caramelizada, cheddar e mussarela. | Substituir por foto propria ou generica validada do produto/familia. |
| ART-008 | Caribe | PENDENTE | Generica | Provisoria | Caribe, pao brioche, hamburguer artesanal, barbecue, mucarela e abacaxi. | Substituir por foto propria ou generica validada do produto/familia. |
| PIZ-S-001 | Tradicional | PENDENTE | Generica | Provisoria | Pizza Tradicional, presunto, mucarela, tomate, milho, calabresa, azeitona, cebola e oregano. | Substituir por foto propria ou generica validada do sabor/familia. |
| PIZ-S-002 | Moda Alvorada | PENDENTE | Generica | Provisoria | Pizza Moda Alvorada, mucarela, presunto, lombo canadense, tomate, azeitona, palmito, cebola e oregano. | Substituir por foto propria ou generica validada do sabor/familia. |
| PIZ-S-003 | Lombo Canadense | PENDENTE | Generica | Provisoria | Pizza Lombo Canadense, mucarela, catupiry, lombo canadense, azeitona, cebola e oregano. | Substituir por foto propria ou generica validada do sabor/familia. |
| PIZ-S-004 | Calabresa | PENDENTE | Generica | Provisoria | Pizza Calabresa, presunto, mucarela, calabresa, cebola e oregano. | Substituir por foto propria ou generica validada do sabor/familia. |
| PIZ-S-005 | Frango | PENDENTE | Generica | Provisoria | Pizza Frango, frango desfiado, mucarela, tomate, cebola e oregano. | Substituir por foto propria ou generica validada do sabor/familia. |
| PIZ-S-006 | Frango com Palmito | PENDENTE | Generica | Provisoria | Pizza Frango com Palmito, frango desfiado, mucarela, palmito, tomate, cebola e oregano. | Substituir por foto propria ou generica validada do sabor/familia. |
| PIZ-S-007 | Frango com Catupiry | PENDENTE | Generica | Provisoria | Pizza Frango com Catupiry, frango desfiado, catupiry, mucarela, tomate, cebola e oregano. | Substituir por foto propria ou generica validada do sabor/familia. |
| PIZ-S-008 | Strogonoff de File Mignon | PENDENTE | Generica | Provisoria | Pizza Strogonoff de File Mignon, strogonoff, mucarela e batata palha. | Substituir por foto propria ou generica validada do sabor/familia; grafia operacional pendente. |
| PIZ-S-009 | Quatro Queijos | PENDENTE | Generica | Provisoria | Pizza Quatro Queijos, mucarela, Catupiry, parmesao e provolone. | Substituir por foto propria ou generica validada do sabor/familia. |
| PIZ-S-010 | Portuguesa | PENDENTE | Generica | Provisoria | Pizza Portuguesa, presunto, mucarela, tomate, ovos, azeitona, cebola e oregano. | Substituir por foto propria ou generica validada do sabor/familia. |
| PIZ-S-011 | Mediterranea | PENDENTE | Generica | Provisoria | Pizza Mediterranea, calabresa ralada, Catupiry, mucarela, champignon, palmito, cebola e oregano. | Substituir por foto propria ou generica validada do sabor/familia. |
| PIZ-D-001 | Banana e Doce de Leite | PENDENTE | Generica | Provisoria | Pizza Banana e Doce de Leite, mucarela, banana, doce de leite e canela. | Substituir por foto propria ou generica validada do sabor/familia. |
| PIZ-D-002 | Californiana | PENDENTE | Generica | Provisoria | Pizza Californiana, mucarela, pessego, abacaxi, figo e creme de leite. | Substituir por foto propria ou generica validada do sabor/familia. |
| PIZ-D-003 | Dois Amores | PENDENTE | Generica | Provisoria | Pizza Dois Amores, mucarela, chocolate ao leite, chocolate branco e creme de leite. | Substituir por foto propria ou generica validada do sabor/familia. |
| POR-001 | Batata Frita | PENDENTE | Generica | Provisoria | Batata Frita. | Substituir por foto propria ou generica validada; descricao detalhada pendente. |
| POR-002 | Calabresa | PENDENTE | Generica | Provisoria | Porcao de Calabresa. | Substituir por foto propria ou generica validada; descricao detalhada pendente. |
| POR-003 | Porcao Mista | PENDENTE | Generica | Provisoria | Porcao Mista. | Substituir por foto propria ou generica validada; composicao pendente. |
| POR-004 | Batata Frita c/ Cheddar e Bacon | PENDENTE | Generica | Provisoria | Batata Frita com Cheddar e Bacon. | Substituir por foto propria ou generica validada; descricao detalhada pendente. |
| CAL-001 | Caldo de Carne | PENDENTE | Generica | Provisoria | Caldo de Carne. | Substituir por foto propria ou generica validada. |
| CAL-002 | Caldo de Frango | PENDENTE | Generica | Provisoria | Caldo de Frango. | Substituir por foto propria ou generica validada. |
| SUC-001 | Suco de Acerola | PENDENTE | Generica | Provisoria | Suco de Acerola, natural, agua ou leite. | Substituir por foto propria ou generica validada do sabor/familia. |
| SUC-002 | Suco de Abacaxi | PENDENTE | Generica | Provisoria | Suco de Abacaxi, natural, agua ou leite. | Substituir por foto propria ou generica validada do sabor/familia. |
| SUC-003 | Suco de Cupuacu | PENDENTE | Generica | Provisoria | Suco de Cupuacu, natural, agua ou leite. | Substituir por foto propria ou generica validada do sabor/familia. |
| SUC-004 | Suco de Goiaba | PENDENTE | Generica | Provisoria | Suco de Goiaba, natural, agua ou leite. | Substituir por foto propria ou generica validada do sabor/familia. |
| SUC-005 | Suco de Maracuja | PENDENTE | Generica | Provisoria | Suco de Maracuja, natural, agua ou leite. | Substituir por foto propria ou generica validada do sabor/familia. |
| SUC-006 | Suco de Morango | PENDENTE | Generica | Provisoria | Suco de Morango, natural, agua ou leite. | Substituir por foto propria ou generica validada do sabor/familia. |
| SUC-007 | Suco de Laranja | PENDENTE | Generica | Provisoria | Suco de Laranja, natural. | Substituir por foto propria ou generica validada; confirmar variacoes. |
| SUC-008 | Suco de Laranja com Leite Condensado | PENDENTE | Generica | Provisoria | Suco de Laranja com Leite Condensado. | Substituir por foto propria ou generica validada; confirmar composicao e classificacao. |
| BEB-001 | Coca-Cola | PENDENTE | Placeholder institucional | Substituir | Coca-Cola, embalagem e volume selecionado. | Confirmar imagem oficial do fabricante para embalagem e volume corretos. |
| BEB-002 | Fanta | PENDENTE | Placeholder institucional | Substituir | Fanta, embalagem e volume selecionado. | Confirmar imagem oficial do fabricante para embalagem e volume corretos. |
| BEB-003 | Tuchaua | PENDENTE | Placeholder institucional | Substituir | Tuchaua, embalagem e volume selecionado. | Confirmar imagem oficial do fabricante para embalagem e volume corretos. |
| BEB-004 | Agua Mineral | PENDENTE | Placeholder institucional | Substituir | Agua Mineral, embalagem selecionada. | Confirmar imagem oficial do fabricante para embalagem e volume corretos. |
| CER-001 | Skol | PENDENTE | Placeholder institucional | Substituir | Skol, lata ou 600 ml. | Confirmar imagem oficial do fabricante para embalagem e volume corretos. |
| CER-002 | Brahma | PENDENTE | Placeholder institucional | Substituir | Brahma, lata ou 600 ml. | Confirmar imagem oficial do fabricante para embalagem e volume corretos. |
| CER-003 | Original | PENDENTE | Placeholder institucional | Substituir | Original, lata ou 600 ml. | Confirmar imagem oficial do fabricante para embalagem e volume corretos. |

### 9.5 Edicao futura pela gestao

A gestao podera:

- adicionar imagem;
- substituir imagem;
- remover imagem inadequada;
- retornar ao placeholder institucional;
- aprovar imagem provisoria.

A troca de imagem:

- nao cria novo produto;
- nao altera preco;
- nao altera variacoes;
- nao altera historico do produto;
- deve preservar identificacao de quem atualizou e quando, quando o backend correspondente for implementado.

Contrato futuro de auditoria da imagem:

| Campo | Regra futura |
| --- | --- |
| Atualizado em | Data/hora da ultima alteracao de imagem. |
| Atualizado por | Usuario ou processo responsavel pela alteracao. |
| Origem | Origem documental da imagem apos a alteracao. |
| Status | Status documental da imagem apos a alteracao. |

## 10. Regras Especificas de Pizzas

Pizza com um sabor:

- P;
- M;
- G.

Pizza com dois sabores:

- somente M;
- somente G.

Regras complementares:

- P nunca permite segundo sabor;
- segundo sabor e configuracao do item, nao novo produto;
- combinacao de sabores nao cria novo produto;
- ao mudar de M/G para P, a interface futura deve remover o segundo sabor com aviso claro;
- politica de calculo do preco de dois sabores permanece `PENDENTE DE VALIDACAO`;
- nao inferir se cobra maior sabor, media, acrescimo ou outra regra;
- aplicar a pizzas salgadas e doces, salvo excecao explicita futura.

## 11. Regras de Exibicao

| Regra | Decisao documental inicial |
| --- | --- |
| Produto presente no cardapio fisico | Candidato a exibicao no Catalogo Digital e Venda Balcao. |
| Produto nao presente na fonte fisica | Nao cadastrar nesta versao. |
| Imagem | Catalogo completo; imagem propria/oficial quando disponivel; imagem generica provisoria quando necessario; placeholder apenas como ultimo fallback. |
| Produto temporariamente indisponivel | Nao remover da instancia; status operacional sera definido futuramente. |
| Origem | Usada futuramente por Producao, Estoque, Compras, CMV e IA. |
| Envio a Producao | Depende de migracao e regra operacional futura. |
| Exibicao na IA/OJC | Permitida futuramente somente apos migracao validada. |

## 12. Pendencias de Validacao

| Item | Categoria | Duvida | Impacto | Decisao necessaria | Fonte | Prioridade |
| --- | --- | --- | --- | --- | --- | --- |
| Coca-Cola 600 ml | Bebidas | Preco nao legivel/ausente. | Impede cadastro completo da variacao. | Confirmar preco oficial. | `Sucos - alvorada.jpg` | urgente |
| Coca-Cola 1 litro | Bebidas | Preco nao legivel/ausente. | Impede cadastro completo da variacao. | Confirmar preco oficial. | `Sucos - alvorada.jpg` | urgente |
| Tuchaua 2 litros | Bebidas | Preco legivel como 10,00, mas divergente da escala visual. | Pode gerar preco incorreto. | Confirmar se 10,00 esta correto. | `Sucos - alvorada.jpg` | urgente |
| Outros adicionais | Artesanais | Grupo existe, mas itens internos nao estao detalhados. | Impede selecao detalhada de complemento. | Definir itens ou manter grupo generico. | `Artesanais - Alvorada.jpg` | necessaria antes da migracao |
| +100 g de batata | Artesanais | Upgrade comercial sem modelagem operacional. | Afeta modelagem de preco e ficha do produto. | Definir futuramente como adicional, combo, upsell ou variacao. | `Artesanais - Alvorada.jpg` | necessaria antes da migracao |
| Preco de pizza de 2 sabores | Pizzas | Politica nao documentada. | Impede calculo correto na ficha. | Definir maior preco, media, acrescimo ou outra regra. | `Pizzas - Alvorada.jpg` | urgente |
| Porcao mista | Porcoes | Composicao nao descrita. | Ficha do produto ficaria incompleta. | Informar ingredientes/composicao. | `Porções e caldos - Alvorada.jpg` | necessaria antes da migracao |
| Descricoes de porcoes | Porcoes | Descricoes nao aparecem no cardapio fisico. | Cards e fichas terao texto minimo. | Confirmar se usa nome como descricao ou cadastrar composicao. | `Porções e caldos - Alvorada.jpg` | pode ser definida depois |
| Laranja | Sucos | Nao aparecem variacoes agua/leite. | Pode limitar configuracao do produto. | Confirmar se usa apenas copo/jarra. | `Sucos - alvorada.jpg` | pode ser definida depois |
| Laranja com Leite Condensado | Sucos | Classificacao como natural/especial precisa confirmacao. | Afeta familia/subcategoria final. | Confirmar composicao e classificacao. | `Sucos - alvorada.jpg` | pode ser definida depois |
| Grafia File/Filé Mignon | Pizzas | Grafia operacional pendente. | Pode afetar busca e cardapio. | Confirmar grafia oficial. | `Pizzas - Alvorada.jpg` | apenas esclarecimento documental |
| Disponibilidade por unidade | Todas | Nao definida. | Afeta multiunidade. | Confirmar se catalogo e unico ou por unidade. | Fontes fisicas | pode ser definida depois |

## 13. Contagem Consolidada

| Indicador | Quantidade |
| --- | ---: |
| Categorias | 9 |
| Produtos | 59 |
| Variacoes/opcoes de variacao | 94 |
| Upgrades comerciais | 1 |
| Ocorrencias de upgrade comercial | 2 |
| Grupos de adicionais | 1 |
| Itens adicionais visiveis | 4 |
| Pendencias | 12 |
| Produtos com descricao completa/objetiva | 52 |
| Produtos com descricao pendente ou minima | 7 |
| Precos confirmados | 121 |
| Precos pendentes | 2 |
| Precos aguardando confirmacao | 1 |
| Precos de upgrade comercial confirmados, com modelagem pendente | 2 |
| Precos de adicionais confirmados | 4 |
| Produtos com imagem propria confirmada | 0 |
| Produtos com imagem oficial de fabricante prevista | 7 |
| Produtos com imagem generica provisoria prevista | 52 |
| Produtos mantidos com placeholder institucional atual | 7 |

### Produtos por categoria

| Categoria | Produtos | Variacoes/opcoes |
| --- | ---: | ---: |
| Lanches | 16 | 0 |
| Artesanais | 8 | 0 |
| Pizzas Salgadas | 11 | 33 |
| Pizzas Doces | 3 | 9 |
| Porcoes | 4 | 0 |
| Caldos | 2 | 4 |
| Sucos | 8 | 28 |
| Bebidas | 4 | 14 |
| Cervejas | 3 | 6 |
| Total | 59 | 94 |

### Produtos por origem

| Origem | Quantidade |
| --- | ---: |
| Produzido | 52 |
| Revendido | 7 |
| Misto | 0 |
| PENDENTE DE VALIDACAO | 0 |

## 14. Historico da Versao

| Versao | Data | Alteracao | Responsavel |
| --- | --- | --- | --- |
| 001 | 2026-07-18 | Consolidacao documental inicial a partir do cardapio fisico oficial localizado em Downloads. | Codex |
| 001.1 | 2026-07-18 | Ajustes finais: contagem reconciliada, Origem, Subcategoria, Familia, upgrade comercial da batata e descricoes objetivas. | Codex |
| 001.2 | 2026-07-18 | Regra documental de imagens: hierarquia, campos por produto, inventario inicial e edicao futura pela gestao. | Codex |

## 15. Confirmacoes

- Nenhum codigo funcional foi alterado por este documento.
- Nenhum frontend foi alterado por este documento.
- Nenhum backend foi alterado por este documento.
- Nenhum Convex foi alterado por este documento.
- Nenhuma seed foi alterada por este documento.
- Nenhuma interface foi alterada por este documento.
- Nenhum commit deve ser realizado antes da validacao do usuario.
