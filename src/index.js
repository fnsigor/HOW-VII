const express = require('express');
const endpoints = require('./routes')

// Inicializa o aplicativo Express
const app = express();

const port = 4001;

app.use(endpoints)

// INICIALIZA O SERVIDOR
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
