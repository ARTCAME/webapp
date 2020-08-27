import auth from './modules/auth'
import navbar from './modules/navbar'
import { http } from '../utils/http';
import moment from 'moment';
import router from '../router/router';
import Vue from 'vue';
import Vuex from 'vuex'
Vue.use(Vuex)
const GRADES = [ /* 'blbl',  */'blam', 'amam', 'amna', 'nana', 'nave', 'veve', 'veaz', 'azaz', 'azma', 'mama', 'nene', ];
const SPECIAL_CHARACTERS = { 'Ã': 'A', 'À': 'A', 'Á': 'A', 'Ä': 'A', 'Â': 'A', 'È': 'E', 'É': 'E', 'Ë': 'E', 'Ê': 'E', 'Ì': 'I', 'Í': 'I', 'Ï': 'I', 'Î': 'I', 'Ò': 'O', 'Ó': 'O', 'Ö': 'O', 'Ô': 'O', 'Ù': 'U', 'Ú': 'U', 'Ü': 'U', 'Û': 'U', 'ã': 'a', 'à': 'a', 'á': 'a', 'ä': 'a', 'â': 'a', 'è': 'e', 'é': 'e', 'ë': 'e', 'ê': 'e', 'ì': 'i', 'í': 'i', 'ï': 'i', 'î': 'i', 'ò': 'o', 'ó': 'o', 'ö': 'o', 'ô': 'o', 'ù': 'u', 'ú': 'u', 'ü': 'u', 'û': 'u', 'Ñ': 'N', 'ñ': 'n', 'Ç': 'c', 'ç': 'c' };
const DEFAULT_CONTACT = () => {
    return {
        _id: null,
        customerNumber: null,
        emails: [],
        name: '',
        notes: '',
        phones: [],
    }
}
const DEFAULT_FORM = () => {
    return {
        // _id: '',
        _id: null,
        // customerNumber: '',
        customerNumber: null,
        active: true,
        sign: '',
        image: '',
        name: '',
        address: '',
        dni: '',
        dateofbirth: '',
        gender: '',
        emails: [],
        phones: [ DEFAULT_PHONE() ],
        tutor: null,
        contacts: [],
        paymentData: {
            rate: '',
            amount: '',
            paymenttype: '',
            iban: '',
            ibanownerdni: '',
            ibanownername: '',
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
        rightsProtect: null,
        rightsUnderage: null,
        rightsImage: null,
    }
}
const DEFAULT_PHONE = () => {
    return {
        phone: '',
        notes: '',
    }
}
const DEFAULT_TUTOR = () => {
    return {
        _id: null,
        customerNumber: null,
        address: '',
        dni: '',
        emails: [],
        name: '',
        notes: '',
        phones: [],
    }
}
/**
 * Converts the special characters on the passed strings to regular to compare it properly and transparent to the user
 *
 * @param {String} value: string used to search data
 */
function manageSpecialCharacters(value) {
    let result = '';
    for (let i = 0; i < value.length; i++) {
        result += SPECIAL_CHARACTERS[value.charAt(i)] || value.charAt(i);
    }
    return result;
}
export default new Vuex.Store({
    actions: {
        /***/ /* BELTS */ /***/
        /**
         * Delete the belts of a specific belt from the bels main page AND THE FORM PAGE
         *
         * @param {String} id: the id of the customer to edit, references her/one row
         * @param {Array} newRowBelts: new belts data from the db to set to the customer
         *
         * @return Object with the response data of the api call: the customer data. Is necessary at the component to refetch the customer edited data
         */
        async deleteBelts({ commit, getters }, { id, selectedBelts }) {
            const response = await http.post('/api/deleteBelts', ({ id: id, belts: selectedBelts }));
            /* Commit the changes on the customer */
            commit('UPDATE_BELTS', { customer: getters.getCustomerById(id), newVal: response.data.deletedBelts });
            /* Commit the changes on the edit form state */
            if (router.currentRoute.name == 'customers.edit' || router.currentRoute.name == 'customers.profile') {
                commit('UPDATE_EDITED_BELTS', response.data.deletedBelts);
            }
            /* Trigger a modification on the localStorage to propagate the changes on other windows */
            localStorage.setItem('customer_updated', id);
            localStorage.removeItem('customer_updated');
            return response.data;
        },

        /***/ /* CUSTOMERS */ /***/
        /**
         * Adds the new payment added to the db
         *
         * @param {String} _id: identifies the customer target
         * @param {Object} apiResponse: is the payment data to add
         */
        addPayment({ commit, getters }, { _id, apiResponse }) {
            const customer = getters.getCustomerById(_id);
            const exists = customer.payments.filter(payment => payment.interval == apiResponse.interval).length > 0;
            if (!exists) {
                return new Promise((resolve, reject) => {
                    /* Convert the apiResponse dates */
                    apiResponse.dategenerated = apiResponse.dategenerated != null && apiResponse.dategenerated.$date ? moment(parseInt(apiResponse.dategenerated.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : apiResponse.dategenerated;
                    apiResponse.dateconfirmed = apiResponse.dateconfirmed != null && apiResponse.dateconfirmed.$date ? moment(parseInt(apiResponse.dateconfirmed.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : apiResponse.dateconfirmed;
                    commit('ADD_PAYMENT', { target: customer, newPayment: apiResponse });
                    resolve(apiResponse);
                });
            }
        },
        /**
         * Clean certain data of the customer received via api
         *
         * @param {Array} customers: Contains the objects with the data of every customer
         *
         * @return {Array} Array with the customers builded with the app neededs formats
         */
        constructCustomers({ dispatch }, customers) {
            customers.forEach(customer => {
                /* Reveal the id of every customer before fetch the store */
                customer._id = customer._id.$oid ? customer._id.$oid : customer._id;
                /* Call to the payments cleaner */
                customer.payments && customer.payments.length > 0 && dispatch('initPayments', customer.payments);
                /* Clean the dates */
                customer.created_at = customer.created_at.$date ? moment(parseInt(customer.created_at.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : customer.created_at;
                customer.updated_at = customer.updated_at.$date ? moment(parseInt(customer.updated_at.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : customer.updated_at;
            });
            return customers;
        },
        /**
         * Initialize the customers with the db data. The data comes from app.js before create the app
         *
         * @param {Array} customers: Contains the objects with the data of every customer
         */
        async fetchCustomers({ commit, dispatch }, customers) {
            /* Build the customers */
            const newCustomers = await dispatch('constructCustomers', customers);
            /* Save the customers */
            commit('SET_CUSTOMERS', newCustomers);
        },
        /**
         * Initilizes updated customers. Usually called from the main app when a localStorage event was ocurred. Is created to avoid fetch all the customer on lesser updates
         *
         * @param {Array} ids: Array of ids wich identifies the updated customers
         */
        async fetchCustomersEdited({ commit, dispatch, state }, id) {
            /* Get the customer from the db */
            let response = await http.get('/api/customer/' + id);
            /* Construct every customer individually */
            const customer = await dispatch('constructCustomers', [response.data]);
            /* Commit the mutation on the customers state */
            const index = state.customers.findIndex(customer => customer._id == id);
            commit('UPDATE_FIELD', { target: state.customers, field: index, newVal: customer[0] });
            /* If the form state is using the customer, update it */
            if (state.form._id == id) {
                dispatch('fetchForm', id);
            }
            if (state.editform._id == id) {
                dispatch('fetchEditForm', id);
            }
        },
        async getCustomers({ dispatch }) {
            const response = await http.get('/api/customers');
            await dispatch('fetchCustomers', response.data);
        },
        /**
         * To simplify the components operations, convert certain payment data to strings
         *
         * @param {Array} payments: Contains the objects with every payment for each customer
         */
        initPayments({}, payments) {
            payments.forEach(payment => {
                /* Convert the mongo dates */
                payment.dategenerated = payment.dategenerated != null ? payment.dategenerated.$date && moment(parseInt(payment.dategenerated.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : payment.dategenerated;
                payment.dateconfirmed = (payment.status == 'Devuelto' || payment.status == 'Confirmado') ? (payment.dateconfirmed != null && payment.dateconfirmed.$date && moment(parseInt(payment.dateconfirmed.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss')) : payment.dateconfirmed;
            });
        },

        /***/ /* FORM */ /***/
        /**
         * Adds a new customer from a saved form, the data is the return of the api when saves the entire form
         *
         * @param {Object} customer: the customer data to add
         */
        async addNewCustomer({ commit, dispatch }, customer) {
            /* Construct the customer */
            await dispatch('constructCustomers', [customer]);
            /* Commit the mutation on the customers state */
            commit('ADD_CUSTOMER', customer);
            return customer._id;
        },
        /**
         * Add new element to the form object
         *
         * @param {String} _id (optional): identifies the customer to modify
         * @param {String} element: identifies the element in wich a new element is to be added
         * @param {String} entity: can be 'customer', 'tutor' or 'contact'
         * @param {Integer} entityIndex (optional): the array index of the entity with an element to add
         */
        addNewElement({ commit, getters, state }, { _id = null, element, entity, entityIndex = null }) {
            let target = _id == null ? state.form : state.editform;
            const newVal = element == 'phones' ? DEFAULT_PHONE() : element == 'contacts' ? DEFAULT_CONTACT() : element == 'tutor' ? DEFAULT_TUTOR() : /* element == emails */ '';
            if (entity == 'contacts') {
                target = target[entity][entityIndex][element];
            }
            if (entity == 'tutor') {
                target = target[entity][element];
            }
            if (entity == 'customer') {
                target = target[element];
            }
            commit('ADD_FORM_ELEMENT', { target: target, newVal: newVal });
        },
        /**
         * Define the element to delete, if an _id is passed will be an element of an existing customer, if not will be state.form element
         *
         * @param {String} _id (optional): identifies the customer to update
         * @param {String} entity: can be 'customer', 'tutor' or 'contact'
         * @param {Integer} entityIndex (optional): the array index of the entity with an element to delete
         * @param {String} field: identifies the field to modify
         * @param {Integer} fieldIndex (optional): identifies the fieldIndex object to modify
         */
        delFormElement({ commit, getters, state }, { _id = null, entity, entityIndex = null, field, fieldIndex }) {
            let target = _id == null ? state.form : state.editform;
            if (entity == 'contacts') {
                target = target[entity][entityIndex];
            }
            if (entity == 'tutor') {
                target = target[entity];
            }
            commit('DEL_FORM_ELEMENT', { target: target[field], index: fieldIndex });
        },
        /**
         * Fetch the edit form with the customer identified by the id received via param
         *
         * @param {String} id: identifies the customer to use at the form
         */
        fetchEditForm({ commit, dispatch, getters }, id) {
            /* Use a deep copy of the customer NO linked to the state */
            const customer = JSON.parse(JSON.stringify({ ...getters.getCustomerById(id) }));
            if (Object.keys(customer).length === 0) {
                // return router.push('/404');
            }
            commit('FETCH_FORM', { customer: customer, form: 'editform' });
            /* Set the tutor and contact data, if there are customers too extract its data form the state */
            dispatch('fetchFormDependencies', customer);
        },
        /**
         * Fetch the form with the customer identified by the id received via param
         *
         * @param {String} id: identifies the customer to use at the form
         */
        fetchForm({ commit, dispatch, getters }, id) {
            const customer = getters.getCustomerById(id);
            if (!customer) {
                // return router.push('/404');
            }
            commit('FETCH_FORM', { customer: customer, form: 'form' });
            /* Set the tutor and contact data, if there are customers too extract its data form the state */
            dispatch('fetchFormDependencies', customer);
        },
        /**
         * Fetch the contacts and tutor data, if they are customers to, his data is getted from the state, if not, the data comes in
         *
         * @param {Object} customer: the form data with wich will extract the data of the contacts and tutor
         */
        fetchFormDependencies({ dispatch, getters }, customer) {
            /* If a tutor exits and has _id (the tutor without _id is automatically fetched) search it at the customers state to obtain his data */
            if (customer.tutor && customer.tutor._id) {
                let localTutor = getters.getCustomerById(customer.tutor._id);
                dispatch('setTutor', { _id: customer._id, customer: localTutor });
            }
            /* If at least one contact exists */
            if (customer.contacts && customer.contacts.length > 0) {
                customer.contacts.forEach((contact, index) => {
                    /* Iterate over the contacts and set all of they, getting the data from the state to the wich are customers too */
                    if (contact._id) {
                        let localContact = getters.getCustomerById(contact._id);
                        dispatch('setContact', { _id: customer._id, customer: localContact, index: index })
                    } else {
                        dispatch('setContact', { _id: customer._id, customer: contact, index: index });
                    }
                });
            }
        },
        /**
         * Sets the contact data from the customer data passed, useful when a customer has a contact that is a customer too on the render of the customer profile
         *
         * @param {String} _id (optional): identificates the customer that are being modified, if it's null the customer is still on creation
         * @param {Object} customer: the object with the data to use as a contact
         * @param {Integer} index: identifies the index of the contact to set
         */
        setContact({ commit, getters, state }, { _id = null, customer, index }) {
            const target = _id == null ? state.form.contacts : state.editform.contacts;
            const contact = {
                _id: customer._id,
                customerNumber: customer.customerNumber,
                emails: customer.emails,
                name: customer.name,
                phones: customer.phones,
            }
            commit('UPDATE_FIELD', { target: target, field: index, newVal: contact });
        },
        /**
         * Sets the contact fields data individually on modifications at the component
         *
         * @param {String} _id (optional): identificates the customer that are being modified, if it's null the customer is still on creation
         * @param {String} field: identifies the contact field to update
         * @param {Integer} fieldIndex (optional): identifies the index of the field to update
         * @param {Integer} contactIndex: identifies the contact to update
         * @param {any} newVal: the value to assign
         */
        setContactFields({ commit, getters, state}, { _id = null, field, fieldIndex = null, contactIndex, newVal}) {
            let inField = field;
            let target = _id == null ? state.form.contacts[contactIndex] : state.editform.contacts[contactIndex];
            /* If the field to update is an array change the target from: contact[contactIndex].field to contact[contactIndex].field[fieldIndex] */
            if (target[inField] instanceof Array) {
                target = target[inField];
                inField = fieldIndex;
            }
            commit('UPDATE_FIELD', { target: target, field: inField, newVal: newVal });
        },
        /**
         * Uses the editform state to store its changes to the customer edited
         *
         * @param {Object} form: the form data to set as customer
         */
        setCustomerEdited({ commit, getters, state }, form) {
            let index = state.customers.findIndex(customer => customer._id == form._id);
            commit('SET_CUSTOMER_EDITED', { index: index, newVal: form });
        },
        /**
         * Sets the tutor data from the customer data passed, useful when a customer has a tutor that is a customer too on the render of the customer profile
         *
         * @param {String} _id (optional): identificates the customer that are being modified, if it's null the customer is still on creation
         * @param {Object} customer: the object with the data to use at the tutor
         */
        setTutor({ commit, getters, state }, { _id = null, customer }) {
            // const target = _id == null ? state.form : getters.getCustomerById(_id);
            const target = _id == null ? state.form : state.editform;
            let tutor = {
                _id: customer._id,
                address: customer.address,
                customerNumber: customer.customerNumber,
                dni: customer.dni,
                emails: customer.emails,
                name: customer.name,
                phones: customer.phones,
            }
            commit('UPDATE_FIELD', { target: target, field: 'tutor', newVal: tutor });
        },
        /**
         * Sets the tutor fields data individually on modifications at the component
         *
         * @param {String} _id (optional): identificates the customer that are being modified, if it's null the customer is still on creation
         * @param {String} field: identifies the tutor field to update
         * @param {Integer} fieldIndex (optional): identifies the index of the field to update
         * @param {any} newVal: the value to assign
         */
        setTutorFields({ commit, getters, state }, { _id = null, field, fieldIndex = null, newVal}) {
            let inField = field;
            let target = _id == null ? state.form.tutor : state.editform.tutor;
            /* If the field to update is an array change the target from: tutor.field to tutor.field[index] */
            if (target[inField] instanceof Array) {
                target = target[inField];
                inField = fieldIndex;
            }
            commit('UPDATE_FIELD', { target: target, field: inField, newVal: newVal });
        },
        /**
         * Update inputs of the form on a new or edit customer
         *
         * @param {String} field: identifies the field to update
         * @param {Integer} arrayIndex (optional): identifies the array index of the element to set
         * @param {String} objectKey (optional): identifies the key on the object to set
         * @param {any} newVal: the new value to apply
         * @param {String} _id (optional): identificates the customer to modify if exists a customer to modify, if not, is creating a new customer and not exists _id yet
         */
        updateCustomerData({ commit, getters, state }, { field, arrayIndex = null, objectKey = null, newVal, _id = null }) {
            /* If the _id is provided we edit the customer identified by it, if not we are creating a new customer */
            let target = _id == null ? state.form : state.editform;
            /* If an array index is provided, apply the changes with the array params */
            if (arrayIndex != null) {
                commit('UPDATE_FIELD_ARRAY', { target: target, field: field, index: arrayIndex, newVal: newVal });
            }
            /* If an object key is provided, apply the changes with the object params */
            if (objectKey != null) {
                commit('UPDATE_FIELD_OBJECT', { target: target, field: field, key: objectKey, newVal: newVal });
            }
            /* If a base element is edited apply the changes */
            if (arrayIndex == null && objectKey == null) {
                commit('UPDATE_FIELD', { target: target, field: field, newVal: newVal });
            }
        },

        /***/ /* PAYMENTS */ /***/
        /**
         * Delete a specific payment
         *
         * @param {String} _id: identifies the customer
         * @param {String} interval: identifies the payment
         */
        deletePayment({ commit, getters }, { _id, interval}) {
            /* Get the customer */
            const customer = getters.getCustomerById(_id);
            /* Get the payment index */
            const paymentIndex = getters.getPaymentIndex(_id, interval);
            /* Commit the mutation */
            commit('DELETE_PAYMENT', { customer: customer, paymentIndex: paymentIndex });
        },
        /**
         * Update the payment row fields when interact with it directly
         *
         * @param {String} field: the name of the field to update
         * @param {any} newVal: the value to assign
         * @param {String} _id: identificates the customer to update
         * @param {String} interval: identificates the payment to update
         * @param {Object} data: contains the rest of the table row data
         */
        updatePaymentField({ commit, dispatch, getters }, { field, newVal, _id, interval, ...data }) {
            /* Get the customer */
            const customer = getters.getCustomerById(_id);
            /* Get the payment index */
            const paymentIndex = getters.getPaymentIndex(_id, interval);
            /* Save the mutation */
            commit('UPDATE_PAYMENT_FIELD', { customer: customer, paymentIndex: paymentIndex,  field: field, newVal: newVal });
            /* The dateconfirmed' field will change conditionally based on the 'status' */
            if (field == 'status') {
                dispatch('updatePaymentField', { field: 'dateconfirmed', newVal: newVal == 'Pendiente' ? null : data.dateconfirmed, _id, interval, ...data });
            }
            /* The 'status' field will change conditionally based on the 'paymenttype' */
            if (field == 'paymenttype' && data.status == 'Devuelto') {
                dispatch('updatePaymentField', { field: 'status', newVal: '', _id, interval, ...data });
            }
        },
        /**
         * Update the payments row fields all at once when a api response was received or when a undo on a editing row has requested
         *
         * @param {String} _id: identificates the customer to update
         * @param {String} interval: identificates the payment to update
         * @param {String} showDetails: identificates the status of the details showing at the view, is only indicated to ignore it on the calls with ...data
         * @param {Object} data: contains the rest of the table row data
         */
        updatePaymentData({ commit, getters }, { _id, interval, _showDetails, ...data }) {
            /* Get the customer */
            const customer = getters.getCustomerById(_id);
            /* Get the payment index */
            const paymentIndex = getters.getPaymentIndex(_id, interval);
            /* The date can be a null, a $date.$numberlong from de db or an string, determine it */
            data.dateconfirmed = data.dateconfirmed != null ? data.dateconfirmed.$date ? moment(parseInt(data.dateconfirmed.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : data.dateconfirmed : null;
            data.dategenerated = data.dategenerated != null ? data.dategenerated.$date ? moment(parseInt(data.dategenerated.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : data.dategenerated : null;
            /* NOTE: It's not critical but, this function can be call after a undo request, the interval no need to be updated in this case and only when this action is called via api response, but it's left to minimize the code duplication */
            commit('UPDATE_PAYMENT', { customer: customer, paymentIndex: paymentIndex, newVal: { interval, ...data } });
        },
    },
    getters: {
        /***/ /* BELTS */ /***/
        /**
         * @return {Array} Array with the objects with the sum of the customer relevant data and the customers belts data. Also added some variables usefuls to the reactivity of the table
         */
        getBelts: (state, getters) => (filterGrades, inactives) => {
            let belts = [];
            /* Build the array with all the belts and customer data necessary */
            getters.getCustomersWithBelts.forEach(customer => {
                belts = [
                    ...belts,
                    {
                        /* Data from the customer */
                        _id: customer._id,
                        active: customer.active,
                        customerNumber: customer.customerNumber,
                        belts: customer.belts,
                        name: customer.name,
                        /* Row variables, are modified at the view */
                        grade: getters.getLastBelts(customer.belts).grade,
                        nextGrade: getters.getLastBelts(customer.belts).nextGrade,
                    }
                ];
            });
            /* Apply the filters requested to the builded belts */
            if (!inactives) {
                belts = belts.filter(belt => belt.active == true);
            }
            if (filterGrades.length > 0) {
                belts = belts.filter(belt => filterGrades.includes(belt.grade));
            }
            return belts;
        },
        /**
         * @param {Array} belts: Array of objects with a individual customer belts data
         *
         * @return {Object} Object with the current and next grades calculated on the belts passed
         */
        getLastBelts: state => belts => {
            /* If the customer doesn't has any belt return the initial values */
            if (belts.every(belt => belt.date == null)) {
                return { grade: 'blbl', nextGrade: 'blam' };
            }
            /* Get the reached belts (them are filled with a date) */
            const inBelts = belts.filter(belt => belt.date != null);
            /* Determine the last belt reached to get the grade and nextGrade attributes */
            let lastBelt = 'blam';
            inBelts.forEach(belt => {
                lastBelt = GRADES.indexOf(lastBelt) >= GRADES.indexOf(belt.grade) ? lastBelt : belt.grade;
            });
            /* Determine the next grade, check if is the last possible 'nene' */
            const nextGrade = lastBelt == 'nene' ? '' : GRADES[GRADES.indexOf(lastBelt) + 1];
            return { grade: lastBelt, nextGrade: nextGrade };
        },

        /***/ /* CUSTOMERS */ /***/
        /**
         * @param {String} key: field to check
         * @param {String} value: value to compare
         *
         * @return {Array} Array of objects with the customer/s coincidents in the search, the getters access to all the nested elements checking arrays, arrays of objects and objects.
         */
        getCustomerByField: (state) => (key, value) => {
            if (!value) {
                return [];
            }
            let customers = [];
            let filter = manageSpecialCharacters(value.toString().toLowerCase());
            let coincident = false;
            /* Iterate over the state customers */
            state.customers.forEach(customer => {
                /* Manage every customer as no coincident at the beginning */
                coincident = false;
                /* All the conditions on the tree check if the customer had previous coincidences to add the customer to the coincidents when only 1 condition exists. Also discard possible null values */
                /* Special treatment to the Object id that always will be equal */
                if (coincident == false && key == '_id') {
                    // if (customer._id.$oid == value) {
                    if (customer[key] == value) {
                        coincident = true;
                    }
                /* Check if the field is an array */
                } else if (coincident == false && customer[key] instanceof Array) {
                    customer[key].forEach((field, idx) => {
                        /* Check if inside the array there is/are object/s and iterate it */
                        if (customer[key][field] instanceof Object) {
                            Object.keys(customer[key][field]).forEach(lastfield =>{
                                /* Check the coincidences inside the every field of the object */
                                if (coincident == false && checkCoincidence(customer[key][idx][lastfield])) {
                                    coincident = true;
                                }
                            })
                        /* If the content of the array is text then check coincidences */
                        } else if (coincident == false && checkCoincidence(customer[key][field])) {
                            coincident = true;
                        }
                    });
                /* Check the coincidences inside the every field of the object */
                } else if (coincident == false && customer[key] instanceof Object) {
                    Object.keys(customer[key]).forEach(lastfield =>{
                        if (coincident == false && checkCoincidence(customer[key][lastfield])) {
                            coincident = true;
                        }
                    })
                /* If the field is directly text check the coincidences */
                } else if (coincident == false && checkCoincidence(customer[key])) {
                    coincident = true;
                }
                /* Add to the result the customer if it had coincidences */
                if (coincident) {
                    customers.push(customer);
                }
            });
             /**
             * Check if the value passed exists and has coincidences with the filter applied
             *
             * @param {String} value: data to be converted to string and to lower case then to check if has coincidences
             */
            function checkCoincidence(value) {
                if (value) {
                    return manageSpecialCharacters(value.toString().toLowerCase()).includes(filter);
                }
                return false;
            }
            return customers;
        },
        /**
         * @param {String} id: identifies the customer to search
         *
         * @return {Object} Object with the customer data identified by the id passed
         */
        getCustomerById: state => id => {
            return state.customers.find(customer => customer._id == id);
        },
        /**
         * @return {Array} Array of customers that have the tax compatible with belts or in his history has one or more belts reached
         */
        getCustomersWithBelts: state => {
            return state.customers.filter(customer => ['Karate','Personalizada + Karate', 'Dirigidas + Karate'].includes(customer.paymentData.rate) || customer.belts.some(belt => belt.date != null));
        },
        /**
         * @return Array of customers that have one or more payments
         */
        getCustomersWithPayments: state => {
            return state.customers.filter(customer => customer.payments.length > 0);
        },
        /**
         * @param {String} value: value to compare
         *
         * @return {Array} Array of objects with the customer/s founded with the value passed, the search is made on some fix relevant fields and ignore the irrelevant to don't overload the search
         */
        searchCustomer: (state) => (value) => {
            if (!value) {
                return [];
            }
            let customers = [];
            let filter = manageSpecialCharacters(value.toString().toLowerCase());
            /* Search in a relevan fields */
            let fields = ['_id', 'customerNumber', 'name', 'address', 'dni', 'emails', 'phones', 'paymentData' ];
            let coincident = false;
            /* Iterate over the state customers */
            state.customers.forEach(customer => {
                /* Check if the the customer is also added to the coincidents */
                if (!JSON.stringify(customers).includes(customer._id)) {
                    /* Treat every customer as no coincident at the beginning */
                    coincident = false;
                    /* Iterate over the posssible search fields */
                    fields.forEach(field => {
                        /* All the conditions on the tree check if the customer had previous coincidences to add the customer to the coincidents when only 1 condition exists. Also discard possible null values */
                        /* Special treatment to the Object id that always will be equal */
                        if (coincident == false && field == '_id') {
                            // if (customer._id.$oid == value) {
                            if (customer[field] == value) {
                                coincident = true;
                            }
                        /* Check if the field is an array */
                        } else if (coincident == false && customer[field] instanceof Array) {
                            customer[field].forEach((subfield, idx) => {
                                /* Check if inside the array there is/are object/s and iterate it */
                                if (subfield instanceof Object) {
                                    Object.keys(subfield).forEach(lastfield => {
                                        /* Check the coincidences inside the every field of the object */
                                        if (coincident == false && checkCoincidence(customer[field][idx][lastfield])) {
                                            coincident = true;
                                        }
                                    })
                                /* If the content of the array is text then check coincidences */
                                } else if (coincident == false && checkCoincidence(subfield)) {
                                    coincident = true;
                                }
                            });
                        /* Check the coincidences inside the every field of the object */
                        } else if (coincident == false && customer[field] instanceof Object) {
                            Object.keys(customer[field]).forEach(subfield => {
                                if (coincident == false && checkCoincidence(customer[field][subfield])) {
                                    coincident = true;
                                }
                            });
                        /* If the field is directly text check the coincidences */
                        } else if (coincident == false && checkCoincidence(customer[field])) {
                            coincident = true;
                        }
                    });
                }
                /* Add to the result the customer if it had coincidences */
                if (coincident) {
                    customers.push(customer);
                }
            });
            /**
             * Check if the value of the field passed exists and has coincidences with the filter applied
             *
             * @param {String} fieldValue: data to be converted to string and to lower case then to check if has coincidences
             */
            function checkCoincidence(fieldValue) {
                if (fieldValue) {
                    return manageSpecialCharacters(fieldValue.toString().toLowerCase()).includes(filter);
                }
                return false;
            }
            return customers;
        },

        /***/ /* FORM */ /***/
        /**
         * @param {String} stateName: the name of the object to serve
         *
         * @return {Object} Object with the state requesteds
         */
        getDefaultState: (state) => (stateName) => {
            switch (stateName) {
                case 'form':
                    return DEFAULT_FORM();
                    break;
                case 'tutor':
                    return DEFAULT_TUTOR();
                    break;
                case 'contacts':
                    return DEFAULT_CONTACT();
                    break;
                case 'phones':
                    return DEFAULT_PHONE();
                    break;
                case 'emails':
                    return "";
                    break;
            }
        },
        /**
         * @param {String} _id: Identificates the customer that we need to obtain her payments
         * @param {Array} filterYears: Array with the years to filter
         * @param {Array} filterMonths: Array with the months to filter
         * @param {Array} filterStates: Array with the states to filter
         * @param {Array} filterPaytype: Array with the paytype to filter
         * @param {Boolean} inactives: Indicates that are requested the inactive customers or not
         *
         * @return {Array} Array of payments formed by the sum of the certain customer data and the payment data. Return only the payments after apply the filters requested. Every payment has the format to be included on a b-table element. The payments returned are only from the _id passed as param. Is used at the customer profile.
         */
        getPaymentsById: (state, getters) => (_id, filterYears, filterMonths, filterStates, filterPaytype, inactives) => {
            let payments = [];
            const customer = getters.getCustomerById(_id);
            /* Build the array with all the payments by sum customer and payment data */
            customer.payments.forEach(payment => {
                payments = [
                    ...payments,
                    {
                        /* Data from the customer */
                        _id: customer._id,
                        active: customer.active,
                        customerNumber: customer.customerNumber,
                        dni: customer.dni,
                        name: customer.name,
                        /* Payment data */
                        ...payment
                    }
                ];
            });
            /* Apply all the filters requested to the builded payments */
            if (!inactives) {
                payments = payments.filter(payment => payment.active == true);
            }
            if (filterYears.length > 0) {
                payments = payments.filter(payment => filterYears.includes(moment(payment.interval,'YYYY-MM').year()));
            }
            if (filterMonths.length > 0) {
                payments = payments.filter(payment => filterMonths.includes(moment(payment.interval,'YYYY-MM').month()));
            }
            if (filterStates.length > 0) {
                payments = payments.filter(payment => filterStates.includes(payment.status));
            }
            if (filterPaytype.length > 0) {
                payments = payments.filter(payment => filterPaytype.includes(payment.paytype));
            }
            return payments;
        },

        /***/ /* PAYMENTS */ /***/
        /**
         * @param {String} _id: Identifies the customer to search on it
         * @param {String} interval: Identifies the payment to search on the customer
         *
         * @return {Object|undefined} If the payment exists returns it if not undefined
         */
        getPaymentData: (state, getters) => (_id, interval) => {
            const customer = getters.getCustomerById(_id);
            return customer.payments.find(payment => payment.interval == interval);
        },
        /**
         * @param {Array} filterYears: Array with the years to filter
         * @param {Array} filterMonths: Array with the months to filter
         * @param {Array} filterStates: Array with the states to filter
         * @param {Array} filterPaytype: Array with the paytype to filter
         * @param {Boolean} inactives: Indicates that are requested the inactive customers or not
         *
         * @return {Array} Array of payments formed by the sum of the certain customer data and the payment data. Return only the payments after apply the filters requested. Every payment has the format to be included on a b-table element
         */
        getPayments: (state, getters) => (filterYears, filterMonths, filterStates, filterPaytype, inactives) => {
            let payments = [];
            /* Build the array with all the payments by sum customer and payment data */
            getters.getCustomersWithPayments.forEach(customer => {
                customer.payments.forEach(payment => {
                    payments = [
                        ...payments,
                        {
                            /* Data from the customer */
                            _id: customer._id,
                            active: customer.active,
                            customerNumber: customer.customerNumber,
                            dni: customer.dni,
                            name: customer.name,
                            /* Payment data */
                            ...payment,
                        }
                    ];
                });
            });
            /* Apply all the filters requested to the builded payments */
            if (!inactives) {
                payments = payments.filter(payment => payment.active == true);
            }
            if (filterYears.length > 0) {
                payments = payments.filter(payment => filterYears.includes(moment(payment.interval,'YYYY-MM').year()));
            }
            if (filterMonths.length > 0) {
                payments = payments.filter(payment => filterMonths.includes(moment(payment.interval,'YYYY-MM').month()));
            }
            if (filterStates.length > 0) {
                payments = payments.filter(payment => filterStates.includes(payment.status));
            }
            if (filterPaytype.length > 0) {
                payments = payments.filter(payment => filterPaytype.includes(payment.paytype));
            }
            return payments;
        },
        /**
         * @param {String} id: identifies the customer to search on his payments
         * @param {String} interval: identifies the payment to search
         *
         * @return {Integer} The index of the payment searched on the customer payments, can be -1 if no payment has founded
         */
        getPaymentIndex: (state, getters) => (id, interval) => {
            let customer = getters.getCustomerById(id);
            return customer.payments.indexOf(customer.payments.find(payment => payment.interval == interval));
        },
        /**
         * @return {Array} Array sorted with the years with payments (extracted from the existing payments intervals)
         */
        getPaymentsYears: (state, getters) => {
            let years = [moment().year()];
            /* Iterate over the payments to extract the distinct year that appear in there intervals */
            getters.getCustomersWithPayments.forEach(customer => {
                customer.payments.forEach(payment => {
                    moment(payment.interval, 'YYYY-MM').isValid() && !years.includes(moment(payment.interval, 'YYYY-MM').year()) && years.push(moment(payment.interval, 'YYYY-MM').year());
                });
            });
            return years.sort();
        },
        /**
         * Determines if the customer selected dateofbirth is between 3 and 18
         *
         * @return {Boolean} If the age is between 3 and 18 returns true, if is 18 or more returns false
         */
        getUnderage: (state, getters) => (_id) => {
            const customer = getters.getCustomerById(_id);
            if (moment(customer.dateofbirth, 'YYYY-MM-DD').isValid() && 3 <= moment().diff(moment(customer.dateofbirth, 'YYYY-MM-DD'), 'years')) {
                return moment().diff(moment(customer.dateofbirth, 'YYYY-MM-DD'), 'years') < 18;
            }
        },
    },
    modules: {
        auth,
        navbar,
    },
    mutations: {
        /***/ /* BELTS */ /***/
        /**
         * Save the updates of specific fields of a belt
         *
         * @param {String} field: the target field to update
         * @param {any} newVal: the new value to save
         * @param {String} _id: the id of the target belt
         */
        UPDATE_BELT_DATA({}, { field, newVal, belt }) {
            // let stateBelt = state.belts.find(belt => belt._id == _id);
            // Vue.set(stateBelt, field, newVal)
            Vue.set(belt, field, newVal)
        },
        /**
         * Assign new value to the 'belts' property of a customer
         *
         * @param {Object} customer: the customer to update
         * @param {Object} newVal: the object with the new data to save
         */
        UPDATE_BELTS({}, { customer, newVal }) {
            Vue.set(customer, 'belts', newVal);
        },

        /***/ /* CUSTOMERS */ /***/
        ADD_CUSTOMER(state, customer) {
            state.customers.push(customer);
        },
        /**
         * Adds a new payment to the target customer
         *
         * @param {Object} newPayment: the new payment to add
         */
        ADD_PAYMENT(state, { target, newPayment }) {
            target.payments.push(newPayment);
        },
        /**
         * Initializes all the customers data
         *
         * @param {Array} customers: the array of Objects with all the app data
         */
        SET_CUSTOMERS(state, customers) {
            Vue.set(state, 'customers', customers)
        },

        /***/ /* FORM */ /***/
        /**
         * Adds dynamic elements to the form object
         *
         * @param {any} newVal: will be the DEFAULT_* constant that is needed to add
         */
        ADD_FORM_ELEMENT({}, { target, newVal }) {
            target.push(newVal);
        },
        /**
         * Adds a tutor object to the form object, by default the tutor is null and needs a specific mutation
         */
        ADD_TUTOR(state, target) {
        // ADD_TUTOR(state) {
            // Vue.set(state.form, 'tutor', DEFAULT_TUTOR());
            Vue.set(target, 'tutor', DEFAULT_TUTOR());
        },
        /**
         * Reset the form to its clean value
         */
        CLEAR_FORM(state, target) {
            Vue.set(state, target, DEFAULT_FORM());
        },
        /**
         * Deletes the specific element from the target passed
         *
         * @param {Object} target: the object on wich that is needed to delete the element
         * @param {Integer} index: identifies the element to delete
         */
        DEL_FORM_ELEMENT({}, { target, index }) {
            target.splice(index, 1);
        },
        /**
         * Reset the tutor to its initial value
         */
        // DEL_TUTOR(state) {
        //     Vue.set(state.form, 'tutor', null);
        DEL_TUTOR(state, target) {
            Vue.set(target, 'tutor', null);
        },
        /**
         * Fills the form with the customer data passed
         *
         * @param {Object} data: the customer data to set
         */
        FETCH_FORM(state, { customer, form }) {
            Vue.set(state, form, customer);
        },
        /**
         * Save the changes maded on the form to an existing customer
         *
         * @param {Integer} index: identifies the position of the customer to update
         */
        SET_CUSTOMER_EDITED(state, { index, newVal }) {
            Vue.set(state.customers, index, state.editform)
        },
        /**
         * Set the specific field from the target received
         *
         * @param {Object} target: the object to update (the field of a customer, contact or tutor)
         * @param {String} field: the field to update
         * @param {any} newVal: the value to assign
         */
        SET_FIELD({}, { target, field, newVal }) {
            Vue.set(target, field, newVal);
        },
        /**
         * Updates an specific field on the target received, usually on edit a customer or creating a new
         *
         * @param {Object} target: the new or existing customer to update
         * @param {String} field: the field of the customer to update
         * @param {any} newVal: the new data to save
         */
        UPDATE_FIELD({}, { target, field, newVal }) {
            Vue.set(target, field, newVal);
        },
        /**
         * Updates an specific array index on the form on edit a customer or creating a new
         *
         * @param {Object} target: the new or existing customer to update
         * @param {String} field: the field of the customer to update
         * @param {Integer} index (optional): identifies the index of the field (usefull to update arrays)
         * @param {any} newVal: the new data to save
         */
        UPDATE_FIELD_ARRAY({}, { target, field, index, newVal }) {
            Vue.set(target[field], index, newVal);
        },
        /**
         * Updates an specific object key on the form on edit a customer or creating a new
         *
         * @param {Object} target: the new or existing customer to update
         * @param {String} field: the field of the customer to update
         * @param {String} key (optional): identifies the index of the field (usefull to update objects)
         * @param {any} newVal: the new data to save
         */
        UPDATE_FIELD_OBJECT({}, { target, field, key, newVal }) {
            Vue.set(target[key], field, newVal);
        },
        /**
         * Replicates the belts changes when the user mades it from the customer edition
         *
         * @param {Object} newVal: the belts new data object to assign
         */
        UPDATE_EDITED_BELTS(state, newVal) {
            Vue.set(state.editform, 'belts', newVal);
        },

        /***/ /* PAYMENTS */ /***/
        /**
         * Splice an specific index of the array of payments o a specific customer
         *
         * @param {Object} customer: the customer to update its payments
         * @param {Integer} paymentIndex: the position of the payment on the array of payments of the customer
         */
        DELETE_PAYMENT({}, { customer, paymentIndex }) {
            customer.payments.splice(paymentIndex, 1);
        },
        /**
         * Updated a entire existing payment of a customer
         *
         * @param {Object} customer: the object to update
         * @param {Integer} paymentIndex: the payment index on the array of payments of the customer
         * @param {Object} newVal: the new attributes to set to the entire payment
         */
        UPDATE_PAYMENT(state, { customer, paymentIndex, newVal }) {
            Vue.set(customer['payments'], paymentIndex, newVal);
        },
        /**
         * Updates an specific field of a payment
         *
         * @param {Object} customer: the customer to update
         * @param {Integer} paymentIndex: the position of the payment on the array of payments of the customer
         * @param {String} field: the field of the payment to update
         * @param {Object} newVal: the object with the new data to save
         */
        UPDATE_PAYMENT_FIELD(state, { customer, paymentIndex, field, newVal }) {
            Vue.set(customer.payments[paymentIndex], field, newVal)
        },
    },
    name: 'customers',
    namespaced: true,
    state: {
        customers: [],
        // payments: [],
        // belts: [],
        form: DEFAULT_FORM(),
        editform: DEFAULT_FORM(),
    },
    strict: true,
});
