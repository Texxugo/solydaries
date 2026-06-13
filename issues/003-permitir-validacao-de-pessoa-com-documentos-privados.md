# Permitir Validação de Pessoa com documentos privados

## What to build

Permitir que uma **Pessoa** solicite **Validação de Pessoa** enviando **Documentos de Validação** privados, e que um **Administrador** aprove ou rejeite a solicitação com decisão registrada.

## Acceptance criteria

- [x] Uma Pessoa autenticada consegue enviar uma solicitação de Validação de Pessoa.
- [x] O envio exige consentimento específico para documentos.
- [x] Documentos de Validação são armazenados como arquivos privados.
- [x] Administradores conseguem ver a fila de validações pendentes.
- [x] Administradores conseguem aprovar ou rejeitar com motivo quando necessário.
- [x] A decisão gera notificação interna e registro de auditoria.
- [x] Moderadores não conseguem acessar documentos de validação.

## Blocked by

- [001 - Criar base fullstack com login de Pessoa](./001-criar-base-fullstack-com-login-de-pessoa.md)
- [002 - Implementar papéis Administrador e Moderador com autorização](./002-implementar-papeis-administrador-e-moderador-com-autorizacao.md)
