// Em localhost usa o backend local; em qualquer outro lugar (Vercel, etc.)
// usa o backend publicado no Railway.
const API_BASE_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:8080"
    : "https://gerenciador-production-ea96.up.railway.app";

async function request(path, options) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!response.ok) {
        throw new Error(`Erro ${response.status} ao chamar ${path}`);
    }
    // DELETE (e algumas outras respostas) podem vir com corpo vazio mesmo em
    // status 200 - response.json() quebra nesse caso, então checamos o texto
    // bruto antes de tentar interpretar como JSON.
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

const api = {
    fetchTasks: () => request("/api/tasks"),
    createTask: (task) => request("/api/tasks", { method: "POST", body: JSON.stringify(task) }),
    updateTask: (task) => request(`/api/tasks/${task.id}`, { method: "PUT", body: JSON.stringify(task) }),
    deleteTask: (id) => request(`/api/tasks/${id}`, { method: "DELETE" }),

    fetchTransactions: () => request("/api/finance/transactions"),
    createTransaction: (transaction) =>
        request("/api/finance/transactions", { method: "POST", body: JSON.stringify(transaction) }),
    deleteTransaction: (id) => request(`/api/finance/transactions/${id}`, { method: "DELETE" }),

    fetchInvestments: () => request("/api/finance/investments"),
    createInvestment: (investment) =>
        request("/api/finance/investments", { method: "POST", body: JSON.stringify(investment) }),
    deleteInvestment: (id) => request(`/api/finance/investments/${id}`, { method: "DELETE" }),

    fetchProjects: () => request("/api/projects"),
    createProject: (project) => request("/api/projects", { method: "POST", body: JSON.stringify(project) }),
    updateProject: (project) => request(`/api/projects/${project.id}`, { method: "PUT", body: JSON.stringify(project) }),
    deleteProject: (id) => request(`/api/projects/${id}`, { method: "DELETE" }),

    fetchTeam: () => request("/api/team"),
    createTeamMember: (member) => request("/api/team", { method: "POST", body: JSON.stringify(member) }),
    deleteTeamMember: (id) => request(`/api/team/${id}`, { method: "DELETE" }),
};
