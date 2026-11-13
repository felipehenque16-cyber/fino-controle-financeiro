const CHAVE = "controle-financeiro:transacoes";
const CHAVE_RENDA = "controle-financeiro:renda";
const CHAVE_CONFIG_CATEGORIAS = "controle-financeiro:config-categorias";
const CATEGORIAS_PADRAO = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Lazer",
  "Saúde",
  "Salário",
  "Outros",
];

const form = document.getElementById("form");
const lista = document.getElementById("lista");
const filtroMes = document.getElementById("filtroMes");
const campoData = document.getElementById("data");
const setup = document.getElementById("setup");
const principal = document.getElementById("principal");
const rendaInput = document.getElementById("rendaInput");
const btnManterRenda = document.getElementById("btnManterRenda");
const rendaError = document.getElementById("rendaError");
const appError = document.getElementById("appError");
const dialogCategorias = document.getElementById("dialogCategorias");
const listaLimites = document.getElementById("listaLimites");
const novaCategoria = document.getElementById("novaCategoria");
const erroCategorias = document.getElementById("erroCategorias");
const selectCategoria = document.getElementById("categoria");

const moeda = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function carregarTransacoes() {
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE)) || [];
    return Array.isArray(salvas) ? salvas : [];
  } catch {
    return [];
  }
}

function salvarTransacoes() {
  localStorage.setItem(CHAVE, JSON.stringify(transacoes));
}

function carregarRenda() {
  const valor = parseFloat(localStorage.getItem(CHAVE_RENDA));
  return valor > 0 ? valor : 0;
}

function carregarConfigCategorias() {
  try {
    const config = JSON.parse(localStorage.getItem(CHAVE_CONFIG_CATEGORIAS)) || {};
    const salvas = Array.isArray(config.categorias) ? config.categorias : [];
    const nomes = [...CATEGORIAS_PADRAO, ...salvas]
      .filter((nome) => typeof nome === "string" && nome.trim())
      .map((nome) => nome.trim());
    const categoriasUnicas = [...new Map(nomes.map((nome) => [nome.toLocaleLowerCase("pt-BR"), nome])).values()];
    const limitesSalvos =
      config.limites && typeof config.limites === "object" && !Array.isArray(config.limites)
        ? config.limites
        : {};
    const limitesValidos = {};

    Object.entries(limitesSalvos).forEach(([categoria, valor]) => {
      const limite = Number(valor);
      if (categoriasUnicas.includes(categoria) && Number.isFinite(limite) && limite > 0) {
        limitesValidos[categoria] = limite;
      }
    });

    return { categorias: categoriasUnicas, limites: limitesValidos };
  } catch {
    return { categorias: [...CATEGORIAS_PADRAO], limites: {} };
  }
}

let transacoes = carregarTransacoes();
let renda = carregarRenda();
let { categorias, limites } = carregarConfigCategorias();
let categoriasRascunho = [];
let limitesRascunho = {};

function renderOpcoesCategoria() {
  const selecionada = selectCategoria.value;
  selectCategoria.innerHTML = "";
  categorias.forEach((categoria) => {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    selectCategoria.append(option);
  });
  if (categorias.includes(selecionada)) selectCategoria.value = selecionada;
}

function renderListaLimites() {
  listaLimites.innerHTML = "";
  categoriasRascunho.forEach((categoria, index) => {
    const linha = document.createElement("div");
    linha.className = "budget-setting";

    const label = document.createElement("label");
    label.htmlFor = `limite-categoria-${index}`;
    label.textContent = categoria;

    const valor = document.createElement("div");
    valor.className = "budget-amount";
    const simbolo = document.createElement("span");
    simbolo.textContent = "R$";

    const input = document.createElement("input");
    input.id = `limite-categoria-${index}`;
    input.type = "number";
    input.min = "0";
    input.step = "0.01";
    input.placeholder = "Sem limite";
    input.value = limitesRascunho[categoria] || "";
    input.dataset.categoria = categoria;
    input.setAttribute("aria-label", `Limite mensal para ${categoria}`);

    valor.append(simbolo, input);
    linha.append(label, valor);
    listaLimites.append(linha);
  });
}

function abrirConfigCategorias() {
  categoriasRascunho = [...categorias];
  limitesRascunho = { ...limites };
  novaCategoria.value = "";
  limparErro(erroCategorias);
  renderListaLimites();
  dialogCategorias.showModal();
}

document.getElementById("btnCategorias").addEventListener("click", abrirConfigCategorias);
document.getElementById("btnCancelarCategorias").addEventListener("click", () => dialogCategorias.close());
document.getElementById("btnAdicionarCategoria").addEventListener("click", () => {
  const nome = novaCategoria.value.trim();
  if (!nome) {
    mostrarErro(erroCategorias, "Digite o nome da categoria.");
    novaCategoria.focus();
    return;
  }

  const duplicada = categoriasRascunho.some(
    (categoria) => categoria.toLocaleLowerCase("pt-BR") === nome.toLocaleLowerCase("pt-BR"),
  );
  if (duplicada) {
    mostrarErro(erroCategorias, "Essa categoria já existe.");
    novaCategoria.focus();
    return;
  }

  categoriasRascunho.push(nome);
  novaCategoria.value = "";
  limparErro(erroCategorias);
  renderListaLimites();
});

document.getElementById("formCategorias").addEventListener("submit", (e) => {
  e.preventDefault();
  const novosLimites = {};
  const campos = listaLimites.querySelectorAll("input[data-categoria]");

  for (const campo of campos) {
    const texto = campo.value.trim();
    if (!texto) continue;
    const valor = Number(texto);
    if (!Number.isFinite(valor) || valor < 0) {
      mostrarErro(erroCategorias, `Informe um limite válido para ${campo.dataset.categoria}.`);
      campo.focus();
      return;
    }
    if (valor > 0) novosLimites[campo.dataset.categoria] = valor;
  }

  const novaConfig = { categorias: categoriasRascunho, limites: novosLimites };
  try {
    localStorage.setItem(CHAVE_CONFIG_CATEGORIAS, JSON.stringify(novaConfig));
    categorias = categoriasRascunho;
    limites = novosLimites;
    renderOpcoesCategoria();
    limparErro(erroCategorias);
    render();
    dialogCategorias.close();
  } catch (error) {
    console.error("Não foi possível salvar as categorias neste aparelho.", error);
    mostrarErro(erroCategorias, "Não foi possível salvar. Verifique o espaço disponível no navegador.");
  }
});

renderOpcoesCategoria();

function limparErro(elemento) {
  elemento.textContent = "";
  elemento.hidden = true;
}

function mostrarErro(elemento, texto) {
  elemento.textContent = texto;
  elemento.hidden = false;
}

function abrirModalRenda() {
  const configurado = renda > 0;
  document.getElementById("rendaTitulo").textContent = configurado
    ? "Sua renda mudou?"
    : "Qual é a sua renda mensal?";
  document.getElementById("rendaDescricao").textContent = configurado
    ? "Atualize o valor quando precisar ou siga usando a renda salva."
    : "Informe quanto você recebe por mês para começar a acompanhar seu saldo.";
  btnManterRenda.hidden = !configurado;
  rendaInput.value = "";
  limparErro(rendaError);
  setup.showModal();
  rendaInput.focus();
}

document.getElementById("formRenda").addEventListener("submit", (e) => {
  e.preventDefault();
  const valor = parseFloat(rendaInput.value);
  if (!(valor > 0)) return;

  try {
    localStorage.setItem(CHAVE_RENDA, String(valor));
    renda = valor;
    render();
    setup.close();
  } catch (error) {
    console.error("Não foi possível salvar a renda neste aparelho.", error);
    mostrarErro(rendaError, "Não foi possível salvar neste aparelho. Verifique o espaço disponível no navegador.");
  }
});

document.getElementById("btnRenda").addEventListener("click", abrirModalRenda);
btnManterRenda.addEventListener("click", () => setup.close());
setup.addEventListener("cancel", (e) => {
  if (!(renda > 0)) e.preventDefault();
});

// Data de hoje e mês atual como padrão
const hoje = new Date().toISOString().slice(0, 10);
campoData.value = hoje;
filtroMes.value = hoje.slice(0, 7);

// ---------- Ações ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const transacao = {
    id: Date.now(),
    descricao: document.getElementById("descricao").value.trim(),
    valor: parseFloat(document.getElementById("valor").value),
    tipo: document.getElementById("tipo").value,
    categoria: document.getElementById("categoria").value,
    data: campoData.value,
  };
  transacoes.push(transacao);

  try {
    salvarTransacoes();
    form.reset();
    campoData.value = hoje;
    limparErro(appError);
    render();
  } catch (error) {
    transacoes.pop();
    console.error("Não foi possível salvar a transação neste aparelho.", error);
    mostrarErro(appError, "Não foi possível salvar neste aparelho. Verifique o espaço disponível no navegador.");
  }
});

lista.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-id]");
  if (!btn) return;
  const removidas = transacoes;
  transacoes = transacoes.filter((t) => String(t.id) !== btn.dataset.id);

  try {
    salvarTransacoes();
    limparErro(appError);
    render();
  } catch (error) {
    transacoes = removidas;
    console.error("Não foi possível remover a transação deste aparelho.", error);
    mostrarErro(appError, "Não foi possível remover a transação. Tente novamente.");
  }
});

filtroMes.addEventListener("change", render);

// ---------- Renderização ----------
function render() {
  const configurado = renda > 0;
  principal.hidden = !configurado;
  if (!configurado) return;

  if (!filtroMes.value) filtroMes.value = hoje.slice(0, 7);
  const mes = filtroMes.value;
  const visiveis = transacoes
    .filter((t) => t.data.startsWith(mes))
    .sort((a, b) => b.data.localeCompare(a.data));

  renderTotais(visiveis);
  renderLista(visiveis);
  renderCategorias(visiveis);
}

function renderTotais(itens) {
  const extras = itens
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + t.valor, 0);
  const despesas = itens
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + t.valor, 0);
  const total = renda + extras;
  const saldo = total - despesas;

  document.getElementById("receitas").textContent = moeda(total);
  document.getElementById("despesas").textContent = moeda(despesas);
  const elSaldo = document.getElementById("saldo");
  elSaldo.textContent = moeda(saldo);
  elSaldo.className = saldo >= 0 ? "verde" : "vermelho";

  const pct = (despesas / total) * 100;
  document.getElementById("usoTexto").textContent =
    `${pct.toFixed(0)}% da renda usada`;
  const barra = document.getElementById("usoBarra");
  barra.style.width = Math.min(pct, 100) + "%";
  barra.classList.toggle("estourou", pct > 100);
}

function renderLista(itens) {
  lista.innerHTML = "";
  if (itens.length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "vazio";
    vazio.textContent = "Nenhuma transação neste período.";
    lista.append(vazio);
    return;
  }
  itens.forEach((t) => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "info";
    const nome = document.createElement("span");
    nome.textContent = t.descricao;
    const detalhe = document.createElement("small");
    const [a, m, d] = t.data.split("-");
    detalhe.textContent = `${t.categoria} · ${d}/${m}/${a}`;
    info.append(nome, detalhe);

    const valor = document.createElement("span");
    valor.className = "valor " + (t.tipo === "receita" ? "verde" : "vermelho");
    valor.textContent = (t.tipo === "receita" ? "+ " : "- ") + moeda(t.valor);

    const remover = document.createElement("button");
    remover.className = "remover";
    remover.dataset.id = t.id;
    remover.setAttribute("aria-label", "Remover transação");
    remover.textContent = "×";

    li.append(info, valor, remover);
    lista.append(li);
  });
}

function renderCategorias(itens) {
  const box = document.getElementById("categorias");
  box.innerHTML = "";
  const gastos = itens.filter((t) => t.tipo === "despesa");
  const porCategoria = {};
  gastos.forEach((t) => {
    porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + t.valor;
  });

  const visiveis = categorias.filter(
    (categoria) => (limites[categoria] || 0) > 0 || (porCategoria[categoria] || 0) > 0,
  );
  if (visiveis.length === 0) {
    const p = document.createElement("p");
    p.className = "vazio";
    p.textContent = "Defina limites pelo botão acima para acompanhar os gastos por categoria.";
    box.append(p);
    return;
  }

  visiveis.forEach((categoria) => {
    const gasto = porCategoria[categoria] || 0;
    const limite = limites[categoria] || 0;
    const pct = limite > 0 ? (gasto / limite) * 100 : 0;
    const div = document.createElement("div");
    div.className = "barra";

    const txt = document.createElement("div");
    txt.className = "barra-txt";
    const esq = document.createElement("span");
    esq.textContent = categoria;
    const dir = document.createElement("span");
    dir.textContent =
      limite > 0
        ? `${moeda(gasto)} / ${moeda(limite)} (${pct.toFixed(0)}%)`
        : `${moeda(gasto)} · limite não definido`;
    txt.append(esq, dir);

    const fundo = document.createElement("div");
    fundo.className = "barra-fundo";
    const fill = document.createElement("div");
    fill.className = "barra-fill";
    fill.style.width = Math.min(pct, 100) + "%";
    fill.classList.toggle("estourou", limite > 0 && pct > 100);
    fundo.append(fill);

    div.append(txt, fundo);
    box.append(div);
  });
}

render();
if (!(renda > 0)) abrirModalRenda();
