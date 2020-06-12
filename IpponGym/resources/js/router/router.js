import axios from 'axios';
import Fof from '../views/404';
import Home from '../views/Home';
import MainBelts from '../views/MainBelts';
import MainForm from '../views/MainForm';
import MainPayments from '../views/MainPayments';
import MainRegister from '../views/MainRegister';
import NProgress from 'nprogress';
import Router from 'vue-router';
import showToast from '../plugins/showToast';
import store from '../store/customers';
import UsersIndex from '../views/UsersIndex';
import Vue from 'vue';
Vue.use(Router)
const router = new Router ({
    base: process.env.BASE_URL,
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
        },
        // {
        //     path: '/login',
        //     name: 'login',
        //     component: Home,
        // },
        {
            path: '/alta',
            name: 'customers.new',
            component: MainForm,
            meta: {
                requiresAuth: true,
            },
        },
        // {
        //     path: '/users',
        //     name: 'users.index',
        //     component: UsersIndex,
        //     meta: {
        //         requiresAuth: true,
        //     },
        // },
        {
            path: '/socio/:id',
            name: 'customers.profile',
            component: MainForm,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/socio/:id/editar',
            name: 'customers.edit',
            component: MainForm,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/pagos',
            name: 'payments.index',
            component: MainPayments,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/cinturones',
            name: 'belts.index',
            component: MainBelts,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/404',
            name: '404',
            component: Fof,
        },
        {
            path: '/400',
            name: '400',
            component: Home,
        },
        {
            path: '*',
            redirect: '/404',
        },
        {
            path: '/register',
            name: 'register',
            component: MainRegister,
            meta: {
                requiresAuth: true,
                role: 'admin',
            }
        },
    ]
})

import { http } from '../utils/http';
// http.interceptors.request.use(config => { /* Called on request */
//     /* On the register at login users we live search at db for the username and email, this avoids to NProgresss this api calls */
//     if (config.url != '/api/usersearch') {
//         NProgress.start();
//     }
//     return config;
// }, error => {

// });
// http.interceptors.response.use(response => { /* Called on response */
//     console.log('okintercept ROUTER')
//     /* On the register at login users we live search at db for the username and email, this avoids to NProgresss this api calls */
//         NProgress.done();
//     return response;
// }, error => {
//     console.log(error.response);
//     console.log('interceptor router');
//     // if (error.response.status === 401) { /* If we catch a 401 error */
//     //     /* Delete the login information on the store forcing to refresh the token reloginin */
//     //     store.dispatch('auth/logout');
//     //     /* If is not a error on the user or password reload the page to restore everything */
//     //     if (error.response.data.message !== 'login_error') {
//     //         location.reload();
//     //     }
//     //     // if (error.response.data.message.includes('Token')) {
//     //         // location.reload();
//     //     // }
//     //     return new Promise((resolve, reject) => {
//     //         reject(error);
//     //     });
//     // }
//     return new Promise((resolve, reject) => {
//         reject(error.message);
//     });
// });

router.beforeEach((to, from, next) => {
    /* Start the route progress bar */
    NProgress.start();

    console.log('islogued?' + store.getters['auth/isLoggedIn'])
    console.log(store.getters['auth/getToken'])
    // if (store.getters['auth/isLoggedIn']) {
        // http.post('/api/auth/me')
        //     .then((resp) => {
        //         console.log('me');
        //         console.log(resp),
        //         console.log(resp.config.headers.Authorization)
        //         console.log(http.defaults)
        //     });
        // http.post('/api/auth/refresh')
        //     .then((resp) => {
        //         console.log('refreshed')
        //         console.log(resp);
        //         http.defaults.headers.common['Authorization'] = 'Bearer ' + resp.data.token
        //         http.defaults.headers['Authorization'] = 'Bearer ' + resp.data.token
        //         Vue.prototype.$http.defaults.headers.common['Authorization'] = 'Bearer ' + resp.data.token
        //         Vue.prototype.$http.defaults.headers['Authorization'] = 'Bearer ' + resp.data.token
        //         localStorage.setItem('token', resp.data.token);
        //         localStorage.setItem('expires', resp.data.expires_in);
        //         http.post('/api/auth/me', {
        //             headers: {
        //                 'Accept': 'application/json',
        //                 'Authorization': 'Bearer ' + resp.data.token,
        //             }
        //         })
        //         .then((resp) => {
        //             // console.log(resp);
        //         })
        //     })
        //     .then((resp) => {
        //         console.log(resp),
        //         console.log(resp.data.token)
        //         console.log(http.defaults)
        //         http.defaults.headers['Authorization'] = 'Bearer ' + resp.data.token
        //         http.defaults.headers.common['Authorization'] = 'Bearer ' + resp.data.token
        //         localStorage.setItem('token', resp.data.token);
        //         localStorage.setItem('expires', resp.data.expires_in);
        //         console.log(http.defaults)
        //     })
        //     .then(() => {
        //         http.post('/api/auth/me')
        //             .then((resp) => {
        //                 console.log(resp),
        //                 console.log(resp.config.headers.Authorization)
        //                 console.log(http.defaults)
        //             });
        //     });
    // }
    /* Check if the role and the user are valid */
    if ((to.matched.some(record => record.meta.requiresAuth) && store.getters['auth/isLoggedIn']) || (to.matched.some(record => record.meta.requiresAuth && record.meta.role) && store.getters['auth/isLoggedIn'] && store.getters['auth/authenticatedRole'] == record.meta.role)) {
        next();
        return;
    } else if (((to.matched.some(record => record.meta.requiresAuth) && !store.getters['auth/isLoggedIn'])) || (to.matched.some(record => record.meta.requiresAuth && record.meta.role) && (!store.getters['auth/isLoggedIn'] || store.getters['auth/authenticatedRole'] != record.meta.role))) {
        // next('/');
        next('/');
    } else {
        next();
    }
})
router.afterEach(() => {
    /* Complete the animation of the route progress bar. */
    NProgress.done();
})


export default router;
