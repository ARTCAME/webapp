import Vue from 'vue';
import { http } from '../../utils/http';

const actions = {
    fetchUsers({ commit }) {
        http.post('/api/auth/index')
            .then(response => {
                let users = [];
                response.data.forEach((user) => {
                    users.push({
                        username: user.username,
                        email: user.email,
                    });
                });
                commit('FETCH_USERS', users);
            })
    },
    login({ commit, dispatch, getters }, { username, password }) {
        return new Promise((resolve, reject) => {
            commit('AUTH_REQUEST')
            http.post('/api/auth/login', { username, password })
                .then(response => {
                    const token = response.data.token;
                    const username = response.data.user.username;
                    const role = response.data.user.role;
                    const expires = response.data.expires_in;
                    console.log(response);
                    localStorage.setItem('token', token);
                    localStorage.setItem('username', username);
                    localStorage.setItem('role', role);
                    localStorage.setItem('expires', expires);
                    commit('AUTH_SUCCESS', { user: username, token: token, role: role, expires: expires });
                    /* Reloads the page, on the process fetch the initial data via the route guard */
                    location.reload();
                })
                .catch (error => {
                    commit('AUTH_ERROR');
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    localStorage.removeItem('expires');
                    reject(error);
                })
                .finally(() => {
                    return;
                });
        });
    },
    logout({ commit, state }) {
        commit('LOGOUT');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('expires');
        // location.reload();
        // return new Promise((resolve, reject) => {
        //     http.post('/api/auth/logout')
        //         .then(response => {
        //             commit('LOGOUT');
        //             localStorage.removeItem('token');
        //             localStorage.removeItem('username');
        //             localStorage.removeItem('role');
        //             location.reload();
        //             resolve();
        //         })
        //         .catch(error => {
        //             console.log('logout con error');
        //             commit('LOGOUT');
        //             localStorage.removeItem('token');
        //             localStorage.removeItem('username');
        //             localStorage.removeItem('role');
        //             // location.reload();
        //             reject(error)
        //         });
        // });
    },
    refresh({ commit, dispatch, getters }) {
        return new Promise((resolve, reject) => {
            commit('AUTH_REQUEST')
            console.log(http);
            http.post('/api/auth/refresh')
                .then(response => {
                    console.log(response);
                    const token = response.data.token;
                    const username = response.data.user.username;
                    const role = response.data.user.role;
                    const expires = response.data.expires_in;
                    localStorage.setItem('token', token);
                    localStorage.setItem('username', username);
                    localStorage.setItem('role', role);
                    localStorage.setItem('expires', expires);
                    console.log(http.defaults.headers);
                    // http.defaults.headers['Authorization'] = 'Bearer ' + token;
                    console.log(http.defaults);
                    http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                    console.log(http.defaults);
                    console.log(http.defaults.headers);

                    // commit('AUTH_SUCCESS', { user: username, token: token, role: role, expires: expires });
                    /* Reloads the page, on the process fetch the initial data via the route guard */
                    // location.reload();
                })
                .catch (error => {
                    commit('AUTH_ERROR');
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    reject(error);
                })
                .finally(() => {
                    return;
                });
        });
    },
    setToken({ commit }, token) {
        console.log(token);
        commit('SET_TOKEN', token);
    }
}
const getters = {
    getToken: state => state.token,
    authenticatedUser: state => state.user,
    authenticatedRole: state => state.role,
    authStatus: state => state.status,
    countUserByUsername: state => username => state.users.filter(su => su.username == username).length,
    countUserByEmail: state => email => state.users.filter(su => su.email == email).length,
    isLoggedIn: state => !!state.token,
}
const mutations = {
    AUTH_ERROR(state) {
        state.status = 'error';
    },
    AUTH_REQUEST(state) {
        state.status = 'loading';
    },
    AUTH_SUCCESS(state, { user, token, role, expires }) {
        state.status = 'success';
        state.token = token;
        state.user = user;
        state.role = role;
        state.expires = expires;
    },
    FETCH_USERS(state, users) {
        Vue.set(state, 'users', users);
    },
    LOGOUT(state) {
        state.status = '';
        state.token = '';
        state.user = '';
        state.role = '';
        state.expires = '';
    },
    SET_TOKEN(state, token) {
        state.token = token;
    }
}
const state = {
    // users: [],
    status: '',
    token: localStorage.getItem('token') || '',
    user: localStorage.getItem('username') || '',
    role: localStorage.getItem('role') || '',
    expires: localStorage.getItem('expires') || '',
}
export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters,
}
