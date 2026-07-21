# Checkpoints e Commits

## Branch e ultimo commit

- Branch atual no momento desta memoria: `feature/m005-caixa`.
- Ultimo commit funcional confirmado: `d4fdffc`.
- M-003.M2 foi homologada tecnicamente, commitada e enviada.

## Commits relevantes

| Hash curto | Hash completo | Data | Mensagem | Modulo/etapa | Status |
| --- | --- | --- | --- | --- | --- |
| `0fde10d` | `0fde10d1cfa737f5eefbb293f8f9fec9e18d6e12` | 2026-07-11 00:54:30 -0400 | feat: refinar superficies operacionais e atendimento | Gerente/Atendimento | Confirmado |
| `efe3d8f` | `efe3d8f85de40a43e56f9a40ff9599df39000de6` | 2026-07-12 17:09:46 -0400 | feat: refinar dna operacional do gerente | Gerente | Confirmado |
| `4e8c93f` | `4e8c93fd11ff343fc95f4e0d7df0f28389d64dea` | 2026-07-12 23:44:10 -0400 | feat: padronizar dna visual de docks operacionais | DNA/Docks | Confirmado |
| `abb171b` | `abb171bd0757b6281da0794a43e0c14eea783e28` | 2026-07-15 20:41:50 -0400 | feat: refinar central de atendimento | Central | Homologado |
| `3852c4a` | `3852c4ad056d699ca45036062f861ca084c5553c` | 2026-07-15 22:42:45 -0400 | feat: refinar interacoes da central de atendimento | Central | Homologado |
| `2b891a0` | `2b891a01ab5296c8903e221ea6d70a0290383f3a` | 2026-07-16 00:11:07 -0400 | docs: criar dmi e mho da jornada cliente catalogo | DMI/MHO Catalogo | Homologado documental |
| `004ff64` | `004ff6481d870c2844a16063ff4aec9e4f1bf761` | 2026-07-16 08:18:52 -0400 | docs: criar plano fase 1 da jornada cliente catalogo | Plano Catalogo | Homologado documental |
| `63657e1` | `63657e1e443cd6dd545935df92b81076cd65c6a6` | 2026-07-16 13:31:17 -0400 | docs: consolidar dna e ux do cardapio digital | UX/DNA Cardapio | Homologado documental |
| `ef04479` | `ef04479d11189f3de6b46ef063ea5299e2f0210b` | 2026-07-16 22:09:26 -0400 | docs: reconciliar cardapio com foundation externa | Foundation/Catalogo | Homologado documental |
| `f0f7e82` | `f0f7e82a846f6447b8eb82d28adeb9375854443a` | 2026-07-17 13:57:05 -0400 | docs: atualizar dmi mho catalogo com foundation | DMI/MHO Catalogo | Homologado documental |
| `efc2f4e` | `efc2f4ecedd6e99c1d7cbba679711996801d3690` | 2026-07-18 11:48:45 -0400 | docs: homologar instancia do catalogo alvorada | CATALOG-INSTANCE | Homologado documental |
| `1c4b377` | `1c4b377dba20fc4fa20a69fee7ac06a7063ba6cb` | 2026-07-18 13:40:00 -0400 | docs: homologar modelo tecnico do catalogo alvorada | CATALOG-MODEL | Homologado documental |
| `9dc9391` | `9dc93918195efffa3df24caa9945e2f99c53029c` | 2026-07-18 20:19:53 -0400 | feat: estruturar schema e contratos do catalogo real | M-003.M1/M1.5 | Confirmado |
| `d4fdffc` | `d4fdffcdcb99ccd835f98a3a57f8a55deb9f29d7` | 2026-07-20 20:58:39 -0400 | feat: implementar catalogo mestre e opcoes | M-003.M2 | Homologado/commitado |

## Separacao por tipo

### Checkpoints documentais

- `2b891a0` - DMI/MHO Jornada Cliente Catalogo.
- `004ff64` - Plano Fase 1.
- `63657e1` - DNA/UX Cardapio.
- `ef04479` - Matriz Foundation.
- `f0f7e82` - Atualizacao DMI/MHO com Foundation.
- `efc2f4e` - CATALOG-INSTANCE.
- `1c4b377` - CATALOG-MODEL.

### Checkpoints funcionais

- `abb171b` - Central de Atendimento.
- `3852c4a` - Interacoes da Central.
- `9dc9391` - Schema e contratos do catalogo real.
- `d4fdffc` - Catalogo Mestre e Opcoes.

### Checkpoints visuais

- `0fde10d` - Superficies operacionais e atendimento.
- `efe3d8f` - DNA operacional do gerente.
- `4e8c93f` - DNA visual de docks operacionais.
- `63657e1` - DNA/UX Cardapio.

### Commits ainda nao realizados

- Memoria Mestre do Projeto: atualizada apos o checkpoint M2, aguardando commit documental.

## Detalhe do checkpoint M-003.M2

| Campo | Valor |
| --- | --- |
| Hash curto | `d4fdffc` |
| Hash completo | `d4fdffcdcb99ccd835f98a3a57f8a55deb9f29d7` |
| Branch | `feature/m005-caixa` |
| Mensagem | `feat: implementar catalogo mestre e opcoes` |
| Finalidade | Implementar catalogo mestre, opcoes, vendabilidade, query publica canonica, compatibilidade legada e documentacao M2. |
| Validacoes | `npx.cmd convex codegen`, `npx.cmd tsc -b`, `npm.cmd run build`, `npm.cmd test`, `git diff --check`, HTTP 200 em `/cardapio` e `/catalogo`. |
| Arquivos principais | `convex/catalog/*`, `convex/schema.ts`, `convex/venda/pedidos.ts`, `src/pages/catalog/*`, `docs/arquitetura/Catalogo/M-003.M2-Catalogo-Mestre-e-Opcoes.md`. |

## Observacoes

- Nao inventar hash completo quando o Git nao retornar o objeto.
- Antes de qualquer checkpoint, confirmar `git diff --check`, `git status --short` e escopo exato de staging.
