
<template>
    <div>
        <b-card id="card-pagos">
            <b-form-group>
                <h5 class="subtitle" md="4">Gestión de pagos</h5>
            </b-form-group>
            <Payments
                ref="payments"
                :isDisabled="false"
                :tableFields="tableFields">
            </Payments>
        </b-card>
    </div>
</template>
<script>
    import axios from 'axios';
    import { mapActions } from "vuex";
    export default {
        data() {
            return {
                dataGenerated: false, /* Flag to show the children */
                newPagos: [], /* Items object of the main table with the array cell of the data from the socios -> [year1[month1[stat1,stat2,stat3],month2[stat1],month3[stat1,stat2]]],year2...] */
                tableFields: [
                    { key: 'selected', label: '', },
                    // { key: '_id', label: 'ID', sortable: true, },
                    { key: 'customerNumber', label: 'Nº Socio', sortable: true, class: 'text-center', },
                    { key: 'active', label: 'Activo', sortable: true, class: 'text-center', },
                    { key: 'name', label: 'Socio', sortable: true, },
                    { key: 'rate', label: 'Tarifa', sortable: true, },
                    { key: 'amount', label: 'Importe', sortable: true, },
                    { key: 'paymenttype', label: 'Forma de pago', sortable: true, },
                    // { key: 'fechaPago', label: 'Fecha de pago', sortable: true, },
                    { key: 'iban', label: 'IBAN', sortable: true, },
                    { key: 'interval', label: 'Periodo', sortable: true, },
                    { key: 'status', label: 'Estado', sortable: true, },
                    { key: 'dateconfirmed', label: 'Confirmado', sortable: true, },
                    { key: 'editRow', label: 'editRow', label: '', class: 'tableEditRow'},
                ], /* Array width the fields of the main b-table */
            }
        },
        /**
         * Prevent leaving the page with editings open
         */
        beforeRouteLeave(to, from, next) {
            let answer = true;
            if (this.$refs.payments.confirming || this.$refs.payments.manualDownloadPagos || this.$refs.payments.paymentsItems.some(el => el._showDetails == true)) {
                answer = confirm('No has guardado los cambios, ¿seguro que quieres salir?');
                if (!answer) {
                    next(false);
                }
            }
            if (answer) {
                /* Reset the payment procedures at vuex */
                this.endProcedures('payments');
                /* Pause the validations before leave the page to prevent errors at assign the validation again to the reusable components */
                this.$validator.pause();
                next();
            }
        },
        methods: {
            ...mapActions('navbar', ['endProcedures']),
        },
    }
</script>
<style scoped>
    /* Allow the internal datepicker to overflow the table limits */
    .b-table-sticky-header,
    #card-pagos .card-body {
        overflow-y: visible;
        overflow-x: auto;
    }
    .card-body {
        overflow: visible!important; /* This will show the dropdown out of the card limits and prevents scroll it */
    }
</style>
