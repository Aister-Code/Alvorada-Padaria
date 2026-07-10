# Componentes Obrigatórios — RondonIA OS

Biblioteca mínima de componentes obrigatórios para telas operacionais.

## Header Operacional

Deve conter:

- voltar quando aplicável;
- título da tela;
- modo operacional atual;
- unidade atual;
- ISO;
- Escala Operacional;
- Tema;
- Menu Geral.

## Menu Operacional

Ordem oficial:

- Trocar Unidade;
- Trocar Modo Operacional;
- Meu Perfil;
- Ajuda;
- Configurações;
- Sair.

## Indicadores

Todo indicador operacional usa:

- ícone;
- número;
- label.

## Dock Operacional

Quando uma tela usar dock operacional:

- deve conter apenas os destinos principais aprovados;
- a alça retrátil não ocupa vaga de item;
- a alça fica integrada dentro da superfície da dock;
- a alça não pode aumentar a altura principal da caixa;
- itens secundários aparecem em painel expansível;
- o chevron deve ser discreto, centralizado e legível em modo dia/noite.

## Modais

Regras:

- Plano 2;
- contraste por temperatura;
- sem glow;
- sem sombra pesada;
- confirmação explícita quando salvar;
- fechar ao clicar fora apenas quando seguro.

## Painéis

Painéis contextuais devem:

- preservar contexto;
- evitar tela cheia;
- usar rolagem interna quando necessário;
- não gerar scroll na tela principal.

## Estados Vazios

Devem explicar:

- o estado atual;
- o que acontecerá quando houver dado;
- próxima ação quando aplicável.

## Confirmações

Toda ação relevante deve comunicar:

- Salvando...
- Salvo
- Erro com orientação.

## Fechamento Contextual

Padrão:

- popovers e configurações fecham ao clicar fora;
- se houver alterações não salvas, solicitar confirmação;
- operações críticas nunca fecham automaticamente.
