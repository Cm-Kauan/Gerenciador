// Troque esta URL pela URL pública do backend depois do deploy no Railway.
const API_BASE_URL = "http://localhost:8080";
const TOKEN_KEY = "tasksync_token";
const USER_KEY = "tasksync_user";

const healthBtn = document.getElementById("check-health-btn");
const healthResult = document.getElementById("health-result");

healthBtn.addEventListener("click", async () => {
    healthResult.textContent = "Consultando...";
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (!response.ok) throw new Error(`O backend respondeu com status ${response.status}`);
        healthResult.textContent = JSON.stringify(await response.json(), null, 2);
    } catch (error) {
        healthResult.textContent = `Falha ao conectar com o backend: ${error.message}`;
    }
});

// --- Abas login / criar conta ---
document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

// --- Login ---
const loginForm = document.getElementById("login-tab");
const authResult = document.getElementById("auth-result");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            authResult.textContent = typeof data === "string" ? data : JSON.stringify(data);
            return;
        }

        saveSession(data);
        authResult.textContent = `Login realizado com sucesso. Bem-vindo(a), ${data.name}!`;
    } catch (error) {
        authResult.textContent = `Erro ao tentar logar: ${error.message}`;
    }
});

// --- Registro ---
const registerForm = document.getElementById("register-tab");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            authResult.textContent = typeof data === "string" ? data : JSON.stringify(data);
            return;
        }

        saveSession(data);
        authResult.textContent = `Conta criada com sucesso. Bem-vindo(a), ${data.name}!`;
    } catch (error) {
        authResult.textContent = `Erro ao criar conta: ${error.message}`;
    }
});

// --- Sessão / área logada ---
function saveSession(authResponse) {
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify({ name: authResponse.name, email: authResponse.email }));
    renderLoggedUser();
}

function renderLoggedUser() {
    const raw = localStorage.getItem(USER_KEY);
    const info = document.getElementById("logged-user-info");
    info.textContent = raw
        ? `Logado como ${JSON.parse(raw).name} (${JSON.parse(raw).email})`
        : "Você ainda não está logado.";
}

document.getElementById("check-me-btn").addEventListener("click", async () => {
    const meResult = document.getElementById("me-result");
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        meResult.textContent = "Nenhum token salvo. Faça login primeiro.";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            meResult.textContent = `Acesso negado (status ${response.status}). Token inválido ou expirado.`;
            return;
        }

        meResult.textContent = JSON.stringify(await response.json(), null, 2);
    } catch (error) {
        meResult.textContent = `Erro ao consultar /api/me: ${error.message}`;
    }
});

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.getElementById("me-result").textContent = "";
    renderLoggedUser();
});

renderLoggedUser();
