const { Router } = require("express");
const database = require("./dbConfig");


const router = Router()

// Configura o formato de moeda para BRL
const formatarValor = valor => {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return formatter.format(valor)
}


router.get('/', (req, res) => {
  const query = `
    SELECT p.id_venda, p.data_pagamento, p.valor_pagamento, i.id_imovel, i.descricao AS descricao_imovel, t.descricao AS tipo_imovel
    FROM Pagamento p
    JOIN Imovel i ON p.id_imovel = i.id_imovel
    JOIN TipoImovel t ON i.id_tipo = t.id_tipo;
  `;

  database.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).send('Erro ao executar a consulta');
      return;
    }

    const pagamentos = results.map(d => ({
      idVenda: d.id_venda,
      dataPagamento: new Date(d.data_pagamento).toLocaleDateString(),
      valorPagamento: Number(d.valor_pagamento),
      idImovel: d.id_imovel,
      descricaoImovel: d.descricao_imovel,
      tipoImovel: d.tipo_imovel
    }));

    const pagamentosFiltrados = pagamentos.filter(p => p.valorPagamento > 3000);
    const valorTotal = pagamentos.reduce((total, p) => total + p.valorPagamento, 0);

    res.json({
      valorTotal: formatarValor(valorTotal),
      pagamentosFiltrados
    });
  });
});

// Soma dos pagamentos por imóvel
router.get('/somaPagamentosPorImovel', (req, res) => {
  const query = `
    SELECT i.id_imovel, SUM(p.valor_pagamento) AS soma_valor
    FROM Pagamento p
    JOIN Imovel i ON p.id_imovel = i.id_imovel
    GROUP BY i.id_imovel;
  `;

  database.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao executar a consulta /somaPagamentosPorImovel:', err);
      res.status(500).send('Erro ao executar a consulta');
      return;
    }

    const somaPagamentosFormatada = results.map(row => ({
      idImovel: row.id_imovel,
      somaValor: formatarValor(row.soma_valor)
    }));

    res.json(somaPagamentosFormatada);
  });
});

// Vendas por mês e ano
router.get('/vendasPorMesAno', (req, res) => {
  const query = `
    SELECT DATE_FORMAT(p.data_pagamento, '%m/%Y') AS mes_ano, SUM(p.valor_pagamento) AS total_vendas
    FROM Pagamento p
    GROUP BY DATE_FORMAT(p.data_pagamento, '%m/%Y');
  `;

  database.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao executar a consulta /vendasPorMesAno:', err);
      res.status(500).send('Erro ao executar a consulta');
      return;
    }

    const vendasPorMesAnoFormatada = results.map(row => ({
      mesAno: row.mes_ano,
      totalVendas: formatarValor(row.total_vendas)
    }));

    res.json(vendasPorMesAnoFormatada);
  });
});

// Percentual de vendas por tipo de imóvel
router.get('/percentualPorTipoImovel', (req, res) => {
  const query = `
    SELECT t.descricao AS tipo_imovel, SUM(p.valor_pagamento) AS total_vendas
    FROM Pagamento p
    JOIN Imovel i ON p.id_imovel = i.id_imovel
    JOIN TipoImovel t ON i.id_tipo = t.id_tipo
    GROUP BY t.descricao;
  `;

  database.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao executar a consulta /percentualPorTipoImovel:', err);
      res.status(500).send('Erro ao executar a consulta');
      return;
    }

    // Calcula o total geral
    const totalVendasGeral = results.reduce((acc, row) => acc + parseFloat(row.total_vendas), 0);

    // Evita divisão por zero
    if (totalVendasGeral === 0) {
      return res.json([]);
    }

    // Calcula o percentual
    const percentualPorTipo = results.map(row => {
      const percentual = ((parseFloat(row.total_vendas) / totalVendasGeral) * 100).toFixed(2);
      return {
        tipoImovel: row.tipo_imovel,
        percentual: `${percentual} %`
      };
    });

    res.json(percentualPorTipo);
  });
});



module.exports = router