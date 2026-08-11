/**
 * VEGAS VIGILÂNCIA E SEGURANÇA
 * Backend — Requisição de Materiais de Estoque
 *
 * COMO PUBLICAR:
 * 1. Abra script.google.com/home > Novo Projeto (ou vincule a uma planilha:
 *    Planilha Google > Extensões > Apps Script).
 * 2. Apague o conteúdo padrão do arquivo Code.gs e cole este arquivo inteiro.
 * 3. Rode a função "configurarInicial" uma vez (menu Executar > configurarInicial)
 *    para criar as abas "Catalogo" e "Solicitacoes" com um catálogo de exemplo.
 * 4. Implantar > Nova implantação > Tipo: App da Web.
 *    - Executar como: Eu
 *    - Quem pode acessar: Qualquer pessoa
 * 5. Copie a URL do App da Web gerada e cole em API_URL no arquivo index.html.
 *
 * Este sistema NÃO tem senha: qualquer pessoa com o link do index.html pode
 * consultar o catálogo, abrir uma requisição e ver o dashboard de aprovadas.
 * Apenas a aprovação em si exige nome + assinatura do diretor na hora do ato.
 */

var SHEET_CATALOGO = 'Catalogo';
var SHEET_SOLICITACOES = 'Solicitacoes';

var HEADERS_CATALOGO = ['codigo', 'categoria', 'produto', 'unidade', 'estoqueAtual', 'estoqueMinimo'];
var HEADERS_SOLICITACOES = [
  'id', 'numero', 'timestamp', 'data', 'solicitante', 'setor', 'local',
  'itensJSON', 'obs', 'status',
  'diretor', 'cargoDiretor', 'parecer', 'observacoesDiretor', 'dataAprovacao', 'assinatura'
];

var CATALOGO_EXEMPLO = [
  ['VG-001', 'Uniformes', 'Camisa social manga longa', 'UN', 42, 15],
  ['VG-002', 'Uniformes', 'Camisa social manga curta', 'UN', 38, 15],
  ['VG-003', 'Uniformes', 'Calça tática', 'UN', 30, 12],
  ['VG-004', 'Uniformes', 'Gandola tática', 'UN', 25, 10],
  ['VG-005', 'Uniformes', 'Boina padrão', 'UN', 18, 8],
  ['VG-006', 'Uniformes', 'Gorro balaclava', 'UN', 14, 6],
  ['VG-007', 'Uniformes', 'Colete tático (identificação)', 'UN', 20, 10],
  ['VG-008', 'Uniformes', 'Jaqueta impermeável', 'UN', 16, 8],
  ['VG-009', 'Uniformes', 'Bota coturno', 'PAR', 22, 10],
  ['VG-010', 'Uniformes', 'Cinto de guarnição', 'UN', 19, 8],
  ['VG-011', 'Uniformes', 'Luva de proteção', 'PAR', 35, 15],
  ['VG-012', 'Uniformes', 'Meia tática', 'PAR', 50, 20],
  ['VG-013', 'Comunicação', 'Rádio comunicador HT', 'UN', 12, 6],
  ['VG-014', 'Comunicação', 'Bateria para rádio HT', 'UN', 24, 10],
  ['VG-015', 'Comunicação', 'Carregador de bateria HT', 'UN', 10, 5],
  ['VG-016', 'Comunicação', 'Fone de ouvido tipo tubo', 'UN', 15, 6],
  ['VG-017', 'Comunicação', 'Clipe/presilha para rádio', 'UN', 20, 8],
  ['VG-018', 'Iluminação e Sinalização', 'Lanterna tática LED', 'UN', 18, 8],
  ['VG-019', 'Iluminação e Sinalização', 'Lanterna recarregável de mão', 'UN', 10, 5],
  ['VG-020', 'Iluminação e Sinalização', 'Cone de sinalização', 'UN', 14, 6],
  ['VG-021', 'Iluminação e Sinalização', 'Fita zebrada (rolo)', 'UN', 8, 4],
  ['VG-022', 'Iluminação e Sinalização', 'Colete refletivo', 'UN', 16, 8],
  ['VG-023', 'Proteção Individual (EPI)', 'Capa de chuva', 'UN', 20, 8],
  ['VG-024', 'Proteção Individual (EPI)', 'Máscara de proteção descartável', 'CX', 6, 3],
  ['VG-025', 'Proteção Individual (EPI)', 'Álcool em gel 500ml', 'UN', 30, 12],
  ['VG-026', 'Proteção Individual (EPI)', 'Kit de primeiros socorros', 'UN', 5, 3],
  ['VG-027', 'Proteção Individual (EPI)', 'Protetor auricular', 'PAR', 25, 10],
  ['VG-028', 'Equipamentos de Posto', 'Prancheta de acrílico', 'UN', 12, 5],
  ['VG-029', 'Equipamentos de Posto', 'Livro de ocorrência', 'UN', 9, 4],
  ['VG-030', 'Equipamentos de Posto', 'Caderneta de rondas', 'UN', 15, 6],
  ['VG-031', 'Equipamentos de Posto', 'Apito', 'UN', 22, 10],
  ['VG-032', 'Equipamentos de Posto', 'Detector de metais portátil', 'UN', 4, 2],
  ['VG-033', 'Equipamentos de Posto', 'Bastão retrátil (não letal)', 'UN', 8, 4],
  ['VG-034', 'Equipamentos de Posto', 'Algema plástica descartável', 'CX', 5, 2],
  ['VG-035', 'Escritório/Administrativo', 'Papel A4 (pacote 500fl)', 'PCT', 10, 4],
  ['VG-036', 'Escritório/Administrativo', 'Caneta esferográfica', 'CX', 8, 4],
  ['VG-037', 'Escritório/Administrativo', 'Carimbo "Recebido"', 'UN', 3, 2],
  ['VG-038', 'Escritório/Administrativo', 'Pasta arquivo A-Z', 'UN', 12, 5],
  ['VG-039', 'Escritório/Administrativo', 'Etiqueta de identificação (rolo)', 'UN', 6, 3]
];

// ---------- SETUP ----------

function configurarInicial() {
  var ss = getSpreadsheet_();

  var catSheet = ss.getSheetByName(SHEET_CATALOGO);
  if (!catSheet) {
    catSheet = ss.insertSheet(SHEET_CATALOGO);
    catSheet.appendRow(HEADERS_CATALOGO);
    catSheet.setFrozenRows(1);
    catSheet.getRange(2, 1, CATALOGO_EXEMPLO.length, HEADERS_CATALOGO.length).setValues(CATALOGO_EXEMPLO);
  } else {
    migrarCabecalho_(catSheet, HEADERS_CATALOGO);
  }

  var reqSheet = ss.getSheetByName(SHEET_SOLICITACOES);
  if (!reqSheet) {
    reqSheet = ss.insertSheet(SHEET_SOLICITACOES);
    reqSheet.appendRow(HEADERS_SOLICITACOES);
    reqSheet.setFrozenRows(1);
  } else {
    migrarCabecalho_(reqSheet, HEADERS_SOLICITACOES);
  }
  // Trava colunas de data/hora como TEXTO puro (evita conversão automática do
  // Sheets, que bagunça fuso horário e formatação ao ler de volta).
  reqSheet.getRange('C2:D1000').setNumberFormat('@');
  reqSheet.getRange('O2:O1000').setNumberFormat('@');

  var props = PropertiesService.getScriptProperties();
  var counter = props.getProperty('CONTADOR');
  if (!counter) props.setProperty('CONTADOR', '0');
}

function migrarCabecalho_(sheet, headers) {
  var lastCol = Math.max(sheet.getLastColumn(), headers.length);
  var headerRange = sheet.getRange(1, 1, 1, lastCol);
  var atuais = headerRange.getValues()[0];
  headers.forEach(function (h, i) {
    if (atuais[i] !== h) sheet.getRange(1, i + 1).setValue(h);
  });
}

function getSpreadsheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  var ss = SpreadsheetApp.create('Vegas - Requisicao de Materiais');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}

// ---------- ENTRY POINTS ----------

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'list';
  try {
    if (action === 'list') return respond_(listarTudo_());
    return respond_({ ok: false, error: 'Ação GET desconhecida.' });
  } catch (err) {
    return respond_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    switch (action) {
      case 'create': return respond_(criarSolicitacao_(data));
      case 'update': return respond_(editarSolicitacao_(data));
      case 'approve': return respond_(aprovarSolicitacao_(data));
      case 'delete': return respond_(excluirSolicitacao_(data));
      case 'updateEstoque': return respond_(atualizarEstoque_(data));
      default: return respond_({ ok: false, error: 'Ação POST desconhecida.' });
    }
  } catch (err) {
    return respond_({ ok: false, error: String(err) });
  }
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------- HELPERS ----------

function sheets_() {
  configurarInicial();
  var ss = getSpreadsheet_();
  return { cat: ss.getSheetByName(SHEET_CATALOGO), req: ss.getSheetByName(SHEET_SOLICITACOES) };
}

function proximoNumero_() {
  var props = PropertiesService.getScriptProperties();
  var atual = parseInt(props.getProperty('CONTADOR') || '0', 10) + 1;
  props.setProperty('CONTADOR', String(atual));
  return ('0000' + atual).slice(-4);
}

function catalogoParaObjetos_(sh) {
  var values = sh.getDataRange().getValues();
  var headers = values.shift();
  return values.filter(function(r){ return r[0]; }).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    obj.estoqueAtual = Number(obj.estoqueAtual) || 0;
    obj.estoqueMinimo = Number(obj.estoqueMinimo) || 0;
    return obj;
  });
}

function reqRowToObj_(row, headers) {
  var obj = {};
  headers.forEach(function (h, i) { obj[h] = row[i]; });
  try { obj.itens = obj.itensJSON ? JSON.parse(obj.itensJSON) : []; }
  catch (e) { obj.itens = []; }
  return obj;
}

function listarTudo_() {
  var sh = sheets_();
  var catalogo = catalogoParaObjetos_(sh.cat);

  var values = sh.req.getDataRange().getValues();
  var headers = values.shift();
  var solicitacoes = values.filter(function(r){ return r[0]; }).map(function (row) {
    return reqRowToObj_(row, headers);
  });

  return { ok: true, catalogo: catalogo, solicitacoes: solicitacoes };
}

function criarSolicitacao_(data) {
  var sh = sheets_().req;
  var id = Utilities.getUuid();
  var numero = proximoNumero_();
  var now = new Date();
  var newRow = sh.getLastRow() + 1;

  sh.getRange(newRow, 3, 1, 2).setNumberFormat('@'); // timestamp, data como texto

  sh.getRange(newRow, 1, 1, HEADERS_SOLICITACOES.length).setValues([[
    id,
    numero,
    now.toISOString(),
    data.data || '',
    data.solicitante || '',
    data.setor || '',
    data.local || '',
    JSON.stringify(data.itens || []),
    data.obs || '',
    'Pendente',
    '', '', '', '', '', ''
  ]]);
  return { ok: true, id: id, numero: numero };
}

function editarSolicitacao_(data) {
  var sh = sheets_().req;
  var row = findRow_(sh, data.id);
  if (row === -1) return { ok: false, error: 'Requisição não encontrada.' };

  var status = sh.getRange(row, 10).getValue(); // coluna 'status'
  if (status !== 'Pendente') {
    return { ok: false, error: 'Esta requisição já foi analisada e não pode mais ser editada.' };
  }

  sh.getRange(row, 4, 1, 1).setNumberFormat('@'); // 'data' como texto
  sh.getRange(row, 4, 1, 4).setValues([[
    data.data || '', data.solicitante || '', data.setor || '', data.local || ''
  ]]);
  sh.getRange(row, 8, 1, 1).setValue(JSON.stringify(data.itens || []));
  sh.getRange(row, 9).setValue(data.obs || '');
  return { ok: true };
}

function findRow_(sh, id) {
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === id) return i + 1;
  }
  return -1;
}

function aprovarSolicitacao_(data) {
  var sh = sheets_().req;
  var row = findRow_(sh, data.id);
  if (row === -1) return { ok: false, error: 'Requisição não encontrada.' };

  var now = new Date();
  sh.getRange(row, 15).setNumberFormat('@'); // dataAprovacao como texto
  sh.getRange(row, 10).setValue(data.parecer || 'Aprovado');       // status
  sh.getRange(row, 11).setValue(data.diretor || '');               // diretor
  sh.getRange(row, 12).setValue(data.cargoDiretor || '');          // cargoDiretor
  sh.getRange(row, 13).setValue(data.parecer || '');                // parecer
  sh.getRange(row, 14).setValue(data.observacoesDiretor || '');    // observacoesDiretor
  sh.getRange(row, 15).setValue(now.toISOString());                 // dataAprovacao
  sh.getRange(row, 16).setValue(data.assinatura || '');             // assinatura (dataURL base64)
  return { ok: true };
}

function excluirSolicitacao_(data) {
  var sh = sheets_().req;
  var row = findRow_(sh, data.id);
  if (row === -1) return { ok: false, error: 'Requisição não encontrada.' };
  sh.deleteRow(row);
  return { ok: true };
}

function atualizarEstoque_(data) {
  var sh = sheets_().cat;
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === data.codigo) {
      sh.getRange(i + 1, 5).setValue(Number(data.estoqueAtual) || 0); // coluna estoqueAtual
      return { ok: true };
    }
  }
  return { ok: false, error: 'Código não encontrado no catálogo.' };
}
