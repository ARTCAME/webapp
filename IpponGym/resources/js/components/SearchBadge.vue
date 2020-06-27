<template>
    <transition appear name="slide-fade">
        <!-- Shown when the search gives some result -->
        <div
            class="label-badge"
            v-if="searchResult.length > 0">
            <b-badge
                pill
                variant="info"
                :id="id">
                <AnimatedNum
                    :numFounded="searchResult.length">
                </AnimatedNum>
            </b-badge>
            <b-popover
                custom-class="p-0"
                placement="topleft"
                triggers="hover"
                :id="'ig-sb-popover-' + id"
                :target="id"
                :title="'Coinciden con el ' + field + ' introducido'">
                <TableResults
                    :customer="customer"
                    :fields="tableFields"
                    :items="searchResult"
                    :lite="true"
                    @choose="chooseAction(...arguments)"></TableResults>
                <b-form-text class="text-center">
                    Solo se muestran los cinco primeros resultados
                </b-form-text>
            </b-popover>
        </div>
    </transition>
</template>
<script>
import { mapActions, mapGetters, mapState } from "vuex";
export default {
    data() {
        return {
            tableFields: [
                { key: 'active', label: '', },
                { key: 'name', label: '', },
                { key: 'use', label: '', },
                { key: 'see', label: '', },
            ], /* Table fields for the TableResults child */
        }
    },
    computed: {
        ...mapGetters(['getCustomerByField']),
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
         * Get an array of ids that no need to be searched because are used as the form customer, contact or tutor
         *
         * @return {Array} Array of strings with the ids used on the form
         */
        idDiscard() {
            let ids = [];
            /* If the form is fetched with an existing customer store his _id */
            if (this.form._id) {
                ids.push(this.form._id);
            }
            /* If exists some tutor on the form and is a customer too store his _id */
            if (this.form.tutor && this.form.tutor._id) {
                ids.push(this.form.tutor._id);
            }
            /* If exists any contact and any of their is customer too store his _id */
            if (this.form.contacts.length > 0) {
                this.form.contacts.forEach(contact => {
                    if (contact._id) {
                        ids.push(contact._id);
                    }
                });
            }
            return ids;
        },
        /**
         * Search at the store by the value on the name field and filter the result discarting the used customers on other entities. Used at the search badge
         *
         * @return {Array} Array of objects with the list of valid customers to use
         */
        searchResult() {
            if (this.idDiscard.length > 0) {
                return this.getCustomerByField(this.searchField, this.searchValue).filter(customer => !this.idDiscard.includes(customer._id));
            }
            return this.getCustomerByField(this.searchField, this.searchValue);
        }
    },
    methods: {
        ...mapActions(['setContact', 'setTutor']),
        /**
         * Checks the parent and assign to it the data of the customer selected
         *
         * @param {Object} customer: the customer data from the customers state received via the searchEngine to assign to the entity
         */
        chooseAction(customer) {
            /* Emit to the parent to pause the current validator instance to avoid errors on dynamic components */
            this.$emit('choosing');
            if (this.tutor) {
                /* Call to the vuex action to set the chosen tutor */
                this.setTutor({ _id: this.form._id, customer: customer })
                    .then(() => {
                        /* Emit to the parent to resume the validation */
                        this.$emit('chosen');
                    });
            } else if (this.contact) {
                /* Call to the vuex action to set the chosen contact */
                this.setContact({ _id: this.form._id, customer: customer, index: this.contactIndex })
                    .then(() => {
                        /* Emit to the parent to resume the validation */
                        this.$emit('chosen');
                    });
            }
        }
    },
    props: [
        'contact', /* Boolean to determine if the parent is a contact */
        'contactIndex', /* The index of the contact parent */
        'customer', /* Boolean to determine if the parent is a customer */
        'field', /* String with the name of the field in spanish to use on view messages */
        'id', /* The dynamic id created at the parent, necessary to styles on the popovers */
        'searchField', /* The field to use for search */
        'searchValue', /* The value to use on the search */
        'tutor', /* Boolean to determine if the parent is a contact */
    ],
}
</script>
<style scoped>
    .label-badge {
        position: absolute;
        right: 1rem;
        top: 0;
    }
    .badge {
        cursor: pointer;
    }
    [id^=ig-sb-popover] {
        min-width: 400px;
    }
</style>



