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


// Елементи для панелі "Про нас"
const aboutUsPanel = document.querySelector('.about-us-panel');
const aboutUsButton = document.querySelector('.about-button');
const closeAboutUsButton = document.querySelector('.close-about-us');

// Функція для закриття панелі "Про нас"
function closeAboutUs() {
    aboutUsPanel.classList.add('hidden');
    aboutUsButton.classList.remove('active');  // Забираємо активний стан кнопки
    map.getContainer().style.filter = 'none';  // Знімаємо блюр
}

// Відкрити/закрити панель "Про нас"
aboutUsButton.addEventListener('click', () => {
    if (aboutUsPanel.classList.contains('hidden')) {
        aboutUsPanel.classList.remove('hidden');
        aboutUsButton.classList.add('active');  // Робимо кнопку активною
        map.getContainer().style.filter = 'blur(5px)';
    } else {
        closeAboutUs();
    }
});

// Закрити панель "Про нас" за допомогою хрестика
closeAboutUsButton.addEventListener('click', closeAboutUs);

// Закриття панелі "Про нас" при натисканні на інші кнопки
menuBtn.addEventListener('click', () => {
    closeAboutUs();  // Закриваємо "Про нас"
    // Інші дії для меню...
});

settingsButton.addEventListener('click', () => {
    closeAboutUs();  // Закриваємо "Про нас"
    // Інші дії для налаштувань...
});
// Оновлення часу для мобільної версії
const mobileSlider = document.getElementById('mobileSlider');
const mobileTime = document.getElementById('mobileTime');
mobileSlider.oninput = function() {
  mobileTime.innerHTML = this.value + ":00";
}

// Оновлення часу для комп'ютерної версії
const desktopSlider = document.getElementById('desktopSlider');
const desktopTime = document.getElementById('desktopTime');
desktopSlider.oninput = function() {
  desktopTime.innerHTML = this.value + ":00";
}

// Логіка для відкриття/закриття панелі і сховання часової шкали
function togglePanel() {
  document.body.classList.toggle('panel-open');
}

