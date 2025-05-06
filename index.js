// const express = require("express")
// const bp = require("body-parser")
// const cors = require("cors")
// const Database = require("better-sqlite3");

// const path = require("path")

// const app = express()
// const db = new Database("banco.db");

// // const db = new sqlite3.Database("./db.sqlite")
// var PORT = 3000

// app.use(cors())
// app.use(bp.urlencoded())
// app.use(bp.json())
// app.use(express.static(path.join(__dirname, 'public')))

// app.listen(PORT, () => {
//     console.log("Servidor aberto na porta " + PORT)
// })
// db.serialize(() => {
//     db.run(`
//         CREATE TABLE IF NOT EXISTS Quiz(
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             pergunta text,
//             resposta1 text,
//             resposta2 text,
//             resposta3 text,
//             resposta4 text,
//             respostaCorreta text
//         );
        
//         `)
// })
// db.get("SELECT COUNT(*) as count FROM Quiz", (err, row) => {
//     if (row.count === 0) {
//         db.run(`
//             INSERT INTO Quiz( pergunta, resposta1, resposta2, resposta3, resposta4, respostaCorreta)
//             VALUES (?, ?, ?, ?, ?,?)`,
//             [
//                 "Qual o Time Brasileiro com mais títulos do Campeonato Mundial de Clubes?",
//                 "São Paulo", "Santos", "Corinthians", "Grêmio", "São Paulo"
//             ]
//         )
//     }
// })


// app.get("/perguntas", (req, res) => {
//     db.all(`SELECT *FROM Quiz`, [], (err, rows) => {
//         res.json(rows)
//         console.log(" aberto na porta " + PORT)
//     })
// })

// app.post("/pergunta", (req, res) => {
//     db.run(`
//             INSERT INTO Quiz( pergunta, resposta1, resposta2, resposta3, resposta4, respostaCorreta)
//             VALUES (?, ?, ?, ?, ?,?)`,
//         [req.body.pergunta, req.body.resposta1,
//         req.body.resposta2, req.body.resposta3,
//         req.body.resposta4, req.body.respostaCorreta
//         ],
//         function (err) {
//             if (err) {
//                 return res.status(500).json({ error: err.message });
//             }
//             res.status(200).json({ message: "Tarefa adicionada com sucesso!" })
//         })
// })

// app.delete("/pergunta/:index", (req,res)=>{
//     const id = req.params.id;
//     db.run(`DELETE FROM Quiz WHERE id = ?`, [id], function (err) {
//         if (err) {
//             res.status(500).send("Erro ao excluir pergunta.");
//         } else {
//             res.status(200).send("Pergunta excluída com sucesso.");
//         }
//     });
// })



const express = require("express");
const bp = require("body-parser");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const db = new Database("banco.db");

const PORT = 3000;

app.use(cors());
app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cria tabela se não existir
db.prepare(`
    CREATE TABLE IF NOT EXISTS Quiz(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pergunta TEXT,
        resposta1 TEXT,
        resposta2 TEXT,
        resposta3 TEXT,
        resposta4 TEXT,
        respostaCorreta TEXT
    );
`).run();

// Insere pergunta inicial se o banco estiver vazio
const count = db.prepare("SELECT COUNT(*) as count FROM Quiz").get().count;
if (count === 0) {
    db.prepare(`
        INSERT INTO Quiz(pergunta, resposta1, resposta2, resposta3, resposta4, respostaCorreta)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        "Qual o Time Brasileiro com mais títulos do Campeonato Mundial de Clubes?",
        "São Paulo", "Santos", "Corinthians", "Grêmio", "São Paulo"
    );
}

// Endpoints

app.get("/perguntas", (req, res) => {
    const perguntas = db.prepare("SELECT * FROM Quiz").all();
    res.json(perguntas);
});

app.post("/pergunta", (req, res) => {
    try {
        db.prepare(`
            INSERT INTO Quiz(pergunta, resposta1, resposta2, resposta3, resposta4, respostaCorreta)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            req.body.pergunta,
            req.body.resposta1,
            req.body.resposta2,
            req.body.resposta3,
            req.body.resposta4,
            req.body.respostaCorreta
        );
        res.status(200).json({ message: "Pergunta adicionada com sucesso!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/pergunta/:index", (req, res) => {
    const id = req.params.index; // Corrigido: era `req.params.id`
    const result = db.prepare("DELETE FROM Quiz WHERE id = ?").run(id);
    if (result.changes > 0) {
        res.status(200).send("Pergunta excluída com sucesso.");
    } else {
        res.status(404).send("Pergunta não encontrada.");
    }
});

app.listen(PORT, () => {
    console.log("Servidor aberto na porta " + PORT);
});
