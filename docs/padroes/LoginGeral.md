# Login Geral — Estrutura Oficial

Tela: `Login Geral`

Objetivo:
Permitir acesso rapido de operadores internos por ID + PIN, com padrao visual e comportamental reutilizavel para todo o ERP Alvorada.

Componentes principais:
- Logo oficial da marca
- Campo `Usuario`
- Campo `Senha/PIN`
- Botao `Entrar`
- Link `Esqueci a senha`
- Modal `Redefinir PIN`
- Rodape com assinatura da empresa/app
- Alternancia claro/escuro

## Campo Usuario

Padrao oficial: `ID + Nome`

Componente reutilizavel:
`OperatorIdField`

Aplicado em:
- Login Geral
- Modal Redefinir PIN
- futuros campos elegiveis de identificacao de operador

Estados do campo:

1. Entrada / edicao:
- Campo vazio ou em edicao.
- Mostra apenas o ID.
- ID centralizado.
- Campo totalmente editavel.
- Exemplo: `001`

2. Validacao automatica:
- Ao completar o tamanho configurado do ID:
  - valida automaticamente o operador;
  - exibe `001 | Gerente`, se valido;
  - move o foco automaticamente para o campo seguinte.

3. Validado:
- Exibe dentro do mesmo campo:
  `001 | Gerente`
- ID fica em bloco curto a esquerda.
- Nome aparece a direita.
- O nome nao faz parte do valor do input.

4. Reedicao:
- Ao clicar/tocar em qualquer area interna do campo:
  - esconde o nome;
  - mostra apenas o ID;
  - centraliza o ID;
  - foca o input;
  - permite alteracao imediata.

5. Confirmacao:
- Ao pressionar Enter, Tab ou sair do campo:
  - valida novamente;
  - se valido, exibe `ID | Nome`;
  - se Enter, avanca para o proximo campo.

6. Alteracao de ID:
- Ao alterar o ID:
  - remove imediatamente o nome antigo;
  - recalcula quando completar o tamanho configurado do ID, Enter, Tab ou blur;
  - se invalido, exibe erro claro.

## Campo Senha/PIN

Comportamento:
- Campo numerico com tamanho configurado do PIN.
- Valor centralizado.
- Botao de mostrar/ocultar PIN.
- O botao do olho fica posicionado a direita e nao interfere no centro visual do PIN.
- Apos erro:
  - limpa o PIN;
  - mantem o ID preenchido;
  - permite nova tentativa sem redigitar o usuario.

## Fluxo Principal

1. Operador abre a tela.
2. Digita ID, exemplo `001`.
3. Ao completar o tamanho configurado do ID:
   - sistema valida;
   - mostra `001 | Gerente`;
   - move foco para senha/PIN.
4. Operador digita PIN.
5. Pressiona Enter ou clica em `Entrar`.
6. Se correto:
   - entra no Dashboard.
7. Se incorreto:
   - mostra erro;
   - limpa apenas o PIN;
   - mantem ID disponivel.

## Modal Redefinir PIN

Acesso:
`Esqueci a senha`

Campos:
- Usuario
- Novo PIN
- Confirmar PIN
- Botao `Solicitar`

Campo Usuario:
- Usa o mesmo padrao `OperatorIdField`.
- Ao completar o tamanho configurado do ID:
  - valida operador;
  - mostra `001 | Gerente`;
  - move foco para `Novo PIN`.

Novo PIN:
- Numerico.
- Usa o tamanho configurado do PIN.
- Botao mostrar/ocultar.

Confirmar PIN:
- Numerico.
- Usa o tamanho configurado do PIN.
- Botao mostrar/ocultar.

Envio:
- So permite solicitar se:
  - ID valido;
  - Novo PIN tem o tamanho configurado do PIN;
  - Confirmacao e igual ao Novo PIN.

Mensagem:
- Apos envio, operador aguarda aprovacao do gerente.

## Regras de UX

- Campo nunca pode parecer bloqueado.
- Nome nunca e valor editavel do input.
- Clicar em qualquer area do campo ativa edicao.
- Ao alterar ID, nome antigo some imediatamente.
- Foco deve avancar naturalmente.
- Visual deve transmitir produto premium, simples e operacional.
- Sem excesso de instrucoes visiveis.
- A experiencia deve ser rapida para uso em balcao/caixa.

## Identidade Visual

A identidade visual da tela e parametrizada pelo DNA da marca do projeto.

Elementos parametrizados:
- logo;
- paleta de cores;
- tipografia;
- fundo;
- assinatura/rodape;
- comportamento visual nos temas claro e escuro.

Regras:
- A logo deve ser o asset oficial definido no DNA da marca.
- A paleta deve seguir as cores institucionais parametrizadas.
- A tipografia deve seguir o sistema tipografico da marca.
- O fundo deve respeitar a atmosfera visual definida para a marca, incluindo variacao claro/escuro quando aplicavel.
- Nao duplicar subtitulos ou elementos de marca ja presentes no asset oficial.

## Arquivos Relacionados

Tela:
`src/pages/login/page.tsx`

Componente reutilizavel:
`src/components/ui/operator-id-field.tsx`

Branding:
`src/components/branding/AlvoradaLogo.tsx`
`src/assets/branding/alvorada-logo-v1.png`
`src/assets/branding/alvorada-icon-v1.png`
