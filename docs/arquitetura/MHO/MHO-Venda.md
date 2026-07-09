# MHO — Venda

## Objetivo da Homologação

Confirmar que Venda respeita a operação real, a herança do RondonIA OS e o DMI do módulo.

## Conferência de Herança da Tela

- RBG consultado.
- DHA aplicado.
- RVL aplicado.
- RDS aplicado.
- RAW aplicado.
- MOP aplicada.
- JOS respeitado.
- ROR avaliado quando houver rota.
- OJC avaliada quando houver jornada do cliente.

## Header

Conferir obrigatoriamente:

- Voltar quando aplicável.
- Título legível.
- Modo Operacional Atual.
- Unidade Atual.
- ISO.
- Escala Operacional.
- Tema.
- Menu Geral.
- Ajuda acessível.

## Menu

A ordem oficial deve ser:

- Trocar Unidade.
- Trocar Modo Operacional.
- Meu Perfil.
- Ajuda.
- Configurações.
- Sair.

## Contexto Operacional

- Modo operacional correto.
- Unidade correta.
- Troca de modo respeitando permissões.
- Troca de unidade respeitando permissões.
- Auditoria preparada para operador, perfil base, modo e unidade.

## Indicadores

Todo indicador operacional deve possuir:

- Ícone.
- Número.
- Label.

Nenhum indicador pode usar apenas número e texto.

## Modais e Painéis

Conferir:

- Plano 2 conforme RVL.
- Contraste correto.
- Textos legíveis.
- Fechamento contextual seguro.
- Cancelar e Salvar Alterações quando houver configuração.
- Estados Salvando... e Salvo quando aplicável.
- Opções disponíveis legíveis.
- Itens desabilitados somente quando realmente indisponíveis.

## Estados Obrigatórios

- Estado vazio.
- Estado operacional completo.
- Estado de erro quando aplicável.
- Estado de sucesso quando aplicável.
- Estado de carregamento quando aplicável.
- Cenário demonstrativo quando dados reais forem insuficientes.

## Cenários do Módulo

- pedido aberto
- carrinho vazio
- itens adicionados
- dados incompletos
- aguardando confirmação
- enviado à produção
- aguardando caixa
- cancelado

## Permissões

Validar:

- Perfil base.
- Modo Operacional Atual.
- Unidade Atual.
- Ação solicitada.
- Módulos opcionais autorizados.
- Restrições do DMI.

## Implantação e Maturidade

- Nível de implantação: Obrigatório / Fase 1.
- Nível de maturidade: Inicial a Intermediária.
- Não liberar complexidade antes da maturidade operacional.
- Se o cliente ainda estiver em fase inicial, orientar com Escola RondonIA e exposição gradual.

## Responsividade

Validar:

- Celular estreito.
- Tablet.
- Desktop.
- Sem cortes em textos essenciais.
- Sem rolagem indevida em tela principal operacional.
- Popovers com rolagem interna somente quando inevitável.

## Textos

- Português correto.
- Acentuação obrigatória.
- Labels curtos.
- Nenhum texto essencial truncado.
- Linguagem operacional, não técnica.

## Critérios de Aprovação

- Operador entende a próxima ação em menos de 5 segundos quando houver jornada.
- O estado vazio comunica operação sob controle.
- A tela respeita o DNA visual do cliente.
- A tela não expõe módulos antes da fase correta.
- A tela não exige maturidade que o usuário ainda não possui.
- Build OK.
- Screenshots dia/noite anexados quando necessário.


## Homologação de Linguagem Simples e Escola RondonIA

Conferir obrigatoriamente:

- A tela usa linguagem do dia a dia do operador.
- O nome exibido é o termo que o colaborador entende.
- A ajuda da tela está prevista no Menu quando houver Menu Operacional.
- A ajuda explica o objetivo da tela.
- A ajuda explica ícones e menus.
- A ajuda explica o que fazer na etapa atual.
- A ajuda orienta quando a função pertence a outro módulo.
- Existe caminho futuro para busca/consulta de ajuda.
- Escola RondonIA vinculada ao módulo.
- Possibilidade futura de treinamento atribuído pelo gerente.
- Possibilidade futura de prazo e acompanhamento.
- Colaborador poderá confirmar conclusão do aprendizado.
- Mensagens de bloqueio orientam sem punir.

Exemplos esperados:

- `Esta função pertence ao módulo Caixa.`
- `Solicite ao gerente ou transfira esta tarefa.`
