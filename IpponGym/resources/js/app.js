// import Toasted from 'vue-toasted';
// Vue.use(Toasted)
// import WebCam from 'vue-web-cam';
// Vue.use(WebCam)
// import VueAxios from 'vue-axios';
// Vue.use(VueAxios, axios)
// import VueDragResize from 'vue-drag-resize';
// Vue.component('vue-drag-resize', VueDragResize);
// import VueCookies from 'vue-cookies'; // https://github.com/cmp-cc/vue-cookies#readme
// Vue.use(VueCookies)


import store from './store/customers';
import validations from './validator/validator';
import Vue from 'vue';

Vue.config.devtools = false

import BootstrapVue from 'bootstrap-vue'; /* https://www.npmjs.com/package/bootstrap-vue */
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
Vue.use(BootstrapVue, {
    BTooltip: {
        delay: { 'show': 800, 'hide': 0 },
      },

});
import 'es6-promise/auto'; /* https://www.npmjs.com/package/es6-promise */

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'; /* https://www.npmjs.com/package/@fortawesome/vue-fontawesome */
Vue.component('fa-icon', FontAwesomeIcon);
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas)

import moment from 'moment'; /* https://www.npmjs.com/package/moment */
moment.locale('es');
Vue.prototype.$moment = moment;

import NProgress from 'nprogress'; /* https://www.npmjs.com/package/nprogress */
import 'nprogress/nprogress.css';
Vue.use(NProgress);

import router from './router/router';

import VeeValidate from 'vee-validate'; /* 2.x -> http://vee-validate.logaretm.com/v2/guide/flags.html#introduction; */
Vue.use(VeeValidate, {
    classes: true,
    classNames: {
      valid: "is-valid",
      invalid: "is-invalid"
    },
    events: 'blur|input|click',
    fieldsBagName: 'veeFormFields', /* Name changed to prevent conflicts, Only used at MainRegister.vue */
    locale: 'es',
});

import VueTour from 'vue-tour'; /* https://www.npmjs.com/package/vue-tour */
Vue.use(VueTour);
require('vue-tour/dist/vue-tour.css');

/* Plugins */
/* Using html2canvas and jsPdf, saves a document */
import html2print from './plugins/html2print';
Vue.use(html2print);
/* Check if a value is alphanumeric */
import isAlphaNum from './plugins/IsAlphaNum';
Vue.use(isAlphaNum);
/* Check if a value is alphabetical + dash */
import isAlphaDash from './plugins/IsAlphaDash';
Vue.use(isAlphaDash);
/* Check if a value is numeric */
import isNumber from './plugins/IsNumber';
Vue.use(isNumber);
import manageScrollBar from './plugins/ManageScrollBar';
Vue.use(manageScrollBar);
/* Generates random gradients for letters */
import randomGradient from './plugins/RandomGradient';
Vue.use(randomGradient);
/* Smooth scroll */
import scrollTo from './plugins/SmoothScroll';
Vue.use(scrollTo);
/* Shows toasts */
import showToast from './plugins/ShowToast';
Vue.use(showToast);
/* Generates csv from the table data */
import tableToCsv from './plugins/TableToCsv';
Vue.use(tableToCsv);

/* Import all the components from ./components */
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
const requireComponent = require.context(
  './components',
  false,
  /[A-Z]\w+\.(vue|js)$/
)
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const componentName = upperFirst(
    camelCase(
      fileName.replace(/^\.\/(.*)\.\w+$/, '$1')
    )
  );
  Vue.component(
    componentName,
    componentConfig.default || componentConfig
  );
});
import DocImg from './components/userdocassets/DocImg';
Vue.component('DocImg',  DocImg);

// import '../css/styles.css'; // Las fuentes están en app.css en public
import App from './views/App'; /* Contain the css main styles */

window.Vue = require('vue');

import { http } from './utils/http';
/* Add the token to the axios headers */
const token = localStorage.getItem('token')
if (token) {
    console.log('token asigning app.js');
    // http.defaults.headers.common['Authorization'] = token
    http.defaults.headers['Authorization'] = token;
    console.log(http.defaults);
}

/* Before load the app is necessary to get all the customers data and fetch it to vuex but this will happen only if a valid user ir logged in*/
if (store.getters['auth/isLoggedIn']) {
    console.log('getting customers');
    store.dispatch('getCustomers')
        .then(() => {
            createVue();
        });
} else {
    createVue();
}
function createVue() {
    new Vue({
        beforeCreate() {
            /* Fetch the customers data at the vuex store */
            // if (store.getters['auth/isLoggedIn']) {
                // store.dispatch('getCustomers');
            // }
        },
        created() {
/* Avoiding to fake tokens on localStorage */
            /* Auto login when a user exists on localStorage */
            if (localStorage.getItem('user')) {
                /* Auto login old? */
                console.log('Auto login old?');
                store.commit('AUTH_SUCCESS', localStorage.getItem('user'), localStorage.getItem('token'), localStorage.getItem('role'), localStorage.getItem('expires'));
            }
            http.interceptors.response.use(
                response => {
                    // console.log('use interceptor created')
                    // const newtoken = response.headers.authorization;
                    // console.log(newtoken)
                    // if (newtoken) {
                    //     localStorage.setItem('token', newtoken);
                    //     store.dispatch('auth/setToken', newtoken);
                    //     console.log('relogin created');
                    //     console.log(newtoken);
                    // }
                    return response;
                },
                error => {
                    // console.log('error interceptor created')
                    // const newtoken = response.headers.authorization;
                    // if (newtoken) {
                    //     localStorage.setItem('token', newtoken)
                    //     store.dispatch('auth/setToken', newtoken)
                    //     console.log('relogin')
                    //     console.log(newtoken);
                    // }
                    // if (newtoken) store.dispatch('login', newtoken)
                    //     return response
                    // },
                    // error => {
                        if (error.response && error.response.status === 401) {
                            store.dispatch('auth/logout');
                            if (error.response.data.message == 'login_error') {
                                this.$showToast('danger', 'Usuario o contraseña incorrectos', 'Error de sesión', 8000);
                            } else if (error.response.data.message.toLowerCase().includes('token')) {
                                // location.reload()
                                    // .then(() => {
                                        this.$showToast('danger', 'Sesión expirada', 'Error de sesión', 8000);
                                    // });
                            } else {
                                this.$showToast('danger', 'Se ha cerrado la sesión', 'Error de sesión', 8000);
                            }
                        }
                        console.error(error);
                        NProgress.done();
                        return Promise.reject(error);
                    }
            );
        },
        router,
        store,
        validations,
        render: h => h(App)
    }).$mount('#app')
}
//         })
// //         // .catch(error => {
// //         //     if (error.response.status !== 200) {
// //         //         router.push('/');
// //         //         // location.reload();
// //         //         store.dispatch('auth/logout');  /* Force a log out */
// //         //         console.log(error);
// //         //     }
// //         // });
// } else {
//     new Vue({
//         created() {
//             /* Avoiding to fake tokens on localStorage */
//             http.interceptors.response.use(
//                 response => response,
//                 error => {
//                     console.log(error)
//                     if (error.response.status === 401) { /* If we catch a 401 error */
//                         let message = 'Se ha cerrado la sesión';
//                         if (error.response.data.message == 'login_error') {
//                             message = 'Usuario o contraseña incorrectos';
//                         }
//                         if (error.response.data.message.includes('Token')) {
//                             message = 'Sesión expirada';
//                         }
//                         this.$showToast('danger', message, 'Error de sesión', 12000);
//                         NProgress.done();
//                         store.dispatch('auth/logout');  /* Force a log out */
//                     }
//                     return Promise.reject(error); /* Reject the Promise, with the error as the reason */
//                 }
//             );
//         },
//         router,
//         store,
//         validations,
//         render: h => h(App)
//     }).$mount('#app')
// }
