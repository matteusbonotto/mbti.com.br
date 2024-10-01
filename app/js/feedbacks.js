const apiKey = "81320e314b0b58b8afe251da408e2e";
const apiUrl = "https://graphql.datocms.com/";

async function fetchFeedbacks() {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `{
                allFeedbacks {
                    perfil {
                        url
                        alt
                        title
                    }
                    id
                    name
                    occupation
                    description
                    date
                }
            }`
        })
    });
    const data = await response.json();

    // Mapeia os dados recebidos
    return data.data.allFeedbacks.map(item => ({
        id: item.id,
        name: item.name,
        occupation: item.occupation,
        description: item.description,
        date: new Date(item.date).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }), // Formata a data
        perfil: item.perfil ? item.perfil.url : 'https://via.placeholder.com/50' // Verifica se a imagem de perfil existe, senão usa placeholder
    }));
}

async function renderFeedbacks() {
    const feedbacksContainer = document.getElementById('feedbacks-container');
    const feedbacks = await fetchFeedbacks();

    // Cria o HTML para cada feedback no formato de item de carrossel
    const feedbackItems = feedbacks.map((feedback, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <div class="d-flex flex-column align-items-center justify-content-center">
                <div class="card shadow border-1 rounded-4 mb-5 p-4">
                    <div class="d-flex align-items-center mb-3">
                        <img src="${feedback.perfil}" alt="${feedback.name}" class="rounded-circle me-3" width="50" height="50">
                        <div>
                            <h5 class="fw-bolder mb-0">${feedback.name}</h5>
                            <p class="text-muted mb-0">${feedback.occupation}</p>
                            <small class="text-muted">Enviado em ${feedback.date}</small>
                        </div>
                    </div>
                    <p class="mt-2">"${feedback.description}"</p>
                </div>
            </div>
        </div>
    `).join('');

    // Insere os itens do carrossel no container
    feedbacksContainer.innerHTML = feedbackItems;
}

// Chama a função para renderizar os feedbacks quando a página carregar
document.addEventListener('DOMContentLoaded', renderFeedbacks);
