import defaults from './customerDEFAULTS';
import moment from 'moment';
const GRADES = [ /* 'blbl',  */'blam', 'amam', 'amna', 'nana', 'nave', 'veve', 'veaz', 'azaz', 'azma', 'mama', 'nene', ];
const SPECIAL_CHARACTERS = { 'Ã': 'A', 'À': 'A', 'Á': 'A', 'Ä': 'A', 'Â': 'A', 'È': 'E', 'É': 'E', 'Ë': 'E', 'Ê': 'E', 'Ì': 'I', 'Í': 'I', 'Ï': 'I', 'Î': 'I', 'Ò': 'O', 'Ó': 'O', 'Ö': 'O', 'Ô': 'O', 'Ù': 'U', 'Ú': 'U', 'Ü': 'U', 'Û': 'U', 'ã': 'a', 'à': 'a', 'á': 'a', 'ä': 'a', 'â': 'a', 'è': 'e', 'é': 'e', 'ë': 'e', 'ê': 'e', 'ì': 'i', 'í': 'i', 'ï': 'i', 'î': 'i', 'ò': 'o', 'ó': 'o', 'ö': 'o', 'ô': 'o', 'ù': 'u', 'ú': 'u', 'ü': 'u', 'û': 'u', 'Ñ': 'N', 'ñ': 'n', 'Ç': 'c', 'ç': 'c' };
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
/**
 * Check if the value passed exists and has coincidences with the filter applied
 *
 * @param {String} value: data to be converted to string and to lower case then to check if has coincidences
 * @param {String} filter: filter typed by the user
 */
function checkCoincidence(value, filter) {
    if (value) {
        return manageSpecialCharacters(value.toString().toLowerCase()).includes(filter);
    }
    return false;
}
/**
 * Clean the object|array stringify chars and the object keys knowed to avoid dirty results
 *
 * @param {String} fieldValue: the value of the customer[key] to compare with the data typed by the users
 */
function cleanData(fieldValue) {
    return fieldValue.replace(/[\'\"\]\[\(\)\,\:\{\}]|\bnull|\bphone|\bnotes|\biban|\bibanownername|\bibanownerdni|\brate|\bamount|\bpaymenttype+/g, '')
}
export default {
    /****************************************************/ /* BELTS */ /****************************************************/
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

    /****************************************************/ /* CUSTOMERS */ /****************************************************/
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

        /* Iterate over the state customers */
        state.customers.forEach(customer => {
            /* The search by phones, paymentData or emails IS NOT TESTED because is not used! */
            if (['phones', 'paymentData', 'emails'].includes(key)) {
                (checkCoincidence(cleanData(JSON.stringify(customer[key])), filter) && customers.push(customer))
            /* Always check the possibility of doesn't exists of the key */
            } else if (customer[key]) {
                (checkCoincidence(customer[key], filter) && customers.push(customer))
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
        let filter = manageSpecialCharacters(value.toString().toLowerCase());
        /* Iterate over the state customers */
        state.customers.forEach(customer => {
            (customer['name'] && checkCoincidence(customer['name'], filter) && customers.push(customer)) ||
            (customer['dni'] && checkCoincidence(customer['dni'], filter) && customers.push(customer)) ||
            (customer['address'] && checkCoincidence(customer['address'], filter) && customers.push(customer)) ||
            (customer['_id'] && checkCoincidence(customer['_id'], filter) && customers.push(customer)) ||
            (customer['phones'] && checkCoincidence(cleanData(JSON.stringify(customer['phones'])), filter) && customers.push(customer)) ||
            (customer['emails'] && checkCoincidence(cleanData(JSON.stringify(customer['emails'])), filter) && customers.push(customer));
        })
        return customers;
    },

    /****************************************************/ /* FORM */ /****************************************************/
    /**
     * @param {String} stateName: the name of the object to serve
     *
     * @return {Object} Object with the state requesteds
     */
    getDefaultState: (state) => (stateName) => {
        switch (stateName) {
            case 'form':
                return defaults.DEFAULT_FORM();
            case 'tutor':
                return defaults.DEFAULT_TUTOR();
            case 'contacts':
                return defaults.DEFAULT_CONTACT();
            case 'phones':
                return defaults.DEFAULT_PHONE();
            case 'emails':
                return "";
            case 'belts':
                return defaults.DEFAULT_BELTS();
        }
    },

    /****************************************************/ /* PAYMENTS */ /****************************************************/
    /**
     * Function to filter by the provided filters the payments provided
     *
     * @param {Array} payments: The array with the payments to filter
     * @param {Array} filterYears: Array with the years to filter
     * @param {Array} filterMonths: Array with the months to filter
     * @param {Array} filterStates: Array with the states to filter
     * @param {Array} filterPaytype: Array with the paytype to filter
     * @param {Boolean} inactives: Indicates that are requested the inactive customers or not
     *
     * @returns {Array} Array composed by the filtered payments
     */
    filterPayments: (state, getters) => (payments, filterYears, filterMonths, filterStates, filterPaytype, filterType, creationRange, confirmationRange, inactives) => {
        /* Apply all the filters requested to the builded payments */
        if (!inactives) {
            payments = payments.filter(payment => payment.active == true);
        }
        if (filterYears && filterYears.length > 0) {
            payments = payments.filter(payment => filterYears.includes(moment(payment.interval,'YYYY-MM').year()));
        }
        if (filterMonths && filterMonths.length > 0) {
            payments = payments.filter(payment => filterMonths.includes(moment(payment.interval,'YYYY-MM').month()));
        }
        if (filterStates && filterStates.length > 0) {
            payments = payments.filter(payment => filterStates.includes(payment.status));
        }
        if (filterPaytype && filterPaytype.length > 0) {
            payments = payments.filter(payment => filterPaytype.includes(payment.paymenttype));
        }
        if (filterType && filterType.length > 0) {
            payments = payments.filter(payment => filterType.includes(payment.type));
        }
        if (creationRange && creationRange.startDate != null && creationRange.endDate != null) {
            payments = payments.filter(payment => moment(payment.dategenerated, 'DD/MM/YYYY HH:mm:ss').isSameOrAfter(moment(creationRange.startDate, 'YYYY/MM/DD HH:mm:ss')) && moment(payment.dategenerated, 'DD/MM/YYYY HH:mm:ss').isSameOrBefore(moment(creationRange.endDate, 'YYYY/MM/DD HH:mm:ss')));
        }
        if (confirmationRange && confirmationRange.startDate != null && confirmationRange.endDate != null) {
            payments = payments.filter(payment => moment(payment.dateconfirmed, 'DD/MM/YYYY HH:mm:ss').isSameOrAfter(moment(confirmationRange.startDate, 'YYYY/MM/DD HH:mm:ss')) && moment(payment.dateconfirmed, 'DD/MM/YYYY HH:mm:ss').isSameOrBefore(moment(confirmationRange.endDate, 'YYYY/MM/DD HH:mm:ss')));
        }
        return payments;
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
    getFilteredPaymentsAll: (state, getters) => (filterYears, filterMonths, filterStates, filterPaytype, filterType, creationRange, confirmationRange, inactives) => {
        let payments = [];
        /* Build the array with all the payments by sum customer and payment data */
        getters.getCustomersWithPayments.forEach(customer => {
            if (customer.payments) {
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
            }
        });
        /* Filter the payments with the filters provided */
        return getters.filterPayments(payments, filterYears, filterMonths, filterStates, filterPaytype, filterType, creationRange, confirmationRange, inactives);
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
    getFilteredPaymentsById: (state, getters) => (_id, filterYears, filterMonths, filterStates, filterPaytype, filterType, creationRange, confirmationRange, inactives) => {
        let payments = [];
        const customer = getters.getCustomerById(_id);
        /* Build the array with all the payments by sum customer and payment data */
        if (customer.payments) {
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
        }
        /* Filter the payments with the filters provided */
        return getters.filterPayments(payments, filterYears, filterMonths, filterStates, filterPaytype, filterType, creationRange, confirmationRange, inactives);
    },
    /**
     * @param {String} _id: Identifies the customer to search on it
     * @param {String} paymentId: Identifies the payment to retrieve
     *
     * @return {Object|undefined} If the payment exists returns it if not returns undefined
     */
    getPaymentByPaymentId: (state, getters) => (_id, paymentId) => {
        const customer = getters.getCustomerById(_id);
        if (paymentId == null || !customer.payments) {
            return undefined;
        }
        return customer.payments.find(payment => payment.payment_id == paymentId);
    },
    /**
     * @param {String} _id: Identifies the customer to search on it
     * @param {String} interval: Identifies the payment to search on the customer
     *
     * @return {Array|undefined} If the payment/s exists returns it in array if not undefined
     */
    getPaymentData: (state, getters) => (_id, interval) => {
        const customer = getters.getCustomerById(_id);
        if (interval == null || !customer.payments) {
            return undefined;
        }
        /* The find will only reveal one element because the periodic payments can share its payment interval */
        return customer.payments.find(payment => payment.type == 'periodic' && payment.interval == interval);
    },
    /**
     * @param {String} id: identifies the customer to search on his payments
     * @param {String} payment_id: identifies the payment to search
     *
     * @return {Integer} The index of the payment searched on the customer payments, can be -1 if no payment has founded
     */
    getPaymentIndex: (state, getters) => (id, payment_id) => {
        let customer = getters.getCustomerById(id);
        return customer.payments.indexOf(customer.payments.find(payment => payment.payment_id == payment_id)) || -1;
    },
    /**
     * @return {Array} Array sorted with the years with payments (extracted from the existing payments intervals)
     */
    getPaymentsYears: (state, getters) => {
        let years = [moment().year()];
        /* Iterate over the payments to extract the distinct year that appear in their intervals */
        getters.getCustomersWithPayments.forEach(customer => {
            if (customer.payments) {
                customer.payments.forEach(payment => {
                    moment(payment.interval, 'YYYY-MM').isValid() && !years.includes(moment(payment.interval, 'YYYY-MM').year()) && years.push(moment(payment.interval, 'YYYY-MM').year());
                });
            }
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
}
