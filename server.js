const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

const app = express();

const port = 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database('dados.db', (err) => {
    if (err) {
      console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
      console.log('Banco de dados conectado');
      // Crie a tabela se ela não existir
      db.run(`CREATE TABLE IF NOT EXISTS dados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temperatura REAL,
        umidade REAL,
        luminosidade INTEGER,
        solo TEXT
      )`, (err) => {
        if (err) {
          console.error('Erro ao criar tabela:', err.message);
        } else {
          console.log('Tabela criada com sucesso');
        }
      });
    }
  });
  

app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
