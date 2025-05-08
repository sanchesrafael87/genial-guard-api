require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

const MensagemSchema = new mongoose.Schema({
  codigo: String,
  advogado: String,
  cliente: String,
  mensagem: String,
  lida: { type: Boolean, default: false },
  dataEnvio: { type: Date, default: Date.now },
  dataLeitura: Date
});

const Mensagem = mongoose.model('Mensagem', MensagemSchema);

function gerarCodigo() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = 'g';
  for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

app.post('/mensagem', async (req, res) => {
  const { advogado, cliente, mensagem } = req.body;
  const novaMensagem = new Mensagem({
    codigo: gerarCodigo(),
    advogado,
    cliente,
    mensagem
  });
  await novaMensagem.save();
  res.status(201).json(novaMensagem);
});

app.get('/mensagem/:codigo', async (req, res) => {
  const msg = await Mensagem.findOne({ codigo: req.params.codigo });
  if (!msg) return res.status(404).json({ erro: 'Mensagem não encontrada' });
  res.json(msg);
});

app.patch('/mensagem/:codigo/abrir', async (req, res) => {
  const msg = await Mensagem.findOneAndUpdate(
    { codigo: req.params.codigo },
    { lida: true, dataLeitura: new Date() },
    { new: true }
  );
  if (!msg) return res.status(404).json({ erro: 'Mensagem não encontrada' });
  res.json(msg);
});
app.get('/status', (req, res) => {
  res.json({ status: 'ok' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
