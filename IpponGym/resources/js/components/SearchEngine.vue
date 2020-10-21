<template>
    <div>
        <transition appear name="blur-in">
            <span class="mb-3">
                <b-form-group
                    class="wrapper-for-badge"
                    description="Puedes buscar por el dato que quieras: nombre, dni, teléfono, etc."
                    size="lg">
                    <b-form-input
                        autocomplete="off"
                        autofocus
                        data-v-step="wzd-modal-search-0"
                        id="search"
                        name="search"
                        type="search"
                        v-model="search">
                    </b-form-input>
                </b-form-group>
                <TableResults
                    :fields="tableFields"
                    :items="searchResult"
                    :lite="lite"
                    :pagination="pagination"
                    @selected="$emit('selected', {...arguments}[0]);"
                    @choose="$emit('choose', {...arguments}[0])"></TableResults>
            </span>
        </transition>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex';
    export default {
        data() {
            return {
                search: '', /* The value for the search to make */
            }
        },
        computed: {
            ...mapGetters(['getCustomerByField', 'searchCustomer']),
            /**
             * Provides the result of the search by the fields _id, name, address, dni, emails, phones on the customers state
             *
             * @return {Array} Array of objects with the items for the table results
             */
            searchResult() {
                if (this.search != '') {
                    return this.idDiscard && this.idDiscard.length > 0 ? this.searchCustomer(this.search).filter(customer => !this.idDiscard.includes(customer._id)) : this.searchCustomer(this.search);
                }
            },
        },
        props: [
            'idDiscard', /* Array of Strings with the ids to discard because they are used on other entities at the same form */
            'lite', /* Boolean from the parent to the child. Is no used here. At the table results hide some elements to make the table more clean */
            'pagination', /* Integer to apply to the table pagination */
            'tableFields', /* The table fields to show on the child */
        ],
    }
</script>


