<template>
    <div id="login-main-container">
        <span class="sides-login" id="side-logo">
            <span id="login-logo">
                <span id="login-ippon">IPPON</span>
                <span id="login-gym">GYM</span>
            </span>
        </span>
        <span id="side-login" class="sides-login">
            <!-- Shown when the api call to login or logout is actived -->
            <!-- <span
                id="logginout-spinner-wrp"
                v-if="logging == true">
                <b-spinner id="logginout-spinner" class="ig-green" type="grow"></b-spinner>
            </span> -->

            <!-- Shown when the user is not logged in -->
            <!-- <b-form
                id="login-form"
                v-else-if="isLoggedIn == false"
                @submit.prevent="inLogin">
                <b-form-group>
                    <h5 class="subtitle" md="4">Inicio de sesión</h5>
                </b-form-group>
                <b-form-group label="Nombre de usuario" label-for="username">
                    <b-form-input
                        name="login-username"
                        required
                        type="text"
                        v-model="username"
                        v-validate="'required'"
                        :class="{ 'is-invalid' : errors.has('login-username') }"></b-form-input>
                    <transition name="liveFeedbacks" mode="out-in">
                        <b-form-invalid-feedback
                            v-for="error in errors.collect('login-username')"
                            :key="error">
                            {{ error }}
                        </b-form-invalid-feedback>
                    </transition>
                </b-form-group>
                <b-form-group label="Contraseña" label-for="password">
                    <b-form-input
                        name="login-password"
                        required
                        type="password"
                        v-model="password"
                        v-validate="'required'"
                        :class="{ 'is-invalid' : errors.has('login-password') }"></b-form-input>
                    <transition name="liveFeedbacks" mode="out-in">
                        <b-form-invalid-feedback
                            v-for="error in errors.collect('login-password')"
                            :key="error">
                            {{ error }}
                        </b-form-invalid-feedback>
                    </transition>
                </b-form-group>
                <b-button
                    size="sm"
                    type="submit">Iniciar sesión</b-button>
            </b-form> -->
            <!-- çççççççççççççççççççççççççççççççççççççççççççççççççççççççç -->
            <b-form
                autocomplete="off"
                key="user-register-form"
                method="post"
                @submit.prevent="inRegister">
                <b-card id="register-form">
                    <b-form-group>
                        <h5 md="4" class="subtitle">Nuevo usuario</h5>
                    </b-form-group>
                    <b-form-group label="Nombre" label-for="name">
                        <b-form-input
                            autocomplete="off"
                            autofocus
                            id="name"
                            name="reg_nombre"
                            required
                            type="text"
                            v-model="name"
                            v-validate="'required|min:3'"
                            :class="{ 'is-invalid' : errors.has('reg_nombre') }"></b-form-input>
                        <transition mode="out-in" name="liveFeedbacks">
                            <b-form-invalid-feedback
                                v-for="error in errors.collect('reg_nombre')"
                                :key="error">
                                {{ error }}
                            </b-form-invalid-feedback>
                        </transition>
                    </b-form-group>
                    <b-form-group label="Nombre de usuario" label-for="username">
                        <b-form-input
                            autocomplete="off"
                            autofocus
                            id="username"
                            name="reg-username"
                            required
                            type="text"
                            v-model="username"
                            v-validate="'required|min:3|uniqueUsername:' + numUserFounded"
                            :class="{ 'is-invalid' : errors.has('reg-username') }"></b-form-input>
                        <transition mode="out-in" name="liveFeedbacks">
                            <b-form-invalid-feedback
                                v-for="error in errors.collect('reg-username')"
                                :key="error">
                                {{ error }}
                            </b-form-invalid-feedback>
                        </transition>
                    </b-form-group>
                    <b-form-group label="E-mail" label-for="email">
                        <b-form-input
                            id="email"
                            name="reg-email"
                            required
                            type="email"
                            v-model="email"
                            v-validate="'required|email|uniqueEmail:' + numEmailFounded"
                            :class="{ 'is-invalid' : errors.has('reg-email') }"></b-form-input>
                        <transition mode="out-in" name="liveFeedbacks">
                            <b-form-invalid-feedback
                                v-for="error in errors.collect('reg-email')"
                                :key="error">
                                {{ error }}
                            </b-form-invalid-feedback>
                        </transition>
                    </b-form-group>
                    <b-form-group label="Contraseña" label-for="password">
                        <b-form-input
                            id="password"
                            name="reg-pass"
                            ref="password"
                            required
                            type="password"
                            v-model="password"
                            v-validate="{ required: true, min: 3 }"
                            :class="{ 'is-invalid' : errors.has('reg-pass') }"></b-form-input>
                        <transition mode="out-in" name="liveFeedbacks">
                            <b-form-invalid-feedback
                                v-for="error in errors.collect('reg-pass')"
                                :key="error">
                                {{ error }}
                            </b-form-invalid-feedback>
                        </transition>
                    </b-form-group>
                    <b-form-group label="Confirma contraseña" label-for="password-confirm">
                        <b-form-input
                            id="password-confirm"
                            name="reg-pass-confirm"
                            required
                            type="password"
                            v-model="password_confirmation"
                            v-validate="{ required: true, min: 3, confirmed: password }"
                            :class="{ 'is-invalid' : errors.has('reg-pass-confirm') }"></b-form-input>
                        <transition mode="out-in" name="liveFeedbacks">
                            <b-form-invalid-feedback
                                v-for="error in errors.collect('reg-pass-confirm')"
                                :key="error">
                                {{ error }}
                            </b-form-invalid-feedback>
                        </transition>
                    </b-form-group>
                    <b-form-group
                        label="Selecciona rol">
                        <b-form-select
                            name="selectRole"
                            required
                            v-model="role"
                            v-validate="'required'"
                            :class="{ 'is-invalid' : errors.has('selectRole') }"
                            :options="roles"></b-form-select>
                            <transition mode="out-in" name="liveFeedbacks">
                                <b-form-invalid-feedback
                                    v-for="error in errors.collect('selectRole')"
                                    :key="error">
                                    {{ error }}
                                </b-form-invalid-feedback>
                            </transition>
                    </b-form-group>
                    <b-button
                        type="submit">
                        Registrar
                    </b-button>
                </b-card>
            </b-form>
            <!-- çççççççççççççççççççççççççççççççççççççççççççççççççççççççç -->
            <!-- Visible when the user is logged in -->
            <span
                id="home-nav"
                v-else-if="isLoggedIn">
                <h2 class="subtitle mb-5">
                    ¿Qué quieres hacer?
                </h2>
                <span class="d-block mx-auto my-4">
                    <NavAssets></NavAssets>
                </span>
                <!-- Visible for the role admin -->
                <span
                    class="my-4"
                    v-if="authenticatedRole == 'admin'">
                    <b-button
                        class="home-nav-btn"
                        variant="ig-outline-green"
                        v-for="(route, key) in routes.admin"
                        :key="key"
                        :to="{ name : route.path }">
                        {{ route.name }}
                    </b-button>
                </span>
                <!-- Visible for the role user -->
                <span
                    class="my-4"
                    v-if="authenticatedRole == 'user'">
                    <b-button
                        class="home-nav-btn"
                        variant="ig-outline-green"
                        v-for="(route, key) in routes.user"
                        :key="key"
                        :to="{ name : route.path }">
                        {{ route.name }}
                    </b-button>
                </span>
                <!-- Visible for the role root -->
                <span
                    class="my-4"
                    v-if="authenticatedRole == 'root'">
                    <b-button
                        class="home-nav-btn"
                        variant="ig-outline-green"
                        v-for="(route, key) in routes.root"
                        :key="key"
                        :to="{ name : route.path }">
                        {{ route.name }}
                    </b-button>
                </span>
                <!-- Visible for the role tester -->
                <span
                    class="my-4"
                    v-if="authenticatedRole == 'tester'">
                    <b-button
                        class="home-nav-btn"
                        variant="ig-outline-green"
                        v-for="(route, key) in routes.tester"
                        :key="key"
                        :to="{ name : route.path }">
                        {{ route.name }}
                    </b-button>
                </span>
                <b-button
                    class="d-block home-nav-btn mt-5 mx-auto"
                    variant="outline-warning"
                    v-if="isLoggedIn"
                    @click.prevent="inLogout()">
                    Cerrar la sesión iniciada
                </b-button>
            </span>
        </span>
    </div>
</template>
<script>
    import { http } from "../utils/http";
    import { mapActions, mapGetters } from 'vuex';
    export default {
        data() {
            return {
                alta: { name: 'Dar de ALTA un socio', path: 'customers.new' },
                cinturones: { name: 'Actualizar y ver los CINTURONES', path: 'belts.index' },
                logging: false, /* Flag to apply visual modifications when logging in/out */
                numUserFounded: '', /* Number of users coincidents at the db. Used on typing the user name to show error  */
                pagos: { name: 'Gestionar y consultar los PAGOS existentes', path: 'payments.index' },
                password: '', /* v-model */
                routes: {},
                tests: { name: 'Realizar TESTS sobre procesos', path: 'tests.index' },
                testsRoot: { name: 'Realizar TESTS sobre procesos', path: 'testsRoot' },
                username: '', /* v-model */
                usuario: { name: 'Acceder a la GESTIÓN DE USUARIOS', path: 'users.index' },



                auxUsers: [], /* Stores a copy of the users to filter it on search*/
                current: 0, /* Is the current tab */
                email: '', /* V-model */
                name: '', /* V-model */
                numEmailFounded: 0, /* Stores the number of coincidences by email founded at the database */
                numUserFounded: 0, /* Stores the number of coincidences by username founded at the database */
                password: '', /* V-model */
                password_confirmation: '', /* V-model */
                role: '', /* V-model */
                roles: [
                    { value: 'user', text: 'Usuario' },
                    { value: 'admin', text: 'Administrador' },
                    { value: 'root', text: 'Root' },
                    { value: 'tester', text: 'Tester' }
                ], /* Select element options */
                typingTimer: null, /* Timer for the settimeout */
                username: '', /* V-model */
                users: [], /* Users existing on the db */
                userData: [
                    { text: 'Nombre', key: 'name' },
                    { text: 'Nombre de usuario', key: 'username' },
                    { text: 'E-mail', key: 'email' },
                    { text: 'Conexiones', key: 'login_count' },
                    { text: 'Última actividad', key: 'lastActivity' },
                    { text: 'Última ip', key: 'lastIp' },
                    { text: 'Último inicio de sesión', key: 'last_login' },
                    { text: 'Tests completados', key: 'tests' },
                ], /* Data of the user to show */
                updUsername: '', /* V-model */
                updPassword: '', /* V-model */
            }
        },
        computed: {
            ...mapGetters('auth', ['authStatus', 'isLoggedIn', 'authenticatedRole', 'authenticatedUser']),
        },
        created() {
            /* Assign the routes */
            this.routes.admin = [{ ...this.alta }, { ...this.cinturones }, { ...this.pagos }];
            this.routes.user = [{ ...this.alta }, { ...this.cinturones }, { ...this.pagos }];
            this.routes.tester = [{ ...this.alta }, { ...this.cinturones }, { ...this.pagos }, { ...this.tests }];
            this.routes.root = [{ ...this.alta }, { ...this.cinturones }, { ...this.pagos }, { ...this.testsRoot }, { ...this.usuario }];
        },
        methods: {
            ...mapActions('auth', ['login', 'logout']),
            /**
             * Login the user
             */
            inLogin() {
                this.logging = true;
                this.login({ username: this.username, password: this.password })
                    .then((response) => {
                        this.logging = false;
                    })
                    .catch(error => {
                        this.logging = false;
                        return new Promise((resolve, reject) => {
                            reject(error);
                        })
                    });
            },
            /**
             * Logout the user, this only can be achieved from the navbar (from here)
             */
            inLogout() {
                this.logging = true;
                /* Calls to the vuex logout that calls to the api to logout the user */
                this.logout()
                    .then(() => {
                        location.reload()
                            .then(() => {
                                this.logging = false;
                            });
                    });
            },

            /**
             * Launchs the register action to the db
             */
            inRegister() {
                let user = {
                    name: this.name,
                    username: this.username,
                    email: this.email,
                    password: this.password,
                    password_confirmation: this.password_confirmation,
                    role: this.role,
                    login_count: 0,
                }
                http.post('api/register', { ...user })
                    .then(response => {
                        this.name = '';
                        this.username = '';
                        this.email = '';
                        this.password = '';
                        this.password_confirmation = '';
                        this.role = '';
                        this.$validator.reset();
                        this.$showToast(response.status, response.message, response.title);
                    })
                    .catch(error => {
                        this.$showToast('danger', 'No se ha podido crear al nuevo usuario. Código de error: FEMaUs@InRe', 'Ha ocurrido un error');
                        console.error(error.response ? error.response.data : error);
                    });
            },
        }
    }
</script>
<style scoped>
    #home-nav {
        margin: auto;
        text-align: center;
        width: 80%;
    }
    #logginout-spinner-wrp {
        margin: auto;
        text-align: center;
        width: 50%;
    }
    #logginout-spinner {
        height: 50px;
        width: 50px;
    }
    #login-main-container {
        display: flex;
        flex-flow: row nowrap;
        height: 100%;
        position: fixed;
        right: 0;
        top: 0;
        width: 100%;
    }
    #login-logo {
        margin: auto;
        padding: 0 .25rem;
        text-align: center;
        width: 100%;
    }
    #login-logo * {
        font-size: calc(50px + (200 - 50) * ((100vw - 300px) / (1600 - 300))); /* minsize + (max-min) * (maxvw - minvw) * (maxpx - minpx) */
        letter-spacing: -.05em;
        white-space: nowrap;
    }
    #login-form {
        margin: auto;
        width: 50%;
    }
    #login-ippon {
        color: rgb(255, 255, 255);
        -webkit-text-fill-color: rgb(255, 255, 255); /* Will override color (regardless of order) */
        -webkit-text-stroke-width: 1px;
        -webkit-text-stroke-color: rgb(0, 0, 0);
    }
    #login-gym {
        color: rgb(0, 131, 81);
        -webkit-text-fill-color: rgb(0, 131, 81); /* Will override color (regardless of order) */
        -webkit-text-stroke-width: 1px;
        -webkit-text-stroke-color: rgb(0, 131, 81);
    }
    #side-login {
        right: 0;
    }
    #side-logo {
        left: 0;
    }
    .home-nav-btn {
        height: 35px;
        line-height: 1.4;
        margin-right: 10px;
        margin-top: 5px;
    }
    .sides-login {
        box-sizing: border-box;
        /* display: inline-block; */
        display: inline-flex!important;
        flex: 1;
        height: 100%;
        /* position: fixed; */
        /* width: 50% */
    }
    @media (max-width: 720px) {
        #login-logo * {
            font-size: calc(50px + (200 - 50) * ((100vw - 0px) / (1600 - 500))); /* minsize + (max-min) * (maxvw - minvw) * (maxpx - minpx) */
            letter-spacing: -.05em;
            white-space: nowrap;
        }
        #login-main-container {
            flex-direction: column;
        }
        #side-logo {
            flex-grow: .40;
        }
    }
</style>
