/* ============================================================
   script.js - Version corregida por Alberto
   - Auto-login tras registro
   - Guardado de datos y prefill en logout
   - 20 retos completos
   - Ejemplos en HARD son pistas parciales (no resuelven)
   - Bloqueo copy/paste solo en Monaco + animación + toast
============================================================ */

/* -------------------------
   DOM references
------------------------- */
const loginScreen = document.getElementById("login-screen");
const homeScreen = document.getElementById("home-screen");
const gameSection = document.getElementById("game-section");

const btnLogin = document.getElementById("btn-login");
const loginMsg = document.getElementById("login-msg");

const metodoSelect = document.getElementById("metodo-registro");
const formularioDinamico = document.getElementById("formulario-dinamico");
const registroMsg = document.getElementById("registro-msg");

const avatarImg = document.getElementById("avatar-img");
const avatarInp = document.getElementById("avatar-input");

const jsButton = document.getElementById("js-button");

const startBtn = document.getElementById("start-btn");
const timerDiv = document.getElementById("timer");

const challengeInstructions = document.getElementById("challenge-instructions");
const exampleBox = document.getElementById("challenge-example");
const exampleText = document.getElementById("example-text");
const explainBox = document.getElementById("challenge-explain");
const explainText = document.getElementById("explain-text");

const checkBtn = document.getElementById("checkBtn");
const nextBtn = document.getElementById("nextBtn");
const resultDiv = document.getElementById("result");

const editorWrap = document.querySelector(".editor-monaco-wrap");

/* toast element creation (we'll inject one into editorWrap) */
const toast = document.createElement("div");
toast.className = "toast warn";
toast.style.display = "none";
toast.innerText = "No copies ni pegues — ¡Practica te ayuda a aprender!";
if (editorWrap) editorWrap.appendChild(toast);

/* -------------------------
   State
------------------------- */
let monacoEditor = null;
let currentLevel = null;
let currentChallenges = [];
let currentIndex = 0;
let timer = null;
let timeLeft = 0;

/* -------------------------
   UTIL: show toast
------------------------- */
function showToast(msg, type = "warn", ms = 1500) {
  toast.className = "toast " + (type === "info" ? "info" : "warn");
  toast.innerText = msg;
  toast.style.display = "block";
  // remove previous shake class just in case
  editorWrap && editorWrap.classList.remove("shake");
  // add shake
  if (editorWrap) {
    void editorWrap.offsetWidth;
    editorWrap.classList.add("shake");
  }
  setTimeout(() => {
    toast.style.display = "none";
    if (editorWrap) editorWrap.classList.remove("shake");
  }, ms);
}

/* -------------------------
   USERS: load & prefill
------------------------- */
function getUsers() {
  return JSON.parse(localStorage.getItem("codequestUsers") || "{}");
}
function saveUsers(u) {
  localStorage.setItem("codequestUsers", JSON.stringify(u));
}

/* prefill login with 'lastUser' if any */
window.addEventListener("load", () => {
  const last = localStorage.getItem("lastUser");
  const users = getUsers();
  if (last && users[last]) {
    document.getElementById("login-email").value = last;
    // prefill password if you stored it (user asked to remember)
    if (users[last].password) document.getElementById("login-pass").value = users[last].password;
  }
  // load avatar if saved
  const savedAvatar = localStorage.getItem("avatarImg");
  if (savedAvatar) avatarImg.src = savedAvatar;
});

/* -------------------------
   LOGIN (valida usuarios guardados)
------------------------- */
btnLogin.onclick = () => {
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-pass").value.trim();

  if (!email || !pass) {
    loginMsg.innerText = "Completa ambos campos.";
    return;
  }

  const users = getUsers();
  if (!users[email]) {
    loginMsg.innerText = "Cuenta no encontrada.";
    return;
  }
  if (users[email].password !== pass) {
    loginMsg.innerText = "Contraseña incorrecta.";
    return;
  }

  // success: set session and show home
  localStorage.setItem("codequestUser", email);
  localStorage.setItem("lastUser", email); // remember last
  document.getElementById("user-email").innerText = email;
  loginScreen.style.display = "none";
  homeScreen.style.display = "block";
};

/* -------------------------
   REGISTER: render form + auto-login after create
------------------------- */
function renderRegistroForm() {
  const metodo = metodoSelect.value;
  formularioDinamico.innerHTML = `
    <input id="reg-email" type="text" placeholder="${metodo==='email' ? 'Correo electrónico' : 'Teléfono'}">
    <input id="reg-pass" type="password" placeholder="Contraseña">
    <button id="btn-crear" class="btn primary" style="margin-top:10px;">Crear Cuenta</button>
  `;
  document.getElementById("btn-crear").onclick = () => {
    const email = document.getElementById("reg-email").value.trim();
    const pass = document.getElementById("reg-pass").value.trim();
    if (!email || !pass) {
      registroMsg.style.color = "red";
      registroMsg.innerText = "Llena los campos.";
      return;
    }
    const users = getUsers();
    if (users[email]) {
      registroMsg.style.color = "red";
      registroMsg.innerText = "Cuenta ya existe.";
      return;
    }
    users[email] = { password: pass };
    saveUsers(users);
    // Auto-login after create:
    localStorage.setItem("codequestUser", email);
    localStorage.setItem("lastUser", email);
    document.getElementById("user-email").innerText = email;
    registroMsg.style.color = "#00ff99";
    registroMsg.innerText = "Cuenta creada. Entrando...";
    // show home
    setTimeout(() => {
      loginScreen.style.display = "none";
      homeScreen.style.display = "block";
    }, 600);
  };
}
metodoSelect.addEventListener("change", renderRegistroForm);
renderRegistroForm();

/* -------------------------
   AVATAR upload (persists)
------------------------- */
avatarImg.onclick = () => avatarInp.click();
avatarInp.addEventListener("change", e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    localStorage.setItem("avatarImg", r.result);
    avatarImg.src = r.result;
  };
  r.readAsDataURL(f);
});

/* -------------------------
   LOGOUT: go back to login but keep saved users and prefill
------------------------- */
document.getElementById("btn-logout").addEventListener("click", () => {
  // keep users intact (we don't delete them)
  const current = localStorage.getItem("codequestUser");
  if (current) {
    // prefill login fields
    const users = getUsers();
    document.getElementById("login-email").value = current;
    if (users[current] && users[current].password) document.getElementById("login-pass").value = users[current].password;
  }
  localStorage.removeItem("codequestUser");
  homeScreen.style.display = "none";
  loginScreen.style.display = "flex";
});

/* -------------------------
   GO TO GAME
------------------------- */
jsButton.onclick = () => {
  homeScreen.style.display = "none";
  gameSection.style.display = "block";
};

/* -------------------------
   CHALLENGES (20): 5 easy, 7 medium, 8 hard
   For hard examples, provide hints, not full code.
------------------------- */
const challenges = [
  // EASY (5)
  { level:"easy", prompt:"Escribe console.log('Hola');", answerRegex:/console\.log\s*\(\s*['"]Hola['"]\s*\)/i, example:"console.log('Hola Mundo');", explain:"console.log muestra texto en consola." },
  { level:"easy", prompt:"Declara let edad;", answerRegex:/\blet\s+edad\b/i, example:"let nombre = 'Ana';", explain:"let declara una variable." },
  { level:"easy", prompt:"Crea una variable nombre con tu nombre.", answerRegex:/let\s+nombre\s*=\s*['"].+['"]/i, example:"let ciudad = 'México';", explain:"Strings se escriben con comillas." },
  { level:"easy", prompt:"Escribe un comentario de una línea (// ...).", answerRegex:/\/\//, example:"// Este es un comentario", explain:"Los comentarios ayudan a documentar." },
  { level:"easy", prompt:"Imprime un número con console.log(25);", answerRegex:/console\.log\s*\(\s*\d+\s*\)/, example:"console.log(25);", explain:"También puedes imprimir números." },

  // MEDIUM (7)
  { level:"medium", prompt:"Función saludar() que imprima 'Hola'.", answerRegex:/function\s+saludar\s*\(\)\s*\{[\s\S]*console\.log/i, example:"function saludar(){ console.log('Hola'); }", explain:"Funciones agrupan acciones." },
  { level:"medium", prompt:"If que muestre 'Mayor' si edad > 18.", answerRegex:/if\s*\(\s*edad\s*>\s*18\s*\)/i, example:"if (edad > 18) { console.log('Mayor'); }", explain:"If ejecuta código según condición." },
  { level:"medium", prompt:"Array con 3 frutas.", answerRegex:/\[\s*['"].+['"]\s*,\s*['"].+['"]\s*,\s*['"].+['"]\s*\]/, example:"let frutas = ['manzana','pera','uva'];", explain:"Arrays almacenan listas." },
  { level:"medium", prompt:"For que imprima 1 a 3.", answerRegex:/for\s*\(\s*let\s+\w+\s*=\s*1\s*;.*\)/i, example:"for (let i=1;i<=3;i++){ console.log(i); }", explain:"For repite instrucciones." },
  { level:"medium", prompt:"Objeto persona con nombre y edad.", answerRegex:/\{\s*nombre\s*:\s*['"].+['"]\s*,\s*edad\s*:\s*\d+\s*\}/i, example:"let persona = { nombre:'Ana', edad:20 };", explain:"Objetos contienen propiedades." },
  { level:"medium", prompt:"Usa return en function sumar(a,b).", answerRegex:/return\s+\w+\s*\+\s*\w+/, example:"function sumar(a,b){ return a + b; }", explain:"Return devuelve un valor." },
  { level:"medium", prompt:"Función flecha que haga console.log", answerRegex:/=>\s*\{[\s\S]*console\.log/i, example:"const f = () => { console.log('x'); }", explain:"Arrow functions son sintaxis corta." },

  // HARD (8) - examples are HINTS/partial, not full solutions
  { level:"hard", prompt:"Función que recorra un array e imprima cada elemento.", answerRegex:/(for\s*\(|\.forEach\s*\()/i, example:"Hint: usa for(...) o array.forEach(...)", explain:"Recorre arrays con for o forEach." },
  { level:"hard", prompt:"Objeto con método que imprima un mensaje (método dentro del objeto).", answerRegex:/\w+\s*:\s*(function|\(\)\s*=>)/i, example:"Hint: objeto.prop = function() { ... }", explain:"Los métodos son funciones dentro de objetos." },
  { level:"hard", prompt:"Promesa que se resuelva (new Promise).", answerRegex:/new\s+Promise\s*\(/i, example:"Hint: new Promise((resolve,reject)=>{ ... })", explain:"Las promesas manejan async." },
  { level:"hard", prompt:"Crear una función que filtre números pares de un array.", answerRegex:/\.filter\s*\(/i, example:"Hint: usa array.filter(x => x % 2 === 0)", explain:"filter devuelve un nuevo array con elementos que cumplen condición." },
  { level:"hard", prompt:"Crear una función que devuelva la suma de un array.", answerRegex:/reduce\s*\(/i, example:"Hint: array.reduce((acc,x)=>acc+x,0)", explain:"reduce acumula valores del array." },
  { level:"hard", prompt:"Transformar array de strings a mayúsculas.", answerRegex:/\.map\s*\(/i, example:"Hint: array.map(s => s.toUpperCase())", explain:"map transforma elementos y devuelve un nuevo array." },
  { level:"hard", prompt:"Usa async/await para esperar una promesa.", answerRegex:/async\s+function|await\s+/i, example:"Hint: async function f(){ const r = await p; }", explain:"await espera promesas dentro de funciones async." },
  { level:"hard", prompt:"Arregla un bucle for para que imprima 0..4 correctamente.", answerRegex:/for\s*\(\s*let\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*5\s*;\s*\w+\+\+\s*\)/i, example:"Hint: for (let i = 0; i < 5; i++) { ... }", explain:"Controla inicio, condición y paso del for." }
];

/* -------------------------
   LEVEL BUTTONS
------------------------- */
document.querySelectorAll(".level-btn").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".level-btn").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    currentLevel = b.dataset.level;
  });
});

/* -------------------------
   START CHALLENGE
------------------------- */
startBtn.addEventListener("click", () => {
  if (!currentLevel) { alert("Selecciona un nivel."); return; }
  currentChallenges = challenges.filter(c => c.level === currentLevel);
  currentIndex = 0;
  loadChallenge(currentChallenges[currentIndex]);
});

/* -------------------------
   LOAD CHALLENGE: show prompt + example + explain
------------------------- */
function loadChallenge(ch) {
  challengeInstructions.innerHTML = `<p><strong>Reto:</strong> ${ch.prompt}</p>`;
  // example is a hint (especially in hard)
  exampleBox.style.display = "block";
  exampleText.textContent = ch.example;
  explainBox.style.display = "block";
  explainText.textContent = ch.explain;
  resultDiv.style.display = "none";
  nextBtn.style.display = "none";
  if (monacoEditor) monacoEditor.setValue("");
  if (ch.level === "hard") startTimer(120);
  else { timerDiv.innerText = "Tiempo: --"; clearInterval(timer); }
}

/* -------------------------
   TIMER (hard)
------------------------- */
function startTimer(seconds) {
  if (timer) clearInterval(timer);
  timeLeft = seconds;
  timerDiv.innerText = "Tiempo: " + timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timerDiv.innerText = "Tiempo: " + timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      resultDiv.style.display = "block";
      resultDiv.style.color = "red";
      resultDiv.innerText = "Tiempo agotado.";
      nextBtn.style.display = "block";
    }
  }, 1000);
}

/* -------------------------
   CHECK ANSWER
------------------------- */
checkBtn.addEventListener("click", () => {
  if (!monacoEditor) return;
  const userCode = monacoEditor.getValue();
  const ch = currentChallenges[currentIndex];
  if (!ch) return;
  // basic check using regex
  if (ch.answerRegex.test(userCode)) {
    resultDiv.style.display = "block";
    resultDiv.style.color = "#00ff8c";
    resultDiv.innerText = "¡Correcto! " + (ch.explain || "");
    nextBtn.style.display = "inline-block";
  } else {
    resultDiv.style.display = "block";
    resultDiv.style.color = "#ff6b6b";
    resultDiv.innerText = "Incorrecto. Revisa el ejemplo o la explicación.";
  }
});

/* -------------------------
   NEXT
------------------------- */
nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex >= currentChallenges.length) {
    // level finished -> loop back or congratulate
    currentIndex = 0;
    resultDiv.style.display = "block";
    resultDiv.style.color = "#fff";
    resultDiv.innerText = "Has completado el conjunto. Puedes repetir o cambiar nivel.";
  }
  loadChallenge(currentChallenges[currentIndex]);
});

/* -------------------------
   MONACO INIT + THEME + BLOCK PASTE + ANIM
------------------------- */
require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs" }});
require(["vs/editor/editor.main"], () => {

  monaco.editor.defineTheme("codequest-dark", {
    base: "vs-dark", inherit:true,
    rules: [
      { token:"comment", foreground:"7CFC00", fontStyle:"italic" },
      { token:"string", foreground:"FFA657" },
      { token:"keyword", foreground:"4FC3F7", fontStyle:"bold" },
      { token:"number", foreground:"D7FF70" },
      { token:"operator", foreground:"FF79C6" },
      { token:"boolean", foreground:"80D4FF" },
      { token:"function", foreground:"F8EA7E" }
    ],
    colors: {
      "editor.background":"#1a1a1a",
      "editorLineNumber.foreground":"#00ff66",
      "editorLineNumber.activeForeground":"#66ffb3",
      "editorCursor.foreground":"#ffffff",
      "editor.foreground":"#e8ffe8",
      "editor.selectionBackground":"#264f78",
      "editor.lineHighlightBackground":"#2a2a2a"
    }
  });

  monacoEditor = monaco.editor.create(document.getElementById("monaco-editor"), {
    value: "",
    language: "javascript",
    theme: "codequest-dark",
    automaticLayout: true,
    fontSize: 15,
    minimap: { enabled:false }
  });

  // BLOCK CTRL/CMD + C/V/X only inside the editor
  monacoEditor.onKeyDown(e => {
    const be = e.browserEvent;
    const key = (be.key || "").toLowerCase();
    if ((e.ctrlKey || e.metaKey) && ["c","v","x"].includes(key)) {
      e.preventDefault();
      // show toast + shake editor
      showToast("No copies ni pegues — eso retrasa tu aprendizaje", "warn", 1400);
      // also show result box with message
      resultDiv.style.display = "block";
      resultDiv.style.color = "#ff6b6b";
      resultDiv.innerText = "No copies/pegues — intenta resolverlo tú.";
    }
  });

  // onPaste event handler (some envs)
  monacoEditor.onDidPaste(() => {
    // Remove zero-width chars if pasted
    const v = monacoEditor.getValue();
    const cleaned = v.replace(/[\u200B-\u200D\uFEFF]/g, "");
    if (cleaned !== v) monacoEditor.setValue(cleaned);
    // show toast & message
    showToast("No copies ni pegues — practica te ayuda a aprender", "warn", 1400);
    resultDiv.style.display = "block";
    resultDiv.style.color = "#ff6b6b";
    resultDiv.innerText = "No copies/pegues — intenta resolverlo tú.";
  });

}); // require end

/* -------------------------
   END SCRIPT
------------------------- */

/* ============================================================
   ABANDONAR JUEGO → REGRESAR A HOME
============================================================ */
const btnExit = document.getElementById("btn-exit");

btnExit.addEventListener("click", () => {
  // detener temporizador si está activo
  if (timer) clearInterval(timer);

  // limpiar editor y mensajes
  if (monacoEditor) monacoEditor.setValue("");
  resultDiv.style.display = "none";
  nextBtn.style.display = "none";

  // volver a pantalla principal
  gameSection.style.display = "none";
  homeScreen.style.display = "block";
});

fetch("http://127.0.0.1:8000/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
})
.then(r => r.json())
.then(data => {
    if(data.ok){
        // entrar
    } else {
        loginMsg.innerText = data.msg;
    }
});


