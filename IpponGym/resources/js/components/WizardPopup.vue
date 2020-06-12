<template>
    <transition name="wizard-blur-in">
        <div
            :class="{ 'move' : mtd }"
            :id="'wzd-container-' + group">
            <!-- <div
                :id="'wzd-arrow-' + group"></div> -->
            <div
                :id="'wzd-content-' + group">
                {{ text }}
            </div>
            <slot name="nav-bar"></slot>
        </div>
    </transition>
</template>
<script>
export default {
    data() {
        return {
            // actualStep: 0, /* Current element based on the steps passed */
            mtd: false, /* Flag used to add a class to the popup element when it's mounted */
            steps: 0, /* Number of messages showed to the user */
            tutorialOn: false, /* Flag used to show html elements conditionally */

            wzdCtn: null,
            pos1: 0,
            pos2: 0,
            pos3: 0,
            pos4: 0,

            auxTop: 0,
        }
    },
    props: [
        'actualStep',
        'group',
        'shape',
        'text',
    ],
    methods: {
        show(group,shape) {
            document.querySelectorAll('[wizard-group="' + this.group + '"]').forEach(el => el.getAttribute('wizard-step') > this.steps && (this.steps = el.getAttribute('wizard-step')));

            let actualElem = document.querySelector('[wizard-group="' + this.group + '"][wizard-step="' + this.actualStep + '"]');
            this.wzdCtn = document.getElementById('wzd-container-' + this.group);
            setTimeout(() => { document.getElementById('wzd-content-' + this.group).innerHTML = actualElem.getAttribute('wizard-text') }, 150);
            this.wzdCtn.style.left = shape.left + 'px';
            this.wzdCtn.style.top = shape.top + (shape.height + 18) + 'px';
            console.log('popupstart')
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
        border-radius: .25rem;
        position: absolute;
        z-index: 9999;
    }
    /* Selectors and properties are in alphabetical order */
    [id^='focus-face'] {
        animation: wizard-relevance 1s infinite;
        /* border: 1px solid rgba(0, 131, 81, .7); */
        border-radius: .25rem;
        filter: blur(0);
        opacity: 1;
        position: relative;
        transition: all .35s .05s/* all .35s .05s */, height 0, opacity .03s, width 0;
        /* z-index: 999; */
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
    [id^='wzd-container-'] {
        background-color: rgba(255, 255, 255, .95);
        border-radius: .25rem;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, .4);
        height: auto!important;
        margin-right: 15px;
        max-width: 350px!important;
        min-height: 75px!important;
        min-width: 250px!important;
        opacity: 1;
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
