:root { 
    --d1-red: #e30613; 
    --d1-blue: #005696; 
}

body { background-color: #f8f9fa; }

/* Estilo de Acceso */
#auth-container { 
    height: 100vh; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    background: url('https://upload.wikimedia.org/wikipedia/commons/4/42/D1_Tiendas.jpg') center/cover;
    position: relative;
}
#auth-container::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 86, 150, 0.7); }

.auth-card { 
    position: relative; z-index: 2; background: white; 
    padding: 40px; border-radius: 15px; width: 100%; max-width: 400px; text-align: center; 
}
.login-logo { width: 120px; margin-bottom: 20px; }

/* Dashboard */
.navbar-d1 { background-color: var(--d1-red); border-bottom: 5px solid var(--d1-blue); }
.d1-blue-text { color: var(--d1-blue); }
.sidebar { background: white; min-height: 100vh; }
.nav-link { color: #333; font-weight: bold; margin-bottom: 10px; border: 1px solid #ddd; }
.nav-link.active { background-color: var(--d1-blue) !important; color: white !important; }
.btn-d1 { background-color: var(--d1-red); color: white; font-weight: bold; }
.welcome-banner { background: var(--d1-blue); color: white; padding: 30px; border-radius: 15px; margin-bottom: 20px; }
