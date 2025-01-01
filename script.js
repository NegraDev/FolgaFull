import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBK42Ho4Dw9_fZ0k9IZVFQb-ShOvRqpoNk",
    authDomain: "folgasfull-748ef.firebaseapp.com",
    databaseURL: "https://folgasfull-748ef-default-rtdb.firebaseio.com",
    projectId: "folgasfull-748ef",
    storageBucket: "folgasfull-748ef.appspot.com",
    messagingSenderId: "289177219327",
    appId: "1:289177219327:web:227c5c4856f570aa7cdcca"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Função para salvar lembrete no Firebase
function saveReminder(date, user, text) {
    const remindersRef = ref(db, `reminders/${date}`);
    push(remindersRef, { user, text });
}

// Função para carregar lembretes do Firebase
function loadReminders(date, callback) {
    const remindersRef = ref(db, `reminders/${date}`);
    onValue(remindersRef, (snapshot) => {
        callback(snapshot.val());
    });
}

// Script principal
document.addEventListener('DOMContentLoaded', function () {
    const monthYear = document.getElementById('month-year');
    const daysContainer = document.getElementById('days');
    const prevMonthBtn = document.getElementById('prev');
    const nextMonthBtn = document.getElementById('next');

    const modal = document.getElementById('reminder-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const reminderForm = document.getElementById('reminder-form');
    const reminderUser = document.getElementById('reminder-user');
    const reminderDate = document.getElementById('reminder-date');
    const reminderText = document.getElementById('reminder-text');

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    let currentDate = new Date();

    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const today = new Date();

        monthYear.textContent = `${months[month]} ${year}`;
        daysContainer.innerHTML = '';

        const lastDay = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay();

        // Dias do mês anterior
        for (let i = 0; i < firstDayIndex; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = new Date(year, month, -i).getDate();
            dayDiv.classList.add('inactive');
            daysContainer.prepend(dayDiv); // Adiciona ao início
        }

        // Dias do mês atual
        for (let i = 1; i <= lastDay; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = i;
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            dayDiv.dataset.date = fullDate;

            if (
                i === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                dayDiv.classList.add('today');
            }

            // Carregar lembretes para o dia
            loadReminders(fullDate, (reminders) => {
                if (reminders) {
                    Object.values(reminders).forEach(reminder => {
                        const badge = document.createElement('span');
                        badge.textContent = reminder.user === 'user1' ? '🟡' : '🟣';
                        badge.title = reminder.text;
                        badge.classList.add('reminder-badge');
                        dayDiv.appendChild(badge);
                    });
                }
            });

            dayDiv.addEventListener('click', () => {
                reminderDate.value = fullDate;
                modal.style.display = 'flex';
            });

            daysContainer.appendChild(dayDiv);
        }

        // Dias do próximo mês
        const remainingDays = 42 - daysContainer.children.length;
        for (let i = 1; i <= remainingDays; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = i;
            dayDiv.classList.add('inactive');
            daysContainer.appendChild(dayDiv);
        }
    }

    function changeMonth(delta) {
        currentDate.setMonth(currentDate.getMonth() + delta);
        renderCalendar(currentDate);
    }

    renderCalendar(currentDate);

    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    reminderForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const user = reminderUser.value;
        const date = reminderDate.value;
        const text = reminderText.value;

        saveReminder(date, user, text); // Salva o lembrete no Firebase
        modal.style.display = 'none';
        reminderForm.reset();
        renderCalendar(currentDate);
    });
});
