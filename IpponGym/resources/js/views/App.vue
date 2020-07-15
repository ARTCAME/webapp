<template>
    <div id="wrapper">
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
            @hidden="$manageScrollBar; unwantNews()"
            @show="$manageScrollBar">
            <template
                #modal-title>
                <h1>Novedades y actualización de errores</h1>
            </template>
            <News></News>
        </b-modal>
        <!-- On the home or 404 page don't show the navbar and the behaviour inherit by the ref or main-container id cannot be applied -->
        <div
            v-if="$route.name == 'home'  || $route.name == '404'">
            <transition appear mode="out-in" name="fade">
                <router-view></router-view>
            </transition>
            <transition appear mode="out-in" name="fade">
                <DocLauncher
                    v-if="isLoggedIn && $route.name != '404' && $route.name != 'wiki'"></DocLauncher>
            </transition>
        </div>
        <!-- The ref allows to the bottomAlert plugin to work properly -->
        <div
            class="mb-2"
            id="main-container"
            ref="container"
            v-if="$route.name != 'home' && $route.name != '404'">
            <NavBar
                v-if="$route.name != 'home' && $route.name != '404' && $route.name != 'wiki'"></NavBar>
            <!-- <navigation-bar-component v-if="this.$route.name != 'home' && this.$route.name != '404'"></navigation-bar-component> -->
            <transition appear mode="out-in" name="fade">
                <router-view></router-view>
            </transition>
            <transition appear mode="out-in" name="fade">
                <DocLauncher
                    v-if="$route.name != '404' && $route.name != 'wiki'"></DocLauncher>
                    <!-- v-if="$route.name != 'home' && $route.name != '404' && $route.name != 'wiki'"></DocLauncher> -->
            </transition>
            <b-button
                id="tester-news"
                title="Mostrar novedades"
                @click="$bvModal.show('welcome-home-modal')">
                <fa-icon icon="newspaper"></fa-icon>
            </b-button>
            <!-- <loading v-if="$root.isLoading == true"></loading> -->
        </div>
    </div>
</template>
<script>
    import addBottomAlert from '../mixins/addBottomAlert.vue';
    import axios from 'axios';
    import DocLauncher from '../components/userdocassets/Launcher';
    import { http } from "../utils/http";
    import { mapActions, mapGetters, mapState } from 'vuex';
    export default {
        data() {
            return {
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
            /* Listen to the storage changes */
            window.addEventListener('storage', this.actionReceived);
            /* Prevents leave the page when changes has been made */
            window.addEventListener('beforeunload', this.beforeUnload);
        },
        destroyed() {
            /* Destroy de listeners */
            window.removeEventListener('storage', this.actionReceived);
            window.removeEventListener('beforeunload', this.beforeUnload);
        },
        methods: {
            ...mapActions(['fetchCustomersEdited']),
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
                console.log('receiving ->' + data)
                if (ev.key == 'customer_updated') {
                    this.fetchCustomersEdited(data);
                    /* Algorithm
                        Are using the editform state and the id is used as a customer, tutor or contact
                        Are using the form and the id is used a tutor or contact
                        Are out of the form states
                     */
                    if (((this.$route.name == 'customers.edit' || this.$route.name == 'customers.profile') && data == store.editform._id) || ((this.$route.name == 'customers.edit' || this.$route.name == 'customers.profile') && store.editform.tutor && data == store.editform.tutor._id) || ((this.$route.name == 'customers.edit' || this.$route.name == 'customers.profile') && store.editform.contacts.length > 0 && data == store.editform.contacts.filter(contact => contact._id == data).length > 0) || (this.$route.name == 'customers.new' && store.form.tutor && data == store.form.tutor._id) || (this.$route.name == 'customers.new' && store.form.contacts.length > 0 && store.form.contacts.filter(contact => contact._id == data).length > 0) || (this.$route.name != 'customers.edit' && this.$route.name != 'customers.profile' && this.$route.name != 'customers.new')) {
                        /* Reload the specific customer */
                        /* Call to the mixin function to show an alert */
                        this.addBottomAlert('Se han producido cambios en los datos y se han cargado correctamente a esta página.');
                    }
                }
            },
            /**
             * Function executed when the welcome modal is closed to disable this shown on future logins or page changing
             */
            unwantNews() {
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
<style>
    @font-face {
        font-family: myriad;
        src: url('../../fonts/Myriad_Pro_Bold_Condensed_Italic.ttf') format('truetype');
    }
    @import url('../../css/custom_variants.css');
    @import url('../../css/transitions.css');
    @import url('../../css/styles.css');

    #tester-news {
        background: rgba(0, 131, 81, 1);
        border: rgba(0, 131, 81, 1);
        box-shadow: 0 0 3px rgba(0, 0, 0, .5);
        font-size: 17px;
        height: 30px;
        left: calc(1.7% - 4px);
        line-height: 30px;
        opacity: .4;
        overflow: hidden;
        padding: 0;
        position: fixed;
        text-align: center;
        top: 20px;
        transform: scale(0.98);
        transition: all .3s;
        width: 30px;
        z-index: 1050;
    }
    #tester-news:hover {
        opacity: 1;
        transform: scale(1);
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

