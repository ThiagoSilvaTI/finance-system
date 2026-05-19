const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database("./database.db");

// Criar tabela
db.run(`
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    category TEXT,
    description TEXT,
    amount REAL,
    date TEXT
)
`);

// Criar transação
app.post("/add", (req, res) => {
    const { type, category, description, amount, date } = req.body;

    db.run(
        "INSERT INTO transactions (type, category, description, amount, date) VALUES (?, ?, ?, ?, ?)",
        [type, category, description, amount, date],
        function (err) {
            if (err) return res.send(err);
            res.send({ id: this.lastID });
        }
    );
});

// Listar
app.get("/list", (req, res) => {
    db.all("SELECT * FROM transactions", [], (err, rows) => {
        if (err) return res.send(err);
        res.send(rows);
    });
});

// Relatório mensal
app.get("/report", (req, res) => {
    db.all(`
        SELECT 
            strftime('%m', date) as month,
            SUM(CASE WHEN type='receita' THEN amount ELSE 0 END) as receitas,
            SUM(CASE WHEN type='despesa' THEN amount ELSE 0 END) as despesas
        FROM transactions
        GROUP BY month
    `, [], (err, rows) => {
        if (err) return res.send(err);
        res.send(rows);
    });
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));