function generaHeader() {
  const headerHTML = `
    <header class="main-header">
      <div id="menuTitolo" class="logo">
        <div id="logoTitolo">
          <img src="immagini/logo.PNG" alt="Prodify" height="40">
          <h1 id="titolo">Prodify</h1>
        </div>
        <nav id="menu">
          <a class="voceMenu" href="index.html">Home</a>
          <a class="voceMenu" href="servizi.html">Servizi</a>
          <a class="voceMenu" href="calendario.html">Calendario</a>
          <span id="loginStatus" style="margin-left: auto; display: flex; gap: 10px; align-items: center;"></span>
        </nav>
      </div>
    </header>
  `;
  document.body.insertAdjacentHTML("afterbegin", headerHTML);
  aggiornaBarraUtente();
}

function aggiornaBarraUtente() {
  const statusDiv = document.getElementById("loginStatus");
  const token = localStorage.getItem("token");
  let username = "";

  try {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      username = payload.username;
    }
  } catch {
    localStorage.removeItem("token"); // token corrotto o scaduto
  }

  if (username) {
    statusDiv.innerHTML = `
      <span class="voceMenu" style="pointer-events: none; color: white;">Ciao, ${username}</span>
      <a class="voceMenu" href="#" onclick="logout()" style="color: #e63946;">Logout</a>`;
  } else {
    statusDiv.innerHTML = `<a class="voceMenu" href="login.html">Login</a>`;
  }
}
function logout() {
  localStorage.removeItem("token");
  location.reload();
}
