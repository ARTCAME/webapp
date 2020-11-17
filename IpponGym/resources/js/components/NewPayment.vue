<template>
    <div>
        <b-modal
            centered
            id="previous-pending-modal"
            no-close-on-backdrop
            no-close-on-esc
            size="lg"
            @hide="activeWizard = false">
            <!-- Invoke the wizard -->
            <transition appear name="fade-delayed">
                <wizard
                    name="wzd-modal-payments-previouspending"
                    v-show="previousPending.length > 0 && activeWizard"
                    :steps=wmodalpayments_previouspending></wizard>
            </transition>
            <template #modal-header>
                <h5>Revisa los pagos pendientes</h5>
            </template>
            <b-form-group class="my-2" data-v-step="wzd-modal-payments-previouspending-0">
                <b-alert
                    class="py-1"
                    variant="danger"
                    :show="true">
                    <fa-icon class="mr-2 text-danger" icon="exclamation-triangle"></fa-icon>
                    El socio tiene pagos {{ manual ? 'MANUALES' : periodic ? 'PERIÓDICOS' : '' }} pendientes, revisa si alguno de ellos es el que quieres gestionar
                </b-alert>
                <b-card
                    key="previous-pending-table">
                    <TableResults
                        :fields="tableFields"
                        :items="previousPending"
                        :lite="false"
                        :pagination="5">
                        <template
                            #actions="row">
                            <b-button
                                class="ig-small-btn"
                                size="sm"
                                variant="outline-primary"
                                @click="usePreviousPending(row.row.item);">
                                <span class="text">Usar</span>
                            </b-button>
                        </template>
                        <template
                            #col="tableFields">
                            <col
                                v-for="field in tableFields.fields"
                                :key="field.key"
                                :style="{ width: field.key == 'amount' || field.key == 'type' || field.key == 'interval' ? '70px' : field.key == 'paymenttype' ? '110px' : field.key == 'rate' ? '150px' : field.key == 'actions' ? '50px' : 'auto' }">
                        </template>
                    </TableResults>
                </b-card>
            </b-form-group>
            <template
                #modal-footer="{ ok }">
                <b-button
                    class="ml-0 mr-auto"
                    size="sm"
                    variant="outline-success"
                    @click="ok();">
                    Omitir y gestionar nuevo pago
                </b-button>
            </template>
        </b-modal>
        <PaymentEditForm
            :toEditItem="editingItem"
            @cancel="$bvModal.hide('payments-nav-modal')"
            @delete="$bvModal.hide('payments-nav-modal')"
            @save="save(...arguments)">
        </PaymentEditForm>
    </div>
</template>

<script>
    import * as WzdSteps from './wzdsteps/modalpayments';
    import { mapActions, mapGetters } from 'vuex';
    import NProgress from 'nprogress';
    export default {
        data() {
            return {
                activeWizard: true,
                editingItem: {
                    _id: '',
                    payment_id: '', /* This value will only be assigned when a existing payment is selected */
                    status: '', /* This value will only be assigned when a existing payment is selected */
                    type: '', /* This value will only be assigned when a the type payment is selected */
                    amount: '',
                    dateconfirmed: '',
                    iban: '',
                    ibanownerdni: '',
                    ibanownername:'',
                    interval: '',
                    paymenttype: '',
                    rate: '',
                }, /* Will store the data of a editing payment */
                paymentFields: ['iban', 'ibanownername', 'ibanownerdni', 'paymenttype'], /* Common payment data to copy from the customer */
                manual: false,
                periodic: false,
                tableFields: [
                    { key: 'type', label: 'Tipo', },
                    { key: 'paymenttype', label: 'Forma de pago', },
                    { key: 'amount', label: 'Importe', },
                    { key: 'interval', label: 'Intervalo', },
                    { key: 'rate', label: 'Tarifa', },
                    { key: 'actions', label: '', },
                ], /* Fields to the pending payments table */
                wmodalpayments_previouspending: WzdSteps.wmodalpayments_previouspending,
            }
        },
        computed: {
            ...mapGetters(['getCustomerById', 'getFilteredPaymentsById']),
            /**
             * To react as expect, search the customer _id passed as prop (we can receive the customer via prop from the parent PaymentsEverywhere (there we obtain the entire customer) but with this steps we loose the reactivity when a customer is edited on his profile page)
             *
             * @return {Object} Object with the customer data
             */
            customer() {
                return this.getCustomerById(this._id);
            },
            /**
             * Returns the pending payments for the current customer/type of payment
             */
            previousPending() {
                return this.getFilteredPaymentsById(this._id, null, null, ['Pendiente'], null, ['manual', 'periodic'], null, null);
            },
        },
        created() {
            /* Initialize the wizard steps content */
            // this.wmodalpayments_previouspending = WzdSteps.wmodalpayments_previouspending;
        },
        methods: {
            ...mapActions(['addPayment', 'updatePaymentData']),
            /**
             * Via vuex, calls to the api to update or add the payment data of a new payment. During a creation of a payment the process can turn an update because the payment to add was previously added and remains pending, then the user update it instead of create a new one.
             *
             * @param {Object} item: The object with the payment to add/update data
             * @param {Boolean} print: If he user wants to print a bill
             */
            save(item, print) {
                const isNew = item.payment_id == '';
                if (isNew) {
                    /* Add the payment to the db via vuex */
                    this.addPayment(item)
                        .then(() => {
                            NProgress.set(0.8);
                            /* Show feedback to the user */
                            successFeedback();
                        })
                        .catch((error) => {
                            /* Show feedback to the user */
                            errorFeedback(error);
                        });
                } else {
                    /* Update the payment on the db via vuex */
                    this.updatePaymentData({ items: new Array(item), action: 'updating' })
                        .then(() => {
                            NProgress.set(0.8);
                            /* Show feedback to the user */
                            successFeedback();
                            /* Trigger a modification on the localStorage to propagate the changes on other windows. Unlike the add payment process, during the update is not propagated on vuex to avoid massive repetitions on mass customers updates */
                            localStorage.setItem('customer_updated', item._id);
                            localStorage.removeItem('customer_updated');
                        })
                        .catch((error) => {
                            /* Show feedback to the user */
                            errorFeedback(error);
                        });
                }
                const self = this;
                function successFeedback() {
                    /* Show a message to the user when the process is correct */
                    const message = (isNew ? 'Pago registrado correctamente' : 'Pago actualizado correctamente') + (print ? '. El recibo se descargará automáticamente' : '');
                    self.$bvModal.msgBoxOk(message , {
                            buttonSize: 'sm',
                            centered: true,
                            okTitle: 'Aceptar',
                            size: 'sm',
                        })
                        .then(() => {
                            self.$bvModal.hide('payments-nav-modal');
                            NProgress.done();
                        })
                }
                function errorFeedback(error) {
                    self.$bvModal.msgBoxOk('No se ha podido completar la operación. Código de error: FENePa@NePa', {
                        buttonSize: 'sm',
                        centered: true,
                        okTitle: 'Aceptar',
                        okVariant: 'danger',
                        size: 'sm',
                        title: 'ERROR',
                    });
                    NProgress.done();
                    console.error(error.response ? error.response.data : error);
                }
            },
            /**
             * Set the editable fields keys to the editing item based on the customer fields value.
             */
            setEditableFields(customer) {
                this.paymentFields.forEach(field => { if (customer.paymentData[field]) this.$set(this.editingItem, field, customer.paymentData[field]) });
                ['name', '_id'].forEach(field => this.$set(this.editingItem, field, customer[field]));
            },
            /**
             * Sets the previous pending payment selected data to the editing item values to edit this payment instead of create new one
             */
            usePreviousPending(row) {
                /* Assign to the object the new data */
                Object.keys(this.editingItem).forEach(async field => {
                    /* Reset and the value and add the new one if exists */
                    await this.$set(this.editingItem, field, '');
                    await this.$set(this.editingItem, field, row[field]);
                });
                this.$bvModal.hide('previous-pending-modal');
            }
        },
        mounted() {
            /* If there are some previous pending payments, advise to the user */
            if (this.previousPending.length > 0) {
                this.$bvModal.show('previous-pending-modal');
            }
        },
        props: [
            '_id'
        ],
        watch: {
            _id: {
                immediate: true,
                handler: function (newVal, oldVal) {
                    /* Set the fields data for the new customer */
                    this.setEditableFields(this.customer);
                }
            }
        },
    }
</script>
