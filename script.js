// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyApmyUvRZuNl7pkCHSAfpulQgYBh3biHyE",
    authDomain: "folgafull-ef8af.firebaseapp.com",
    projectId: "folgafull-ef8af",
    storageBucket: "folgafull-ef8af.firebasestorage.app",
    messagingSenderId: "620855596543",
    appId: "1:620855596543:web:db5bb80f68bbc5c35083ca"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Inicializa Firestore
const db = firebase.firestore();

// Variáveis para o calendário
const currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Objeto para armazenar os lembretes
let reminders = {};

// Função para gerar o calendário
function generateCalendar(month, year) {
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    document.getElementById("month-year").textContent = `${monthNames[month]} ${year}`;
    const calendarDays = document.getElementById("calendar-days");
    calendarDays.innerHTML = '';  // Limpa os dias anteriores

    // Preenche os dias anteriores do mês
    let prevMonthDay = new Date(year, month, 0).getDate() - firstDayOfMonth + 1;
    for (let i = 0; i < firstDayOfMonth; i++) {
        const prevMonthDayElement = document.createElement("div");
        prevMonthDayElement.textContent = prevMonthDay++;
        prevMonthDayElement.classList.add("prev-month");
        calendarDays.appendChild(prevMonthDayElement);
    }

    // Adiciona os dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        dayElement.textContent = day;

        // Verifica se é o dia de hoje
        if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
            dayElement.classList.add("today");
        }

        // Verifica se há lembretes para o dia
        const reminderKey = `${year}-${month + 1}-${day}`; 
        if (reminders[reminderKey]) {
            dayElement.classList.add("has-reminder");
        }

        dayElement.classList.add("active");
        dayElement.onclick = () => openModal(day, month, year);

        calendarDays.appendChild(dayElement);
    }
}

// Função para mudar o mês
function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
}

// Função para abrir o modal
function openModal(day, month, year) {
    const reminderDate = `${year}-${month + 1}-${day}`;
    document.getElementById("reminder-date").value = reminderDate;
    document.getElementById("reminder-text").value = '';
    document.getElementById("reminder-modal").style.display = "flex";
}

// Função para fechar o modal
function closeModal() {
    document.getElementById("reminder-modal").style.display = "none";
}

// Função para salvar o lembrete
function saveReminder() {
    const reminderDate = document.getElementById("reminder-date").value;
    const user = document.getElementById("reminder-user").value;
    const reminderText = document.getElementById("reminder-text").value;

    // Salva o lembrete no Firestore
    const reminderRef = db.collection("reminders").doc(reminderDate);
    reminderRef.set({
        user: user,
        text: reminderText
    }).then(() => {
        closeModal();
        loadReminders();
    }).catch((error) => {
        console.error("Erro ao salvar lembrete: ", error);
    });
}

// Função para carregar os lembretes do Firestore
function loadReminders() {
    const remindersRef = db.collection("reminders");
    remindersRef.get().then((querySnapshot) => {
        reminders = {};
        querySnapshot.forEach((doc) => {
            const reminderDate = doc.id;
            const reminderData = doc.data();
            reminders[reminderDate] = reminderData.text;
        });
        generateCalendar(currentMonth, currentYear);
    }).catch((error) => {
        console.error("Erro ao carregar lembretes: ", error);
    });
}

// Inicializa o calendário e carrega os lembretes
loadReminders();
