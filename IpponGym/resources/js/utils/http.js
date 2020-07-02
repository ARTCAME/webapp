import axios from 'axios';
import store from '../store/customers';

// const URL = 'http://127.0.0.1:8090/'
const URL = 'http://209.97.131.50/'
const http = axios.create({
    baseURL: URL,
    headers: {
        'Accept': 'application/json',
        'Authorization': `${window.localStorage.getItem('token')}`,
    }
});

http.interceptors.response.use(
    response => {
        /* The RefreshTokens middleware can send a token on headers, if its present set it as the current token authorization */
        const newtoken = response.headers.authorization;
        if (newtoken) {
            store.dispatch('auth/setToken', newtoken);
        }
        return response;
    },
    error => {
        /* If a login error occurst, close the session */
        if (error.response.status === 401) {
            store.dispatch('auth/logout');
            location.reload();
        }
        return Promise.reject(error);
})

export { http };
