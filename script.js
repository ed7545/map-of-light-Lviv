// Підключення мапи
const map = L.map('map', {
  zoomControl: false // Вимикаємо стандартне управління масштабуванням
}).setView([49.8397, 24.0297], 13); // Встановлюємо координати для Львова

// Додаємо Google Maps як базовий шар
L.tileLayer('https://mt1.google.com/vt/lyrs=m&hl=uk&x={x}&y={y}&z={z}', {
  attribution: 'Google'
}).addTo(map);

// Об'єкт для збереження полігонів як масивів
let polygons = {};

// Функція для стилізації полігонів на основі даних кольорів
function styleFunction(feature, color) {
  return {
    fillColor: color, // задається колір
    color: 'transparent', // Колір контуру-прозорий
    weight: 0 // Товщина контуру
  };
}

// Функція для отримання кольору для поточної години
function getCurrentHourColor(colorData, featureId, currentHour) {
  const colors = colorData[featureId];
  return colors ? colors[currentHour] : 'transparent';
}

// Функція для оновлення кольорів полігонів
function updatePolygonsColors(colorData, currentHour) {
  console.log(`Оновлення кольорів полігонів для години: ${currentHour}`);
  Object.keys(polygons).forEach(polygonId => {
    const currentColor = getCurrentHourColor(colorData, polygonId, currentHour);
    polygons[polygonId].forEach(polygon => {
      polygon.setStyle({ fillColor: currentColor });
    });
  });
}

// Функція для завантаження даних кольорів через API
function fetchPolygonColors(currentHour) {
  fetch('https://ed007.pythonanywhere.com/api/colors')
    .then(response => response.json())
    .then(responseData => {
      if (responseData.status === 'success') {
        const colorData = responseData.data;
        updatePolygonsColors(colorData, currentHour);
      } else {
        console.error('Помилка в даних API:', responseData);
      }
    })
    .catch(error => console.error('Помилка завантаження API:', error));
}

// Додаємо API-ключ тут
const ipgeolocationApiKey = '053adea0cbec4e7da8f9f7abe9040068';
// Функція для отримання реального часу у Львові
function fetchLvivTime() {
  fetch('https://ed007.pythonanywhere.com/api/time')
    .then(response => response.json())
    .then(data => {
      const currentHour = new Date(data.datetime).getHours();
      console.log(`Поточна година у Львові: ${currentHour}`);
      fetchPolygonColors(currentHour);
    })
    .catch(error => console.error('Помилка отримання часу:', error));
}

// Завантажуємо дані полігонів з файлу data.json і додаємо на карту
fetch('data.json')
  .then(response => response.json())
  .then(geoData => {
    fetch('https://ed007.pythonanywhere.com/api/colors')
      .then(response => response.json())
      .then(responseData => {
        if (responseData.status === 'success') {
          const colorData = responseData.data;
          // Додаємо GeoJSON полігони на карту і зберігаємо їх як масиви у об'єкті polygons
          L.geoJSON(geoData, {
            style: function (feature) {
              const featureId = feature.properties.id;
              const initialColor = getCurrentHourColor(colorData, featureId, new Date().getHours());
              const polygon = L.geoJSON(feature, {
                style: styleFunction(feature, initialColor)
              }).addTo(map);

              // Перевіряємо, чи вже існує масив для цього ID
              if (!polygons[featureId]) {
                polygons[featureId] = [];
              }
              polygons[featureId].push(polygon); // Додаємо полігон до масиву
              return styleFunction(feature, initialColor);
            }
          });
          // Оновлюємо кольори кожні 15 секунд
          setInterval(() => fetchLvivTime(), 15000);
        } else {
          console.error('Помилка в даних API:', responseData);
        }
      })
      .catch(error => console.error('Помилка завантаження API:', error));
  })
  .catch(error => console.error('Помилка завантаження data.json:', error));

// Додаємо контроль масштабування і переміщуємо його в правий верхній кут
L.control.zoom({
  position: 'topright'
}).addTo(map);
