import defaults from './customerDEFAULTS';
export default {
    /****************************************************/ /* HELPERS */ /****************************************************/
    /**
     * Deletes an specific key of an object
     *
     * @param {Object} state: the state on delete the key
     * @param {String} target: the name of the key
     */
    DEL_OBJ_KEY({}, { state, target }) {
        // delete state[target];
        Vue.delete(state, target);
    },

    /****************************************************/ /* BELTS */ /****************************************************/
    /**
     * Save the updates of specific fields of a belt
     *
     * @param {String} field: the target field to update
     * @param {any} newVal: the new value to save
     * @param {String} _id: the id of the target belt
     */
    UPDATE_BELT_DATA({}, { field, newVal, belt }) {
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

    /****************************************************/ /* CUSTOMERS */ /****************************************************/
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

    /****************************************************/ /* FORM */ /****************************************************/
    /**
     * Adds dynamic elements to the form object, 'this' elements will be always arrays of other elements (objects normally) and if not exists we create it
     *
     * @param {any} target: the array to fill with the new value
     * @param {any} newVal: will be the DEFAULT_* constant or the new value that is needed to add
     */
    ADD_FORM_ELEMENT({}, { form, target, newVal }) {
        // console.log(target);
        // target.push(newVal);
        // Vue.set(target, target.length, newVal);
        Vue.set(form, target, newVal);
    },
    /**
     * Adds a tutor object to the form object, by default the tutor is null and needs a specific mutation
     */
    ADD_TUTOR(state, target) {
        Vue.set(target, 'tutor', defaults.DEFAULT_TUTOR());
    },
    /**
     * Reset the form to its clean value
     */
    CLEAR_FORM(state, target) {
        Vue.set(state, target, defaults.DEFAULT_FORM());
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

    /****************************************************/ /* PAYMENTS */ /****************************************************/
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
}
