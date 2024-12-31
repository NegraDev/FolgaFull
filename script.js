import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBhW8Tr2uCUSgaiqHbY2hAteJO3wX8-GjA",
  authDomain: "calendario-177fb.firebaseapp.com",
  databaseURL: "https://calendario-177fb-default-rtdb.firebaseio.com",
  projectId: "calendario-177fb",
  storageBucket: "calendario-177fb.firebasestorage.app",
  messagingSenderId: "828793511801",
  appId: "1:828793511801:web:f7a0bfa31812438a5c59a8"
};

// Inicializando o Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Função para salvar lembrete no Firebase
function saveReminder(date, user, text) {
    db.ref(`reminders/${date}`).push({ user, text });
}

// Função para carregar lembretes do Firebase
function loadReminders(date, callback) {
    db.ref(`reminders/${date}`).on('value', (snapshot) => {
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
        console.log('Renderizando calendário para:', date);
        const year = date.getFullYear();
        const month = date.getMonth();
        const today = new Date();

        monthYear.textContent = `${months[month]} ${year}`;
        daysContainer.innerHTML = '';

        const lastDay = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay();

        const prevLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = prevLastDay - i;
            dayDiv.classList.add('inactive');
            daysContainer.appendChild(dayDiv);
        }

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

        const totalDays = daysContainer.children.length;
        const nextDays = 42 - totalDays;
        for (let i = 1; i <= nextDays; i++) {
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

