<template>
        <div>
            <b-form-group class="mb-0">
                <h5 class="subtitle subtitle-sub">Busca al socio</h5>
            </b-form-group>
            <SearchEngine
                :pagination="15"
                :tableFields="tableFields"
                @selected="selected(...arguments)"></SearchEngine>
        </div>
</template>
<script>
export default {
    data() {
        return {
            tableFields: [
                { key: 'active', label: 'Activo', sortable: true, class: 'text-center' },
                { key: 'customerNumber', label: 'Nº Socio', sortable: true, class: 'text-center' },
                { key: 'name', label: 'Socio', sortable: true, },
                { key: 'phones', label: 'Teléfonos', sortable: true, },
                { key: 'dni', label: 'DNI', sortable: true, class: 'text-center' },
                { key: 'enter', label: '', },
            ], /* Table fields to the search engine results table */
        }
    },
    methods: {
        /**
         * Manage the selection of a customer on the search results, to prevent lose data from the current page
         *
         * @param {Object} customer: the customer requested to view
         */
        selected(customer) {
            if (customer) {
                /* Go to the customer's page if we are not on it */
                if (this.$route.path == ('/socio/' + customer._id) || this.$route.path == ('/socio/' + customer._id + '/editar')) {
                    this.$showToast('warning', 'Ya estás en el socio que quieres consultar', 'Aviso', 5000);
                } else if (this.$route.name == 'customers.edit') {
                    let result = confirm('No has guardado los cambios, ¿seguro que quieres salir?');
                    if (result) {
                        return this.$router.push({ path: '/socio/' + customer._id });
                    }
                } else {
                    this.$router.push({ path: '/socio/' + customer._id });
                    /* Hide the search modal */
                    this.$bvModal.hide('search-nav-modal');
                }
            }
        }
    }
}
</script>
