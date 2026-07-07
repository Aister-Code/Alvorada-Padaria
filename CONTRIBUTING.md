# Contribuição

Este projeto usa fluxo com branches protegidas.

## Fluxo

1. Atualize a branch `develop`.
2. Crie uma branch a partir de `develop`:

```bash
git checkout develop
git pull
git checkout -b feature/nome-da-feature
```

3. Faça commits pequenos e objetivos.
4. Abra um Pull Request para `develop`.
5. Após validação, a integração para `main` deve ocorrer apenas por Pull Request aprovado.

## Regras

- Nunca trabalhar diretamente na `main`.
- Usar branches `feature/*` para desenvolvimento novo.
- Não misturar refatorações, correções e funcionalidades no mesmo PR.
- Rodar validações antes de abrir PR.
