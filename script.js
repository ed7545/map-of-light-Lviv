// Підключення мапи
const map = L.map('map', {
  zoomControl: false // Вимикаємо стандартне управління масштабуванням
}).setView([49.8397, 24.0297], 13); // Встановлюємо координати для Львова

// Додаємо Google Maps як базовий шар
L.tileLayer('https://mt1.google.com/vt/lyrs=m&hl=uk&x={x}&y={y}&z={z}', {
  attribution: 'Google'
}).addTo(map);

// Об'єкт для збереження полігонів
let polygons = {};

// Функція для стилізації полігонів на основі даних кольорів
function styleFunction(feature, color) {
  return {
      fillColor: color, // задається колір
      color: 'transparent', // Колір контуру-прозорий
      weight: 0 // Товщина контуру
  };
}

// Функція для завантаження кольорів для поточної години
function getCurrentHourColor(colorData, featureId, currentHour) {
  const colors = colorData[featureId]; // Масив кольорів для певного полігону
  return colors ? colors[currentHour] : 'transparent'; // Повертаємо колір для поточної години
}

// Функція для оновлення кольорів полігонів
function updatePolygonsColors(colorData, currentHour) {
  console.log(`Updating polygons colors for hour: ${currentHour}`);
  Object.keys(polygons).forEach(polygonId => {
      const polygon = polygons[polygonId];
      const currentColor = getCurrentHourColor(colorData, polygonId, currentHour); // Отримуємо колір для поточної години
      console.log(`Polygon ${polygonId} color: ${currentColor}`);
      polygon.setStyle({ fillColor: currentColor }); // Оновлюємо стиль полігону
  });
}

// Функція для завантаження даних кольорів через API
function fetchPolygonColors(currentHour) {
  fetch('https://ed007.pythonanywhere.com/api/colors')
      .then(response => response.json())
      .then(responseData => {
          if (responseData.status === 'success') {
              const colorData = responseData.data; // Отримуємо дані кольорів
              updatePolygonsColors(colorData, currentHour); // Оновлюємо кольори полігонів
          } else {
              console.error('Помилка в даних API:', responseData);
          }
      })
      .catch(error => console.error('Помилка завантаження API:', error));
}

// Функція для отримання реального часу в Львові
function fetchLvivTime() {
  fetch('https://worldtimeapi.org/api/timezone/Europe/Kiev') // API для отримання часу в Львові
      .then(response => response.json())
      .then(data => {
          const currentHour = new Date(data.datetime).getHours(); // Отримуємо поточну годину в Львові
          console.log(`Current hour in Lviv: ${currentHour}`);
          fetchPolygonColors(currentHour); // Оновлюємо кольори полігонів на основі поточної години в Львові
      })
      .catch(error => console.error('Помилка отримання часу:', error));
}

// Завантажуємо дані полігонів з файлу data.json і додаємо на карту
fetch('data.json')
  .then(response => response.json())
  .then(geoData => {
      // Завантажуємо дані кольорів через API
      fetch('https://ed007.pythonanywhere.com/api/colors')
          .then(response => response.json())
          .then(responseData => {
              if (responseData.status === 'success') {
                  const colorData = responseData.data; // Отримуємо дані кольорів
                  // Додаємо GeoJSON полігони на карту і зберігаємо їх у об'єкті polygons
                  L.geoJSON(geoData, {
                      style: function (feature) {
                          const featureId = feature.properties.id;
                          const initialColor = getCurrentHourColor(colorData, featureId, new Date().getHours()); // Початковий колір
                          const polygon = L.geoJSON(feature, {
                              style: styleFunction(feature, initialColor)
                          }).addTo(map);
                          polygons[featureId] = polygon; // Додаємо полігон у словник
                          return styleFunction(feature, initialColor); // Використовується стилізація для полігонів
                      }
                  });
                  // Запускаємо оновлення кольорів кожні 15 секунд
                  setInterval(() => fetchLvivTime(), 15000);
              } else {
                  console.error('Помилка в даних API:', responseData);
              }
          })
          .catch(error => {
              console.error('Помилка завантаження API:', error);
          });
  })
  .catch(error => {
      console.error('Помилка завантаження data.json:', error);
  });

// Додаємо контроль масштабування і переміщуємо його в правий верхній кут
L.control.zoom({
  position: 'topright' // Переміщення в правий верхній кут
}).addTo(map);
