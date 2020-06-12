<template>
    <!-- The below element isn't show to the user but rendered to allow html2canvas to print it as an image -->
    <!-- <div class="printable-wrp">
        <div class="pr-1 printable-ctn" ref="printable"> -->
    <div>
        <Header></Header>
        <br>
        <b-row>
            <b-col cols="4"><small>Número de recibo:</small></b-col>
            <!-- <b-col><small>{{ billNumber }}</small></b-col> -->
            <b-col><small>{{ customer._id.slice(0, 10) + '_' + interval + '_' + customer.customerNumber }}</small></b-col>
        </b-row>
        <b-row>
            <b-col cols="4">Nombre del socio:</b-col>
            <b-col>{{ customer.name }}</b-col>
        </b-row>
        <b-row
            v-if="getUnderage(customer._id)">
            <b-col cols="4">Nombre del tutor:</b-col>
            <b-col>{{ customer.tutor.name }}</b-col>
        </b-row>
        <b-row>
            <b-col cols="4">{{ getUnderage(customer._id) ? 'Dni del tutor:' : 'Dni del socio:' }}</b-col>
            <b-col>{{ getUnderage(customer._id) ? customer.tutor.dni : customer.dni }}</b-col>
        </b-row>
        <b-row>
            <b-col cols="4">Tarifa:</b-col>
            <b-col>{{ customer.paymentData.rate }}</b-col>
        </b-row>
        <b-row>
            <b-col cols="4">Forma de pago:</b-col>
            <b-col>{{ customer.paymentData.paymenttype }}</b-col>
        </b-row>
        <b-row>
            <b-col cols="4">Importe: </b-col>
            <b-col>{{ customer.paymentData.amount }}</b-col>
        </b-row>
        <b-row>
            <b-col cols="4">Periodo de pago: </b-col>
            <b-col>{{ interval }}</b-col>
        </b-row>
        <b-row>
            <b-col cols="4">Fecha de pago: </b-col>
            <b-col>{{ getPaymentData(customer._id, interval).dateconfirmed }}</b-col>
        </b-row>
        <Footer
            :name="getUnderage(customer._id) && customer.tutor ? customer.tutor.name : customer.name"
            :sign="customer.sign"></Footer>
        <!-- <b-row>
            <b-col class="sign-ctn">
                <img
                    class="sign-img-doc"
                    type="image/png"
                    :src="customer.sign">
                <small class="d-block">Recibido: {{ customer.name }}</small>
                <small>En Zaragoza a {{ this.$moment().format('dddd, D MMMM YYYY')}}</small>
            </b-col>
        </b-row> -->
    </div>
        <!-- </div>
    </div> -->
</template>
<script>
    import Footer from './printsassets/Footer'
    import Header from './printsassets/Header'
    import { mapGetters } from 'vuex';
    export default {
        components: {
            'Footer': Footer,
            'Header': Header,
        },
        computed: {
            ...mapGetters(['getPaymentData', 'getUnderage']),
        },
        props: [
            // 'billNumber', /* String with the bill number */
            'customer', /* Object with the customer data */
            'interval', /* String with the selected interval */
        ]
    }
</script>
