import axios from 'axios';
import store from '../store/customers';
// import NProgress from 'nprogress';


// import { get } from 'lodash'

const URL = 'http://127.0.0.1:8090/'
const http = axios.create({
    baseURL: URL,
    headers: {
        'Accept': 'application/json',
        'Authorization': `${window.localStorage.getItem('token')}`,
    }
});

    http.interceptors.response.use(
        response => {
            console.log('use interceptor http')
            const newtoken = response.headers.authorization;
            if (newtoken) {
                localStorage.setItem('token', newtoken);
                store.dispatch('auth/setToken', newtoken);
                console.log('relogin http');
            }
            return response;
        },
        error => {
            console.log('error interceptor http')
            if (error.response.status === 401) {
                store.dispatch('auth/logout');
                // location.reload();
            }
            // console.log(error.response);
            return Promise.reject(error);
    })

export { http };

// const URL = 'http://127.0.0.1:8080/'
// const http = axios.create({
//     baserURL: URL,
//     headers: {
//         'Accept': 'application/json',
//         'Authorization': `Bearer ${window.localStorage.getItem('token')}`,
//     }
// });
// // Add a request interceptor
// http.interceptors.request.use((config) => {
//     // Do something before request is sent
//     return config;
// }, (error)=> {
//     // Do something with request error
//     return Promise.reject(error);
// });

// // Add a response interceptor
// http.interceptors.response.use((response) => {
//     console.log('interceptor http')
//     console.log(response);
//     const newtoken = response.config.headers.Authorization;
//     console.log(newtoken)
//     if (newtoken) {
//         store.dispatch('auth/setToken', newtoken)
//     }
//     return response
//   }, function (error) {
//       console.log('http error')
//       console.log(error.response);
//     switch (error.response.status) {
//       case 401:
//         store.dispatch('auth/logout')
//         // location.reload();
//         break
//       default:
//         console.log(error.response)
//     }
//     return Promise.reject(error)
//   })


//     // Do something with response data
//     return response;
// }, (error)=> {
//     // Do something with response error
//     return Promise.reject(error);
// });
// export { http, URL };
