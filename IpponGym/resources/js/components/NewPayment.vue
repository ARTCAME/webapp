<template>
    <div class="d-block" data-v-step="wzd-modal-payments-0">
        <b-form-group class="mb-2">
            <IntervalSelector
                data-v-step="wzd-modal-payments-1"
                ref="intervalselector"
                v-model="interval"
                :confirmed="true"
                :customer="customer"></IntervalSelector>
        </b-form-group>
        <!-- Will be disabled if the payment type is via bank and the iban is not provided forcing to the user to edit this payment -->
        <transition appear name="fade-height">
            <b-form-group
                class="mb-0 my-3"
                v-if="paymentData.paymenttype == 'Domiciliación'"
                :disabled="paymentData.paymenttype == 'Domiciliación' && paymentData.iban == null">
                <h5 class="subtitle subtitle-sub">
                    Selecciona el nuevo estado
                </h5>
                <b-form-radio-group
                    buttons
                    button-variant="outline-secondary"
                    id="radio-np-newstate"
                    size="sm"
                    v-model="selectedState">
                    <!-- Disabled if the payment exists because if exists always will have the 'Pendiente' status -->
                    <b-form-radio
                        value="Pendiente"
                        v-b-tooltip.hover.noninteractive
                        v-if="existsPayment == undefined"
                        :disabled="existsPayment != undefined">Pendiente</b-form-radio>
                    <b-form-radio value="Confirmado">Confirmado</b-form-radio>
                    <b-form-radio value="Devuelto">Devuelto</b-form-radio>
                </b-form-radio-group>
            </b-form-group>
        </transition>
        <b-form-group class="mb-0">
            <h5 class="subtitle subtitle-sub">
                Confirma y guarda el nuevo pago
            </h5>
        </b-form-group>
        <!-- Payment data presentation -->
        <!-- Alert to the user when the payment data is diferent to the customer payment data -->
        <b-alert
            show
            variant="warning"
            v-if="paymentDataDiff">
            El pago ya estaba registrado y se va a actualizar su estado. Algunos datos de la ficha del socio son ahora diferentes a los del pago registrado. Tenlo en cuenta por si quieres modificar el pago antes de guardar.
        </b-alert>
        <transition appear name="fade-height">
            <!-- Shown if the interval is set and the message will change if the payment exists or if not -->
            <b-alert
                class="py-1"
                key="alert-np-paymentdatadiff"
                show
                variant="info"
                v-if="interval && (paymentDataDiff || existsPayment == undefined)">
                {{ paymentDataDiff ? 'Se actualizará el pago con los siguientes datos:' : existsPayment == undefined ? 'Se añadirá el pago con los siguientes datos:' : '' }}
            </b-alert>
        </transition>
        <b-list-group data-v-step="wzd-modal-payments-2" id="np-main-list-group">
            <b-list-group-item class="py-1">
                <b-row>
                    <b-col cols="4">
                        NOMBRE:
                    </b-col>
                    {{ customer.name }}
                </b-row>
            </b-list-group-item>
            <b-list-group-item class="py-1">
                <b-row>
                    <b-col cols="4">
                        TARIFA:
                    </b-col>
                    {{ paymentData.rate }}
                </b-row>
            </b-list-group-item>
            <b-list-group-item class="py-1">
                <b-row>
                    <b-col cols="4">
                        IMPORTE:
                    </b-col>
                    {{ paymentData.amount }}
                </b-row>
            </b-list-group-item>
            <b-list-group-item class="py-1">
                <b-row>
                    <b-col cols="4">
                        FORMA DE PAGO:
                    </b-col>
                    {{ paymentData.paymenttype }}
                </b-row>
            </b-list-group-item>
            <!-- Shown when the payment type is via bank -->
            <b-list-group-item class="py-1"
                v-if="paymentData.paymenttype == 'Domiciliación'">
                <b-row>
                    <b-col cols="4">
                        IBAN:
                    </b-col>
                    <span
                        :class="paymentData.iban == null ? 'text-danger' : ''">
                        {{ paymentData.iban == null ? 'No hay iban' : paymentData.iban }}
                    </span>
                </b-row>
            </b-list-group-item>
            <b-list-group-item class="py-1">
                <b-row>
                    <b-col cols="4">
                        NUEVO ESTADO:
                    </b-col>
                    <span
                        :class="paymentData.paymenttype == 'Domiciliación' && selectedState == null ? 'text-danger' : ''">
                        {{ paymentData.paymenttype == 'Domiciliación' ? selectedState != null ? selectedState : 'Selecciona un estado' : 'Confirmado' }}
                    </span>
                </b-row>
            </b-list-group-item>
            <b-list-group-item
                class="py-1"
                variant="secondary">
                <b-row>
                    <b-col cols="4">
                        PERIODO DE PAGO:
                    </b-col>
                    <span
                        :class="$moment(interval, 'YYYY-MM', true).isValid() ? '' : 'text-danger'">
                        {{ $moment(interval, 'YYYY-MM', true).isValid() ? interval : 'Selecciona un periodo de pago' }}
                    </span>
                </b-row>
            </b-list-group-item>
        </b-list-group>
        <!-- The save button will be disabled (and show texts) conditionally if:
            - Exists errors on the manual year introduced
            - The payment type is via bank and the iban is not provided
            - The payment type is via bank and no new status is selected
            - The payment interval is incorrect
            - If the saving process is being started
         -->
        <b-button
            block
            class="my-3"
            v-b-modal.everywhere-payment-confirm
            :disabled="errors.has('np-alteryear') || (paymentData.paymenttype == 'Domiciliación' && paymentData.iban == null) || (paymentData.paymenttype == 'Domiciliación' && selectedState == null) || interval == null || savingPayment"
            :variant="errors.has('np-alteryear') ? 'warning' : paymentData.paymenttype == 'Domiciliación' && paymentData.iban == null ? 'danger' : (paymentData.paymenttype == 'Domiciliación' && selectedState == null) || interval == null ? 'outline-success' : 'success'">
            <b-spinner
                class="align-middle"
                small
                type="grow"
                v-if="savingPayment"></b-spinner>
            <span
                class="ml-2">
                {{ savingPayment ? 'Guardando datos...' : errors.has('np-alteryear') ? 'El año introducido no es correcto' : paymentData.paymenttype == 'Domiciliación' && paymentData.iban == null ? 'No se puede registrar, no hay iban. Modifica el pago en la ficha del socio' : interval == null ? 'Selecciona un intervalo para el nuevo pago' : paymentData.paymenttype == 'Domiciliación' && selectedState == null ? 'Selecciona un estado para el nuevo pago' : 'Registrar pago' }}
            </span>
        </b-button>
        <b-link
            positioning="top"
            target="_blank"
            :to="{ name: 'customers.profile', params: { id: customer._id } }">
            <b-form-text
                class="ig-link text-center"
                title="Abre la ficha del socio"
                v-b-tooltip.hover.bottom.noninteractive>
                Si quieres modificar algún dato accede a la ficha de socio y edítalo
            </b-form-text>
        </b-link>
        <b-modal
            centered
            id="everywhere-payment-confirm"
            size="md"
            @hidden="$manageScrollBar"
            @show="$manageScrollBar">
            <template #modal-header>
                <h5>Confirma los datos del pago</h5>
            </template>
            <template #default>
                <b-row>
                    <b-col cols="4">
                        NOMBRE:
                    </b-col>
                    {{ customer.name }}
                </b-row>
                <b-row>
                    <b-col cols="4">
                        TARIFA:
                    </b-col>
                    {{ customer.paymentData.rate }}
                </b-row>
                <b-row>
                    <b-col cols="4">
                        IMPORTE:
                    </b-col>
                    {{ customer.paymentData.amount }}
                </b-row>
                <b-row>
                    <b-col cols="4">
                        FORMA DE PAGO:
                    </b-col>
                    {{ customer.paymentData.paymenttype }}
                </b-row>
                <b-row
                    v-if="paymentData.paymenttype == 'Domiciliación'">
                    <b-col cols="4">
                        IBAN:
                    </b-col>
                    {{ paymentData.iban }}
                </b-row>
                <b-row>
                    <b-col cols="4">
                        NUEVO ESTADO:
                    </b-col>
                    {{ state }}
                </b-row>
                <b-row>
                    <b-col cols="4">
                        PERIODO DE PAGO:
                    </b-col>
                    <span
                        :class="$moment(interval, 'YYYY-MM', true).isValid() ? '' : 'text-danger'">
                        {{ $moment(interval, 'YYYY-MM', true).isValid() ? interval : 'Selecciona un periodo de pago' }}
                    </span>
                </b-row>
            </template>
            <template #modal-footer="{ ok, cancel }">
                <b-button
                    size="sm"
                    variant="outline-warning"
                    @click="cancel()">
                    Cancelar
                </b-button>
                <b-button
                    size="sm"
                    variant="outline-success"
                    @click="newPayment(false), ok()">
                    Guardar
                </b-button>
                <b-button
                    size="sm"
                    variant="success"
                    @click="newPayment(true), ok()">
                    Guardar con recibo
                </b-button>
            </template>
        </b-modal>
        <!-- Hided printable bill -->
        <div class="printable-wrp">
            <div class="pr-1 printable-ctn" ref="printableNPB">
                <Bill
                    v-if="inInterval != null"
                    :customer="customer"
                    :interval="inInterval"></Bill>
            </div>
        </div>
    </div>
</template>
<script>
    import { http } from '../utils/http';
    import NProgress from 'nprogress';
    import { mapActions, mapGetters, mapState } from 'vuex';
    const QS = require('qs'); /* Needed at axios.post function to pass arrays as params to the controller */
    export default {
        data() {
            return {
                btnMonths: [
                    { text: 'Enero', value: 0, },
                    { text: 'Febrero', value: 1, },
                    { text: 'Marzo', value: 2, },
                    { text: 'Abril', value: 3, },
                    { text: 'Mayo', value: 4, },
                    { text: 'Junio', value: 5, },
                    { text: 'Julio', value: 6, },
                    { text: 'Agosto', value: 7, },
                    { text: 'Septiembre', value: 8, },
                    { text: 'Octubre', value: 9, },
                    { text: 'Noviembre', value: 10, },
                    { text: 'Diciembre' ,value: 11, },
                ], /* Months selector */
                btnYears: [ this.$moment().year() - 1, this.$moment().year(), this.$moment().year() + 1 ], /* Years selector only provides the current and +-1, is assumed that the user never would add a payment out of this ranges */
                interval: null, /* Stores the IntervalSelector value */
                inInterval: null, /* Stores a copy of the interval */
                newDateConfirmed: null, /* Stores the confirmation date of a new payment to use it on a bill */
                savingPayment: false, /* Flag to determine if a payment is being saved and prevent multiple clicks on the save payment button */
                selectedState: null, /* v-model of the payment status to apply on the bank payments */
            }
        },
        computed: {
            ...mapGetters(['getCustomerById', 'getPaymentData']),
            ...mapState({
                newCustomerForm: state => state.form,
                editCustomerForm: state => state.editform,
            }),
            /**
             * To react as expect, search the customer _id passed as prop (we can receive the customer via prop from the parent PaymentsEverywhere (there we obtain the entire customer) but with this steps we loose the reactivity when a customer is edited on his profile page)
             *
             * @return {Object} Object with the customer data
             */
            customer() {
                return this.getCustomerById(this._id);
            },
            /**
             * Defines the current form state (edit or new customer)
             *
             * @return {Object} The object with the form data from the customers state
             */
            form() {
                return this.$route.name == 'customers.new' ? this.newCustomerForm : this.editCustomerForm;
            },
            /**
             * Reveal if a payment exists for a customer
             *
             * @return {Object|undefined} If exists returns the payment data and if not returns undefined
             */
            existsPayment() {
                return this.getPaymentData(this.customer._id, this.interval);
            },
            /**
             * Sets the payment data useful to the component. If we are updating an existing payment its data is used if not the customer default payment data.
             *
             * @return {Object} Object with the payment data attr necessary to create or update payments
             */
            paymentData() {
                return this.existsPayment != undefined ? this.existsPayment : this.customer.paymentData;
            },
            /**
             *  Determines if the current payment data is different to the customer profile payment data to advise to the user of that info
             *
             * @return {Boolean} Boolean that indicates if the payment data used is diferent to the customer stored payment data
             */
            paymentDataDiff() {
                const paymentData = this.existsPayment;
                const keys = ['amount', 'paymenttype', 'rate', 'iban' ];
                let result = false;
                if (paymentData != undefined) {
                    keys.forEach(key => {
                        if (paymentData[key] != this.customer.paymentData[key]) {
                            result = true;
                        }
                    })
                }
                return result;
            },
            /**
             * Returns the selected state for the new payment to save
             *
             * @return {String} String with the new state for the payment, in no bank payments the new state always will be confirmed
             */
            state() {
                return this.paymentData.paymenttype != 'Domiciliación' ? 'Confirmado' : this.selectedState;
            },
        },
        methods: {
            ...mapActions(['addPayment', 'updatePaymentData']),
            /**
             * Calls to the api and to the vuex to store the new payment registered
             *
             * @param {Boolean} print: If he user wants to print a bill
             */
            async newPayment(print) {
                /* Change the flag to prevent multiple clicks */
                this.savingPayment = true;
                try {
                    let response;
                    if (this.existsPayment == undefined) {
                        /* Add the payment at the db */
                        response = await http.post('/api/newPayment', { id: this.customer._id, paymentData: this.customer.paymentData, interval: this.interval, status: this.state });
                        console.log(response);
                        /* Before to modifiy the state, stores a local copy of the interval */
                        this.inInterval = this.interval;
                        /* Propagate the changes to the current state */
                        this.addPayment({ _id: this.customer._id, apiResponse: response.data})
                            .then(async response => {
                                /* If its requested, print the bill, the inInterval acts like a flag to allow the print */
                                if (print) {
                                    await this.printBill();
                                }
                            });
                    } else {
                        let saveData = { _id: this.customer._id, ...this.paymentData };
                        saveData.status = this.state;
                        /* Update the payment at the db */
                        response = await http.post('/api/updatePayments', QS.stringify({ data: new Array(saveData), date: null, action: this.state.toLowerCase() }));
                        /* Before to modifiy the state, stores a local copy of the interval */
                        this.inInterval = this.interval;
                        /* Update the payment data at the store based on the updated db payment data */
                        this.updatePaymentData({ ...response.data.updated[0] })
                            .then(async response => {
                                /* If its requested, print the bill, the inInterval acts like a flag to allow the print */
                                if (print) {
                                    await this.printBill();
                                }
                            });
                    }
                    this.$bvModal.msgBoxOk('Pago registrado correctamente' + (print ? '. El recibo se descargará automáticamente' : '') , {
                        buttonSize: 'sm',
                        centered: true,
                        okTitle: 'Aceptar',
                        size: 'sm',
                    })
                        .then((result) => {
                            if(result) {
                                this.$bvModal.hide('payments-nav-modal');
                            }
                        });
                    /* Change the flag to prevent multiple clicks */
                    this.savingPayment = false;
                    /* Trigger a modification on the localStorage to propagate the changes on other windows */
                    localStorage.setItem('customer_updated', this.customer._id);
                    localStorage.removeItem('customer_updated');
                } catch(error) {
                    this.$bvModal.msgBoxOk('No se ha podido completar la operación. Código de error: FENePa@NePa', {
                        buttonSize: 'sm',
                        centered: true,
                        okTitle: 'Aceptar',
                        okVariant: 'danger',
                        size: 'sm',
                        title: 'ERROR',
                    });
                    /* Change the flag to prevent multiple clicks */
                    this.savingPayment = false;
                    NProgress.done();
                    console.error(error.response ? error.response.data : error);
                }
            },
            /**
             * Prints the generated bill
             */
            printBill() {
                const filename = this.customer.name.replace(/\s/g, '') + '__recibo__' + this.$moment().format('YYYY-MM-DD_HH_mm') + '.pdf';
                const vm = this;
                this.$html2print(filename, this.$refs.printableNPB);
            },
        },
        props: [
            '_id', /* Object with the customer id to add on he the payment */
        ],
    }
</script>

