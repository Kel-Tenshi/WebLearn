# Структура проекта

Краткая карта проекта для разработчика или ИИ-агента. Прочитай этот файл первым, дальше иди по указанным путям.

## Что это

Учебная АСУ учёта оборудования: реестр техники, заявки, ТО/ремонты, перемещения, заказы поставщикам, справочники, инвентаризация и пользователи с ролями.

Стек:
- **Клиент:** React 19 + TypeScript, Create React App, react-router-dom 7, обычный CSS.
- **Сервер:** Node.js + Express 5 + SQLite (`sqlite3` + `sqlite`), JWT в HttpOnly-cookie.
- **БД:** локальный файл `Server/db/db.sqlite` (в git не входит).

## Корень

```
client/              фронтенд
Server/              бэкенд
requirements         личный файл пользователя, созданный им для себя; не является официальным ТЗ проекта
PROJECT_STRUCTURE.md этот файл
.gitignore
```

## Запуск

```powershell
# сервер, порт 5000; при первом старте создаст и заполнит db.sqlite
cd Server
npm install
npm start

# клиент, порт 3000; proxy на 127.0.0.1:5000
cd client
npm install
npm start
```

Демо-аккаунты: `admin/admin123`, `manager/manager123`, `user/user123`.

`client/.env` — локальная настройка dev-сервера (`DANGEROUSLY_DISABLE_HOST_CHECK=true`), в git не входит. Нужна из-за VPN-адаптера, который ломает определение `allowedHosts` в CRA.

## Страницы и маршруты

```
/                       главная: «Требует внимания», последние заявки пользователя, быстрые ссылки
/equipment              оборудование
/requests               заявки
/operations             редирект на /operations/maintenance
/operations/maintenance ТО и ремонт
/operations/transfers   перемещения
/operations/orders      снабжение и заказы
/directory              справочники: подразделения, локации, категории, поставщики
/audits                 инвентаризация
/users                  пользователи (только admin)
```

## Клиент

```
client/src/
  index.tsx            точка входа; здесь подключаются все стили
  App.tsx              маршруты, загрузка сессии, защищённые страницы
  api/                 HTTP-слой по доменам
    http.ts            request(), ApiError, авто-refresh при 401
    auth.ts            login / refresh / logout / register
    users.ts           профиль, список пользователей, роли, reset БД
    equipment.ts       CRUD оборудования
    requests.ts        заявки
    directory.ts       справочники и аудиты
    operations.ts      ТО, перемещения, заказы
    index.ts           единая точка реэкспорта
  config/
    statusMachine.ts   статусы, допустимые переходы, подписи действий и цвета бейджей
  types/               TypeScript-типы по доменам
    user.ts
    equipment.ts
    request.ts
    directory.ts
    operations.ts
    index.ts
  hooks/               загрузка данных и действия
    useForm.ts         общее состояние формы, ошибки и submit
    useEquipment.ts
    useRequests.ts
    useMaintenance.ts
    useTransfers.ts
    useOrders.ts
    useDirectory.ts
    useAudits.ts
    useUsers.ts
    useDashboard.ts
    usePasswordStrength.ts
  context/
    AlertContext.tsx   тосты (ошибки/успех), provider + useAlert
  utils/
    validation.ts      requiredText, min/maxTextLength, nonNegativeNumber, collect
    passwordStrength.ts обёртка над @zxcvbn-ts с русскими словарями
  components/
    ui/                FormField, PasswordInput, SlideReveal, Loading, StatusBadge, StatusActions
    layout/            Navbar, NotFoundView
    auth/              LoginView, RegisterView
    home/              HomeTab, AttentionList, RecentRequests, QuickLinks
    equipment/         EquipmentTab, EquipmentForm, EquipmentTable
    requests/          RequestsTab, RequestForm, RequestsTable
    operations/        OperationsTab (layout + подстраницы), MaintenanceTab/TransfersTab/OrdersTab, MaintenanceSection/TransfersSection/OrdersSection
    directory/         DirectoryTab, DepartmentsCard, LocationsCard, CategoriesCard, SuppliersCard, AuditsTab, AuditsCard
    users/             UsersTab, UsersTable, ResetDatabaseCard
  styles/
    base.css           переменные, body, топбар, таблицы, кнопки, карточки
    auth.css           экраны входа/регистрации
    forms.css          поля, tooltip-ошибки, пароль, индикатор надёжности, растягиваемые поля
    toasts.css         всплывающие плашки
    not-found.css      страница 404
    users.css          опасная зона сброса БД
    ui.css             загрузка, статус-бейджи и кнопки переходов
    home.css           главная страница
```

Правило: страница (`*Tab`) держит состояние и обработчики, форма и таблица — отдельные компоненты, загрузка/CRUD — в хуке, запросы — в `api/`, типы — в `types/`.

## Состояния и переходы

Единая карта переходов на сервере — `Server/stateMachine.js`, на клиенте — `client/src/config/statusMachine.ts`. Роуты проверяют переход и возвращают `409` со списком доступных статусов.

```
Оборудование:  Работает ⇄ Простой; из них → В ремонте / На консервации / Списано;
               В ремонте / На консервации → Работает / Простой / Списано; Списано — терминальный.
Заявки:        На согласовании → Одобрено / Отклонено / Отменено;
               Одобрено → В работе / Отменено; В работе → Выполнено / Отменено.
ТО:            Запланировано → Ожидает запчастей / В процессе / Отменено;
               Ожидает запчастей → В процессе / Отменено; В процессе → Завершено / Отменено.
Перемещения:   В пути → Принято / Отклонено; локация оборудования меняется только при «Принято».
Заказы:        Черновик → Согласован → В доставке → Получен; отмена из любого нетерминального.
Инвентаризация: В процессе → Завершена / Выявлены расхождения.
```

Автоматика:
- старт ТО (`В процессе`) переводит оборудование в `В ремонте`;
- завершение или отмена ТО возвращает оборудование в `Работает`;
- создание перемещения не меняет локацию, пока его не приняли.

На клиенте вместо выпадающего списка всех статусов показываются только кнопки разрешённых переходов (`StatusActions`). Сотрудник может отменить только свою заявку.

## Сервер

```
Server/
  server.js            Express-приложение, CORS, cookie, роутеры, 404/500
  constants.js         роли, статусы, перечисления, настройки JWT
  stateMachine.js      карта переходов статусов и проверка canTransition
  config/
    secrets.js         JWT-секреты (вынесены из constants.js)
  middleware/
    auth.js            проверка access, при истечении — refresh + перевыпуск
    requireRole.js     403, если роли нет в списке
  utils/
    jwt.js             генерация/проверка access и refresh
    passwords.js       SHA-256 + соль, проверка старых хэшей
  routes/
    auth.js            /auth: login, refresh, logout
    equipment.js       /api/equipment (проверка статусов при создании/изменении)
    requests.js       /api/requests (свои заявки у employee, переходы статусов)
    user/
      index.js         сборка профиля и админских роутов
      profile.js       /user/me, /user/register
      admin.js         /user, /user/reset-db, роли, удаление
    directory/
      index.js         /api/directory
      departments.js   /departments
      locations.js     /locations
      categories.js    /categories
      suppliers.js     /suppliers
      audits.js        /audits (переходы статусов)
    operations/
      index.js         /api/operations
      maintenance.js   /maintenance (переходы статусов + автоматика оборудования)
      transfers.js     /transfers (создание «В пути», PATCH статуса)
      orders.js        /orders (переходы статусов)
  db/
    db.js              initDb(), resetDb(), getDb(); собирает модули ниже
    connection.js      открытие SQLite, PRAGMA foreign_keys
    schema.js          CREATE TABLE для 12 таблиц
    migrations.js      мягкие миграции addColumnIfMissing
    seed.js            демо-данные (включая новые статусы)
    users.js           пользователи
    tokens.js          refresh-токены
    equipment.js       оборудование
    requests.js        заявки (+ JOIN с equipment)
    maintenance.js     журнал ТО + автоматическая смена статуса оборудования
    transfers.js       перемещения + принятие с обновлением локации
    orders.js          заказы
    departments.js     подразделения
    locations.js       локации
    categories.js      категории
    suppliers.js       поставщики
    audits.js          инвентаризации
```

Правило: **в `routes/` нет SQL**. Роут валидирует вход и вызывает функцию из `db/`. Запросы к БД идут через `getDb()`.

## Авторизация и роли

- `POST /auth/login` → access (15 мин) + refresh (7 дней) в HttpOnly cookie; refresh хранится в таблице `tokens`.
- `POST /auth/refresh` → перевыпуск пары токенов.
- `DELETE /auth/logout` → удаление refresh из БД и очистка cookie.
- `middleware/auth.js` при истёкшем access сам проверяет refresh и выдаёт новый access.
- Роли:
  - `employee` — чтение, создание заявок, видит только свои заявки и может их отменить;
  - `manager` / `admin` — CRUD оборудования, справочников, операций, смена статусов;
  - `admin` — дополнительно пользователи и сброс БД.

## Данные

12 таблиц: `departments`, `locations`, `categories`, `users`, `tokens`, `suppliers`, `equipment`, `requests`, `maintenance_logs`, `transfers`, `orders`, `inventory_audits`.

При пустой БД `seed.js` создаёт демо-подразделения, локации, категории, пользователей, поставщиков, оборудование, заявки, ТО, перемещения, заказы и инвентаризации. `POST /user/reset-db` (только admin) очищает таблицы и заново запускает `initDb()`.

## Куда что добавлять

- Новое поле оборудования: `db/schema.js` + `db/migrations.js` + `db/equipment.js` + `routes/equipment.js` + `types/equipment.ts` + форма/таблица в `components/equipment/`.
- Новый статус или переход: `constants.js` + `stateMachine.js` на сервере, затем `config/statusMachine.ts`, тип в `types/` и при необходимости кнопка/подпись действия.
- Новый раздел: `api/<domain>.ts`, `types/<domain>.ts`, `hooks/use<Domain>.ts`, `components/<domain>/`, роут в `App.tsx`, пункт в `Navbar`.
- Новая форма: `useForm` + `collect`/валидаторы из `utils/validation.ts`, поля оборачивать в `FormField`. Если поле должно занимать всё свободное место в строке — `FormField className="field-grow"`.
- Новый серверный домен: `db/<domain>.js`, `routes/<domain>.js` (или папка с `index.js`), подключить в `server.js`.
- Новые стили: отдельный файл в `styles/` и импорт в `src/index.tsx` (порядок импортов важен для каскада).

## Известные особенности

- `zxcvbn` с русскими словарями заметно увеличивает JS-бандл (~800 КБ gzip). Если это станет проблемой — вынести регистрацию в ленивый чанк.
- Тесты пока не используются; `App.test.tsx` — заготовка, не обёрнутая в Router/AlertProvider.
- JWT-секреты лежат в `config/secrets.js` намеренно (учебный проект). Для продакшена их место — переменные окружения.
- Схема БД хранит статусы как `TEXT`, поэтому новые значения не требуют миграции; старые записи остаются валидными.
