<template>
    <transition-group name="wizard-btns">
        <div
            v-if="tutorialOn"
            :id="'full-face-' + group"
            :key="0"
            @keydown.left="prevStep()"
            @keydown.esc="wizardStop()"
            @keydown.right="nextStep()">
            <b-button-close
                @click.stop="wizardStop()"></b-button-close>
        </div>
        <div
            :class="'wizard-launcher ' + (tutorialOn ? 'launched' : '')"
            :id="'btn-wizard-start-' + group"
            :key="1"
            @click.stop="!tutorialOn ? start() : ''">
            <!-- Tooltip out of its target because it needs to be conditionally rendered -->
            <b-tooltip
                boundary="window"
                noninteractive
                ref="btn_wizard_tooltip"
                v-if="!tutorialOn"
                :target="'btn-wizard-start-' + group">Ayuda</b-tooltip>
            <div class="wrp-wzdnav">
                <span
                    v-if="!tutorialOn"
                    :id="'wrp-wzdnav-icon-' + group">
                    <font-awesome-icon icon="question"/>
                </span>
                <span
                    v-if="tutorialOn"
                    :id="'wrp-wzdnav-btns-' + group">
                    <span
                        class="d-inline-block"
                        title="Anterior"
                        tabindex="0"
                        v-b-tooltip.hover.noninteractive>
                        <button
                            :class="actualStep > 0 ? 'btnnav-visible' : ''"
                            :disabled="actualStep == 0"
                            @click.stop="prevStep()">
                            <font-awesome-icon icon="chevron-left"/>
                        </button>
                    </span>
                    <button
                        title="Cerrar"
                        v-b-tooltip.hover.noninteractive
                        @click.stop="wizardStop(); tutorialOn = false">
                        <font-awesome-icon icon="times"/>
                    </button>
                    <button
                        v-b-tooltip.hover.noninteractive
                        :class="actualStep == (steps - 1) ? 'last' : ''"
                        :title="actualStep == (steps - 1) ? 'Finalizar' : 'Siguiente'"
                        @click.stop="nextStep()">
                        <font-awesome-icon
                            :icon="actualStep == (steps - 1) ? 'check' : 'chevron-right'"/>
                    </button>
                </span>
            </div>
        </div>
        <wizard-popup
            v-show="tutorialOn"
            ref="wzd-popup"
            :actualStep="actualStep"
            :group="group"
            :key="2"
            :shape="shape"
            :text="popupContent">
            <template #nav-bar>
                <div
                    :id="'wzd-step-info-' + group">
                    <b-row
                        :id="'wzd-step-wrp-btns-' + group">
                        <b-col>
                            Paso {{ actualStep + 1 }} de {{ steps }}
                        </b-col>
                        <b-col>
                            <b-row align-h="end">
                                <div>
                                    <span
                                        class="d-inline-block"
                                        tabindex="0"
                                        title="Anterior"
                                        v-b-tooltip.hover.noninteractive>
                                        <button
                                            id="prev-button"
                                            variant="outline-dark"
                                            :class="'wzd-step-btn ' + (actualStep > 0 ? 'btnnav-visible' : '')"
                                            :disabled="actualStep == 0"
                                            @click.stop="prevStep()">
                                            <font-awesome-icon icon="chevron-left"/>
                                        </button>
                                    </span>
                                    <button
                                        id="close-button"
                                        class="wzd-step-btn"
                                        title="Cerrar"
                                        variant="outline-warning"
                                        v-b-tooltip.hover.noninteractive
                                        @click.stop="wizardStop()">
                                        <font-awesome-icon icon="times"/>
                                    </button>
                                    <button
                                        id="next-button"
                                        v-b-tooltip.hover.noninteractive
                                        :class="'wzd-step-btn ' + (actualStep == (steps - 1) ? 'last' : '')"
                                        :title="actualStep == (steps - 1) ? 'Finalizar' : 'Siguiente'"
                                        :variant="actualStep == (steps - 1) ? '' : 'outline-dark'"
                                        @click.stop="nextStep()">
                                        <transition name="wizard-blur-in">
                                            <font-awesome-icon
                                                :key="0"
                                                v-if="actualStep == (steps - 1)"
                                                icon="check"/>
                                            <font-awesome-icon
                                                :key="1"
                                                v-else
                                                icon="chevron-right"/>
                                        </transition>
                                    </button>
                                </div>
                            </b-row>
                        </b-col>
                    </b-row>
                    <b-progress
                        height="12px"
                        variant="info"
                        :max="steps" >
                        <b-progress-bar
                            :id="'wzd-progress-bar-' + group"
                            :value="actualStep + 1"></b-progress-bar>
                    </b-progress>
                </div>
            </template>
        </wizard-popup>
        <!-- <wzd-popup v-if="tutorialOn"></wzd-popup> -->
    </transition-group>
</template>
<script>
import WizardPopup from "../components/WizardPopup";
import { createPopper } from '@popperjs/core';
export default {
    components: {
        'wizard-popup': WizardPopup,
    },
    data() {
        return {
            actualStep: 0,
            steps: 0,
            tutorialOn: false,
            wzdCtn: null,

            shape: null,
            disabEl: null,
            focusEl: null,
            fullEl: null,
            popupEl: null,
            rectElem: null,
            popupContent: null,
        }
    },
    props: [
        'group'
    ],
    methods: {

        start() {

            let actualElem = document.querySelector('[wizard-group="' + this.group + '"][wizard-step="' + this.actualStep + '"]');
            if (!this.tutorialOn) {
                window.addEventListener('resize', this.calculateFocusShape);
                window.addEventListener('scroll', this.calculateFocusShape);
            }
            this.tutorialOn = true;
            this.rectElem = actualElem.tagName == 'TABLE' ? actualElem.parentElement : actualElem;
            actualElem.classList.add('wizard-focused');
            this.shape = this.rectElem.getBoundingClientRect();

            if (document.getElementById('focus-face-' + this.group)) {
                this.focusEl = document.getElementById('focus-face-' + this.group);
            } else {
                this.focusEl = document.createElement('div');
                this.focusEl.id = 'focus-face-' + this.group;
                document.documentElement.appendChild(this.focusEl);
            }
            if (document.getElementById('disabled-face-' + this.group)) {
                this.disabEl = document.getElementById('disabled-face-' + this.group);
            } else {
                this.disabEl = document.createElement('div');
                this.disabEl.id = 'disabled-face-' + this.group;
                document.documentElement.appendChild(this.disabEl);
            }
            this.popupContent = document.createElement('div');
            this.popupContent.innerHTML = actualElem.getAttribute('wizard-text');
            // this.popupEl.appendChild(this.popupContent);
            const btns = document.getElementsByClassName('wzd-step-btn')
            // let tooltip = document.createElement('div');
            // tooltip.innerHTML = actualElem.getAttribute('wizard-text');
            createPopper(this.focusEl, this.popupContent, {
                placement: 'top',
            })

            // if (document.getElementById('wzd-popup-' + this.group)) {
            //     this.popupEl = document.getElementById('wzd-popup-' + this.group);
            // } else {
            //     this.popupEl = document.createElement('div');
            //     this.popupEl.id = 'wzd-popup-' + this.group;
            //     this.popupEl.className = 'wzd-popup';
            //     document.documentElement.appendChild(this.popupEl);
            // }

            // this.popupContent = document.createElement('div');
            // this.popupContent.innerHTML = actualElem.getAttribute('wizard-text');
            // this.popupEl.appendChild(this.popupContent);

            this.calculateFocusShape();
            console.log('start');

            this.$refs['wzd-popup'].show(this.group, this.shape);







            // let actualElem = document.querySelector('[wizard-group="' + this.group + '"][wizard-step="' + this.actualStep + '"]');
            // /* Select the element to extract the bounding. NOTE: The drawing of the focus element based on the bounds of the wizarded element can be disturbed by the bootstrap-vue elements added in some cases. In example, with the b-table element, it will be added a wrapper and the rects necessaries are from this wrapper. It occurs only with the table element, by now */
            // let rectElem = actualElem.tagName == 'TABLE' ? actualElem.parentElement : actualElem;
            // actualElem.classList.add('wizard-focused');
            // let shape = rectElem.getBoundingClientRect();
            // let focusEl = document.getElementById('focus-face-' + this.group);
            // /* Create an element that disabled the element wizarded positioning in front of it */
            // let disabEl = null;
            // if (!document.getElementById('disabled-face-' + this.group)) {
            //     disabEl = document.createElement('div');
            //     disabEl.id = 'disabled-face-' + this.group;
            //     document.documentElement.appendChild(disabEl);
            // } else {
            //     disabEl = document.getElementById('disabled-face-' + this.group)
            // }
            // disabEl.style.top = focusEl.style.top = shape.top + 'px';
            // disabEl.style.left = focusEl.style.left = shape.left + 'px';
            // disabEl.style.height = focusEl.style.height = shape.height + 'px';
            // disabEl.style.width = focusEl.style.width = shape.width + 'px';
            // /* This instruction complements the transition between steps preventing jumps */
            // setTimeout(() => { document.getElementById('wzd-content-' + this.group).innerHTML = actualElem.getAttribute('wizard-text') }, 150);
            // /* Assing to the popup the position */
            // this.wzdCtn.style.left = shape.left + 'px';
            // this.wzdCtn.style.top = shape.top + (shape.height + 18) + 'px';
            // let wzdShape = this.wzdCtn.getBoundingClientRect();
            // let arrow = document.getElementById('wzd-arrow-' + this.group);
            // /* If the sum of the vdr element and its width indicates will be positioned out of the clientWidth */
            // if (shape.left + wzdShape.width >= document.documentElement.clientWidth) {
            //     /* Recalculate the x position of the element */
            //     var auxLeft =  (shape.left - (((wzdShape.width + shape.left) - document.documentElement.clientWidth) + 10));
            //     this.wzdCtn.style.left = auxLeft + 'px';
            // } else {
            //     this.wzdCtn.style.left = shape.left + 'px';
            // }
            // arrow.style.transform = 'translate(' + (shape.left > auxLeft ? (shape.left - auxLeft) + (shape.width / 2) - 10 : 10) + 'px, -10px)';

            // if (shape.bottom + (wzdShape.height) >= (document.documentElement.clientHeight - 100)) {
            //     arrow.style.borderBottom = 0;
            //     arrow.style.borderTop = '10px solid rgba(255, 255, 255, .95)';
            // } else {
            //     arrow.style.borderBottom = '10px solid rgba(255, 255, 255, .95)';
            //     arrow.style.borderTop = 0;
            // }
        },
        calculateFocusShape() {
            this.shape = this.rectElem.getBoundingClientRect();
            this.disabEl.style.top = this.focusEl.style.top = this.shape.top + 'px';
            this.disabEl.style.left = this.focusEl.style.left = this.shape.left + 'px';
            this.disabEl.style.height = this.focusEl.style.height = this.shape.height + 'px';
            this.disabEl.style.width = this.focusEl.style.width = this.shape.width + 'px';
            // this.$refs['wzd-popup'].recalculatePosition((this.shape.left + 'px'), (this.shape.top + (this.shape.height + 18) + 'px'));

            // this.popupEl.style.left = this.shape.left + 'px';
            // this.popupEl.style.top = this.shape.top + (this.shape.height + 18) + 'px';
        },
        wizardStart() {
        },
        wizardStop() {

        },
        prevStep() {

        },
        nextStep() {

        }
    }
}
</script>
<style>
    /* Selectors are ordered from generic to specific and then alphabetical and its properties are in alphabetical order */
    .progress {
        border-radius: 0!important;
    }
    /* Class added with JS */
    .wizard-focused {
        position: relative;
        z-index: 100;
    }
    .wizard-launcher {
        background: linear-gradient(65deg, rgba(0, 131, 81, .95) 0, rgba(0, 50, 131, .95) 70%);
        background-position: 0;
        background-size: 300%;
        border-radius: 50%;
        bottom: 0;
        color: rgba(250,250,250,1);
        font-size: 30px;
        height: 50px;
        left: 30px;
        line-height: 50px;
        overflow: hidden;
        position: fixed;
        text-align: center;
        transform: translate(-10px,-10px);
        transition: all .3s;
        width: 50px;
        z-index: 999;
    }
    .wizard-launcher:hover:not(.launched) {
        background-position: 50%;
        transform: translate(-10px,-10px);
        transition: all .3s, background-position 1s;
    }
    .wizard-launcher.launched {
        border-radius: .25rem;
        width: 150px;
    }
    .wizard-launcher svg {
        transition: all .3s!important;
    }
    .wizard-launcher:hover:not(.launched) svg {
        transform: scale(1.1);
        transition: all .3s;
    }
    .wizard-launcher.launched button {
        opacity: 1;
    }
    .wizard-launcher.launched button:nth-child(1) {
        opacity: .2;
        transition: opacity .3s;
    }
    .wizard-launcher.launched button:nth-child(1).btnnav-visible {
        opacity: 1;
        transition: opacity .3s;
    }
    .wizard-launcher.launched .wrp-wzdnav {
        width: 150px;
    }
    .wrp-wzdnav {
        display: inline-block;
        height: 50px;
        width: 50px;
    }
    .wrp-wzdnav button,
    .wrp-wzdnav span[id^='wrp-wzdnav-icon'] {
        color: rgba(250, 250, 250, 1);
        font-size: 30px;
        height: 40px;
        line-height: 40px;
        width: 40px;
    }
    .wrp-wzdnav button {
        background: rgba(0, 50, 131, .6);
        background-position: 0;
        background-size: 300%;
        border: 0;
        border-radius: 50%;
        margin: 5px 0;
        opacity: 0
    }
    .wrp-wzdnav button:nth-child(2) {
        background: rgba(116, 131, 0, .6)
    }
    .wrp-wzdnav span[id^='wrp-wzdnav-icon'] {
        display: inline-block;
        margin: 5px 2px 5px 0; /* Correct the horizontal align */
    }
    .wrp-wzdnav svg {
        font-size: 30px;
    }
    /* Element to disable the elements behind it */
    [id^='disabled-face'] {
        background: rgba(0, 0, 0, .4);
        border-radius: .25rem;
        position: absolute;
        z-index: 1000;
    }
    /* Selectors and properties are in alphabetical order */
    [id^='focus-face'] {
        animation: wizard-relevance 1s infinite;
        border: 4px solid rgba(0, 131, 81, .7);
        border-radius: .25rem;
        filter: blur(0);
        opacity: 1;
        position: absolute;
        transition: all .35s .05s/* all .35s .05s */, height 0, opacity .03s, width 0;
        z-index: 999;
    }
    [id^='focus-face'].transitioning {
        filter: blur(4px);
        opacity: 0!important;
        transition: all .35s .05s/* all .35s .05s */, height 0, opacity .03s, width 0;
    }
    [id^='full-face'] {
        /* background: linear-gradient(to right, rgba(250, 250, 250, .4) 0, rgba(250, 250, 250, .7) 50%, rgba(250, 250, 250, .95) 100%); */
        background: linear-gradient(180deg, rgba(250, 250, 250, .5) 0%, rgba(250, 250, 250, 1) 70%);
        display: block;
        height: 100%;
        left: 0;
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 99;
    }
    [id^='full-face'] button.close {
        font-size: 45px;
    }
    [id^='wzd-progress-bar'] {
        background: linear-gradient(to right, rgba(0, 50, 131, .95) 0, rgba(0, 131, 81, .95) 50%);
        background-color: unset!important;
        box-shadow: 0px 2px 5px 0px rgba(255, 255, 255, .4) inset, 0px -2px 4px 0px rgba(0, 0, 0, .4) inset;
    }
    [id^='wzd-step-info'] {
        border-radius: 0 0 .25rem .25rem;
        bottom: 0;
        overflow: hidden;
        user-select: none;
        width: 100%;
    }
    [id^='wzd-step-wrp-btns'] {
        margin: 0;
        margin-bottom: 3px;
        vertical-align: middle;
    }
    [id^='wzd-step-wrp-btns'] button.last,
    .wrp-wzdnav button.last {
        background-color: rgba(0, 131, 81, 1);
    }
    [id^='wzd-step-wrp-btns'] .col:nth-child(1) {
        font-size: 13px!important;
        transform: translateY(5px); /* Alineation with the baseline of next buttons */
    }
    [id^='wzd-step-wrp-btns'] .col:nth-child(2) {
        margin-right: 10px;
    }
    [id^='wzd-step-wrp-btns'] .wzd-step-btn {
        background: rgba(0, 50, 131, .9);
        border: 0;
        border-radius: 50%;
        color: rgba(250, 250, 250, 1);
        cursor: pointer;
        font-size: 14px;
        height: 20px;
        /* line-height: 20px; */
        /* margin: 0 .1rem 0 0; */
        padding: 0;
        width: 20px;
    }
    [id^='wzd-step-wrp-btns'] .wzd-step-btn:nth-child(1) {
        opacity: .2;
    }
    [id^='wzd-step-wrp-btns'] .wzd-step-btn:nth-child(1).btnnav-visible {
        opacity: 1;
    }
    [id^='wzd-step-wrp-btns'] .wzd-step-btn:nth-child(2) {
        background: rgba(116, 131, 0, .9)
    }
    [id^='wzd-step-wrp-btns'] .wzd-step-btn svg {
        margin: 0 auto;
        padding: 0;
    }
    [id^='wzd-arrow-'] {
        border-bottom: 10px solid rgba(255, 255, 255, .95);
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        height: 0;
        transform: translate(10px, -10px);
        /* transition: transform .5s; */
        width: 0;
    }
    .wzd-popup {
        background-color: rgba(255, 255, 255, .95);
        border-radius: .25rem;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, .4);
        height: auto!important;
        line-height: 1.5;
        margin-right: 15px;
        max-width: 350px!important;
        min-height: 75px!important;
        min-width: 250px!important;
        /* opacity: 0; */
        padding: 1rem;
        position: absolute;
        user-select: none;
        width: auto!important;
        z-index: 9999!important;
    }

    [id^='wzd-container-'] {
        background-color: rgba(255, 255, 255, .95);
        border-radius: .25rem;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, .4);
        height: auto!important;
        margin-right: 15px;
        max-width: 350px!important;
        min-height: 75px!important;
        min-width: 250px!important;
        /* opacity: 0; */
        position: absolute;
        user-select: none;
        width: auto!important;
        z-index: 9999!important;
    }
    [id^='wzd-container-'] {
        cursor: grab;
    }
    [id^='wzd-container-']:active {
        cursor: grabbing;
    }
    [id^='wzd-container-'].move {
        opacity: 1;
        transition: box-shadow .3s, filter .1s, height .3s, opacity .15s, width .3s;
    }
    [id^='wzd-container-'].transitioning {
        filter: blur(4px);
        opacity: .05!important;
        transition: height .3s, left .5s, opacity .15s, top .5s, filter .1s, width .3s;
    }
    [id^='wzd-content'] {
        padding: 1rem;
    }
    /* Animations */
    @keyframes wizard-relevance {
        0% {
            box-shadow: 0 0 0 0 rgba(0, 131, 81, .1);
        }
        50% {
            box-shadow: 0 0 0 .4rem rgba(0, 131, 81, .7);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(0, 133, 82, .1);
        }
    }
</style>
