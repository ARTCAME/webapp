<template>
    <transition appear name="fade-height">
        <div class="wrapper-dismissible">
            <div class="form-agrupation">
                <b-btn-close
                    class="wrapper-dismissible-close"
                    tabindex="-1"
                    v-if="!isDisabled"
                    @click="delFormElement({ _id: form._id, entity: target, entityIndex: contactIndex, field: 'phones', fieldIndex: phoneIndex, })"></b-btn-close>
                <b-form-row>
                    <b-form-group class="col-6 col-md-3" label="Teléfono">
                        <b-form-input
                            autocomplete="off"
                            type="tel"
                            v-model="phone"
                            v-validate="{ required: true, regex: /^[6-9]{1}\d{8}/, length: 9 }"
                            :class="{ 'is-invalid' : errors.has(validateName) }"
                            :disabled="isDisabled"
                            :name="validateName"
                            @drop.prevent
                            @keypress="$isNumber($event)"
                            @paste="phone = $isNumber($event)"></b-form-input>
                        <transition mode="out-in" name="liveFeedbacks">
                            <b-form-invalid-feedback
                                v-if="errors.has(validateName)">
                                {{ errors.first(validateName) }}
                            </b-form-invalid-feedback>
                        </transition>
                    </b-form-group>
                    <b-form-group class="col-6 col-md-9" label="Notas">
                        <b-form-input
                            autocomplete="off"
                            placeholder="Si es del trabajo, de casa, horario o persona de contacto, etc"
                            type="text"
                            v-model="notes"
                            :disabled="isDisabled"></b-form-input>
                    </b-form-group>
                </b-form-row>
            </div>
        </div>
    </transition>
</template>
<script>
import { mapActions, mapState } from 'vuex';
export default {
    computed: {
        ...mapState({
            newCustomerForm: state => state.form,
            editCustomerForm: state => state.editform,
        }),
        /**
         * Defines the current form state (edit or new customer)
         *
         * @return {Object} The object with the form data from the customers state
         */
        form() {
            return this.$route.name == 'customers.new' ? this.newCustomerForm : this.editCustomerForm;
        },
        /**
         * v-model for the phone notes
         */
        notes: {
            get() {
                return this.inPhone.notes ? this.inPhone.notes : '';
            },
            set(val) {
                this.$emit('input', { phone: this.phone, notes: val });
            }
        },
        /**
         * v-model for the phone
         */
        phone: {
            get() {
                return this.inPhone.phone ? this.inPhone.phone : ''
            },
            set(val) {
                this.$emit('input', { phone: val, notes: this.notes });
            }
        },
        /**
         * Returns a name builded based on the target to use it at the validation process
         *
         * @return {String} The name to use at the validator
         */
        validateName() {
            return this.target + (this.target == 'contacts' ? '-' + this.contactIndex : '') + '-phone-' + this.phoneIndex;
        },
    },
    inject: [
        '$validator', /* Inject the main $validator from the parent */
    ],
    methods: {
        ...mapActions(['delFormElement']),
    },
    props: [
        'contactIndex', /* When the parent is a contact will receive this index */
        'isDisabled', /* Boolean that indicates if the form is being edited */
        'inPhone', /* The phone data to render */
        'phoneIndex', /* The phone index on the array of phones of the parent */
        'target', /* The parent (customer, tutor or contact) */
    ],
}
</script>
