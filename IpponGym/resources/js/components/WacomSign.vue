<!--
    Super inspired by the example SigCaptX-Capture.html provided by wacom, a lot of functionalities has been disabled to simplify the use on the app
-->
<template>
    <div>
        <div id="imageBox" class="boxed"></div>
        <b-button
            class="my-2"
            id="capture-btn"
            size="sm"
            v-if="!isDisabled"
            :disabled="!capturable"
            :variant="!signatureOk ? 'danger' : capturable ? 'outline-warning' : 'ig-solid-green'"
            @click="capture()">
            <fa-icon
                class="mr-2"
                icon="signature"
                v-if="(underage == true && form.tutor && form.tutor.name != '' && (form.tutor.dni != '' || form.dni != '')) || (underage == false && form.name != '' && form.dni != '')"></fa-icon>
            <span
                v-if="!signatureOk">
                Ha ocurrido un error
            </span>
            <span
                v-else-if="underage == null">
                Falta la fecha de nacimiento
            </span>
            <span
                v-else-if="underage == true">
                {{ !form.tutor ? 'Falta datos del tutor' : form.tutor.name == '' ? 'Falta nombre del tutor' : form.tutor.dni == '' || form.dni == '' ? 'Falta dni del tutor' : 'Capturar firma' }}
            </span>
            <span
                v-else-if="underage == false">
                {{ form.name == '' ? 'Falta nombre del socio' : form.dni == '' ? 'Falta dni del socio' : 'Capturar firma' }}
            </span>
        </b-button>
        <div
            v-show="!signatureOk">
            <small
                class="text-danger">
                Ha ocurrido un error, <u v-b-toggle.logs><small>ver logs</small></u>
            </small>
            <b-collapse id="logs">
                <b-form-textarea id="txtDisplay" rows="15"></b-form-textarea>
            </b-collapse>
        </div>
    </div>
</template>
<script>
/* Necessary scripts are loaded on the main view spa.blade */
// import('../wacom/wcm/SigCaptX-Globals')
// import('../wacom/wcm/SigCaptX-SessionControl')
// import('../wacom/wcm/SigCaptX-Utils')
// import('../wacom/wcm/base64')
// import('../wacom/wcm/wgssSigCaptX')
export default {
    data() {
        return {
            signatureOk: true,
            signatureMessage: '',
        }
    },
    computed: {
        /* Return true if the sign is not capturable */
        capturable() {
            return this.underage == null || (this.underage == true && (!this.form.tutor || this.form.tutor.name == '' || (this.form.tutor.dni == '' || this.form.dni == '')) || (this.underage == false && (this.form.name == '' || this.form.dni == '')));
        },
    },
    methods: {
        capture() {
            if (!wgssSignatureSDK.running || null == dynCapt) {
                this.signatureOk = false;
                this.signatureMessage = 'Error. Reiniciando la sesión.';
                actionWhenRestarted(window.Capture);   // See SigCaptX-js
                return;
            }
            // Construct a hash object to contain the hash
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
                        print('Error, sesión inválida. Reiniciando sesión');
                        actionWhenRestarted(window.Capture);
                    }
                }
            }
            // If the hash value has been calculated successfully next steps is to capture the signature
            function onGetInitialHash() {
                dynCapt.Capture(sigCtl, self.form.name, "He leído y comprendo los documentos entregados por IPPONGYM", hash, null, onDynCaptCapture);
            }
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
                            var outputFlags = wgssSignatureSDK.RBFlags.RenderOutputPicture | wgssSignatureSDK.RBFlags.RenderColor32BPP;
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
                    var imageBox = document.getElementById("imageBox");
                    /* If RenderBitmap generated a standard image (picture) then just place that picture in the img control on the HTML form */
                    if (null == imageBox.firstChild) {
                        imageBox.appendChild(bmpObj.image);
                    } else {
                        imageBox.replaceChild(bmpObj.image, imageBox.firstChild);
                    }
                } else {
                    self.signatureOk = false;
                    print('Signature Render Bitmap error: ' + status);
                }
            }
            /* This function takes the SigText value returned by the callback and places it in the txtSignature tag on the form */
            function onGetSigText(sigObjV, text, status) {
                if (wgssSignatureSDK.ResponseStatus.OK == status) {
                    var txtSignature = document.getElementById("txtSignature");
                    txtSignature.value = text;
                } else {
                    self.signatureOk = false;
                    print('Signature Render Bitmap error: ' + status);
                }
            }
        },
        /* UNUSED */
        /* This function displays the details of the signature in the text box on the HTML form */
        displaySignatureDetails(sigObj) {
            if (!wgssSignatureSDK.running || null == sigObj) {
                this.signatureOk = false;
                this.signatureMessage = 'Error de sesión. Reiniciando la sesión.';
                actionWhenRestarted(window.DisplaySignatureDetails);  // See SigCaptX-SessionControl.js
                return;
            }
            sigObj.GetIsCaptured(onGetIsCaptured);
            var self = this;
            function onGetIsCaptured(sigObj, isCaptured, status) {
                if (wgssSignatureSDK.ResponseStatus.OK == status) {
                    if (!isCaptured) {
                        print('Todavía no se ha capturado una firma.');
                        return;
                    }
                    sigObj.GetWho(onGetWho);
                } else {
                    print('Error al obtener datos de la firma: ' + status);
                    if (wgssSignatureSDK.ResponseStatus.INVALID_SESSION == status) {
                        print('Error de sesión. Reiniciando la sesión');
                        actionWhenRestarted(window.displaySignatureDetails);  // See SigCaptX-SessionControl.js
                    }
                }
            }
            function onGetWho(sigObjV, who, status) {
                if (wgssSignatureSDK.ResponseStatus.OK == status) {
                    print('Nombre: ' + who);
                    var tz = wgssSignatureSDK.TimeZone.TimeLocal;
                    sigObj.GetWhen(tz, onGetWhen);
                } else {
                    print('Error al obtener datos de la firma: ' + status);
                }
            }
            function onGetWhen(sigObjV, when, status) {
                if (wgssSignatureSDK.ResponseStatus.OK == status) {
                    print('Fecha: ' + when.toString());
                    sigObj.GetWhy(onGetWhy);
                } else {
                    print('Error al obtener datos de la firma: ' + status);
                }
            }
            function onGetWhy(sigObjV, why, status) {
                if (wgssSignatureSDK.ResponseStatus.OK == status) {
                    print('Motivo: ' + when.toString());
                } else {
                    print('Error al obtener datos de la firma: ' + status);
                }
            }
        },
        // This function calculates a hash value using the first and last names on the HTML form
        GetHash(hash, callback) {
            this.signatureMessage = 'Creando hash:';
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
                    // vFname.Set(document.getElementById("fname").value);
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
        /* UNUSED */
        // This function recalculates the hash value from the first and last names
        // and checks it against the hash embedded in the signature object
        verifySignedData() {
            this.signatureMessage = 'Verificando firma:';
            var self = this;
            if (null == sigObj) {
                actionWhenRestarted(window.VerifySig);
                return;
            }
            var hash = null;
            sigObj.GetIsCaptured(onGetIsCaptured);
            function onGetIsCaptured(sigObjV, isCaptured, status) {
                if (wgssSignatureSDK.ResponseStatus.OK == status) {
                    if (isCaptured) {
                        hash = new wgssSignatureSDK.Hash(onHashConstructor);
                    } else {
                        print('Firma no capturada.');
                    }
                } else {
                    print('Error al comprobar si la firma está capturada: ' + status);
                    if (wgssSignatureSDK.ResponseStatus.INVALID_SESSION == status) {
                        print('Sesión inválida. Reiniciando la sesión.');
                        actionWhenRestarted(window.VerifySig);
                    }
                }
            }
            function onHashConstructor(hashV, status) {
                if (wgssSignatureSDK.ResponseStatus.OK == status) {
                    self.GetHash(hash, onGetHashForVerification);
                } else {
                    print("Hash Constructor error: " + status);
                    print('Error en el constructor del hash: ' + status);
                }
            }
            function onGetHashForVerification() {
                sigObj.CheckSignedData(hash, onCheckSignedData);
            }
            function onCheckSignedData(hash, status) {
                print('Resultado de la verificación: ' + status);
                if (wgssSignatureSDK.SignedData.DataGood == status) {
                    print('Datos de firma correctos');
                } else {
                    print('Los datos de la firma han cambiado');
                }
            }
        },
        /* UNUSED */
        /* This function clears the current signature image from the signature control on the form */
        clearSignature() {
            var imageBox = document.getElementById("imageBox");
            if (null != imageBox.firstChild) {
                imageBox.removeChild(imageBox.firstChild);
            }
            if (null == sigObj) {
                actionWhenRestarted(window.ClearSignature);  // See SigCaptX-SessionControl.js
                return;
            }
            sigObj.Clear(onClearSig);
            var self = this;
            function onClearSig(sigObjV, status) {
                if (wgssSignatureSDK.ResponseStatus.OK != status) {
                    print('Error al limpiar la firma: ' + status);
                    if (wgssSignatureSDK.ResponseStatus.INVALID_SESSION == status) {
                        print('Error de sesión. Reiniciando la sesión.');
                        actionWhenRestarted(window.ClearSignature);  // See SigCaptX-SessionControl.js
                    }
                }
            }
        },
        /* UNUSED */
        /* This function takes the SigText value currently displayed on the HTML form and uses it to recreate the signature image shown in the signature control tag on the form */
        setSignatureText() {
            var self = this;
            if (null == sigObj) {
                actionWhenRestarted(window.SetSignatureText);  // See SigCaptX-SessionControl.js
                return;
            }
            /* First of all take the SigText value currently displayed in the txtSignature field on the form and assign it to the sigObj object */
            var text = document.getElementById("txtSignature").value;
            sigObj.PutSigText(text, onPutSigText);
            function onPutSigText(sigObjV, status) {
                if (wgssSignatureSDK.ResponseStatus.OK == status) {
                    /* Now that the sigObj has been populated with the signature data (via the SigText) it can be used to geberate a signature image */
                    var outputFlags = wgssSignatureSDK.RBFlags.RenderOutputPicture | wgssSignatureSDK.RBFlags.RenderColor24BPP;
                    var imageBox = document.getElementById("imageBox");
                    sigObj.RenderBitmap(BITMAP_IMAGEFORMAT, imageBox.clientWidth, imageBox.clientHeight, BITMAP_INKWIDTH, BITMAP_INKCOLOR, BITMAP_BACKGROUNDCOLOR, outputFlags, BITMAP_PADDING_X, BITMAP_PADDING_Y, onRenderBitmapFromSigText);
                } else {
                    print('Error al establecer el texto de la firma: ' + status);
                    if (wgssSignatureSDK.ResponseStatus.INVALID_SESSION == status) {
                        print('Error de sesión. Reiniciando la sesión.');
                        actionWhenRestarted(window.SetSignatureText);  // See SigCaptX-SessionControl.js
                    }
                }
            }
            /* Take the image generated by RenderBitmap and use it to populate the signature image control on the form */
            function onRenderBitmapFromSigText(sigObjV, bmpObj, status) {
                if (wgssSignatureSDK.ResponseStatus.OK == status) {
                    var imageBox = document.getElementById("imageBox");
                    if (null == imageBox.firstChild) {
                        imageBox.appendChild(bmpObj.image);
                    } else {
                        imageBox.replaceChild(bmpObj.image, imageBox.firstChild);
                    }
                } else {
                    print('Error al renderizar el bitmap: ' + status);
                }
            }
        },
    },
    mounted() {
        /* Load the wacom api */
        wizardEventController.body_onload();
    },
    props: [
        'form', /* Is the form object from the vuex store currently used */
        'isDisabled', /* If is true indicates the user cannot interact */
        'underage', /* Boolean that indicates if the customer is underage */
    ],
}
</script>
<style>
    #capture-btn {
        width: 342px;
    }
    #capture-btn * {
        font-size: 0.875rem!important
    }
    #imageBox {
        border: 1px solid rgba(180, 180, 180, 1);
        border-radius: .25rem;
        height: 200px;
        width: 342px;
    }
    #txtDisplay {
        width: 342px;
    }
</style>

