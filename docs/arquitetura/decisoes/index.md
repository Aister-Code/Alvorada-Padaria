# Indice de Decisoes

Este diretorio registra decisoes operacionais e visuais que devem ser consultadas antes de qualquer alteracao no ERP Alvorada.

## Politica

- Decisoes aprovadas podem ser usadas somente quando referenciadas por `DEC-*` no contrato da tarefa.
- Decisoes `superseded` ficam registradas apenas para impedir reintroducao.
- Decisoes sem fonte documental, trecho ou screenshot ficam `pending` e nao autorizam implementacao.
- O estado atual do codigo nunca substitui uma decisao aprovada.

## Arquivos

- [pizza.yaml](pizza.yaml): decisoes da jornada de pizzas e PizzaBuilder.
- [referencias/](referencias/): mapa de documentos e screenshots usados como evidencia.

## Status Permitidos

- `approved_dna`: aprovado em documento DNA/DMI/MHO ou modulo homologado.
- `approved_later`: aprovado posteriormente nesta conversa, com screenshot/evidencia.
- `pending`: pendente de fonte ou homologacao.
- `superseded`: substituido por outra decisao e proibido como base nova.

## Uso

Cada tarefa deve criar `.codex/current-task.yaml` a partir de `.codex/current-task.example.yaml`, declarando:

- IDs `DEC-*` aplicaveis;
- arquivos permitidos;
- arquivos protegidos;
- referencias usadas;
- caminhos que os guards devem escanear.
