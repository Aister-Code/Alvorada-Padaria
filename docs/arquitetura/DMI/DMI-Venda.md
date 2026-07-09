# DMI — Venda

## Objetivo

Registrar pedido ou venda operacional preservando contexto de cliente, canal e rota.

## Perfil Principal

Venda Balcão, Atendimento, Caixa autorizado e Gerente.

## Tipo de Tela

Fluxo operacional de criação de pedido/venda.

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

- Carrinho.
- Seleção de produtos.
- Dados de cliente.
- Modal de delivery.
- Confirmação de pedido.
- Vínculo opcional com OJC.

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

- Header operacional quando dentro de módulo; Menu Geral via padrão RAW quando aplicável.

## Modais Obrigatórios

- Novo Pedido
- Dados Delivery
- Confirmação/Cancelamento

## Estados Obrigatórios

- pedido aberto
- carrinho vazio
- itens adicionados
- dados incompletos
- aguardando confirmação
- enviado à produção
- aguardando caixa
- cancelado

## Dados Principais

- cliente
- itens
- canalOrigem
- modalidade
- endereço
- observações
- conversaWhatsAppId opcional
- sessaoCatalogoId opcional

## Ações Principais

- Adicionar item
- Editar item
- Remover item
- Confirmar pedido
- Cancelar
- Enviar para produção/caixa conforme ROR

## Regras de Permissões

Criar pedido depende do modo operacional. Exceções devem ser auditadas.

Toda ação deve considerar:

```text
perfilBase + modoOperacionalAtual + unidadeAtual + ação solicitada
```

## Módulos Opcionais Relacionados

Catálogo assistido, promoções, combos, fidelidade e encomendas.

## Nível de Implantação

Obrigatório / Fase 1

## Nível de Maturidade

Inicial a Intermediária

Regra: não liberar complexidade antes da maturidade operacional do cliente e do usuário.

## Exceções Aprovadas

- Cenários demonstrativos podem ser usados quando dados reais forem insuficientes para homologação visual.
- Placeholders devem ser identificados e não podem parecer dados definitivos.
- Exceções operacionais não alteram cadastro base.

## DNA Aplicável

Rapidez, clareza e continuidade da jornada.

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
