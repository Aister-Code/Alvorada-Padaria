# ERP Alvorada - Politica Operacional dos Agentes

Este repositorio opera em modo fail-closed. Quando houver duvida, ausencia de fonte ou conflito entre instrucoes, pare e solicite confirmacao antes de editar.

## Contrato Obrigatorio da Tarefa

- Nenhuma alteracao pode ser feita sem IDs `DEC-*` explicitamente informados no contrato da tarefa.
- Nenhuma alteracao pode ser feita sem `.codex/current-task.yaml`.
- O arquivo `.codex/current-task.yaml` deve declarar `decision_ids`, `allowed_files`, `protected_files` e fontes de referencia.
- Toda decisao deve apontar para documento, trecho, linha, screenshot ou evidencia local verificavel.
- Decisoes com status `superseded` nao podem ser usadas como base de implementacao.
- Sem fonte verificavel, pare. Nao inferir comportamento, visual ou copy.
- Propostas novas podem ser documentadas, mas nao implementadas sem decisao aprovada.

## Escopo e Arquivos

- Tocar somente os arquivos listados em `allowed_files`.
- Arquivos listados em `protected_files` nunca podem entrar no diff da tarefa nem no staging.
- Se o repositorio ja estiver sujo, registre a linha de base antes da tarefa e nao misture alteracoes antigas.
- Nao fazer `pull`, `push`, `commit`, `reset`, `rebase`, `stash` ou staging sem autorizacao explicita.

## UI e Decisoes Visuais

- Reutilizar componentes canonicos antes de criar qualquer markup local.
- Nao criar variantes visuais locais para controles equivalentes.
- Primitivos canonicos, como `SelectionSquare`, sao fonte unica do padrao visual aprovado.
- Nao reintroduzir variantes substituidas, como radio circular, letras dentro de marcador ou CTA intermediario nao aprovado.

## Guards

Antes de concluir qualquer tarefa com alteracao, execute:

```bash
npm run guard:all
```

O guard deve falhar quando:

- a tarefa nao possui `DEC-*`;
- `.codex/current-task.yaml` nao existe;
- uma decisao superseded e referenciada;
- um arquivo fora de `allowed_files` foi alterado;
- um arquivo protegido entrou no diff ou staging;
- uma variante visual proibida foi reintroduzida;
- copy proibida reapareceu.

## Fechamento

- Sempre informar quais decisoes foram usadas.
- Sempre informar validacoes executadas.
- Nunca fazer commit ou push sem autorizacao explicita do usuario.
