const apiKey = "81320e314b0b58b8afe251da408e2e";
const apiUrl = "https://graphql.datocms.com/";

async function fetchData() {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `{
                allProjects {
                    id
                    title
                    description
                    category
                    url
                    image {
                        url
                        alt
                    }
                }
            }`
        })
    });
    const data = await response.json();

    // Mapeia os dados recebidos
    return data.data.allProjects.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        url: item.url,
        image: item.image && item.image.length > 0 ? item.image[0].url : 'https://via.placeholder.com/300x400',
        imageAlt: item.image && item.image.alt ? item.image.alt : 'Imagem de projeto'
    }));
}

async function renderProjects() {
    const projectsContainer = document.getElementById('projects-container');
    const projects = await fetchData();

    // Cria o HTML para cada projeto
    const projectCards = projects.map(project => `
        <div class="card overflow-hidden shadow rounded-4 border-0 mb-5">
            <div class="card-body p-0">
                <div class="d-flex align-items-center">
                    <div class="p-5">
                        <h2 class="fw-bolder">${project.title}</h2>
                        <p>${project.description}</p>
                        <p><strong>Categoria:</strong> ${project.category}</p>
                        <a href="${project.url}" class="btn btn-primary">Ver Projeto</a>
                    </div>
                    <img class="img-fluid" src="${project.image}" alt="${project.imageAlt}" />
                </div>
            </div>
        </div>
    `).join('');

    // Insere os cards dos projetos no container
    projectsContainer.innerHTML = projectCards;
}

// Chama a função para renderizar os projetos quando a página carregar
document.addEventListener('DOMContentLoaded', renderProjects);