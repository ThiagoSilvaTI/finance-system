const API = "http://localhost:3000";

let chart;

document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        type: type.value,
        category: category.value,
        description: description.value,
        amount: amount.value,
        date: date.value
    };

    await fetch(API + "/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    loadData();
});

async function loadData() {
    const res = await fetch(API + "/list");
    const data = await res.json();

    list.innerHTML = "";

    data.reverse().forEach(t => {
        list.innerHTML += `
        <li>
            <span>${t.category} - ${t.description}</span>
            <strong style="color:${t.type === 'receita' ? '#00ff99' : '#ff4d4d'}">
                R$${t.amount}
            </strong>
        </li>`;
    });

    loadChart();
}

async function loadChart() {
    const res = await fetch(API + "/report");
    const data = await res.json();

    const labels = data.map(d => "Mês " + d.month);
    const receitas = data.map(d => d.receitas);
    const despesas = data.map(d => d.despesas);

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("chart"), {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Vendas",
                    data: receitas,
                    borderColor: "#00ff99",
                    fill: false
                },
                {
                    label: "Gastos",
                    data: despesas,
                    borderColor: "#ff4d4d",
                    fill: false
                }
            ]
        }
    });
}

loadData();