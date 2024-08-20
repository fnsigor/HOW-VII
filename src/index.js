const express = require('express');
const mysql = require('mysql2');
const dbConfig = require('./dbConfig');

const app = express();
const port = 4001;

const connection = mysql.createConnection(dbConfig.credentials);



const formatarValor = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados.');
});

app.get('/dados', (req, res) => {
  const query = `
    SELECT p.id_venda, p.data_pagamento, p.valor_pagamento, i.id_imovel, i.descricao AS descricao_imovel, t.descricao AS tipo_imovel
    FROM Pagamento p
    JOIN Imovel i ON p.id_imovel = i.id_imovel
    JOIN TipoImovel t ON i.id_tipo = t.id_tipo;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).send('Erro ao executar a consulta');
      return;
    }



    // Processamento funcional dos dados
    const pagamentos = results.map(d => ({
      idVenda: d.id_venda,
      dataPagamento: new Date(d.data_pagamento).toLocaleDateString(),
      valorPagamento: Number(d.valor_pagamento),
      idImovel: d.id_imovel,
      descricaoImovel: d.descricao_imovel,
      tipoImovel: d.tipo_imovel
    }));

    // Exemplo de uso de map, filter, reduce
    const pagamentosFiltrados = pagamentos.filter(p => p.valorPagamento > 3000);
    const valorTotal = formatarValor.format(pagamentos.reduce((total, p) => total + p.valorPagamento, 0));

    res.json({
      valorTotal,
      pagamentosFiltrados
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});