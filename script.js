const CHAVE = "controle-financeiro:transacoes";
const CHAVE_RENDA = "controle-financeiro:renda";
const CHAVE_CONFIG_CATEGORIAS = "controle-financeiro:config-categorias";
const CHAVE_CONTAS_FIXAS = "controle-financeiro:contas-fixas";
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
const selectBanco = document.getElementById("banco");
const formContaFixa = document.getElementById("formContaFixa");
const listaContasFixas = document.getElementById("listaContasFixas");
const selectContaFixaCategoria = document.getElementById("contaFixaCategoria");
const feedbackContasFixas = document.getElementById("contasFixasFeedback");

const campoOutroBanco = document.getElementById("campoOutroBanco");
const outroBancoInput = document.getElementById("outroBanco");

selectBanco.addEventListener("change", () => {
  const outro = selectBanco.value === "Outro";
  campoOutroBanco.hidden = !outro;
  outroBancoInput.required = outro;
  if (!outro) outroBancoInput.value = "";
});

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

function carregarContasFixas() {
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE_CONTAS_FIXAS)) || [];
    return Array.isArray(salvas) ? salvas.filter((item) =>
      item && item.id != null && typeof item.descricao === "string" &&
      Number(item.valor) > 0 && Number(item.dia) >= 1 && Number(item.dia) <= 31
    ) : [];
  } catch {
    return [];
  }
}

function salvarContasFixas() {
  localStorage.setItem(CHAVE_CONTAS_FIXAS, JSON.stringify(contasFixas));
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
let contasFixas = carregarContasFixas();
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
    banco: selectBanco.value === "Outro" ? outroBancoInput.value.trim() : selectBanco.value,
    data: campoData.value,
  };
  transacoes.push(transacao);

  try {
    salvarTransacoes();
    form.reset();
    campoData.value = hoje;
    campoOutroBanco.hidden = true;
    outroBancoInput.required = false;
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
  renderVisaoMes(visiveis);
  renderGuiaOrcamento(visiveis);
  renderContasFixas();
  renderLista(visiveis);
  renderCategorias(visiveis);
}

function renderVisaoMes(itens) {
  const extras = itens.filter((t) => t.tipo === "receita").reduce((s, t) => s + Number(t.valor || 0), 0);
  const despesas = itens.filter((t) => t.tipo === "despesa").reduce((s, t) => s + Number(t.valor || 0), 0);
  const saldo = renda + extras - despesas;
  const porCategoria = {};
  itens.filter((t) => t.tipo === "despesa").forEach((t) => {
    porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + Number(t.valor || 0);
  });
  const maior = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])[0];
  const [ano, mes] = filtroMes.value.split("-").map(Number);
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const hojeLocal = new Date();
  const mesmoMes = hojeLocal.getFullYear() === ano && hojeLocal.getMonth() + 1 === mes;
  const diasConsiderados = mesmoMes ? Math.max(1, hojeLocal.getDate()) : diasNoMes;
  document.getElementById("insightTopCategory").textContent = maior ? maior[0] : "Sem despesas";
  document.getElementById("insightDailyAverage").textContent = moeda(despesas / diasConsiderados);
  const mensagem = document.getElementById("insightMessage");
  if (despesas === 0) mensagem.textContent = "Ainda não há despesas registradas. Comece lançando suas contas e gastos do dia a dia.";
  else if (saldo < 0) mensagem.textContent = "Os gastos registrados superaram a renda considerada. Revise os lançamentos e priorize o que é essencial.";
  else if (despesas / Math.max(1, renda + extras) >= 0.75) mensagem.textContent = "Boa parte da renda já foi utilizada. Confira as contas que ainda faltam entrar no planejamento.";
  else mensagem.textContent = "Seu orçamento registrado ainda tem margem. Lembre de incluir as contas fixas para ter uma visão mais completa.";
}

function renderContasFixas() {
  const mes = filtroMes.value;
  const [ano, numeroMes] = mes.split("-").map(Number);
  const nomes = categorias;
  const anterior = selectContaFixaCategoria.value;
  selectContaFixaCategoria.replaceChildren();
  nomes.forEach((nome) => {
    const option = document.createElement("option");
    option.value = nome;
    option.textContent = nome;
    selectContaFixaCategoria.append(option);
  });
  if (nomes.includes(anterior)) selectContaFixaCategoria.value = anterior;
  listaContasFixas.replaceChildren();
  document.getElementById("contasFixasCount").textContent = contasFixas.length + (contasFixas.length === 1 ? " conta" : " contas");
  if (!contasFixas.length) {
    const vazio = document.createElement("p");
    vazio.className = "recurring-empty";
    vazio.textContent = "Nenhuma conta cadastrada ainda. Adicione uma conta acima para facilitar seus próximos lançamentos.";
    listaContasFixas.append(vazio);
    return;
  }
  contasFixas.forEach((conta) => {
    const linha = document.createElement("article");
    linha.className = "recurring-item";
    const info = document.createElement("div");
    info.className = "recurring-item-info";
    const nome = document.createElement("strong");
    nome.textContent = conta.descricao;
    const detalhe = document.createElement("small");
    detalhe.textContent = conta.categoria + " · vence dia " + conta.dia;
    info.append(nome, detalhe);
    const valor = document.createElement("strong");
    valor.className = "recurring-value";
    valor.textContent = moeda(conta.valor);
    const acoes = document.createElement("div");
    acoes.className = "recurring-item-actions";
    const lancada = transacoes.some((t) => String(t.recorrenciaId) === String(conta.id) && t.recorrenciaMes === mes);
    const lancar = document.createElement("button");
    lancar.type = "button";
    lancar.className = "recurring-launch";
    lancar.dataset.lancarConta = conta.id;
    lancar.disabled = lancada;
    lancar.textContent = lancada ? "Lançada neste mês" : "Lançar no mês";
    const excluir = document.createElement("button");
    excluir.type = "button";
    excluir.className = "recurring-delete";
    excluir.dataset.excluirConta = conta.id;
    excluir.setAttribute("aria-label", "Excluir " + conta.descricao);
    excluir.textContent = "×";
    acoes.append(lancar, excluir);
    linha.append(info, valor, acoes);
    listaContasFixas.append(linha);
  });
}

formContaFixa.addEventListener("submit", (e) => {
  e.preventDefault();
  const descricao = document.getElementById("contaFixaNome").value.trim();
  const valor = Number(document.getElementById("contaFixaValor").value);
  const dia = Number(document.getElementById("contaFixaDia").value);
  const categoria = selectContaFixaCategoria.value;
  if (!descricao || !Number.isFinite(valor) || valor <= 0 || !Number.isInteger(dia) || dia < 1 || dia > 31) return;
  const nova = { id: Date.now(), descricao, valor, dia, categoria };
  contasFixas.push(nova);
  try {
    salvarContasFixas();
    formContaFixa.reset();
    document.getElementById("contaFixaDia").value = "10";
    feedbackContasFixas.hidden = true;
    renderContasFixas();
  } catch (error) {
    contasFixas = contasFixas.filter((item) => item.id !== nova.id);
    feedbackContasFixas.textContent = "Não foi possível salvar esta conta neste aparelho.";
    feedbackContasFixas.hidden = false;
  }
});

listaContasFixas.addEventListener("click", (e) => {
  const excluir = e.target.closest("[data-excluir-conta]");
  const lancar = e.target.closest("[data-lancar-conta]");
  if (excluir) {
    const anterior = contasFixas;
    contasFixas = contasFixas.filter((item) => String(item.id) !== excluir.dataset.excluirConta);
    try { salvarContasFixas(); renderContasFixas(); }
    catch { contasFixas = anterior; renderContasFixas(); }
    return;
  }
  if (lancar && !lancar.disabled) {
    const conta = contasFixas.find((item) => String(item.id) === lancar.dataset.lancarConta);
    if (!conta) return;
    const [ano, mes] = filtroMes.value.split("-").map(Number);
    const dia = Math.min(conta.dia, new Date(ano, mes, 0).getDate());
    const data = ano + "-" + String(mes).padStart(2, "0") + "-" + String(dia).padStart(2, "0");
    const nova = { id: Date.now(), descricao: conta.descricao, valor: Number(conta.valor), tipo: "despesa", categoria: conta.categoria, banco: "", data, recorrenciaId: conta.id, recorrenciaMes: filtroMes.value };
    transacoes.push(nova);
    try { salvarTransacoes(); limparErro(appError); render(); }
    catch (error) {
      transacoes = transacoes.filter((item) => item.id !== nova.id);
      mostrarErro(appError, "Não foi possível lançar esta conta. Tente novamente.");
    }
  }
});

function renderGuiaOrcamento(itens) {
  const totalRenda = renda + itens
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + t.valor, 0);

  const faixas = [
    ["budgetEssentials", 0.55, 0.70],
    ["budgetLifestyle", 0.10, 0.15],
    ["budgetReserve", 0.05, 0.10],
    ["budgetPriorities", 0.05, 0.15],
  ];

  faixas.forEach(([id, minimo, maximo]) => {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    elemento.textContent = totalRenda > 0
      ? `${moeda(totalRenda * minimo)} a ${moeda(totalRenda * maximo)}`
      : "Informe sua renda";
  });

  const despesas = itens
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + t.valor, 0);
  const percentual = totalRenda > 0 ? (despesas / totalRenda) * 100 : 0;
  const status = document.getElementById("budgetMonthStatus");
  const detalhe = document.getElementById("budgetMonthDetail");

  if (despesas === 0) {
    status.textContent = "Ainda não há despesas registradas neste mês.";
    detalhe.textContent = "Adicione seus gastos para acompanhar quanto da renda já está comprometido. Lembre-se de lançar também as contas fixas.";
  } else if (percentual > 100) {
    status.textContent = "Os gastos registrados já passaram da renda do mês.";
    detalhe.textContent = `${moeda(despesas)} em despesas, o equivalente a ${percentual.toFixed(0)}% da renda considerada. Revise os lançamentos e priorize as contas essenciais.`;
  } else if (percentual > 75) {
    status.textContent = "Boa parte da renda já está comprometida.";
    detalhe.textContent = `${moeda(despesas)} em despesas (${percentual.toFixed(0)}% da renda). Antes de assumir novos gastos, confira as contas que ainda faltam vencer.`;
  } else {
    status.textContent = "Você ainda tem margem no orçamento registrado.";
    detalhe.textContent = `${moeda(despesas)} em despesas (${percentual.toFixed(0)}% da renda). Separe primeiro o valor das contas que ainda não foram lançadas.`;
  }
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
    detalhe.textContent = [t.categoria, t.banco, `${d}/${m}/${a}`].filter(Boolean).join(" · ");
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
