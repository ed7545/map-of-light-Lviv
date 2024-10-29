// Підключення мапи 
const map = L.map('map', {
  zoomControl: false
}).setView([49.8397, 24.0297], 13);

// Додаємо Google Maps як базовий шар
L.tileLayer('https://mt1.google.com/vt/lyrs=m&hl=uk&x={x}&y={y}&z={z}', {
  attribution: 'Google'
}).addTo(map);

// Об'єкт для збереження полігонів
let polygons = {};

// Отримуємо елемент для відображення часу
const timeContainer = document.getElementById('current-time');

// Функція для стилізації полігонів на основі даних кольорів
function styleFunction(feature, color) {
  return {
      fillColor: color,
      color: 'transparent',
      weight: 0
  };
}

// Функція для отримання кольору полігону на основі поточної години
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

// Додаємо ваш API-ключ тут
const ipgeolocationApiKey = '053adea0cbec4e7da8f9f7abe9040068';

// Функція для отримання реального часу в Львові та оновлення кольорів полігонів
function fetchLvivTimeAndUpdateColors() {
    fetch(`https://api.ipgeolocation.io/timezone?apiKey=${ipgeolocationApiKey}&tz=Europe/Kiev`)
        .then(response => response.json())
        .then(data => {
            const currentHour = new Date(data.date_time_txt).getHours();
            const currentTime = data.date_time_txt.slice(11, 16); // Формат HH:MM
            timeContainer.textContent = currentTime; // Відображення часу на екрані

            // Запит на кольори через API та оновлення полігонів
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
                .catch(error => console.error('Помилка завантаження кольорів через API:', error));
        })
        .catch(error => console.error('Помилка отримання часу:', error));
}

// Завантажуємо дані полігонів з файлу data.json і додаємо на карту
fetch('data.json')
    .then(response => response.json())
    .then(geoData => {
        // Додаємо GeoJSON полігони на карту
        L.geoJSON(geoData, {
            style: function (feature) {
                const featureId = feature.properties.id;
                const initialColor = 'transparent';
                const polygon = L.geoJSON(feature, {
                    style: styleFunction(feature, initialColor)
                }).addTo(map);

                // Якщо масиву для цього ID ще немає, створимо його
                if (!polygons[featureId]) {
                    polygons[featureId] = [];
                }
                // Додаємо полігон до масиву
                polygons[featureId].push(polygon);
                return styleFunction(feature, initialColor);
            }
        });
        // Запускаємо оновлення часу та кольорів кожні 15 секунд
        setInterval(fetchLvivTimeAndUpdateColors, 15000);
        fetchLvivTimeAndUpdateColors(); // Початковий виклик для завантаження
    })
    .catch(error => {
        console.error('Помилка завантаження data.json:', error);
    });

    // Функція для відображення попередження на наступну годину
function highlightNextHourPolygons(colorData, nextHour) {
  Object.keys(polygons).forEach(polygonId => {
      const polygon = polygons[polygonId];
      const nextHourColor = colorData[polygonId] ? colorData[polygonId][nextHour] : 'transparent';
      
      if (nextHourColor === 'red') {
          polygon.setStyle({ fillColor: 'yellow' }); // Встановлюємо жовтий колір як попереджувальний
      }
  });
}

// Модифікуємо функцію fetchLvivTimeAndUpdateColors для включення попереджувальної функції
function fetchLvivTimeAndUpdateColors() {
  fetch(`https://api.ipgeolocation.io/timezone?apiKey=${ipgeolocationApiKey}&tz=Europe/Kiev`)
      .then(response => response.json())
      .then(data => {
          const currentHour = new Date(data.date_time_txt).getHours();
          const nextHour = (currentHour + 1) % 24; // Наступна година, використовуючи 24-годинний цикл
          const currentTime = data.date_time_txt.slice(11, 16); // Формат HH:MM
          timeContainer.textContent = currentTime; // Відображення часу на екрані

          // Запит на кольори через API та оновлення полігонів
          fetch('https://ed007.pythonanywhere.com/api/colors')
              .then(response => response.json())
              .then(responseData => {
                  if (responseData.status === 'success') {
                      const colorData = responseData.data;
                      updatePolygonsColors(colorData, currentHour);
                      highlightNextHourPolygons(colorData, nextHour); // Виклик для відображення попередження
                  } else {
                      console.error('Помилка в даних API:', responseData);
                  }
              })
              .catch(error => console.error('Помилка завантаження кольорів через API:', error));
      })
      .catch(error => console.error('Помилка отримання часу:', error));
}

// Додаємо контроль масштабування і переміщуємо його в правий верхній кут
L.control.zoom({
  position: 'topright'
}).addTo(map);
