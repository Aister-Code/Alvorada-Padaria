# MHO — Central de Atendimento

## Objetivo da Homologação

Confirmar que Central de Atendimento respeita a operação real, a herança do RondonIA OS e o DMI do módulo.

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

- estado vazio operacional
- jornada ativa
- cliente recorrente
- sessão de catálogo ativa
- transferência recebida
- próxima ação única

## Permissões

Validar:

- Perfil base.
- Modo Operacional Atual.
- Unidade Atual.
- Ação solicitada.
- Módulos opcionais autorizados.
- Restrições do DMI.

## Implantação e Maturidade

- Nível de implantação: Obrigatório para OJC / Fase 2.
- Nível de maturidade: Intermediária.
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

## Homologação do Padrão Conversas

Conferir obrigatoriamente:

- Header interno mostra somente o contexto ativo, sem subtítulo quando a tela não for abertura do módulo.
- Dock inferior representa módulos operacionais e mantém Atendimento ativo.
- Pedidos, Clientes e Agenda aparecem como atalhos internos compactos.
- Filtros IA, Humano, Ajuda, Transf. e Todas não usam cápsulas fixas.
- Número e cor aparecem apenas quando há atividade; `Todas` permanece neutro.
- Transferidas separa Recebidas e Enviadas e oculta concluídas.
- Cada conversa tem no máximo três linhas.
- Avatar separa origem do contato e urgência operacional.
- Transferir fica no extremo direito da primeira linha.
- Catálogo está sempre disponível e fora do botão `+`.
- Botão `+` contém apenas ações auxiliares universais.
- Carrinho aparece compacto e abre contexto dedicado.
- Relatórios estão no menu contextual de Conversas.
- Nenhum termo técnico proibido aparece na interface.

## Consolidação Central de Atendimento — Conversas, Repasses e Recebimento Assistido

Padrões registrados:

- Resumo Retrátil: a faixa superior da Central de Atendimento deve ficar fechada por padrão, exibindo apenas ícones, números quando existirem e cor somente quando houver atividade.
- Carrinhos, Cardápio e Produtos são conceitos diferentes:
  - Carrinhos: acompanhamento operacional de carrinhos/sessões iniciadas, paradas ou pedindo ajuda.
  - Cardápio: ação enviada ao cliente dentro da conversa.
  - Produtos: consulta interna do atendente para preço, orçamento e composição futura de pedido.
- Repasses substituem `Transferências` na linguagem operacional da Central.
- Encaminhar é a ação direta na conversa para repassar trabalho a outro perfil/setor.
- Relatórios são contextuais à tela ativa e não ocupam vaga de módulo principal.

### Orçamento

Orçamento é ferramenta do Atendimento.

Fluxo previsto:

1. Atendente consulta Produtos.
2. Monta orçamento.
3. Envia orçamento ao cliente.
4. Se o cliente aceitar, converte em pedido ou adiciona a pedido existente quando permitido.
5. Se o pedido existente não puder ser editado, cria Pedido Complementar.

### Pedido Complementar e Entrega Agrupada

Se o cliente fizer novo pedido após pedido anterior:

- Pedido anterior editável: adicionar ao pedido existente.
- Pedido anterior não editável: criar Pedido Complementar.

Se o pedido anterior ainda não saiu para entrega, perguntar se o cliente aceita entregar junto.

Se aceitar:

- manter pedidos separados;
- criar vínculo de Entrega Agrupada;
- avisar Conferência, Delivery e Motoboy.

Avisos previstos:

- Conferência: `Aguardar pedido complementar.`
- Delivery: `Sai junto com pedido #...`
- Motoboy: `Levar pedidos vinculados juntos.`

Pedido complementar segue ROR própria. Cestinha só quando a rota exigir.

### Recebimento Assistido

Atendente pode registrar recebimento assistido, mas Caixa confirma.

Fluxo:

1. Operador informa/recebe valor.
2. Sistema cria pendência para Caixa.
3. Caixa confere.
4. Caixa confirma pagamento, troco, vale ou ajuste.
5. Venda é finalizada pelo Caixa.

Aplicável em Atendimento, Balcão, Mesa, Delivery, Motoboy e Gerente em modo operacional.

Pendência para Caixa deve carregar: pedidoId, clienteId, origem, operadorQueRecebeu, valorInformado, formaInformada, comprovante opcional, precisaTroco, valorTroco opcional, observação, destinoCaixa e status.

Status previstos: pendente_conferencia, conferido, recusado, troco_entregue, acerto_pendente e concluido.

## Ajuste Final — Conversas WhatsApp/RondonIA

Regras complementares aprovadas:

- O Resumo Superior é dinâmico: IA e Humano permanecem fixos; Carrinhos, Repasses e outros indicadores sobem ou descem conforme quantidade e prioridade.
- A linha superior é retrátil; quando fechada, mostra somente ícones e números quando houver atividade.
- A linha inferior permanece sempre visível.
- O destaque/pulso acontece somente no ícone que recebeu nova atividade.
- A alça retrátil da dock deve sinalizar alertas ocultos quando módulos recolhidos tiverem pendência, atenção ou crítica.
- O avatar da conversa deve ficar centralizado verticalmente em relação às três linhas do item.
- O carrinho compacto fica à esquerda do campo de mensagem e mostra apenas quantidade no estado compacto.
- O Cardápio mostra símbolo + texto quando o chat está fechado e apenas símbolo quando o chat está aberto.
