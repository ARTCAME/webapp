import moment from 'moment';
import utils from '../utils/helpers';

export default {
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

        /* Iterate over the state customers */
        state.customers.forEach(customer => {
            /* The search by phones, paymentData or emails IS NOT TESTED because is not used! */
            if (['phones', 'paymentData', 'emails'].includes(key)) {
                (utils.checkCoincidence(utils.cleanData(JSON.stringify(customer[key])), value) && customers.push(customer))
            /* Always check the possibility of doesn't exists of the key */
            } else if (customer[key]) {
                (utils.checkCoincidence(customer[key], value) && customers.push(customer))
            }
        })
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
        return state.customers.filter(customer => (['Karate','Personalizada + Karate', 'Dirigidas + Karate'].includes(customer.paymentData.rate) && customer.belts) || (customer.belts && customer.belts.some(belt => belt.date != null)));
    },
    /**
     * @return Array of customers that have one or more payments
     */
    getCustomersWithPayments: state => {
        return state.customers.filter(customer => customer.payments && customer.payments.length > 0);
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
    /**
     * @return Array with the customers that a id is its tutor
     */
    isTutor: state => id => {
        return state.customers.filter(customer => customer.tutor && customer.tutor._id && customer.tutor._id == id);
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
        /* Iterate over the state customers */
        state.customers.forEach(customer => {
            (customer['name'] && utils.checkCoincidence(customer['name'], value) && customers.push(customer)) ||
            (customer['dni'] && utils.checkCoincidence(customer['dni'], value) && customers.push(customer)) ||
            (customer['address'] && utils.checkCoincidence(customer['address'], value) && customers.push(customer)) ||
            (customer['_id'] && utils.checkCoincidence(customer['_id'], value) && customers.push(customer)) ||
            (customer['phones'] && utils.checkCoincidence(utils.cleanData(JSON.stringify(customer['phones'])), value) && customers.push(customer)) ||
            (customer['emails'] && utils.checkCoincidence(utils.cleanData(JSON.stringify(customer['emails'])), value) && customers.push(customer));
        })
        return customers;
    },
}
