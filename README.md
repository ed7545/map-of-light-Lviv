# 🌍 Інтерактивна карта відключення світла Львова

Цей проєкт — з інтерактивною мапою, створений як студенський проєкт. Працює лише з API студента Ілльї, код якого знаходиться на pythonanywhere.com, завдяки цьому API сайт бере colors.json. Нажаль чи на щастя API використовує локальні фото графіків відключення світла.

## 🚀 Функціонал

### 🗺️ Інтерактивна карта
- Відображає полігони з трьома кольорами: червоний-немає світла, жовтий-на наступйн годині не буде світла, зелений є світло на теперішню годину.
- Кольори можуть оновлюються кожні 15 секунд на основі отриманих даних від API.
- Динамічна зміна кольорів дозволяє прогнозувати зміни на наступну годину (наприклад, полігони, що стануть червоними, підсвічуються жовтим).

### 🔍 Пошук адрес
- Інтеграція з **Nominatim API** для пошуку адрес у межах Львова.
- Знаходить введену адресу та позначає її маркером на карті.
- Додає знайдені адреси до списку, який зберігається у cookies.

### 📍 Геолокація
- Користувач може знайти своє поточне місцезнаходження одним кліком.
- Підтримка сучасних браузерів і пристроїв із доступом до геолокації.

### ⏱️ Синхронізація часу
- Сайт автоматично отримує поточний час Львова через зовнішній API.
- Дані оновлюються без необхідності перезавантаження сторінки.

### 📱 Адаптивний інтерфейс
- Оптимізовано для роботи на мобільних і десктопних пристроях.
- Інтуїтивно зрозуміле меню та плавна інтеграція елементів.

---

## 🛠️ Технології

- **Leaflet**: для відображення інтерактивної карти.
- **Google Maps Tiles**: для використання шарів карт Google.
- **ipgeolocation API**: для синхронізації реального часу.
- **Nominatim API**: для реалізації пошуку адрес.

---
## 🧐 Як саме працює проєкт?

Проєкт побудований навколо інтерактивної карти, яка автоматично взаємодіє з API, динамічними даними та сучасними технологіями веброзробки, щоб забезпечити максимально зручний досвід користувачів. Ось як це працює:

### 1. **Карта та геодані**
**Leaflet** використовується для побудови інтерактивної карти, на якій відображаються полігони (зони).Кольори полігонів визначаються на основі JSON-файлів із даними, які оновлюються кожні 30 хвилин без перезавантаження сторінки. Полігони, які змінять стан у найближчу годину (наприклад, стануть червоними), підсвічуються жовтим для попередження.

### 2. **Пошук адрес**
Користувач вводить адресу у формі, після чого надсилається запит до **Nominatim API**. API повертає координати адреси, які використовуються для розміщення червоного маркера на карті. Якщо адреса знаходиться за межами Львова, маркер не додається, а користувач отримує відповідне повідомлення. Додані адреси зберігаються у cookies, щоб зберігати дані між сесіями.

### 3. **Геолокація**
Для визначення місцезнаходження користувача використовується вбудована функція геолокації браузера. Якщо дозволено, карта автоматично переміщується до поточного місцезнаходження та ставить маркер.

### 4. **Часова синхронізація**
Проєкт отримує поточний час Львова через API та синхронізує його з інтерфейсом. Завдяки цьому дані полігонів відображаються актуальними та оновлюються кожні 30 хвилин у режимі реального часу.

### 5. **Інтерфейс**
Адаптивний дизайн забезпечує зручну роботу як на комп’ютерах, так і на мобільних пристроях. Бічне меню дозволяє керувати налаштуваннями, переглядати інформацію "Про нас" або відкривати посилання на GitHub проєкту. Елементи інтерфейсу (зум, меню, маркери) інтегровані у карту без зайвих перезавантажень.

### 6. **Збереження продуктивності** 
Дані оновлюються частково (кольори, маркери, час), що зменшує навантаження на сервер і прискорює роботу сайту. Використання cookies та локальної обробки дозволяє зберігати контекст для користувача, навіть якщо він оновлює сторінку.

---

## 📂 Структура проєкту

- `index.html`: головна сторінка сайту.
- `script.js`: логіка роботи карти.
- `interface.js`: керування інтерфейсом.
- `data.json`: дані про полігони.
- `styles.css`: кастомізований дизайн сторінки.
- `colors.json`: приклад того що приймається через API Ілльї.
