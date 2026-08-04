// Troque esta URL pela URL pública do backend depois do deploy no Railway.
const API_BASE_URL = "http://localhost:8080";

const button = document.getElementById("check-health-btn");
const resultBox = document.getElementById("health-result");

button.addEventListener("click", async () => {
    resultBox.textContent = "Consultando...";

    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);

        if (!response.ok) {
            throw new Error(`O backend respondeu com status ${response.status}`);
        }

        const data = await response.json();
        resultBox.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        resultBox.textContent = `Falha ao conectar com o backend: ${error.message}`;
    }
});
