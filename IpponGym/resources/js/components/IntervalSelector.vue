<template>
    <b-form-row align-h="between" class="px-1">
        <!-- Year selector -->
        <b-form-group
            class="my-0 py-0"
            label="Año">
            <b-row no-gutters>
                <b-form-radio-group
                    buttons
                    button-variant="outline-primary"
                    class="mr-2"
                    size="sm"
                    v-model="selectedYear">
                    <b-form-radio
                        class="btn-year"
                        v-for="btnYear in btnYears"
                        :key="btnYear"
                        :value="btnYear"
                        @change="selectedAlterYear = null; selectedState = null">
                        {{ btnYear }}
                    </b-form-radio>
                </b-form-radio-group>
                <b-form-group class="mb-0">
                    <b-form-input
                        id="alteryear"
                        name="alteryear"
                        placeholder="Indicar otro año"
                        size="sm"
                        v-model="selectedAlterYear"
                        v-validate="'year'"
                        :class="{ 'is-invalid' : errors.has('alteryear') }"
                        @input="selectedYear = null"
                        @keypress="$isNumber($event)"></b-form-input>
                    <transition mode="out-in" name="liveFeedbacks">
                        <b-form-invalid-feedback
                            v-for="error in errors.collect('alteryear')"
                            :key="error">
                            {{ error }}
                        </b-form-invalid-feedback>
                    </transition>
                </b-form-group>
            </b-row>
        </b-form-group>
        <!-- Month selector -->
        <b-form-group
            class="my-0 px-2 py-0"
            label="Mes">
            <b-dropdown
                id="month-dropdown"
                class="ig-dropdown"
                size="sm"
                variant="primary"
                :text="selectedMonth != null ? btnMonths[selectedMonth].text : 'Selecciona un mes'">
                <!-- The month will be disabled when is already used at a confirmed payment -->
                <b-dropdown-item
                    variant="primary"
                    v-b-tooltip.hover.right.noninteractive
                    v-for="btn in btnMonths"
                    :title="confirmed == true && getConfirmed(btn.value) ? 'Ya existe un pago confirmado para este mes y año' : ''"
                    :class="'ig-dropdown-item' + (((confirmed == true && getConfirmed(btn.value)) || (confirmed == false && !getConfirmed(btn.value))) ? ' ig-select-disabled' : '')"
                    :disabled="((confirmed == true && getConfirmed(btn.value)) || (confirmed == false && !getConfirmed(btn.value)))"
                    :key="btn.value"
                    :value="btn.value"
                    @click="selectedMonth = btn.value; selectedState = null">
                    <b-row align-h="between">
                        {{ btn.text }}
                        <!-- Shown when the payment is confirmed -->
                        <fa-icon
                            class="text-success"
                            icon="check-double"
                            v-if="confirmed == true && getConfirmed(btn.value)"></fa-icon>
                    </b-row>
                </b-dropdown-item>
            </b-dropdown>
        </b-form-group>
    </b-form-row>
</template>
<script>
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
                selectedAlterYear: null, /* v-model for the editable input year */
                selectedMonth: null, /* v-model of the payment month */
                selectedState: null, /* v-model of the payment status to apply on the bank payments */
                selectedYear: null, /* v-model of the new payment year */
            }
        },
        computed: {
            /**
             * Sets the interval to the format YYYY-MM
             *
             * @return {String} String with the interval formatted to YYYY-MM
             */
            interval() {
                if (this.selectedMonth != null) {
                    return  this.year + '-' + ((this.selectedMonth + 1) < 10 ? '0' + (this.selectedMonth + 1) : this.selectedMonth + 1);
                }
            },
            /**
             * Determine the year to use as selected year to the new payment checking the radio button and the input fields to extract the selected
             *
             * @return {Integer} Integer with the year selected or introduced (the input value is validated with vee)
             */
            year() {
                if (this.selectedAlterYear != null) {
                    if (this.selectedAlterYear == this.$moment().year() || this.selectedAlterYear == this.$moment().year() + 1 || this.selectedAlterYear == this.$moment().year() - 1) {
                        this.selectedYear = this.selectedAlterYear;
                    } else  {
                        this.selectedYear = null;
                    }
                    return this.selectedAlterYear;
                } else if (this.selectedYear != null) {
                    this.selectedAlterYear = null;
                    return this.selectedYear;
                }
                return null;
            }
        },
        methods: {
            /**
             * Disables the options unselectable of the select months options. This functions can be called with '!' to obtain the inverse selectable: disable the confirmed payments will be useful when we need to confirm a new payment (to don't select an existing interval) and enable the confirmed will be useful to print a bill of a interval with payment confirmed
             *
             * @param {Integer} btnMonth: is the value of the select option
             *
             * @return {Boolean} Boolean that indicates if the option of the select element needs to be disabled
             */
            getConfirmed(btnMonth) {
                /* Reveal if the customer has a payment confirmed with the month-year selected */
                const result = this.customer.payments.filter(payment => this.$moment(payment.interval, 'YYYY-MM').year() == this.year && this.$moment(payment.interval, 'YYYY-MM').month() == btnMonth && (payment.status == 'Confirmado' || payment.status == 'Devuelto')).length > 0;
                /* Unselect the month if it is selected previously */
                if ((result && this.confirmed == true && this.selectedMonth == btnMonth) || (!result && this.confirmed == false && this.selectedMonth == btnMonth)) {
                    this.selectedMonth = null;
                }
                return result;
            },
            /**
             * Resets the selected year and month, is called from the parent
             */
            resetInterval() {
                this.selectedAlterYear = null;
                this.selectedMonth = null;
                this.selectedYear = null;
            },
        },
        mounted() {
            /* Emit the null interval on mounted */
            this.$emit('input', this.interval)
        },
        props: [
            'customer', /* The customer to treat */
            'confirmed', /* The status of the payments to evaluate */
        ],
        watch: {
            interval(newVal, oldVal) {
                if (newVal != oldVal) {
                    this.$emit('input', this.interval)
                }
            }
        }
    }
</script>
<style>
    #month-dropdown.dropdown-item.active, .dropdown-item:active {
        background-color: rgba(218, 218, 218, 1)!important;
    }
</style>
<style scoped>
    #month-dropdown {
        width: 170px;
    }
    #alteryear {
        display: inline-flex;
        height: 32.5px;
        width: 120px;
    }
</style>
