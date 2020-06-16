<template>
    <span>
        <div
            id="wzd-full-disable-face"
            v-if="wizardLaunched">
                <b-button-close
                    @click="stop()"></b-button-close>
        </div>
        <transition name="wizard-blur-in">
            <!-- Overlay showed when the wizard has been started -->
            <div
                id="wzd-full-face"
                v-if="wizardLaunched">
            </div>
        </transition>
        <!-- Progress bar at the bottom of the window -->
        <transition name="wizard-blur-in">
            <b-progress
                height="3px"
                id="wrp-wzd-progress-bar"
                key="wrp-wzd-progress-bar"
                variant="info"
                :max="totalSteps"
                v-if="wizardLaunched">
                <b-progress-bar
                    id="wzd-progress-bar"
                    :value="currentStep + 1"></b-progress-bar>
            </b-progress>
        </transition>
        <!-- Button launcher always visible on the parent -->
        <div
            id="wzd-btn-start"
            :class="'wzd-launcher' + (wizardLaunched ? ' launched' : '')"
            @click="start()">
            <!-- @click="$tours[wizardName].start()"> -->
            <!-- Tooltip out of its target because it needs to be conditionally rendered -->
            <b-tooltip
                boundary="window"
                noninteractive
                target="wzd-btn-start"
                v-if="!wizardLaunched">Ayuda</b-tooltip>
            <span id="wrp-wzdnav-icon">
                <fa-icon icon="question"></fa-icon>
            </span>
        </div>
        <transition name="wizard-blur-in">
            <div
                role="tooltip"
                class="wzd-step"
                v-if="wizardLaunched"
                :id="'wzd-step-' + wizardName + '-' + currentStep"
                :ref="'wzd-step-' + wizardName + '-' + currentStep">
                <h3 class="wzd-subtitle">
                    {{ steps[currentStep].title }}
                </h3>
                <div class="wzd-step-content">
                    {{ steps[currentStep].content }}
                </div>
                <!-- Navigation on the current step tooltip -->
                <div class="wrp-wzd-nav">
                    <button
                        class="wzd-nav"
                        @click.prevent="first ? stop() : previousStep()">
                        <!-- @click.prevent="tour.isFirst ? (tour.skip(), stop()) : (tour.previousStep(), previousStep(tour))"> -->
                        <fa-icon icon="chevron-left"></fa-icon>
                    </button>
                    <button
                        class="wzd-nav"
                        @click.prevent="stop()">
                        <!-- @click.prevent="stop(tour)"> -->
                        <fa-icon icon="times"></fa-icon>
                    </button>
                    <button
                        class="wzd-nav"
                        @click.prevent="last ? stop() : nextStep()">
                        <!-- @click.prevent="tour.isLast ? (tour.finish(), stop()) : (tour.nextStep(), nextStep(tour))"> -->
                        <fa-icon
                            :icon="last ? 'check' : 'chevron-right'"></fa-icon>
                            <!-- :icon="tour.isLast ? 'check' : 'chevron-right'"></fa-icon> -->
                    </button>
                </div>
                <div class="step-arrow"></div>
            </div>
        </transition>
    </span>
</template>
<script>
    import jump from 'jump.js';
    import Popper from 'popper.js';
    export default {
        data() {
            return {
                currentEl: null, /* Element wizarded */
                currentStep: 0, /* The actual step */
                wizardName: null, /* Name of the wizard passed from the parent at name */
                wizardLaunched: false, /* Flag to determine if the wizard has been launched */
                wzdCallbacks: {
                    onStart: this.start,
                }, /* Callbacks to the vue-tour */
                wzdOptions: {
                    useKeyboardNavigation: true,
                }, /* Options to the vue-tour */
            }
        },
        computed: {
            first() {
                return this.currentStep == 0;
            },
            last() {
                return this.steps.length + 1 == this.currentStep;
            },
            totalSteps() {
                return this.steps.length + 1;
            },
        },
        mounted() {
            /* Assigning the prop to a local variable */
            this.$nextTick().then(() => this.wizardName = this.name );
        },
        props: [
            'name', /* String with the name of the wizard started */
            'steps', /* Array of the steps for vue-tour */
        ],
        methods: {
            /**
             * Function to manage specifically the behaviour on navbars wizardeds
             */
            manageNav() {
                /* If the step is on a navbar mantain the nav fixed and move the padding to top to correct the position of the v-step element */
                if (this.currentEl.classList.contains('navbar')) {
                    this.currentEl.style.position = 'fixed';
                    !document.body.classList.contains('nav-wzd') && document.body.classList.add('nav-wzd');
                } else {
                    document.body.classList.contains('nav-wzd') && document.body.classList.remove('nav-wzd');
                }
            },
            /**
             * Function to acquire the next step element for the vue-tour and to manage the custom class to the next/previous wizarded element that will be change its z-index to show it above the full overlay
             */
            nextStep() {
                this.currentStep++;
                this.currentEl.classList.remove('wizard-focused');
                this.currentEl = document.querySelector('[data-v-step="' + this.wizardName + '-' + (this.currentStep) + '"]');
                this.currentEl.classList.add('wizard-focused');
                jump(this.currentEl, {
                    offset: -135
                });
                this.manageNav();
            },
            /**
             * Function to acquire the previous step element for the vue-tour and to manage the custom class to the next/previous wizarded element that will be change its z-index to show it above the full overlay
             */
            previousStep() {
                this.currentStep--;
                this.currentEl.classList.remove('wizard-focused');
                this.currentEl = document.querySelector('[data-v-step="' + this.wizardName + '-' + (this.currentStep) + '"]');
                this.currentEl.classList.add('wizard-focused');
                jump(this.currentEl, {
                    offset: -135
                });
                this.manageNav();
            },
            /**
             * Function that launchs the wizard
             */
            start() {
                this.wizardLaunched = true;
                this.$nextTick(() => {
                    this.currentEl = document.querySelector('[data-v-step="' + this.wizardName + '-' + 0 + '"]');
                    this.currentEl.classList.add('wizard-focused');
                    jump(this.currentEl, {
                        offset: -135
                    });
                    new Popper(this.currentEl, this.$refs['wzd-step-' + this.wizardName + '-' + 0], this.steps[0].params);
                    this.manageNav();
                });
            },
            /**
             * Stops the wizard
             */
            stop() {
                /* Delaying the time of the rest of the transition to avoid unesthetic z-index change */
                setTimeout(() => {
                    this.currentEl.classList.remove('wizard-focused');
                    this.currentEl = null;
                }, 1000)
                this.wizardLaunched = false;
                this.currentStep = 0;
                // this.wizardName = null;
                document.body.classList.contains('nav-wzd') && document.body.classList.remove('nav-wzd');
                // this.$tours[this.wizardName].stop();
            },
        },
    }
</script>
<style>
    .v-step .step-arrow,
    .v-step .step-arrow[data-v-7c9c03f0] {
        border-color: rgba(255, 255, 255, .95);
    }
    .v-step__content {
        padding: 1rem 1rem 0 1rem!important;
        text-align: left;
    }
    /* Class added with JS to the wizarded element */
    .wizard-focused {
        position: relative;
        z-index: 1001!important;
    }
</style>
<style scoped>
    .wzd-step {
        background-color: rgba(255, 255, 255, .95);
        border-radius: .25rem;
        /* bottom: 2rem; */
        color: rgba(90, 90, 90, 1);
        filter: drop-shadow(0 0 3px rgba(0, 0, 0, .5));
        /* height: auto; */
        /* left: 50%; */
        max-width: calc(100vw - 60%);
        padding: 0;
        /* position: fixed; */
        /* transform: translateX(-50%); */
        z-index: 1050;
    }
    .wzd-step-content {
        padding: 1rem;
    }
    .wzd-subtitle {
        color: rgba(0, 0, 0, .2);
        font-size: calc(22px + (25 - 22) * ((100vw - 300px) / (1600 - 300)));
        letter-spacing: -.04em;
        margin: 0;
        padding: .5rem 1rem 0;
    }
    .wzd-step[data-popper-placement^='top'] > #arrow {
        bottom: -4px;
    }
    .wzd-step[data-popper-placement^='bottom'] > #arrow {
        top: -4px;
    }
    .wzd-step[data-popper-placement^='left'] > #arrow {
        right: -4px;
    }
    .wzd-step[data-popper-placement^='right'] > #arrow {
        left: -4px;
    }
    .wzd-step .step-arrow {
        width: 0;
        height: 0;
        border-style: solid;
        position: absolute;
        margin: 0.5rem;
    }
    .wzd-step .step-arrow {
        border-color: rgba(255, 255, 255, .95);
    }
    .wzd-step[x-placement^="top"] {
        margin-bottom: 0.5rem;
    }
    .wzd-step[x-placement^="top"] .step-arrow {
        border-width: 0.5rem 0.5rem 0 0.5rem;
        border-left-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        bottom: -0.5rem;
        left: calc(50% - 1rem);
        margin-top: 0;
        margin-bottom: 0;
    }
    .wzd-step[x-placement^="bottom"] {
        margin-top: 0.5rem;
    }
    .wzd-step[x-placement^="bottom"] .step-arrow {
        border-width: 0 0.5rem 0.5rem 0.5rem;
        border-left-color: transparent;
        border-right-color: transparent;
        border-top-color: transparent;
        top: -0.5rem;
        left: calc(50% - 1rem);
        margin-top: 0;
        margin-bottom: 0;
    }
    .wzd-step[x-placement^="right"] {
        margin-left: 0.5rem;
    }
    .wzd-step[x-placement^="right"] .step-arrow {
        border-width: 0.5rem 0.5rem 0.5rem 0;
        border-left-color: transparent;
        border-top-color: transparent;
        border-bottom-color: transparent;
        left: -0.5rem;
        top: calc(50% - 1rem);
        margin-left: 0;
        margin-right: 0;
    }
    .wzd-step[x-placement^="left"] {
        margin-right: 0.5rem;
    }
    .wzd-step[x-placement^="left"] .step-arrow {
        border-width: 0.5rem 0 0.5rem 0.5rem;
        border-top-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        right: -0.5rem;
        top: calc(50% - 1rem);
        margin-left: 0;
        margin-right: 0;
    }



    .v-step {
        background-color: rgba(255, 255, 255, .95);
        border-radius: .25rem;
        color: rgba(90, 90, 90, 1);
        filter: drop-shadow(0 0 3px rgba(0, 0, 0, .5));
        padding: 0;
    }
    .wrp-wzd-nav {
        display: flex;
        flex-direction: row;
        margin-bottom: 7px;
    }
    .wzd-launcher {
        /* background: linear-gradient(217deg, rgba(0, 131, 81,1), rgba(0, 131, 81,0) 70.71%), linear-gradient(127deg, rgba(15, 0, 131,1), rgba(15, 0, 131,0) 70.71%), linear-gradient(336deg, rgba(131, 0, 50,1), rgba(131, 0, 50,0) 70.71%); */
        background: linear-gradient(65deg, rgba(0, 131, 81, .95) 0, rgba(0, 50, 131, .95) 70%);
        background-position: 0;
        background-size: 100%;
        border-radius: 50%;
        bottom: 0;
        box-shadow: 0 0 3px rgba(0,0,0,.5);
        color: rgba(250,250,250,1);
        font-size: 30px;
        height: 50px;
        left: 30px;
        line-height: 50px;
        opacity: .7;
        overflow: hidden;
        position: fixed;
        text-align: center;
        transform: translate(-10px,-10px);
        transition: all .3s, background-position 1s;
        width: 50px;
        z-index: 1000;
    }
    .wzd-launcher:hover:not(.launched) {
        animation: semiRotate .3s forwards;
        background-position: 100%;
        opacity: 1;
        transform: translate(-10px,-10px) scale(1.02);
    }
    .wzd-nav {
        background-size: 600%;
        color: rgba(250, 250, 250, 1);
        border: 0;
        /* border-radius: 50%; */
        -webkit-flex: 1 1 auto;
        flex: 1 1 auto;
        font-size: 20px;
        height: 25px;
        line-height: 25px;
        transition: all .3s, background-position 1s;
        /* width: 40px; */
    }
    .wzd-nav:nth-child(1) {
        background: linear-gradient(65deg, rgba(0, 50, 131, .95) 1%, rgba(0, 131, 81, .95) 10%);
        background-position: 0%;
        background-size: 1000%;
    }
    .wzd-nav:nth-child(1):hover {
        background-position-x: 15%;
    }
    .wzd-nav:nth-child(2) {
        background: rgba(0, 131, 81, .95);
    }
    .wzd-nav:nth-child(2) svg {
        transition: transform .3s;
    }
    .wzd-nav:nth-child(2):hover svg {
        transform: scale(1.3);
    }
    .wzd-nav:nth-child(3) {
        background: linear-gradient(65deg, rgba(0, 131, 81, .95) 50%, rgba(0, 50, 131, .95) 59%);
        background-size: 1000%;
        background-position: 55%;
    }
    .wzd-nav:nth-child(3):hover {
        background-position-x: 40%;
    }
    #wrp-wzd-progress-bar {
        background-color: unset!important;
        border-radius: 0;
        bottom: 0;
        left: 0;
        position: fixed;
        width: 100%;
        z-index: 1001;
    }
    #wrp-wzdnav-icon {
        color: rgba(250, 250, 250, 1);
        font-size: 30px;
        height: 40px;
        line-height: 40px;
        width: 40px;
    }
    #wzd-full-disable-face {
        display: block;
        height: 100%;
        left: 0;
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 1002;
    }
    #wzd-full-face {
        /* background: linear-gradient(to right, rgba(250, 250, 250, .4) 0, rgba(250, 250, 250, .7) 50%, rgba(250, 250, 250, .95) 100%); */
        background: linear-gradient(180deg, rgba(250, 250, 250, .7) 0%, rgba(250, 250, 250, 1) 70%);
        display: block;
        height: 100%;
        left: 0;
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 1000;
    }
    #wzd-full-disable-face button.close {
        font-size: 45px;
        padding: 1rem 2rem;
    }
    #wzd-progress-bar {
        background: linear-gradient(to right, rgba(0, 50, 131, .95) 0, rgba(0, 131, 81, .95) 50%);
        border-radius: 0!important;
    }
    @keyframes semiRotate {
        0% {
            transform: translate(-10px,-10px) scale(1.02) rotate(0deg);
        }
        20% {
            transform: translate(-10px,-10px) scale(1.02) rotate(-15deg);
        }
        40% {
            transform: translate(-10px,-10px) scale(1.02) rotate(15deg);
        }
        60% {
            transform: translate(-10px,-10px) scale(1.02) rotate(-10deg);
        }
        80% {
            transform: translate(-10px,-10px) scale(1.02) rotate(5deg);
        }
        100% {
            transform: translate(-10px,-10px) scale(1.02) rotate(0deg);
        }
    }
</style>
