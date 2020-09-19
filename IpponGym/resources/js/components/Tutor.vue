<template>
    <transition appear name="fade-height">
        <div class="wrapper-dismissible">
            <div class="form-agrupation">
                <!-- Shown when the form customer is not underage and the form is being edited -->
                <b-btn-close
                    tabindex="-1"
                    v-if="underage == false && !isDisabled"
                    @click="DEL_TUTOR(form)"></b-btn-close>
                <b-form-group>
                    <h5 md="4" class="subtitle">Tutor</h5>
                </b-form-group>
                <!-- Shown when the form dateofbirth is a valid date and renders a text if the customer is or not underage -->
                <b-alert
                    class="py-2"
                    show
                    variant="warning"
                    v-if="underage != null">
                    {{ underage == true ? 'El socio es menor de edad y es obligatorio rellenar los datos del tutor.' : 'El socio no es menor de edad y los datos del tutor son opcionales, se pueden borrar. Deberás actualizar la firma de la ficha de socio si estuviera asociada al tutor.' }}
                </b-alert>
                <!-- Shown when the form is being edited -->
                <SearchAtForm
                    field="tutor"
                    v-if="!isDisabled"></SearchAtForm>
                <b-button
                    size="sm"
                    title="Doble click para restablecer los datos"
                    v-b-tooltip.hover.noninteractive
                    v-if="_id && !isDisabled"
                    @dblclick="resetTutor()">Restablecer</b-button>
                <!-- Shown when the tutor is a customer too -->
                <b-form-group
                    v-if="_id">
                    <b-alert class="py-2" show variant="secondary">
                        Si quieres editar los datos del socio seleccionado
                        <b-link
                            target="_blank"
                            :to="{ name: 'customers.edit', params: { id: _id } }">
                            visita su ficha
                            <fa-icon class="ig-fa-inlinetext" icon="external-link-alt"></fa-icon>
                        </b-link>
                    </b-alert>
                    <b-form-row>
                        <b-col cols="6">
                            <small class="text-muted">
                                Número de socio:
                            </small>
                            <b-form-input
                                class="ig-background"
                                disabled
                                size="sm"
                                v-model="customerNumber"></b-form-input>
                        </b-col>
                        <b-col cols="6">
                            <small class="text-muted">
                                Identificador del socio:
                            </small>
                            <b-form-input
                                class="ig-background"
                                disabled
                                size="sm"
                                v-model="_id"></b-form-input>
                        </b-col>
                    </b-form-row>
                </b-form-group>
                <span class="form-row"> <!-- BUG -> Parent trigger the validation and the b-form-row don't show this validation, on events the validation its correct -->
                    <b-form-group class="wrapper-for-badge col-lg" label="Nombre y apellidos del tutor">
                        <b-form-input
                            autocomplete="off"
                            name="tutor-name"
                            type="text"
                            v-model="name"
                            v-validate="(!_id && !isDisabled) ? 'alpha_spaces|required' : ''"
                            :class="{ 'is-invalid' : errors.has('tutor-name') && (!_id && !isDisabled) }"
                            :disabled="!!_id || isDisabled"></b-form-input>
                        <transition mode="out-in" name="liveFeedbacks">
                            <b-form-invalid-feedback
                                v-if="errors.has('tutor-name')">
                                {{ errors.first('tutor-name') }}
                            </b-form-invalid-feedback>
                        </transition>
                        <!-- Shown when the form is being edited -->
                        <SearchBadge
                            class="label-badge"
                            field="nombre"
                            id="sb-tutor-name"
                            searchField="name"
                            v-if="!_id && !isDisabled"
                            :tutor="true"
                            :searchValue="name"
                            @choosing="$validator.pause()"
                            @chosen="$validator.resume()"></SearchBadge>
                    </b-form-group>
                    <b-form-group class="wrapper-for-badge col-lg-4" label="Dni del tutor">
                        <b-form-input
                            autocomplete="off"
                            name="tutor-dni"
                            type="text"
                            v-model="dni"
                            v-validate="(underage == true ? 'required' : '') + '|dnie|lengthDnie|dniTutorFounded:' + ($route.name != 'customers.new' ? getCustomerByField('dni', dni).filter(el => el._id != form._id).length : getCustomerByField('dni', dni).length)"
                            :class="{ 'is-invalid' : errors.has('tutor-dni') }"
                            :disabled="!!_id || isDisabled"
                            @drop.prevent
                            @focusout="dni = dni.toUpperCase()"
                            @keypress="$isAlphaNum($event)"
                            @paste="dni = $isAlphaNum($event)"></b-form-input>
                        <transition mode="out-in" name="liveFeedbacks">
                            <b-form-invalid-feedback
                                v-if="errors.has('tutor-dni')">
                                {{ errors.first('tutor-dni') }}
                            </b-form-invalid-feedback>
                        </transition>
                        <!-- Shown when the form is being edited -->
                        <SearchBadge
                            class="label-badge"
                            field="dni"
                            id="sb-tutor-dni"
                            searchField="dni"
                            v-if="!_id && !isDisabled"
                            :searchValue="dni"
                            :tutor="true"
                            @choosing="$validator.pause()"
                            @chosen="$validator.resume()"></SearchBadge>
                    </b-form-group>
                </span>
                <b-form-group label="Dirección del tutor">
                    <b-form-input
                        autocomplete="off"
                        name="tutor-address"
                        type="text"
                        v-model="address"
                        v-validate="(!_id && !isDisabled) ? 'required' : ''"
                        :class="{ 'is-invalid' : errors.has('tutor-address') && (!_id && !isDisabled) }"
                        :disabled="!!_id || isDisabled"></b-form-input>
                    <transition mode="out-in" name="liveFeedbacks">
                        <b-form-invalid-feedback
                            v-if="errors.has('tutor-address')">
                            {{ errors.first('tutor-address') }}
                        </b-form-invalid-feedback>
                    </transition>
                </b-form-group>
                <b-collapse
                    :visible="!tutor.phones || tutor.phones.length == 0">
                    <b-alert
                        class="py-2"
                        show
                        variant="info">
                        No has añadido ningún teléfono y es muy recomendable que el tutor tenga por lo menos uno.
                    </b-alert>
                </b-collapse>
                <PhoneBase
                    target="tutor"
                    ref="telefono"
                    v-for="(phone, phoneIndex) in tutor.phones"
                    :inPhone="phone"
                    :isDisabled="!!_id || isDisabled"
                    :key="'tutor_phone_' + phoneIndex"
                    :phoneIndex="phoneIndex"
                    :value="phone"
                    @input="setTutorFields({ _id: form._id, field: 'phones', fieldIndex: phoneIndex, newVal: $event })"></PhoneBase>
                <!-- Shown when the form is being edited and the tutor is not a customer -->
                <b-row
                    class="mb-4"
                    no-gutters
                    v-if="!_id && !isDisabled">
                    <b-button
                        class="ml-auto"
                        size="sm"
                        variant="ig-gradient"
                        @click="addNewElement({ _id: form._id, element: 'phones', entity: 'tutor' })">
                        <fa-icon class="mr-2" icon="plus"></fa-icon>
                        Añadir teléfono
                    </b-button>
                </b-row>
                <b-collapse
                    :visible="!tutor.emails || tutor.emails.length == 0">
                    <b-alert
                        class="py-2"
                        show
                        variant="info">
                        No has añadido ningún email y es muy recomendable que el tutor tenga por lo menos uno.
                    </b-alert>
                </b-collapse>
                <EmailBase
                    target="tutor"
                    v-for="(email, index) in tutor.emails"
                    :emailIndex="index"
                    :inEmail="email"
                    :isDisabled="!!_id || isDisabled"
                    :key="'tutor_email_' + index"
                    :value="email"
                    @input="setTutorFields({ _id: form._id, field: 'emails', fieldIndex: index, newVal: $event })"></EmailBase>
                <!-- Shown when the form is being edited and the tutor is not a customer -->
                <b-row
                    class="mb-4"
                    no-gutters
                    v-if="!_id && !isDisabled">
                    <b-button
                        class="ml-auto"
                        size="sm"
                        variant="ig-gradient"
                        @click="addNewElement({ _id: form._id, element: 'emails', entity: 'tutor' })">
                        <fa-icon class="mr-2" icon="plus"></fa-icon>
                        Añadir email
                    </b-button>
                </b-row>
                <b-form-group label="Notas" label-for="notas-tutor">
                    <b-form-textarea
                        autocomplete="off"
                        class="col-lg"
                        id="notas-tutor"
                        no-resize
                        rows="2"
                        type="textarea"
                        v-model="notes"
                        :disabled="isDisabled"></b-form-textarea>
                </b-form-group>
            </div>
        </div>
    </transition>
</template>
<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
/**
 * Add the getters and setters of the base fields provided
 *
 * @param {Array} keys: Array of Strings with the name of the fields to treat
 *
 * @return {Object} Object with the getters and setters
 */
function computeBaseFields(keys) {
    let result = {};
    keys.forEach((key) => {
        result[key] = {
            get() {
                return this.tutor[key];
            },
            set(value) {
                this.setTutorFields({ _id: this.form._id, field: key, newVal: value })
            }
        }
    });
    return result;
};
export default {
    computed: {
        ...computeBaseFields(['_id', 'customerNumber', 'name', 'address', 'dni', 'notes']),
        ...mapGetters(['getCustomerByField', 'getDefaultState']),
        ...mapState({
            newCustomerForm: state => state.form,
            editCustomerForm: state => state.editform,
        }),
        /**
         * Defines the current form state (edit or new customer)
         *
         * @return {Object} The object with the form data from the customers state
         */
        form() {
            return this.$route.name == 'customers.new' ? this.newCustomerForm : this.editCustomerForm;
        },
        /**
         * Serves the tutor state from the store
         *
         * @return {Object} Object with the current tutor data
         */
        tutor() {
            return this.form.tutor;
        },
    },
    inject: [
        '$validator', /* Inject the main $validator from the parent */
    ],
    methods: {
        ...mapActions(['addNewElement', 'setTutorFields']),
        ...mapMutations(['DEL_TUTOR', 'SET_FIELD']),
        resetTutor() {
            /* Pause the current validator instance to avoid errors on dynamic components */
            this.$validator.pause();
            this.SET_FIELD({ target: this.form, field: 'tutor', newVal: this.getDefaultState('tutor')});
            /* After fetch the data, reactive the current validator */
            this.$nextTick(() => {
                this.$validator.resume();
            });
        }
    },
    props: [
        'isDisabled', /* Indicates if the form is being edited */
        'underage', /* Informs if the dateofbirth on the parent is underage */
    ],
    /**
     * Provide the same $validator to the childs
     */
    provide() {
        return {
            $validator: this.$validator,
        }
    },
}
</script>
