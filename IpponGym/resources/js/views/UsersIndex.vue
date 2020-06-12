<template>
    <div class="users">
        <div class="loading" v-if="loading">
            Cargando...
        </div>
        <div class="error" v-if="error">
            {{ error }}
        </div>re
        <ul v-if="users">
            <li
                v-for="{ nombre, email} in users"
                :key="nombre">
                <strong>Name: </strong> {{ nombre }}
                <strong>Email: </strong> {{ email }}
            </li>
        </ul>
    </div>
</template>
<script>
    import axios from "axios";
    export default {
        data() {
            return {
                loading: false,
                users: null,
                error: null,
            };
        },
        created() {
            this.fectchData();
        },
        methods: {
            fectchData() {
                this.error = this.users = null;
                this.loading = true;
                axios
                    .get('/api/users')
                    .then(response => {
                        this.loading = false;
                        this.users = response.data;
                        console.log(response.data);
                    }).catch(error => {
                        this.loading = false;
                        this.error = error.response.data.message || error.message;
                    });
            }
        }
    }
</script>
