<template>
    <transition appear name="fade-height">
        <div class="wrapper-dismissible">
            <div class="form-agrupation">
                <!-- Shown when the form is being edited  -->
                <b-btn-close
                    tabindex="-1"
                    v-if="!isDisabled"
                    @click="delFormElement({ _id: form._id, field: 'contacts', index: index })"></b-btn-close>
                <b-form-group>
                    <h5 md="4" class="subtitle">Persona de contacto</h5>
                </b-form-group>
                <!-- Shown when the form is being edited  -->
                <SearchAtForm
                    field="contacto"
                    v-if="!isDisabled"
                    :contactIndex="index"></SearchAtForm>
                <!-- Shown when the form is being edited and the contact is a customer too -->
                <b-button
                    size="sm"
                    title="Doble click para restablecer los datos"
                    v-b-tooltip.hover.noninteractive
                    v-if="_id && !isDisabled"
                    @dblclick="resetContact()">Restablecer</b-button>
                <!-- Shown when the contact is a customer too -->
                <b-form-group
                    v-if="_id">
                    <b-alert class="py-2" show variant="secondary">
                        Si quieres editar los datos del socio seleccionado
                        <b-link
                            target="_blank"
                            :to="{ name: 'customers.profile', params: { id: _id } }">
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
                <b-form-group class="wrapper-for-badge col-lg p-0" label="Nombre y apellidos del contacto">
                    <b-form-input
                        autocomplete="off"
                        type="text"
                        v-model="name"
                        v-validate="(!_id && !isDisabled) ? 'alpha_spaces|required' : ''"
                        :class="{ 'is-invalid' : errors.has('contacts-' + index + '-name') && (!_id && !isDisabled) }"
                        :disabled="!!_id || isDisabled"
                        :name="'contacts-' + index + '-name'"></b-form-input>
                    <transition mode="out-in" name="liveFeedbacks">
                        <b-form-invalid-feedback
                            v-if="errors.has('contacts-' + index + '-name')">
                            {{ errors.first('contacts-' + index + '-name') }}
                        </b-form-invalid-feedback>
                    </transition>
                    <!-- Shown when the form is being edited -->
                    <SearchBadge
                        class="label-badge"
                        searchField="name"
                        field="nombre"
                        v-if="!_id && !isDisabled"
                        :contact="true"
                        :contactIndex="index"
                        :id="'sb-contacto-name-' + index"
                        :searchValue="name"
                        @choosing="$validator.pause()"
                        @chosen="$validator.resume()"></SearchBadge>
                </b-form-group>
                <b-collapse
                    :visible="!contact.phones || contact.phones.length == 0">
                    <b-alert
                        class="py-2"
                        show
                        variant="info">
                        No has añadido ningún teléfono y es muy recomendable que el contacto tenga por lo menos uno.
                    </b-alert>
                </b-collapse>
                <PhoneBase
                    target="contacts"
                    v-for="(phone, phoneIndex) in contact.phones"
                    :contactIndex="index"
                    :isDisabled="!!_id || isDisabled"
                    :inPhone="phone"
                    :key="'contact_phone_' + phoneIndex"
                    :phoneIndex="phoneIndex"
                    @input="setContactFields({ _id: form._id, field: 'phones', fieldIndex: phoneIndex, contactIndex: index, newVal: $event })"></PhoneBase>
                <!-- Shown when the form is being edited and the contact is not a customer too -->
                <b-row
                    class="mb-4"
                    no-gutters
                    v-if="!_id && !isDisabled">
                    <b-button
                        class="ml-auto"
                        size="sm"
                        variant="ig-gradient"
                        @click="addNewElement({ _id: form._id, element: 'phones', entity: 'contacts', entityIndex : index })">
                        <fa-icon class="mr-2" icon="plus"></fa-icon>
                        Añadir teléfono
                    </b-button>
                </b-row>
                <b-collapse
                    :visible="!contact.emails || contact.emails.length == 0">
                    <b-alert
                        class="py-2"
                        show
                        variant="info">
                        No has añadido ningún email y es muy recomendable que el contacto tenga por lo menos uno.
                    </b-alert>
                </b-collapse>
                <EmailBase
                    target="contacts"
                    v-for="(email, emailIndex) in contact.emails"
                    :contactIndex="index"
                    :emailIndex="emailIndex"
                    :inEmail="email"
                    :isDisabled="!!_id || isDisabled"
                    :key="'contact_email_' + emailIndex"
                    @input="setContactFields({ _id: form._id, field: 'emails', fieldIndex: emailIndex, contactIndex: index, newVal: $event })"></EmailBase>
                <!-- Shown when the form is being edited and the contact is not a customer too -->
                <b-row
                    class="mb-4"
                    no-gutters
                    v-if="!_id && !isDisabled">
                    <b-button
                        class="ml-auto"
                        size="sm"
                        variant="ig-gradient"
                        @click="addNewElement({ _id: form._id, element: 'emails', entity: 'contacts', entityIndex : index })">
                        <fa-icon class="mr-2" icon="plus"></fa-icon>
                        Añadir email
                    </b-button>
                </b-row>
                <b-form-group label="Notas" label-for="notas-contacto">
                    <b-form-textarea
                        autocomplete="off"
                        class="col-lg"
                        no-resize
                        rows="2"
                        type="textarea"
                        v-model="notes"
                        :disabled="isDisabled"
                        :id="'notas-contacto-' + index "></b-form-textarea>
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
                return this.contact[key];
            },
            set(value) {
                this.setContactFields({ _id: this.form._id, field: key, contactIndex: this.index, newVal: value });
            }
        }
    });
    return result;
};
export default {
    computed: {
        ...computeBaseFields(['_id', 'customerNumber', 'name', 'notes']),
        ...mapGetters(['getDefaultState']),
        ...mapState({
            newCustomerForm: state => state.form,
            editCustomerForm: state => state.editform,
        }),
        /**
         * Serves the contact state from the store
         *
         * @return {Object} Object with the current contact data
         */
        contact() {
            return this.form.contacts[this.index];
        },
        /**
         * Defines the current form state (edit or new customer)
         *
         * @return {Object} The object with the form data from the customers state
         */
        form() {
            return this.$route.name == 'customers.new' ? this.newCustomerForm : this.editCustomerForm;
        },
    },
    inject: [
        '$validator', /* Inject the main $validator from the parent */
    ],
    methods: {
        ...mapActions(['addNewElement', 'delFormElement', 'setContactFields']),
        ...mapMutations(['SET_FIELD']),
        /**
         * Resets the contact filled, is called from the MainForm parent when the contact is a customer too
         */
        resetContact() {
            /* Pause the current validator instance to avoid errors on dynamic components */
            this.$validator.pause();
            this.SET_FIELD({ target: this.form.contacts, field: this.index, newVal: this.getDefaultState('contacts') });
            /* After fetch the data, reactive the current validator */
            this.$nextTick(() => {
                this.$validator.resume();
            });
        },
    },
    props: [
        'index', /* The contact index on the array of contacts of the parent */
        'isDisabled', /* Indicates if the form is being edited */
    ],
}
</script>
