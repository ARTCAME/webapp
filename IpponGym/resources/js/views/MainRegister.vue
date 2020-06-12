<template>
    <b-container>
        <transition appear name="blur-in">
            <b-form
                autocomplete="off"
                method="post"
                @submit.prevent="inRegister">
                <b-card>
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
                            :class="{ 'is-invalid' : errors.has('reg-username') }"
                            @input="find('username', username)"></b-form-input>
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
                            :class="{ 'is-invalid' : errors.has('reg-email') }"
                            @input="find('email', email)"></b-form-input>
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
                        type="submit"
                        :disabled="this.isEveryValid == false">
                        Registrar
                    </b-button>
                </b-card>
            </b-form>
        </transition>
    </b-container>
</template>
<script>
    import { mapActions, mapGetters } from 'vuex';
    import { http } from "../utils/http";
    export default {
        data() {
            return {
                email: '', /* V-model */
                name: '', /* V-model */
                numEmailFounded: 0, /* Stores the number of coincidences by email founded at the database */
                numUserFounded: 0, /* Stores the number of coincidences by username founded at the database */
                password: '', /* V-model */
                password_confirmation: '', /* V-model */
                role: '', /* V-model */
                roles: [
                    { value: 'user', text: 'Usuario' },
                    { value: 'admin', text: 'Administrador' }
                ], /* Select element options */
                typingTimer: null, /* Timer for the settimeout */
                username: '', /* V-model */
            }
        },
        computed: {
            ...mapGetters('auth', ['countUserByEmail', 'countUserByUsername', 'isLoggedIn']),
            /**
             * Evaluate if every field is correct
             */
            isEveryValid() {
                return Object.keys(this.veeFormFields).every(k => this.veeFormFields[k].valid);
            },
        },
        methods: {
            ...mapActions('auth', ['register']),
            /**
             * Finds by email and username the users with api calls to db and assign to local variable the number of users founded
             *
             * @param {String} f: the field to search
             * @param {String} v: the value to search
             */
            find(f, v) {
                clearTimeout(this.typingTimer);
                this.typingTimer = setTimeout(() => {
                    http.post('/api/usersearch', { field: f, value: v })
                        .then((response) => {
                            f == 'email' ? this.numEmailFounded = response.data.length : this.numUserFounded = response.data.length;
                        }
                )}, 500);
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
                        this.$showToast('success', 'Usuario registrado correctamente', 'Nuevo usuario registrado');
                    })
                    .catch(error => {
                        console.error(error)
                    });
s            },
        }
    }
</script>
