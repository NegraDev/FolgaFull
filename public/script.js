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
const db = firebase.firestore();

const currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let reminders = {};

// Adiciona listener em tempo real para atualizações
function setupRealtimeListener() {
    db.collection("reminders")
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === "modified") {
                    reminders[change.doc.id] = change.doc.data();
                } else if (change.type === "removed") {
                    delete reminders[change.doc.id];
                }
            });
            generateCalendar(currentMonth, currentYear);
        }, (error) => {
            console.error("Erro ao escutar mudanças:", error);
        });
}

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
    calendarDays.innerHTML = '';

    let prevMonthDay = new Date(year, month, 0).getDate() - firstDayOfMonth + 1;
    for (let i = 0; i < firstDayOfMonth; i++) {
        const prevMonthDayElement = document.createElement("div");
        prevMonthDayElement.textContent = prevMonthDay++;
        prevMonthDayElement.classList.add("prev-month");
        calendarDays.appendChild(prevMonthDayElement);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        const reminderKey = `${year}-${month + 1}-${day}`;
        
        // Cria container do dia com número e preview do lembrete
        dayElement.innerHTML = `
            <span class="day-number">${day}</span>
            <div class="reminder-preview"></div>
        `;

        if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
            dayElement.classList.add("today");
        }

        // Adiciona indicadores de lembrete se existir
        if (reminders[reminderKey]) {
            const reminder = reminders[reminderKey];
            dayElement.classList.add("has-reminder", `user-${reminder.user}`);
            
            // Adiciona preview do lembrete
            const previewEl = dayElement.querySelector('.reminder-preview');
            previewEl.textContent = reminder.text.substring(0, 15) + (reminder.text.length > 15 ? '...' : '');
            
            // Adiciona tooltip com lembrete completo
            dayElement.title = `${reminder.user === 'user1' ? 'Celle' : 'Tati'}: ${reminder.text}`;
        }

        dayElement.classList.add("active");
        dayElement.onclick = () => openModal(day, month, year);
        calendarDays.appendChild(dayElement);
    }
}

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

function openModal(day, month, year) {
    const reminderDate = `${year}-${month + 1}-${day}`;
    const reminder = reminders[reminderDate];
    
    document.getElementById("reminder-date").value = reminderDate;
    document.getElementById("reminder-user").value = reminder ? reminder.user : 'user1';
    document.getElementById("reminder-text").value = reminder ? reminder.text : '';
    document.getElementById("reminder-modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("reminder-modal").style.display = "none";
}

function saveReminder() {
    const reminderDate = document.getElementById("reminder-date").value;
    const user = document.getElementById("reminder-user").value;
    const reminderText = document.getElementById("reminder-text").value;

    if (!reminderText.trim()) {
        alert('Por favor, digite um lembrete');
        return;
    }

    const reminderRef = db.collection("reminders").doc(reminderDate);
    reminderRef.set({
        user: user,
        text: reminderText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        closeModal();
    }).catch((error) => {
        console.error("Erro ao salvar lembrete: ", error);
        alert('Erro ao salvar o lembrete. Tente novamente.');
    });
}

// Inicializa o listener em tempo real
setupRealtimeListener();