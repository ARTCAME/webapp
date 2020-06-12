<template>
    <div>
        <div
            v-if="$route.name == 'home' || $route.name == '404'">
            <transition appear mode="out-in" name="fade">
                <router-view></router-view>
            </transition>
        </div>
        <!-- The ref allows to the bottomAlert plugin to work properly -->
        <div
            class="mb-2"
            id="main-container"
            ref="container"
            v-if="$route.name != 'home' && $route.name != '404'">
            <NavBar v-if="$route.name != 'home' && $route.name != '404'"></NavBar>
            <!-- <navigation-bar-component v-if="this.$route.name != 'home' && this.$route.name != '404'"></navigation-bar-component> -->
            <transition appear mode="out-in" name="fade">
                <router-view></router-view>
            </transition>
            <!-- <loading v-if="$root.isLoading == true"></loading> -->
        </div>
    </div>
</template>
<script>
    import addBottomAlert from '../mixins/addBottomAlert.vue';
    import axios from 'axios';
    import { mapActions, mapState } from 'vuex';
    export default {
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
        },
        mixins: [
            addBottomAlert
        ],
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
/* EN  C:\wamp64\www\IpponZero\public\css\styles.css hay el archivo original que hacía reventar la carga de npm al llamar a /public/**/

</style>
