<template>
    <b-table
        borderless
        class="mb-0"
        empty-text="Ningún socio coincide con estos criterios"
        ref="searchTable"
        responsive
        select-mode="single"
        show-empty
        small
        :current-page="searchTablePagination"
        :fields="fields"
        :items="items"
        :per-page="pagination ? pagination : 5">
        <template
            #cell(active)="row">
            <b-form-checkbox
                disabled
                switch
                v-model="row.value"></b-form-checkbox>
        </template>
        <template
            #cell(phones)="row">
            <span
                v-for="(phone, index) in row.item.phones"
                :key="row.item._id + phone.phone">
                {{ phone.phone != null ? phone.phone + (row.item.phones.length > (index + 1) ? ' - ' : '') : '' }}
            </span>
        </template>
        <template
            #table-caption
            v-if="!lite && (($refs.searchTable && $refs.searchTable.filteredItems.length > 5) || (items && items.length > 5))">
            <b-row align-h="end" no-gutters>
                <b-pagination
                    aria-controls="searchTable"
                    class="float-right mb-0"
                    size="sm"
                    v-model="searchTablePagination"
                    :per-page="pagination ? pagination : 5"
                    :total-rows="$refs.searchTable ? $refs.searchTable.filteredItems.length : items ? items.length : 0"></b-pagination>
            </b-row>
        </template>
        <template
            #cell(use)="row"
            v-if="!customer">
            <b-button
                class="ig-modal-table-btn"
                size="sm"
                variant="outline-primary"
                @click="$emit('choose', row.item)">
                Usar
            </b-button>
        </template>
        <template
            #cell(see)="row">
            <b-link
                class="btn btn-outline-secondary btn-sm ig-modal-table-btn ig-modal-table-btn-svg unformated-link"
                target="_blank"
                title="Abre la ficha del socio"
                v-b-tooltip.top.hover.noninteractive
                :to="{ name: 'customers.profile', params: { id: row.item._id } }">
                <fa-icon icon="eye"></fa-icon>
            </b-link>
        </template>
        <template
            #cell(enter)="row">
            <b-link
                class="btn btn-outline-success btn-sm ig-modal-table-btn ig-modal-table-btn-svg unformated-link"
                positioning="top"
                title="Accede a la ficha del socio"
                v-b-tooltip.hover.noninteractive
                :to="{ name: 'customers.profile', params: { id: row.item._id } }"
                @click="$bvModal.hide('search-nav-modal')">
                <!-- @click="$emit('selected', row.item)"> -->
                <fa-icon class="text-success" icon="eye"></fa-icon>
            </b-link>
        </template>
        <!-- In a specific search page we can include some of these other columns to the table
        <template
            #cell(emails)="row">
            <span
                v-for="email in row.value"
                :key="email">
                {{ email }}<br>
            </span>
        </template> -->
        <!-- <template
            #cell(name)="row">
            <b-link
                positioning="top"
                target="_blank"
                title="Abre la ficha del socio"
                v-b-tooltip.hover.noninteractive
                v-html="row.value"
                :to="{ name: 'socios.editar', params: { id: row.item._id } }"></b-link>
        </template> -->
        <!-- <template
            #cell(phones)="row">
            <span
                v-for="phoneGroup in row.value"
                :key="phoneGroup.phone">
                {{ phoneGroup.phone }}<br>
            </span>
        </template> -->
        <template
            #table-colgroup="scope">
            {{ scope }}
            <col
                v-for="field in scope.fields"
                :key="field.key"
                :style="{ width: field.key == 'active' || field.key == 'enter' || field.key == 'see' || field.key == 'use' ? '30px' : field.key == 'dni' ? '110px' : field.key == 'customerNumber' ? '75px' : 'auto' }">
        </template>
    </b-table>
</template>
<script>
export default {
    data() {
        return {
            searchTablePagination: 1, /* Marks the current page, always starts at the first */
        }
    },
    props: [
        'customer', /* Boolean to determine if the parent (or grand-parent) is a customer and hide some elements */
        'fields', /* The table fields. Depends of the parent */
        'items', /* The table items, passeds from the parent */
        'lite', /* Flag to hide some elements depending of the parent needs */
        'pagination', /* Integer to apply on pagination */
    ],
}
</script>
<style scoped>
    .ig-modal-table-btn-svg {
        line-height: 18px;
    }
    /* Sets like a button behaviour */
    .ig-modal-table-btn:hover svg {
        color: rgb(248, 249, 250)!important;
        transition: .35s;
    }
</style>
