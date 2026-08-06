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
    if (response.status === 204) return null;
    return response.json();
}

const api = {
    fetchTasks: () => request("/api/tasks"),
    createTask: (task) => request("/api/tasks", { method: "POST", body: JSON.stringify(task) }),
    updateTask: (task) => request(`/api/tasks/${task.id}`, { method: "PUT", body: JSON.stringify(task) }),
    deleteTask: (id) => request(`/api/tasks/${id}`, { method: "DELETE" }),

    fetchTransactions: () => request("/api/finance/transactions"),
    createTransaction: (transaction) =>
        request("/api/finance/transactions", { method: "POST", body: JSON.stringify(transaction) }),

    fetchInvestments: () => request("/api/finance/investments"),
    createInvestment: (investment) =>
        request("/api/finance/investments", { method: "POST", body: JSON.stringify(investment) }),
};
