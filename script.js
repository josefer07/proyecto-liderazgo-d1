:root { 
    --d1-red: #e30613; 
    --d1-blue: #005696; 
}

/* Fondo del Login */
#auth-container { 
    height: 100vh; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), 
                url('https://noticias.canaltro.com/wp-content/uploads/2023/11/Tiendas-D1.jpg') center/cover;
}

.auth-card { 
    background: white; 
    padding: 3rem; 
    border-radius: 20px; 
    width: 100%; 
    max-width: 450px; 
    text-align: center; 
}

.login-logo { width: 140px; margin-bottom: 25px; }

/* Dashboard */
.navbar-d1 { background-color: var(--d1-red); border-bottom: 5px solid var(--d1-blue); }
.d1-blue-text { color: var(--d1-blue); }

.sidebar { background: white; min-height: 100vh; }
.nav-link { 
    color: #333; 
    font-weight: bold; 
    font-size: 0.9rem; 
    text-align: left;
    border: 1px solid #eee;
}
.nav-link.active { background-color: var(--d1-blue) !important; color: white !important; }

.btn-d1 { background-color: var(--d1-red); color: white; font-weight: bold; border: none; }
.btn-d1:hover { background-color: #b3050f; color: white; }

.welcome-banner { 
    background: var(--d1-blue); 
    color: white; 
    padding: 30px; 
    border-radius: 15px; 
}
