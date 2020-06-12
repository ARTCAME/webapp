// Initial state
const defaultState = () => {
    return {
        // formFields: {
            id: '',
            active: '',
            fechaAlta: '',
            firma: '',
            image: '',
            nombre: '',
            direccion: '',
            dni: '',
            fechaNac: '',
            esMenor: '',
            sexo: '',
            tutorGroup: [],
            // tutorGroup: [ defaultTutorState() ],
            telefonoSocioGroup: [ defaultPhoneState() ],
            emailGroup: [{
                email: '',
            }],
            contactoGroup: [],
            // contactoGroup: [ defaultContactoState() ],
            personalizadosGroup: [{
                // titulo: '',
                // valor: '',
            }],
            datosPago: {
                tarifa: '',
                importe: '',
                formaPago: '',
                cuenta: '',
                fecha: '',
            },
            pagos: [{
                tarifa: '',
                importe: '',
                formaPago: '',
                iban: '',
                periodo: '',
                fechaPago: '', // fecha en que se genera el pago
                estado: '',
                fechaConfirmacion: '',
            }],
            cinturones: [
                { grado: 'blbl', fecha: null, },
                { grado: 'blam', fecha: null, },
                { grado: 'amam', fecha: null, },
                { grado: 'amna', fecha: null, },
                { grado: 'nana', fecha: null, },
                { grado: 'nave', fecha: null, },
                { grado: 'veve', fecha: null, },
                { grado: 'veaz', fecha: null, },
                { grado: 'azaz', fecha: null, },
                { grado: 'azma', fecha: null, },
                { grado: 'mama', fecha: null, },
                { grado: 'nene', fecha: null, }
            ],
        // }
    }
}

// const defaultPago = () => {
//     return {
//         tarifa: '',
//         importe: '',
//         formaPago: '',
//         cuenta: '',
//         fechaPago: '', // fecha en que se genera el pago
//         fechaConfirmación: '', // fecha en que se confirma el pago por el banco, en el caso de pagos con tarjeta o efectivo será igual que fechaPago
//     }
// }

// const defaultPagos = () => {
//     return {
//         tarifa: '',
//         importe: '',
//         formaPago: '',
//         iban: '',
//         fechaPago: '', // fecha en que se genera el pago
//         fechaConfirmacion: ''
//     }
// }

const defaultPhoneState = () => {
    return {
        telefono: '',
        telefonoTipo: -1,
        telefonoEspecifica: '',
        telefonoNotas: '',
    }
}

const defaultTutorState = () => {
    return {
        id: '',
        nombreTutor: '',
        dniTutor: '',
        direccionTutor: '',
        telefonoTutorGroup: [ defaultPhoneState() ],
        emailTutorGroup: [],
        personalizadosTutorGroup: [],
    }
}

const defaultContactoState = () => {
    return {
        id: '',
        nombreContacto: '',
        telefonoContactoGroup: [ defaultPhoneState() ],
        emailContactoGroup: [],
        notasContacto: '',
        personalizadosContactoGroup: [],
    }
}

const state = defaultState();

import api from '../../api/socios';
import moment from 'moment';
// const moment = require('moment');

const actions = {
    // Called when the socio is main loaded to edit or look up
    findSocio(context, params) {
        console.log(context)
        console.log(params);
        // console.log(context);
        // console.log(params);
        api.find(params).then((response) => {
            // Check if the contacts are socios too
            // for (let i in response.data.contactoGroup) console.log(!response.data.contactoGroup[i].id || response.data.contactoGroup[i].id != null || response.data.contactoGroup[i].id != '');
            // Check if the tutor is socio too
            // console.log(response.data.tutorGroup[0]);
            if (response.data.tutorGroup != null && response.data.tutorGroup[0] != null && response.data.tutorGroup[0].id != false && response.data.tutorGroup[0].id != null && response.data.tutorGroup[0].id != '') {
            // if (response.data.tutorGroup[0] && response.data.tutorGroup[0].id != false && response.data.tutorGroup[0].id != null && response.data.tutorGroup[0].id != '') {
                // If the tutor is a socio found it and refresh his data
                api.find(response.data.tutorGroup[0].id).then((response) => {
                    context.dispatch('selectTutor', { socio: response.data });
                })
            }
            // console.log('seguimos en dinfsocio')
            context.dispatch('getLastDatosPago',response.data.datosPago).then(resp => response.data.datosPago = resp);
            context.commit('SET_FORM', response.data);
        })
    },
    // setDatosPago(context, params) {
    //     // console.log(params);
    //     // api.newFormaPago(this.actualState.formFields._id, this.actualState.formFields.datosPago).then(response => {
    //     api.newFormaPago(params._id, params.datosPago).then(response => {
    //         console.log(response);
    //         if (response.status == 'success') {
    //             state.formFields.datosPago = response.datosPago;
    //             // api.newFormaPago(this.actualState.formFields._id, this.actualState.formFields.datosPago);
    //         }
    //     });
    //     // axios.post('/api/newFormaPago', { id: this.actualState.formFields._id, data: this.actualState.formFields.datosPago}).then(resp => { console.log(resp) });
    //     // return state.formFields.datosPago = datosPago
    // },
    getLastDatosPago(context, data) {
        // Select and assign the last forma de pago
        if (data.length > 0) {
            // Sort to substract the last payment registered and this will be showed on the view
            data = data.sort((a, b) => { return moment(parseInt(a.fecha.$date.$numberLong)) > moment(parseInt(b.fecha.$date.$numberLong)) ? -1 : moment(parseInt(a.fecha.$date.$numberLong)) < moment(parseInt(b.fecha.$date.$numberLong)) ? 1 : 0; }).splice(data[0], 1)[0];
        }
        return data;
    },
    selectLastFormaPago(data) {
        // console.log('addFormaPago');
        // context.state.datosPago = data;
        // // context.state.formFields.datosPago.push({
        // //     tarifa: data.tarifa,
        // //     importe: data.importe,
        // //     formaPago: data.formaPago,
        // //     cuenta: data.cuenta,
        // //     fecha: data.fechaPago,
        // // })
        // // context.state.formFields.datosPago.tarifa = data.tarifa,
        // // context.state.formFields.datosPago.importe = data.importe,
        // // context.state.formFields.datosPago.formaPago = data.formaPago,
        // // context.state.formFields.datosPago.cuenta = data.cuenta,
        // // context.state.formFields.datosPago.fecha = data.fechaPago,
        // context.commit('SET_FORM',context.state.formFields);
    },
    selectTutor(context, params) {
        console.log('selectutorEditar');
        // Is necessary to reset?
        // context.dispatch('resetTutorFields',state.formFields.tutorGroup[0]);
        // Every tutor has notas and personalizados fields that are not from the socio selected and will not assigned on the next lines
        let actualTutor = state.formFields.tutorGroup[0];
        actualTutor.id = params.socio._id;
        actualTutor.dniTutor = params.socio.dni;
        actualTutor.nombreTutor = params.socio.nombre;
        actualTutor.direccionTutor = params.socio.direccion;
        actualTutor.emailTutorGroup = params.socio.emailGroup;
        actualTutor.telefonoTutorGroup = params.socio.telefonoSocioGroup;

        // let actualTutor = state.formFields.tutorGroup[0];
        // actualTutor.id = params.socio._id;
        // actualTutor.dniTutor = params.socio.dni;
        // actualTutor.nombreTutor = params.socio.nombre;
        // actualTutor.direccionTutor = params.socio.direccion;
        // for (let i = 0; i < params.socio.emailGroup.length; i++) {
        //     if (actualTutor.emailTutorGroup.length < params.socio.emailGroup.length) {
        //         context.dispatch('addEmailGroup', { 'level':'tutor' });
        //     }
        //     actualTutor.emailTutorGroup[i].email = params.socio.emailGroup[i].email;
        // }
        // for (let i = 0; i < params.socio.telefonoSocioGroup.length; i++) {
        //     actualTutor.telefonoTutorGroup[i].telefono = params.socio.telefonoSocioGroup[i].telefono;
        //     actualTutor.telefonoTutorGroup[i].telefonoEspecifica = params.socio.telefonoSocioGroup[i].telefonoEspecifica;
        //     actualTutor.telefonoTutorGroup[i].telefonoNotas = params.socio.telefonoSocioGroup[i].telefonoNotas;
        //     actualTutor.telefonoTutorGroup[i].telefonoTipo = params.socio.telefonoSocioGroup[i].telefonoTipo;
        //     if (actualTutor.telefonoTutorGroup.length < params.socio.telefonoSocioGroup.length) {
        //         context.dispatch('addTelefonoGroup', { 'level':'tutor' });
        //     }
        // }
        context.commit('updateTutorFormFields',actualTutor);
    },
    selectContacto(context, params) {
        console.log('selectcontactoEditar');

        let actualContacto = state.formFields.contactoGroup[params.numContacto]
        actualContacto.id = params.socio._id
        actualContacto.nombreContacto = params.socio.nombre;
        actualContacto.telefonoContactoGroup = params.socio.telefonoSocioGroup;
        actualContacto.emailContactoGroup = params.socio.emailGroup;
        context.commit('UPDATE_FORM_CONTACTO',{ 'contacto':actualContacto, 'numContacto':params.numContacto });
/*         for (let i = 0; i < params.socio.telefonoSocioGroup.length; i++) {
            context.commit('updateContactoTelefonoFormFields',params.socio.telefonoSocioGroup);
            if (actualContacto.telefonoContactoGroup.length < params.socio.telefonoSocioGroup.length) {
                context.dispatch('addTelefonoGroup', { 'level':'contacto', 'index':i });
            }
            console.log('xoxo');

        // this.$store.dispatch('')
            // for (let j = 0; j < this.formFields[this.numContacto].telefonoContactoGroup.length; j++) {
            // this.formFields[this.numContacto].telefonoContactoGroup[i].telefono = data.socio.telefonoSocioGroup[i].telefono;
            // this.formFields[this.numContacto].telefonoContactoGroup[i].telefonoEspecifica = data.socio.telefonoSocioGroup[i].telefonoEspecifica;
            // this.formFields[this.numContacto].telefonoContactoGroup[i].telefonoNotas = data.socio.telefonoSocioGroup[i].telefonoNotas;
            // this.formFields[this.numContacto].telefonoContactoGroup[i].telefonoTipo = data.socio.telefonoSocioGroup[i].telefonoTipo;
            // }
        } */
        // for (let i = 0; i < data.socio.emailGroup.length; i++) {
        //     if (this.formFields[this.numContacto].emailContactoGroup.length < data.socio.emailGroup.length) {
        //         // this.addEmailGroup({'level':'contacto','index':this.numContacto});
        //         this.$store.dispatch(this.actualStore + 'addEmailGroup', {'level':'contacto','index':this.numContacto});
        //         // this.numContactoEmail++;
        //     }
        //     this.formFields[this.numContacto].emailContactoGroup[i].email = data.socio.emailGroup[i].email;
        // }
        // console.log(this.isDisabled);
    },
    addTelefonoGroup(context, data) {
        if (data.level == 'socio') {
            context.state.formFields.telefonoSocioGroup.push(defaultPhoneState());
        } else if (data.level == 'tutor') {
            context.state.formFields.tutorGroup[0].telefonoTutorGroup.push(defaultPhoneState());
        } else if (data.level == 'contacto') {
            context.state.formFields.contactoGroup[data.index].telefonoContactoGroup.push(defaultPhoneState());
        }
        context.commit('SET_FORM',context.state.formFields);
    },
    delTelefonoGroup(context, data) {
        if (data.level == 'socio') {
            context.state.formFields.telefonoSocioGroup.splice(data.numPhone,1);
        } else if (data.level == 'tutor') {
            context.state.formFields.tutorGroup[0].telefonoTutorGroup.splice(data.numPhone,1);
        } else if (data.level == 'contacto') {
            context.state.formFields.contactoGroup[data.numContacto].telefonoContactoGroup.splice(data.numPhone,1);
        }
        context.commit('SET_FORM',context.state.formFields);
    },
    addEmailGroup(context, data) {
        var group;
        switch (data.level) {
            case 'socio':
                group = context.state.formFields.emailGroup;
                break;
            case 'contacto' :
                // group = 'contactoGroup[data.numContacto].emailContactoGroup[0]';
                group = context.state.formFields.contactoGroup[data.index].emailContactoGroup;
                break;
            case 'tutor':
                group = context.state.formFields.tutorGroup[0].emailTutorGroup;
                break;
        }
        group.push({
            email: '',
        })
        context.commit('SET_FORM',context.state.formFields);
        // console.log(context.state.formFields[group]);
        // context.state.formFields[group].push({
        //     email: '',
        // })
        // if (data.level == 'socio') {
        //     context.state.formFields.emailGroup.push({
        //         email: '',
        //     });
        // } else if (data.level == 'contacto') {
        //     context.state.formFields.emailContactoGroup.push({
        //         email: '',
        //     });
        // }
        // context.state.formFields.emailGroup.push({
        //     email: '',
        // });
        // context.commit('SET_FORM',context.state.formFields);
    },
    delEmailGroup(context, data) {
        var group;
        switch (data.level) {
            case 'socio':
                group = context.state.formFields.emailGroup;
                break;
            case 'contacto' :
                // group = 'contactoGroup[data.numContacto].emailContactoGroup[0]';
                group = context.state.formFields.contactoGroup[data.numContacto].emailContactoGroup;
                break;
            case 'tutor':
                group = context.state.formFields.tutorGroup[0].emailTutorGroup;
                break;
        }
        group.splice(data.numEmail,1);
        // state.formFields.emailGroup.splice(index,1);
        context.commit('SET_FORM',context.state.formFields);
    },
    addContactoGroup(context) {
        context.state.formFields.contactoGroup.push(defaultContactoState());
        context.commit('SET_FORM',context.state.formFields);
    },
    delContactoGroup(context, index) {
        context.state.formFields.contactoGroup.splice(index,1);
        context.commit('SET_FORM',context.state.formFields);
    },
    addContactoTelefonoGroup(context, index) {
        context.state.formFields.contactoGroup[index].telefonoContactoGroup.push({
            telefonoContacto: '',
            telefonotipoContacto:'null',
            telefonoespecificaContacto: '',
            telefononotasContacto: '',
        });
        // this.SET_FORM;
        context.commit('SET_FORM',context.state.formFields);
    },
    addTutorGroup(context) {
        context.state.formFields.tutorGroup.push(defaultTutorState());
        context.commit('SET_FORM',context.state.formFields);
    },
    delTutorGroup(context) {
        context.state.formFields.tutorGroup.splice(index,1);
        context.commit('SET_FORM',context.state.formFields);
    },
    addCustomTutorField(context) {
        context.state.formFields.tutorGroup[0].personalizadosTutorGroup.push({
            titulo: '',
            valor: '',
        });
    },
    addCustomContactoField(context, index) {
        context.state.formFields.contactoGroup[index].personalizadosContactoGroup.push({
            titulo: '',
            valor: '',
        });
    },
    delCustomField(context, data) {
        if (data.level == 'contacto') {
            context.state.formFields.contactoGroup[data.numContacto].personalizadosContactoGroup.splice(data.num,1);
        } else if (data.level == 'tutor') {
            context.state.formFields.tutorGroup[0].personalizadosTutorGroup.splice(data.num,1);
        }
    },
    // addTutorTelefonoGroup(context) {
    //     context.state.formFields.tutorGroup[0].telefonoTutorGroup.push(defaultPhoneState());
    //     this.SET_FORM;
    // },
    resetFormFields(context,fields) {
        Object.assign(fields, defaultState())
    },
    resetTutorFields(context,fields) {
        Object.assign(fields,defaultTutorState());
    },
    resetContactoFields(context,fields) {
        Object.assign(fields,defaultContactoState());
    },
    resetPhoneGroup(context,level) {
        if (level == 'contacto') {

        } else if (level == 'tutor') {

        } else if (level == '') {

        }
    },
    addPagosGroup(context, data) {
        console.log(data);
/*         context.state.formFields.datosPago.push({
            tarifa: data.tarifa,
            importe: data.importe,
            formaPago: data.formaPago,
            cuenta: data.cuenta,
            fecha: data.fechaPago,
        }) */
        context.state.formFields.pagos.push({
            // tarifa: data.tarifa,
            importe: data.importe,
            formaPago: data.formaPago,
            fechaPago: data.fechaPago,
            fechaConfirmacion: data.fechaConfirmacion,
            estado: data.estado,
            cuenta: data.cuenta,
        });
        context.commit('SET_FORM',context.state.formFields);
    },
    addCinturon(context, data) {
        // let sortKey = ['blbl', 'blam', 'amam', 'amna', 'nana', 'nave', 'veve', 'veaz', 'azaz', 'azma', 'mama', 'mane', 'nene' ]
        // let sortByObj = data => data.reduce(
        //     (obj,item,index) => ({
        //         ...obj,
        //         [item]:index
        //     }), {}
        // )
        // console.log(sortByObj(sortKey));
        console.log(data);

        context.state.formFields.cinturones.splice(data.order, 0, { grado: data.grado, fecha: data.fecha, });
        // context.state.formFields.cinturones.push({
        //     grado: data.grado,
        //     fecha: data.fecha,
        // })
        context.commit('SET_FORM',context.state.formFields);
    },
    // delCinturon(context, data) {
    //     console.log(context.state.formFields.data)
    //     // context.commit('SET_FORM',context.state.formFields);
    // }
}

const mutations = {
    SET_FORM(state, data) {
        Object.keys(state).forEach(stateKey => {
            Object.keys(data).forEach(dataKey => {
                if (stateKey == dataKey) {
                    state[stateKey] = data[dataKey];
                }

            });
        });
        console.log(state);
        console.log(data);
        // state.nombre="arturo"
        // this.state.editForm = data;
        // state = data;
        // console.log(state);
        // console.log(this.state.editForm)
    },
    SET_PAGOS(state, data) {
        state.formFields.pagos.push(data)
        // state.formFields.pagos = data;
    },
    SET_DATOS_PAGO(state, data) {
        state.formFields.datosPago = data;
    },
    UPDATE_FORM_CONTACTO(state, data) {
        state.formFields.contactoGroup = data;
    },
    UPDATE_FORM_TUTOR(state, data) {
        state.formFields.tutorGroup[0] = data;
    },
    UPDATE_CINTURONES(state, data) {
        state.formFields.cinturones = data;
    }
    // addTelefonoGroup(state) {
    //     console.log('aaa');
    //     console.log(state);
    //     state.formFields.telefonoSocioGroup.push({
    //         telefonoSocio: '',
    //         telefonotipoSocio:'null',
    //         telefonoespecificaSocio: '',
    //         telefononotasSocio: '',
    //     });
    //     this.SET_FORM;
    // },
    // addTutorTelefonoGroup(state) {
    //     state.formFields.tutorGroup[0].telefonoTutorGroup.push({
    //         telefonoTutor: '',
    //         telefonotipoTutor:'null',
    //         telefonoespecificaTutor: '',
    //         telefononotasTutor: '',
    //     });
    //     this.SET_FORM;
    // },
    // addContactoTelefonoGroup(state,index) {
    //     state.formFields.contactoGroup[index].telefonoContactoGroup.push({
    //         telefonoContacto: '',
    //         telefonotipoContacto:'null',
    //         telefonoespecificaContacto: '',
    //         telefononotasContacto: '',
    //     });
    //     this.SET_FORM;
    // },
    // delTelefonoGroup(state,data) {
    //     if (data.level == 'socio') {
    //         state.formFields.telefonoSocioGroup.splice(data.numPhone,1);
    //     } else if (data.level == 'tutor') {
    //         state.formFields.tutorGroup[0].telefonoTutorGroup.splice(data.numPhone,1);
    //     } else if (data.level == 'contacto') {
    //         state.formFields.contactoGroup[data.numContacto].telefonoContactoGroup.splice(data.numPhone,1);
    //     }
    // },
    // addEmailGroup(state) {
    //     state.formFields.emailGroup.push({
    //         email: '',
    //     });
    // },
    // delEmailGroup(state,index) {
    //     state.formFields.emailGroup.splice(index,1);
    // },
    // addCustomField(state) {
    //     state.formFields.tutorGroup[0].personalizadosTutorGroup.push({
    //         titulo: '',
    //         valor: '',
    //     });
    // },
    // addContactoGroup(state) {
    //     state.formFields.contactoGroup.push({
    //         nombreContacto: '',
    //         telefonoContactoGroup: [{
    //             telefonoContacto: '',
    //             telefonotipoContacto:'null',
    //             telefonoespecificaContacto: '',
    //             telefononotasContacto: '',
    //         }],
    //         notasContacto: '',
    //         personalizadosContactoGroup: [],
    //     });
    // },
    // delContactoGroup(state,index) {
    //     state.formFields.contactoGroup.splice(index,1);
    // },
    // addCustomContactoField(state,index) {
    //     state.formFields.contactoGroup[index].personalizadosContactoGroup.push({
    //         titulo: '',
    //         valor: '',
    //     });
    // },
    // delCustomField(state,data) {
    //     if (data.level == 'contacto') {
    //         state.formFields.contactoGroup[data.numContacto].personalizadosContactoGroup.splice(data.num,1);
    //     } else if (data.level == 'tutor') {
    //         state.formFields.tutorGroup[0].personalizadosTutorGroup.splice(data.num,1);
    //     }
    // },
    // delCustomContactoField(state,index) {
    //     state.formFields.contactoGroup[0].personalizadosContactoGroup.splice(index,1);
    // }
}

const getters = {
    paymentData: state => {
        return state.formFields.datosPago;
    }
}

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters,
}
