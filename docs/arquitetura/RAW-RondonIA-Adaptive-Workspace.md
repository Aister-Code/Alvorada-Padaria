# RAW — RondonIA Adaptive Workspace

## Conceito

O RondonIA Adaptive Workspace separa definitivamente:

- Identidade;
- Unidade;
- Modo Operacional.

O operador faz login apenas uma vez.

Depois trabalha alternando contexto operacional, sem novo login.

## Modelo

```text
Usuário
↓
Unidade Atual
↓
Modo Operacional Atual
```

## Definições

### Usuário

Representa quem a pessoa é.

Exemplos:

- Gerente;
- Caixa;
- Atendente;
- Produção;
- Estoque;
- Financeiro.

### Unidade Atual

Representa onde a pessoa está trabalhando naquele momento.

Exemplos:

- Matriz;
- Filial 1;
- Quiosque;
- Evento;
- Unidade futura.

### Modo Operacional Atual

Representa a função exercida naquele momento.

Exemplos:

- Atendimento;
- Caixa;
- Venda Balcão;
- Delivery;
- Produção;
- Gerência.

## Menu Geral

O Menu Geral deve possuir este padrão:

- Trocar Unidade;
- Trocar Modo Operacional;
- Meu Perfil;
- Ajuda;
- Configurações;
- Sair.

## Modo Operacional

Modo Operacional não altera a identidade do operador.

Ele altera apenas o contexto de trabalho.

Só aparecem modos autorizados para aquele operador.

Exemplo:

```text
Operador: Ana
Perfil base: Gerente
Unidade atual: Matriz
Modo operacional atual: Atendimento
```

## Gerente

O Gerente pode assumir outro modo operacional quando autorizado.

Exemplo:

```text
Gerente
↓
Modo Atendimento
↓
Modo Venda Balcão
↓
Modo Caixa
```

A identidade continua sendo Gerente.

O sistema registra que o gerente executou a ação dentro de um modo operacional específico.

## Regras

### Troca de Modo

A troca de modo deve ser:

- rápida;
- sem logout;
- sem novo login;
- preservando contexto sempre que possível;
- limitada aos modos autorizados.

### Troca de Unidade

A troca de unidade deve ser:

- rápida;
- sem logout;
- respeitando permissões;
- alterando o contexto operacional;
- preservando identidade.

## Auditoria

Toda ação operacional deve registrar:

- `operadorId`;
- `perfilBase`;
- `modoOperacionalAtual`;
- `unidadeAtual`;
- `origemDaAção`.

Campos complementares futuros:

- dispositivo;
- sessão;
- canal;
- jornada;
- módulo;
- rota operacional;
- evento blockchain quando aplicável.

## Princípio

```text
Usuário = quem a pessoa é.

Modo Operacional = o que ela está fazendo agora.

Unidade = onde ela está trabalhando.
```

## Impactos Arquiteturais

### Permissões

Permissão não deve depender apenas do perfil base.

Ela deve considerar:

```text
perfilBase
+ unidadeAtual
+ modoOperacionalAtual
+ ação solicitada
```

### CAO

O Centro de Atenção Operacional deve direcionar alertas conforme modo operacional atual.

Exemplo:

- modo Atendimento recebe ajuda de cliente;
- modo Caixa recebe pendência de pagamento;
- modo Produção recebe atraso de preparo.

### OJC

A Jornada do Cliente deve registrar o modo operacional de quem executou cada ação.

Exemplo:

```text
operador: Gerente
perfilBase: gerente
modoOperacionalAtual: atendimento
ação: respondeu cliente
```

### ROR

Rota Operacional pode sugerir modo responsável pela próxima etapa.

Exemplo:

```text
Etapa: Produção
Modo responsável: Produção
```

### Auditoria

Auditoria deve diferenciar identidade de execução.

Um gerente operando como caixa continua sendo gerente, mas a ação foi realizada no modo Caixa.

### Interface

O Header e o Menu Geral devem deixar claro:

- quem está logado;
- em qual unidade está;
- qual modo operacional está ativo.

### RAW

Preferências podem variar por:

- operador;
- unidade;
- modo operacional;
- dispositivo.

Exemplos:

- widgets favoritos no modo Atendimento;
- escala operacional no modo Caixa;
- filtros no modo Delivery.

## Regra de Implementação

Nenhuma tela deve assumir que perfil base e modo operacional são a mesma coisa.

Toda nova tela deve declarar:

- quais modos operacionais podem acessá-la;
- quais ações existem;
- quais ações dependem de perfil base;
- quais ações dependem da unidade.
