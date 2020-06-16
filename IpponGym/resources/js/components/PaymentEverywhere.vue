<template>
    <div>
        <!-- Invoke the wizard -->
        <transition appear name="fade">
            <wizard
                name="wzd-modal-payments"
                v-show="selectedData != null"
                :steps=wmodalpayments></wizard>
        </transition>
        <transition mode="out-in" name="fade">
            <!-- Shown only if a customer wasn't selected -->
            <div
                key="pew-search-engine"
                v-if="!selectedData">
                <b-form-group class="mb-0">
                    <h5 class="subtitle subtitle-sub">Busca al socio y seleccionalo en la tabla</h5>
                </b-form-group>
                <SearchEngine
                    :pagination="15"
                    :tableFields="tableFields"
                    @choose="selected(...arguments)"></SearchEngine>
            </div>
            <!-- Shown only we a customer was selected -->
            <div
                key="pew-selected-data"
                v-else>
                <b-button
                    class="ig-modal-return-btn"
                    size="sm"
                    variant="outline-secondary"
                    @click="selectedData = null">
                    Volver
                </b-button>
                <b-form-group class="mb-0">
                    <h5 class="subtitle subtitle-sub" md="4">Selecciona un periodo de pago</h5>
                </b-form-group>
                <NewPayment
                    :_id="selectedData._id"></NewPayment>
            </div>
        </transition>
    </div>
</template>
<script>
    import * as WzdSteps from './wzdsteps/modalpayments';
    export default {
        data() {
            return {
                selectedData: null, /* Stores the customer selected wich want to add a new payment */
                tableFields: [
                    { key: 'active', label: 'Activo', sortable: true, class: 'text-center' },
                    { key: 'customerNumber', label: 'Nº Socio', sortable: true, class: 'text-center' },
                    { key: 'name', label: 'Socio', sortable: true, },
                    { key: 'dni', label: 'DNI', sortable: true, class: 'text-center' },
                    { key: 'use', label: '', sortable: true, },
                ], /* Table fields */
                wmodalpayments: null, /* Stores the imported wizard steps */
            }
        },
        created() {
            /* Initialize the wizard steps content */
            this.wmodalpayments = WzdSteps.wmodalpayments;
        },
        methods: {
            /**
             * Assing data to a local variable to pass it between components
             *
             * @param {Object} data: is the customer with the table row format
             */
            selected(data) {
                this.selectedData = data;
            }
        }
    }
</script>
