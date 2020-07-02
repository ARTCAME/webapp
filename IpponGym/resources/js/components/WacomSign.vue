<template>
    <div class="p-0">
        <div>
            <b-button
                id="signButton"
                size="sm"
                v-if="!isDisabled"
                @click="tabletStart()">Capturar firma</b-button>
        </div>
        <div id="signatureDiv">
            <!-- Showing a blank image if no image is loaded -->
            <!-- v-validate="'required'" -->
            <b-img
                id="signatureImage"
                name="sign"
                v-model="sign"
                :class="{ 'is-invalid' : errors.has('sign') }"
                :src="sign == '' ? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' : sign"/>
            <transition mode="out-in" name="liveFeedbacks">
                <small
                    class="fake-invalid-feedback"
                    v-if="errors.has('sign')">
                    El cliente debe firmar
                </small>
            </transition>
        </div>
    </div>
</template>
<script>
/* IMPORTANT: The configuration and many functions, variables and functionalities are inspired or copied from the example 'demobuttons' provided by wacom */
    require('../wacom/q.js');
    import { mapActions, mapState } from 'vuex';
    // Importing the wacom files:
    import w from '../wacom/wgssStuSdk';
    import Button from '../wacom/Button.js';
    import Rectangle from '../wacom/Rectangle.js';
    import Point from '../wacom/Point.js';
    import DCANotReady from '../wacom/DCANotReady'
    export default {
        data() {
            return {
                canvas: null, /* Will contain the canvas to fetch with the sign */
                ctx: null, /* Will contain the context of the canvas */
                isDown: null, /* If the wacom is pressed */
                lastPoint: null, /* Store the last point coordinates */
                modalBackground: null, /* Will contain the div with the modal of the sign element */
                modalDialog: null, /* Will be the modal dialog */
                m_btns: null, /* The array of buttons that we are emulating */
                m_capability: null, /* Stores the total size of the signing area */
                m_clickBtn: -1, /* Will store the clicked button */
                m_encodingMode: null, /* Stores the encoding mode */
                m_imgData: null, /* Stores the image data */
                m_inkThreshold: null, /* Stores the limits of the signing area */
                m_penData: [], /* Will store the pen data */
                m_usbDevices: null, /* Stores the usb devices */
                retry: 0, /* Counter for the retry connections with the device */
                tablet: null, /* Will be the table device */
            }
        },
        computed: {
            ...mapState({
                newCustomerForm: state => state.form,
                editCustomerForm: state => state.editform,
            }),
            /**
             * Defines the current form state (edit or new customer)
             *
             * @return {Object} The object with the form data from the customers state
             */
            form() {
                return this.$route.name == 'customers.new' ? this.newCustomerForm : this.editCustomerForm;
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
             * Add the buttons to the tablet
             */
            addButtons() {
                /* Initialize the buttons */
                this.m_btns = new Array(3);
                this.m_btns[0] = new Button();
                this.m_btns[1] = new Button();
                this.m_btns[2] = new Button();
                /* Sets the size */
                let w2 = this.m_capability.screenWidth / 3;
                let w3 = this.m_capability.screenWidth / 3;
                let w1 = this.m_capability.screenWidth - w2 - w3;
                let y = this.m_capability.screenHeight * 6 / 7;
                let h = this.m_capability.screenHeight - y;
                /* Sets the bounds */
                this.m_btns[0].Bounds = new Rectangle(0, y, w1, h);
                this.m_btns[1].Bounds = new Rectangle(w1, y, w2, h);
                this.m_btns[2].Bounds = new Rectangle(w1 + w2, y, w3, h);
                /* Sets the inner text and assign the functions */
                this.m_btns[0].Text = "Aceptar";
                this.m_btns[1].Text = "Limpiar";
                this.m_btns[2].Text = "Cancelar";
                this.m_btns[0].Click = this.btnOk_Click;
                this.m_btns[1].Click = this.btnClear_Click;
                this.m_btns[2].Click = this.btnCancel_Click;
                this.clearCanvas(this.canvas, this.ctx);
                this.drawButtons();
            },
            /**
             * Function called on click on the cancel button on the tablet
             */
            btnCancel_Click() {
                setTimeout(this.close, 0);
            },
            /**
             * Function called on click on the clear button on the tablet
             */
            btnClear_Click() {
                this.clearScreen();
            },
            /**
             * Function called on click on the ok button on the tablet
             */
            btnOk_Click() {
                /* Call to generate the image based on the sign received */
                this.generateImage();
                setTimeout(this.close, 0);
            },
            /**
             *  Checks if is possible to establish connection with the SigCaptX Web Service
             */
            checkForSigCaptX() {
                /* Establishing a connection to SigCaptX Web Service can take a few seconds, particularly if the browser itself is still loading/initialising or on a slower machine. */
                this.retry = this.retry + 1;
                /* SigCaptX Web Service ready */
                if (w.isServiceReady()) {
                    this.retry = 0;
                /* SigCaptX Web Service not connected */
                } else {
                    if (this.retry < 20) {
                        setTimeout(checkForSigCaptX, 1000);
                    }
                    else {
                        console.error("Unable to establish connection to SigCaptX");
                    }
                }
            },
            /**
             * Clear the canvas
             *
             * @param {Object} in_canvas: the canvas object to clear
             * @param {Object} in_ctx: the canvas context
             */
            clearCanvas(in_canvas, in_ctx) {
                in_ctx.save();
                in_ctx.setTransform(1, 0, 0, 1, 0, 0);
                in_ctx.fillStyle = "white";
                in_ctx.fillRect(0, 0, in_canvas.width, in_canvas.height);
                in_ctx.restore();
            },
            /**
             * Clear the tablet screen leaving the buttons
             */
            clearScreen() {
                this.clearCanvas(this.canvas, this.ctx);
                this.drawButtons();
                this.m_penData = new Array();
                this.tablet.writeImage(this.m_encodingMode, this.m_imgData);
            },
            /**
             * Close the modal and disconnects the tablet
             */
            close() {
                /* Clear handler for Device Control App timeout */
                w.onDCAtimeout = null;
                this.disconnect();
                document.getElementsByTagName('html')[0].classList.toggle('modalOn');
                document.getElementsByTagName('body')[0].classList.toggle('modalOn');
                // document.getElementsByTagName('body')[0].className = '';
                document.getElementsByTagName('body')[0].removeChild(this.modalBackground);
                document.getElementsByTagName('body')[0].removeChild(this.modalDialog);
            },
            /**
             * Create the modal to allocate the sign object
             *
             * @param {Number} width: the width of the m_capability area
             * @param {Number} height: the height of the m_capability area
             */
            createModalWindow(width, height) {
                /* Create the modal background*/
                this.modalBackground = document.createElement('div');
                this.modalBackground.id = 'modal-background';
                this.modalBackground.className = 'active modal';
                this.modalBackground.style.width = window.innerWidth;
                this.modalBackground.style.height = window.innerHeight;
                document.getElementsByTagName('body')[0].appendChild(this.modalBackground);
                /* Create the modal dialog based on the width/height passed */
                this.modalDialog = document.createElement('div');
                this.modalDialog.id = 'signatureWindow';
                this.modalDialog.className = 'active modal-dialog';
                this.modalDialog.style.top = document.documentElement.scrollTop + (window.innerHeight / 2) - (height / 2) + 'px';
                this.modalDialog.style.left = (window.innerWidth / 2) - (width / 2) + 'px';
                this.modalDialog.style.width = width + 'px';
                this.modalDialog.style.height = height + 'px';
                document.getElementsByTagName('body')[0].appendChild(this.modalDialog);
                /* Add the canvas as the modal content */
                this.canvas = document.createElement('canvas');
                this.canvas.id = 'myCanvas';
                this.canvas.className = 'modal-content'
                this.canvas.height = this.modalDialog.offsetHeight;
                this.canvas.width = this.modalDialog.offsetWidth;
                this.modalDialog.appendChild(this.canvas);
                this.ctx = this.canvas.getContext('2d');
                /* Add the listeners to the canvas */
                if (this.canvas.addEventListener) {
                    this.canvas.addEventListener('click', this.onCanvasClick, false);
                } else if (this.canvas.attachEvent) {
                    this.canvas.attachEvent('onClick', this.onCanvasClick);
                } else {
                    this.canvas['onClick'] = this.onCanvasClick;
                }
                document.getElementsByTagName('body')[0].classList.toggle('modalOn');
                // document.getElementsByTagName('body')[0].className += ' modalOn';
                document.getElementsByTagName('html')[0].classList.toggle('modalOn');
                // document.getElementsByTagName('html')[0].className += ' modalOn';
            },
            /**
             * Disconnects the tablet using the Q defer promise
             */
            disconnect() {
                let deferred = Q.defer();
                if (!(undefined === this.tablet || null === this.tablet)) {
                    let p = new w.Protocol();
                    this.tablet.setInkingMode(p.InkingMode.InkingMode_Off)
                        .then(message => {
                            return this.tablet.endCapture();
                        })
                        .then(message => {
                            if (this.m_imgData !== null) {
                                return this.m_imgData.remove();
                            }
                            else {
                                return message;
                            }
                        })
                        .then(message => {
                            this.m_imgData = null;
                            return this.tablet.setClearScreen();
                        })
                        .then(message => {
                            return this.tablet.disconnect();
                        })
                        .then(message => {
                            this.tablet = null;
                            this.clearCanvas(this.canvas, this.ctx);
                        })
                        .then(message => {
                            deferred.resolve();
                        })
                        .fail(message => {
                            deferred.resolve();
                        });
                } else {
                    deferred.resolve();
                }
                return deferred.promise;
            },
            /**
             * Calculates the distances between points
             *
             * @return The distances between points
             */
            distance(a, b) {
                return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
            },
            /**
             * Include the buttons to the tablet
             */
            drawButtons() {
                /* This application uses the same bitmap for both the screen and client (window). */
                this.ctx.save();
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.ctx.beginPath();
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = 'black';
                this.ctx.font = "italic bold condensed 20px Myriad Pro";
                /* Draw the buttons */
                for (let i = 0; i < this.m_btns.length; ++i) {
                    this.ctx.fillStyle = "lightgrey";
                    this.ctx.fillRect(this.m_btns[i].Bounds.x, this.m_btns[i].Bounds.y, this.m_btns[i].Bounds.width, this.m_btns[i].Bounds.height);
                    this.ctx.fillStyle = "black";
                    this.ctx.rect(this.m_btns[i].Bounds.x, this.m_btns[i].Bounds.y, this.m_btns[i].Bounds.width, this.m_btns[i].Bounds.height);
                    let xPos = this.m_btns[i].Bounds.x + ((this.m_btns[i].Bounds.width / 2) - (this.ctx.measureText(this.m_btns[i].Text).width / 2));
                    let yOffset = 22;
                    this.ctx.fillText(this.m_btns[i].Text, xPos, this.m_btns[i].Bounds.y + yOffset);
                }
                this.ctx.stroke();
                this.ctx.closePath();
                this.ctx.restore();
            },
            /**
             * Draws the images and stores it locally
             */
            generateImage() {
                let signatureImage = document.getElementById("signatureImage");
                let signatureCanvas = document.createElement("canvas");
                signatureCanvas.id = "signatureCanvas";
                signatureCanvas.height = signatureImage.height;
                signatureCanvas.width = signatureImage.width;
                let signatureCtx = signatureCanvas.getContext("2d");
                this.clearCanvas(signatureCanvas, signatureCtx);
                signatureCtx.lineWidth = 1;
                signatureCtx.strokeStyle = 'black';
                this.lastPoint = { "x": 0, "y": 0 };
                this.isDown = false;
                for (let i = 0; i < this.m_penData.length; i++) {
                    this.processPoint(this.m_penData[i], signatureCanvas, signatureCtx);
                }
                /* Store on vuex */
                this.sign = signatureCanvas.toDataURL("image/jpeg");
                signatureImage.src = signatureCanvas.toDataURL("image/jpeg");
            },
            /**
             * Manage the canvas click events
             */
            onCanvasClick(event) {
                /* Enable the mouse to click on the simulated buttons that we have displayed.
                Note that this can add some tricky logic into processing pen data
                if the pen was down at the time of this click, especially if the pen was logically
                also 'pressing' a button! We are ignoring any that. */
                let posX = event.pageX - this.modalDialog.offsetLeft;
                let posY = event.pageY - this.modalDialog.offsetTop;
                let point = new Point()
                point.x = posX;
                point.y = posY;
                // point.y = posY - 15; // There is a phantom gap of 15px on canvas element, I need more clues to find the way to resolve it with a clean solution but with this it works for now
                for (let i = 0; i < this.m_btns.length; i++) {
                    if (this.m_btns[i].Bounds.Contains(point)) {
                        this.m_btns[i].Click();
                        break;
                    }
                }
            },
            /**
             * Device Control App has timed-out and shut down
             */
            onDCAtimeout() {
                setTimeout(this.close, 0);
            },
            /**
             * Process the buttons clicks
             *
             * @param {Object} point: the point coordinates
             * @param {Object} in_canvas: the canvas object pointed
             */
            processButtons(point, in_canvas) {
                let nextPoint = {};
                nextPoint.x = Math.round(in_canvas.width * point.x / this.m_capability.tabletMaxX);
                nextPoint.y = Math.round(in_canvas.height * point.y / this.m_capability.tabletMaxY);
                let isDown2 = (this.isDown ? !(point.pressure <= this.m_inkThreshold.offPressureMark) : (point.pressure > this.m_inkThreshold.onPressureMark));
                let btn = -1;
                for (let i = 0; i < this.m_btns.length; ++i) {
                    if (this.m_btns[i].Bounds.Contains(nextPoint)) {
                    btn = i;
                    break;
                    }
                }
                if (this.isDown && !isDown2) {
                    if (btn != -1 && this.m_clickBtn === btn) {
                    this.m_btns[btn].Click();
                    }
                    this.m_clickBtn = -1;
                }
                else if (btn != -1 && !this.isDown && isDown2) {
                    this.m_clickBtn = btn;
                }
                return (btn == -1);
            },
            /**
             * Process the points
             *
             * @param {Object} point: the point coordinates
             * @param {Object} in_canvas: the canvas object pointed
             * @param {Object} in_ctx: the context
             */
            processPoint(point, in_canvas, in_ctx) {
                let nextPoint = {};
                nextPoint.x = Math.round(in_canvas.width * point.x / this.m_capability.tabletMaxX);
                nextPoint.y = Math.round(in_canvas.height * point.y / this.m_capability.tabletMaxY);
                let isDown2 = (this.isDown ? !(point.pressure <= this.m_inkThreshold.offPressureMark) : (point.pressure > this.m_inkThreshold.onPressureMark));

                if (!this.isDown && isDown2) {
                    this.lastPoint = nextPoint;
                }

                if ((isDown2 && 10 < this.distance(this.lastPoint, nextPoint)) || (this.isDown && !isDown2)) {
                    in_ctx.beginPath();
                    in_ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
                    in_ctx.lineTo(nextPoint.x, nextPoint.y);
                    in_ctx.stroke();
                    in_ctx.closePath();
                    this.lastPoint = nextPoint;
                }
                this.isDown = isDown2;
            },
            /**
             * Start/Manage the tablet connection
             */
            tabletStart() {
                let p = new w.Protocol();
                let intf;
                let m_usingEncryption = false;
                let m_encH;
                let m_encH2;
                let m_encH2Impl;
                w.isDCAReady()
                    .then(message => {
                        // console.log('1')
                        if (!message) {
                            throw new DCANotReady();
                        }
                        // Set handler for Device Control App timeout
                        // w.onDCAtimeout = onDCAtimeout;
                        return w.getUsbDevices();
                    })
                    .then(message => {
                        // console.log('2')
                        if (message == null || message.length == 0) {
                            throw new Error("No se ha encontrado el dispositivo");
                        }
                        this.m_usbDevices = message;
                        return w.isSupportedUsbDevice(this.m_usbDevices[0].idVendor, this.m_usbDevices[0].idProduct);
                    })
                    .then(message => {
                        // console.log('3')
                        intf = new w.UsbInterface();
                        return intf.Constructor();
                    })
                    .then(message => {
                        // console.log('4')
                        return intf.connect(this.m_usbDevices[0], true);
                    })
                    .then(message => {
                        // console.log('5')
                        if (0 == message.value) {
                            m_encH = new w.EncryptionHandler(new w.EncryptionHandler());
                            return m_encH.Constructor();
                        }
                    })
                    .then(message => {
                        // console.log('6')
                        m_encH2Impl = new w.EncryptionHandler2();
                        m_encH2 = new w.EncryptionHandler2(m_encH2Impl);
                        return m_encH2.Constructor();
                    })
                    .then(message => {
                        // console.log('7')
                        this.tablet = new w.Tablet();
                        return this.tablet.Constructor(intf, m_encH, m_encH2);
                    })
                    .then(message => {
                        // console.log('8')
                        intf = null;
                        return this.tablet.getInkThreshold();
                    })
                    .then(message => {
                        // console.log('9')
                        this.m_inkThreshold = message;
                        return this.tablet.getCapability();
                    })
                    .then(message => {
                        // console.log('10')
                        this.m_capability = message;
                        this.createModalWindow(this.m_capability.screenWidth, this.m_capability.screenHeight);
                        return this.tablet.getInformation();
                    })
                    .then(message => {
                        // console.log('11')
                        return this.tablet.getInkThreshold();
                    })
                    .then(message => {
                        // console.log('12')
                        return this.tablet.getProductId();
                    })
                    .then(message => {
                        // console.log('13')
                        return w.ProtocolHelper.simulateEncodingFlag(message, this.m_capability.encodingFlag);
                    })
                    .then(message => {
                        // console.log('14')
                        let encodingFlag = message;
                        if ((encodingFlag & p.EncodingFlag.EncodingFlag_24bit) != 0) {
                            return this.tablet.supportsWrite()
                            .then(message => {
                                this.m_encodingMode = message ? p.EncodingMode.EncodingMode_24bit_Bulk : p.EncodingMode.EncodingMode_24bit;
                            });
                        } else if ((encodingFlag & p.EncodingFlag.EncodingFlag_16bit) != 0) {
                            return this.tablet.supportsWrite()
                            .then(message => {
                                this.m_encodingMode = message ? p.EncodingMode.EncodingMode_16bit_Bulk : p.EncodingMode.EncodingMode_16bit;
                            });
                        } else { /*  assumes 1bit is available */
                            this.m_encodingMode = p.EncodingMode.EncodingMode_1bit;
                        }
                    })
                    .then(message => {
                        // console.log('15')
                        return this.tablet.isSupported(p.ReportId.ReportId_EncryptionStatus); /* v2 encryption */
                    })
                    .then(message => {
                        // console.log('16')
                        m_usingEncryption = message;
                        /* if the encryption script is missing turn off encryption regardless */
                        if (typeof window.sjcl == 'undefined') {
                            m_usingEncryption = false;
                        }
                        return this.tablet.getDHprime();
                    })
                    .then(dhPrime => {
                        // console.log('17')
                        return w.ProtocolHelper.supportsEncryption_DHprime(dhPrime); /* v1 encryption */
                    })
                    .then(message => {
                        // console.log('18')
                        m_usingEncryption = (message ? true : m_usingEncryption);
                        return this.tablet.setClearScreen();
                    })
                    .then(message => {
                        // console.log('19')
                        if (m_usingEncryption) {
                            return this.tablet.startCapture(0xc0ffee);
                        }
                        else {
                            return message;
                        }
                    })
                    .then(message => {
                        // console.log('20')
                        if (typeof m_encH2Impl.error !== 'undefined') {
                            throw new Error("Encryption failed, restarting demo");
                        }
                        return message;
                    })
                    .then(message => {
                        // console.log('21')
                        return this.tablet.isSupported(p.ReportId.ReportId_PenDataOptionMode);
                    })
                    .then(message => {
                        // console.log('21')
                        if (message) {
                            return this.tablet.getProductId()
                            .then(message => {
                                let penDataOptionMode = p.PenDataOptionMode.PenDataOptionMode_None;
                                switch (message) {
                                case w.ProductId.ProductId_520A:
                                    penDataOptionMode = p.PenDataOptionMode.PenDataOptionMode_TimeCount;
                                    break;
                                case w.ProductId.ProductId_430:
                                case w.ProductId.ProductId_530:
                                    penDataOptionMode = p.PenDataOptionMode.PenDataOptionMode_TimeCountSequence;
                                    break;
                                default:
                                    // console.log("Unknown this.tablet supporting PenDataOptionMode, setting to None.");
                                };
                                return this.tablet.setPenDataOptionMode(penDataOptionMode);
                            });
                        }
                        else {
                            this.m_encodingMode = p.EncodingMode.EncodingMode_1bit;
                            return this.m_encodingMode;
                        }
                    })
                    .then(message => {
                        this.addButtons();
                        let canvasImage = this.canvas.toDataURL("image/jpeg");
                        // console.log('22')
                        return w.ProtocolHelper.resizeAndFlatten
                            (
                            canvasImage,
                            0,
                            0,
                            0,
                            0,
                            this.m_capability.screenWidth,
                            this.m_capability.screenHeight,
                            this.m_encodingMode,
                            1,
                            false,
                            0,
                            true
                            );
                    })
                    .then(message => {
                        // console.log('23')
                        this.m_imgData = message;
                        return this.tablet.writeImage(this.m_encodingMode, message);
                    })
                    .then(message => {
                        // console.log('24')
                        if (m_encH2Impl.error) {
                            throw new Error("Encryption failed, restarting demo");
                        }
                        return message;
                    })
                    .then(message => {
                        // console.log('25')
                        return this.tablet.setInkingMode(p.InkingMode.InkingMode_On);
                    })
                    .then(message => {
                        // console.log('26')
                        var reportHandler = new w.ProtocolHelper.ReportHandler();
                        this.lastPoint = { "x": 0, "y": 0 };
                        this.isDown = false;
                        this.ctx.lineWidth = 1;
                        var penData = report => {
                            this.m_penData.push(report);
                            this.processButtons(report, this.canvas);
                            this.processPoint(report, this.canvas, this.ctx);
                        }
                        var penDataEncryptedOption = report => {
                            this.m_penData.push(report.penData[0], report.penData[1]);
                            this.processButtons(report.penData[0], this.canvas);
                            this.processPoint(report.penData[0], this.canvas, this.ctx);
                            this.processButtons(report.penData[1], this.canvas);
                            this.processPoint(report.penData[1], this.canvas, this.ctx);
                        }
                        var log = function (report) {
                            // console.log("report: " + JSON.stringify(report));
                        }
                        var decrypted = function (report) {
                            // console.log("decrypted: " + JSON.stringify(report));
                        }
                        this.m_penData = new Array();
                        reportHandler.onReportPenData = penData;
                        reportHandler.onReportPenDataOption = penData;
                        reportHandler.onReportPenDataTimeCountSequence = penData;
                        reportHandler.onReportPenDataEncrypted = penDataEncryptedOption;
                        reportHandler.onReportPenDataEncryptedOption = penDataEncryptedOption;
                        reportHandler.onReportPenDataTimeCountSequenceEncrypted = penData;
                        reportHandler.onReportDevicePublicKey = log;
                        reportHandler.onReportEncryptionStatus = log;
                        reportHandler.decrypt = decrypted;
                        return reportHandler.startReporting(this.tablet, true);
                    })
                    .fail(ex => {
                        if (ex instanceof DCANotReady) {
                            /* Device Control App not detected
                            Reinitialize and re-try */
                            w.Reinitialize();
                            setTimeout(this.tabletStart, 1000);
                        }
                        else {
                            /* Some other error - Inform the user and closedown */
                            this.$bvModal.msgBoxOk(ex.message, {
                                title: 'Error al procesar la Wacom',
                                size: 'sm',
                                buttonSize: 'sm',
                                okVariant: 'primary',
                                okTitle: 'Aceptar',
                            })
                            setTimeout(this.close(), 0);
                        }
                    });
            },
            /**
             * Validate the component from the parent
             */
            async validate() {
                await this.$validator.validateAll();
                return this.errors.all().length;
            },
        },
        props: [
            'isDisabled', /* If the form is disabled */
        ],
    }
</script>
<style>
    .button {
        position: absolute;
    }
    .fake-invalid-feedback {
        display: block;
        color: rgba(220, 53, 69, 1);
        font-size: 80%;
        width: 100%;
    }
    .modal-backdrop,
    #modal-background {
        height: 100%!important;
        left: 0!important;
        position: fixed!important;
        top: 0!important;
        width: 100%!important;
        z-index: 1000!important;
    }
    .thirdPartyLicenses {
        display: none;
        font-size: 8pt;
    }
    .modalOn {
        overflow: hidden;
        padding-left: 8px;
    }
    #modal-background {
        background: linear-gradient(180deg, rgba(250, 250, 250, 1) 0%, rgba(250, 250, 250, .5) 70%);
        display: none;
    }
    #modal-background.active,
    #signatureTitle.active,
    #signatureWindow.active {
        display: block;
    }
    #myCanvas {
        height: 100%;
        width: 100%;
    }
    #signatureBox {
        display: none;
    }
    #signatureDiv {
        position: relative;
        float:left;
        margin-right:15px;
    }
    #signatureImage {
        border: 2px dashed #cdcdcd;
        border-radius: 0.25rem;
        display: block;
        height: 200px;
        width: 300px;
    }
    #signatureImage.is-invalid {
        border-color: #dc3545;
        border-radius: 0.25rem;
    }
    #signatureTitle {
        display: none;
        color: rgba(0, 0, 0, .3);
        height: 100%;
        position: fixed;
        text-align: center;
        top: 0;
        transition: top 0.6s cubic-bezier(0.23, 1, 0.320, 1);
        width: 100%;
        z-index: 1000;
    }
    #signatureWindow {
        box-shadow: 0 0 5px 0 #222;
        -webkit-box-shadow: 0 0 5px 0 #222;
        -moz-box-shadow: 0 0 5px 0 #222;
        display: none;
        padding: 0;
        margin: 0 auto;
        position: absolute;
        transition: top 1s cubic-bezier(0.23, 1, 0.320, 1);
        z-index: 1000;
    }
    #signButton {
        margin-bottom: 10px;
        width: 300px;
    }
    #wgssSTU {
        height: 0;
        width: 0;
    }
</style>

