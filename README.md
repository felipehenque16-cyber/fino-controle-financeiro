# fino.

**Controle financeiro pessoal, simples e organizado.**

O Fino é uma aplicação web para ajudar no acompanhamento da renda, das despesas e do saldo mensal. A proposta é oferecer uma experiência leve e intuitiva para visualizar movimentações e organizar melhor o orçamento.

🔗 **Acesse:** https://fino-controle-financeiro.vercel.app/

## ✨ Funcionalidades

- **Resumo financeiro:** visualização da renda do mês, despesas e saldo restante.
- **Registro de transações:** cadastro de receitas extras e despesas com descrição, valor, categoria, data e banco/instituição utilizada (opcional).
- **Histórico mensal:** consulta e filtro das movimentações por mês.
- **Despesas por categoria:** acompanhamento de quanto foi gasto em cada categoria.
- **Categorias e limites:** configuração de categorias personalizadas e limites de gastos.
- **Guia de orçamento realista:** apresenta faixas flexíveis para despesas essenciais, vida pessoal, reserva e dívidas/objetivos. Calcula os valores em reais com base na renda e oferece um diagnóstico das despesas registradas no mês.
- **Relatório em PDF:** preparação de um relatório com resumo, despesas por categoria e movimentações. A opção de impressão do navegador permite salvar o documento como PDF.
- **Instalação como aplicativo:** suporte a recursos de PWA em navegadores compatíveis.

## 🧭 Como usar

1. Acesse o Fino pelo link acima.
2. Informe sua renda mensal para iniciar o planejamento.
3. Adicione suas despesas e receitas extras.
4. Selecione o mês para consultar as movimentações.
5. Acompanhe o resumo, os gastos por categoria e os limites definidos.
6. Use **Exportar relatório** para abrir a visualização de impressão e escolher **Salvar como PDF**.

## 💡 Sobre o guia de orçamento

O guia usa faixas flexíveis como ponto de partida, calculadas sobre a renda mensal:

| Grupo | Faixa sugerida | Exemplos |
| --- | --- | --- |
| Essenciais | 55% a 70% | Moradia, alimentação, contas, transporte e saúde |
| Vida pessoal | 10% a 15% | Lazer, compras e assinaturas |
| Reserva | 5% a 10% | Reserva de emergência, começando com o que for possível |
| Dívidas e objetivos | 5% a 15% | Priorizar dívidas com juros altos e depois metas pessoais |

Essas faixas não precisam ser atingidas ao mesmo tempo nem somar 100%. São referências educativas que devem ser ajustadas à renda, aos custos e às prioridades de cada pessoa. O diagnóstico mensal considera apenas as transações registradas no período selecionado; contas ainda não lançadas não entram no cálculo.

## 🔒 Privacidade e armazenamento

O Fino utiliza o armazenamento local do navegador (**localStorage**) para manter os dados financeiros neste dispositivo.

- Os lançamentos e a renda não são enviados para uma conta ou banco de dados na nuvem pelo funcionamento atual da aplicação.
- Os dados ficam associados ao navegador e ao dispositivo utilizados.
- Limpar os dados do navegador, trocar de dispositivo ou utilizar outro navegador pode fazer com que as informações não estejam disponíveis.
- O relatório exportado pode conter informações financeiras pessoais. Guarde o arquivo PDF com cuidado.

**Importante:** o Fino é uma ferramenta de organização pessoal e não substitui orientação financeira profissional.

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript
- LocalStorage
- Progressive Web App (PWA)

## ▶️ Executar localmente

Você pode clonar o repositório:

```bash
git clone https://github.com/felipehenque16-cyber/fino-controle-financeiro.git
```

Entre na pasta do projeto:

```bash
cd fino-controle-financeiro
```

Depois, abra o arquivo `index.html` no navegador ou utilize a extensão **Live Server** no Visual Studio Code para executar o projeto em um servidor local.

## 👨‍💻 Desenvolvido por

**Filipe Almeida**

- GitHub: https://github.com/felipehenque16-cyber
- LinkedIn: https://linkedin.com/in/filipe-almeida-38a53b319/

---

*Fino — feito para cuidar melhor do que importa.*
