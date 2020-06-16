<template>
    <div>
        <!-- Invoke the wizard -->
        <transition appear name="fade">
            <wizard
                name="wzd-modal-documents"
                v-show="customer != null"
                :steps=wmodaldocuments></wizard>
        </transition>
        <transition mode="out-in" name="fade">
            <!-- Shown if no customer is selected -->
            <div
                key="pf-search-engine"
                v-if="!customer">
                <b-form-group class="mb-0">
                    <h5 class="subtitle subtitle-sub" md="4">Busca al socio y seleccionalo en la tabla</h5>
                </b-form-group>
                <SearchEngine
                    :pagination="15"
                    :tableFields="tableFields"
                    @choose="selected(...arguments)"></SearchEngine>
            </div>
            <!-- Shown when a customer has been selected -->
            <div
                data-v-step="wzd-modal-documents-0"
                key="pf-selected-data"
                v-else>
                <b-button
                    class="ig-modal-return-btn"
                    size="sm"
                    variant="outline-secondary"
                    @click="customer = null">
                    Volver
                </b-button>
                <b-form-group class="mb-0">
                    <h5 class="subtitle subtitle-sub" md="4">Selecciona el tipo de documento</h5>
                </b-form-group>
                <b-form-select
                    autofocus
                    v-model="fileType"
                    :options="fileOptions">
                </b-form-select>
                <!-- <transition name="slide-fade"> -->
                <transition appear mode="out-in" name="slide-fade">
                    <div
                        key="pf-bill-print"
                        v-if="fileType == 0">
                        <b-form-group class="mb-0">
                            <h5 class="subtitle subtitle-sub" md="4">Selecciona el periodo de cobro del recibo</h5>
                        </b-form-group>
                        <b-alert class="py-2" show variant="info">
                            Podrás seleccionar la combinación mes/año cuando en ella exista un pago confirmado
                        </b-alert>
                        <b-form-group>
                            <IntervalSelector
                                v-model="interval"
                                :confirmed="false"
                                :customer="customer"></IntervalSelector>
                        </b-form-group>
                        <transition appear mode="out-in" name="slide-fade">
                            <div
                                key="pf-bill-data"
                                v-if="interval != null">
                                <b-form-group class="mb-0">
                                    <h5 class="subtitle subtitle-sub" md="4">Resumen de datos para el recibo</h5>
                                </b-form-group>
                                <b-list-group>
                                    <b-list-group-item class="py-1">
                                        <b-row>
                                            <b-col cols="4">
                                                NÚMERO DE RECIBO:
                                            </b-col>
                                            {{ billNumber }}
                                        </b-row>
                                    </b-list-group-item>
                                    <b-list-group-item class="py-1">
                                        <b-row>
                                            <b-col cols="4">
                                                NOMBRE:
                                            </b-col>
                                            {{ customer.name }}
                                        </b-row>
                                    </b-list-group-item>
                                    <b-list-group-item class="py-1">
                                        <b-row>
                                            <b-col cols="4">
                                                DNI:
                                            </b-col>
                                            {{ customer.dni }}
                                        </b-row>
                                    </b-list-group-item>
                                    <b-list-group-item class="py-1">
                                        <b-row>
                                            <b-col cols="4">
                                                TARIFA:
                                            </b-col>
                                            {{ customer.paymentData.rate }}
                                        </b-row>
                                    </b-list-group-item>
                                    <b-list-group-item class="py-1">
                                        <b-row>
                                            <b-col cols="4">
                                                IMPORTE:
                                            </b-col>
                                            {{ customer.paymentData.amount }}
                                        </b-row>
                                    </b-list-group-item>
                                    <b-list-group-item class="py-1">
                                        <b-row>
                                            <b-col cols="4">
                                                FORMA DE PAGO:
                                            </b-col>
                                            {{ customer.paymentData.paymenttype }}
                                        </b-row>
                                    </b-list-group-item>
                                    <!-- Shown when the payment type is via bank -->
                                    <b-list-group-item class="py-1"
                                        v-if="customer.paymentData.paymenttype == 'Domiciliación'">
                                        <b-row>
                                            <b-col cols="4">
                                                IBAN:
                                            </b-col>
                                            {{ customer.paymentData.iban == null ? 'No hay iban' : customer.paymentData.iban }}
                                        </b-row>
                                    </b-list-group-item>
                                    <b-list-group-item class="py-1" >
                                        <b-row>
                                            <b-col cols="4">
                                                PERIODO DE PAGO:
                                            </b-col>
                                            {{ interval }}
                                        </b-row>
                                    </b-list-group-item>
                                    <b-list-group-item class="py-1">
                                        <b-row>
                                            <b-col cols="4">
                                                FIRMA:
                                            </b-col>
                                            <span
                                                :class="customer.sign ? 'text-success' : 'text-danger'">
                                                {{ customer.sign ? 'Correcta' : 'Pendiente' }}
                                            </span>
                                        </b-row>
                                    </b-list-group-item>
                                </b-list-group>
                            </div>
                        </transition>
                    </div>
                    <div
                        key="pf-print-procetcrights"
                        v-if="fileType == 1 || fileType == 2">
                        <b-form-group class="mb-0">
                            <h5 class="subtitle subtitle-sub" md="4">Resumen de datos para el documento</h5>
                        </b-form-group>
                        <b-list-group>
                            <b-list-group-item class="py-1">
                                <b-row>
                                    <b-col cols="4">
                                        NOMBRE:
                                    </b-col>
                                    {{ customer.name }}
                                </b-row>
                            </b-list-group-item>
                            <b-list-group-item class="py-1">
                                <b-row>
                                    <b-col cols="4">
                                        DNI:
                                    </b-col>
                                    {{ customer.dni }}
                                </b-row>
                            </b-list-group-item>
                            <b-list-group-item class="py-1">
                                <b-row>
                                    <b-col cols="4">
                                        ACEPTA PROTECCIÓN DE DATOS:
                                    </b-col>
                                    <span
                                        :class="customer.proctect == null ? 'text-danger' : 'text-success'">
                                        {{ customer.protect == false ? 'No' : customer.proctect == null ? 'No indicado' : 'Sí' }}
                                    </span>
                                </b-row>
                            </b-list-group-item>
                            <b-list-group-item class="py-1">
                                <b-row>
                                    <b-col cols="4">
                                        FIRMA:
                                    </b-col>
                                    <span
                                        :class="customer.sign ? 'text-success' : 'text-danger'">
                                        {{ customer.sign ? 'Correcta' : 'Pendiente' }}
                                    </span>
                                </b-row>
                            </b-list-group-item>
                        </b-list-group>
                        <span v-if="underage && (fileType == 1 || fileType == 2)">
                            <b-form-group class="mb-0">
                                <h5 class="subtitle subtitle-sub" md="4">Datos del tutor</h5>
                            </b-form-group>
                            <b-list-group
                                v-if="underage">
                                <b-list-group-item class="py-1">
                                    <b-row>
                                        <b-col cols="4">
                                            NOMBRE:
                                        </b-col>
                                        {{ customer.tutor.name }}
                                    </b-row>
                                </b-list-group-item>
                                <b-list-group-item class="py-1">
                                    <b-row>
                                        <b-col cols="4">
                                            DNI:
                                        </b-col>
                                        {{ customer.tutor.dni }}
                                    </b-row>
                                </b-list-group-item>
                                <b-list-group-item class="py-1">
                                    <b-row>
                                        <b-col cols="4">
                                            FIRMA:
                                        </b-col>
                                        <span
                                            :class="customer.sign ? 'text-success' : 'text-danger'">
                                            {{ customer.sign ? 'Correcta' : 'Pendiente' }}
                                        </span>
                                    </b-row>
                                </b-list-group-item>
                            </b-list-group>
                        </span>
                    </div>
                </transition>
                <!-- The button is shown if selections maded allow to download the file -->
                <div
                    v-if="isDownloadable != -1">
                    <b-button
                        class="my-2"
                        :disabled="downloading || isDownloadable > 0"
                        :variant="isDownloadable > 0 ? 'outline-danger' : 'outline-success'"
                        @click="downloadPdf()">
                        <b-spinner
                            small
                            type="grow"
                            v-if="downloading == true"></b-spinner>
                        <fa-icon
                            icon="file-download"
                            v-else></fa-icon>
                        <span class="d-inline-block ml-2">
                            {{ downloading ? 'Descargando...' : isDownloadable == 1 ? 'Falta la firma' : isDownloadable == 2 ? 'Selecciona un intervalo' : isDownloadable == 3 ? 'No se puede imprimir, el socio no es menor' : isDownloadable == 4 ? 'No hay datos de tutor' : fileType == null ? 'Selecciona una opción' : 'Descargar ' + fileOptions[fileType + 1].text.toLowerCase() + ' para este socio' }}
                        </span>
                    </b-button>
                </div>
            </div>
        </transition>
        <!-- Hided printable docs -->
        <div class="printable-wrp">
            <div class="pr-1 printable-ctn" ref="printable">
                <RightsUnderage
                    v-if="fileType && (fileType != 0 && customer != null && customer.tutor != null)"
                    :customer="customer"></RightsUnderage>
                <Bill
                    v-else-if="(fileType == 0 && customer !=  null && interval != null)"
                    :customer="customer"
                    :interval="interval"></Bill>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex';
    import * as WzdSteps from './wzdsteps/modaldocuments';
    export default {
        data() {
            return {
                customer: null, /* Stores the data of the customer selected */
                downloading: false, /* Userx flag to show */
                fileOptions: [
                    { text: 'Selecciona el tipo de documento', value: null },
                    { text: 'Recibo', value: 0 },
                    { text: 'Protección de datos', value: 1 },
                    { text: 'Autorización de menor', value: 2 },
                    { text: 'Derechos de imagen', value: 3 },
                ], /* Options for a select element */
                fileType: null, /* v-model for the selected filte type */
                interval: null, /* v-model with the payment interval */
                tableFields: [
                    { key: 'active', label: 'Activo', sortable: true, class: 'text-center' },
                    { key: 'customerNumber', label: 'Nº Socio', sortable: true, class: 'text-center' },
                    { key: 'name', label: 'Socio', sortable: true, },
                    { key: 'dni', label: 'DNI', sortable: true, class: 'text-center' },
                    { key: 'use', label: '', sortable: true, },
                ], /* Table fields */
                wmodaldocuments: null, /* Will be fetched with the wizard steps */
            }
        },
        computed: {
            ...mapGetters(['getUnderage']),
            /**
             * Build the bill number to print it on the bill
             *
             * @return {String} String formed by the 10 firsts charts of the customer id, the interval and the customer number
             */
            billNumber() {
                return this.customer._id.slice(0, 10) + '_' + this.interval + '_' + this.customer.customerNumber
            },
            /**
             * Defines the name of the file to download
             *
             * @return {String} String formed by the current datetime, the file type and the customer name
             */
            filename() {
                return this.customer.name.replace(/\s/g, '') + '__' + this.fileOptions[this.fileType + 1].text.toLowerCase().replace(/\s/g, '') + '__' + this.$moment().format('YYYY-MM-DD_HH_mm') + '.pdf';
            },
            /**
             * Evaluates if will be able to download the document to disable/unable the button and changes the userx
             *
             * @return {Integer} 0: Downloable => the customer and his sign aren't null; if a bill was required and there is interval or if a underage rights was required and the customer is underage and has the tutor data filled
             *                  No downloable =>
             *                      -1 => The customer is null or no file type was selected
             *                      1 => The customer signatura doesn't exists
             *                      2 => A bill was requested and there isn't interval
             *                      3 => A underage rigths was requested and the customer is not underage
             *                      4 => A underage rights was requested ad the customer tutor data isn't filled
             */
            isDownloadable() {
                /* Is downloadable if there is a customer and he has a sign check for every file type its required data */
                if (this.customer != null && this.customer.sign != null && ((this.fileType == 0 && this.interval != null) || (this.fileType == 2 && this.getUnderage(this.customer._id) == true && this.customer.tutor != null))) {
                    return 0;
                }
                if (this.customer != null && this.fileType != null) {
                    /* The signature is not present */
                    if (this.customer.sign == null) {
                        return 1;
                    }
                    /* For the bill generator if the interval is not present */
                    if (this.fileType == 0 && this.interval == null) {
                        return 2;
                    }
                    /* For underage authorization and if the customer is not underage */
                    if (this.fileType == 2 && this.getUnderage(this.customer._id) == false) {
                        return 3;
                    }
                    /* For underage authorization and if the customer doesn't have tutor */
                    if (this.fileType == 2 && this.customer.tutor == null) {
                        return 4;
                    }
                }
                return -1;
            },
            /**
             * Determines if the provided customer is underage checking to vuex customer data
             *
             * @return {Boolean} Boolean that indicates if the customer is or no underage
             */
            underage() {
                return this.getUnderage(this.customer._id);
            },
        },
        created() {
            /* Initialize the wizard steps content */
            this.wmodaldocuments = WzdSteps.wmodaldocuments;
        },
        methods: {
            /**
             * Calls to the child function wich creates a canvas to fill it with the to print screenshot data
             */
            downloadPdf() {
                /* Active the flag to userx and disallow multiple downloads */
                this.downloading = true;
                this.$html2print(this.filename, this.$refs.printable/* this.$refs.pdfPrinterRU.$refs.printable */)
                    .then(() => {
                        /* Restore the flag to userx and disallow multiple downloads */
                        setTimeout(() => {
                            this.downloading = false;
                        }, 300);
                    });
            },
            /**
             * Assigns the customer data selected on child
             *
             * @param {Object} data: the customer data
             */
            selected(data) {
                this.customer = data;
            },
        }
    }
</script>
<style scoped>
    .ig-btn-close-second {
        cursor: pointer;
        font-size: 1.3rem;
        margin-top: 3.5px;
        right: 2rem;
    }
</style>
