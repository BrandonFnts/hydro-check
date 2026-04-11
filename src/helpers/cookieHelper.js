export const setCookie = (name, value) => {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; Secure; SameSite=Strict`;
};

export const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
};

export const deleteCookie = (name) => {
    document.cookie = `${name}=; path=/; max-age=0`;
};
