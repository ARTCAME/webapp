<template>
        <div>
            <b-row
                class="mb-4"
                no-gutters>
                <b-button
                    class="ml-auto"
                    size="sm"
                    variant="ig-gradient2-reverse"
                    :id="'sat-' + field + (contactIndex ? '-' + contactIndex : '')">
                    <fa-icon class="mr-2" icon="search-plus"></fa-icon>
                    Buscar socio
                </b-button>
            </b-row>
            <b-popover
                custom-class="p-0"
                placement="left"
                :id="'sat-popover-search' + (contactIndex ? '-' + contactIndex : '')"
                :show.sync="searchActive"
                :target="'sat-' + field + (contactIndex ? '-' + contactIndex : '')"
                :title="'Buscar ' + field">
                <b-button-close
                    @click="searchActive = false"></b-button-close>
                <SearchEngine
                    :idDiscard="idDiscard"
                    :tableFields="tableFields"
                    @choose="chooseAction(...arguments)"></SearchEngine>
            </b-popover>
        </div>
</template>
<script>
import { mapActions, mapState } from "vuex";
export default {
    data() {
        return {
            searchActive: false, /* Flag to hide the popover */
            tableFields: [
                { key: 'active', label: '', },
                { key: 'name', label: '', },
                { key: 'use', label: '', },
                { key: 'see', label: '', },
            ], /* Table fields to the search engine results table */
        }
    },
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
    },
    inject: [
        '$validator', /* Inject the main $validator from the parent */
    ],
    methods: {
        ...mapActions(['setContact', 'setTutor']),
        /**
         * Checks the parent and assign to it the data of the customer selected
         *
         * @param {Object} customer: the customer data from the customers state received via the searchEngine to assign to the entity
         */
        chooseAction(customer) {
            /* Pause the current validator instance to avoid errors on dynamic components */
            this.$validator.pause();
            if (this.field == 'contacto') {
                this.setContact({ _id: this.form._id, index: this.contactIndex, customer: customer });
            } else if (this.field == 'tutor') {
                this.setTutor({ _id: this.form._id, customer: customer });
            }
            /* Hide the search popover */
            this.$root.$emit('bv::hide::popover', 'sat-popover-search' + (this.contactIndex ? '-' + this.contactIndex : ''));
            /* After fetch the data, reactive the current validator */
            this.$nextTick(() => {
                this.$validator.resume();
            });
        },
    },
    props: [
        'contactIndex', /* The index of the contact, is provided when the parent is a contact */
        'field', /* The field to use on the search to search on it */
    ],
}
</script>
<style scoped>
    button.close {
        position: absolute;
        right: 1rem;
        top: .2rem;
    }
    [id^=sat-popover-search] {
        min-width: 400px;
    }
</style>
