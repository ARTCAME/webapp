<template>
    <b-modal
        centered
        hide-footer
        id="payment-edit-modal"
        scrollable
        size="xl"
        @hidden="$manageScrollBar(false)"
        @show="$manageScrollBar(false)">
        <template #modal-header>
            <h5>Edición de pago</h5>
        </template>
        <template #default>
            <PaymentEditForm
                :toEditItem="editingItem"
                @cancel="$bvModal.hide('payment-edit-modal')"
                @delete="$bvModal.hide('payment-edit-modal')"
                @save="save(...arguments)">
            </PaymentEditForm>
        </template>
    </b-modal>
</template>

<script>
    import { mapActions } from 'vuex';
    import NProgress from 'nprogress';
    export default {
        methods: {
            ...mapActions(['updatePaymentData']),
            /**
             * Function to save the changes at the db and propagate it to vuex
             */
            save(item, print) {
                /* Update the payment on the db via vuex */
                this.updatePaymentData({ items: new Array(item), action: 'updating' })
                    .then(() => {
                        /* Process the success feedback */
                        this.$bvModal.msgBoxOk('Pago actualizado correctamente' + (print ? '. El recibo se descargará automáticamente' : '') , {
                            buttonSize: 'sm',
                            centered: true,
                            okTitle: 'Aceptar',
                            size: 'sm',
                        })
                        .then(() => {
                            this.$bvModal.hide('payment-edit-modal');
                            NProgress.done();
                        })
                        /* Trigger a modification on the localStorage to propagate the changes on other windows. Unlike the add payment process, during the update is not propagated on vuex to avoid massive repetitions on mass updates */
                        localStorage.setItem('customer_updated', item._id);
                        localStorage.removeItem('customer_updated');
                        /* If its requested, print the bill, the inInterval acts like a flag to allow the print */
        /* REVISAR EL inINTERVAL que hace de flag, a ver qué poner */
                        // if (print) {
                        //     await self.printBill();
                        // }
                    })
                    .catch((error) => {
                        this.$bvModal.msgBoxOk('No se ha podido completar la operación. Código de error: FEPaEd@Sa', {
                            buttonSize: 'sm',
                            centered: true,
                            okTitle: 'Aceptar',
                            okVariant: 'danger',
                            size: 'sm',
                            title: 'ERROR',
                        });
                        NProgress.done();
                        console.error(error.response ? error.response.data : error);
                    });
            },
        },
        props: [
            'editingItem',
        ],
    }
</script>
<style>
    #payment-edit-modal .modal-dialog {
        min-width: 600px!important
    }
</style>
