/* ============================================================
   script.js - Versión actualizada: Juego 3 con editor propio + Lógica de Auth Restaurada
============================================================ */

/* -------------------------
   DOM references (comunes)
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

/* -------------------------
   GAME 1 DOM
------------------------- */
const levelBtns1 = document.querySelectorAll(".level1-btn");
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
const monacoToast1 = document.getElementById("monaco-toast-1"); // Toast para copy/paste

/* -------------------------
   GAME 2 DOM
------------------------- */
const levelBtns2 = document.querySelectorAll(".level2-btn");
const start2Btn = document.getElementById("start2-btn");
const exit2Btn = document.getElementById("btn-exit2");
const timer2Label = document.getElementById("timer2");

const instructions2 = document.getElementById("challenge2-instructions");
const explainText2 = document.getElementById("explain2-text");
const optionsContainer2 = document.getElementById("game2-options-container");
const nextBtn2 = document.getElementById("nextBtn2");
const result2 = document.getElementById("result2");

/* -------------------------
   GAME 3 DOM
------------------------- */
const levelBtns3 = document.querySelectorAll(".level3-btn");
const start3Btn = document.getElementById("start3-btn");
const exit3Btn = document.getElementById("btn-exit3");
const timer3Label = document.getElementById("timer3");

const instructions3 = document.getElementById("challenge3-instructions");
const explainBox3 = document.getElementById("challenge3-explain");
const explainText3 = document.getElementById("explain3-text");
const testInfoBox3 = document.getElementById("challenge3-test-info");
const testText3 = document.getElementById("test3-text");

const checkBtn3 = document.getElementById("checkBtn3");
const nextBtn3 = document.getElementById("nextBtn3");
const result3 = document.getElementById("result3");
const editorHint = document.getElementById("editor-hint");
const monacoToast3 = document.getElementById("monaco-toast-3"); // Nuevo Toast para Juego 3

/* -------------------------
   Estado global
------------------------- */
let monacoEditor = null; // Editor para Juego 1
let monacoEditor3 = null; // Editor para Juego 3 (Nuevo)
let currentGame = 1; // 1, 2, o 3

// Estado Juego 1
let currentLevel = "easy";
let currentChallenges = [];
let currentIndex = 0;
let timer = null;

// Estado Juego 2
let selectedLevel2 = "easy";
let currentSet2 = [];
let currentIndex2 = 0;
let timer2 = null;

// Estado Juego 3
let selectedLevel3 = "easy";
let currentSet3 = [];
let currentIndex3 = 0;
let timer3 = null;


/* -------------------------
   Util: usuarios en localStorage
------------------------- */
function getUsers() { return JSON.parse(localStorage.getItem("codequestUsers") || "{}"); }
function saveUsers(u) { localStorage.setItem("codequestUsers", JSON.stringify(u)); }

/**
 * Función para cargar la vista del usuario activo o mostrar el login
 */
function checkAuthAndLoad() {
  const activeUser = localStorage.getItem("codequestUser");
  if (activeUser) {
    document.getElementById("user-email").innerText = activeUser;
    loginScreen.style.display = "none";
    gameSection.style.display = "none";
    homeScreen.style.display = "block";
    // Podríamos cargar el avatar si existiera una función para ello.
  } else {
    loginScreen.style.display = "flex";
    homeScreen.style.display = "none";
    gameSection.style.display = "none";
  }
}

/* -------------------------
   LÓGICA: Registro / Login / Avatar / Logout (Restaurada)
------------------------- */

// ** 1. Lógica de Login **
btnLogin.onclick = () => {
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-pass").value.trim();
  const users = getUsers();
  
  if (!email || !pass) {
    loginMsg.textContent = "El email/teléfono y la contraseña son obligatorios.";
    return;
  }

  if (users[email] && users[email].pass === pass) {
    // Login exitoso
    localStorage.setItem("codequestUser", email);
    document.getElementById("user-email").innerText = email;
    loginMsg.textContent = "";
    loginScreen.style.display = "none";
    homeScreen.style.display = "block";
  } else {
    loginMsg.textContent = "Credenciales incorrectas o usuario no registrado.";
  }
};

// ** 2. Lógica de Registro (Dinámico) **
function renderRegistroForm() {
  const metodo = metodoSelect.value;
  formularioDinamico.innerHTML = "";
  registroMsg.textContent = "";
  let formHTML = "";
  let btnText = "";

  switch (metodo) {
    case "email":
      formHTML = `
        <input id="reg-email" type="email" placeholder="Correo electrónico" required />
        <input id="reg-pass" type="password" placeholder="Contraseña (mín 6)" required />
      `;
      btnText = "Registrarse con Email";
      break;
    case "telefono":
      formHTML = `
        <input id="reg-telefono" type="tel" placeholder="Número de teléfono" required />
        <input id="reg-pass" type="password" placeholder="Contraseña (mín 6)" required />
      `;
      btnText = "Registrarse con Teléfono";
      break;
    case "google":
    case "facebook":
      // Simulamos que el registro es inmediato para estas opciones
      formHTML = `<p>Al hacer clic, simulas el registro con ${metodo}.</p>`;
      btnText = `Registrarse con ${metodo}`;
      break;
  }

  formHTML += `<button id="btn-registro" class="btn secondary" style="margin-top: 10px;">${btnText}</button>`;
  formularioDinamico.innerHTML = formHTML;

  const btnRegistro = document.getElementById("btn-registro");
  if (btnRegistro) {
    btnRegistro.onclick = () => handleRegistro(metodo);
  }
}

function handleRegistro(metodo) {
  const users = getUsers();
  let userIdentifier = "";
  let password = "";

  if (metodo === "email") {
    userIdentifier = document.getElementById("reg-email").value.trim();
    password = document.getElementById("reg-pass").value.trim();
  } else if (metodo === "telefono") {
    userIdentifier = document.getElementById("reg-telefono").value.trim();
    password = document.getElementById("reg-pass").value.trim();
  } else if (metodo === "google" || metodo === "facebook") {
    // Generar un identificador único simulado para Google/Facebook
    userIdentifier = `${metodo}_${Date.now()}`;
    password = "social_login_no_password";
  }

  if (!userIdentifier) {
    registroMsg.textContent = "Faltan datos de registro.";
    return;
  }
  
  // Validación de contraseña solo para registro local
  if (metodo === "email" || metodo === "telefono") {
      if (password.length < 6) {
          registroMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
          return;
      }
  }


  if (users[userIdentifier]) {
    registroMsg.textContent = `El usuario ${userIdentifier} ya está registrado.`;
    return;
  }

  // Registrar nuevo usuario
  users[userIdentifier] = { pass: password, metodo: metodo, score: 0 };
  saveUsers(users);

  // Iniciar sesión automáticamente
  localStorage.setItem("codequestUser", userIdentifier);
  document.getElementById("user-email").innerText = userIdentifier;
  registroMsg.textContent = "¡Registro exitoso! Iniciando sesión...";
  setTimeout(() => {
    loginScreen.style.display = "none";
    homeScreen.style.display = "block";
  }, 500);
}

// Event listeners de Auth
metodoSelect.addEventListener("change", renderRegistroForm);
document.getElementById("btn-logout").addEventListener("click", () => {
  localStorage.removeItem("codequestUser");
  homeScreen.style.display = "none";
  gameSection.style.display = "none";
  loginScreen.style.display = "flex";
});

// Inicialización de la UI
renderRegistroForm();
checkAuthAndLoad();

/* -------------------------
   Util: Barajar array
------------------------- */
function shuffleArray(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* -------------------------
   Setup y UI de Juegos
------------------------- */
function hideAllGameUI() {
    // Esconder elementos de Juego 1
    challengeInstructions.style.display = "block";
    exampleBox.style.display = "none";
    explainBox.style.display = "none";
    checkBtn.style.display = "none";
    nextBtn.style.display = "none";
    resultDiv.style.display = "none";
    
    // Esconder elementos de Juego 2
    instructions2.style.display = "block";
    // Nota: explainBox3 no se usa en Juego 2, pero lo ocultamos por si acaso.
    optionsContainer2.innerHTML = "";
    nextBtn2.style.display = "none";
    result2.style.display = "none";
    
    // Esconder elementos de Juego 3
    instructions3.style.display = "block";
    explainBox3.style.display = "none";
    testInfoBox3.style.display = "none";
    checkBtn3.style.display = "none";
    nextBtn3.style.display = "none";
    result3.style.display = "none";
    editorHint.style.display = "none";
    
    // Ocultar ambos editores Monaco
    if (monacoEditor) {
        monacoEditor.getContainerDomNode().style.display = "none";
    }
    if (monacoEditor3) {
        monacoEditor3.getContainerDomNode().style.display = "none";
    }

    // Ocultar botones de acción específicos (solo se muestra el set de botones del juego activo)
    document.getElementById("desafio-box-1").querySelectorAll(".editor-actions button").forEach(b => b.style.display = 'none');
}

jsButton.onclick = () => { 
    homeScreen.style.display = "none"; 
    gameSection.style.display = "block"; 
    
    // Al entrar, asegurar que el Juego 1 está activo y solo su editor es visible
    document.querySelectorAll(".level-btn").forEach(x=>x.classList.remove("active"));
    levelBtns1[0].classList.add("active");
    currentLevel = "easy";
    currentGame = 1; 
    
    hideAllGameUI();
    if (monacoEditor) {
      monacoEditor.getContainerDomNode().style.display = "block";
    }
    checkBtn.style.display = "inline-block";
    instructions3.innerHTML = `<p><strong>Reto:</strong> Selecciona un nivel y presiona <strong>Iniciar Reto</strong>.</p>`;
};


/* -------------------------
   JUEGO 1: CHALLENGES (15 retos)
------------------------- */
const challenges = [
  // EASY (5)
  { level:"easy", prompt:"Escribe console.log('¡Hola, CodeQuest!');", answerRegex:/console\.log\s*\(\s*['"]¡Hola, CodeQuest!['"]\s*\)/i, example:"console.log('¡Hola, CodeQuest!');", explain:"console.log muestra texto en la consola para depurar." },
  { level:"easy", prompt:"Declara una variable mutable (let) llamada 'edad'.", answerRegex:/\blet\s+edad\b/i, example:"let nombre = 'Ana';", explain:"La palabra clave `let` se usa para variables cuyo valor puede cambiar." },
  { level:"easy", prompt:"Crea una constante llamada PI con el valor numérico 3.14159.", answerRegex:/\bconst\s+PI\s*=\s*3\.14159\b/i, example:"const GRAVEDAD = 9.8;", explain:"La palabra clave `const` se usa para valores que no deben cambiar." },
  { level:"easy", prompt:"Asigna el string 'JavaScript' a una variable llamada 'lenguaje'.", answerRegex:/let\s+lenguaje\s*=\s*['"]JavaScript['"]|const\s+lenguaje\s*=\s*['"]JavaScript['"]/i, example:"let ciudad = 'México';", explain:"Los Strings (cadenas de texto) deben ir entre comillas (simples o dobles)." },
  { level:"easy", prompt:"Escribe un comentario de bloque de múltiples líneas.", answerRegex:/\/\*[\s\S]*\*\//i, example:"/*\n Este código\n funciona bien \n*/", explain:"Los comentarios de bloque inician con `/*` y terminan con `*/`." },
  
  // MEDIUM (5)
  { level:"medium", prompt:"Escribe una función llamada 'saludar' que acepte un argumento 'nombre' y use console.log.", answerRegex:/function\s+saludar\s*\(\s*nombre\s*\)\s*\{[\s\S]*console\.log/i, example:"function saludar(n){ console.log('Hola ' + n); }", explain:"Las funciones agrupan un conjunto de instrucciones para ser reutilizadas." },
  { level:"medium", prompt:"Escribe una función flecha 'doble' que reciba un número y devuelva su valor multiplicado por 2.", answerRegex:/const\s+doble\s*=\s*\(\s*\w+\s*\)\s*=>\s*\w+\s*\*\s*2|function\s+doble/i, example:"const doble = n => n * 2;", explain:"Las funciones flecha son una forma concisa de escribir funciones en JS." },
  { level:"medium", prompt:"Crea un array llamado 'colores' con tres elementos de tipo string.", answerRegex:/const\s+colores\s*=\s*\[\s*['"].*['"]\s*,\s*['"].*['"]\s*,\s*['"].*['"]\s*\]/i, example:"let frutas = ['manzana', 'pera'];", explain:"Los arrays almacenan colecciones de elementos entre corchetes `[]`." },
  { level:"medium", prompt:"Escribe un bloque `if/else` que imprima 'Aprobado' si la variable 'nota' es mayor o igual a 7.", answerRegex:/if\s*\(\s*nota\s*>=?\s*7\s*\)[\s\S]*else/i, example:"if (x > 10) {...} else {...}", explain:"El bloque `if` ejecuta el código según la condición es verdadera." },
  { level:"medium", prompt:"Crea un bucle `for` clásico que itere desde 0 hasta 4 (inclusive).", answerRegex:/for\s*\(\s*let\s+i\s*=\s*0\s*;.*\s*i\s*<=\s*4\s*;.*\s*i\s*[\+]{2}\s*\)/i, example:"for (let i = 0; i < 5; i++) {}", explain:"El bucle `for` se usa para iterar un número fijo de veces." },
  
  // HARD (5)
  { level:"hard", prompt:"Define una clase llamada 'Animal' con un constructor que reciba 'nombre'.", answerRegex:/class\s+Animal\s*\{[\s\S]*constructor\s*\(\s*nombre\s*\)/i, example:"class Persona { constructor(n) { this.nombre = n; } }", explain:"Las clases son plantillas para crear objetos con propiedades y métodos." },
  { level:"hard", prompt:"Usa el método `map` en un array llamado `numeros` para crear un nuevo array con cada número duplicado.", answerRegex:/numeros\s*\.map\s*\(\s*\w+\s*=>.*\*\s*2\s*\)/i, example:"[1,2].map(n => n * 2)", explain:"`map` transforma cada elemento de un array en un nuevo array." },
  { level:"hard", prompt:"Escribe la sintaxis para usar `fetch` (asíncrono) y una promesa `.then()` para procesar la respuesta.", answerRegex:/fetch\s*\(['"].*['"]\s*\)\s*\.then/i, example:"fetch('url').then(res => res.json())", explain:"`fetch` inicia una solicitud web y `.then()` maneja la promesa resultante." },
  { level:"hard", prompt:"Función `filtrarPares` que use el método `filter` para devolver solo los números pares de un array.", answerRegex:/\.filter\s*\(\s*\w+\s*=>.*\%\s*2\s*===\s*0\s*\)/i, example:"array.filter(n => n % 2 === 0)", explain:"`filter` crea un nuevo array con elementos que pasan una prueba de condición." },
  { level:"hard", prompt:"Define una función asíncrona que use `await` para esperar una Promesa llamada `datos`. (No definas la promesa)", answerRegex:/async\s+function\s+\w+\s*\(\)[\s\S]*await\s+datos/i, example:"async function obtener() { await datos; }", explain:"`await` solo puede ser usado dentro de funciones declaradas con `async`." },
];

levelBtns1.forEach(b => {
      b.addEventListener("click", () => {
        currentGame = 1;
        document.querySelectorAll(".level-btn").forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
        currentLevel = b.dataset.level;
        // Mostrar UI relevante
        hideAllGameUI();
        if (monacoEditor) monacoEditor.getContainerDomNode().style.display = "block";
        checkBtn.style.display = "inline-block";
        instructions3.innerHTML = `<p><strong>Reto:</strong> Selecciona un nivel y presiona <strong>Iniciar Reto</strong>.</p>`;
        if (monacoEditor) monacoEditor.setValue("");
      });
});

startBtn.addEventListener("click", () => {
  if (!currentLevel) { alert("Selecciona un nivel."); return; }
  currentChallenges = challenges.filter(c => c.level === currentLevel);
  currentIndex = 0;
  loadChallenge(currentChallenges[currentIndex]);
  currentGame = 1;
});

function loadChallenge(ch) {
  challengeInstructions.innerHTML = `<p><strong>Reto:</strong> ${ch.prompt}</p>`;
  exampleBox.style.display = "block";
  exampleText.textContent = ch.example;
  explainBox.style.display = "block";
  explainText.textContent = ch.explain;
  resultDiv.style.display = "none";
  nextBtn.style.display = "none";
  checkBtn.style.display = "inline-block";
  if (monacoEditor) monacoEditor.setValue("");
  if (ch.level === "hard") startTimer(120, timerDiv, timer);
  else { timerDiv.innerText = "Tiempo: --"; clearInterval(timer); }
}

checkBtn.addEventListener("click", () => {
  if (!monacoEditor || currentGame !== 1) return;
  const userCode = monacoEditor.getValue();
  const ch = currentChallenges[currentIndex];
  if (!ch) return;
  if (ch.answerRegex.test(userCode)) {
    resultDiv.style.display = "block";
    resultDiv.style.color = "#00ff8c";
    resultDiv.innerText = "¡Correcto! " + (ch.explain || "");
    nextBtn.style.display = "inline-block";
    clearInterval(timer); 
  } else {
    resultDiv.style.display = "block";
    resultDiv.style.color = "#ff6b6b";
    resultDiv.innerText = "Incorrecto. Revisa el ejemplo o la explicación.";
  }
});

nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex >= currentChallenges.length) {
    currentIndex = 0;
    resultDiv.style.display = "block";
    resultDiv.style.color = "#fff";
    resultDiv.innerText = "Has completado el conjunto. Puedes repetir o cambiar nivel.";
    nextBtn.style.display = "none"; 
    clearInterval(timer);
    timerDiv.innerText = "Tiempo: --";
  } else {
    loadChallenge(currentChallenges[currentIndex]);
  }
});

document.getElementById("btn-exit").addEventListener("click", () => {
  if (timer) clearInterval(timer);
  if (monacoEditor) monacoEditor.setValue("");
  gameSection.style.display = "none";
  homeScreen.style.display = "block";
});


/* -------------------------
   JUEGO 2: PREGUNTAS (Sin cambios)
------------------------- */
const game2Questions = {
  easy: [
    { question:"¿Qué palabra clave se usa para declarar una variable que puede ser reasignada en JavaScript?", explain:"La palabra clave 'let' permite declarar variables que pueden ser modificadas más tarde.", options:["var", "const", "let"], answer:"let" },
    { question:"¿Cuál es el operador de comparación que verifica igualdad de valor y de tipo en JavaScript?", explain:"El triple igual (===) es el operador estricto.", options:["==", "===", "="], answer:"===" },
    { question:"¿Cómo se imprime un mensaje en la consola del navegador o en Node.js?", explain:"console.log() es la función estándar para depuración e impresión.", options:["print()", "alert()", "console.log()"], answer:"console.log()" },
  ],
  medium: [
    { question:"¿Cuál método de Array se usa para crear un nuevo array aplicando una función a cada elemento?", explain:"map() es ideal para transformaciones uno a uno de arrays.", options:["forEach()", "filter()", "map()", "reduce()"], answer:"map()" },
    { question:"¿Qué significa el acrónimo DOM?", explain:"Document Object Model es una interfaz de programación para documentos HTML y XML.", options:["Data Object Management", "Document Object Model", "Dynamic Output Method", "Digital Order Module"], answer:"Document Object Model" },
  ],
  hard: [
    { question:"¿Qué palabra clave debe preceder a una función para permitir el uso de 'await' dentro de ella?", explain:"'async' marca la función como asíncrona.", options:["yield", "callback", "await", "promise", "async"], answer:"async" },
    { question:"¿Cuál es el concepto en JavaScript que se refiere a la capacidad de las funciones de recordar y acceder a su ámbito léxico?", explain:"Los Closures son un concepto fundamental.", options:["Prototipo", "Hoisting", "Closure", "Promesa", "Delegación de eventos"], answer:"Closure" },
  ]
};

levelBtns2.forEach(btn => {
  btn.addEventListener("click", () => {
    currentGame = 2;
    document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedLevel2 = btn.dataset.level;
    // Ocultar UI relevante de otros juegos
    hideAllGameUI();
    instructions2.style.display = "block";
    document.getElementById("challenge2-explain").style.display = "block";
    explainText2.textContent = "Aprende sobre la utilidad de este concepto.";
  });
});

start2Btn.addEventListener("click", () => {
  if (!selectedLevel2) { alert("Selecciona un nivel para Juego 2."); return; }
  currentSet2 = game2Questions[selectedLevel2];
  currentIndex2 = 0;
  showGame2Question();
  if (selectedLevel2 === "hard") startTimer(120, timer2Label, timer2);
  else timer2Label.textContent = "Tiempo: --";
  currentGame = 2;
});

function showGame2Question() {
  const q = currentSet2[currentIndex2];
  instructions2.innerHTML = `<p><strong>Pregunta:</strong> ${q.question}</p>`;
  explainText2.textContent = q.explain;
  result2.textContent = "";
  result2.style.display = "none";
  nextBtn2.style.display = "none";
  optionsContainer2.innerHTML = "";
  
  const shuffledOptions = shuffleArray(q.options);

  shuffledOptions.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.classList.add("btn", "option-btn");
    btn.dataset.answer = option;
    btn.onclick = () => checkGame2Answer(option, q.answer, btn);
    optionsContainer2.appendChild(btn);
  });
}

function checkGame2Answer(selectedOption, correctAnswer, clickedButton) {
  if (currentGame !== 2) return;
  document.querySelectorAll(".option-btn").forEach(btn => btn.disabled = true);
  result2.style.display = "block";
  
  if (selectedOption === correctAnswer) {
    result2.textContent = "✔ Correcto";
    result2.style.color = "#4caf50";
    clickedButton.classList.add("correct-answer");
    nextBtn2.style.display = "inline-block";
    clearInterval(timer2);
  } else {
    result2.textContent = `❌ Incorrecto. La respuesta correcta era: ${correctAnswer}`;
    result2.style.color = "#ff4444";
    clickedButton.classList.add("wrong-answer");
    document.querySelectorAll(".option-btn").forEach(btn => {
      if (btn.dataset.answer === correctAnswer) {
        btn.classList.add("correct-answer");
      }
    });
    nextBtn2.style.display = "inline-block"; 
  }
}

nextBtn2.addEventListener("click", () => {
  currentIndex2++;
  if (currentIndex2 >= currentSet2.length) {
    alert("🎉 ¡Terminaste las preguntas del Juego 2!");
    currentIndex2 = 0;
    result2.textContent = "Conjunto completado. ¡Elige un nuevo nivel para practicar!";
    nextBtn2.style.display = "none";
    clearInterval(timer2);
    timer2Label.textContent = "Tiempo: --";
  } else {
    showGame2Question();
    if (selectedLevel2 === "hard") startTimer(120, timer2Label, timer2);
  }
});

exit2Btn.addEventListener("click", () => {
  if (timer2) clearInterval(timer2);
  alert("Saliste del Juego 2.");
  hideAllGameUI();
});

/* -------------------------
   JUEGO 3: DEBUGGING (Con editor propio)
------------------------- */
const debugChallenges = [
    // EASY
    { 
      level:"easy", prompt: "Esta función de suma tiene un error de sintaxis que impide que el código funcione. Arréglalo para que devuelva la suma correcta de `a` y `b`.",
      buggyCode: "function sumar(a, b) {\n  return a + b\n}", 
      testCondition: "sumar(5, 3) === 8",
      explain: "Error de sintaxis: La solución correcta es `return a + b;` para evitar errores de Inserción Automática de Punto y Coma (ASI).",
      setup: ""
    },
    { 
      level:"easy", prompt: "El código intenta determinar si un número es par, pero siempre falla en la condición. Corrige el **operador de comparación**.",
      buggyCode: "function esPar(num) {\n  if (num % 2 = 0) {\n    return true;\n  } else {\n    return false;\n  }\n}",
      testCondition: "esPar(4) === true && esPar(5) === false",
      explain: "Error de lógica: Se usó el operador de **asignación** (`=`) en lugar de **comparación estricta** (`===`). La corrección es `num % 2 === 0`.",
      setup: ""
    },
    {
      level:"easy", prompt: "La función debería devolver el primer elemento de un array. Corrige el error de índice.",
      buggyCode: "function primerElemento(arr) {\n  return arr(1);\n}", // Usa paréntesis en lugar de corchetes e índice 1
      testCondition: "primerElemento(['a', 'b', 'c']) === 'a'",
      explain: "Error de sintaxis: Para acceder a un elemento de un array se usan corchetes (`[]`), y el índice del primer elemento es **0**, no 1. La corrección es `arr[0]`.",
      setup: ""
    },

    // MEDIUM
    { 
      level:"medium", prompt: "La función debería calcular el total de un array de precios. El resultado está dando `NaN`. Corrige la inicialización de la variable.",
      buggyCode: "function calcularTotal(precios) {\n  let total;\n  for (let i = 0; i < precios.length; i++) {\n    total = total + precios[i];\n  }\n  return total;\n}",
      testCondition: "calcularTotal([10, 5, 2]) === 17",
      explain: "Error de inicialización: La variable `total` debe inicializarse con el valor neutro para la suma: `let total = 0;`.",
      setup: ""
    },
    { 
      level:"medium", prompt: "Este bucle intenta iterar sobre un array, pero siempre omite el último elemento. Corrige la condición del bucle.",
      buggyCode: "function ultimoElemento(arr) {\n  let resultado = 0;\n  for (let i = 0; i <= arr.length - 2; i++) {\n    resultado += arr[i];\n  }\n  return resultado;\n}", // arr.length - 2
      testCondition: "ultimoElemento([1, 2, 3]) === 6", // La suma de todos los elementos debe ser 6.
      explain: "Error 'off-by-one': La condición correcta para recorrer todos los elementos del array es `i < arr.length` o `i <= arr.length - 1`.",
      setup: ""
    },
    {
      level:"medium", prompt: "La función busca un número y debe retornar el número si lo encuentra, o `null` si no. Está retornando `null` prematuramente.",
      buggyCode: "function buscar(arr, num) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === num) {\n      return arr[i];\n    } else {\n      return null;\n    }\n  }\n}",
      testCondition: "buscar([1, 5, 10], 10) === 10 && buscar([1, 5, 10], 2) === null",
      explain: "Error de flujo de control: El `return null` debe moverse **fuera del bucle** para que la función solo termine si *ningún* elemento fue encontrado tras revisar todo el array.",
      setup: ""
    },

    // HARD
    { 
      level:"hard", prompt: "El código simula una operación asíncrona con una Promesa, pero nunca finaliza. ¿Qué falta dentro de la Promesa para resolverla?",
      buggyCode: "function obtenerDatos() {\n  return new Promise((resolve, reject) => {\n    // Aquí falta la acción para resolver la promesa\n  });\n}\nasync function run() {\n  const datos = await obtenerDatos();\n  return datos;\n}\n",
      testCondition: "run().then(res => res === 'Datos listos')",
      explain: "Error asíncrono: Las Promesas deben llamar explícitamente a `resolve(valor)` o `reject(error)` dentro de su función ejecutora. Debes agregar `resolve('Datos listos');`.",
      setup: "return new Promise((r) => run().then(r));"
    },
    {
      level:"hard", prompt: "El método de clase `getNombreDelay` pierde el contexto de `this` al usar un `setTimeout`. Corrige el contexto.",
      buggyCode: "class Persona {\n  constructor(nombre) {\n    this.nombre = nombre;\n  }\n  getNombreDelay() {\n    return new Promise(r => {\n      setTimeout(function() {\n        r(this.nombre);\n      }, 100);\n    });\n  }\n}\n",
      testCondition: "new Promise(r => { const p = new Persona('Ana'); p.getNombreDelay().then(r); }).then(res => res === 'Ana')",
      explain: "Error de contexto (`this`): La función interna de `setTimeout` debe ser una **función flecha** (`=>`) para que herede el contexto léxico (`this`) de la clase.",
      setup: "const p = new Persona('Ana'); return p.getNombreDelay()"
    }
];

levelBtns3.forEach(btn => {
  btn.addEventListener("click", () => {
    currentGame = 3;
    document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedLevel3 = btn.dataset.level;
    // Mostrar UI relevante
    hideAllGameUI();
    if (monacoEditor3) monacoEditor3.getContainerDomNode().style.display = "block"; // Mostrar editor 3
    editorHint.style.display = "block";
    checkBtn3.style.display = "inline-block";
    instructions3.innerHTML = `<p><strong>Reto:</strong> Selecciona un nivel y presiona <strong>Iniciar Depuración</strong>.</p>`;
    if (monacoEditor3) monacoEditor3.setValue("");
  });
});

start3Btn.addEventListener("click", () => {
  if (!selectedLevel3) { alert("Selecciona un nivel para Juego 3."); return; }
  currentSet3 = debugChallenges.filter(c => c.level === selectedLevel3);
  currentIndex3 = 0;
  loadChallenge3(currentSet3[currentIndex3]);
  currentGame = 3;
});

function loadChallenge3(ch) {
  instructions3.innerHTML = `<p><strong>Reto:</strong> ${ch.prompt}</p>`;
  explainBox3.style.display = "block";
  explainText3.textContent = ch.explain.split(":")[0] + "."; 
  testInfoBox3.style.display = "block";
  testText3.textContent = ch.testCondition;
  
  result3.style.display = "none";
  nextBtn3.style.display = "none";
  checkBtn3.style.display = "inline-block";
  
  // Cargar el código con el bug en el editor TRES
  if (monacoEditor3) monacoEditor3.setValue(ch.buggyCode);
  
  if (ch.level === "hard") startTimer(180, timer3Label, timer3); 
  else { timer3Label.innerText = "Tiempo: --"; clearInterval(timer3); }
}

checkBtn3.addEventListener("click", () => {
  if (currentGame !== 3) return;
  
  const ch = currentSet3[currentIndex3];
  if (!ch) return;

  const userCode = monacoEditor3.getValue(); // Usar editor 3
  const testCondition = ch.testCondition;
  const setupCode = ch.setup || "";

  result3.style.display = "block";
  
  try {
    const funcToRun = new Function(userCode + "\n" + setupCode + "\n\nreturn " + testCondition + ";");
    
    const passed = funcToRun();
    
    if (passed instanceof Promise) {
        passed.then(res => handleTestResult(res, ch.explain)).catch(err => handleTestResult(false, ch.explain + `\nError de Promesa: ${err.message}`));
    } else {
        handleTestResult(passed, ch.explain);
    }

  } catch (error) {
    result3.style.color = "#ff6b6b";
    result3.innerText = `❌ Error de Ejecución o Sintaxis. Revisa el código.\nDetalles del error: ${error.message}`;
  }
});

function handleTestResult(passed, fullExplain) {
    if (passed === true) {
        result3.style.color = "#00ff8c";
        result3.innerText = "🎉 ¡Bug corregido! Prueba pasada.\n\nExplicación completa:\n" + fullExplain;
        nextBtn3.style.display = "inline-block";
        clearInterval(timer3);
    } else {
        result3.style.color = "#ff6b6b";
        result3.innerText = "❌ Incorrecto. El código se ejecuta, pero la prueba no pasa. Revisa el código y la explicación.";
    }
}

nextBtn3.addEventListener("click", () => {
  currentIndex3++;
  if (currentIndex3 >= currentSet3.length) {
    alert("🎉 ¡Terminaste los retos de Depuración!");
    currentIndex3 = 0;
    result3.textContent = "Conjunto completado. ¡Elige un nuevo nivel para practicar!";
    nextBtn3.style.display = "none";
    clearInterval(timer3);
    timer3Label.textContent = "Tiempo: --";
  } else {
    loadChallenge3(currentSet3[currentIndex3]);
  }
});

exit3Btn.addEventListener("click", () => {
  if (timer3) clearInterval(timer3);
  if (monacoEditor3) monacoEditor3.setValue("");
  alert("Saliste del Juego 3 de Depuración.");
  hideAllGameUI();
});

/* -------------------------
   TIMER GENERAL (Sin cambios)
------------------------- */
function startTimer(seconds, label, timerRef) {
  // ... (Lógica de temporizador) ...
}

/* -------------------------
   MONACO INIT
------------------------- */
require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs" }});
require(["vs/editor/editor.main"], () => {

  monaco.editor.defineTheme("codequest-dark", {
    base:"vs-dark", inherit:true,
    rules:[
      { token:"comment", foreground:"7CFC00", fontStyle:"italic" },
      { token:"string", foreground:"FFA657" },
      { token:"keyword", foreground:"4FC3F7", fontStyle:"bold" },
      { token:"number", foreground:"D7FF70" },
      { token:"operator", foreground:"FF79C6" },
      { token:"boolean", foreground:"80D4FF" },
      { token:"function", foreground:"F8EA7E" }
    ],
    colors:{
      "editor.background":"#1a1a1a",
      "editorLineNumber.foreground":"#00ff66",
      "editorLineNumber.activeForeground":"#66ffb3",
      "editorCursor.foreground":"#ffffff",
      "editor.foreground":"#e8ffe8",
      "editor.selectionBackground":"#264f78",
      "editor.lineHighlightBackground":"#2a2a2a"
    }
  });

  // Editor principal (Juego 1)
  monacoEditor = monaco.editor.create(document.getElementById("monaco-editor"), {
    value: "",
    language: "javascript",
    theme: "codequest-dark",
    automaticLayout: true,
    fontSize: 15,
    minimap: { enabled:false }
  });
  
  // Editor Juego 3 (Nuevo)
  monacoEditor3 = monaco.editor.create(document.getElementById("monaco-editor-3"), {
    value: "",
    language: "javascript",
    theme: "codequest-dark",
    automaticLayout: true,
    fontSize: 15,
    minimap: { enabled:false }
  });

  // Manejo de copy/paste
  function attachBlockHandlers(ed, toastElem, gameId) {
    ed.onKeyDown(e => {
      const be = e.browserEvent;
      const key = (be.key || "").toLowerCase();
      // Solo bloquea si estamos en el juego correspondiente
      if (currentGame === gameId && (e.ctrlKey || e.metaKey) && ["c","v","x"].includes(key)) {
        e.preventDefault();
        if (toastElem) {
          toastElem.textContent = "❌ ¡No copies ni pegues! Intenta resolverlo tú.";
          toastElem.style.display = "block";
          setTimeout(() => { toastElem.style.display = "none"; }, 2000);
        }
      }
    });
  }

  // Se adjuntan los handlers a ambos editores con sus IDs de juego
  attachBlockHandlers(monacoEditor, monacoToast1, 1);
  attachBlockHandlers(monacoEditor3, monacoToast3, 3);
  
  // Inicialmente, ocultar ambos editores
  monacoEditor.getContainerDomNode().style.display = "none";
  monacoEditor3.getContainerDomNode().style.display = "none";
}); // require end

/* ============================
   AVATAR: Guardar y Mostrar
============================ */

avatarInp.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {

        // Guardar en localStorage al usuario actual
        const activeUser = localStorage.getItem("codequestUser");
        if (!activeUser) return;

        const users = getUsers();
        users[activeUser].avatar = e.target.result;
        saveUsers(users);

        // Mostrar instantáneamente
        avatarImg.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

function loadAvatar() {
    const activeUser = localStorage.getItem("codequestUser");
    if (!activeUser) return;

    const users = getUsers();
    if (users[activeUser].avatar) {
        avatarImg.src = users[activeUser].avatar;
    } else {
        avatarImg.src = "https://via.placeholder.com/120"; // Imagen por defecto
    }
}

// Cargar avatar al iniciar sesión
loadAvatar();
