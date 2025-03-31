function redirecionar() {
    const email = document.getElementById("e-mail").value.trim(); // Obtém o e-mail e remove espaços
    const senha = document.getElementById("senha").value.trim(); // Obtém a senha e remove espaços

    // Verifica se o campo de e-mail está vazio
    if (email === "") {
        alert("Por favor, insira seu e-mail.");
        return; // Interrompe a execução se o e-mail estiver vazio
    }

    // Verifica se o campo de senha está vazio
    if (senha === "") {
        alert("Por favor, insira sua senha.");
        return; // Interrompe a execução se a senha estiver vazia
    }
    <button class="secondary" onclick="redirecionar()">Confirmar</button>
    // Se ambos os campos estão preenchidos, redireciona para a próxima página
    window.location.href = "file:///C:/Users/manan/OneDrive/%C3%81rea%20de%20Trabalho/Meu%20Projeto%20I/My%20Project%20I-%20Pag%20II/Qzverso%20Home.html";
}


