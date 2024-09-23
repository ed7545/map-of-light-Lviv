// Елементи
const menuBtn = document.getElementById('menu-btn');
const menuPanel = document.getElementById('menu-panel');
const closeBtn = document.getElementById('close-btn');
const backdrop = document.getElementById('backdrop');
const mapDiv = document.getElementById('map');

// Відкрити меню
menuBtn.addEventListener('click', () => {
    menuPanel.classList.add('open');
    backdrop.classList.add('show');
    mapDiv.classList.add('blur'); // Додаємо нечіткість до мапи
});

// Закрити меню
closeBtn.addEventListener('click', () => {
    menuPanel.classList.remove('open');
    backdrop.classList.remove('show');
    mapDiv.classList.remove('blur');
});

// Закрити меню при кліку на затемнення
backdrop.addEventListener('click', () => {
    menuPanel.classList.remove('open');
    backdrop.classList.remove('show');
    mapDiv.classList.remove('blur');
});
