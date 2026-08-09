# TaskSync

Plataforma web de gestão de tarefas, tempo, finanças e projetos — unindo a rotina
pessoal e o ambiente profissional (com gestão de equipe e projetos) em um único
lugar.

Este é um projeto de estudo (curso de ADS) construído em fases, com o backend em
Java e o frontend em HTML/CSS/JS puro por enquanto — a migração para React está
planejada para depois que os fundamentos estiverem sólidos.

## Stack

| Camada         | Tecnologia                                   |
|----------------|-----------------------------------------------|
| Backend        | Java 17 + Spring Boot + Maven                 |
| Banco de dados | PostgreSQL (produção) / H2 em memória (dev)   |
| Frontend       | HTML + CSS + JavaScript (React no futuro)     |
| Hospedagem API | Railway                                       |
| Hospedagem Web | Vercel (ou Netlify)                           |
| Domínio        | Nenhum por enquanto — usamos as URLs gratuitas das plataformas |

## Estrutura do repositório

```
Gerenciador/
├── backend/     # API Spring Boot
└── frontend/    # dashboard estático (HTML/CSS via Tailwind CDN/JS)
```

> **Nota sobre o estado atual do projeto:** o frontend já evoluiu rápido e hoje
> é um dashboard funcional (Tarefas, Agenda, Profissional com Equipe/Projetos,
> Metas, Finanças) que consome a API diretamente — mas **ainda sem estar
> conectado à autenticação**. O backend de login (`/api/auth/**` e `/api/me`)
> já existe e funciona de forma isolada; as rotas de dados (`/api/tasks/**`,
> `/api/finance/**`, `/api/projects/**`, `/api/team/**`) estão **públicas de
> propósito** por enquanto, para não travar o dashboard enquanto a integração
> não é feita. Isso está registrado no roadmap abaixo como próximo passo —
> enquanto isso não acontece, não use este projeto com dados reais/sensíveis,
> pois qualquer pessoa com a URL pode ler ou alterar as tarefas, lançamentos
> financeiros, projetos e equipe.

## Como rodar localmente

### Backend

Requer Java 17+ e Maven instalados (ou use o wrapper `./mvnw` se preferir gerá-lo).

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

O perfil `dev` usa um banco H2 em memória, então não é preciso instalar Postgres
para desenvolver localmente. A API sobe em `http://localhost:8080`.

Teste rápido:

```bash
curl http://localhost:8080/api/health
```

Deve retornar `{"status":"ok","service":"tasksync-backend"}`.

### Autenticação (Fase 1)

O backend já tem cadastro/login com JWT. Endpoints disponíveis:

| Método | Rota                | Autenticação | Descrição                                   |
|--------|----------------------|--------------|-----------------------------------------------|
| POST   | `/api/auth/register`| Não          | Cria uma conta (`name`, `email`, `password`) |
| POST   | `/api/auth/login`   | Não          | Autentica e retorna um token JWT             |
| GET    | `/api/me`            | Sim (Bearer) | Retorna o e-mail do usuário logado           |

Exemplo local:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Kauan","email":"kauan@teste.com","password":"senha123"}'

# copie o "token" da resposta acima
curl http://localhost:8080/api/me -H "Authorization: Bearer <TOKEN>"
```

Por enquanto, `/api/tasks/**`, `/api/finance/**`, `/api/projects/**` e
`/api/team/**` estão liberadas em `SecurityConfig.java` (veja o comentário
`TODO` lá) para o dashboard atual funcionar sem travar. Só `/api/me` (e
qualquer rota nova que não for explicitamente liberada) exige o header
`Authorization: Bearer <token>`.

### Frontend

É um site estático (HTML + Tailwind via CDN + JavaScript puro). Basta servir a
pasta `frontend/` com qualquer servidor HTTP local, por exemplo:

```bash
cd frontend
python3 -m http.server 5500
```

Depois abra `http://localhost:5500` no navegador — o dashboard carrega as
tarefas e dados financeiros diretamente da API (`js/api.js` centraliza essas
chamadas, `js/app.js` tem toda a lógica de tela).

> Se você usar outra porta ou o Live Server do VS Code, a URL de origem já está
> liberada no `CorsConfig.java` (`http://localhost:*`).

## Roadmap de fases

- [x] **Fase 0 — Fundação**: esqueleto do projeto, backend e frontend conversando via API, infraestrutura documentada
- [x] **Fase 1 — Autenticação**: cadastro/login de usuários (Spring Security + JWT) — implementada e testada, mas **ainda isolada** do resto do app (ver nota abaixo)
- [x] **Fase 2 — CRUD de Tarefas**: criação, edição, conclusão, exclusão, subtarefas e prioridade (Alta/Média/Baixa) — implementado no dashboard (`/api/tasks`), mas sem estar vinculado a um usuário
- [x] **Fase 3 — Tags**: etiquetas personalizadas nas tarefas — implementado no dashboard (o conceito de Workspaces Pessoal/Profissional foi removido: a aba "Profissional" já cumpre esse papel, agora com gestão real de equipe e projetos)
- [x] **Fase 4 — Agenda e Calendário**: visão de calendário interativo — implementado no dashboard
- [x] **Fase 4.1 — Profissional (Equipe e Projetos)**: CRUD de membros de equipe (`/api/team`) e projetos (`/api/projects`, com status e % de progresso editáveis) — implementado no dashboard
- [ ] **Fase 4.2 — Conectar autenticação ao dashboard**: fazer o `app.js`/`api.js` enviarem o token JWT em toda chamada, associar cada `Task`/`Transaction`/`Investment`/`Project`/`TeamMember` ao usuário logado (campo `user_id`), proteger as rotas de dados (remover do `permitAll` do `SecurityConfig`), e adicionar as telas de login/cadastro no dashboard
- [ ] **Fase 5 — Notificações e Métricas**: lembretes (push + resumo diário por e-mail) e métricas de produtividade no dashboard
- [ ] **Extra (fora do escopo original do PDF)**: módulos de Finanças/Investimentos e Profissional/Equipe já foram implementados além do MVP original — vale decidirmos juntos se continuam fazendo parte do escopo principal

## Guia de deploy

Estes passos precisam ser feitos pelo usuário (exigem contas pessoais nas
plataformas), mas seguem documentados aqui para quando chegar a hora.

### 1. Backend + PostgreSQL no Railway

1. Crie uma conta em [railway.app](https://railway.app) e conecte sua conta do GitHub
2. "New Project" → "Deploy from GitHub repo" → selecione este repositório
3. Configure o **root directory** do serviço para `backend/` (Railway detecta o `pom.xml` e builda automaticamente com Nixpacks)
4. No mesmo projeto, clique em "New" → "Database" → "Add PostgreSQL" (isso cria um serviço separado, geralmente chamado `Postgres`, com suas próprias variáveis: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`)
5. No serviço do **backend** (não no Postgres), vá em "Variables" e crie estas três variáveis, usando a sintaxe de referência do Railway (`${{NomeDoServico.VARIAVEL}}`) para puxar os valores do serviço Postgres automaticamente — troque `Postgres` pelo nome exato que aparece no seu projeto, se for diferente:
   - `JDBC_DATABASE_URL` = `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}`
   - `DB_USERNAME` = `${{Postgres.PGUSER}}`
   - `DB_PASSWORD` = `${{Postgres.PGPASSWORD}}`

   > Não use a variável `DATABASE_URL` que o Railway gera automaticamente no serviço Postgres — ela vem no formato `postgres://usuario:senha@host:porta/banco`, e o driver JDBC do Spring Boot exige o formato `jdbc:postgresql://host:porta/banco`. Por isso criamos `JDBC_DATABASE_URL` como uma variável própria, já no formato certo.
6. Ainda nas "Variables" do backend, crie também `JWT_SECRET` com uma string aleatória em base64 — gere a sua localmente com `openssl rand -base64 32` e cole o resultado. Essa chave assina os tokens JWT; nunca reutilize a chave de desenvolvimento (`application-dev.properties`) em produção.
7. O Railway vai expor uma URL pública — no nosso caso é
   `https://gerenciador-production-ea96.up.railway.app`

### 2. Frontend na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) e conecte o GitHub
2. "Add New" → "Project" → selecione este repositório
3. Em "Root Directory", selecione `frontend/`
4. Framework preset: "Other" (é HTML/CSS/JS puro, sem build step)
5. Deploy — a Vercel vai gerar uma URL tipo `https://tasksync.vercel.app`

### 3. Conectar os dois

`frontend/js/api.js` já detecta o ambiente automaticamente: em `localhost` usa
o backend local, em qualquer outro domínio (Vercel) usa a URL do Railway
acima. `backend/.../config/CorsConfig.java` já libera qualquer subdomínio
`https://*.vercel.app`. Ou seja, depois do passo 1 (Vercel), normalmente não
é preciso alterar código nenhum — só confirmar que a URL do Railway em
`api.js` continua correta se você recriar o serviço no Railway algum dia (a
URL muda nesse caso).
