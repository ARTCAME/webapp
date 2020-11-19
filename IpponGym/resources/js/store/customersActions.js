import defaults from './customerDEFAULTS';
import moment from 'moment';
import NProgress from 'nprogress';
import router from '../router/router';
import { http } from '../utils/http';
const CONTACT_KEYS = ['_id', 'customerNumber', 'emails', 'name', 'phones'];
const QS = require('qs'); /* Needed at post function to pass arrays as params to the controller */
const TUTOR_KEYS = ['_id', 'address', 'customerNumber', 'dni', 'emails', 'name', 'phones'];
class ExceptionCustomerDoesNotExist {
    constructor(msg) {
        this.message = msg;
        this.name = 'CustomerDoesNotExist';
    }
}
class ExceptionResponseDataNotPresent {
    constructor(msg) {
        this.message = msg;
        this.name = 'ResponseDataNotPresent';
    }
}
export default {
    /****************************************************/ /* BELTS */ /****************************************************/
    /**
     * Delete the belts of a specific belt from the bels main page AND THE FORM PAGE
     *
     * @param {String} id: the id of the customer to edit, references her/one row
     * @param {Array} selectedBelts: array of belts to delete
     *
     * @return Object with the response data of the api call: the customer data. Is necessary at the component to refill the customer edited data
     */
    async deleteBelts({ commit, dispatch, getters }, { id, selectedBelts }) {
        try {
            const customer = getters.getCustomerById(id);
            if (!customer) {
                throw new ExceptionCustomerDoesNotExist('El socio no existe: ' + id);
            }
            // dispatch('updateFormBelts', { id: id, selectedBelts: selectedBelts });
            const response = await http.post('/api/deleteBelts', ({ id: id, belts: selectedBelts }));
            if (!response || !response.data || Object.keys(response.data).length == 0) {
                throw new ExceptionResponseDataNotPresent('No se han podido borrar los datos');
            }
            /* Commit the changes on the customer */
            commit('UPDATE_BELTS', { customer: customer, newVal: response.data.deletedBelts });
            /* Commit the changes on the edit form state */
    /* THIS IS DOIT ON updateFormBelts */
            // if (router.currentRoute.name == 'customers.edit' || router.currentRoute.name == 'customers.profile') {
            //     commit('UPDATE_EDITED_BELTS', response.data.deletedBelts);
            // }
            /* Trigger a modification on the localStorage to propagate the changes on other windows */
            localStorage.setItem('customer_updated', id);
            localStorage.removeItem('customer_updated');
            return response.data;
        } catch(error) {
            console.error(error.response ? error.response.data : error);
            this.$app.$showToast('danger', 'No se han podido completar el proceso. FeVX@DeBe', 'Ha ocurrido un error');
            NProgress.done(true);
        }
    },
    /**
     * Update the belts of a specific belt from the bels main page AND THE FORM PAGE
     *
     * @param {String} id: the id of the customer to edit, references her/one row
     * @param {Array} selectedBelts: array of belts to update
     * @param {String} date: date formatted to apply to the selectedBelts
     *
     * @return Object with the response data of the api call: the customer data. Is necessary at the component to refill the customer edited data
     */
    async updateBelts({ commit, dispatch, getters }, { id, selectedBelts, date }) {
        try {
            const customer = getters.getCustomerById(id);
            if (!customer) {
                throw new ExceptionCustomerDoesNotExist('El socio no existe: ' + id);
            }
            // dispatch('updateFormBelts', { customer: customer, selectedBelts: selectedBelts, newVal: date });
            const response = await http.post('/api/updateBelts', ({ id: id, belts: selectedBelts, date: date }));
            if (!response || !response.data || Object.keys(response.data).length == 0) {
                throw new ExceptionResponseDataNotPresent('No se han podido actualizar los datos');
            }
            /* Commit the changes on the customer */
            commit('UPDATE_BELTS', { customer: customer, newVal: response.data.updatedBelts });
            /* Commit the changes on the edit form state */
    /* THIS IS DOIT ON updateFormBelts */
            // if (router.currentRoute.name == 'customers.edit' || router.currentRoute.name == 'customers.profile') {
            //     commit('UPDATE_EDITED_BELTS', response.data.updatedBelts);
            // }
            /* Trigger a modification on the localStorage to propagate the changes on other windows */
            localStorage.setItem('customer_updated', id);
            localStorage.removeItem('customer_updated');
            return response.data;
        } catch(error) {
            console.error(error.response ? error.response.data : error);
            this.$app.$showToast('danger', 'No se han podido completar el proceso. FeVX@UpBe', 'Ha ocurrido un error');
            NProgress.done(true);
        }
    },

    /****************************************************/ /* CUSTOMERS */ /****************************************************/
    /**
     * Adds the new payment added to the db
     *
     * @param {Object} item: is the payment data to add
     */
    addPayment({ commit, getters }, item) {
        return new Promise(async (resolve, reject) => {
            /* Call to the db to add the payment */
            let apiResponse = await http.post('/api/newPayment', { item });
            /* Get the customer updated */
            const customer = getters.getCustomerById(item._id);
            /* Get if the payment already exitsts */
            const exists = customer.payments && customer.payments.some(payment => payment.payment_id == apiResponse.data.payment_id);
            /* Convert the apiResponse dates */
            apiResponse.data.dategenerated = apiResponse.data.dategenerated != null && apiResponse.data.dategenerated.$date ? moment(parseInt(apiResponse.data.dategenerated.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : apiResponse.data.dategenerated;
            apiResponse.data.dateconfirmed = apiResponse.data.dateconfirmed != null && apiResponse.data.dateconfirmed.$date ? moment(parseInt(apiResponse.data.dateconfirmed.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : apiResponse.data.dateconfirmed;
            if (!exists) {
                commit('ADD_PAYMENT', { target: customer, newPayment: apiResponse.data });
                /* Trigger a modification on the localStorage to propagate the changes on other windows */
                localStorage.setItem('customer_updated', item._id);
                localStorage.removeItem('customer_updated');
            }
            resolve(apiResponse.data);
        });
    },
    /**
     * Clean certain data of the customers passed. This function is called during the first load and manage the api response data
     *
     * @param {Array} customers: Contains the objects with the data of every customer
     *
     * @return {Array} Array with the customers builded with the app neededs formats
     */
    constructCustomers({ dispatch }, customers) {
        customers.forEach(customer => {
            /* Reveal the id of every customer before fill the store */
            customer._id = customer._id.$oid ? customer._id.$oid : customer._id;
            /* Call to the payments cleaner */
            customer.payments && customer.payments.length > 0 && dispatch('initPayments', customer.payments);
            /* Clean the dates */
            customer.created_at = customer.created_at.$date ? moment(parseInt(customer.created_at.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : customer.created_at;
            customer.updated_at = customer.updated_at.$date ? moment(parseInt(customer.updated_at.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : customer.updated_at;
            /* Sort the notes */
            customer.notes && customer.notes.sort((a, b) => {
                return moment(b.date, 'DD-MM-YYYY HH:mm:ss').diff(moment(a.date, 'DD-MM-YYYY HH:mm:ss'));
            });
        });
        return customers;
    },
    /**
     * Initialize the dependencies of the customers passed. This function is called during the first load and manage the api response data
     *
     * @param {Object} customers: The customers to find the fetch data
     */
    fetchCustomerDependencies({ commit, dispatch, getters, state }, customers) {
        customers.filter(customer => customer.tutor && customer.tutor._id).forEach(customerWithTutor => {
            let tutorData = customers.find(customer => customer._id == customerWithTutor.tutor._id);
            TUTOR_KEYS.forEach(key => customerWithTutor.tutor[key] = tutorData[key]);
        });
        customers.filter(customer => customer.contacts && customer.contacts.length > 0 && customer.contacts.some(contact => contact._id)).forEach(customerWithContacts => {
            customerWithContacts.contacts.forEach((contact, index) => {
                if (contact._id) {
                    let contactData = customers.find(tfc => tfc._id == contact._id);
                    CONTACT_KEYS.forEach(key => customerWithContacts.contacts[index][key] = contactData[key]);
                }
            })
        });
        return customers;
    },
    /**
     * Function to fetch the images of a specific customer. On the initial load, to save bandwith and improve speed, the customers doesn't include their images and turns necessary load they on demand on certain context like before print a document that includes the customer signature or before load the customer profile
     *
     * @param {Object} customer: the state customer object to update
     * @param {Boolean} sign: flag to determine if is needed
     * @param {Boolean} image: flag to determine if is needed
     */
    async fetchCustomerImages({ commit, getters }, { customer, sign, image}) {
        try {
            const response = await http.get('/api/customer/' + customer._id + '/images', { params: { sign: sign, image, image } });
            if (!response || !response.data || Object.keys(response.data).length == 0) {
                throw new ExceptionResponseDataNotPresent('No se han podido cargar las imágenes del socio del socio')
            }
            if (sign) {
                commit('UPDATE_FIELD', { target: customer, field: 'sign', newVal: response.data.sign });
            }
            if (image) {
                commit('UPDATE_FIELD', { target: customer, field: 'image', newVal: response.data.image });
            }
            return customer;
        } catch(error) {
            console.error(error.response ? error.response.data : error);
            this.$app.$showToast('danger', 'No se han podido cargar los datos del socio. Recarga la página. Código de error: FeVX@FeCuIm', 'Ha ocurrido un error');
            NProgress.done(true);
        }
    },
    /**
     * Gets all the customers and call to the fetcher/formatter action. This function is called from app.js on the initial load
     */
    async getCustomers({ dispatch }) {
        try {
            const response = await http.get('/api/customers');
            if (!response || !response.data || Object.keys(response.data).length == 0) {
                throw new ExceptionResponseDataNotPresent('No se han podido cargar los socios')
            }
            await dispatch('initCustomers', response.data);
        } catch(error) {
            console.error(error.response ? error.response.data : error);
            this.$app.$showToast('danger', error, 'Ha ocurrido un error');
            NProgress.done(true);
        }
    },
    /**
     * Initialize the customers with the db data to store it at vuex. This function is called during the first load and manage the api response data
     *
     * @param {Array} customers: Contains the objects with the data of every customer
     */
    async initCustomers({ commit, dispatch }, customers) {
        /* Clean certain data of each customer to eas */
        let newCustomers = await dispatch('constructCustomers', customers);
        /* Before store to the state, fetch its dependencies for tutors and contacts */
        newCustomers = await dispatch('fetchCustomerDependencies', newCustomers);
        /* Save at the state the builded, cleaned and dependencied filled customers */
        commit('SET_CUSTOMERS', newCustomers);
    },
    /**
     * Initilizes updated customers. Usually called from the main app when a localStorage event was ocurred. Is created to avoid treat all the customer on minor updates
     *
     * @param {Array} ids: Array of ids wich identifies the updated customers
     */
    async initCustomersEdited({ commit, dispatch, state }, id) {
        try {
            /* Get the customer from the db */
            let response = await http.get('/api/customer/' + id);
            /* Check if the data provided is valid or thrown an error */
            if (!response || !response.data || Object.keys(response.data).length == 0) {
                throw new ExceptionCustomerDoesNotExist('No existe el socio solicitado: ' + id)
            }
            /* Construct every customer individually */
            const customer = await dispatch('constructCustomers', [response.data]);
            /* Commit the mutation on the customers state */
            const index = state.customers.findIndex(customer => customer._id == id);
            commit('UPDATE_FIELD', { target: state.customers, field: index, newVal: customer[0] });
            /* If the form state is using the customer, update it */
            if (state.form._id == id) {
                dispatch('initForm', id);
            }
            if (state.editform._id == id) {
                dispatch('initEditForm', id);
            }
        } catch(error) {
            console.error(error.response ? error.response.data : error);
            this.$app.$showToast('danger', 'No se han podido completar la carga de datos. FeVX@InCuEd', 'Ha ocurrido un error');
            NProgress.done(true);
            if (error instanceof ExceptionCustomerDoesNotExist) {
                return router.push('/404');
            }
        }
    },
    /**
     * To simplify the in components operations, convert certain payment data
     *
     * @param {Array} payments: Contains the objects with every payment of a customer (this actions is usually called in a for each customer function)
     */
    initPayments({}, payments) {
        payments.forEach(payment => {
            /* Convert the mongo dates */
            payment.dategenerated = payment.dategenerated != null ? payment.dategenerated.$date && moment(parseInt(payment.dategenerated.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : payment.dategenerated;
            payment.dateconfirmed = (payment.status == 'Devuelto' || payment.status == 'Confirmado') ? (payment.dateconfirmed != null && payment.dateconfirmed.$date && moment(parseInt(payment.dateconfirmed.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss')) : payment.dateconfirmed;
        });
    },

    /****************************************************/ /* FORM */ /****************************************************/
    /**
     * Adds a new customer from a saved form, the data is the return of the api when saves the entire form
     *
     * @param {Object} customer: the customer data to add
     */
    async addNewCustomer({ commit, dispatch, getters }, customer) {
        /* Before store the new customer data from the db to the state, clean and construct its data */
        await dispatch('constructCustomers', [customer]);
        /* Before store too, fetch the customer dependencies getting its data from the customers state */
        if (customer.tutor && customer.tutor._id) {
            const relatedCustomer = getters.getCustomerById(customer.tutor._id);
            TUTOR_KEYS.forEach(key => customer.tutor[key] = relatedCustomer[key]);
        }
        if (customer.contacts && customer.contacts.length > 0 && customer.contacts.some(contact => contact._id)) {
            customer.contacts.forEach((contact, index) => {
                if (contact._id) {
                    const relatedCustomer = getters.getCustomerById(contact._id);
                    CONTACT_KEYS.forEach(key => customer.contacts[index][key] = relatedCustomer[key]);
                }
            });
        }
        /* Commit the mutation on the customers state */
        commit('ADD_CUSTOMER', customer);
        return customer._id;
    },
    /**
     * Add a new element to the dynamic elements of the form object (belts, phones, notes, tutor, tutor notes, tutor phones, contacts, contact notes and contact phones)
     *
     * @param {String} _id (optional): identifies the customer setted on the form to modify, if is not provided is a new customer
     * @param {String} element: identifies the element in wich a new element is to be added
     * @param {String} entity: can be 'customer', 'tutor' or 'contact', is the destination of the added element
     * @param {Integer} entityIndex (optional): the array index of the entity with an element to add
     * @param {Object} value (optional): new value to add on a entity, ie used to add a new note data filled object instead of a pristine note object
     */
    addNewElement({ commit, getters, state }, { _id = null, element, entity, entityIndex = null, value = null }) {
        const form = _id == null ? state.form : state.editform; /* New or existing customer */
        let newVal = element == 'phones' ? defaults.DEFAULT_PHONE() : element == 'contacts' ? defaults.DEFAULT_CONTACT() : element == 'tutor' ? defaults.DEFAULT_TUTOR() : element == 'notes' ? value : element == 'belts' ? defaults.DEFAULT_BELTS() : '';
        let target = null;
        /* Get the target in the deep of every type of entity and if the element doesn't exist create it as an array with the newVal, if exists add the newVal to the existing values */
        if (entity == 'contacts') {
            newVal = form[entity][entityIndex][element] ? [...form[entity][entityIndex][element], newVal] : [newVal];
            target = form[entity][entityIndex];
        }
        if (entity == 'tutor') {
            newVal = form[entity][element] ? [...form[entity][element], newVal] : [newVal];
            target = form[entity];
        }
        if (entity == 'customer') {
            /* The customer tutor and belts elements are not arrays */
            newVal = form[element] ? [...form[element], newVal] : element == 'tutor' || element == 'belts' ? newVal : [newVal];
            target = form;
        }
        /* The notes of a customer, tutor or contact must be date sorted (on the load from api they are sorted before being fetched state) */
        if (element == 'notes') {
            newVal.sort((a, b) => {
                return moment(b.date, 'DD-MM-YYYY HH:mm:ss').diff(moment(a.date, 'DD-MM-YYYY HH:mm:ss'));
            });
        }
        commit('ADD_FORM_ELEMENT', { form: target, target: element, newVal: newVal });
    },
    /**
     * Delete elements on the dynamic elements of the form object requested, if an _id is passed will be an element of an existing customer, if not will be state.form element
     *
     * @param {String} _id (optional): identifies the customer setted on the form to modify, if is not provided is a new customer
     * @param {String} entity: can be 'customer', 'tutor' or 'contact'
     * @param {Integer} entityIndex (optional): the array index of the entity with an element to delete
     * @param {String} field: identifies the field to modify
     * @param {Integer} fieldIndex: identifies the fieldIndex object to modify
     */
    delFormElement({ commit, getters, state }, { _id = null, entity, entityIndex = null, field, fieldIndex }) {
        const form = _id == null ? state.form : state.editform; /* New or existing customer */
        let target = null;
        /* Get the deep target in every type of entity */
        if (entity == 'contacts') {
            target = form[entity][entityIndex];
        }
        if (entity == 'tutor') {
            target = form[entity];
        }
        if (entity == 'customer') {
            target = form;
        }
        if (target[field].length == 1) {
            /* If the element to delete is the last one delete the entire key from the form state */
            commit('DEL_OBJ_KEY', { state: target, target: field })
        } else {
            commit('DEL_FORM_ELEMENT', { target: target[field], index: fieldIndex });
        }
    },
    /**
     * Fetch the edit form with the customer identified by the id received via param
     *
     * @param {String} id: identifies the customer to use at the form
     */
    async initEditForm({ commit, getters, dispatch, }, id) {
        try {
            /* The form starts with a copy of the customer, preventing the propagation of the changes maded on the form before store it */
            // let customer =  Object.assign({}, getters.getCustomerById(id));
            let customer =  JSON.parse(JSON.stringify(getters.getCustomerById(id)));
            /* Check if the customer exists or thrown an error */
            if (Object.keys(customer).length == 0 || !customer) {
                throw new ExceptionCustomerDoesNotExist('No existe el socio solicitado: ' + id);
            }
            customer = await dispatch('fetchCustomerImages', { customer: customer, sign: true, image: true });
            await commit('FETCH_FORM', { customer: customer, form: 'editform' });
            setTimeout(() => NProgress.done(true), 500);
        } catch(error) {
            NProgress.done(true);
            console.error(error.response ? error.response.data : error);
            this.$app.$showToast('danger', 'No se han podido completar la carga de datos. Código de error: FeVX@InEdFo', 'Ha ocurrido un error');
            if (error instanceof ExceptionCustomerDoesNotExist) {
                return router.push('/404');
            }
        }
    },
    /**
     * Fetch the form with the customer identified by the id received via param
     *
     * @param {String} id: identifies the customer to use at the form
     */
    async initForm({ commit, getters, dispatch }, id) {
        try {
            /* The form starts with a copy of the customer, preventing the propagation of the changes maded on the form before store it */
            // let customer =  Object.assign({}, getters.getCustomerById(id));
            let customer =  JSON.parse(JSON.stringify(getters.getCustomerById(id)));
            /* Check if the customer exists or thrown an error */
            if (Object.keys(customer).length == 0 || !customer) {
                throw new ExceptionCustomerDoesNotExist('No existe el socio solicitado: ' + id);
            }
            customer = await dispatch('fetchCustomerImages', { customer: customer, sign: true, image: true });
            await commit('FETCH_FORM', { customer: customer, form: 'form' });
            setTimeout(() => NProgress.done(true), 500);
        } catch(error) {
            NProgress.done(true);
            console.error(error.response ? error.response.data : error);
            this.$app.$showToast('danger', 'No se han podido completar la carga de datos. Código de error: FeVX@InFo', 'Ha ocurrido un error');
            if (error instanceof ExceptionCustomerDoesNotExist) {
                return router.push('/404');
            }
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
        /* Create the contact object on the fly with the customer passed data */
        const contact = Object.assign({}, ...CONTACT_KEYS.map(key => ({ [key]: customer[key] }) ));
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
    setCustomerEdited({ commit, dispatch, getters, state }, form) {
        const index = state.customers.findIndex(customer => customer._id == form._id);
        /* Before store at the state, fetch the customer dependencies getting its data from the related customer from customers state */
        if (form.tutor && form.tutor._id) {
            const relatedCustomer = getters.getCustomerById(form.tutor._id);
            TUTOR_KEYS.forEach(key => form.tutor[key] = relatedCustomer[key]);
        }
        if (form.contacts && form.contacts.length > 0 && form.contacts.some(contact => contact._id)) {
            form.contacts.forEach((contact, index) => {
                if (contact._id) {
                    const relatedCustomer = getters.getCustomerById(contact._id);
                    CONTACT_KEYS.forEach(key => form.contacts[index][key] = relatedCustomer[key]);
                }
            });
        }
        commit('SET_CUSTOMER_EDITED', { index: index, newVal: form });
    },
    /**
     * Sets the tutor data from the customer data passed, useful when a customer has a tutor that is a customer too on the render of the customer profile
     *
     * @param {String} _id (optional): identificates the customer that are being modified, if it's null the customer is still on creation
     * @param {Object} customer: the object with the data to use at the tutor
     */
    setTutor({ commit, getters, state }, { _id = null, customer }) {
        const target = _id == null ? state.form : state.editform;
        const tutor = Object.assign({}, ...TUTOR_KEYS.map(key => ({ [key]: customer[key] }) ));
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
    /**
     * Update the form belts of a existing customer or a new (defined by if the id para is provided. The newVal param defines the action: if a newVal is provided the current value is updated to it, if its value is null set it too because a delete was required)
     *
     * @param {String} id (optional): Identifies the id of a customer loaded at the form, if is not provided a new customer is being created
     * @param {Array} selectedBelts: Is the array of the selected belts to modify
     * @param {String} newVal (optional): Can contains a date or null for the deletions
     */
    updateFormBelts({ commit, state }, { id = null, selectedBelts, newVal = null }) {
        /* If the id is provided we edit the customer identified by it, if not we are creating a new customer */
        let form = id == null ? state.form : state.editform;
        let belts = JSON.parse(JSON.stringify(form.belts)); /* Local copy of the customer belts */
        /* Assign the new dates */
        belts.forEach(belt => {
            if (selectedBelts.some(sb => sb.grade == belt.grade)) {
                belt.date = newVal;
            }
        });
        /* If a existing customer is edited, propagate the changes */
        if (id) {
            localStorage.setItem('customer_updated', id);
            localStorage.removeItem('customer_updated');
        }
        /* If every dates are deleted and the form doesn't needs the belts delete it from the state else update the belts field on the target */
        if (!form.paymentData.rate.includes('Karate') && belts.every(belt => belt.date == null)) {
            commit('DEL_OBJ_KEY', { state: form, target: 'belts' });
        } else {
            commit('UPDATE_FIELD', { target: form, field: 'belts', newVal: belts });
        }
    },

    /****************************************************/ /* PAYMENTS */ /****************************************************/
    /**
     * Delete a specific payment
     *
     * @param {Object} item: the payment data to delete
     */
    deletePayment({ commit, getters }, item) {
        return new Promise(async (resolve, reject) => {
            /* Get the api response */
            const apiResponse = await http.post('/api/deletePayments', { item })
            /* Get the customer */
            const customer = getters.getCustomerById(item._id);
            /* Get the payment index */
            const paymentIndex = getters.getPaymentIndex(item._id, item.payment_id);
            /* Commit the mutation */
            commit('DELETE_PAYMENT', { customer: customer, paymentIndex: paymentIndex });
            /* Trigger a modification on the localStorage to propagate the changes on other windows */
            localStorage.setItem('customer_updated', item._id);
            localStorage.removeItem('customer_updated');
            resolve(apiResponse);
        });
    },
    /**
     * Update the entire payment data
     *
     * @param {Object} item: is the payment data to update
     */
    updatePaymentData({ commit, getters }, { items, action }) {
        return new Promise(async (resolve, reject) => {
            /* Call to the db to update the payments */
            let apiResponse = await http.post('/api/updatePayments', QS.stringify({ data: items, action: action }));
            apiResponse.data.updated.forEach(item => {
                /* Get the customer */
                const customer = getters.getCustomerById(item._id);
                /* Get the payment index */
                const paymentIndex = getters.getPaymentIndex(item._id, item.payment_id);
                /* Convert the apiResponse dates */
                item.dategenerated = item.dategenerated != null && item.dategenerated.$date ? moment(parseInt(item.dategenerated.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : item.dategenerated;
                item.dateconfirmed = item.dateconfirmed != null && item.dateconfirmed.$date ? moment(parseInt(item.dateconfirmed.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') : item.dateconfirmed;
                commit('UPDATE_PAYMENT', { customer: customer, paymentIndex: paymentIndex, newVal: item });
            });
            resolve(apiResponse.data);
        });
    },
}
