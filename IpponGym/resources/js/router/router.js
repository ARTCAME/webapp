import axios from 'axios';
import Fof from '../views/404';
import Home from '../views/Home';
import MainBelts from '../views/MainBelts';
import MainForm from '../views/MainForm';
import MainPayments from '../views/MainPayments';
import MainRegister from '../views/MainRegister';
import MainTests from '../views/MainTests';
import NProgress from 'nprogress';
import Router from 'vue-router';
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
            path: '/tests',
            name: 'tests.index',
            component: MainTests,
            meta: {
                requiresAuth: true,
                role: 'tester',
            }
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
                // role: 'admin',
                role: 'root',
            }
        },
        {
            path: '/testsRoot',
            name: 'testsRoot',
            component: MainTests,
            meta: {
                requiresAuth: true,
                // role: 'admin',
                role: 'root',
            }
        },
    ]
})
import { http } from '../utils/http';
router.beforeEach((to, from, next) => {
    http.get('/api/auth/me')
        .then((response) => {
            console.log(response.data)
        });
    /* Start the route progress bar */
    NProgress.start();
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
