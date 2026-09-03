# TaskSync

TaskSync é um gerenciador pessoal e profissional que junta, num único painel,
as coisas que normalmente ficam espalhadas em apps diferentes: tarefas do dia
a dia, agenda, metas, controle financeiro (incluindo investimentos) e a gestão
de equipes/projetos de trabalho. A ideia por trás dele é simples — em vez de
alternar entre um app de tarefas, uma planilha de gastos e uma ferramenta de
projeto, tudo mora no mesmo lugar, com login próprio por usuário.

## Por que esse projeto existe

Este é um projeto pessoal de aprendizado, desenvolvido durante o curso de
Análise e Desenvolvimento de Sistemas (ADS). Ele não nasceu de uma spec fechada
para ser seguida à risca — foi crescendo em fases, com cada funcionalidade nova
sendo também um pretexto para aprender algo daquela área (autenticação e
segurança, modelagem de dados relacional, deploy em produção, etc.), com a IA
atuando como uma espécie de professor durante o processo: explicando o porquê
de cada decisão, não só entregando código pronto.

Por isso o TaskSync tem cara de produto real (login, deploy público,
domínio próprio de aplicação) mas o objetivo principal sempre foi entender
*como* essas peças se encaixam, não só ter o app funcionando.

## O que dá pra fazer no TaskSync hoje

- **Tarefas**: criar, editar, concluir e excluir tarefas, com subtarefas,
  prioridade (Alta/Média/Baixa), tags personalizadas e busca/filtros.
- **Agenda**: visão de calendário interativo, com tarefas organizadas por
  Hoje / Semana / Atrasadas.
- **Metas**: acompanhamento de metas pessoais.
- **Finanças**: lançamentos financeiros (entradas e saídas) e uma aba de
  investimentos separada, com resumos e gráficos.
- **Profissional**: gestão de equipe (adicionar/remover membros) e de
  projetos (status, % de progresso), pensada pra quem também usa o TaskSync
  no contexto de trabalho, não só pessoal.
- **Conta própria por usuário**: cadastro com nome, e-mail, senha e telefone,
  com verificação da conta por um código de 6 dígitos enviado por e-mail
  (a verificação por SMS já está desenhada na interface, mas ainda desativada
  — depende de um serviço pago que não foi contratado). Login autentica com
  JWT.

## Estado atual (sendo honesto sobre isso)

O projeto está numa fase de transição: o dashboard (tarefas, finanças,
projetos) e o sistema de login foram construídos em paralelo e **ainda não
estão totalmente integrados**. Hoje, qualquer um dos dois funciona sozinho,
mas os dados de tarefas/finanças/projetos ainda não pertencem a um usuário
específico — são compartilhados por qualquer um que acesse a URL, mesmo
depois de fazer login. Ligar essas duas partes (associar cada tarefa/
lançamento/projeto ao dono da conta e proteger essas rotas por autenticação)
é o próximo passo do roadmap, então **não é recomendado usar este projeto
hoje com dados sensíveis de verdade**.

## Stack e por quê

| Camada         | Tecnologia                                   | Por quê                                                            |
|----------------|-----------------------------------------------|---------------------------------------------------------------------|
| Backend        | Java 17 + Spring Boot + Maven                 | Stack mais usada em Java corporativo — o foco de aprendizado do ADS |
| Banco de dados | PostgreSQL (produção) / H2 em memória (dev)   | Postgres real em produção, H2 pra não depender de instalar nada localmente |
| Frontend       | HTML + CSS + JavaScript puro                  | Fundamentos antes de introduzir um framework (React fica pra depois) |
| E-mail         | API HTTP da Brevo                             | Envio de código de verificação sem custo, sem depender de SMTP (bloqueado por muitos provedores de hospedagem) |
| Hospedagem API | Railway                                       | Deploy simples de Spring Boot + Postgres com git push               |
| Hospedagem Web | Vercel                                        | Deploy de site estático com git push, sem servidor pra gerenciar    |

## Estrutura do repositório

```
Gerenciador/
├── backend/     # API Spring Boot (Java)
└── frontend/    # dashboard estático (HTML/CSS via Tailwind CDN + JS puro)
```

## Roadmap

- [x] **Fase 0 — Fundação**: esqueleto do projeto, backend e frontend conversando via API
- [x] **Fase 1 — Autenticação**: cadastro/login com JWT, cadastro com nome/e-mail/senha/telefone, verificação de conta por código enviado por e-mail (SMS desenhado na UI, ainda inativo)
- [x] **Fase 2 — Tarefas**: CRUD completo, subtarefas, prioridades
- [x] **Fase 3 — Tags**: etiquetas personalizadas nas tarefas
- [x] **Fase 4 — Agenda e Calendário**: visão de calendário interativo
- [x] **Fase 4.1 — Profissional**: gestão de equipe e projetos
- [ ] **Fase 4.2 — Conectar autenticação ao dashboard**: associar cada tarefa/lançamento/investimento/projeto/membro de equipe ao usuário logado e proteger essas rotas (hoje ainda públicas de propósito, ver seção "Estado atual")
- [ ] **Fase 5 — Notificações e Métricas**: lembretes (push + resumo diário por e-mail) e métricas de produtividade
- [ ] **Futuro**: migração do frontend para React, uma vez que os fundamentos estejam sólidos

## Como rodar localmente

Requer Java 17+ e Maven.

```bash
# Backend (perfil dev usa H2 em memória, sem precisar instalar Postgres)
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
# API sobe em http://localhost:8080 — teste com curl http://localhost:8080/api/health

# Frontend (em outro terminal)
cd frontend
python3 -m http.server 5500
# abra http://localhost:5500
```

No perfil `dev`, o código de verificação de e-mail não é enviado de
verdade — ele aparece no console/log do backend, pra facilitar testar o
cadastro sem precisar configurar a Brevo localmente.

Detalhes de endpoints da API, variáveis de ambiente e o passo a passo
completo de deploy (Railway + Vercel + Brevo) estão documentados nos
comentários do código (`application.properties`, `SecurityConfig.java`,
`AuthController.java`) — este README foca em explicar o que o projeto é e
onde ele está, não em ser um manual de operação linha a linha.
