import type { Locale } from "@app-types";

interface ITranslations {
    home: string;
    gallery: string;
    admin: string;
    openGallery: string;
    featuredWorks: string;
    process: string;
    downloads: string;
    futureVideo: string;
    socials: string;
    donate: string;
    theme: string;
    language: string;
    login: string;
    username: string;
    password: string;
    artworks: string;
    assets: string;
    save: string;
    upload: string;
    published: string;
    draft: string;
}

export const translations: Record<Locale, ITranslations> = {
    ru: {
        home: "Главная",
        gallery: "Галерея",
        admin: "Админка",
        openGallery: "Открыть галерею",
        featuredWorks: "Работы по годам",
        process: "Процесс",
        downloads: "Скачать",
        futureVideo: "Видео будет добавлено позже",
        socials: "Соцсети",
        donate: "Донат",
        theme: "Тема",
        language: "Язык",
        login: "Войти",
        username: "Логин",
        password: "Пароль",
        artworks: "Картины",
        assets: "Медиа",
        save: "Сохранить",
        upload: "Загрузить",
        published: "Опубликовано",
        draft: "Черновик",
    },
    en: {
        home: "Home",
        gallery: "Gallery",
        admin: "Admin",
        openGallery: "Open gallery",
        featuredWorks: "Works by year",
        process: "Process",
        downloads: "Downloads",
        futureVideo: "Video will be added later",
        socials: "Socials",
        donate: "Donate",
        theme: "Theme",
        language: "Language",
        login: "Log in",
        username: "Username",
        password: "Password",
        artworks: "Artworks",
        assets: "Assets",
        save: "Save",
        upload: "Upload",
        published: "Published",
        draft: "Draft",
    },
};
