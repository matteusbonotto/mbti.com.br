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
                allProfessionals {
                    id
                    title
                    subtitle
                    description
                    category
                    typecontract
                    start
                    end
                    inprogress
                    competence
                    picture {
                        url
                        alt
                    }
                }
                allAcademics {
                    id
                    title
                    subtitle
                    description
                    category
                    graduation
                    start
                    end
                    inprogress
                    picture {
                        url
                        alt
                    }
                    degree {
                        url
                        alt
                    }                        
                }
            }`
        })
    });
    const data = await response.json();

    const professionals = data.data.allProfessionals.map(item => ({
        title: item.title,
        subtitle: item.subtitle,
        typeContract: item.typecontract,
        start: new Date(new Date(item.start).setMonth(new Date(item.start).getMonth() + 1)), // Ajuste aqui
        end: item.inprogress ? new Date() : new Date(new Date(item.end).setMonth(new Date(item.end).getMonth() + 1)), // E aqui
        description: item.description,
        image: item.picture && item.picture.length > 0 ? item.picture[0].url : 'https://via.placeholder.com/50',
        competence: item.competence,
        career: item.category // Using category to define career type
    }));

    const academics = data.data.allAcademics.map(item => ({
        title: item.title,
        subtitle: item.subtitle,
        typeContract: item.graduation,
        start: new Date(new Date(item.start).setMonth(new Date(item.start).getMonth() + 1)),
        end: item.inprogress ? new Date() : new Date(new Date(item.end).setMonth(new Date(item.end).getMonth() + 1)),
        description: item.description,
        image: item.picture && item.picture.length > 0 ? item.picture[0].url : 'https://via.placeholder.com/50',
        degree: item.degree && item.degree.length > 0 ? item.degree[0].url : 'https://via.placeholder.com/50',
        career: item.category // Using category to define career type
    }));

    return [...professionals, ...academics]; // Combine both arrays
}

(async () => {
    const data = await fetchData();

    // Ordena os dados pela data de início
    data.sort((a, b) => a.start - b.start);

    const margin = { top: 20, right: 30, bottom: 30, left: 200 };
    const width = 1900 - margin.left - margin.right;
    const height = 820 - margin.top - margin.bottom;

    const svg = d3.select("#timeline")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain([new Date(2016, 0, 1), new Date()])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.title))
        .range([0, height])
        .padding(0.1);

    // Linhas do eixo Y
    svg.selectAll(".axis-line")
        .data(y.domain())
        .enter()
        .append("line")
        .attr("class", "axis-line")
        .attr("x1", 0) // Linha começando do início do eixo X
        .attr("x2", width) // Linha se estendendo até o fim do eixo X
        .attr("y1", d => y(d) + y.bandwidth() / 2)
        .attr("y2", d => y(d) + y.bandwidth() / 2);

    // Linhas do eixo X
    svg.append("line")
        .attr("class", "axis-line-x")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", height)
        .attr("y2", height);

    // Adicionando linhas verticais para cada ano do eixo X
    const years = x.ticks(d3.timeYear.every(1)); // Obtendo anos como dados
    svg.selectAll(".year-line")
        .data(years)
        .enter()
        .append("line")
        .attr("class", "year-line")
        .attr("x1", d => x(d)) // Posição X da linha vertical
        .attr("x2", d => x(d)) // Posição X da linha vertical
        .attr("y1", 0) // Começando do topo do gráfico
        .attr("y2", height) // Terminando na parte inferior do gráfico

    // Custom Y axis with images and titles
    const labels = svg.append("g").attr("class", "y-axis");
    const imageLabels = labels.selectAll(".image-title-container")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", d => `translate(-180, ${y(d.title) + y.bandwidth() / 2 - 30})`)
        .attr("class", "image-title-container");

    function wrapText(text, maxLineLength) {
        const words = text.split(" ");
        const lines = [];
        let currentLine = [];
        words.forEach(word => {
            const testLine = [...currentLine, word].join(" ");
            if (testLine.length > maxLineLength) {
                lines.push(currentLine.join(" "));
                currentLine = [word];
            } else {
                currentLine.push(word);
            }
        });
        lines.push(currentLine.join(" "));
        return lines;
    }

    // Adicionando o texto com suporte à quebra de linha
    imageLabels.append("text")
        .attr("x", 100)
        .attr("y", 32.5)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .each(function (d) {
            const maxLineLength = 15;
            const lines = wrapText(d.title, maxLineLength);
            lines.forEach((line, i) => {
                d3.select(this).append("tspan")
                    .attr("x", 100)
                    .attr("dy", i === 0 ? 0 : "1.2em")
                    .text(line);
            });
        });

    // Adicionando a imagem ao lado direito do título
    imageLabels.append("image")
        .attr("xlink:href", d => d.image)
        .attr("x", 110)
        .attr("width", 60)
        .attr("height", 60)
        .attr("clip-path", "circle(30px at 30px 30px)");

    // Tooltip setup
    const tooltip = d3.select("#tooltip");

    // Bars (timeline items)
    // Evento de clique para fixar o tooltip
    // .on("mouseover", function (event) {
    //     tooltip.transition()
    //       .duration(200)
    //       .style("opacity", .8);
    //     tooltip.html(`Título: ${d.title}<br>Descrição: ${d.description}<br>QA: ${d.qa}<br>Data de Início: ${d.startDate.toLocaleDateString()}<br>Data de Fim: ${d.endDate.toLocaleDateString()}`)
    //       .style("left", (event.pageX + 5) + "px")
    //       .style("top", (event.pageY - 28) + "px");
    //   })
    //   .on("mousemove", function (event) {
    //     tooltip.style("left", (event.pageX + 5) + "px")
    //       .style("top", (event.pageY - 28) + "px");
    //   })
    //   .on("mouseout", function () {
    //     tooltip.transition()
    //       .duration(500)
    //       .style("opacity", 0);
    //   });

    svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.start))
    .attr("y", d => y(d.title))
    .attr("width", d => {
        const endDate = d.end != null ? new Date(d.end) : new Date();
        return x(endDate) - x(new Date(d.start));
    })
    .attr("height", y.bandwidth() * 1)
    .attr("fill", d => d.career === 'professional' ? 'rgb(168, 0, 168)' : 'orange')
    .on("click", (event, d) => {
        // Your existing tooltip positioning logic
        const tooltipWidth = tooltip.node().offsetWidth;
        const tooltipHeight = tooltip.node().offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const clickX = event.pageX;
        const clickY = event.pageY;

        let tooltipX = clickX + 10;
        let tooltipY = clickY + 10;

        if (clickX + tooltipWidth + 10 > windowWidth) {
            tooltipX = clickX - tooltipWidth - 10;
        }

        if (clickY + tooltipHeight + 10 > windowHeight) {
            tooltipY = clickY - tooltipHeight - 10;
        }
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.95);
            tooltip.html(`
<div class="tooltip-content">
    <img src="${d.image}" alt="${d.title}" class="rounded-circle me-3" width="50" height="50">
    <div>
        <h5>${d.title}</h5>
        <p><strong>${d.subtitle}</strong> - ${d.typeContract}</p>
        <p>${formatDate(d.start)} - ${d.end == null || new Date(d.end).toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR') ? 'Atualmente' : formatDate(d.end)}</p>
        <p>${d.description}</p>
        ${d.career === 'academic' && d.degree ? `<img class="degree" src="${d.degree}" alt="${d.title}">` : ''}
    </div>
</div>
            `);
            

        tooltip.style("visibility", "visible")
            .style("top", tooltipY + "px")
            .style("left", tooltipX + "px");
    })
    .on("mouseout", function () {
        tooltip.transition()
            .duration(3000)
            .style("opacity", 0);
    });



    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0'); // Obtém o dia e garante que tenha dois dígitos
        const month = date.toLocaleString('pt-BR', { month: 'short' }); // Obtém o mês abreviado
        const year = String(date.getFullYear()).slice(-2); // Obtém os últimos dois dígitos do ano

        return `${month}/${year}`; // Formato: dd/mmm/yy
    }


    // Adiciona texto sobre as barras
    svg.selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => x(new Date(d.start)) + 5) // Posição no eixo X (com um deslocamento para dentro da barra)
        .attr("y", d => y(d.title) + 45) // Posição no eixo Y (ajustado para o centro da barra)
        .text(d => formatDate(d.start) + " - " + formatDate(d.end) + " " + d.subtitle)
        .attr("fill", "white") // Cor do texto
        .attr("font-size", "12px"); // Tamanho da fonte

    // Adicionando o eixo X
    const xAxis = d3.axisBottom(x).ticks(d3.timeYear.every(1));
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "16px")
        .style("font-family", "Arial")
        .style("fill", "black");

})();