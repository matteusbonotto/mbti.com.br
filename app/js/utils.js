// utils.js

export async function fetchData(query) {
    const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify({ query })
    });
    return response.json();
}

export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
