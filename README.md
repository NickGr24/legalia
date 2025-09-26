# ⚖️ Legalia - Legal Education Quiz App

> **Мобильное приложение для изучения права через интерактивные квизы**

Legalia - это современное приложение для юридического образования, которое помогает изучать право через интерактивные квизы, систему прогресса и геймификацию обучения.

## 🌟 Ключевые особенности

### 📚 Система квизов
- **Юридические дисциплины**: Гражданское право, Уголовное право, Конституционное право и другие
- **Интерактивные квизы** с множественным выбором
- **Roadmap прогресс** в стиле Duolingo для каждой дисциплины
- **Система оценок** и отслеживание результатов

### 🎯 Геймификация и прогресс
- **Система достижений** и статистика
- **Streak tracking** для мотивации
- **Детальная аналитика** обучения
- **Персональный профиль** с историей прогресса

### 🎨 Современный дизайн
- **Темная палитра** с градиентными акцентами
- **Плавные анимации** на React Native Reanimated
- **Нативный интерфейс** для iOS и Android
- **Интуитивная навигация**

## 🚀 Технологический стек

### Frontend
- **React Native** 0.79.5 с TypeScript
- **Expo** 53.0.0 для нативной разработки (iOS/Android)
- **React Navigation** 6 для навигации
- **React Native Reanimated** 3.17.4 для анимаций

### Дизайн и UI
- **Expo Linear Gradient** для градиентов
- **Expo Vector Icons** и React Native SVG
- **React Native Gesture Handler** для жестов
- **Custom design system** с цветовой палитрой

### Бэкенд и данные
- **Supabase** для аутентификации и базы данных
- **AsyncStorage** для локального хранения
- **Custom hooks** для управления состоянием

### Аудио и мультимедиа
- **Expo Audio** для звуковых эффектов
- **Expo Fonts** для кастомной типографики

## 📱 Структура приложения

### 🏠 Home Screen
- Персонализированное приветствие с учетом времени дня
- Статистика пользователя (streak, завершенные квизы, средний балл)
- Список доступных юридических дисциплин
- Карточки дисциплин с прогрессом

### 📚 Discipline Roadmap Screen
- Визуальная карта квизов в стиле Duolingo
- Анимированные узлы прогресса
- Статистика по дисциплине
- Unlock система для новых квизов

### 🎮 Quiz Game Screen
- Интерактивные вопросы с множественным выбором
- Анимированная шкала прогресса
- Звуковые эффекты для обратной связи
- Система оценки правильности ответов

### 🏆 Quiz Result Screen
- Детальные результаты квиза
- Визуализация правильных/неправильных ответов
- Система мотивационных сообщений
- Статистика streak и достижений

### 👤 Profile Screen
- Статистика пользователя и достижения
- История завершенных квизов
- Настройки аккаунта
- Управление уведомлениями

### 🔐 Authentication Screens
- Экран входа с поддержкой Supabase и Google OAuth
- Экран регистрации
- Интеграция с системой аутентификации

## 🗂 Структура проекта

```
src/
├── components/              # Переиспользуемые компоненты
│   ├── AnswerOption.tsx    # Компонент варианта ответа
│   ├── AnimatedProgressBar.tsx # Анимированная шкала прогресса
│   ├── DisciplineCard.tsx  # Карточка дисциплины
│   ├── QuizRoadmap.tsx     # Roadmap квизов
│   └── AuthDebugPanel.tsx  # Debug панель (разработка)
├── screens/                # Экраны приложения
│   ├── HomeScreen.tsx      # Главный экран
│   ├── DisciplineRoadmapScreen.tsx # Roadmap дисциплины
│   ├── QuizGameScreen.tsx  # Игровой экран квиза
│   ├── QuizResultScreen.tsx # Экран результатов
│   ├── ProfileScreen.tsx   # Профиль пользователя
│   ├── LoginScreen.tsx     # Экран входа
│   └── RegisterScreen.tsx  # Экран регистрации
├── navigation/             # Навигация
│   ├── RootNavigator.tsx   # Корневая навигация
│   ├── TabNavigator.tsx    # Нижняя навигация
│   └── QuizStackNavigator.tsx # Стек квизов
├── services/               # Сервисы и API
│   ├── supabaseClient.ts   # Клиент Supabase
│   ├── supabaseService.ts  # Сервис работы с данными
│   ├── progressService.ts  # Локальное хранение прогресса
│   ├── soundManager.ts     # Управление звуками
│   └── googleOAuthService.ts # Google OAuth
├── hooks/                  # Пользовательские хуки
│   ├── useSupabaseData.ts  # Хуки для работы с данными
│   ├── useUserProgress.ts  # Хуки прогресса пользователя
│   ├── useErrorHandler.ts  # Обработка ошибок
│   └── useFonts.ts         # Загрузка шрифтов
├── contexts/              # React Context
│   └── AuthContext.tsx    # Контекст аутентификации
└── utils/                 # Утилиты и конфигурация
    ├── colors.ts          # Цветовая палитра
    ├── styles.ts          # Общие стили
    ├── fonts.ts           # Конфигурация шрифтов
    ├── types.ts           # TypeScript типы
    └── supabaseTypes.ts   # Типы базы данных
```

## 🎨 Design System

### Цветовая палитра
```typescript
// Primary Colors
background: {
  primary: '#0F172A',    // Dark navy background
  secondary: '#1E293B',  // Lighter navy
  tertiary: '#334155'    // Card backgrounds
}

// Text Colors
text: {
  primary: '#FFFFFF',    // Primary text
  secondary: '#CBD5E1',  // Secondary text
  tertiary: '#64748B'    // Muted text
}

// AI Accent Colors
ai: {
  primary: '#3B82F6',    // AI Blue
  secondary: '#8B5CF6'   // AI Purple
}

// Status Colors
success: '#10B981'       // Success green
error: '#EF4444'        // Error red
warning: '#F59E0B'      // Warning orange
```

### Компоненты
- **Карточки**: Скругленные углы, тени, градиенты
- **Кнопки**: Анимации нажатия, градиентные фоны
- **Прогресс бары**: Плавные анимации, цветовые переходы
- **Иконки**: Vector icons с анимациями

## 🗄 База данных

### Структура Supabase
```sql
-- Дисциплины права
home_discipline (id, name)

-- Квизы по дисциплинам  
home_quiz (id, title, discipline_id)

-- Вопросы квизов
home_question (id, content, quiz_id)

-- Варианты ответов
home_answer (id, content, correct, question_id)

-- Прогресс пользователей
home_marks_of_user (id, user_id, quiz_id, score, completed, completed_at)

-- Streak пользователей
home_userstreak (id, user_id, current_streak, longest_streak, last_activity_date)
```

## 🚀 Запуск проекта

### Требования
- Node.js 18+
- Expo CLI
- React Native development environment

### Установка
```bash
# Клонирование проекта
git clone https://github.com/your-repo/legalia
cd legalia

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start
# или
expo start

# Платформо-специфичные команды
npm run android    # Android
npm run ios        # iOS
```

### Переменные окружения
```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## ⚙️ Конфигурация

### app.json
```json
{
  "expo": {
    "name": "Legalia",
    "slug": "legalia",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android"],
    "bundleIdentifier": "com.legalia.app",
    "package": "com.legalia.app"
  }
}
```

## 🔧 Основные функции

### Аутентификация
- Supabase Auth с email/password
- Google OAuth интеграция
- Безопасное хранение токенов

### Управление данными
- Real-time синхронизация с Supabase
- Локальное кэширование прогресса
- Оффлайн поддержка для просмотра

### Анимации
- React Native Reanimated для плавных переходов
- Gesture-based навигация
- Микро-интеракции для улучшения UX

### Звуковые эффекты
- Звуки для правильных/неправильных ответов
- Звуки переходов и успехов
- Настраиваемая громкость

## 🎯 Roadmap

### ✅ Реализовано
- [x] Аутентификация и регистрация
- [x] Система квизов с множественным выбором
- [x] Roadmap прогресса по дисциплинам
- [x] Статистика и достижения
- [x] Анимированный интерфейс
- [x] Звуковые эффекты
- [x] Адаптивный дизайн

### 🚧 В разработке
- [ ] Push уведомления
- [ ] Расширенная аналитика
- [ ] Социальные функции

### 📋 Планируется
- [ ] AI-тьютор для объяснений
- [ ] Голосовые вопросы
- [ ] Многопользовательские турниры
- [ ] Экспорт статистики

## 🏗 Архитектурные решения

### Состояние приложения
- React Context для глобального состояния
- Custom hooks для бизнес-логики
- Local state для UI состояния

### Навигация
- Stack Navigator для основных экранов
- Tab Navigator для главной навигации
- Modal презентации для квизов

### Производительность
- Lazy loading компонентов
- Мемоизация дорогих вычислений
- Оптимизированные анимации

## 🤝 Contributing

1. Fork репозиторий
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Коммитьте изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 License

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🙏 Благодарности

- **Supabase** за backend-as-a-service платформу
- **Expo** за инструменты разработки
- **React Native Community** за библиотеки и поддержку

---

<div align="center">

**Создано с ❤️ для юридического образования**

*Делаем изучение права доступным и увлекательным*

</div>