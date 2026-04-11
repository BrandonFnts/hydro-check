import { setCookie, getCookie, deleteCookie } from "./cookieHelper";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const tokenHelper = {
    setTokens: (accessToken, refreshToken) => {
        if (accessToken) {
            setCookie(ACCESS_TOKEN_KEY, accessToken);
        }
        if (refreshToken) {
            setCookie(REFRESH_TOKEN_KEY, refreshToken);
        }
    },
    getAccessToken: () => {
        return getCookie(ACCESS_TOKEN_KEY);
    },
    getRefreshToken: () => {
        return getCookie(REFRESH_TOKEN_KEY);
    },
    clearTokens: () => {
        deleteCookie(ACCESS_TOKEN_KEY);
        deleteCookie(REFRESH_TOKEN_KEY);
    },
    removeRefreshToken: () => {
        deleteCookie(REFRESH_TOKEN_KEY);
    }
};
