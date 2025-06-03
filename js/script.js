const currentMonth = document.querySelector(".current-month");
const calendarDays = document.querySelector(".calendar-days");
const prevMonthBtn = document.querySelector(".prev");
const nextMonthBtn = document.querySelector(".next");
const prevYearBtn = document.querySelector(".prev-year");
const nextYearBtn = document.querySelector(".next-year");
const todayBtn = document.querySelector(".today");

let date = new Date();
let month = date.getMonth();
let year = date.getFullYear();

const months = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

let selectedDateKey = null;

function renderCalendar() {
  date.setDate(1);
  date.setMonth(month);
  date.setFullYear(year);

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const prevLastDay = new Date(year, month, 0).getDate();

  currentMonth.textContent = `${months[month]} ${year}`;
  calendarDays.innerHTML = "";

  for (let x = firstDayIndex; x > 0; x--) {
    const div = document.createElement("div");
    div.className = "month-day inactive";
    div.textContent = prevLastDay - x + 1;
    calendarDays.appendChild(div);
  }

  for (let i = 1; i <= lastDay; i++) {
    const div = document.createElement("div");
    div.className = "month-day";
    div.textContent = i;

    const today = new Date();
    if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      div.classList.add("current-day");
    }

    const dateKey = `${year}-${month + 1}-${i}`;
    const eventi = JSON.parse(localStorage.getItem(dateKey) || "[]");

    if (Array.isArray(eventi) && eventi.length > 0) {
      div.classList.add("has-event");
      div.style.backgroundColor = eventi[0].colore || "#ffe066";
    }

    div.addEventListener("click", () => {
      document.querySelectorAll(".calendar-days .month-day").forEach(d => d.classList.remove("selected-day"));
      div.classList.add("selected-day");
      mostraDettagli(dateKey, i, month + 1, year);
    });

    calendarDays.appendChild(div);
  }

  const totalDisplayedDays = firstDayIndex + lastDay;
  const totalWeeks = Math.ceil(totalDisplayedDays / 7);
  const totalCells = totalWeeks * 7;
  const extraDays = totalCells - totalDisplayedDays;

  for (let j = 1; j <= extraDays; j++) {
    const div = document.createElement("div");
    div.className = "month-day inactive";
    div.textContent = j;
    calendarDays.appendChild(div);
  }
}

function mostraDettagli(dataKey, giorno, mese, anno) {
  const eventi = JSON.parse(localStorage.getItem(dataKey) || "[]");
  const ultimo = eventi[eventi.length - 1] || {};

  document.getElementById("dataSelezionata").textContent = `${giorno}/${mese}/${anno}`;
  document.getElementById("orarioEvento").textContent = ultimo.orario || "—";
  document.getElementById("testoEvento").textContent = ultimo.testo || "—";
  document.getElementById("inputOrario").value = "";
  document.getElementById("inputTesto").value = "";
  document.getElementById("inputColore").value = "#ffe066";

  selectedDateKey = dataKey;
}

document.getElementById("modificaEvento").addEventListener("submit", function (e) {
  e.preventDefault();
  if (!selectedDateKey) return;

  const testo = document.getElementById("inputTesto").value.trim();
  const orario = document.getElementById("inputOrario").value.trim();
  const colore = document.getElementById("inputColore").value;

  if (testo === "") return;

  const nuovoEvento = { testo, orario, colore, completato: false };
  const eventi = JSON.parse(localStorage.getItem(selectedDateKey) || "[]");
  eventi.push(nuovoEvento);
  localStorage.setItem(selectedDateKey, JSON.stringify(eventi));

  salvaEventiNelBackend();

  const [anno, mese, giorno] = selectedDateKey.split("-");
  mostraDettagli(selectedDateKey, giorno, mese, anno);
  renderCalendar();
  aggiornaTabellaAttivita();
});

document.getElementById("eliminaEvento").addEventListener("click", function () {
  if (!selectedDateKey) return;
  localStorage.removeItem(selectedDateKey);
  salvaEventiNelBackend();
  selectedDateKey = null;

  document.getElementById("dataSelezionata").textContent = "—";
  document.getElementById("orarioEvento").textContent = "—";
  document.getElementById("testoEvento").textContent = "—";
  document.getElementById("inputOrario").value = "";
  document.getElementById("inputTesto").value = "";
  document.getElementById("inputColore").value = "#ffe066";

  renderCalendar();
  aggiornaTabellaAttivita();
});

function aggiornaTabellaAttivita() {
  const tbody = document.querySelector("#tabellaAttivita tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const eventiTotali = [];

  Object.keys(localStorage).forEach(key => {
    if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(key)) return;

    let lista;
    try {
      lista = JSON.parse(localStorage.getItem(key));
    } catch (e) {
      console.warn("Chiave non valida nel localStorage:", key);
      return;
    }

    if (!Array.isArray(lista)) return;

    lista.forEach(evento => {
      eventiTotali.push({
        dataKey: key,
        orario: evento.orario || "00:00",
        ...evento
      });
    });
  });

  eventiTotali.sort((a, b) => {
    const aData = new Date(`${a.dataKey}T${a.orario}`);
    const bData = new Date(`${b.dataKey}T${b.orario}`);
    return aData - bData;
  });

  eventiTotali.forEach((obj, index) => {
    const row = document.createElement("tr");
    if (obj.completato) row.classList.add("completed");

    const dataCell = document.createElement("td");
    dataCell.textContent = obj.dataKey.split("-").reverse().join("/");

    const orarioCell = document.createElement("td");
    orarioCell.textContent = obj.orario;

    const testoCell = document.createElement("td");
    testoCell.textContent = obj.testo;

    const coloreCell = document.createElement("td");
    const coloreBox = document.createElement("div");
    coloreBox.style.width = "20px";
    coloreBox.style.height = "20px";
    coloreBox.style.borderRadius = "4px";
    coloreBox.style.border = "1px solid #aaa";
    coloreBox.style.backgroundColor = obj.colore || "#ffe066";
    coloreCell.appendChild(coloreBox);

    const checkCell = document.createElement("td");
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = !!obj.completato;
    check.addEventListener("change", () => {
      obj.completato = check.checked;
      const lista = JSON.parse(localStorage.getItem(obj.dataKey)) || [];
      lista[index].completato = obj.completato;
      localStorage.setItem(obj.dataKey, JSON.stringify(lista));
      aggiornaTabellaAttivita();
    });
    checkCell.appendChild(check);

    row.appendChild(dataCell);
    row.appendChild(orarioCell);
    row.appendChild(testoCell);
    row.appendChild(coloreCell);
    row.appendChild(checkCell);

    tbody.appendChild(row);
  });
}

// Navigazione calendario
nextMonthBtn.addEventListener("click", () => {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  renderCalendar();
});
prevMonthBtn.addEventListener("click", () => {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  renderCalendar();
});
todayBtn.addEventListener("click", () => {
  date = new Date();
  month = date.getMonth();
  year = date.getFullYear();
  renderCalendar();
});
prevYearBtn.addEventListener("click", () => {
  year--;
  renderCalendar();
});
nextYearBtn.addEventListener("click", () => {
  year++;
  renderCalendar();
});

async function caricaEventiDaBackend() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch("http://localhost:3001/api/eventi", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const data = await res.json();

  if (!Array.isArray(data)) {
    console.error("Errore nel caricamento eventi:", data);
    return;
  }

  // Pulizia eventi
  Object.keys(localStorage).forEach(key => {
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(key)) {
      localStorage.removeItem(key);
    }
  });

  data.forEach(ev => {
    const key = ev.data;
    const lista = JSON.parse(localStorage.getItem(key) || "[]");
    lista.push({
      orario: ev.orario,
      testo: ev.testo,
      colore: ev.colore,
      completato: ev.completato
    });
    localStorage.setItem(key, JSON.stringify(lista));
  });

  renderCalendar();
  aggiornaTabellaAttivita();

}


async function salvaEventiNelBackend() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const eventi = [];

  Object.keys(localStorage).forEach(data => {
    if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(data)) return;
    const lista = JSON.parse(localStorage.getItem(data));
    if (Array.isArray(lista)) {
      lista.forEach(ev => {
        eventi.push({ data, ...ev });
      });
    }
  });

  await fetch("http://localhost:3001/api/eventi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(eventi)
  });
}

renderCalendar();
aggiornaTabellaAttivita();

// Se l'utente è loggato, carica gli eventi dal backend
const token = localStorage.getItem("token");
if (token) {
  caricaEventiDaBackend();
}
