<template>
    <transition appear name="fade-height">
        <div class="wrapper-dismissible">
            <div class="form-agrupation">
                <!-- Shown when the form is being edited -->
                <b-btn-close
                    class="wrapper-dismissible-close"
                    tabindex="-1"
                    v-if="!isDisabled"
                    @click="delFormElement({ _id: form._id, entity: target, entityIndex: contactIndex, field: 'emails', fieldIndex: emailIndex, })"></b-btn-close>
                <b-form-group label="Correo electrónico">
                    <b-form-input
                        autocomplete="off"
                        type="email"
                        v-model="email"
                        v-validate="{ required: true, email }"
                        :class="{ 'is-invalid' : errors.has(validateName) }"
                        :disabled="isDisabled"
                        :name="validateName"></b-form-input>
                    <transition mode="out-in" name="liveFeedbacks">
                        <b-form-invalid-feedback
                            v-if="errors.has(validateName)">
                            {{ errors.first(validateName) }}
                        </b-form-invalid-feedback>
                    </transition>
                </b-form-group>
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
         * v-model for the email
         */
        email: {
            get() {
                return this.inEmail ? this.inEmail : '';
            },
            set(val) {
                this.$emit('input', val);
            }
        },
        /**
         * Returns a name builded based on the target to use it at the validation process
         *
         * @return {String} The name to use at the validator
         */
        validateName() {
            return this.target + (this.target == 'contacts' ? '-' + this.contactIndex : '') + '-email-' + this.emailIndex;
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
        'inEmail', /* The email data to render */
        'emailIndex', /* The email index on the array of emails of the parent */
        'target', /* The parent (customer, tutor or contact) */
    ],
}
</script>
