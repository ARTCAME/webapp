<template>
    <div class="modal-asset-container">
        <!-- Invoke the wizard
        <transition appear name="fade">
            <wizard
                name="wzd-modal-payments"
                v-show="selectedData != null"
                :steps=wmodalpayments></wizard>
        </transition> -->
        <transition mode="out-in" name="fade">
            <!-- Shown only if a customer wasn't selected -->
            <div
                key="pew-search-engine"
                v-if="!selectedData">
                <b-form-group class="mb-0">
                    <h5 class="subtitle subtitle-sub">Busca al socio y seleccionalo en la tabla</h5>
                </b-form-group>
                <SearchEngine
                    @input="searchResult = $event"></SearchEngine>
                <TableResults
                    :clicableRows="true"
                    :fields="tableFields"
                    :items="searchResult"
                    :pagination="15"
                    @row-clicked="selected(...arguments)">
                    <template
                        #actions="row">
                        <b-button
                            class="ig-small-btn"
                            size="sm"
                            variant="outline-primary"
                            @click="selected(row.row.item)">
                            <span class="text">Usar</span>
                        </b-button>
                    </template>
                    <template
                        #col="fields">
                        <col
                            v-for="field in fields.fields"
                            :key="field.key"
                            :style="{ width:  field.key == 'active' ? '60px' : field.key == 'dni' ? '110px' : field.key == 'customerNumber' ? '75px' : field.key == 'actions' ? '50px' : 'auto' }">
                    </template>
                </TableResults>
            </div>
            <!-- Shown only we a customer was selected -->
            <div
                id="pew-new-payment-form"
                key="pew-selected-data"
                v-else>
                <b-button
                    class="ig-modal-return-btn"
                    size="sm"
                    variant="outline-secondary"
                    @click="selectedData = null">
                    Volver
                </b-button>
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
                searchResult: null, /* Is the result of a customer search */
                selectedData: null, /* Stores the customer selected wich want to add a new payment */
                tableFields: [
                    { key: 'active', label: 'Activo', sortable: true, class: 'text-center' },
                    { key: 'customerNumber', label: 'Nº Socio', sortable: true, class: 'text-center' },
                    { key: 'name', label: 'Socio', sortable: true, class: 'text-nowrap' },
                    { key: 'phones', label: 'Teléfonos', sortable: true, },
                    { key: 'dni', label: 'DNI', sortable: true, class: 'text-center' },
                    { key: 'actions', label: '', sortable: true, },
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
<style scoped>
    #pew-new-payment-form {
        /* overflow-x: hidden; */
        overflow-y: visible;
    }
</style>
