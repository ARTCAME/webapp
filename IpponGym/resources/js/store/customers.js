import auth from './modules/auth';
import customersActions from './customersActions';
import customersGetters from './customersGetters';
import customersMutations from './customersMutations';
import defaults from './customerDEFAULTS';
import navbar from './modules/navbar';
import Vue from 'vue';
import Vuex from 'vuex'
Vue.use(Vuex)
// const DEFAULT_CONTACT = () => {
//     return {
//         _id: null,
//         customerNumber: null,
//         emails: [],
//         name: '',
//         notes: '',
//         phones: [],
//     }
// }
// const DEFAULT_FORM = () => {
//     return {
//         _id: null,
//         customerNumber: null,
//         active: true,
//         sign: '',
//         image: '',
//         name: '',
//         address: '',
//         dni: '',
//         dateofbirth: '',
//         gender: '',
//         emails: [],
//         phones: [ DEFAULT_PHONE() ],
//         tutor: null,
//         contacts: [],
//         paymentData: {
//             amount: '',
//             iban: '',
//             ibanownerdni: '',
//             ibanownername: '',
//             paymenttype: '',
//             rate: '',
//             type: '',
//             payment_id: '',
//         },
//         payments: [],
//         belts: [
//             { grade: 'blam', date: null, },
//             { grade: 'amam', date: null, },
//             { grade: 'amna', date: null, },
//             { grade: 'nana', date: null, },
//             { grade: 'nave', date: null, },
//             { grade: 'veve', date: null, },
//             { grade: 'veaz', date: null, },
//             { grade: 'azaz', date: null, },
//             { grade: 'azma', date: null, },
//             { grade: 'mama', date: null, },
//             { grade: 'nene', date: null, }
//         ],
//         rightsProtect: {
//             RPaccept: null,
//             date: null,
//         },
//         rightsImage: {
//             RIaccept: null,
//             date: null,
//         },
//     }
// }
// const DEFAULT_PHONE = () => {
//     return {
//         phone: '',
//         notes: '',
//     }
// }
// const DEFAULT_TUTOR = () => {
//     return {
//         _id: null,
//         customerNumber: null,
//         address: '',
//         dni: '',
//         emails: [],
//         name: '',
//         notes: '',
//         phones: [],
//     }
// }
export default new Vuex.Store({
    actions: customersActions,
    getters: customersGetters,
    modules: {
        auth,
        navbar,
    },
    mutations: customersMutations,
    name: 'customers',
    namespaced: true,
    state: {
        customers: [],
        form: defaults.DEFAULT_FORM(),
        editform: defaults.DEFAULT_FORM(),
    },
    strict: true,
});
