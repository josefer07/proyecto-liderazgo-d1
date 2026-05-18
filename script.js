document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('userInput').value;
    const role = document.getElementById('roleInput').value;

    // Personalización del mensaje en la esquina
    document.getElementById('display-name').innerText = `¡Hola, Bienvenido, ${name}!`;
    document.getElementById('display-role').innerText = `Rol: ${role}`;
    
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
});

function showTab(view) {
    // Lógica para cambiar entre Panel y Canal Ético
}
