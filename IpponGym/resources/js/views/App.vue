<template>
    <div id="wrapper">
    <!-- News modal -->
        <b-modal
            class="nav-modals"
            button-size="sm"
            hide-backdrop
            hide-footer
            id="welcome-home-modal"
            modal-class="ig-custom-modal"
            no-close-on-backdrop
            ref="mdl-welcome-home"
            show
            scrollable
            v-if="isLoggedIn && (authenticatedRole == 'tester' || authenticatedRole == 'root') && $route.name != '404' && $route.name != 'wiki'"
            @hidden="$manageScrollBar()"
            @close="unwantNews()"
            @show="$manageScrollBar">
            <template
                #modal-title>
                <h1>Novedades y actualización de errores</h1>
            </template>
            <News></News>
        </b-modal>
         <div
            class="mb-2"
            id="main-container"
            ref="container">
            <NavBar
                v-if="$route.name != 'home' && $route.name != '404' && $route.name != 'wiki' && $route.name != 'maintenance'"></NavBar>
            <transition appear mode="out-in" name="fade">
                <router-view></router-view>
            </transition>
            <transition appear mode="out-in" name="launcher-appear">
                <DocLauncher
                    v-if="isLoggedIn && $route.name != '404' && $route.name != 'wiki' && $route.name != 'maintenance'"></DocLauncher>
            </transition>
         </div>

        <!-- On the home or 404 page don't show the navbar and the behaviour inherit by the ref or main-container id cannot be applied -->
        <!-- <div
            v-if="$route.name == 'home'  || $route.name == '404'">
            <transition appear mode="out-in" name="fade">
                <router-view></router-view>
            </transition>
            <transition appear mode="out-in" name="launcher-appear">
                <DocLauncher
                    v-if="isLoggedIn && $route.name != '404' && $route.name != 'wiki'"></DocLauncher>
            </transition>
        </div> -->
        <!-- The ref allows to the bottomAlert plugin to work properly -->
        <!-- <div
            class="mb-2"
            id="main-container"
            ref="container"
            v-if="$route.name != 'home' && $route.name != '404'">
            <NavBar
                v-if="$route.name != 'home' && $route.name != '404' && $route.name != 'wiki' && $route.name != 'maintenance'"></NavBar>
            <transition appear mode="out-in" name="fade">
                <router-view></router-view>
            </transition>
            <transition appear name="launcher-appear">
                <DocLauncher
                    v-if="$route.name != '404' && $route.name != 'wiki' && $route.name != 'maintenance'"></DocLauncher>
            </transition> -->
    <!-- News launcher -->
            <transition appear name="launcher-appear">
                <b-button
                    id="tester-news"
                    title="Novedades"
                    v-b-tooltip.hover.right.noninteractive
                    v-if="isLoggedIn && ($route.name != '404' && $route.name != 'wiki' && $route.name != 'maintenance')"
                    @click="$bvModal.show('welcome-home-modal')">
                    <fa-icon icon="newspaper"></fa-icon>
                    <b-badge
                        class="btn-alert-badge"
                        variant="danger"
                        v-if="showNewsBadge">!</b-badge>
                </b-button>
            </transition>
    <!-- Scroll top button -->
            <transition appear name="wzd-launcher-appear">
                <div
                    id="to-top"
                    v-if="scrollToTop"
                    @click="$scrollTo('html')">
                    <fa-icon icon="arrow-up"></fa-icon>
                </div>
            </transition>
            <!-- <loading v-if="$root.isLoading == true"></loading> -->
        </div>
    </div>
</template>
<script>
    import addBottomAlert from '../mixins/addBottomAlert.vue';
    import axios from 'axios';
    import DocLauncher from '../components/userdocassets/DocLauncher';
    import { http } from "../utils/http";
    import { mapActions, mapGetters, mapState } from 'vuex';
    export default {
        data() {
            return {
                scrollToTop: false,
                showNewsBadge: true,
                wantNews: false,
            }
        },
        components: {
            'DocLauncher': DocLauncher,
        },
        computed: {
            ...mapGetters('auth', ['isLoggedIn', 'authenticatedRole', 'authenticatedUser']),
        },
        created() {
            window.addEventListener('scroll', this.evaluateToTop);
            /* Listen to the storage changes */
            window.addEventListener('storage', this.actionReceived);
            /* Prevents leave the page when changes has been made */
            window.addEventListener('beforeunload', this.beforeUnload);
        },
        destroyed() {
            /* Destroy de listeners */
            window.removeEventListener('scroll', this.evaluateToTop);
            window.removeEventListener('storage', this.actionReceived);
            window.removeEventListener('beforeunload', this.beforeUnload);
        },
        methods: {
            ...mapActions(['setCustomerEdited']),
            /**
             * Manages the localStarge changes to react on them on the diferent app pages to reload the customers data modified on other local tabs/windows
             *
             * @param {Object} ev: is the event stored on the localStorage, contains ev.newValue that is the id which identifies the customer updated
             */
            actionReceived(ev) {
                const data = ev.newValue;
                const store = this.$store.state;
                /* Ignore empty value or value reset */
                if (!data) {
                    return;
                }
                // console.log('receiving ->' + data)
                if (ev.key == 'customer_updated') {
                    this.setCustomerEdited(data);
                    /* Algorithm
                        Are using the editform state and the id is used as a customer, tutor or contact
                        Are using the form and the id is used a tutor or contact
                        Are out of the form states and the home, 404 and wiki pages
                     */
                    if (((this.$route.name == 'customers.edit' || this.$route.name == 'customers.profile') && data == store.editform._id) || ((this.$route.name == 'customers.edit' || this.$route.name == 'customers.profile') && store.editform.tutor && data == store.editform.tutor._id) || ((this.$route.name == 'customers.edit' || this.$route.name == 'customers.profile') && store.editform.contacts && store.editform.contacts.length > 0 && data == store.editform.contacts.filter(contact => contact._id == data).length > 0) || (this.$route.name == 'customers.new' && store.form.tutor && data == store.form.tutor._id) || (this.$route.name == 'customers.new' && store.form.contacts && store.form.contacts.length > 0 && store.form.contacts.filter(contact => contact._id == data).length > 0) || (!['customers.edit', 'customers.new', 'customers.profile', 'wiki', '404', 'home'].includes(this.$route.name))) {
                        /* Reload the specific customer */
                        /* Call to the mixin function to show an alert */
                        this.addBottomAlert('Se han producido cambios en los datos y se han cargado correctamente a esta página.');
                    }
                }
            },
            /**
             * Determines if the to-top element has to be shown based on the amount of the scroll is bigger than 600 or if its smaller and the scroll is on the bottom of the page
             *
             * @returns {Boolean} With the result of these evaluations as flag to show the helper button
             */
            evaluateToTop() {
                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                this.scrollToTop = currentScroll > 600 || (window.innerHeight < document.documentElement.scrollHeight && ((window.pageYOffset + window.innerHeight) == document.documentElement.scrollHeight));
            },
            /**
             * Function executed when the welcome modal is closed to disable this shown on future logins or page changing
             */
            unwantNews() {
                this.showNewsBadge = false
                http.post('/api/unwantNews', { username: this.authenticatedUser });
            }
        },
        mixins: [
            addBottomAlert
        ],
        mounted() {
            /* If a user is logged in check if is mandatory to show the news modal */
            if (this.isLoggedIn) {
                http.get('api/showNews', { params: { username: this.authenticatedUser } })
                    .then(response => {
                        /* Will be a boolean */
                        this.wantNews =  response.data;
                        /* If the modal is needed to be show, show it */
                        if (this.wantNews) {
                            setTimeout(() => {
                                this.$bvModal.show('welcome-home-modal');
                            }, 3000);
                        }
                    });
            }
        },
    }
</script>
<style lang="scss">
    @import url('../../sass/custom.scss'); /* No funsiona! */
    @font-face {
        font-family: 'myriad';
        src: url('../../fonts/Myriad_Pro_Bold_Condensed_Italic.ttf') format('truetype');
    }
    $ig-font: 'myriad';
    $font-family-sans-serif:      $ig-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    $font-family-base:            $font-family-sans-serif;

    $green:     #008351;
    $dangning:  #833000;

    @import "~bootstrap/scss/bootstrap.scss";
    @import '~bootstrap-vue/src/index.scss';
</style>
<style>
    @font-face {
        font-family: 'myriad';
        src: url('../../fonts/Myriad_Pro_Bold_Condensed_Italic.ttf') format('truetype');
    }
    @import url('../../css/custom_variants.css');
    @import url('../../css/transitions.css');
    @import url('../../css/styles.css');

    .btn-alert-badge {
        left: -5px!important;
        position: absolute!important;
        top: -10px!important;
        transition: .3s ease;
    }
    #main-container {
        margin: 0 auto;
        max-width: 90%;
        width: 90%!important;
    }
    #tester-news {
        background: rgba(0, 131, 81, 1);
        border: rgba(0, 131, 81, 1);
        bottom: 55px;
        box-shadow: 0 0 3px rgba(0, 0, 0, .5);
        font-size: 17px;
        height: 30px;
        left: .5rem;
        line-height: 30px;
        opacity: .4;
        /* overflow: hidden; */
        padding: 0;
        position: fixed;
        text-align: center;
        /* top: 20px; */
        transform: scale(0.98);
        transition: all .3s;
        width: 30px;
        z-index: 1040;
    }
    #tester-news:hover {
        opacity: 1;
        transform: scale(1);
    }
    #tester-news:hover .btn-alert-badge  {
        left: -6px!important;
        top: -11px!important;
    }
    #to-top {
        background: linear-gradient(65deg, rgba(0, 50, 131, .95) 0, rgba(0, 131, 81, .95) 70%);
        background-position: 0;
        background-size: 150%;
        border-radius: 50%;
        bottom: 80px;
        box-shadow: 0 0 3px rgba(0,0,0,.5);
        color: rgba(250, 250, 250, 1);
        cursor: pointer;
        font-size: 20px;
        height: 30px;
        line-height: 30px;
        opacity: .7;
        overflow: hidden;
        position: fixed;
        right: 15px;
        text-align: center;
        transition: all .3s, background-position 1s;
        width: 30px;
        z-index: 1000;
    }
    #to-top:hover {
        background-position: 100%;
        opacity: 1;
    }
    #to-top svg {
        transition: .25s;
    }
    #to-top:hover svg {
        transform: translateY(-1px);
    }
    #welcome-home-modal___BV_modal_outer_ {
        z-index: 1100!important;  /* In front of everything, nothing overlays it */
    }
    #welcome-home-modal.ig-custom-modal .modal-content {
        background: linear-gradient(-25deg, rgba(250, 250, 250, .8) 0%, rgba(255, 255, 224, 1) 70%)!important;
    }
    #welcome-home-modal.ig-custom-modal .modal-header {
        padding: 1rem 1rem 1rem 3rem!important;
    }
</style>

