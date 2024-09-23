// Підключення мапи
const map = L.map('map', {
    zoomControl: false  // Вимикаємо стандартне управління масштабуванням
}).setView([49.8397, 24.0297], 13); // Встановлюємо координати для Львова

// Додаємо Google Maps як базовий шар 
L.tileLayer('https://mt1.google.com/vt/lyrs=m&hl=uk&x={x}&y={y}&z={z}', {
    attribution: 'Google'
}).addTo(map);

// Функція для стилізації полігонів на основі даних кольорів
function styleFunction(feature, colorData) {
    const featureId = feature.properties.id; // Отримуємо ID
    const color = colorData[featureId]; // Отримуємо колір з colorData

    return {
        fillColor: color,  // задається колір
        color: 'transparent',    // Колір контуру-прозорий
        weight: 0          // Товщина контуру
    };
}

// Завантажую дані полігонів з файлу data.json
fetch('data.json')
    .then(response => response.json())
    .then(geoData => {
        // Завантажуємо дані кольорів з файлу colors.json
        fetch('colors.json')
            .then(response => response.json())
            .then(colorData => {
                // Додаю GeoJSON полігони на карту
                L.geoJSON(geoData, {
                    style: function (feature) {
                        return styleFunction(feature, colorData); // Використовується стилізація для полігонів
                    }
                }).addTo(map);
            })
            .catch(error => {
                console.error('Помилка завантаження colors.json:', error);
            });
    })
    .catch(error => {
        console.error('Помилка завантаження data.json:', error);
    });


// Додаємо контроль масштабування і переміщуємо його в правий верхній кут
L.control.zoom({
    position: 'topright' // Переміщення в правий верхній кут
}).addTo(map);