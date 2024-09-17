const { createConnection } = require('mysql2')

//Configurações de acesso ao banco de dados
const dbConfig = {
  port: 3306,
  credentials: {
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'how_vii'
  }
}

// Cria a conexão com o banco de dados MySQL
const dbConnection = createConnection(dbConfig.credentials);

dbConnection.connect(err => {

  if (err) {
    return console.error('Erro ao conectar ao banco de dados:', err);
  }

  console.log('Conectado ao banco de dados.');
});

module.exports = dbConnection
