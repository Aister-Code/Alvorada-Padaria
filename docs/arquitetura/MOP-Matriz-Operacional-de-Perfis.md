# MOP — Matriz Operacional de Perfis

## Objetivo

Documentar oficialmente:

- quem a pessoa é;
- o que ela pode fazer;
- em quais modos pode trabalhar;
- em quais unidades pode operar.

A MOP passa a ser referência para:

- permissões;
- modos operacionais;
- troca de modo;
- troca de unidade;
- auditoria;
- RAW;
- ROR;
- OJC;
- CAO.

## Separação Oficial

```text
Perfil Base
↓
Modo Operacional
↓
Unidade Atual
↓
Ação
```

Perfil Base nunca muda durante a sessão.

Modo Operacional pode mudar conforme autorização.

Unidade Atual pode mudar conforme autorização.

## Auditoria Obrigatória

Toda ação deve registrar:

- `operadorId`;
- `perfilBase`;
- `modoOperacionalAtual`;
- `unidadeAtual`;
- `origemDaAção`.

Campos recomendados para evolução:

- `jornadaId`;
- `pedidoId`;
- `conversaId`;
- `sessaoCatalogoId`;
- `transferenciaId`;
- `rotaOperacionalId`;
- `dispositivo`;
- `timestamp`.

## RAW

Preferências devem ser salvas por:

```text
Operador
+
Modo Operacional
+
Unidade
```

Exemplos:

- filtros favoritos no modo Atendimento;
- escala operacional no modo Caixa;
- widgets visíveis no modo Gerência;
- visão compacta no modo Produção.

## CAO

O Centro de Atenção Operacional deve direcionar alertas pelo Modo Operacional, não apenas pelo Perfil Base.

Exemplos:

- operador com perfil Gerente em modo Atendimento recebe alertas de atendimento;
- operador com perfil Caixa em modo Caixa recebe pendências financeiras;
- operador com perfil Produção em modo Produção recebe atrasos de preparo.

## Perfil Base: Gerente

### Objetivo

Supervisionar a operação, resolver exceções, autorizar decisões e assumir modos operacionais quando necessário.

### Modos Operacionais Permitidos

- Gerência;
- Atendimento;
- Caixa;
- Venda Balcão;
- Delivery;
- Produção;
- Estoque;
- Financeiro, quando autorizado;
- Administração, quando autorizado.

### Modos Proibidos

- Nenhum por padrão, desde que autorizado pela unidade e política da empresa.

### Módulos Principais

- Centro de Operações;
- Gestão;
- Central de Atendimento;
- Caixa;
- Delivery;
- Produção;
- Usuários;
- Estoque.

### Módulos Secundários

- Venda;
- Financeiro;
- Administração;
- Catálogo;
- Relatórios.

### Pode Assumir Transferências?

Sim.

### Pode Transferir?

Sim.

### Pode Trocar Unidade?

Sim, entre unidades autorizadas.

### Pode Assumir Outro Modo?

Sim.

Exemplo:

```text
Gerente
↓
Modo Atendimento
↓
Modo Caixa
↓
Modo Venda Balcão
↓
Modo Delivery
```

A identidade continua sendo Gerente.

Auditoria registra:

- `perfilBase: gerente`;
- `modoOperacionalAtual`;
- `unidadeAtual`.

### Restrições

- Ações sensíveis devem exigir registro de motivo.
- Exceções não alteram cadastro base.
- Alterações estruturais devem ser auditáveis.

## Perfil Base: Atendimento

### Objetivo

Receber comunicação, identificar cliente, conduzir jornadas, iniciar pedidos e transferir responsabilidades.

### Modos Operacionais Permitidos

- Atendimento;
- Venda Balcão, quando autorizado.

### Modos Proibidos

- Gerência;
- Administração;
- Financeiro;
- Produção, salvo exceção operacional futura;
- Caixa, salvo autorização explícita futura.

### Módulos Principais

- Central de Atendimento;
- Venda;
- Catálogo;
- Acompanhamento de pedidos.

### Módulos Secundários

- Delivery em consulta;
- Customer Memory;
- Jornada Hoje;
- Consulta de promoções;
- Consulta de contas a receber, sem recebimento.

### Pode Assumir Transferências?

Sim, quando destinadas ao Atendimento.

### Pode Transferir?

Sim.

Destinos comuns:

- Caixa;
- Produção;
- Delivery;
- Gerente.

### Pode Trocar Unidade?

Somente entre unidades autorizadas.

### Pode Assumir Outro Modo?

Somente Venda Balcão quando autorizado.

### Restrições

- Não recebe pagamento.
- Não executa fechamento financeiro.
- Não assume Gerência.
- Não altera permissões.

## Perfil Base: Caixa

### Objetivo

Resolver pagamentos, fechar vendas, consultar pendências financeiras operacionais e apoiar jornadas com etapa financeira.

### Modos Operacionais Permitidos

- Caixa;
- Venda Balcão, quando autorizado.

### Modos Proibidos

- Produção;
- Gerência;
- Administração;
- Delivery, salvo exceção futura;
- Atendimento completo, salvo consulta operacional.

### Módulos Principais

- Caixa;
- Venda Balcão;
- Fila de pagamentos;
- Fechamento.

### Módulos Secundários

- Central de Atendimento em consulta;
- Pedidos;
- Delivery em consulta;
- Financeiro em consulta limitada.

### Pode Assumir Transferências?

Sim, quando destinadas ao Caixa.

### Pode Transferir?

Sim.

Destinos comuns:

- Atendimento;
- Gerente;
- Financeiro.

### Pode Trocar Unidade?

Somente entre unidades autorizadas.

### Pode Assumir Outro Modo?

Venda Balcão, quando autorizado.

### Restrições

- Não assume Produção.
- Não altera rota operacional base.
- Não altera permissões.
- Operações financeiras devem ser auditadas.

## Perfil Base: Produção

### Objetivo

Preparar itens conforme rota operacional, atualizar status e sinalizar ocorrências.

### Modos Operacionais Permitidos

- Produção.

### Modos Proibidos

- Caixa;
- Gerência;
- Administração;
- Financeiro;
- Atendimento completo;
- Venda Balcão.

### Módulos Principais

- Produção;
- Fila de pedidos;
- Acompanhamento operacional.

### Módulos Secundários

- Estoque em consulta;
- Jornada Hoje;
- Ocorrências.

### Pode Assumir Transferências?

Sim, quando destinadas à Produção.

### Pode Transferir?

Sim.

Destinos comuns:

- Atendimento;
- Delivery;
- Gerente;
- Estoque.

### Pode Trocar Unidade?

Somente entre unidades autorizadas.

### Pode Assumir Outro Modo?

Não por padrão.

### Restrições

- Não assume Caixa.
- Não recebe pagamento.
- Não altera pedido financeiro.
- Não altera permissões.

## Perfil Base: Delivery

### Objetivo

Conduzir entregas, atualizar rota, registrar ocorrências e manter atendimento informado.

### Modos Operacionais Permitidos

- Delivery.

### Modos Proibidos

- Caixa;
- Produção;
- Gerência;
- Administração;
- Financeiro;
- Venda Balcão, salvo autorização futura.

### Módulos Principais

- Delivery;
- Entregas;
- Acompanhamento de pedidos.

### Módulos Secundários

- Central de Atendimento em contexto de entrega;
- Cliente/endereço;
- Ocorrências.

### Pode Assumir Transferências?

Sim, quando destinadas ao Delivery.

### Pode Transferir?

Sim.

Destinos comuns:

- Atendimento;
- Caixa;
- Gerente.

### Pode Trocar Unidade?

Somente entre unidades autorizadas.

### Pode Assumir Outro Modo?

Não por padrão.

### Restrições

- Não recebe pagamento, salvo política futura explícita.
- Não altera pedido base.
- Não altera permissões.

## Perfil Base: Estoque

### Objetivo

Controlar disponibilidade, conferência, reposição e rupturas.

### Modos Operacionais Permitidos

- Estoque.

### Modos Proibidos

- Caixa;
- Gerência;
- Administração;
- Financeiro completo;
- Atendimento completo;
- Delivery.

### Módulos Principais

- Estoque;
- Inventário;
- Reposição;
- Alertas.

### Módulos Secundários

- Produção em consulta;
- Gestão em recortes operacionais;
- Jornada Hoje.

### Pode Assumir Transferências?

Sim, quando destinadas ao Estoque.

### Pode Transferir?

Sim.

Destinos comuns:

- Produção;
- Gerente;
- Financeiro.

### Pode Trocar Unidade?

Somente entre unidades autorizadas.

### Pode Assumir Outro Modo?

Não por padrão.

### Restrições

- Não recebe pagamento.
- Não altera permissões.
- Ajustes críticos devem ser auditados.

## Perfil Base: Financeiro

### Objetivo

Consultar, validar e acompanhar dados financeiros, recebíveis e divergências.

### Modos Operacionais Permitidos

- Financeiro;
- Caixa em consulta, quando autorizado.

### Modos Proibidos

- Produção;
- Delivery;
- Atendimento completo;
- Administração, salvo autorização específica;
- Gerência, salvo perfil acumulado.

### Módulos Principais

- Financeiro;
- Relatórios;
- Contas a receber;
- Fechamento.

### Módulos Secundários

- Caixa em consulta;
- Gestão;
- Customer Memory em consulta financeira.

### Pode Assumir Transferências?

Sim, quando destinadas ao Financeiro.

### Pode Transferir?

Sim.

Destinos comuns:

- Caixa;
- Gerente;
- Administração.

### Pode Trocar Unidade?

Somente entre unidades autorizadas.

### Pode Assumir Outro Modo?

Caixa em consulta, quando autorizado.

### Restrições

- Não conduz atendimento operacional.
- Não cria pedido.
- Não altera produção ou delivery.

## Perfil Base: Administração

### Objetivo

Gerenciar acessos, permissões, cadastros operacionais e suporte administrativo.

### Modos Operacionais Permitidos

- Administração;
- Gerência, quando autorizado;
- Suporte;
- Configurações.

### Modos Proibidos

- Caixa operacional, salvo autorização explícita;
- Produção operacional, salvo autorização explícita;
- Delivery operacional, salvo autorização explícita.

### Módulos Principais

- Usuários;
- Administração;
- Configurações;
- Permissões;
- Auditoria.

### Módulos Secundários

- Gestão;
- Suporte;
- Relatórios;
- Logs.

### Pode Assumir Transferências?

Sim, quando destinadas à Administração ou Suporte.

### Pode Transferir?

Sim.

Destinos comuns:

- Gerente;
- Suporte;
- Financeiro.

### Pode Trocar Unidade?

Sim, conforme autorização.

### Pode Assumir Outro Modo?

Somente quando autorizado formalmente.

### Restrições

- Acesso administrativo deve ser altamente auditado.
- Não deve executar operação de loja sem modo operacional explícito.
- Alterações estruturais devem registrar motivo.

## Matriz Resumida

| Perfil Base | Modos Permitidos Principais | Pode Transferir | Pode Receber Transferência | Troca Unidade | Assume Outro Modo |
| --- | --- | --- | --- | --- | --- |
| Gerente | Gerência, Atendimento, Caixa, Venda Balcão, Delivery, Produção, Estoque | Sim | Sim | Sim | Sim |
| Atendimento | Atendimento, Venda Balcão autorizado | Sim | Sim | Autorizado | Limitado |
| Caixa | Caixa, Venda Balcão autorizado | Sim | Sim | Autorizado | Limitado |
| Produção | Produção | Sim | Sim | Autorizado | Não |
| Delivery | Delivery | Sim | Sim | Autorizado | Não |
| Estoque | Estoque | Sim | Sim | Autorizado | Não |
| Financeiro | Financeiro, Caixa consulta | Sim | Sim | Autorizado | Limitado |
| Administração | Administração, Suporte, Configurações | Sim | Sim | Sim | Autorizado |

## Relação com ROR

ROR define a rota operacional.

MOP define quem pode atuar em cada etapa da rota.

Exemplo:

```text
Rota: Produção → Conferência → Delivery → Caixa

MOP:
Produção assume Produção.
Delivery assume Delivery.
Caixa assume Caixa.
Gerente pode assumir qualquer etapa autorizada.
```

## Relação com OJC

OJC governa a Jornada do Cliente.

MOP define:

- quem pode assumir a jornada;
- quem pode responder cliente;
- quem pode criar pedido;
- quem pode transferir;
- quem pode consultar dados financeiros;
- quem pode encerrar.

## Relação com CAO

CAO deve entregar atenção ao Modo Operacional correto.

Exemplo:

```text
Pagamento pendente → Modo Caixa
Ajuda no catálogo → Modo Atendimento
Atraso de produção → Modo Produção
Entrega crítica → Modo Delivery
Exceção grave → Modo Gerência
```

## Relação com RAW

RAW adapta a interface ao operador, unidade e modo.

MOP define quais modos o operador pode escolher.

Preferências são salvas por:

```text
operadorId
+
modoOperacionalAtual
+
unidadeAtual
```

## Pontos Cegos

- Falta definir matriz real por cliente/unidade.
- Falta definir se perfis podem acumular permissões.
- Falta política de autorização temporária.
- Falta regra de substituição de turno.
- Falta regra de emergência para gerente assumir qualquer função.
- Falta definir permissões para suporte externo.
- Falta diferenciar consulta, execução e autorização em todos os módulos.
- Falta modelo técnico para `modoOperacionalAtual` na sessão.

## Sugestões Antes do Congelamento

1. Criar matriz técnica de permissões por ação.
2. Separar permissões em consulta, execução, autorização e administração.
3. Definir modos operacionais por unidade.
4. Definir política de autorização temporária.
5. Definir regra de auditoria para troca de modo.
6. Definir como o Menu Geral troca modo e unidade.
7. Definir fallback quando operador perde permissão durante sessão.

## Regra de Implementação

Nenhuma nova tela deve assumir que perfil base e modo operacional são a mesma coisa.

Toda ação deve validar:

```text
perfilBase
+
modoOperacionalAtual
+
unidadeAtual
+
ação solicitada
```
