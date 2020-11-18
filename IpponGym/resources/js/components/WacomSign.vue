<!--
    Super inspired by the example SigCaptX-Capture.html provided by wacom, a lot of functionalities has been disabled to simplify the use on the app
-->
<template>
    <div id="sign-container">
        <!-- Disable the image validation to tests! -->
        <!-- v-validate="'required'" -->
        <b-img
            id="imageBox"
            name="sign"
            v-model="sign"
            :class="{ 'is-invalid' : errors.has('sign') }"
            :src="sign == '' || sign == null ? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' : sign"></b-img>
        <transition mode="out-in" name="liveFeedbacks">
            <small
                class="fake-invalid-feedback"
                v-if="errors.has('sign')">
                El cliente debe firmar
            </small>
        </transition>
        <b-button
            class="d-block ml-md-0 mx-auto my-2"
            id="capture-btn"
            size="sm"
            v-if="!isDisabled"
            :variant="!signatureOk ? 'danger' : capturable.value ? 'outline-secondary' : 'outline-primary'"
            @click="xx()">
            <!-- @click="capture()"> -->
            <!-- :disabled="capturable.value" -->
            <fa-icon
                class="mr-2"
                icon="signature"
                v-if="!capturable.value"></fa-icon>
            <span>
                <!-- v-if="!signatureOk"> -->
                {{ capturable.message}}
                <!-- Ha ocurrido un error, pulsa para reintentar -->
            </span>
            <!-- <span
                v-else-if="underage == null">
                Falta la fecha de nacimiento
            </span>
            <span
                v-else-if="underage == true">
                {{ !form.tutor ? 'Falta datos del tutor' : form.tutor.name == '' ? 'Falta nombre del tutor' : ((!form.tutor.dni && !form.dni) || ((errors.has('dni') && form.dni) || (errors.has('tutor-dni') && form.tutor.dni))) ? 'Falta dni del tutor' : 'Capturar firma' }}
            </span>
            <span
                v-else-if="underage == false">
                {{ !form.name ? 'Falta nombre del socio' : !form.dni ? 'Falta dni del socio' : 'Capturar firma' }}
            </span> -->
        </b-button>
        <!-- Is not infomation necessary to the user -->
        <!-- <div
            v-show="!signatureOk"> -->
        <div
            v-show="true">
            <small
                class="text-danger">
                Ha ocurrido un error, <u v-b-toggle.logs><small>ver logs</small></u>
            </small>
            <b-collapse id="logs">
                <b-form-textarea id="txtDisplay" rows="7"></b-form-textarea>
            </b-collapse>
        </div>
    </div>
</template>
<script>
    import { mapActions } from 'vuex';
    export default {
        data() {
            return {
                signatureOk: true, /* Flag to determine if the signature was correct */
            }
        },
        computed: {
            /**
             * @returns {Object} with the message and the disabled/capturable boolean status for the capture sign button
             */
            capturable() {
                const errorsDni = this.errors.items.filter(error => error.field == 'dni').length > 0;
                const errorsTutorDni = this.errors.items.filter(error => error.field == 'tutor-dni').length > 0
                let message = 'Capturar firma';
                if (this.underage == null) {
                    message = 'Falta la fecha de nacimiento';
                }
                if (this.underage == true) {
                    message = !this.form.tutor ? 'Faltan datos del tutor' : this.form.tutor.name == '' ? 'Falta el nombre del tutor' : ((!this.form.tutor.dni && !this.form.dni) || ((errorsDni && this.form.dni) || (errorsTutorDni && this.form.tutor.dni))) ? 'Revisa el dni del tutor' : 'Capturar firma';
                }
                if (this.underage == false) {
                    message = !this.form.name ? 'Falta el nombre del socio' : !this.form.dni ? 'Falta el dni del socio' : errorsDni ? 'Revisa el dni' : 'Capturar firma';
                }
                if (!this.signatureOk) {
                    message = 'Ha ocurrido un error, pulsa para reintentar';
                }
                return {
                    value: this.underage == null || (this.underage == true && (!this.form.tutor || !this.form.tutor.name || !this.form.tutor.dni || this.errors.items.filter(error => error.field == 'dni').length > 0 || errorsTutorDni || !this.form.dni)) || (this.underage == false && (!this.form.name || !this.form.dni || errorsDni)),
                    message: message,
                };
            },
            /**
             * Is the v-model for the sign element
             */
            sign: {
                get() {
                    return this.form.sign;
                },
                set(value) {
                    /* The id will be null on customers.new page, its managed at vuex */
                    this.updateCustomerData({ _id: this.form._id, field: 'sign', newVal: value });
                }
            },
        },
        inject: [
            '$validator', /* Inject the main $validator from the parent */
        ],
        methods: {
            ...mapActions(['updateCustomerData']),
            /**
             * Active the signature and treat its value
             */
            capture() {
                if (!wgssSignatureSDK.running || null == dynCapt) {
                    this.signatureOk = false;
                    print('Error. Reiniciando la sesión.');
                    actionWhenRestarted(window.Capture);   // See SigCaptX-js
                    return;
                }
                /* Construct a hash object to contain the hash */
                var hash = new wgssSignatureSDK.Hash(onHashConstructor);
                var self = this;
                function onHashConstructor(hashV, status) {
                    if (wgssSignatureSDK.ResponseStatus.OK == status) {
                        self.GetHash(hash, onGetInitialHash);
                    } else {
                        self.signatureOk = false;
                        print('Error en el constructor del hash: ' + status);
                        if (wgssSignatureSDK.ResponseStatus.INVALID_SESSION == status) {
                            self.signatureOk = false;
                            print('Error, sesión inválida. Reiniciando sesión.');
                            actionWhenRestarted(window.Capture);
                        }
                    }
                }
                /* If the hash value has been calculated successfully next steps is to capture the signature */
                function onGetInitialHash() {
                    // const name = self.underage == true && self.form.tutor ? self.form.tutor.name : self.form.name;
                    const name = 'foo';
                    if (self.underage && !self.form.tutor) {
                        print('Faltan los datos del tutor.');
                    } else if (name == null) {
                        print('No se puede registrar la firma, faltan datos del firmante.')
                    }
                    dynCapt.Capture(sigCtl, name, "Comprendo las indicaciones dadas por IPPONGYM", hash, null, onDynCaptCapture);
                }
                /* Treat the signature caption */
                function onDynCaptCapture(dynCaptV, SigObjV, status) {
                    if (wgssSignatureSDK.ResponseStatus.INVALID_SESSION == status) {
                        self.signatureOk = false;
                        print('Error, sesión inválida. Reiniciando sesión');
                        actionWhenRestarted(window.Capture);  // See SigCaptX-SessionControl.js
                    } else {
                        /* Check the status returned from the signature capture */
                        switch( status ) {
                            case wgssSignatureSDK.DynamicCaptureResult.DynCaptOK:
                                sigObj = SigObjV;
                                self.signatureOk = true;
                                print('Firma capturada');
                                var outputFlags = wgssSignatureSDK.RBFlags.RenderOutputBase64 | wgssSignatureSDK.RBFlags.RenderColor32BPP;
                                sigObj.RenderBitmap(BITMAP_IMAGEFORMAT, imageBox.clientWidth, imageBox.clientHeight, BITMAP_INKWIDTH, BITMAP_INKCOLOR, BITMAP_BACKGROUNDCOLOR, outputFlags, BITMAP_PADDING_X, BITMAP_PADDING_Y, onRenderBitmap);
                                break;
                            case wgssSignatureSDK.DynamicCaptureResult.DynCaptCancel:
                                self.signatureOk = false;
                                print('Error. Captura de firma cancelada');
                                break;
                            case wgssSignatureSDK.DynamicCaptureResult.DynCaptPadError:
                                self.signatureOk = false;
                                print('No hay servicio de captura disponible');
                                break;
                            case wgssSignatureSDK.DynamicCaptureResult.DynCaptError:
                                self.signatureOk = false;
                                print('Error en la tablet');
                                break;
                            case wgssSignatureSDK.DynamicCaptureResult.DynCaptNotLicensed:
                                self.signatureOk = false;
                                print('No se ha encontrado una licencia de captura válida');
                                break;
                            default:
                                self.signatureOk = false;
                                print('Error al capturar la firma: ' + status);
                                break;
                        }
                    }
                }
                function onRenderBitmap(sigObjV, bmpObj, status) {
                    if (wgssSignatureSDK.ResponseStatus.OK == status) {
                        /* If RenderBitmap generated a standard image (picture) then just place that picture in the img control on the HTML form */
                        /* Assign the image obj to the v-model */
                        self.sign = 'data:image/jpeg;base64,' + bmpObj;
                    } else {
                        self.signatureOk = false;
                        print('Error al renderizar el Bitmap de la firma: ' + status);
                    }
                }
            },
            /**
             * Calculates a hash value using the first and last names on the HTML form
             */
            GetHash(hash, callback) {
                print('Creando hash:');
                hash.Clear(onClear);
                var self = this;
                function onClear(hashV, status) {
                    if (wgssSignatureSDK.ResponseStatus.OK == status) {
                        hash.PutType(wgssSignatureSDK.HashType.HashMD5, onPutType);
                    } else {
                        print('Error al limpiar el hash: ' + status);
                    }
                }
                function onPutType(hashV, status) {
                    if (wgssSignatureSDK.ResponseStatus.OK == status) {
                        var vFname = new wgssSignatureSDK.Variant();
                        vFname.Set(self.name);
                        hash.Add(vFname, onAddFname);
                    } else {
                        print('Error al utilizar el hash: ' + status);
                    }
                }
                function onAddFname(hashV, status) {
                    if (wgssSignatureSDK.ResponseStatus.OK == status) {
                        callback();
                    } else {
                        print('Error al añadir el hash: ' + status);
                    }
                }
            },
            /**
             * Validate the component from the parent
             */
            async validate() {
                await this.$validator.validateAll();
                return this.errors.all().length;
            },
            async xx() {
                if (wizardEventController != undefined) {
                    const x = await wizardEventController.body_onload();
                    print('.....');
                    print(x);
                    print('.....');
                    // await start();
                    // await wizardEventController.start_stop(1);
                    // this.capture();
                }
            }
        },
        mounted() {
            /* Load the wacom api */
            if (this.$route.name != 'customers.profile') {
                if (wizardEventController != undefined) {
                    // wizardEventController.body_onload();
                }
            } else {
                // sigObj && sigObj.PutSigText(this.sign, this.onPutSigText);
            }
        },
        props: [
            'form', /* Is the form object from the vuex store currently used */
            'isDisabled', /* If is true indicates the user cannot interact */
            'underage', /* Boolean that indicates if the customer is underage */
        ],
    }
</script>
<style>
    .fake-invalid-feedback {
        display: block;
        color: rgba(220, 53, 69, 1);
        font-size: 80%;
        width: 100%;
    }
    #capture-btn {
        width: 342px;
    }
    #capture-btn * {
        font-size: 0.875rem!important
    }
    #imageBox {
        border: 1px solid rgba(180, 180, 180, 1);
        border-radius: .25rem;
        /* height: auto; */
        height: 200px;
        /* max-height: 200px; */
        /* max-width: 342px; */
        /* width: 100%; */
        width: 342px;
    }
    #imageBox.is-invalid {
        border-color: #dc3545;
        border-radius: 0.25rem;
    }
    #txtDisplay {
        max-width: 342px;
        width: 100%;
    }
    @media screen and (max-width: 768px) {
        #imageBox,
        #txtDisplay {
            margin: 0 auto;
        }
        #sign-container {
            text-align: center;
        }
    }
</style>

