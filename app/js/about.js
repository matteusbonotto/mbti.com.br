//<div id="about-container"></div>

document.addEventListener('DOMContentLoaded', async () => {
    const apiToken = '81320e314b0b58b8afe251da408e2e'; // Substitua com seu token da API
    const query = `
    {
      allAbouts {
        perfil {
          url
          alt
          title
        }
        id
        name
        surname
        description
        birthday
        cnpj
        hobbie
        _status
        _firstPublishedAt
      }

      _allAboutsMeta {
        count
      }
    }`;

    try {
        const response = await fetch('https://graphql.datocms.com/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`
            },
            body: JSON.stringify({ query })
        });

        const json = await response.json();
        const abouts = json.data.allAbouts;
        const aboutContainer = document.getElementById('about-container');

        if (abouts.length === 0) {
            aboutContainer.innerHTML = '<p>No data found.</p>';
        } else {
            abouts.forEach(about => {
                const aboutCard = document.createElement('div');
                aboutCard.classList.add('about-card');

                const paragrafos = about.description
                    .split('. ')
                    .filter(sentence => sentence.trim() !== '') // Remove frases vazias
                    .map(sentence => sentence.trim() + '.') // Remove espaços extras e adiciona ponto no final
                    .join(' '); // Junta tudo em uma string

                function calcularIdade(dataNascimento) {
                    const hoje = new Date();
                    const nascimento = new Date(dataNascimento);
                    let idade = hoje.getFullYear() - nascimento.getFullYear();
                    const mes = hoje.getMonth() - nascimento.getMonth();

                    // Ajusta a idade se o aniversário ainda não tiver ocorrido este ano
                    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
                        idade--;
                    }

                    return idade;
                }

                // Criando o card
                aboutCard.innerHTML = `
                <div class="card shadow border-0 rounded-4 mb-5">
                    <div class="card-body">
                        <div class="row align-items-center gx-5">
                            <div class="col text-center text-lg-start mb-4 mb-lg-0">
                                <div class="bg-light p-4 rounded-4">
                                    <!-- Imagem no topo à esquerda -->
                                    <img src="https://www.datocms-assets.com/142030/1727497496-7-1.png" alt="Imagem" class="mb-3 about-image";" />
                                    <div class="fw-bolder mb-1">CNPJ: ${about.cnpj}</div>
                                    <!-- Exibe a data de nascimento e a idade -->
                                    <div class="small fw-bolder">Nascimento: ${about.birthday.split('-').reverse().join('/')} (${calcularIdade(about.birthday)} anos)</div>
                                </div>
                            </div>
                            <div class="col-lg-8">
                                <!-- Parágrafos iniciais visíveis -->
                                <div id="paragrafos-iniciais-${about.id}">
                                    ${paragrafos.split('. ').slice(0, 3).map(p => `<p>${p}.</p>`).join('')}
                                </div>
                                <!-- Parágrafos ocultos -->
                                <div id="texto-oculto-${about.id}" style="display: none;">
                                    ${paragrafos.split('. ').slice(3).map(p => `<p>${p}.</p>`).join('')}
                                </div>
                                <!-- Botão para alternar entre ver mais/ver menos -->
                                <button class="btn btn-link p-0" id="toggleButton-${about.id}" onclick="toggleTexto('${about.id}')">Ver mais</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            aboutContainer.appendChild(aboutCard);

                aboutContainer.appendChild(aboutCard);

            });
        }

        // Função para alternar entre "Ver mais" e "Ver menos"
        // Função para alternar entre "Ver mais" e "Ver menos"
        window.toggleTexto = function (id) {
            const textoOculto = document.getElementById(`texto-oculto-${id}`);
            const toggleButton = document.getElementById(`toggleButton-${id}`);
            const paragrafosIniciais = document.getElementById(`paragrafos-iniciais-${id}`);

            // Verificação se os elementos existem antes de manipulá-los
            if (textoOculto && toggleButton && paragrafosIniciais) {
                if (textoOculto.style.display === 'none') {
                    textoOculto.style.display = 'inline';
                    toggleButton.textContent = 'Ver menos';
                    paragrafosIniciais.style.display = 'inline'; // Mostra o texto inicial junto
                } else {
                    textoOculto.style.display = 'none';
                    toggleButton.textContent = 'Ver mais';
                    paragrafosIniciais.style.display = 'inline'; // Garante que o texto inicial continue visível
                }
            } else {
                console.error('Elementos não encontrados para o id:', id);
            }
        };

    } catch (error) {
        console.error('Error fetching data:', error);
    }
});