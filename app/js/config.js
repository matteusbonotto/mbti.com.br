// config.js

const config = {
    apiKey: "81320e314b0b58b8afe251da408e2e",
    apiUrl: "https://graphql.datocms.com/",
    headers: {
        'Authorization': "Bearer 81320e314b0b58b8afe251da408e2e",
        'Content-Type': 'application/json'
    }
};

// Exporta a configuração
export default config;

// Função para carregar o cabeçalho
export async function loadHeader() {
    const response = await fetch('./pages/header.html');
    const headerHTML = await response.text();
    document.getElementById('header-container').innerHTML = headerHTML;
}

// Função para carregar o cabeçalho
export async function loadHeaderExt() {
    const response = await fetch('../pages/header.html');
    const headerHTML = await response.text();
    document.getElementById('header-container-ext').innerHTML = headerHTML;
}