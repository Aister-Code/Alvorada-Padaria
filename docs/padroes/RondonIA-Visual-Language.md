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

## RVL-001 — Campo Editavel

Nenhum componente editavel pode parecer bloqueado.

Regras:

- Campo editavel deve aceitar clique/toque em toda a sua area util.
- O usuario nunca deve precisar descobrir onde clicar.
- Estado visual de edicao deve ser claro, mas discreto.
- Campos nao devem parecer caixas tradicionais de ERP.
- Bordas fixas devem ser evitadas.
- Foco pode usar borda ultra fina, sem outline pesado.

## RVL-002 — Botao Principal

O botao principal mantem presenca por cor, contraste e hierarquia.

Regras:

- Usar a cor de acao do DNA.
- Texto com contraste claro.
- Sem sombra difusa externa.
- Sem glow.
- Sem efeito spray.
- Estado inativo com aproximadamente 75% de opacidade.
- A presenca do botao deve vir da hierarquia visual, nao de efeitos decorativos.

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
