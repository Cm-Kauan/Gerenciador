# TaskSync

Plataforma web de gestão de tarefas, tempo e metas — unindo a rotina pessoal e o
ambiente profissional em um único lugar, através de **Workspaces** isolados
(Pessoal / Profissional).

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
└── frontend/    # site estático (HTML/CSS/JS)
```

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

Qualquer outra rota (fora `/api/auth/**`, `/api/health` e `/h2-console/**`) exige
o header `Authorization: Bearer <token>` — é assim que as próximas fases (tarefas,
workspaces etc.) vão saber de qual usuário se trata.

### Frontend

É um site estático simples. Basta servir a pasta `frontend/` com qualquer
servidor HTTP local, por exemplo:

```bash
cd frontend
python3 -m http.server 5500
```

Depois abra `http://localhost:5500` no navegador e clique em
"Testar conexão com o backend" — se aparecer o JSON de status, front e back
estão se comunicando corretamente (e o CORS está configurado certo).

Na mesma página agora tem abas de **Entrar** / **Criar conta**: crie uma conta,
depois clique em "Consultar /api/me" para ver o token JWT sendo usado de fato
para acessar uma rota protegida.

> Se você usar outra porta ou o Live Server do VS Code, a URL de origem já está
> liberada no `CorsConfig.java` (`http://localhost:*`).

## Roadmap de fases

- [x] **Fase 0 — Fundação**: esqueleto do projeto, backend e frontend conversando via API, infraestrutura documentada
- [x] **Fase 1 — Autenticação**: cadastro/login de usuários (Spring Security + JWT)
- [ ] **Fase 2 — CRUD de Tarefas**: criação, edição, conclusão, exclusão, subtarefas e prioridade (Alta/Média/Baixa)
- [ ] **Fase 3 — Workspaces e Tags**: alternância Pessoal/Profissional e etiquetas personalizadas
- [ ] **Fase 4 — Agenda e Calendário**: visão "Hoje / Esta Semana / Atrasados" e calendário interativo
- [ ] **Fase 5 — Notificações e Dashboard**: lembretes (push + resumo diário por e-mail) e métricas de produtividade

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
7. O Railway vai expor uma URL pública tipo `https://tasksync-backend.up.railway.app` — guarde essa URL

### 2. Frontend na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) e conecte o GitHub
2. "Add New" → "Project" → selecione este repositório
3. Em "Root Directory", selecione `frontend/`
4. Framework preset: "Other" (é HTML/CSS/JS puro, sem build step)
5. Deploy — a Vercel vai gerar uma URL tipo `https://tasksync.vercel.app`

### 3. Conectar os dois

1. Em `frontend/js/app.js`, troque `API_BASE_URL` pela URL pública do Railway
2. Em `backend/src/main/java/com/tasksync/backend/config/CorsConfig.java`, confirme que o padrão `https://*.vercel.app` cobre a URL gerada (se a Vercel usar um domínio customizado depois, adicione aqui)
3. Faça commit e push das duas alterações — Railway e Vercel re-deployam automaticamente a cada push na branch configurada
