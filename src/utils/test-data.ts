export const testData = {
  users: {
    validUser: {
      // These should be replaced with real test account credentials from .env
      username: process.env.TEST_USER_EMAIL || 'testuser@example.com',
      password: process.env.TEST_USER_PASSWORD || 'Test123!',
      phone: process.env.TEST_USER_PHONE || '+380501234567',
    },
    invalidUser: {
      username: 'invalid@example.com',
      password: 'wrongpassword',
    },
  },
  favbet: {
    urls: {
      homepage: 'https://favbet.ua',
      login: 'https://favbet.ua/uk/login',
      live: 'https://favbet.ua/uk/live',
      favorites: 'https://favbet.ua/uk/favorites',
      settings: 'https://favbet.ua/uk/settings',
      youtube: 'https://www.youtube.com/@FavbetUA',
    },
    sports: {
      football: 'Футбол',
      basketball: 'Баскетбол',
      tennis: 'Теніс',
      hockey: 'Хокей',
    },
    languages: {
      ukrainian: 'uk',
      english: 'en',
    },
    themes: {
      light: 'light',
      dark: 'dark',
    },
    messages: {
      loginSuccess: 'Вхід виконано успішно',
      noFavorites: 'Немає обраних подій',
      favoriteAdded: 'Додано до обраного',
      favoriteRemoved: 'Видалено з обраного',
    },
    youtube: {
      channelName: 'FAVBET',
      targetVideo: 'FAVBET | Support Those Who Support Us: ENGLAND | 2022 FIFA World Cup',
    },
  },
  timeouts: {
    short: 5_000,
    medium: 10_000,
    long: 30_000,
    pageLoad: 15_000,
    networkIdle: 20_000,
  },
  testSettings: {
    numberOfFavoritesToAdd: 3,
    waitAfterAction: 1_000,
    maxRetries: 3,
    screenshotOnFailure: true,
  },
};
