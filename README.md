# 📌 TaskSync

TaskSync é um gerenciador pessoal e profissional que junta, num único painel,
as coisas que normalmente ficam espalhadas em apps diferentes: tarefas do dia
a dia, agenda, metas, controle financeiro (incluindo investimentos) e a gestão
de equipes/projetos de trabalho.

## 🎯 A dor que motivou o projeto

Antes do TaskSync, a maior dificuldade era simplesmente **não ter controle**
sobre duas coisas do dia a dia: as tarefas e as finanças. Tarefa anotada num
lugar, compromisso em outro, gasto lembrado de cabeça (ou nem lembrado) — sem
um lugar único pra ver tudo junto, é fácil perder o controle da rotina e do
próprio dinheiro sem perceber. O TaskSync nasceu pra resolver exatamente isso:
um só painel onde dá pra ver as tarefas do dia, a agenda da semana e a saúde
financeira do mês, tudo no mesmo lugar.

## 🎓 Por que esse projeto existe

Este é também um projeto pessoal de aprendizado, desenvolvido durante o curso
de Análise e Desenvolvimento de Sistemas (ADS). Ele não nasceu de uma spec
fechada para ser seguida à risca — foi crescendo em fases, com cada
funcionalidade nova sendo também um pretexto para aprender algo daquela área
(autenticação e segurança, modelagem de dados relacional, deploy em
produção, etc.), com a IA atuando como uma espécie de professor durante o
processo: explicando o porquê de cada decisão, não só entregando código
pronto.

## ✅ O que o TaskSync já resolve hoje

- ✔️ **Tarefas**: criar, editar, concluir e excluir tarefas, com subtarefas,
  prioridade (Alta/Média/Baixa), tags personalizadas e busca/filtros.
- 📅 **Agenda**: visão de calendário interativo, com tarefas organizadas por
  Hoje / Semana / Atrasadas.
- 🎯 **Metas**: acompanhamento de metas pessoais.
- 💰 **Finanças**: lançamentos financeiros (entradas e saídas) e uma aba de
  investimentos separada, com resumos e gráficos.
- 💼 **Profissional**: gestão de equipe (adicionar/remover membros) e de
  projetos (status, % de progresso), pensada pra quem também usa o TaskSync
  no contexto de trabalho, não só pessoal.
- 🔐 **Conta própria por usuário**: cadastro com nome, e-mail, senha e
  telefone, com verificação da conta por um código de 6 dígitos enviado por
  e-mail. Login autentica com JWT.

🚀 O projeto está no ar, funcionando em produção (backend no Railway,
frontend na Vercel).

## 🛠️ Stack e por quê

| Camada         | Tecnologia                                   | Por quê                                                            |
|----------------|-----------------------------------------------|---------------------------------------------------------------------|
| ☕ Backend     | Java 17 + Spring Boot + Maven                 | Stack mais usada em Java corporativo — o foco de aprendizado do ADS |
| 🗄️ Banco de dados | PostgreSQL (produção) / H2 em memória (dev)   | Postgres real em produção, H2 pra não depender de instalar nada localmente |
| 🎨 Frontend    | HTML + CSS + JavaScript puro                  | Fundamentos antes de introduzir um framework (React fica pra depois) |
| ✉️ E-mail      | API HTTP da Brevo                             | Envio de código de verificação sem custo, sem depender de SMTP (bloqueado por muitos provedores de hospedagem) |
| ☁️ Hospedagem API | Railway                                    | Deploy simples de Spring Boot + Postgres com git push               |
| ☁️ Hospedagem Web | Vercel                                     | Deploy de site estático com git push, sem servidor pra gerenciar    |

## 📂 Estrutura do repositório

```
Gerenciador/
├── backend/     # API Spring Boot (Java)
└── frontend/    # dashboard estático (HTML/CSS via Tailwind CDN + JS puro)
```

## 🗺️ Roadmap

- [x] 🏗️ Fundação: backend e frontend conversando via API
- [x] 🔐 Autenticação: cadastro/login com JWT, cadastro com nome/e-mail/senha/telefone, verificação de conta por código enviado por e-mail
- [x] ✔️ Tarefas: CRUD completo, subtarefas, prioridades
- [x] 🏷️ Tags: etiquetas personalizadas nas tarefas
- [x] 📅 Agenda e Calendário: visão de calendário interativo
- [x] 💼 Profissional: gestão de equipe e projetos
- [x] 💰 Finanças e Investimentos: lançamentos, resumos e gráficos
- [x] 🚀 Deploy em produção: backend (Railway) e frontend (Vercel) no ar

> 📝 Espaço reservado para as próximas atualizações do roadmap — conforme
> novas fases forem planejadas, elas entram aqui.
