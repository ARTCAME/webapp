import axios from 'axios';
import store from '../store/customers';

// const URL = 'http://127.0.0.1:8080/'
// const URL = 'http://127.0.0.1/'
// const URL = 'http://209.97.131.50/'
const URL = 'https://app.ippongymzaragoza.es/'
const http = axios.create({
    baseURL: URL,
    headers: {
        'Accept': 'application/json',
        'Authorization': `${ window.localStorage.getItem('token') }`,
        'common': {
            'Accept': 'application/json',
            'Authorization': `${ window.localStorage.getItem('token') }`,
        }
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
        console.log(error);
        if (error.response && error.response.status === 401) {
            store.dispatch('auth/logout');
            location.reload();
        }
        return Promise.reject(error);
})

export { http };
