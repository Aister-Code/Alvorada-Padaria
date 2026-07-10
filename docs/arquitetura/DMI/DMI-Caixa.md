# DMI — Caixa

## Objetivo

Resolver pagamentos, fechamento e conferência financeira operacional.

## Perfil Principal

Caixa.

## Tipo de Tela

Fila e fechamento operacional.

## O Que Herda Automaticamente

- RBG antes de qualquer implementação.
- DHA do cliente ativo.
- RVL aplicado em paleta, tipografia, iconografia e planos.
- RDS para componentes e estados.
- RAW para operador, unidade, modo operacional e preferências.
- MOP para permissões e auditoria.
- JOS para entrada, conclusão e retorno ao Centro de Operações.
- CAO quando houver atenção operacional.
- ISO quando houver dependência de saúde operacional.
- ROR quando houver rota de item, pedido ou etapa.
- OJC quando houver cliente, conversa, sessão, pedido ou atendimento.

## Específico do Módulo

- Fila de pedidos para pagamento.
- Fechar venda.
- Formas de pagamento.
- Troco/desconto.
- Status financeiro.

## Componentes Obrigatórios

- Header operacional quando a tela estiver dentro da sessão autenticada.
- Menu Operacional RAW quando aplicável.
- ISO quando houver dependência operacional.
- Escala Operacional.
- Alternância de tema.
- Ajuda contextual.
- Indicadores com ícone, número e label quando houver resumo operacional.
- Estado vazio operacional.
- Estado operacional completo para homologação.
- Modais/painéis Plano 2 quando houver contexto.

## Header Obrigatório

- Voltar quando aplicável.
- Título da tela.
- Modo Operacional Atual.
- Unidade Atual.
- ISO.
- Escala Operacional.
- Tema.
- Menu Geral.

## Menu Obrigatório

- Menu Geral RAW quando aplicável.

## Modais Obrigatórios

- Fechar Venda
- Confirmação de ação financeira
- Ajuda

## Estados Obrigatórios

- aguardando pagamento
- pagamento em análise
- pago
- recusado
- pendente
- fechado

## Dados Principais

- pedido
- venda
- total
- formaPagamento
- desconto
- troco
- status financeiro

## Ações Principais

- Fechar venda
- Registrar pagamento
- Transferir divergência
- Consultar pendência

## Regras de Permissões

Ações financeiras exigem modo Caixa ou Gerência autorizada. Auditoria obrigatória.

Toda ação deve considerar:

```text
perfilBase + modoOperacionalAtual + unidadeAtual + ação solicitada
```

## Módulos Opcionais Relacionados

TEF, conciliação, contas a receber, financeiro avançado e fiscal.

## Nível de Implantação

Obrigatório / Fase 1

## Nível de Maturidade

Intermediária

Regra: não liberar complexidade antes da maturidade operacional do cliente e do usuário.

## Exceções Aprovadas

- Cenários demonstrativos podem ser usados quando dados reais forem insuficientes para homologação visual.
- Placeholders devem ser identificados e não podem parecer dados definitivos.
- Exceções operacionais não alteram cadastro base.

## DNA Aplicável

Precisão, segurança e conclusão.

## Checklist de Implementação

- RBG respondido.
- DMI consultado.
- MHO previsto.
- Heranças obrigatórias aplicadas.
- Header validado.
- Menu validado.
- Modo Operacional e Unidade exibidos quando aplicável.
- Permissões avaliadas pela MOP.
- Dados reais e placeholders separados.
- Estados obrigatórios implementados.
- Modais e painéis no padrão RVL/RDS.
- Indicadores com ícone, número e label.
- Textos curtos, legíveis e acentuados.
- Responsividade sem rolagem indevida na tela principal.
- Módulos opcionais não expostos antes da fase correta.

## Checklist de Homologação

- Build OK.
- Modo dia validado.
- Modo noite validado.
- Responsividade validada.
- Estado vazio validado.
- Estado operacional completo validado.
- Header correto.
- Menu correto.
- ISO, escala, tema e ajuda conferidos.
- Troca de modo e troca de unidade consideradas.
- Permissões e módulos opcionais conferidos.
- Fase de implantação validada.
- Maturidade do usuário/cliente validada.
- Nenhum texto essencial cortado.
- Nenhuma opção disponível parece desabilitada.
- Screenshots entregues quando necessário.


## Escola RondonIA e Linguagem Simples

Toda implementação deve usar linguagem do dia a dia do operador.

Checklist obrigatório:

- Nome exibido usa termo compreendido pelo colaborador.
- Nomes técnicos ficam fora da interface quando não ajudarem a decisão.
- Ajuda contextual explica a tela.
- Ajuda contextual explica ícones e menus.
- Ajuda contextual informa o que fazer naquela etapa.
- Ajuda contextual informa quando a função pertence a outro módulo.
- Busca ou consulta de ajuda prevista quando a tela crescer.
- Treinamento da Escola RondonIA vinculado ao módulo.
- Gerente poderá futuramente atribuir aprendizagem.
- Gerente poderá definir prazo.
- Gerente poderá acompanhar progresso.
- Colaborador poderá confirmar conclusão.

## Funções de Outro Módulo

Se o operador tentar executar função fora do seu módulo ou modo operacional, orientar com linguagem simples:

- `Esta função pertence ao módulo Caixa.`
- `Solicite ao gerente ou transfira esta tarefa.`
- `Esta etapa deve ser assumida pelo modo operacional correto.`

A orientação deve preservar contexto e sugerir transferência quando aplicável.

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
