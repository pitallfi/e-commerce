// 1. FUNÇÃO PARA ATUALIZAR A BOLINHA VERMELHA NA NAVBAR
function atualizarBadge() {
    let carrinho = JSON.parse(localStorage.getItem('carrinhoBeco')) || [];
    let totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    
    // Procura todos os badges na tela
    let badges = document.querySelectorAll('.cart-badge');

    badges.forEach(badge => {
        if (totalItens > 0) {
            badge.textContent = totalItens;
            badge.classList.remove('d-none'); // Mostra a bolinha
        } else {
            badge.classList.add('d-none'); // Esconde a bolinha
        }
    });
}

// 2. TUDO O QUE RODA ASSIM QUE A PÁGINA CARREGA
document.addEventListener('DOMContentLoaded', () => {
    
    atualizarBadge(); // Atualiza a bolinha logo de cara

    // LÓGICA DE ADICIONAR PRODUTOS
    const botoesComprar = document.querySelectorAll('.btn-comprar');
    
    botoesComprar.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Impede a página de pular ou recarregar
            
            // Pega o card em volta do botão clicado
            let card = btn.closest('.card-magico');
            
            // Extrai as informações do produto
            let nome = card.querySelector('.nome-produto').innerText.trim();
            let img = card.querySelector('img').src;
            
            // Limpeza Rigorosa do Preço: Arranca o "R$", os pontos de milhar e os espaços.
            let precoTexto = card.querySelector('.preco-valor').innerText;
            let precoLimpo = precoTexto.replace(/[^\d,]/g, '').replace(',', '.');
            let preco = parseFloat(precoLimpo);

            // Abre o "banco de dados" do navegador
            let carrinho = JSON.parse(localStorage.getItem('carrinhoBeco')) || [];
            
            // Verifica se o item já existe no carrinho
            let itemExistente = carrinho.find(i => i.nome === nome);
            if (itemExistente) {
                itemExistente.quantidade += 1;
            } else {
                carrinho.push({ nome: nome, preco: preco, img: img, quantidade: 1 });
            }

            // Salva de volta
            localStorage.setItem('carrinhoBeco', JSON.stringify(carrinho));
            atualizarBadge(); // Acende a bolinha na mesma hora
            
            // Efeito visual: o botão fica verde por 1.5 segundos avisando que deu certo
            let btnOriginal = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check-lg"></i> Adicionado';
            btn.style.backgroundColor = '#1b4d2e'; 
            btn.style.color = '#fff';
            
            setTimeout(() => { 
                btn.innerHTML = btnOriginal; 
                btn.style.backgroundColor = ''; 
                btn.style.color = '';
            }, 1500);
        });
    });

    // LÓGICA DA PÁGINA DO CARRINHO (Listar e Calcular)
    if (document.getElementById('lista-produtos')) {
        renderizarCarrinho();
    }
    
    // LÓGICA DO BOTÃO FINALIZAR COMPRA
    const btnFinalizar = document.getElementById('btn-finalizar');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', (e) => {
            let carrinho = JSON.parse(localStorage.getItem('carrinhoBeco')) || [];
            if(carrinho.length > 0) {
                localStorage.removeItem('carrinhoBeco'); // Limpa o carrinho após comprar
            }
        });
    }
});

// 3. FUNÇÃO QUE DESENHA OS PRODUTOS DENTRO DA PÁGINA DO CARRINHO
function renderizarCarrinho() {
    let carrinho = JSON.parse(localStorage.getItem('carrinhoBeco')) || [];
    const listaProdutos = document.getElementById('lista-produtos');
    const totalItensEl = document.getElementById('total-itens');
    const totalPrecoEl = document.getElementById('total-preco');
    const totalParcelasEl = document.getElementById('total-parcelas');
    const btnFinalizar = document.getElementById('btn-finalizar');

    if (carrinho.length === 0) {
        listaProdutos.innerHTML = `
            <div class="text-center p-4 mt-3" style="border: 1px dashed #6b4226; border-radius: 8px;">
                <p style="color: #352315; font-size: 1.1rem; font-weight: bold; margin: 0;">Seu caldeirão está vazio.</p>
                <p style="color: #6b4226; font-size: 0.9rem; margin-top: 5px;">Adicione feitiços, poções ou artefatos para continuar!</p>
            </div>
        `;
        totalItensEl.innerText = 'Total (0 produtos):';
        totalPrecoEl.innerText = 'R$ 0,00';
        totalParcelasEl.innerText = '10x de R$ 0,00';
        
        btnFinalizar.disabled = true;
        btnFinalizar.style.opacity = '0.5';
        return;
    }

    btnFinalizar.disabled = false;
    btnFinalizar.style.opacity = '1';

    listaProdutos.innerHTML = '';
    let totalValor = 0;
    let totalQtd = 0;

    carrinho.forEach((item, index) => {
        totalValor += item.preco * item.quantidade;
        totalQtd += item.quantidade;

        let precoFormatado = item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        listaProdutos.innerHTML += `
            <div class="cart-item">
                <div class="item-info">
                    <img src="${item.img}" alt="${item.nome}">
                    <span class="item-description">${item.nome}</span>
                </div>
                <div class="item-quantity">
                    <label>Qtd</label>
                    <input type="number" min="1" value="${item.quantidade}" onchange="alterarQuantidade(${index}, this.value)">
                </div>
                <div class="item-price">
                    <span class="price-label">Preço</span>
                    <span class="price-value">${precoFormatado}</span>
                </div>
                <button class="btn btn-outline-danger btn-sm" onclick="removerItem(${index})"><i class="bi bi-trash"></i></button>
            </div>
        `;
    });

    totalItensEl.innerText = `Total (${totalQtd} produtos):`;
    totalPrecoEl.innerText = totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    totalParcelasEl.innerText = `10x de ${(totalValor / 10).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
}

window.alterarQuantidade = function(index, novaQtd) {
    let carrinho = JSON.parse(localStorage.getItem('carrinhoBeco')) || [];
    novaQtd = parseInt(novaQtd);
    if (novaQtd >= 1) {
        carrinho[index].quantidade = novaQtd;
        localStorage.setItem('carrinhoBeco', JSON.stringify(carrinho));
        renderizarCarrinho();
        atualizarBadge();
    }
}

window.removerItem = function(index) {
    let carrinho = JSON.parse(localStorage.getItem('carrinhoBeco')) || [];
    carrinho.splice(index, 1);
    localStorage.setItem('carrinhoBeco', JSON.stringify(carrinho));
    renderizarCarrinho();
    atualizarBadge();
}
// Função para atualizar dinamicamente o menu do cabeçalho baseado no Login
function atualizarMenuUsuario() {
    const menuOpcoes = document.querySelector('#menuOpcoes .navbar-nav');
    if (!menuOpcoes) return; // Se não achar o menu na página, para a execução

    // Verifica se existe um usuário logado no localStorage
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (usuarioLogado) {
        // --- SE O USUÁRIO ESTIVER LOGADO ---
        menuOpcoes.innerHTML = `
            <li class="nav-item"><a class="nav-link text-pergaminho" href="produtos.html">Produtos</a></li>
            <li class="nav-item"><a class="nav-link text-pergaminho" href="carrinho.html">Carrinho</a></li>
            <li><hr class="dropdown-divider-claro"></li>
            <li class="nav-item"><a class="nav-link text-pergaminho" href="#">Meus Dados</a></li>
            <li class="nav-item"><a class="nav-link text-pergaminho" href="#">Meus Pedidos</a></li>
            <li><hr class="dropdown-divider-claro"></li>
            <li class="nav-item"><a class="nav-link text-sair" href="#" id="btn-sair">Sair</a></li>
        `;
    } else {
        // --- SE O USUÁRIO NÃO ESTIVER LOGADO ---
        menuOpcoes.innerHTML = `
            <li class="nav-item"><a class="nav-link text-pergaminho" href="produtos.html">Produtos</a></li>
            <li><hr class="dropdown-divider-claro"></li>
            <li class="nav-item"><a class="nav-link text-pergaminho" href="login.html">Entrar</a></li>
            <li class="nav-item"><a class="nav-link text-pergaminho" href="cadastrar.html">Cadastrar</a></li>
        `;
    }

    // Reaplica o ouvinte de evento para o botão "Sair" que acabou de ser injetado na tela
    const btnSairDinamico = document.getElementById('btn-sair');
    if (btnSairDinamico) {
        btnSairDinamico.addEventListener('click', function(e) {
            e.preventDefault();
            // Limpa as informações de login do usuário do localStorage
            localStorage.removeItem('usuarioLogado');
            alert('Feito o feitiço! Você saiu do Beco Diagonal.');
            // Redireciona o usuário para a página inicial
            window.location.href = 'index.html';
        });
    }
}

// Executa a função assim que o DOM da página carregar
document.addEventListener('DOMContentLoaded', () => {
    atualizarMenuUsuario();
});