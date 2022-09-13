## ROSNOVA ALERT

Примеры подключения к БД в папке server/connections:

```bash
$  ts-node server/connections/mysql.ts
$  ts-node server/connections/firebase.ts
$  ts-node server/connections/firebird.ts
```

### Запуск для локальной разработки

1. Установить зависимости

```bash
$ npm ci
```

2. Попросить .env, docker.env, firebase-config-app.json и firebase-config-admin.json файлы у коллег и скопировать в корень проекта.

3. Запустить базы редис/постгрес

```bash
$ npm run database:start
```

4. Запустить dev-сервер

```bash
$ npm run dev
```

### Запуск бота

```bash
$ npm run start:bot
```

### Запуск bull

```bash
$ npm run start:bull
```

### Deploy

1. По примерам .env.example docker.env.example создаем соответствующие файлы.  
   При запуске локально для разработки используется окружение только из .env.  
    При запуске в docker-compose используется окуржение из файлов .env + docker.env, в этом случае docker.env перетирает переменные, уже определенные в .env

2. собираем образ node с установленными библиотеками

   ```bash
   docker build -t rosnova/base.node -f Dockerfile.base.node .
   ```

3. собираем образ с скомпилированным сервером

   ```bash
   docker build -t rosnova/base.project -f Dockerfile.base.project .
   ```

4. запускаем всю связку в docker-compose

   ```bash
   docker-compose -f docker-compose.yml up -d
   ```
