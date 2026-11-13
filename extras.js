(() => {
  const $ = (id) => document.getElementById(id);
  const chaveTransacoes = "controle-financeiro:transacoes";
  const chaveRenda = "controle-financeiro:renda";
  const moeda = (valor) => Number(valor || 0).toLocaleString("pt-BR", {style:"currency",currency:"BRL"});
  const obterDados = () => {
    let transacoes = [];
    try {
      const salvas = JSON.parse(localStorage.getItem(chaveTransacoes) || "[]");
      if (Array.isArray(salvas)) transacoes = salvas;
    } catch (erro) { console.warn("Não foi possível ler as transações para o relatório.", erro); }
    const renda = Math.max(0, Number(localStorage.getItem(chaveRenda)) || 0);
    return {transacoes, renda};
  };
  const mesSelecionado = () => $("filtroMes")?.value || new Date().toISOString().slice(0,7);
  function atualizarDica() {
    const {transacoes,renda} = obterDados();
    const mes = mesSelecionado();
    const itens = transacoes.filter(t => typeof t.data === "string" && t.data.startsWith(mes));
    const extras = itens.filter(t => t.tipo === "receita").reduce((s,t) => s + Number(t.valor || 0),0);
    const despesas = itens.filter(t => t.tipo === "despesa").reduce((s,t) => s + Number(t.valor || 0),0);
    const saldo = renda + extras - despesas;
    const el = $("dicaDestaque");
    if (!el) return;
    if (!itens.length) el.textContent = "Comece registrando suas movimentações. Com os dados do mês, fica mais fácil identificar hábitos e planejar os próximos passos.";
    else if (saldo < 0) el.textContent = "Atenção ao orçamento: as despesas registradas já superam as receitas deste mês. Revise os gastos e priorize o que é essencial.";
    else if (!despesas) el.textContent = "Você ainda não registrou despesas neste mês. Inclua seus gastos para ter uma visão mais realista do orçamento.";
    else el.textContent = "Seu saldo registrado está positivo. Revise as categorias e avalie se é possível separar uma quantia para seus objetivos.";
  }
  function adicionarCelula(linha, texto, classe) {
    const celula = document.createElement("td");
    celula.textContent = texto;
    if (classe) celula.className = classe;
    linha.append(celula);
  }
  function prepararRelatorio() {
    const {transacoes,renda} = obterDados();
    const mes = mesSelecionado();
    const itens = transacoes.filter(t => typeof t.data === "string" && t.data.startsWith(mes)).sort((a,b) => a.data.localeCompare(b.data));
    const extras = itens.filter(t => t.tipo === "receita").reduce((s,t) => s + Number(t.valor || 0),0);
    const despesas = itens.filter(t => t.tipo === "despesa").reduce((s,t) => s + Number(t.valor || 0),0);
    const totalReceitas = renda + extras;
    const saldo = totalReceitas - despesas;
    const [ano,numeroMes] = mes.split("-");
    $("printPeriod").textContent = "Período: " + new Date(Number(ano),Number(numeroMes)-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
    const resumo = $("printSummary");
    resumo.replaceChildren();
    [["Receitas",totalReceitas],["Despesas",despesas],["Saldo",saldo]].forEach(([rotulo,valor]) => {
      const bloco=document.createElement("div"), titulo=document.createElement("span"), numero=document.createElement("strong");
      titulo.textContent=rotulo; numero.textContent=moeda(valor); bloco.append(titulo,numero); resumo.append(bloco);
    });
    const porCategoria={};
    itens.filter(t=>t.tipo==="despesa").forEach(t=>{porCategoria[t.categoria]=(porCategoria[t.categoria]||0)+Number(t.valor||0);});
    const categorias=$("printCategories"); categorias.replaceChildren();
    const tabela=document.createElement("table"); tabela.className="print-table";
    Object.entries(porCategoria).sort((a,b)=>b[1]-a[1]).forEach(([nome,valor])=>{
      const linha=document.createElement("tr"); adicionarCelula(linha,nome); adicionarCelula(linha,moeda(valor),"print-number"); tabela.append(linha);
    });
    if (!tabela.rows.length) { const p=document.createElement("p"); p.textContent="Nenhuma despesa registrada neste período."; categorias.append(p); }
    else categorias.append(tabela);
    const corpo=$("printTransactions"); corpo.replaceChildren();
    if (!itens.length) { const linha=document.createElement("tr"); adicionarCelula(linha,"Nenhuma movimentação registrada neste período."); linha.firstChild.colSpan=5; corpo.append(linha); }
    else itens.forEach(t=>{
      const linha=document.createElement("tr"),[a,m,d]=t.data.split("-");
      adicionarCelula(linha,d+"/"+m+"/"+a); adicionarCelula(linha,t.descricao); adicionarCelula(linha,t.categoria);
      adicionarCelula(linha,t.tipo==="receita"?"Receita extra":"Despesa"); adicionarCelula(linha,moeda(t.valor),"print-number"); corpo.append(linha);
    });
  }
  $("btnExportarPDF")?.addEventListener("click",()=>{
    prepararRelatorio();
    const relatorio=$("printReport"); relatorio.hidden=false;
    window.print();
    relatorio.hidden=true;
  });
  $("filtroMes")?.addEventListener("change",atualizarDica);
  document.addEventListener("submit",()=>window.setTimeout(atualizarDica,0));
  $("lista")?.addEventListener("click",()=>window.setTimeout(atualizarDica,0));
  atualizarDica();
})();
