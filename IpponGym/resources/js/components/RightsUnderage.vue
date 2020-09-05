<template>
    <!-- The below element isn't show to the user but rendered to allow html2canvas to print it as an image -->
    <!-- <div class="printable-wrp">
        <div class="pr-1 printable-ctn" ref="printable"> -->
            <div
                v-if="customer != null">
                <Header></Header>
                <br>
                <br>
                <p class="mb-0 pr-1">{{ customer.rightsUnderage.RUaccept == false ? '__NO__' : '' }} AUTORIZACIÓN DE D / Dª <u>{{ customer.tutor ? customer.tutor.name : 'NO INDICADO' }}</u> con DNI <u>{{ customer.tutor ? customer.tutor.dni : 'NO INDICADO' }}</u>, domicilio en <u>{{ customer.tutor ? customer.tutor.address : 'NO INDICADO' }}</u> y número de teléfono {{ customer.tutor && customer.tutor.phones[0] ? customer.tutor.phones[0] : 'NO INDICADO' }}, como padre/madre/tutor del menor <u>{{ customer.name }}</u> <br><br>&ensp;a Don Sergio Pérez Silva con NIF 77.135.997T y domicilio en Zaragoza, C/Leopoldo Romeo 9, local, para recabar y tratar los datos personales del menor, consistentes en datos de identificación, características personales (fecha y lugar de nacimiento, edad, sexo, nacionalidad) y bancarios para la finalidad de disponer de base de datos con el que poder prestar un servicio adecuado y poder realizar la facturación del mismo.<br><br>&ensp;La aportación de dichos datos es obligatoria para poder cumplir con la anterior finalidad. El destinatario de los datos será únicamente el responsable del fichero indicado en el párrafo anterior, que no cederá los mismos a entidad alguna. La base jurídica de este tratamiento es en todo caso su consentimiento y, en aquellos supuestos contemplados por la normativa vigente en materia de educación, la función docente llevada a cabo por el centro. Usted podrá retirar este consentimiento en cualquier momento, sin que ello afecte al legítimo tratamiento realizado hasta la fecha. También puede ejercitar los derechos de acceso, rectificación, cancelación, limitación, oposición y portabilidad ante el responsable, en la dirección anteriormente indicada. Asimismo podrá presentar reclamación por el tratamiento realizado ante la Agencia Española de Protección de Datos. Estos datos serán conservados exclusivamente hasta cumplir con la finalidad prevista, salvo que legalmente se prevea un plazo mayor de conservación.<br><br>&ensp;Asimismo, usted consiente en que el responsable trate sus propios datos personales contenidos en el presente documento, con la única finalidad de gestionar las autorizaciones informadas con respecto a los menores. Todo ello con el mismo contenido y derechos contemplados en el párrafo anterior.
                </p>
                <Footer
                    :docDate="customer.rightsUnderage.date"
                    :name="getUnderage(customer._id) && customer.tutor ? customer.tutor.name : customer.name"
                    :sign="customer.sign"></Footer>
            </div>
        <!-- </div> -->
    <!-- </div> -->
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
            'customer', /* Object with the customer data */
        ]
    }
</script>
