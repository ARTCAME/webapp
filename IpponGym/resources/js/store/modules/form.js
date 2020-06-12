import axios from 'axios';
import moment from 'moment';
import router from '../../router/router';
import Vue from 'vue'

const actions = {
    async findCustomer({ commit, dispatch, rootGetters }, id) {
        // console.log('finding customer')
        let customer = rootGetters['customers/getCustomerById'](id);
        // // console.log(customer);
        // /* Get the customer */
        // const response = await axios.get('/api/socio/' + id);
        // console.log(id);
        // console.log(response);
        /* If the customer doesn't exists redirect to 404 page */
        console.log('findingCustomer')
        if (!customer) {
            return router.push('/404');
        }
        // if (response.data == '404') {
        //     return response.data;
        // }
        /* Construct the rows for the tables on the app */
        // dispatch('constructRow', customer);
        /* Check her dependencies with other customers at contact or tutor */
        commit('FETCH_FORM', customer);
        // dispatch('addPayments', id);
        /* Get the customer payments and add it to the state (on the current customer we have allocated its payments but they aren't converted to the necessary format and let to the payments do it and then obtain the data from it) */
        // commit('SET_PAYMENTS', rootGetters['payments/getPaymentsById'](id));
        /* let customerWithDependencies = await  */dispatch('addDependencies', customer);
    },
    addPayments({ commit, dispatch, rootGetters }, id) {
        rootGetters['payments/getPaymentsById'](id);
    },
    constructRow({ commit }, data) {
        let paymentRows = [];
        data.payments && data.payments.forEach(payment => {
            let row = {};
            let auxPayment = { ...payment };
            /* Set de table row default properties */
            row.selected = false;
            row._showDetails = false;
            row._rowVariant = payment.status == 'Pendiente' ? 'warning' : payment.status == 'Devuelto' ? 'danger' : '';
            /* Set the format of the dates obtained from the db */
            auxPayment.dategenerated = auxPayment.dategenerated != null ? moment(parseInt(auxPayment.dategenerated.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : auxPayment.dategenerated;
            auxPayment.dateconfirmed = (auxPayment.status == 'Devuelto' || auxPayment.status == 'Confirmado') ? (auxPayment.dateconfirmed != null && moment(parseInt(auxPayment.dateconfirmed.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss')) : auxPayment.dateconfirmed;
            /* Set the customer values for the table row */
            row.active = data.active;
            row._id = data._id;
            row.name = data.name;
            row.dni = data.dni;
            paymentRows.push({...row, ...auxPayment})
        });
        commit('payments/CONSTRUCT_ROWS', paymentRows, { root: true });
    },
// OJO, BUSCAR LA FORMA DE QUE EL MODULO DE CUSTOMERS SE CARGUE ANTES QUE EL DEL FORMULARIO EN SI YA QUE SI NO EL GETTER NO FUNCIONA AL ESTAR VACÍO EL DE CUSTOMERS CUANDO SE RELLENA EL FORMULARIO
// AL EDITAR UN SOCIO, EL TUTOR QUE ESTÁ SELECCIONADO Y QUE ES SOCIO, SE BUSCA Y SE ENCUENTRA EN LA BASE DE DATOS
// EL NÚMERO DE SOCIO DEL TUTOR NO SALE
    async addDependencies({ dispatch, rootGetters, state }, customer) {
        // let resolvedCustomer = { ...customer };
        if (customer.tutor && customer.tutor._id) {
            let localTutor = rootGetters['customers/getCustomerById'](customer.tutor._id)[0];
            /* If the customers vuex is not loaded yet, force to load it */
            // if (!localTutor) {
            //     await dispatch('customers/getAllCustomers', {}, { root: true });
            //     localTutor = rootGetters['customers/getCustomerById'](customer.tutor._id)[0];
            // }
            dispatch('setTutor', localTutor);
            // ['_id', 'address', 'dni', 'emails', 'name', 'phones'].forEach(key => {
            //     resolvedCustomer.tutor[key] = localTutor[key];
            // })
            // resolvedCustomer.tutor.notes = customer.tutor.notes; /* Their are stored on the main customer */
        } else if (customer.contacts && customer.contacts.length > 0) {
            console.log(customer.contacts)
            customer.contacts.forEach((contact, index) => {
                console.log(contact);
                if (contact._id) {
                    let localContact = rootGetters['customers/getCustomerById'](contact._id)[0];
                    dispatch('setContact', { customer: localContact, index: index })
                    // ['_id', 'emails', 'name', 'phones'].forEach(key => {
                    //     resolvedCustomer.contacts[index][key] = localContact[key]
                    // })
                    // resolvedCustomer.contacts[index].notes = contact.notes; /* Their are stored on the main customer */
                } else {
                    dispatch('setContact', { customer: contact, index: index });
                    // resolvedCustomer.contacts[index] = contact;
                }
            });
        }
        // return resolvedCustomer;
    },
    propagateCustomerUpdate({ state, commit }, customer) {
        if (state._id == customer._id) {
            commit('FETCH_FORM', customer);
        } else if (state.contacts.length > 0) {
            state.contacts.forEach((contact, index) => {
                if (contact._id == customer._id) {
                    commit('SET_CONTACT', { index: index, contact: contact });
                }
            });
        } else if (state.tutor && state.tutor._id == customer._id) {
            commit('SET_TUTOR', customer);
        }
    },
    setTutor({ commit }, customer) {
        let tutor = {
            _id: customer._id ? customer._id : null,
            address: customer.address,
            customerNumber: customer.customerNumber ? customer.customerNumber : null,
            dni: customer.dni,
            emails: customer.emails,
            name: customer.name,
            phones: customer.phones,
        }
        commit('SET_TUTOR', tutor);
    },
    setContact({ commit }, { customer, index }) {
        console.log(customer);
        let contact = {
            _id: customer._id ? customer._id : null,
            customerNumber: customer.customerNumber ? customer.customerNumber : null,
            emails: customer.emails,
            name: customer.name,
            phones: customer.phones,
        }
        commit('SET_CONTACT', { index: index, contact: contact });
    }
}

const defaultState = () => {
    return {
// OJO FALTA CONDICIONAR EL GUARDADO DE LOS NUEVOS SOCIOS Y VER COMO FUNCIONA EN LAS ACTUALIZACIONES.ACTUALIZACIONES
// AL GUARDAR LOS NUEVOS SOCIOS, DEJANDO TODOS LOS CAMPOS DE ABAJO, SE CREAN EN LA BASE DE DATOS Y MUCHOS NO SERÁN NECESARIOS, VER Y HACER QUE SE AÑADAN DINÁMICAMENTE AL SOCIO SEGÚN SE AÑADAN EDITEN LOS SOCIOS, POR EJEMPLO EN CUANTO A LOS CINTURONES, EN EL ALTA SI TIENE DIRIGIDAS NO SE INCLUIRÁ ESTO PERO SI LUEGO SE EDITA SE AÑADIRÁ TODO EL BLOQUE. lO MISMO CON LOS PAGOS, INICIALMENTE NO EXISTIRÁ O SERÁ NULL Y AL AÑADIRLO SE AÑADIRÁN, IGUAL QUE CON LOS EMAILS Y ENTIENDO QUE DEBERÁ APLICAR A CONTACTO Y TUTOR Y TELÉFONOS CUANDO NO SEAN OBLIGATORIOS.
        // _id: '',
        _id: null,
        customerNumber: '',
        active: true,
        sign: '',
        image: '',
        name: '',
        address: '',
        dni: '',
        dateofbirth: '',
        gender: '',
        emails: [],
        phones: [ defaultPhoneState() ],
        tutor: null,
        contacts: [],
        paymentData: {
            rate: '',
            amount: '',
            paymenttype: '',
            iban: '',
            date: '',
        },
        payments: [],
        belts: [
            // { grade: 'blbl', date: null, },
            { grade: 'blam', date: null, },
            { grade: 'amam', date: null, },
            { grade: 'amna', date: null, },
            { grade: 'nana', date: null, },
            { grade: 'nave', date: null, },
            { grade: 'veve', date: null, },
            { grade: 'veaz', date: null, },
            { grade: 'azaz', date: null, },
            { grade: 'azma', date: null, },
            { grade: 'mama', date: null, },
            { grade: 'nene', date: null, }
        ],




    }
}
const defaultPayment = () => {
    return {
        rate: '',
        amount: '',
        paymenttype: '',
        iban: '',
        dategenerated: '', // fecha en que se genera el pago
        dateconfirmed: '',
        interval: '',
        status: '',
    }
}
const defaultPhoneState = () => {
    return {
        phone: '',
        notes: '',
    }
}
const defaultTutorState = () => {
    return {
        _id: null,
        address: '',
        dni: '',
        emails: [],
        name: '',
        notes: '',
        // phoneGroup_0: defaultPhoneState(),
        phones: [],
            // defaultPhoneState(),
        // ]
    }
}
const defaultContactState = () => {
    return {
        _id: null,
        emails: [],
        name: '',
        notes: '',
        phones: [],
        //     defaultPhoneState(),
        // ]
    }
}
const defaultContactoState = () => {
    return {
        id: null,
        nombreContacto: '',
        telefonoContactoGroup: [ defaultPhoneState() ],
        emailContactoGroup: [],
        notasContacto: '',
        personalizadosContactoGroup: [],
    }
}

const getters = {
    getDefaultState: (state) => (el) => {
        switch (el) {
            case 'form':
                return defaultState();
                break;
            case 'tutor':
                return defaultTutorState();
                break;
            case 'contacts':
                return defaultContactState();
                break;
            case 'phones':
                return defaultPhoneState();
                break;
            case 'emails':
                return "";
                break;
        }
    },
    getTableRows(state) {
        let rows = [];
        state.payments.forEach(payment => {
            let localPayment = { ...payment };
            localPayment.dategenerated = payment.dategenerated != null ? moment(parseInt(payment.dategenerated.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : payment.dategenerated;
            localPayment.dateconfirmed = (payment.status == 'Devuelto' || payment.status == 'Confirmado') ? (payment.dateconfirmed != null && moment(parseInt(payment.dateconfirmed.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss')) : payment.dateconfirmed;
            rows.push({
                selected: false,
                _showDetails: false,
                _rowVariant: payment.status == 'Pendiente' ? 'warning' : payment.status == 'Devuelto' ? 'danger' : '',
                _id: state._id,
                name: state.name,
                dni: state.dni,
                ...localPayment,
            });
        });
        return rows;
    },
    hasBelts(state) {
        return state.belts.some(belt => belt.date != null);
    },
    hasPayments(state) {
        if (state.payments.length > 0) {
            return true;
        }
        return false;
    },
    underage(state) {
        if (moment(state.dateofbirth, 'YYYY-MM-DD').isValid() && 3 <= moment().diff(moment(state.dateofbirth, 'YYYY-MM-DD'), 'years')) {
            return moment().diff(moment(state.dateofbirth, 'YYYY-MM-DD'), 'years') < 18;
        }
        return 'invalid';
    },
    // countSocioPhoneGroups: state => deep => {
    //     let currentDeep = deep == 'telefonoTutorGroup' ? state.tutorGroup[deep] : deep == 'telefonoContactoGroup' ? state.contactoGroup[deep] : state.telefonoSocioGroup;
    //     return currentDeep.length;
    //     // return state.telefonoSocioGroup.length;
    // },
    // getContacts: state => () => {
    //     let regexp = new RegExp('^contact_');
    //     let contacts = [];
    //     Object.keys(state).filter(key => regexp.test(key)).forEach(key =>{
    //         contacts.push(state[key]);
    //     })
    //     return contacts;
    // },
    // // getPhones: state => target => {
    // //     let regexp = new RegExp('^phoneGroup_');
    // //     let phones = [];
    // //     Object.keys(target).filter(key => regexp.test(key)).forEach(filterKey => {
    // //         phones.push(target[filterKey]);
    // //     });
    // //     return phones;
    // // },
    // countElements: state => (target, elem) => {
    //     let regexp = new RegExp('^' + elem + '_');
    //     let elems = [];
    //     Object.keys(target).filter(key => regexp.test(key)).forEach(filterKey => {
    //         elems.push(target[filterKey]);
    //     });
    //     return elems;

    // }
}
const state = defaultState();
const mutations = {
    ADD_CONTACT(state) {
        state.contacts.push(defaultContactState());
    },
    ADD_EMAIL(state, data) {
        let target = data.target == 'customer' ? state : data.target == 'contacts' ? state[data.target][data.index] : state[data.target];
        target.emails.push('');
    },
    ADD_PAYMENT(state, newPayment) {
        state.payments.push(newPayment);
    },
    ADD_PHONE(state, data) {
        let target = data.target == 'customer' ? state : data.target == 'contacts' ? state[data.target][data.index] : state[data.target];
        target.phones.push(defaultPhoneState());
    },
    ADD_TUTOR(state) {
        state.tutor = defaultTutorState();
    },
    CLEAR_STATE(state) {
        Object.assign(state, defaultState());
    },
    CONSTRUCT_ROW(state, payment) {
        data.payments.push(payment);
    },
    DELETE_CONTACT(state, data) {
        state.contacts.splice(data.index, 1);
    },
    DELETE_FIELD(state, data) {
        let target = data.target == 'customer' ? state[data.field] : data.target == 'contacts' ? state[data.target][data.contactIndex][data.field] : state[data.target][data.field];
        target.splice(data.index, 1);
    },
    DELETE_PAYMENT(state, data) {
        state.payments.forEach(payment => {
            if (data.id == state._id && data.interval == payment.interval) {
                state.payments.splice(state.payments.findIndex(subpayment => payment.interval == subpayment.interval), 1);
            }
        });
    },
    DELETE_TUTOR(state) {
        state.tutor = null;
    },
    SET_BELT(state, data) {
        data.belt = data.date;
    },
    SET_BELTS(state, { belts, date }) {
        belts.forEach(passedBelt => {
            state.belts.forEach(belt => {
                if (belt.grade == passedBelt.grade) {
                    belt.date = date;
                }
            });
        });
    },
    SET_CONTACT_FIELDS(state, data) {
        let field = data.field;
        let target = state.contacts[data.contactIdx];
        let value = data.value;
        if (target[field] instanceof Array) {
            target = target[field];
            field = data.fieldIdx;
        }
        Vue.set(target, field, value);
    },
    /**
     *
     * @param {*} state
     * @param {Object} data: field, key(optional), value
     */
    SET_FIELD(state, data) {
        let target = state;
        let field = data.field;
        if (target[field] instanceof Array) {
            target = target[field];
            field = data.fieldIdx;
        } else if (target[field] instanceof Object) {
            target = target[field];
            field = data.key;
        }
        Vue.set(target, field, data.value)
    },
    /* This function, could receive similar objects than SET_CONTACT_FIELDS but with a minus parent index because there is only 0..1 tutor and can exists 0..N contacts
    { value: {
        field: "phonesGroup"
        fieldIdx: 1
        value: {
            notes: (...)
            phone: (...)
            }
        }
    } */
    SET_PAYMENTS(state, data) {
        state.payments = data;
    },
    SET_CONTACT(state, { index, contact }) {
        Vue.set(state.contacts, index, contact);
    },
    SET_TUTOR(state, data) {
        Vue.set(state, 'tutor', data)
    },
    SET_TUTOR_FIELDS(state, data) {
        let field = data.field;
        let target = state.tutor;
        let value = data.value;
        if (target[field] instanceof Array) {
            target = target[field];
            field = data.fieldIdx;
        }
        Vue.set(target, field, value);
    },
    UPDATE_PAYMENT(state, data) {
        // let fields = ['rate', 'amount', 'paymenttype', 'status', 'dateconfirmed'];
        // if (data.paymentData.id == state._id) {
        //     let toUpdate = state.payments.filter(payment => payment.interval == data.paymentData.interval)[0];
        //     fields.forEach(field => {
        //         /* The new date comes separate */
        //         toUpdate[field] = field == 'dateconfirmed' ? data.newDate : data.paymentData[field];
        //     });
        // }
    },
    // FETCH_FORM(state, data) {
    //     Object.keys(state).forEach(stateKey => {
    //         Object.keys(data).forEach(dataKey => {
    //             if (stateKey == dataKey) {
    //                 state[stateKey] = data[dataKey];
    //             }
    //         });
    //     });
    // },
}

export default {
    actions,
    getters,
    mutations,
    namespaced: true,
    state,
}
