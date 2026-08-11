# Vegas · Requisição de Materiais — Configuração

Sistema com 2 partes, igual ao seu projeto de Aprovação de Manutenção:
- **index.html** — a tela (catálogo + formulário de requisição + dashboard). Abra localmente com Live Server ou publique no GitHub Pages/Netlify.
- **Code.gs** — o backend (Google Apps Script), que grava tudo em duas abas de uma planilha Google: **Catalogo** e **Solicitacoes**.

**Diferença importante deste projeto:** não tem senha em lugar nenhum. Qualquer pessoa com o link do `index.html` consegue ver o catálogo, abrir uma requisição e ver o dashboard de requisições já analisadas. A única barreira é o próprio ato de aprovar, que exige nome, cargo e assinatura desenhada na hora pelo diretor.

## 1. Publicar o backend (Code.gs)

1. Acesse [script.google.com](https://script.google.com) → **Novo projeto**
   (ou, se preferir vincular a uma planilha específica: abra a planilha → **Extensões → Apps Script**).
2. Apague o conteúdo do arquivo `Code.gs` que abrir e cole o conteúdo do arquivo `Code.gs` deste pacote.
3. No topo do editor, no seletor de funções, escolha `configurarInicial` e clique em **Executar** (▶). Na primeira execução o Google vai pedir autorização — aceite.
   - Isso cria a aba **Catalogo** já preenchida com os 39 produtos de exemplo, e a aba **Solicitacoes** vazia com os cabeçalhos certos.
4. **Implantar → Nova implantação**:
   - Tipo: **App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Copie a **URL do App da Web** gerada (termina em `/exec`).

### Editar o catálogo depois de publicado
Você pode editar os produtos, categorias e quantidades diretamente na aba **Catalogo** da planilha a qualquer momento — o site sempre lê os dados atualizados. O estoque atual também pode ser editado pela própria tela (aba Catálogo do site), sem precisar abrir a planilha.

## 2. Configurar o index.html

1. Abra `index.html` num editor de texto.
2. Procure a linha:
   ```javascript
   const API_URL = "COLE_AQUI_A_URL_DO_APP_DA_WEB";
   ```
3. Substitua pelo link que você copiou no passo 1.5 (termina em `/exec`).
4. Mantenha a pasta `assets/logovegas.png` no mesmo diretório do `index.html` — o cabeçalho usa esse caminho relativo.

## 3. Publicar a tela

Igual ao seu outro projeto: pode rodar local com Live Server para testar, e depois subir para GitHub Pages ou Netlify. É só garantir que a pasta `assets/` vá junto.

## Como o fluxo funciona

1. **Qualquer pessoa** com o link abre a aba "Requisições", clica em **+ Nova Requisição**, escolhe os produtos do catálogo com quantidade e observação, e envia. Isso vai direto para a planilha com status `Pendente`.
2. A requisição aparece na lista **"Aguardando Aprovação"**, visível a todos.
3. Um diretor clica em **Analisar / Aprovar**, informa nome, cargo, parecer (Aprovado / Aprovado Parcialmente / Reprovado), desenha a assinatura na tela e confirma.
4. Ao confirmar, o registro sai da lista de pendentes e passa para o **Dashboard**, com nome do diretor, parecer, data/hora e a assinatura.
5. No Dashboard é possível **exportar a requisição em PDF** (com todos os itens e a assinatura) e **excluir definitivamente** o registro quando não for mais necessário.
6. Na aba **Catálogo**, qualquer pessoa vê o estoque atual x mínimo de cada item (com selo ✔ OK / ⚠ Repor) e pode atualizar a quantidade em estoque diretamente ali.

## Estrutura da planilha

### Aba "Catalogo"
| Coluna | Conteúdo |
|---|---|
| codigo | Código do produto (ex.: VG-013) |
| categoria | Categoria (Uniformes, Comunicação, etc.) |
| produto | Nome do produto |
| unidade | UN, PAR, CX, PCT... |
| estoqueAtual | Quantidade em estoque agora |
| estoqueMinimo | Nível mínimo antes de precisar repor |

### Aba "Solicitacoes"
| Coluna | Conteúdo |
|---|---|
| id | identificador único (uuid) |
| numero | Nº sequencial da requisição (0001, 0002...) |
| timestamp | data/hora de criação |
| data, solicitante, setor, local | campos do formulário |
| itensJSON | lista de itens pedidos (código, produto, quantidade, observação) em JSON |
| obs | observações gerais |
| status | `Pendente`, `Aprovado`, `Aprovado Parcialmente` ou `Reprovado` |
| diretor, cargoDiretor, parecer, observacoesDiretor, dataAprovacao, assinatura | preenchidos apenas na análise (assinatura em base64) |

Se quiser trocar o número inicial da contagem ou resetar, edite a propriedade `CONTADOR` em **Configurações do projeto → Propriedades do script**, dentro do editor do Apps Script.

## Quer adicionar uma senha só para aprovar/excluir?

Este pacote saiu sem senha, conforme pedido. Se depois você quiser proteger só a ação de aprovar (mantendo catálogo e formulário abertos para todos), me avise — dá para adicionar o mesmo esquema de senha do seu projeto de Aprovação de Manutenção sem redesenhar o resto.
