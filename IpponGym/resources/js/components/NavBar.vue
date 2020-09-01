<template>
    <div>
        <b-navbar
            id="ig-main-navbar"
            fixed="top"
            :class="this.$route.name == 'home' || this.$route.name == '404' ? 'in-home' : ''"
            :toggleable="this.$route.name == 'home' || this.$route.name == '404' ? false : 'md'">
            <span class="nav-container">
                <b-navbar-brand class="ippon-title" href="/" id="ctn-ippongym">
                    <router-link
                        id="ippon-link"
                        :to="{ name : 'home' }">
                        <b class="ippon-ttl" id="ippon-ttl">
                            IPPONGYM
                        </b>
                    </router-link>
                </b-navbar-brand>
                <b-navbar-nav class="mr-auto" id="nav-user">
                    <b-nav-text
                        v-if="isLoggedIn">
                        <router-link
                            :title="'Has iniciado sesión con el usuario: ' + authenticatedUser"
                            :to="{ name : 'home' }">
                            {{ authenticatedUser }}
                        </router-link>
                    </b-nav-text>
                </b-navbar-nav>
                <b-navbar-toggle target="nav-collapse">
                    <template #default>
                        <fa-icon icon="bars"></fa-icon>
                    </template>
                </b-navbar-toggle>
                <b-collapse
                    id="nav-collapse"
                    is-nav
                    @hide="navExpand('ig-main-navbar')"
                    @show="navExpand('ig-main-navbar')">
                    <b-navbar-nav class="ml-auto">
                        <b-navbar-nav
                            v-if="authenticatedRole == 'user'">
                            <b-nav-item
                                active-class="active"
                                class="p-2"
                                exact
                                v-for="(route, key) in routes.user"
                                :key="route.path">
                                <router-link
                                    :id=route.name
                                    :key="key"
                                    :to="{ name : route.path }">
                                    {{ route.name }}
                                </router-link>
                            </b-nav-item>
                        </b-navbar-nav>
                        <b-navbar-nav
                            v-if="authenticatedRole == 'admin'">
                            <b-nav-item
                                active-class="active"
                                class="p-2"
                                exact
                                v-for="(route, key) in routes.admin"
                                :key="route.path">
                                <router-link
                                    :id=route.name
                                    :key="key"
                                    :to="{ name : route.path }">
                                    {{ route.name }}
                                </router-link>
                            </b-nav-item>
                        </b-navbar-nav>
                        <b-navbar-nav
                            v-if="authenticatedRole == 'tester'">
                            <b-nav-item
                                active-class="active"
                                class="p-2"
                                exact
                                v-for="(route, key) in routes.tester"
                                :key="route.path">
                                <router-link
                                    :id=route.name
                                    :key="key"
                                    :to="{ name : route.path }">
                                    {{ route.name }}
                                </router-link>
                            </b-nav-item>
                        </b-navbar-nav>
                        <b-navbar-nav
                            v-if="authenticatedRole == 'root'">
                            <b-nav-item
                                active-class="active"
                                class="p-2"
                                exact
                                v-for="(route, key) in routes.root"
                                :key="route.path">
                                <router-link
                                    :id=route.name
                                    :key="key"
                                    :to="{ name : route.path }">
                                    {{ route.name }}
                                </router-link>
                            </b-nav-item>
                        </b-navbar-nav>
                        <b-navbar-nav>
                            <b-nav-item
                                class="p-2 pl-md-3"
                                v-if="isLoggedIn">
                                <a
                                    href="#"
                                    class="text-secondary"
                                    @click.prevent="inLogout()">
                                    CERRAR SESIÓN
                                </a>
                            </b-nav-item>
                        </b-navbar-nav>
                    </b-navbar-nav>
                </b-collapse>
            </span>
        </b-navbar>
        <b-navbar
            id="ig-tools-navbar"
            fixed="top"
            :data-v-step="$route.name == 'payments.index' ? 'wzd-main-pagos-5' : $route.name == 'belts.index' ? 'wzd-main-cinturones-6' : ''"
            :toggleable="$route.name == 'payments.index' || $route.name == 'belts.index' ? 'sm' : false">
            <b-row align-h="between" align-v="start" class="nav-container" no-gutters>
                <b-col class="col-12 col-sm-8" style="box-sizing: border-box; border: 1px solid transparent;">
                    <b-navbar-toggle
                        id="tools-toggler"
                        target="nav-tools-collapse"
                        v-if="$route.name == 'payments.index' || $route.name == 'belts.index'">
                        <template
                            #default>
                            <fa-icon
                                icon="caret-down"></fa-icon>
                        </template>
                    </b-navbar-toggle>
                    <b-collapse
                        id="nav-tools-collapse"
                        is-nav
                        @hide="navExpand('ig-tools-navbar')"
                        @show="navExpand('ig-tools-navbar')">
                        <transition appear mode="out-in" name="slide-fade">
                            <span
                                key="belts-tools"
                                v-if="$route.name == 'belts.index'">
                                <b-row align-h="start" class="nav-btn-wrp" no-gutters>
                                    <b-navbar-nav
                                        id="nav-belts-update"
                                        :class="'col-12 col-sm-auto ig-tools-nav onpage' + (getProcedureState('beltsUpdating') ? ' actived' : '')">
                                        <b-nav-item
                                            class="ig-tools-item onpage"
                                            @click="setProcedureState({ procedure: 'beltsUpdating' })">
                                            <b-row no-gutters>
                                                <fa-icon icon="graduation-cap"></fa-icon>
                                                <span class="nav-text">
                                                    Actualiza los grados
                                                </span>
                                            </b-row>
                                            <p class="nav-desc-tools">
                                                {{ getProcedureState('beltsUpdating') ? 'Finalizar' : 'Actualiza los grados' }}
                                            </p>
                                        </b-nav-item>
                                    </b-navbar-nav>
                                    <b-navbar-nav
                                        id="nav-belts-print"
                                        :class="'col-12 col-sm-auto ig-tools-nav onpage' + (getProcedureState('beltsPrinting') ? ' actived' : '')">
                                        <b-nav-item
                                            class="ig-tools-item onpage"
                                            @click="setProcedureState({ procedure: 'beltsPrinting' })">
                                            <b-row no-gutters>
                                                <fa-icon icon="id-card-alt"></fa-icon>
                                                <span class="nav-text">
                                                    Descarga el archivo de diplomas
                                                </span>
                                            </b-row>
                                            <p class="nav-desc-tools">
                                                {{ getProcedureState('beltsPrinting') ? 'Finalizar' : 'Descarga el archivo de diplomas' }}
                                            </p>
                                        </b-nav-item>
                                    </b-navbar-nav>
                                </b-row>
                            </span>
                            <span
                                key="payments-tools"
                                v-if="$route.name == 'payments.index'">
                                <b-row align-h="start" class="nav-btn-wrp" no-gutters>
                                    <b-navbar-nav
                                        id="nav-payments-update"
                                        :class="'col-12 col-sm-auto ig-tools-nav onpage' + (getProcedureState('paymentsConfirming') ? ' actived' : '')">
                                        <b-nav-item
                                            :class="'ig-tools-item onpage'"
                                            @click="setProcedureState({ procedure: 'paymentsConfirming' })">
                                            <b-row no-gutters>
                                                <fa-icon icon="landmark"></fa-icon>
                                                <span class="nav-text">
                                                    Confirma pagos
                                                </span>
                                            </b-row>
                                            <p class="nav-desc-tools">
                                                {{ getProcedureState('paymentsConfirming') ? 'Finalizar' : 'Confirma los pagos' }}
                                            </p>
                                        </b-nav-item>
                                    </b-navbar-nav>
                                    <b-navbar-nav
                                        id="nav-payments-print"
                                        :class="'col-12 col-sm-auto ig-tools-nav onpage' + (getProcedureState('paymentsPrinting') ? ' actived' : '')">
                                        <b-nav-item
                                            class="ig-tools-item onpage"
                                            @click="setProcedureState({ procedure: 'paymentsPrinting' })">
                                            <b-row no-gutters class="px-1">
                                                <fa-icon icon="file-invoice"></fa-icon>
                                                <span class="nav-text">
                                                    Descarga archivos de remesa
                                                </span>
                                            </b-row>
                                            <p class="nav-desc-tools">
                                                {{ getProcedureState('paymentsPrinting') ? 'Finalizar' : 'Descarga archivos de remesa' }}
                                            </p>
                                        </b-nav-item>
                                    </b-navbar-nav>
                                    <b-navbar-nav
                                        id="nav-payments-charts"
                                        :class="'col-12 col-sm-auto ig-tools-nav onpage' + (getProcedureState('paymentsCharts') ? ' actived' : '')">
                                        <b-nav-item
                                            class="ig-tools-item onpage"
                                            @click="setProcedureState({ procedure: 'paymentsCharts' })">
                                            <b-row no-gutters>
                                                <fa-icon icon="chart-bar"></fa-icon>
                                                <span class="nav-text">
                                                    {{ getProcedureState('paymentsCharts') ? 'Oculta gráficos' : 'Mostrar gráficos' }}
                                                </span>
                                            </b-row>
                                            <p class="nav-desc-tools">
                                                {{ getProcedureState('paymentsCharts') ? 'Oculta gráficos' : 'Ver gráficos' }}
                                            </p>
                                        </b-nav-item>
                                    </b-navbar-nav>
                                </b-row>
                            </span>
                        </transition>
                    </b-collapse>
                </b-col>
            <!-- Global options -->
                <b-col id="col-assets" cols="auto">
                    <NavAssets></NavAssets>
                </b-col>
            </b-row>
        </b-navbar>
    </div>
</template>
<script>
    import { mapActions, mapGetters } from 'vuex';
    export default {
        data() {
            return {
                alta: { name: 'ALTA', path: 'customers.new' },
                cinturones: { name: 'CINTURONES', path: 'belts.index' },
                lastScroll: 0,
                pagos: { name: 'PAGOS', path: 'payments.index' },
                routes: {},
                tests: { name: 'TESTS', path: 'tests.index' },
                testsRoot: { name: 'TESTS', path: 'testsRoot' },
                usuario: { name: 'GESTIÓN DE USUARIOS', path: 'users.index' },
            }
        },
        computed: {
            ...mapGetters('auth', ['authenticatedRole', 'authenticatedUser', 'isLoggedIn']),
            ...mapGetters('navbar', ['getIsProcedureBeltsStarted', 'getIsProcedurePaymentsStarted', 'getProcedureState']),
            /**
             * Determines if a procedure cancellable is actived to show a cancel button
             *
             * @return {Boolean} Boolean that indicates if some cancellable procedure has been started
             */
            cancellable() {
                return (this.$route.name == 'payments.index' && this.getIsProcedurePaymentsStarted) || (this.$route.name == 'belts.index' && this.getIsProcedureBeltsStarted);
            },
        },
        created() {
            /* Assign the routes */
            this.routes.admin = [{ ...this.alta }, { ...this.cinturones }, { ...this.pagos }];
            this.routes.user = [{ ...this.alta }, { ...this.cinturones }, { ...this.pagos }];
            this.routes.tester = [{ ...this.alta }, { ...this.cinturones }, { ...this.pagos }, { ...this.tests }];
            this.routes.root = [{ ...this.alta }, { ...this.cinturones }, { ...this.pagos }, { ...this.testsRoot }, { ...this.usuario }];
            /* Listen to the scroll event to visual effects */
            window.addEventListener('scroll', this.scroll);
        },
        destroyed() {
            /* Destroy scroll listener */
            window.removeEventListener('scroll', this.scroll);
        },
        methods: {
            ...mapActions('auth', ['logout']),
            ...mapActions('navbar', ['setProcedureState']),
            /**
             * Logout the user, this only can be achieved from the navbar (from here)
             */
            inLogout() {
                /* Calls to the vuex logout that calls to the api to logout the user */
                this.logout()
                    .then(() => {
                        /* Redirect to the login home page */
                        if (this.$router.currentRoute.path != '/') {
                            /* Reload the page the reset vuex */
                            location.reload()
                            //     .then(() => {
                            //         this.$router.push('/');
                            //     });
                        }
                    });
            },
            /**
             * Uix improves for the expanded navs
             *
             * @param {String} nav: identifies the nav to manage
             */
            navExpand(nav) {
                const elem = document.getElementById(nav);
                elem.classList.toggle("nav-expanded")
            },
            /**
             * Manage the behaviour of the navbars
             */
            scroll() {
                const toolsNav = document.getElementById('ig-tools-navbar');
                const mainNav = document.getElementById('ig-main-navbar');
                const editAlert = document.getElementById('edit-alert') || null; /* Selects a MainForm alert element */
                /* Add class with the box-shadow behaviour */
                document.getElementsByTagName('html')[0].scrollTop > 0 ? toolsNav.classList.add('scrolling') : toolsNav.classList.remove('scrolling');
                /* Hide/Unhide the navbar based on the scroll position */
                const scrollY = window.scrollY;
                var currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                if (scrollY > 350) {
                    /* If is scrolling up */
                    if (currentScroll < (this.lastScroll - 250)) {
                        toolsNav.style.transform = 'unset';
                        mainNav.style.transform = 'unset';
                        if (editAlert) {
                            editAlert.style.boxShadow = 'unset';
                        }
                    } else {
                        toolsNav.style.transform = 'translateY(-150px)';
                        mainNav.style.transform = 'translateY(-100px)';
                        if (editAlert) {
                            editAlert.style.boxShadow = '0px 0px 4px 0 rgba(133, 100, 4, 1)';
                        }
                    }
                } else if (scrollY <= 350) {
                    toolsNav.style.transform = 'unset';
                    mainNav.style.transform = 'unset';
                    if (editAlert) {
                        editAlert.style.boxShadow = 'unset';
                    }
                }
                this.lastScroll = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
            },
        },
        mounted() {
            this.lastScroll = window.pageYOffset || document.documentElement.scrollTop;
            /* Generate random gradient to the main title */
            this.$randomGradient(document.getElementById('ippon-ttl'));
        }
    }
</script>
<style>
</style>
<style scoped>
    .ig-tools-item {
        height: 100%;
        padding: 0;
        transition: all .15s ease-in-out;
        width: 100%;
    }
    .ig-tools-item * {
        color: rgba(0, 131, 81, 1);
    }
    .ig-tools-item svg {
        height: 100%;
        margin: auto auto;
        transition: all .15s ease-in-out;
    }
    .ig-tools-item.onpage svg {
        color: rgba(0, 131, 81, 1);
    }
    .ig-tools-item .nav-link {
        height: 100%;
        margin: 0;
        padding: 0;
        width: 100%;
    }
    .ig-tools-nav {
        border-radius: .25rem;
        box-sizing: border-box;
        height: 40px;
        margin: 0 1px;
        padding: 0;
        position: relative;
        text-align: center;
        transition: box-shadow .15s ease-in-out;
        white-space: nowrap;
        width: 40px;
    }
    .ig-tools-nav.onpage {
        padding: 0 .5rem;
        width: auto;
    }
    .ig-tools-nav.onpage:hover,
    .ig-tools-nav.onpage.actived {
        box-shadow: 0 0 0 1px rgba(0, 131, 81, 1) inset, 0 0 0 3px rgba(0, 131, 81, .2) inset;
    }
    .in-home {
        display: flex 1 1;
        flex-direction: column;
    }
    .in-home .nav-link {
        padding: .4rem!important;
    }
    .in-home #ippon-ttl {
        font-size: calc(50px + (150 - 50) * ((100vw - 300px) / (1600 - 300))); /* minsize + (max-min) * (maxvw - minvw) * (maxpx - minpx) */
        padding: 0 50px 0 50px;
        text-align: center;
    }
    .in-home #nav-user {
        text-align: center;
        width: 100%;
    }
    .in-home #nav-user * {
        width: 100%;
    }
    .nav-btn-wrp {
        line-height: 38px; /* Vertical alignment correction of the nav content */
    }
    .nav-container {
        align-items: center;
        border: 1px solid transparent; /* Avoding the small jump on hambur open */
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin: 0 auto;
        width: 88%;
    }
    .nav-desc-tools {
        border-radius: .25rem;
        height: 20px!important;
        opacity: 0;
        line-height: 9px;
        margin-top: 18px;
        padding: 5px;
        position: absolute;
        right: 50%;
        transition: all .3s ease-in-out;
        transform: translate(50%, 20px);
        user-select: none;
        visibility: hidden;
    }
    .scrolling .nav-desc-tools {
        background: rgba(255,255,255.1);
    }
    .nav-expanded {
        box-shadow: 0 2px 2px 0 rgba(180, 180, 180, 1)!important;
        transition: box-shadow 3s;
    }
    .nav-desc-tools {
        display: none;
    }
    .ig-tools-nav:hover .nav-desc-tools {
        text-shadow: 1px 0 10px rgba(255, 255, 255, 1);
        transform: translate(50%, 3px);
        opacity: 1;
        visibility: visible;
    }
    .nav-item a {
        letter-spacing: -.04em;
    }
    .nav-text {
        padding: 0 .5rem;
    }
    .navbar-light .navbar-toggler {
        border-color: transparent; /* Delete the icon border */
        height: 40px!important
    }
    .navbar {
        box-shadow: 0 0 0 0 grey;
        border-radius: 0.25rem;
        box-sizing: border-box;
        margin: 15px;
        /* overflow: hidden; */
        transition: box-shadow .15s ease-in-out;
    }
    .navbar-collapse .nav-link {
        padding: 0;
    }
    .router-link-exact-active:not(#ippon-link) {
        color: rgba(0, 131, 81, 1)!important;
        text-decoration: underline!important;
    }
    .scrolling {
        box-shadow: 0 2px 2px 0 rgba(180, 180, 180, 1)!important
    }
    #ctn-ippongym {
        border: 1px solid transparent; /* Avoding the small jump on hambur open */
    }
    #ig-main-navbar,
    #ig-tools-navbar {
        transition: box-shadow .25s, transform .25s;
        width: 100vw; /* Resolving jumps on appear scrollbar */
    }
    #ig-main-navbar {
        border: 1px solid transparent; /* Avoding the small jump on hambur open */
        border-radius: 0;
        background-color: rgba(255, 255, 255, 1);
        margin: 0;
        min-height: 70px;
        /* transition: .2s; */
        z-index: 999; /* Above tools nav */
    }
    #ig-tools-navbar {
        /* border: 1px solid blue; */
        background-color: rgba(255, 255, 255, 1);
        border-radius: 0;
        /* height: 40px; */
        margin: 0;
        min-height: 45px;
        padding: 0;
        top: 70px;
        z-index: 998; /* Above tools nav */
    }
    #ippon-link:hover{
        text-decoration: none!important;
    }
    #ippon-ttl {
        background: linear-gradient(to right, #000000 0%, #008351 75%);
        background-clip: text;
        -webkit-background-clip: text;
        letter-spacing: -.05em;
        padding-right: 3px; /* Prevents hides on the cursive letters */
        -webkit-text-fill-color: transparent;
        text-align: center;
        user-select: none;
    }
    #nav-user {
        opacity: .2;
    }
    #tools-cancel-btn {
        margin-bottom: auto;
        margin-left: .5rem;
        margin-top: auto;
    }
    .modal-open #ig-main-navbar button {
        margin-right: unset!important; /* Prevent jummp on modal open */
    }
    .modal-open #ig-main-navbar {
        padding-right: 17px!important;
    }
    .modal-open.neutral-scroll #ig-main-navbar {
        padding-right: 1rem!important;
    }
    .modal-open.neutral-scroll #ig-tools-navbar {
        padding-right: 0!important;
    }
    @media screen and (max-width: 575.98px) {
        .ig-tools-item svg {
            margin: auto 0;
        }
        .in-home .navbar-nav {
            display: flex 1 1;
            flex-direction: column;
            text-align: center;
        }
        #col-assets {
            position: absolute;
            padding-top: 1px;
            right: 8%;
            top: 0;
        }
        /* .modal-open #col-assets {
            padding-right: 14px!important; Prevent jumps on modal open
        } */
    }
    @media screen and (max-width: 880px) and (min-width: 576px) {
        .ig-tools-nav.onpage {
            padding: .6rem; /* Mantain the vertical alignment without the text */
            /* overflow: hidden; Hide the text */
            width: 40px; /* Modifiy the width to hide the text, only will be visible the icon */
        }
        .ig-tools-nav.onpage .nav-text {
            display: none; /* Hide the text */
        }
        .nav-desc-tools {
            display: block; /* Show the hover desc */
        }
    }
</style>

