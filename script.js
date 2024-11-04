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
function styleFunction(_feature, color) {
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

// API-ключ тут
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
        setInterval(fetchLvivTimeAndUpdateColors, 1800000);
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
            // Якщо полігон є колекцією (наприклад, масивом), застосовуємо стиль до кожного елементу
            if (Array.isArray(polygon)) {
                polygon.forEach(part => part.setStyle({ fillColor: 'yellow' }));
            } else {
                // Якщо це окремий об'єкт, застосовуємо стиль безпосередньо
                polygon.setStyle({ fillColor: 'yellow' });
            }
        }
    });
}

// Змінні для збереження отриманого часу
let currentHour = 0;
let currentMinute = 0;

// Функція для форматування часу у вигляді "HH:MM"
function formatTime(hour, minute) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Функція для оновлення години і хвилин на екрані
function updateClockDisplay() {
    currentMinute++;
    if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour = (currentHour + 1) % 24; // Перехід на наступну годину
    }
    document.getElementById("current-time").textContent = formatTime(currentHour, currentMinute);
}

// Оновлюємо функцію fetchLvivTimeAndUpdateColors для збереження початкового часу
function fetchLvivTimeAndUpdateColors() {
    fetch(`https://api.ipgeolocation.io/timezone?apiKey=${ipgeolocationApiKey}&tz=Europe/Kiev`)
        .then(response => response.json())
        .then(data => {
            // Зберігаємо початкові години і хвилини з API
            currentHour = new Date(data.date_time_txt).getHours();
            currentMinute = new Date(data.date_time_txt).getMinutes();
            document.getElementById("current-time").textContent = formatTime(currentHour, currentMinute);

            // Запит кольорів через API
            fetch('https://ed007.pythonanywhere.com/api/colors')
                .then(response => response.json())
                .then(responseData => {
                    if (responseData.status === 'success') {
                        const colorData = responseData.data;
                        updatePolygonsColors(colorData, currentHour);
                        highlightNextHourPolygons(colorData, currentHour);
                    } else {
                        console.error('Помилка в даних API:', responseData);
                    }
                })
                .catch(error => console.error('Помилка завантаження кольорів через API:', error));
        })
        .catch(error => console.error('Помилка отримання часу:', error));
}

// Початковий запит та інтервал для оновлення хвилин локально
fetchLvivTimeAndUpdateColors();
setInterval(updateClockDisplay, 60000); // Оновлення хвилин щохвилини

// Функція для пошуку адреси
async function searchAddress(address) {
    // URL запиту до Nominatim API з обмеженням до Львова
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}, Львів&limit=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
            const { lat, lon } = data[0];
            // Встановлення червоного маркера на знайдених координатах
            L.marker([lat, lon], { color: 'red' }).addTo(map)
                .bindPopup(`Знайдено адресу: ${address}`)
                .openPopup();
            map.setView([lat, lon], 15); // Збільшуємо масштаб до координат
        } else {
            alert("Адресу не знайдено.");
        }
    } catch (error) {
        console.error("Помилка при пошуку адреси:", error);
    }
}

// Обробка події натискання кнопки пошуку
document.getElementById('searchButton').addEventListener('click', () => {
    const addressInput = document.getElementById('addressInput').value;
    if (addressInput) {
        searchAddress(addressInput);
    } else {
        alert("Введіть адресу для пошуку.");
    }
});

// Обробка події натискання клавіші Enter у полі введення адреси
document.getElementById('addressInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const addressInput = document.getElementById('addressInput').value;
        if (addressInput) {
            searchAddress(addressInput);
        } else {
            alert("Введіть адресу для пошуку.");
        }
    }
});

// Отримуємо елемент кнопки
const locationButton = document.getElementById('locationButton');
let locationMarker = null;

// Функція для отримання місцезнаходження
locationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        // Запитуємо місцезнаходження користувача
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Якщо вже є маркер, видаляємо його
                if (locationMarker) {
                    map.removeLayer(locationMarker);
                }

                // Додаємо новий маркер на мапу
                locationMarker = L.marker([userLat, userLng]).addTo(map)
                    .bindPopup('Ви тут').openPopup();

                // Показуємо користувача на мапі
                map.setView([userLat, userLng], 13);

                // Активуємо синій колір кнопки
                locationButton.classList.add('active');
            },
            (error) => {
                // Обробляємо різні помилки
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("Доступ до геолокації заборонено.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Інформація про місцезнаходження недоступна.");
                        break;
                    case error.TIMEOUT:
                        alert("Час очікування геолокації вичерпано.");
                        break;
                    default:
                        alert("Невідома помилка при отриманні місцезнаходження.");
                        break;
                }
            }
        );
    } else {
        alert('Ваш браузер не підтримує геолокацію');
    }
});

// Додаємо контроль масштабування і переміщуємо його в правий верхній кут
L.control.zoom({
    position: 'topright'
}).addTo(map);

// Об'єкт для збереження маркерів адрес
let addressMarkers = {};

// Функція для перевірки, чи є адреса у Львові та збереження в cookies
async function validateAndSaveAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}, Львів&limit=1&accept-language=uk`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
            const { lat, lon, display_name } = data[0];
            // Виділяємо скорочений варіант адреси (перша частина до коми)
            const shortAddress = display_name.split(',')[0];
            addAddressToList(shortAddress, { lat, lon });
            saveAddressToCookie(shortAddress, { lat, lon });
        } else {
            alert("Адресу не знайдено у Львові.");
        }
    } catch (error) {
        console.error("Помилка при перевірці адреси:", error);
    }
}

// Функція для додавання адреси в список на панелі
function addAddressToList(address, coordinates) {
    // Перевіряємо, чи вже є три адреси
    const addressItems = document.querySelectorAll('.address-item');
    if (addressItems.length >= 3) {
        alert("Ви можете зберегти лише 3 адреси.");
        return;
    }

    // Створюємо новий елемент для адреси
    const addressItem = document.createElement('div');
    addressItem.classList.add('address-item');
    addressItem.textContent = address;

    // Створюємо кнопку для видалення адреси
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.classList.add('delete-btn');
    deleteButton.style.marginLeft = '10px';
    deleteButton.style.backgroundColor = 'red';
    deleteButton.style.color = 'white';
    deleteButton.style.border = 'none';
    deleteButton.style.cursor = 'pointer';

    // Додаємо подію для видалення адреси при натисканні
    deleteButton.addEventListener('click', () => {
        addressItem.remove();
        deleteAddressFromCookie(address); // Видаляємо адресу з cookie
        if (addressMarkers[address]) {
            map.removeLayer(addressMarkers[address]);
            delete addressMarkers[address];
        }
    });

    // Додаємо кнопку видалення до елементу адреси
    addressItem.appendChild(deleteButton);

    // Додаємо елемент адреси до списку
    document.getElementById('address-list').appendChild(addressItem);

    // Додаємо подію для відображення маркера на карті при натисканні на адресу
    addressItem.addEventListener('click', () => {
        if (addressMarkers[address]) {
            map.removeLayer(addressMarkers[address]);
        }
        addressMarkers[address] = L.marker([coordinates.lat, coordinates.lon]).addTo(map)
            .bindPopup(`Адреса: ${address}`)
            .openPopup();
        map.setView([coordinates.lat, coordinates.lon], 15);
    });
}

// Обробка натискання на кнопку "Додати адресу"
document.getElementById('add-address-btn').addEventListener('click', () => {
    const newAddress = document.getElementById('newAddressInput').value;
    if (newAddress) {
        validateAndSaveAddress(newAddress);
    } else {
        alert("Введіть адресу для збереження.");
    }
});

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Функція для збереження адреси в cookies (до 3 адрес)
function saveAddressToCookie(displayName, coordinates) {
    let savedAddresses = getCookie('userAddresses');
    savedAddresses = savedAddresses ? JSON.parse(savedAddresses) : [];

    // Перевіряємо, чи вже збережено 3 адреси
    if (savedAddresses.length >= 3) {
        savedAddresses.shift(); // Видаляємо найстарішу адресу
    }

    // Додаємо нову адресу
    savedAddresses.push({ displayName, coordinates });
    setCookie('userAddresses', JSON.stringify(savedAddresses), 30);
}

// Функція для видалення адреси з cookies
function deleteAddressFromCookie(address) {
    const savedAddresses = getCookie('userAddresses');
    if (savedAddresses) {
        const addresses = JSON.parse(savedAddresses);
        const updatedAddresses = addresses.filter(addr => addr.displayName !== address);
        setCookie('userAddresses', JSON.stringify(updatedAddresses), 30);
    }
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Функція завантаження збережених адрес із cookies
function loadSavedAddresses() {
    const savedAddresses = getCookie('userAddresses');
    if (savedAddresses) {
        const addresses = JSON.parse(savedAddresses);
        addresses.forEach(address => {
            addAddressToList(address.displayName, address.coordinates);
        });
    }
}

// Завантаження адрес при старті сторінки
loadSavedAddresses();

const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            console.log('Зміни в DOM: ', mutation);
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });