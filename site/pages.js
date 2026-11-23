// ---- Configurações ----
const LIMITE_POR_PAGINA = 10; // 10 produtos por página

// ---- Estado ----
let paginaAtual = 1;
let todosOsProdutos = []; // Guarda os 30 produtos da API

// ---- Helpers ----
function formatarPreco(preco) {
  const valor = parseFloat(preco);
  const [inteiro, decimal] = valor.toFixed(2).split('.');
  return `R$ ${inteiro} <span>,${decimal}</span>`;
}

// ==========================================
// 1. BUSCAR TODOS OS PRODUTOS DA API
// ==========================================
async function buscarProdutos() {
  try {
    // Aumentamos o limite para 100 para garantir que TODOS os 30 venham de uma vez
    const response = await fetch('http://localhost:3000/produto?limite=100');
    const json = await response.json();
    
    // A API retorna um objeto com a chave "dados"
    todosOsProdutos = json.dados || [];
    
    // Renderiza a primeira página
    renderizarProdutos();
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    document.getElementById('produtos-grid').innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; color:#d67a5a; font-weight:600; padding:2rem;">
        <i class="fas fa-exclamation-triangle" style="font-size:2rem; margin-bottom:0.5rem; display:block;"></i>
        Erro ao carregar os produtos. Verifique se o servidor está rodando.
      </div>`;
  }
}

// ==========================================
// 2. FILTRAR (busca, categoria, preço, ordenação)
// ==========================================
function filtrarSabores() {
  const busca = document.getElementById('busca').value.trim().toLowerCase();
  const categoria = document.getElementById('categoria').value;
  const ordenacao = document.getElementById('ordenacao').value;
  const precoMin = parseFloat(document.getElementById('preco_min').value);
  const precoMax = parseFloat(document.getElementById('preco_max').value);

  // Filtra a lista completa que veio da API
  let lista = todosOsProdutos.filter((p) => {
    const precoNum = parseFloat(p.preco);
    
    if (busca && !p.sabor.toLowerCase().includes(busca)) return false;
    if (categoria && p.categoria !== categoria) return false;
    if (!isNaN(precoMin) && precoNum < precoMin) return false;
    if (!isNaN(precoMax) && precoNum > precoMax) return false;
    return true;
  });

  // Ordenação
  if (ordenacao === 'menor preco') lista.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
  else if (ordenacao === 'maior preco') lista.sort((a, b) => parseFloat(b.preco) - parseFloat(a.preco));

  return lista;
}

// ==========================================
// 3. RENDERIZAR OS CARDS
// ==========================================
function renderizarProdutos() {
  const grid = document.getElementById('produtos-grid');
  const listaFiltrada = filtrarSabores();

  // Calcula o total de páginas baseado na lista filtrada
  const totalPaginas = Math.max(1, Math.ceil(listaFiltrada.length / LIMITE_POR_PAGINA));
  if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

  // Pega só os 10 itens da página atual
  const inicio = (paginaAtual - 1) * LIMITE_POR_PAGINA;
  const produtosDaPagina = listaFiltrada.slice(inicio, inicio + LIMITE_POR_PAGINA);

  // Se não achou nada (filtro muito restrito)
  if (produtosDaPagina.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; color:#b28a78; font-weight:600; padding:2rem;">
        <i class="fas fa-search" style="font-size:2rem; margin-bottom:0.5rem; display:block; color:#d67a5a;"></i>
        Nenhum sabor encontrado 🍦
      </div>`;
    renderizarPaginacao(0);
    return;
  }

  // Gera o HTML dos cards
  grid.innerHTML = produtosDaPagina.map((p) => {
    const precoNum = parseFloat(p.preco);
    
    return `
      <div class="produto-card">
        
        <!-- Imagem vinda da API (caminho_img já vem completo) -->
        <img src="${p.caminho_img}" alt="${p.sabor}" class="produto-icone" loading="lazy">
        
        <span class="produto-categoria">${p.categoria}</span>
        
        <div class="produto-nome">
          <i class="fas fa-star"></i> ${p.sabor}
        </div>
        
        <div class="produto-preco">${formatarPreco(p.preco)}</div>
        
        <!-- Botão que envia para o carrinho -->
        <button class="btn_enviar" onclick="adicionarAoCarrinho({
          produto_id: ${p.id}, 
          sabor_id: ${p.id}, 
          nome: '${p.sabor}', 
          preco: ${precoNum}, 
          imagem: '${p.caminho_img}',
          sabor_nome: '${p.sabor}'
        })">
          <i class="fas fa-cart-plus"></i> Adicionar
        </button>
        
      </div>
    `;
  }).join('');

  // Renderiza os botões de paginação
  renderizarPaginacao(totalPaginas);
}

// ==========================================
// 4. PAGINAÇÃO
// ==========================================
function renderizarPaginacao(totalPaginas) {
  const el = document.getElementById('paginacao');
  if (totalPaginas <= 1) { el.innerHTML = ''; return; }

  let html = `
    <button ${paginaAtual === 1 ? 'disabled' : ''} onclick="irParaPagina(${paginaAtual - 1})">
      <i class="fas fa-chevron-left"></i>
    </button>`;

  for (let i = 1; i <= totalPaginas; i++) {
    html += `<button class="${i === paginaAtual ? 'ativo' : ''}" onclick="irParaPagina(${i})">${i}</button>`;
  }

  html += `
    <button ${paginaAtual === totalPaginas ? 'disabled' : ''} onclick="irParaPagina(${paginaAtual + 1})">
      <i class="fas fa-chevron-right"></i>
    </button>`;

  el.innerHTML = html;
}

function irParaPagina(n) {
  paginaAtual = n;
  renderizarProdutos();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 5. EVENTOS DE FILTRO
// ==========================================
['busca', 'categoria', 'ordenacao', 'preco_min', 'preco_max'].forEach((id) => {
  document.getElementById(id).addEventListener('input', () => {
    paginaAtual = 1; // Volta para a primeira página ao filtrar
    renderizarProdutos();
  });
});

// ==========================================
// 6. INICIALIZA
// ==========================================
buscarProdutos();