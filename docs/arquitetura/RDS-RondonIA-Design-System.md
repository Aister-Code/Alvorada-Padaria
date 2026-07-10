# RDS — RondonIA Design System

O RDS é a camada técnica de componentes do RondonIA OS.

O RVL define a linguagem. O RDS define como essa linguagem é executada em componentes reutilizáveis.

## Componentes

Todo componente deve possuir:

- contrato de uso;
- estados;
- variações por tema;
- escala operacional;
- comportamento responsivo;
- acessibilidade básica;
- integração com RAW quando aplicável.

## Padrões

- Componentes devem ser simples, previsíveis e operacionais.
- O componente nunca deve competir com a ação principal da tela.
- O mesmo padrão visual deve significar a mesma coisa em todo o sistema.
- Estados disponíveis não usam baixa opacidade.
- Baixa opacidade é reservada para itens realmente desabilitados.

## Botões

Tipos:

- Primário: ação principal, usa cor de ação.
- Secundário: ação auxiliar.
- Contextual: ação de painel/modal.
- Perigoso: ação destrutiva, sempre com confirmação quando crítica.

Regras:

- Sem glow.
- Sem efeito spray.
- Sem sombra difusa pesada.
- Texto direto.
- Estado `Salvando...` e `Salvo` quando houver persistência.

## Inputs

Regras:

- Todo campo editável deve parecer editável.
- O clique/toque deve funcionar em toda a área útil.
- Foco usa borda ultra fina ou mudança sutil de superfície.
- Inputs de ID seguem padrão `ID | Nome` visual, sem misturar nome ao valor editável.
- PIN/senha preserva centro óptico e botão de visibilidade fora do eixo do texto.

## Cards

Cards representam itens, destinos ou contexto.

Regras:

- Card de módulo deve parecer destino, não botão pequeno.
- Card de indicador deve comunicar forma, número e label.
- Card administrativo não deve poluir telas operacionais.
- Cards não devem depender de sombra para hierarquia.

## Modais

Modais pertencem ao Plano 2.

Regras:

- Devem contrastar por temperatura.
- Não devem ocupar tela cheia quando contexto bastar.
- Devem possuir Cancelar e Salvar Alterações quando forem configuração.
- Fechamento externo segue RVL-019.
- Texto não pode cortar.

## Drawers

Drawers são usados para detalhe sob demanda.

Regras:

- Preservar contexto.
- Evitar parecer tela nova quando for apenas detalhe.
- Usar rolagem interna quando necessário.
- Nunca gerar scroll na tela principal.

## Popovers

Popovers são ferramentas contextuais.

Regras:

- Fecham ao clicar fora quando não houver alteração não salva.
- Não fecham automaticamente em operação crítica.
- Até 3 opções podem usar segmented control.
- Padrão preferencial de configuração: lista compacta com valor à direita e dropdown contextual.

## Docks, Resumos e Expansíveis

Todo dock operacional, resumo retrátil ou filtro expansível possui itens principais fixos e pode possuir itens secundários sob demanda.

Regras:

- A alça retrátil pertence à superfície do componente.
- A alça não ocupa vaga de item.
- A alça não aumenta a altura principal do bloco.
- A dock deve manter proporção dos destinos principais.
- Resumos e filtros devem manter os indicadores principais estáveis.
- Itens extras abrem em painel secundário sem alterar a hierarquia dos itens principais.
- O símbolo usa chevron discreto, centralizado opticamente, com hover/foco suave.
- Este padrão é obrigatório para expansíveis atuais e futuros.

## Indicadores

Todo indicador operacional deve conter:

- ícone;
- número;
- label.

Ordem de leitura:

```text
forma → quantidade → significado
```

## Estados Vazios

Estado vazio não comunica ausência fria.

Deve comunicar:

- operação sob controle;
- próximo passo;
- o que acontecerá quando houver dado.

## Estados de Sucesso e Erro

Sucesso:

- confirmar explicitamente;
- não fechar silenciosamente quando houver ação relevante.

Erro:

- texto curto;
- informar o que fazer;
- não expor detalhe técnico ao operador.

## Escalas

Escala Operacional:

- `aa`: pequena;
- `Aa`: normal;
- `AA`: grande.

A escala altera fonte, espaçamento e altura proporcionalmente, não apenas tamanho de texto.
