export default {
    DEFAULT_BELTS() {
        return [
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
        ]
    },
    DEFAULT_CONTACT() {
        return {
            // _id: null,
            // customerNumber: null,
            // emails: [],
            name: '',
            // notes: '',
            // phones: [],
        }
    },
    DEFAULT_FORM() {
        return {
            _id: null,
            customerNumber: null,
            active: true,
            // sign: '',
            // image: '',
            name: '',
            address: '',
            dni: '',
            dateofbirth: '',
            gender: '',
            // emails: [],
            phones: [ this.DEFAULT_PHONE() ],
            // tutor: null,
            // contacts: [],
            paymentData: {
                amount: '',
                // iban: '',
                // ibanownerdni: '',
                // ibanownername: '',
                paymenttype: '',
                rate: '',
                type: '',
                payment_id: '',
            },
            // payments: [],
            // belts: [
            //     { grade: 'blam', date: null, },
            //     { grade: 'amam', date: null, },
            //     { grade: 'amna', date: null, },
            //     { grade: 'nana', date: null, },
            //     { grade: 'nave', date: null, },
            //     { grade: 'veve', date: null, },
            //     { grade: 'veaz', date: null, },
            //     { grade: 'azaz', date: null, },
            //     { grade: 'azma', date: null, },
            //     { grade: 'mama', date: null, },
            //     { grade: 'nene', date: null, }
            // ],
            rightsProtect: {
                RPaccept: null,
                date: null,
            },
            rightsImage: {
                RIaccept: null,
                date: null,
            },
            // notes: [],
        }
    },
    DEFAULT_PHONE() {
        return {
            phone: '',
            notes: '',
        }
    },
    DEFAULT_TUTOR() {
        return {
            // _id: null,
            // customerNumber: null,
            address: '',
            dni: '',
            // emails: [],
            name: '',
            // notes: '',
            // phones: [],
        }
    },
}
