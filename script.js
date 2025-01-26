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
        
        // Create day container with number and reminder preview
        dayElement.innerHTML = `
            <span class="day-number">${day}</span>
            <div class="reminder-preview"></div>
        `;

        if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
            dayElement.classList.add("today");
        }

        // Add reminder indicators if exists
        if (reminders[reminderKey]) {
            const reminder = reminders[reminderKey];
            dayElement.classList.add("has-reminder", `user-${reminder.user}`);
            
            // Add reminder preview
            const previewEl = dayElement.querySelector('.reminder-preview');
            previewEl.textContent = reminder.text.substring(0, 15) + (reminder.text.length > 15 ? '...' : '');
            
            // Add tooltip with full reminder
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
        loadReminders();
    }).catch((error) => {
        console.error("Erro ao salvar lembrete: ", error);
        alert('Erro ao salvar o lembrete. Tente novamente.');
    });
}

function loadReminders() {
    const remindersRef = db.collection("reminders");
    remindersRef.get().then((querySnapshot) => {
        reminders = {};
        querySnapshot.forEach((doc) => {
            reminders[doc.id] = doc.data();
        });
        generateCalendar(currentMonth, currentYear);
    }).catch((error) => {
        console.error("Erro ao carregar lembretes: ", error);
    });
}

loadReminders();