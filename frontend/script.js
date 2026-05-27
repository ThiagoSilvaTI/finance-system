const API = "http://localhost:3000";
let chart;

const form = document.getElementById("form");
const type = document.getElementById("type");
const category = document.getElementById("category");
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const date = document.getElementById("date");
const listContainer = document.getElementById("list");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (!category.value || !description.value || !amount.value || !date.value) {
        alert("Preencha todos os campos!");
        return;
    }

    const data = {
        type: type.value,
        category: category.value,
        description: description.value,
        amount: parseFloat(amount.value),
        date: date.value
    };

    try {
        const response = await fetch(API + "/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            form.reset();
            date.value = new Date().toISOString().split('T')[0];
            loadData();
        }
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar transação! Verifique se o servidor está rodando.");
    }
});

async function loadData() {
    try {
        const response = await fetch(API + "/list");
        const transactions = await response.json();
        
        updateTransactionsList(transactions);
        updateSummaryCards(transactions);
        loadChart();
        updateTotalTransactions(transactions.length);
        
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        listContainer.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4L20 20M20 4L4 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <p>Erro ao conectar com o servidor!</p>
                <small>Verifique se o backend está rodando na porta 3000</small>
            </div>
        `;
    }
}

function updateTransactionsList(transactions) {
    if (!transactions || transactions.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 12V8H4V12M20 12L22 18H2L4 12M20 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <rect x="6" y="8" width="12" height="4" stroke="currentColor" stroke-width="2"/>
                </svg>
                <p>Nenhuma transação encontrada</p>
                <small>Adicione sua primeira transação!</small>
            </div>
        `;
        return;
    }

    const reversedTransactions = [...transactions].reverse();
    
    listContainer.innerHTML = reversedTransactions.map(t => `
        <div class="transaction-item ${t.type === 'receita' ? 'revenue' : 'expense'}">
            <div class="transaction-info">
                <div class="transaction-category">
                    <svg class="${t.type === 'receita' ? 'revenue' : 'expense'}" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        ${t.type === 'receita' 
                            ? '<path d="M12 5V19M12 5L8 9M12 5L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
                            : '<path d="M12 19V5M12 19L8 15M12 19L16 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
                        }
                    </svg>
                    ${t.category}
                </div>
                <div class="transaction-description">
                    ${t.description}
                    <span class="transaction-date">${formatDate(t.date)}</span>
                </div>
            </div>
            <div class="transaction-amount ${t.type === 'receita' ? 'revenue' : 'expense'}">
                ${formatCurrency(t.amount)}
            </div>
        </div>
    `).join('');
}

function updateSummaryCards(transactions) {
    const totalRevenue = transactions
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const netBalance = totalRevenue - totalExpenses;
    
    document.getElementById("totalRevenue").innerHTML = formatCurrency(totalRevenue);
    document.getElementById("totalExpenses").innerHTML = formatCurrency(totalExpenses);
    document.getElementById("netBalance").innerHTML = formatCurrency(netBalance);
}

function updateTotalTransactions(count) {
    document.getElementById("totalTransactions").innerText = count;
}

async function loadChart() {
    try {
        const response = await fetch(API + "/report");
        const data = await response.json();
        
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        const monthlyData = {};
        data.forEach(item => {
            const monthIndex = parseInt(item.month) - 1;
            monthlyData[monthIndex] = {
                receitas: item.receitas || 0,
                despesas: item.despesas || 0
            };
        });
        
        const labels = months;
        const receitas = months.map((_, i) => monthlyData[i]?.receitas || 0);
        const despesas = months.map((_, i) => monthlyData[i]?.despesas || 0);
        
        if (chart) chart.destroy();
        
        const ctx = document.getElementById("chart").getContext("2d");
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: receitas,
                        borderColor: '#00ffc8',
                        backgroundColor: 'rgba(0, 255, 200, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#00ffc8',
                        pointBorderColor: '#0a0a2a',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        label: 'Despesas',
                        data: despesas,
                        borderColor: '#ff4757',
                        backgroundColor: 'rgba(255, 71, 87, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#ff4757',
                        pointBorderColor: '#0a0a2a',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            usePointStyle: true,
                            boxWidth: 10
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#00ffc8',
                        bodyColor: '#ffffff',
                        borderColor: '#00ffc8',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#8899bb',
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#8899bb'
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error("Erro ao carregar gráfico:", error);
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

document.getElementById("date").valueAsDate = new Date();
loadData();
setInterval(loadData, 30000);