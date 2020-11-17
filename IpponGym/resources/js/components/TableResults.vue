<template>
    <b-table
        borderless
        class="mb-0"
        empty-text="Ningún socio coincide con estos criterios"
        fixed
        ref="searchTable"
        responsive
        select-mode="single"
        show-empty
        small
        :current-page="searchTablePagination"
        :fields="fields"
        :items="items"
        :per-page="pagination"
        :tbody-tr-class="clicableRows ? 'clicableRow' : ''"
        @row-clicked="clicableRows ? $emit('row-clicked', $event) : ''">
        <template
            #cell(type)="row">
            {{ row.value == 'periodic' ? 'Periódico' : 'Manual'}}
        </template>
        <template
            #cell(active)="row">
            <b-form-checkbox
                disabled
                switch
                v-model="row.value"></b-form-checkbox>
        </template>
        <template
            #cell(name)="row">
            <div
                class="pl-1 table-text-overflowed text-nowrap"
                v-overflown="row.value">
                {{ row.value }}
            </div>
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
            #cell(dni)="row">
            {{ row.value != '' && row.value != null ? row.value : row.item.tutor ? row.item.tutor.dni + '(tutor)' : 'No disponible' }}
        </template>
        <template
            #cell(actions)="row">
            <slot
                name="actions"
                :row="row">
                <b-button
                    class="ig-small-btn"
                    size="sm"
                    variant="outline-primary"
                    @click="$emit('choose', row.item)">
                    <span class="text">Usar</span>
                </b-button>
            </slot>
        </template>
        <template
            #table-caption
            v-if="!lite && (($refs.searchTable && $refs.searchTable.filteredItems.length > pagination) || (items && items.length > pagination))">
            <b-row align-h="end" no-gutters>
                <b-pagination
                    aria-controls="searchTable"
                    class="float-right mb-0"
                    size="sm"
                    v-model="searchTablePagination"
                    :per-page="pagination"
                    :total-rows="$refs.searchTable ? $refs.searchTable.filteredItems.length : items ? items.length : 0"></b-pagination>
            </b-row>
        </template>
        <template
            #table-colgroup="scope">
            <slot name="col" v-bind:fields="scope.fields"></slot>
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
    created() {
        /* Force the update of the component to recalculate the directive that adds the title to the name on every row */
        window.addEventListener('resize', () => { this.$forceUpdate() });
    },
    destroyed() {
        window.removeEventListener('resize', () => { this.$forceUpdate() });
    },
    props: {
        clicableRows: Boolean, /* Boolean to enable the click to enter on every table row */
        customer: Object, /* Boolean to determine if the parent (or grand-parent) is a customer and hide some elements */
        fields: Array, /* The table fields */
        items: Array, /* The table items, passeds from the parent */
        lite: Boolean, /* Flag to hide some elements depending of the parent requirements */
        pagination: {
            type: Number,
            default: 5,
        }, /* Integer to apply on pagination, if its 0 the pagination is not enabled */
    }
}
</script>
<style>
    .clicableRow {
        cursor: pointer;
    }
    .ig-small-btn {
        line-height: 22px;
    }
    .ig-modal-table-btn-svg {
        line-height: 18px;
    }
    /* Sets like a button behaviour */
    .ig-small-btn:hover .text,
    .ig-modal-table-btn:hover svg {
        color: rgb(248, 249, 250)!important;
        transition: .35s;
    }
</style>
