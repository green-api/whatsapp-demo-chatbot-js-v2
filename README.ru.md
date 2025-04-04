# Демонстрационный чат-бот WhatsApp

Демонстрационный чат-бот, демонстрирующий возможности библиотеки
[@green-api/whatsapp-chatbot-js-v2](https://github.com/green-api/whatsapp-chatbot-js-v2), используя API-сервис для
WhatsApp [green-api.com](https://green-api.com/en/).
Этот чат-бот демонстрирует различные функции GREEN-API, включая отправку сообщений, обработку файлов, опросы, контакты и
управление группами с использованием архитектуры, основанной на состояниях.

## Ссылки поддержки

[![Поддержка](https://img.shields.io/badge/support@green--api.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:support@green-api.com)
[![Поддержка](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/greenapi_support_eng_bot)
[![Поддержка](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/77273122366)

## Настройка окружения

1. **Установка Node.js**
    - Скачайте и установите последнюю версию Node.js с [официального сайта](https://nodejs.org/)
    - Проверьте установку, выполнив команду:
      ```bash
      node -v
      ```

2. **Настройка проекта**
   ```bash
   # Клонирование репозитория
   git clone https://github.com/green-api/whatsapp-demo-chatbot-js-v2

   # Установка зависимостей
   cd whatsapp-demo-chatbot-js-v2
   npm install
   ```

## Конфигурация

1. **Регистрация в GREEN-API**
    - Зарегистрируйтесь на [GREEN-API](https://green-api.com/)
    - Создайте первый экземпляр и скопируйте `idInstance` и `apiTokenInstance`

2. **Конфигурация окружения**
   Создайте `.env` файл в корневой директории проекта:
   ```env
   INSTANCE_ID=your_instance_id
   INSTANCE_TOKEN=your_api_token
   ```

## Структура проекта

### Основные файлы

- `bot.ts` - Основная реализация бота
- `strings.yml` - Строки сообщений для поддержки нескольких языков
- `.env` - Конфигурационный файл окружения

### Организация состояний

Чат-бот использует архитектуру, основанную на состояниях, с тремя основными состояниями:

1. **Начальное состояние** (`startState`)
    - Точка входа во все разговоры
    - Обрабатывает выбор языка
    - Доступные языки: EN, KZ, RU, ES, HE, AR
    - Переход в Основное состояние после выбора языка

2. **Основное состояние** (`mainState`)
    - Центральный узел для всех функций
    - Обрабатывает 13 различных демонстрационных команд
    - Управляет обновлениями опросов
    - Обеспечивает переход в состояние Создания группы

3. **Состояние создания группы** (`createGroupState`)
    - Обрабатывает процесс создания группы
    - Управляет добавлением контактов бота
    - Устанавливает аватар и начальное сообщение группы

### Глобальные обработчики

- Команды выхода (`stop`, `0`) - Возвращение к выбору языка
- Команды меню (`menu`, `меню`) - Возвращение в главное меню
- Обработчик сообщений по умолчанию для неподдерживаемых команд

# Интеграция с GPT

Этот демо-бот показывает, как интегрировать библиотеку `@green-api/whatsapp-chatgpt` в качестве обработчика сообщений в архитектуру,
основанную на состояниях. Интеграция осуществляется через специальное GPT-состояние, которое управляет разговором с
моделью GPT.

## Реализация GPT-состояния

```typescript
const gptBot = new WhatsappGptBot({
    idInstance: process.env.INSTANCE_ID!,
    apiTokenInstance: process.env.INSTANCE_TOKEN!,
    openaiApiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o",
    maxHistoryLength: 15,
    systemMessage: "You are a helpful WhatsApp assistant created by GREEN-API. Answer concisely but informatively.",
    temperature: 0.7,
});

interface CustomSessionData {
    lang?: string;
    gptSession?: GPTSessionData;
}

const gptState: State<CustomSessionData> = {
    name: "gpt_state",
    async onEnter(message, data) {
        const lang = data?.lang || "en";
        await bot.sendText(message.chatId, strings.chat_gpt_intro[lang]);

        // Инициализация сессии GPT с системным сообщением
        data.gptSession = {
            messages: [{role: "system", content: gptBot.systemMessage}],
            lastActivity: Date.now(),
        };
    },
    async onMessage(message, data) {
        const lang = data?.lang || "en";
        const exitCommands = [
            "menu", "меню", "exit", "выход", "stop", "стоп", "back", "назад",
            "menú", "salir", "parar", "atrás", "תפריט", "יציאה", "עצור", "חזור",
            "мәзір", "шығу", "тоқта", "артқа",
        ];

        // Обработка команд выхода
        if (exitCommands.includes(message.text?.toLowerCase() || "")) {
            return {state: "main", data};
        }

        try {
            // Обработка сообщения через GPT
            const {response, updatedData} = await gptBot.processMessage(
                    message,
                    data.gptSession
            );

            await bot.sendText(message.chatId, response);
            data.gptSession = updatedData;
            return undefined;
        } catch (error) {
            console.error("Error in GPT processing:", error);
            await bot.sendText(message.chatId, strings.chat_gpt_error[lang]);
            return undefined;
        }
    }
};
```

## Основные особенности:

1. **Интеграция на основе состояний**
    - Функциональность GPT инкапсулирована в отдельном состоянии
    - Плавная интеграция с существующими состояниями бота
    - Чистый переход между обычным и GPT режимами

2. **Управление сессиями**
    - История разговора GPT хранится в данных состояния
    - Сохраняется между сообщениями в рамках одной сессии
    - Корректная очистка при выходе из состояния

3. **Многоязычная поддержка**
    - Команды выхода на нескольких языках
    - Сообщения об ошибках с учетом языка

## Использование

1. Выберите опцию 14 из главного меню для входа в режим GPT
2. Общайтесь естественным образом с моделью GPT
3. Используйте любую из команд выхода для возврата в главное меню
4. История разговора сохраняется в рамках сессии

## Запуск бота

1. **Запуск**
   ```bash
   npm run start
   ```
   Или для просмотра дополнительной отладочной информации:
   ```bash
   npm run start:debug
   ```

2. **Процесс инициализации**
    - Очистка очереди вебхуков
    - Начало обработки сообщений

3. **Настройки экземпляра**
   Бот автоматически настраивает следующие параметры:
   ```json
   {
       "webhookUrl": "",
       "webhookUrlToken": "",
       "outgoingWebhook": "no",
       "stateWebhook": "no",
       "incomingWebhook": "yes",
       "outgoingAPIMessageWebhook": "no",
       "outgoingMessageWebhook": "no",
       "pollMessageWebhook": "yes",
       "markIncomingMessagesReaded": "yes"
   }
   ```

## Функции и использование

### 1. Выбор языка

Пользователь сначала выбирает предпочитаемый язык:

```
1 - English
2 - Kazakh
3 - Russian
4 - Spanish
5 - Hebrew
```

### 2. Основные команды

После выбора языка пользователи могут протестировать различные функции WhatsApp API:

1. **Текстовые сообщения** (📩)
    - Демонстрирует отправку текстовых сообщений
    - Показывает параметры форматирования текста

2. **Отправка файлов** (📋)
    - Отправка PDF-документов
    - Демонстрация возможностей загрузки файлов

3. **Отправка изображений** (🖼)
    - Отправка изображений с подписями
    - Демонстрация работы с медиа

4. **Голосовые сообщения** (🎵)
    - Отправка аудиофайлов
    - Поддержка нескольких форматов

5. **Отправка видео** (📽)
    - Отправка видеороликов
    - Демонстрация работы с большими медиафайлами

6. **Отправка контактов** (👤)
    - Создание контактных карточек
    - Поддержка формата vCard

7. **Отправка геолокации** (📍)
    - Отправка статической геолокации
    - Включает адрес и координаты

8. **Опросы** (📊)
    - Создание опросов
    - Обработка голосов
    - Поддержка нескольких вариантов ответа

9. **Работа с аватарами** (🖼)
    - Получение аватара профиля
    - Обработка URL аватаров

10. **Предпросмотр ссылок** (🔗)
    - Включение и отключение предпросмотра ссылок
    - Форматирование ссылок

11. **Создание групп** (👥)
    - Добавление контактов
    - Установка аватара группы
    - Генерация пригласительных ссылок

12. **Цитирование сообщений** (💬)
    - Ответы на конкретные сообщения

13. **Раздел "О боте"** (ℹ️)
    - Информация о библиотеке
    - Ссылки на документацию
    - Ресурсы поддержки

### Навигационные команды

- `stop` или `0` - Возвращение к выбору языка
- `menu` или `меню` - Показ доступных опций

## Примеры кода

### Определение состояния

```typescript
const startState: State<CustomSessionData> = {
    name: "start",
    async onEnter(message) {
        await bot.sendText(message.chatId, strings.select_language);
    },
    async onMessage(message, data) {
        // Реализация обработчика
    }
};
```

## Лицензия

Лицензировано в соответствии
с [Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)](https://creativecommons.org/licenses/by-nd/4.0/).

[LICENSE](./LICENSE)

## Связанные ресурсы

- [Документация GREEN-API](https://green-api.com/docs/)
- [@green-api/whatsapp-chatbot-js-v2](https://github.com/green-api/whatsapp-chatbot-js-v2)

