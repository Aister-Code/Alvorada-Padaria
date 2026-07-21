# Governanca da Memoria

## Fonte da verdade

Prioridade recomendada:

1. implementacao e dados persistidos, quando o assunto for estado executado;
2. documentos homologados;
3. ADRs vigentes;
4. [Projeto Mestre](../RONDONIA-APPS-PROJETO-MESTRE.md);
5. [Contexto Atual](CONTEXTO-ATUAL-ALVORADA.md);
6. historico de conversas.

O Projeto Mestre nao substitui documentos especializados. Quando houver
conflito, abrir a fonte especializada e registrar a divergencia antes de
implementar.

## Atualizacao obrigatoria

Atualizar [Contexto Atual](CONTEXTO-ATUAL-ALVORADA.md) quando:

- houver commit relevante;
- etapa for iniciada;
- etapa for concluida;
- decisao arquitetural mudar;
- nova pendencia bloqueadora surgir;
- branch mudar;
- houver migracao;
- houver homologacao funcional ou visual.

Atualizar [Projeto Mestre](../RONDONIA-APPS-PROJETO-MESTRE.md) quando:

- principio mudar;
- novo modulo surgir;
- ADR for homologado;
- roadmap mudar;
- dominio for alterado.

## Responsabilidade

Quem realiza checkpoint deve informar:

- arquivos incluidos;
- hash;
- branch;
- validacoes executadas;
- pendencias;
- proximo passo;
- arquivos fora de escopo preservados.

## Historico e substituicao

Nao apagar decisao antiga silenciosamente.

Quando uma decisao mudar:

1. marcar decisao anterior como substituida;
2. apontar documento/decisao sucessora;
3. registrar data e motivo;
4. evitar reescrever historico como se a decisao antiga nunca tivesse existido.

## Evitar crescimento descontrolado

- referenciar documentos especializados;
- nao copiar relatorios integrais;
- nao armazenar logs extensos;
- manter Contexto Atual objetivo;
- arquivar checkpoints antigos quando necessario;
- nao transformar conversa em documentacao permanente sem consolidacao.

## Uso em novas conversas

1. Fornecer [Retomada de Nova Conversa](RETOMADA-NOVA-CONVERSA.md).
2. Exigir leitura do Contexto Atual.
3. Conferir Git antes de aceitar qualquer afirmacao de estado.
4. Nao iniciar proxima etapa sem homologacao da etapa anterior.
5. Nao misturar arquivos pendentes antigos em commits novos.

## Estado desta memoria

Esta memoria foi atualizada apos o checkpoint funcional da M-003.M2
(`d4fdffc`) e deve ser commitada separadamente de qualquer arquivo funcional.

## Regras de commit documental

- Commit documental deve incluir apenas arquivos documentais autorizados.
- Se houver arquivos funcionais pendentes, mantelos fora do staging.
- Se a memoria ainda estiver em revisao, nao commitar sem homologacao.
