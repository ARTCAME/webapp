<template>
    <div>
        <b-form @submit.prevent="$route.name == 'customers.edit' ? submitEdit() : $route.name == 'customers.new' ? submit() : null">
            <b-alert
                class="py-2"
                id="edit-alert"
                show
                variant="warning"
                v-if="$route.name == 'customers.edit' && !isDisabled">
                <h4 class="m-0">
                    Estás editando la ficha del socio. Recuerda guardar los cambios.
                </h4>
            </b-alert>
            <b-card no-body>
                <b-card-body>
                    <b-form-group>
                        <b-row no-gutters>
                            <h5 md="4" class="subtitle">Datos principales</h5>
                            <b-col
                                cols="12"
                                v-if="$route.name != 'customers.new'">
                                <b-row
                                    no-gutters>
                                    <b-col
                                        class="col-11 ml-auto mt-2"
                                        v-if="$route.name != 'customers.new'">
                                        <small class="customer-dates mr-2 text-muted">
                                            Fecha de alta: {{ form.created_at }}
                                        </small>
                                        <small class="customer-dates mr-2 text-muted">
                                            Última actualización: {{ form.updated_at }}
                                        </small>
                                    </b-col>
                                    <b-col class="col-1 mr-auto text-right">
                                        <span
                                            class="d-inline-block"
                                            v-b-tooltip.hover.left.noninteractive
                                            :title="active ? 'Socio activo' : 'Socio inactivo'">
                                            <b-form-checkbox
                                                class="ml-2 mt-2"
                                                switch
                                                v-model="active"
                                                :disabled="isDisabled || $route.name == 'customers.new'"></b-form-checkbox>
                                        </span>
                                    </b-col>
                                </b-row>
                            </b-col>
                        </b-row>
                    </b-form-group>
                    <b-container fluid class="col-sm">
                        <b-row>
                            <b-col
                                xl="3"
                                :class="'px-0' + ($route.name == 'customers.new' ? ' mb-3' : '')">
                                <WebCam
                                    ref="webcamcomponent"
                                    :isDisabled="isDisabled"></WebCam>
                            </b-col>
<!-- Id y número de socio -->
                            <!-- Shown on customers.profile and customers.edit pages -->
                            <b-col class="px-0" xl="9">
                                <b-form-row
                                    v-if="this.$route.params.id"
                                    :class="{ 'mb-4' : $route.name != 'customers.new' }">
                                    <b-col cols="6">
                                        <small class="text-muted">
                                            Número de socio:
                                        </small>
                                        <b-form-input
                                            class="ig-background"
                                            disabled
                                            size="sm"
                                            v-model="form.customerNumber"></b-form-input>
                                    </b-col>
                                    <b-col cols="6">
                                        <small class="text-muted">
                                            Identificador del socio:
                                        </small>
                                        <b-form-input
                                            class="ig-background"
                                            disabled
                                            size="sm"
                                            v-model="form._id"></b-form-input>
                                    </b-col>
                                </b-form-row>
<!-- Nombre y apellidos -->
                                <b-form-group
                                    label="Nombre y apellidos"
                                    label-for="nombre">
                                    <b-form-input
                                        autocomplete="false"
                                        autofocus
                                        foundable="true"
                                        id="nombre"
                                        name="nombre"
                                        trim
                                        type="text"
                                        v-if="form != null"
                                        v-model="name"
                                        v-validate="'required|alpha_dash'"
                                        :class="{ 'is-invalid' : errors.has('nombre') }"
                                        :disabled="isDisabled"
                                        @drop.prevent
                                        @keypress="$isAlphaDash($event)"
                                        @paste="name = $isAlphaDash($event)"></b-form-input>
                                    <transition mode="out-in" name="liveFeedbacks">
                                        <b-form-invalid-feedback
                                            v-for="error in errors.collect('nombre')"
                                            :key="error">
                                            {{ error }}
                                        </b-form-invalid-feedback>
                                    </transition>
                                    <SearchBadge
                                        field="nombre"
                                        id="sb-customer-name"
                                        searchField="name"
                                        v-if="!isDisabled"
                                        :customer="true"
                                        :searchValue="name"></SearchBadge>
                                </b-form-group>
<!-- Dirección principal -->
                                <b-form-group label="Dirección principal" label-class="m-0" label-for="direccion">
                                    <span class="text-muted">
                                        <small>La dirección debe tener la calle, el número, población y código postal, por ejemplo: Calle Leopoldo Romeo 9, 50002 Zaragoza</small>
                                    </span>
                                    <b-form-input
                                        autocomplete="off"
                                        id="direccion"
                                        name="direccion"
                                        type="text"
                                        v-if="form != null"
                                        v-model="address"
                                        v-validate="'required'"
                                        :class="{ 'is-invalid' : errors.has('direccion') }"
                                        :disabled="isDisabled"></b-form-input>
                                    <transition mode="out-in" name="liveFeedbacks">
                                        <b-form-invalid-feedback
                                            v-for="error in errors.collect('direccion')"
                                            :key="error">
                                            {{ error }}
                                        </b-form-invalid-feedback>
                                    </transition>
                                </b-form-group>
                            </b-col>
                        </b-row>
                    </b-container>
<!-- Teléfono -->
                    <b-collapse
                        :visible="!form.phones || form.phones.length == 0">
                        <b-alert
                            class="py-2"
                            show
                            variant="info">
                            No has añadido ningún teléfono y es muy recomendable que el socio tenga por lo menos uno.
                        </b-alert>
                    </b-collapse>
                    <PhoneBase
                        ref="telefono"
                        target="customer"
                        v-for="(phone, index) in form.phones"
                        :inPhone="phone"
                        :isDisabled="isDisabled"
                        :key="'customer_phone_' + index"
                        :phoneIndex="index"
                        @input="updateCustomerData({ field: 'phones', arrayIndex: index, newVal: $event, _id: form._id })"></PhoneBase>
                    <!-- Shown on customer edit -->
                    <b-row
                        class="mb-4"
                        no-gutters
                        v-if="!isDisabled">
                        <b-button
                            class="ml-auto"
                            size="sm"
                            variant="ig-gradient"
                            @click="addElement('phones', 'customer')">
                            <fa-icon class="mr-2" icon="plus"></fa-icon>
                            Añadir teléfono
                        </b-button>
                    </b-row>
<!-- Email -->
                    <b-collapse
                        :visible="!form.phones || form.emails.length == 0">
                        <b-alert
                            class="py-2"
                            show
                            variant="info">
                            No has añadido ningún email y es muy recomendable que el socio tenga por lo menos uno.
                        </b-alert>
                    </b-collapse>
                    <EmailBase
                        emailGroup="emailSocioGroup"
                        ref="email"
                        target="customer"
                        v-for="(email, emailIndex) in form.emails"
                        :emailIndex="emailIndex"
                        :inEmail="email"
                        :isDisabled="isDisabled"
                        :key="'customer_email_' + emailIndex"
                        @input="updateCustomerData({ field: 'emails', arrayIndex: emailIndex, newVal: $event, _id: form._id })"></EmailBase>
                    <!-- Shown on customer edit -->
                    <b-row
                        class="mb-4"
                        no-gutters
                        v-if="!isDisabled">
                        <b-button
                            class="ml-auto"
                            size="sm"
                            variant="ig-gradient"
                            @click="addElement('emails', 'customer')">
                            <fa-icon class="mr-2" icon="plus"></fa-icon>
                            Añadir email
                        </b-button>
                    </b-row>
<!-- Sexo -->
                    <b-form-row no-gutters>
                        <b-form-group
                            class="col col-12 col-sm-6 col-lg-auto"
                            id="sexo-group"
                            label="Sexo"
                            :disabled="isDisabled">
                            <b-form-radio-group
                                buttons
                                button-variant="outline-secondary"
                                class="radio-selector w-100"
                                id="sexo"
                                name="sexo"
                                v-validate="'required'"
                                :checked="gender"
                                :class="{ 'is-invalid' : errors.has('sexo') && !isDisabled }"
                                :options="genders"
                                :state="errors.has('sexo')"
                                @change="gender = $event"></b-form-radio-group>
                            <transition mode="out-in" name="liveFeedbacks">
                                <b-form-invalid-feedback
                                    v-if="errors.has('sexo')">
                                    {{ errors.first('sexo') }}
                                </b-form-invalid-feedback>
                            </transition>
                        </b-form-group>
<!-- Fecha nacimiento -->
                        <b-form-group class="col col-12 col-sm-6 col-lg" label="Fecha de nacimiento" label-for="fechanac">
                            <!-- v-if="form != null" -->
                            <b-form-input
                                id="fechanac"
                                name="fechanac"
                                type="date"
                                v-model="dateofbirth"
                                v-validate="'required|date_custom_rule'"
                                :class="'mr-1' + (errors.has('fechanac') ? ' is-invalid' : '')"
                                :disabled="isDisabled"></b-form-input>
                            <transition mode="out-in" name="liveFeedbacks">
                                <b-form-invalid-feedback
                                    v-for="error in errors.collect('fechanac')"
                                    :key="error">
                                    {{ error }}
                                </b-form-invalid-feedback>
                            </transition>
                        </b-form-group>
<!-- Es menor? -->
                        <b-form-group class="col col-12 col-sm-6 col-lg" label="¿Es menor?" label-for="esmenor">
                            <!-- v-if="form != null" -->
                            <b-form-input
                                autocomplete="off"
                                class="col-lg"
                                disabled
                                id="esmenor"
                                type="text"
                                :value="underage == null ? 'Fecha de nacimiento inválida' : underage == true ? 'Sí' : 'No'"></b-form-input>
                        </b-form-group>
<!-- Dni -->
                        <b-form-group
                            class="col col-12 col-sm-6 col-lg"
                            label="Dni"
                            label-for="dni">
                            <!-- v-if="form != null" -->
                            <!-- Disabled for tests -> v-validate="(underage != true ? 'required' : '') + '|dnie|lengthDnie|dniFounded:' + getCustomerByField('dni', dni).length" -->
                            <b-form-input
                                autocomplete="off"
                                id="dni"
                                name="dni"
                                type="text"
                                v-model="dni"
                                :class="{ 'is-invalid' : errors.has('dni') }"
                                :disabled="isDisabled"
                                @drop.prevent
                                @focusout="dni = dni.toUpperCase()"
                                @keypress="$isAlphaNum($event)"
                                @paste="dni = $isAlphaNum($event)"></b-form-input>
                            <b-tooltip
                                interactive="false"
                                placement="bottom"
                                show
                                target="dni"
                                trigger="hover"
                                v-if="underage == true && !isDisabled">
                                Al ser menor, puede que el socio no tenga dni. Si es así puedes dejar este campo vacío e incluir solo el del tutor en los datos del tutor o poner aquí también el del tutor.
                            </b-tooltip>
                            <transition mode="out-in" name="liveFeedbacks">
                                <b-form-invalid-feedback
                                    v-for="error in errors.collect('dni')"
                                    :key="error">
                                    {{ error }}
                                </b-form-invalid-feedback>
                            </transition>
                            <!-- Shown on customer edit -->
                            <SearchBadge
                                field="dni"
                                id="sb-customer-dni"
                                searchField="dni"
                                v-if="!isDisabled"
                                :customer="true"
                                :searchValue="dni"></SearchBadge>
                        </b-form-group>
                    </b-form-row>
<!-- Tutor -->
                    <!-- Shown when the customer is underage or if on customer edition/profile the tutor is filled -->
                    <Tutor
                        ref="tutor"
                        v-if="underage == true || ($route.name == 'customers.edit' && form.tutor) || ($route.name == 'customers.profile' && form.tutor)"
                        :isDisabled="isDisabled"
                        :underage="underage"></Tutor>
<!-- Contacto -->
                    <!-- Shown on customer edit -->
                    <b-row
                        class="mb-2"
                        no-gutters
                        v-if="!isDisabled">
                        <b-button
                            id="add-contacto"
                            size="sm"
                            variant="ig-gradient-reverse"
                            @click="addElement('contacts', 'customer')">
                            <fa-icon class="mr-2" icon="plus"></fa-icon>
                            Añadir persona de contacto
                        </b-button>
                    </b-row>
                    <Contact
                        ref="contacto"
                        v-for="(contact, index) in form.contacts"
                        :isDisabled="isDisabled"
                        :key="'contact_' + index"
                        :index=index></Contact>
<!-- Gestión de pagos -->
                    <b-form-group class="mt-5">
                        <h5 class="subtitle" md="4">Datos de pago</h5>
                        <!-- v-if="form != null" -->
                        <b-form-row>
                            <b-col cols="12" md>
                                <b-form-group
                                    class="p-0"
                                    id="tarifas-group"
                                    label="Tarifa"
                                    :disabled="isDisabled">
                                    <b-form-radio-group
                                        buttons
                                        button-variant="outline-secondary"
                                        class="radio-selector w-100"
                                        id="tarifa"
                                        name="tarifa"
                                        v-validate="'required'"
                                        :checked="rate"
                                        :class="{ 'is-invalid' : errors.has('tarifa') }"
                                        :options="rates"
                                        @change="rate = $event"
                                        @input="selectAmount()"></b-form-radio-group>
                                    <transition mode="out-in" name="liveFeedbacks">
                                        <b-form-invalid-feedback
                                            v-if="errors.has('tarifa')">
                                            {{ errors.first('tarifa') }}
                                        </b-form-invalid-feedback>
                                    </transition>
                                </b-form-group>
                            </b-col>
                            <b-col md="2">
                                <b-form-group label="Importe">
                                    <b-form-input
                                        name="importe"
                                        type="number"
                                        step="0.01"
                                        v-model="amount"
                                        v-validate="'required|between:10,99.99'"
                                        :class="{ 'is-invalid' : errors.has('importe') }"
                                        :disabled="isDisabled || !rate.startsWith('Personalizada')"
                                        @keypress="$isNumberDecimal($event)"></b-form-input>
                                    <transition mode="out-in" name="liveFeedbacks">
                                        <b-form-invalid-feedback
                                            id="amout-payment-data"
                                            v-for="error in errors.collect('importe')"
                                            :key="error">
                                            {{ error }}
                                        </b-form-invalid-feedback>
                                    </transition>
                                </b-form-group>
                            </b-col>
                        </b-form-row>
                        <b-form-row>
                            <b-col cols="12" md>
                                <b-form-group
                                    class="p-0"
                                    id="formas-pago-group"
                                    label="Formas de pago"
                                    :disabled="isDisabled">
                                    <b-form-radio-group
                                        buttons
                                        button-variant="outline-secondary"
                                        class="radio-selector w-100"
                                        id="tipoPago"
                                        name="tipoPago"
                                        v-validate="'required'"
                                        :checked="paymenttype"
                                        :class="{ 'is-invalid' : errors.has('tipoPago') }"
                                        :options="paymentTypes"
                                        @change="paymenttype = $event"></b-form-radio-group>
                                    <transition mode="out-in" name="liveFeedbacks">
                                        <b-form-invalid-feedback
                                            v-if="errors.has('tipoPago')">
                                            {{ errors.first('tipoPago') }}
                                        </b-form-invalid-feedback>
                                    </transition>
                                </b-form-group>
                            </b-col>
                        </b-form-row>
                        <transition appear name="fade-height">
                            <b-form-row
                                v-if="paymenttype == 'Domiciliación'">
                                <b-col cols="12" md>
                                    <b-form-group
                                        label="IBAN"
                                        label-for="iban">
                                        <!-- Disabled for tests -> v-validate="'required|iban'" -->
                                        <b-form-input
                                            id="iban"
                                            name="iban"
                                            placeholder="ES00 0000 0000 0000 0000"
                                            v-model="iban"
                                            :class="{ 'is-invalid' : errors.has('iban') }"
                                            :disabled="isDisabled || paymenttype != 'Domiciliación'"></b-form-input>
                                        <transition mode="out-in" name="liveFeedbacks">
                                            <b-form-invalid-feedback
                                                v-for="error in errors.collect('iban')"
                                                :key="error">
                                                {{ error }}
                                            </b-form-invalid-feedback>
                                        </transition>
                                    </b-form-group>
                                </b-col>
                                <b-col cols="12" md>
                                    <b-form-group
                                        label="Dni del titular"
                                        label-for="ibanownerdni">
                                        <!-- V-validate deshabilitado para pruebas  |dnie|lengthDnie' -->
                                        <b-form-input
                                            id="ibanownerdni"
                                            name="ibanownerdni"
                                            v-model="ibanownerdni"
                                            v-validate="'required'"
                                            :class="{ 'is-invalid' : errors.has('ibanownerdni') }"
                                            :disabled="isDisabled || paymenttype != 'Domiciliación'"
                                            @drop.prevent
                                            @focusout="ibanownerdni ? (ibanownerdni = ibanownerdni.toUpperCase()) : ''"
                                            @keypress="$isAlphaNum($event)"
                                            @paste="ibanownerdni = $isAlphaNum($event)"></b-form-input>
                                        <transition mode="out-in" name="liveFeedbacks">
                                            <b-form-invalid-feedback
                                                v-for="error in errors.collect('ibanownerdni')"
                                                :key="error">
                                                {{ error }}
                                            </b-form-invalid-feedback>
                                        </transition>
                                    </b-form-group>
                                </b-col>
                                <b-col cols="12" lg="6">
                                    <b-form-group
                                        label="Titular de la cuenta"
                                        label-for="ibanownername">
                                        <b-form-input
                                            id="ibanownername"
                                            name="ibanownername"
                                            v-model="ibanownername"
                                            v-validate="'required'"
                                            :class="{ 'is-invalid' : errors.has('ibanownername') }"
                                            :disabled="isDisabled || paymenttype != 'Domiciliación'"></b-form-input>
                                        <transition mode="out-in" name="liveFeedbacks">
                                            <b-form-invalid-feedback
                                                v-for="error in errors.collect('ibanownername')"
                                                :key="error">
                                                {{ error }}
                                            </b-form-invalid-feedback>
                                        </transition>
                                    </b-form-group>
                                </b-col>
                                <b-col
                                    cols="auto"
                                    v-if="!isDisabled">
                                    <span
                                        class="d-block"
                                        v-b-tooltip.hover.bottom.noninteractive
                                        :title="dni == '' || name == '' ? 'Debes rellenar el nombre y dni del socio' : ''">
                                        <b-button
                                            id="btn-ibanowner"
                                            variant="ig-outline-green"
                                            :disabled="dni == '' || name == ''"
                                            @click="fillIbanData()">Usar dni y nombre del socio</b-button>
                                    </span>
                                </b-col>
                            </b-form-row>
                        </transition>
                    </b-form-group>
<!-- Pagos -->
                    <!-- When the customer doesn't have payments show an alert -->
                    <b-form-group>
                        <h5 md="4" class="subtitle">Gestión de pagos</h5>
                        <b-alert
                            class="py-2"
                            show
                            variant="info"
                            v-if="hasPayments && $route.name == 'customers.edit' && !isDisabled">
                            Los cambios que hagas en los pagos se guardan al aplicarlos.
                        </b-alert>
                        <Payments
                            v-if="hasPayments"
                            :customer_id="form._id"
                            :isDisabled="isDisabled"
                            :tableFields="paymentsTableFields"
                            :tableItems="form.payments"></Payments>
                        <span
                            v-else-if="!hasPayments">
                            <b-alert class="py-2" show variant="secondary">
                                El socio aún no tiene pagos, en cuanto se generen los verás aquí.
                            </b-alert>
                        </span>
                    </b-form-group>
<!-- Cinturones -->
                    <transition appear name="fade-height">
                        <b-form-group
                            id="main-edit-cinturones"
                            v-if="rate.includes('Karate') || hasBelts">
                            <h5 md="4" class="subtitle">Histórico de cinturones</h5>
                            <span
                                v-if="$route.name != 'customers.new'">
                                <b-alert
                                    class="py-2"
                                    show
                                    variant="info"
                                    v-if="isDisabled == false && $route.name == 'customers.edit'">
                                    Los cambios que hagas a los grados se guardan al aplicarlos.
                                </b-alert>
                                <b-form-row id="btn-group-cinturones" class="my-4 mx-0" no-gutters>
                                    <b-form-checkbox-group
                                        buttons
                                        :disabled="isDisabled">
                                        <b-form-checkbox
                                            v-for="belt in form.belts"
                                            v-model="selectedBelts"
                                            :class="'mb-1 btn-cinturon ' + belt.grade"
                                            :key="belt.grade"
                                            :title="'Cinturón ' + belt.grade"
                                            :value="{ grade: belt.grade, date: belt.date }">
                                            {{ belt.date }}
                                        </b-form-checkbox>
                                    </b-form-checkbox-group>
                                </b-form-row>
                                <b-form-row
                                    class="ml-0"
                                    no-gutters
                                    v-if="!isDisabled">
                                    <b-form-input
                                        class="col-3"
                                        type="date"
                                        v-model="beltsNewDate"></b-form-input>
                                    <span
                                        v-b-tooltip.hover.noninteractive
                                        :title="selectedBelts.length == 0 ? 'Selecciona algún grado' : beltsNewDate == '' ? 'Selecciona una fecha' : 'Guarda la fecha seleccionado en los grados seleccionados'">
                                        <b-button
                                            class="ml-2"
                                            variant="outline-primary"
                                            :disabled="selectedBelts.length == 0 || beltsNewDate == ''"
                                            @click="beltsUpdate()">Aplicar nueva fecha</b-button>
                                    </span>
                                    <span
                                        v-b-tooltip.hover.noninteractive
                                        :title="selectedBelts.length == 0 ? 'Selecciona algún grado' : 'Borra la fecha de los grados seleccionados'">
                                        <b-button
                                            class="ml-2"
                                            variant="outline-danger"
                                            :disabled="selectedBelts.length == 0"
                                            @click="beltsDelete()">Borrar fecha</b-button>
                                    </span>
                                </b-form-row>
                            </span>
                            <span
                                v-else-if="$route.name == 'customers.new'">
                                <b-alert class="py-2" show variant="secondary">
                                    Una vez guardes la ficha del socio podrás editar los grados.
                                </b-alert>
                            </span>
                        </b-form-group>
                    </transition>
<!-- Firma y documentos -->
                    <b-form-group>
                        <h5 md="4" class="subtitle">Firma y documentos</h5>
                        <b-alert
                            class="mt-2"
                            show
                            variant="danger"
                            v-if="$route.name == 'customers.new'">
                            Tanto si el socio acepta como si no alguna de las condiciones legales deberá firmar para que así conste.<br>
                            Los documentos firmados se descargarán al guardar la ficha.
                            <span
                                v-if="underage">
                                <br><br>
                                <u>Atención: El socio es menor y debe firmar su tutor, recuerda rellenar correctamente el nombre, apellidos y dni del tutor</u>
                            </span>
                            <span
                                v-else>
                                <br><br>
                                <u>Atención: Recuerda rellenar correctamente el nombre, apellidos y dni del socio</u>
                            </span>
                        </b-alert>
                        <b-alert
                            dismissible
                            show
                            variant="warning"
                            v-if="$route.name != 'customers.new' && form.tutor && wasUnderage && !underage">
                            <u>Importante: El socio se dio de alta como menor por lo que está vinculado a un tutor, a día de hoy ya no es menor pero existe un tutor y la firma puede estar vinculada a él. Recuerda que debes actualizar la firma si estuviera vinculada al tutor y borrar los datos del tutor si ya no fueran necesarios</u>
                        </b-alert>
                        <b-row>
                            <b-col class="col-12 col-md-6 mb-4">
                                <WacomSign
                                    ref="wacomsign"
                                    :isDisabled="isDisabled"
                                    :form="form"
                                    :underage="underage"></WacomSign>
                            </b-col>
                            <b-col class="my-auto">
                                <b-row>
                                    <b-col class="text-right" cols="7">
                                        <label>
                                            Acepta la política de privacidad
                                        </label>
                                    </b-col>
                                    <b-col class="p-0">
                                        <b-form-group
                                            class="d-inline mr-3"
                                            :disabled="isDisabled">
                                            <b-form-radio-group
                                                buttons
                                                button-variant="outline-secondary"
                                                class="radio-selector tiny-radio-selector"
                                                id="rightsProtect"
                                                name="rightsProtect"
                                                size="sm"
                                                v-validate="'required'"
                                                :checked="rightsProtect"
                                                :class="{ 'is-invalid' : errors.has('rightsProtect') && !isDisabled }"
                                                :options="yesno"
                                                :state="errors.has('rightsProtect')"
                                                @change="rightsProtect = $event"></b-form-radio-group>
                                            <transition mode="out-in" name="liveFeedbacks">
                                                <b-form-invalid-feedback
                                                    v-if="errors.has('rightsProtect')">
                                                    {{ errors.first('rightsProtect') }}
                                                </b-form-invalid-feedback>
                                            </transition>
                                        </b-form-group>
                                        <span
                                            class="d-inline-block"
                                            v-b-tooltip.hover.noninteractive
                                            :title="printRightsProtect == true ? 'Descargando...' : 'Descargar'">
                                            <b-button
                                                class="btn-fa-tiny"
                                                size="sm"
                                                variant="outline-primary"
                                                v-if="$route.name != 'customers.new'"
                                                :disabled="printRightsProtect"
                                                @click="printFile('RP')">
                                                <b-spinner
                                                    small
                                                    type="grow"
                                                    v-if="printRightsProtect == true"></b-spinner>
                                                <fa-icon
                                                    icon="file-download"
                                                    v-else></fa-icon>
                                            </b-button>
                                        </span>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col class="text-right" cols="7">
                                        <label>
                                            Acepta la cesión de imagen
                                        </label>
                                    </b-col>
                                    <b-col class="p-0">
                                        <b-form-group
                                            class="d-inline mr-3"
                                            :disabled="isDisabled">
                                            <b-form-radio-group
                                                buttons
                                                button-variant="outline-secondary"
                                                class="radio-selector tiny-radio-selector"
                                                id="rightsImage"
                                                name="rightsImage"
                                                size="sm"
                                                v-validate="'required'"
                                                :checked="rightsImage"
                                                :class="{ 'is-invalid' : errors.has('rightsImage') && !isDisabled }"
                                                :options="yesno"
                                                :state="errors.has('rightsImage')"
                                                @change="rightsImage = $event"></b-form-radio-group>
                                            <transition mode="out-in" name="liveFeedbacks">
                                                <b-form-invalid-feedback
                                                    v-if="errors.has('rightsImage')">
                                                    {{ errors.first('rightsImage') }}
                                                </b-form-invalid-feedback>
                                            </transition>
                                        </b-form-group>
                                        <span
                                            class="d-inline-block"
                                            v-b-tooltip.hover.noninteractive
                                            :title="printRightsImage == true ? 'Descargando...' : 'Descargar'">
                                            <b-button
                                                class="btn-fa-tiny"
                                                size="sm"
                                                variant="outline-primary"
                                                v-if="$route.name != 'customers.new'"
                                                :disabled="printRightsImage"
                                                @click="printFile('RI')">
                                                <b-spinner
                                                    small
                                                    type="grow"
                                                    v-if="printRightsImage == true"></b-spinner>
                                                <fa-icon
                                                    icon="file-download"
                                                    v-else></fa-icon>
                                            </b-button>
                                        </span>
                                    </b-col>
                                </b-row>
                                <!-- Shown if the customer is underage -->
                                <b-row
                                    v-if="underage">
                                    <b-col class="text-right" cols="7">
                                        <label>
                                            Autorización de menor
                                        </label>
                                    </b-col>
                                    <b-col class="p-0">
                                        <b-form-group
                                            class="d-inline mr-3"
                                            :disabled="isDisabled">
                                            <b-form-radio-group
                                                buttons
                                                button-variant="outline-secondary"
                                                class="radio-selector tiny-radio-selector"
                                                id="rightsUnderage"
                                                name="rightsUnderage"
                                                size="sm"
                                                v-validate="'required'"
                                                :checked="rightsUnderage"
                                                :class="{ 'is-invalid' : errors.has('rightsUnderage') && !isDisabled }"
                                                :options="yesno"
                                                :state="errors.has('rightsUnderage')"
                                                @change="rightsUnderage = $event"></b-form-radio-group>
                                            <transition mode="out-in" name="liveFeedbacks">
                                                <b-form-invalid-feedback
                                                    v-if="errors.has('rightsUnderage')">
                                                    {{ errors.first('rightsUnderage') }}
                                                </b-form-invalid-feedback>
                                            </transition>
                                        </b-form-group>
                                        <span
                                            class="d-inline-block"
                                            v-b-tooltip.hover.noninteractive
                                            :title="printRightsUnderage == true ? 'Descargando...' : 'Descargar'">
                                            <b-button
                                                class="btn-fa-tiny"
                                                size="sm"
                                                variant="outline-primary"
                                                v-if="$route.name != 'customers.new'"
                                                :disabled="printRightsUnderage"
                                                @click="printFile('RU')">
                                                <b-spinner
                                                    small
                                                    type="grow"
                                                    v-if="printRightsUnderage == true"></b-spinner>
                                                <fa-icon
                                                    icon="file-download"
                                                    v-else></fa-icon>
                                            </b-button>
                                        </span>
                                    </b-col>
                                </b-row>
                            </b-col>
                        </b-row>
                    </b-form-group>
                    <!-- Test -->
                    <div class="printable-wrp">
                        <div class="pr-1 printable-ctn" ref="printableMFRP">
                            <RightsUnderage
                                :customer="getCustomerById($route.params.id)"></RightsUnderage>
                            <!-- MISSING THE REST OF FILE TYPES -->
                        </div>
                    </div>
                    <!-- Test -->
                    <div class="printable-wrp">
                        <div class="pr-1 printable-ctn" ref="printableMFRU">
                            <RightsUnderage
                                :customer="getCustomerById($route.params.id)"></RightsUnderage>
                            <!-- MISSING THE REST OF FILE TYPES -->
                        </div>
                    </div>
                    <!-- Test -->
                    <div class="printable-wrp">
                        <div class="pr-1 printable-ctn" ref="printableMFRI">
                            <RightsUnderage
                                :customer="getCustomerById($route.params.id)"></RightsUnderage>
                            <!-- MISSING THE REST OF FILE TYPES -->
                        </div>
                    </div>
                </b-card-body>
            </b-card>
            <b-row class="my-3" no-gutters>
                <b-col cols="auto">
                    <b-button
                        v-if="$route.name != 'customers.profile'"
                        @click="validateForm()">
                        <fa-icon class="d-inline-block mr-2" icon="check"></fa-icon>
                        Validar
                    </b-button>
                </b-col>
                <b-col>
                    <b-row align-h="end" no-gutters>
                        <transition-group name="slide-fade">
                            <b-button
                                key="mf-btn-submit"
                                type="submit"
                                variant="ig-solid-green"
                                v-if="$route.name == 'customers.edit' || $route.name == 'customers.new'">
                                <fa-icon class="d-inline-block mr-2" icon="save"></fa-icon>
                                Guardar
                            </b-button>
                            <b-button
                                class="ml-2"
                                key="mf-btn-edit"
                                v-if="$route.name == 'customers.edit' || $route.name == 'customers.profile'"
                                :variant="$route.name == 'customers.edit' ? 'warning' : 'primary'"
                                @click="manageEditBtn()">
                                {{ $route.name == 'customers.edit' ? 'Cancelar la edición': 'Editar al socio' }}
                            </b-button>
                        </transition-group>
                    </b-row>
                </b-col>
            </b-row>
        </b-form>
    </div>
</template>
<script>
    import { http } from '../utils/http';
    import html2canvas from 'html2canvas';
    import jsPDF from 'jspdf';
    import NProgress from 'nprogress';
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
    /**
     * Map the keys passed to mount their vuex getters and setters
     *
     * @param {Array} keys: strings to make their getters and setters
     *
     * @returns the object composed by the getters and setters
     */
    function computeBaseFields(keys) {
        let result = {};
        keys.forEach(key => {
            result[key] = {
                get() {
                    return this.form[key];
                },
                set(value) {
                    /* The id will be null on customers.new page, its managed at vuex */
                    this.updateCustomerData({ _id: this.form._id, field: key, newVal: value });
                    /* A customer has be at minium 3 years old */
                    if (key == 'dateofbirth') {
                        this.underage == true && this.form.tutor == null && this.ADD_TUTOR(this.form);
                    }
                }
            }
        });
        return result;
    };
    /**
     * Map the keys on the object passeds to mount their vuex getters and setters
     *
     * @param {Array} keys: strings to make their getters and setters
     * @param {String} object: the name of the parent object of the keys
     *
     * @returns the object composed by the getters and setters of the parent passed
     */
    function computeObjectFields(keys, object) {
        let result = {};
        keys.forEach(key => {
            result[key] = {
                get() {
                    return this.form[object][key];
                },
                set(value) {
                    /* The id will be null on customers.new page, its managed at vuex */
                    this.updateCustomerData({ _id: this.form._id, objectKey: object, field: key, newVal: value });
                    // this.UPDATE_FIELD({ target: this.form[object], field: key, newVal: value });
                }
            }
        });
        return result;
    };
    export default {
        data() {
            return {
                beltsNewDate: '', /* v-model to the new belts ndate */
                genders: [
                    { text: 'Mujer', value: 'mujer' },
                    { text: 'Hombre', value: 'hombre' },
                ], /* Options to gender selector */
                isDisabled: false, /* Flag to determine the disable state of the editable fields, on edit always is loaded as true */
                paymentsTableFields: [
                    { key: 'rate', label: 'Tarifa', sortable: true, },
                    { key: 'amount', label: 'Importe', sortable: true, },
                    { key: 'paymenttype', label: 'Forma de pago', sortable: true, },
                    { key: 'iban', label: 'Iban', sortable: true, },
                    { key: 'interval', label: 'Periodo', sortable: true, },
                    { key: 'status', label: 'Estado', sortable: true, },
                    { key: 'dateconfirmed', label: 'Confirmado', sortable: true, },
                    { key: 'editRow', label: 'editRow', label: '', class: 'tableEditRow text-center'},
                ], /* Payment table fields */
                paymentTypes: [
                    { value: 'Domiciliación', text: 'Domiciliación' },
                    { value: 'Tarjeta', text: 'Tarjeta' },
                    { value: 'Efectivo', text: 'Efectivo' },
                ], /* Options to the checkbox of the payment types */
                printRightsImage: false, /* Flag to improve userx on print */
                printRightsProtect: false, /* Flag to improve userx on print */
                printRightsUnderage: false, /* Flag to improve userx on print */
                rates: [
                    { value: 'Karate', text: 'Karate' }, /* 32 */
                    { value: 'Dirigidas', text: 'Dirigidas' }, /* 40 */
                    { value: 'Dirigidas + Karate', text: 'Dirigidas + Karate' }, /* 45 */
                    { value: 'Personalizada', text: 'Personalizada' }, /* 0 */
                    { value: 'Personalizada + Karate', text: 'Personalizada + Karate' }, /* 0 */
                ], /* Options to the checkbox of the rate types */
                selectedBelts: [], /* Grades selected to delete */
                submitting: false, /* Flag to avoid alert the customer at the page leave */
                yesno: [
                    { value: true, text: 'Sí' },
                    { value: false, text: 'No' }
                ], /* Options for select element */
            }
        },
        beforeRouteEnter(to, from, next) {
            /* If we are on a customer edit */
            if (to.name == 'customers.edit') {
                next(vm => {
                    /* Enable the editable fields of the form */
                    vm.isDisabled = false;
                    /* Pause the validations before load the new customer to prevent validation errors at assign the validation again to the reusable components */
                    vm.$validator.pause();
                    /* To reload the data between customers is mandatory clean before */
                    if (from.name == 'customers.profile' || from.name == 'customers.edit') {
                        vm.CLEAR_FORM('editform');
                    }
                    /* Load the customer */
                    vm.fetchEditForm(vm.$route.params.id)
                        .then(() => {
                            /* Start vee-validate stopped */
                            vm.$validator.resume();
                            /* Reset all the previous validations */
                            vm.$validator.reset();
                        });
                });
            /* If we are seeing a existing customer */
            } else if (to.name == 'customers.profile') {
                next(vm => {
                    /* Disable all the editable fields of the form */
                    vm.isDisabled = true;
                    /* Pause the validations before load the new customer to prevent validation errors at assign the validation again to the reusable components */
                    vm.$validator.pause();
                    /* To reload the data between customers is mandatory clean before */
                    if (from.name == 'customers.profile' || from.name == 'customers.edit') {
                        vm.CLEAR_FORM('editform');
                    }
                    /* Load the customer */
                    vm.fetchEditForm(vm.$route.params.id)
                        .then(() => {
                            /* Start vee-validate stopped @beforeRouteLeave */
                            vm.$validator.resume();
                            /* Reset all the previous validations */
                            vm.$validator.reset();
                        });
                });
            /* If are creating a new customer */
            } else if (to.name == 'customers.new') {
                next(vm => {
                    /* Pause the validations before load the new customer to prevent validation errors at assign the validation again to the reusable components */
                    vm.$validator.pause();
                    /* Start vee-validate stopped @beforeRouteLeave */
                    vm.$validator.resume();
                    /* Reset all the previous validations */
                    vm.$validator.reset();
                    /* Enable the fields of the form */
                    vm.isDisabled = false;
                });
            }
        },
        beforeRouteLeave(to, from, next) {
            /* Stops the webcam and sign components */
            this.$refs.webcamcomponent.cancel();
            // this.$refs.wacomsign.disconnect();
            /* Confirm the left with the user */
            let answer = true;
            if (!this.submitting && from.name != 'customers.profile') {
                answer = confirm('No has guardado los cambios, ¿seguro que quieres salir?');
                if (!answer) {
                    next(false);
                }
            }
            if (answer) {
                /* Pause the validations before leave the page to prevent errors at assign the validation again to the reusable components */
                this.$validator.pause();
                next();
            }
        },
        beforeRouteUpdate (to, from, next) {
            /* Stops the webcam and sign components */
            this.$refs.webcamcomponent.cancel();
            // this.$refs.wacomsign.disconnect();
            /* Stops the validation to avoid false errors */
            this.$validator.pause();
            let result = true;
            if (!this.submitting && from.name != 'customers.profile') {
                result = confirm('No has guardado los cambios, ¿seguro que quieres salir?');
            }
            if (result) {
                if (to.name == 'customers.profile' || to.name == 'customers.edit') {
                    /* To reload the data between customers is mandatory clean before */
                    if (from.name == 'customers.profile' || from.name == 'customers.edit') {
                        this.CLEAR_FORM('editform');
                    }
                    if (to.name == 'customers.profile'){
                        /* Disable all the editable fields of the form */
                        this.isDisabled = true;
                    }
                    /* Load the editform state */
                    this.fetchEditForm(to.params.id)
                        .then((response) => {
                            // if (response == '404') {
                            //     next('/404');
                            // } else {
                                next();
                            // }
                            this.$validator.resume();
                        });
                }
                if (to.name == 'customers.new') {
                    /* Load the new customer form */
                    this.fetchForm(to.params.id)
                        .then((response) => {
                            // if (response == '404') {
                            //     next('/404');
                            // } else {
                                next();
                            // }
                            this.$validator.resume();
                        });
                }
            }
        },
        created() {
            /* Prevents leave the page when changes has been made */
            window.addEventListener('beforeunload', this.beforeUnload);
            /* Listen to the scroll and load changes */
            window.addEventListener('resize', this.stackRadios);
            window.addEventListener('load', this.stackRadios);
        },
        computed: {
            /* Mount the vuex getters and setters to the local form fields (the childrens has its computations too */
            ...computeBaseFields(['active', 'address', 'dateofbirth', 'dni', 'gender', 'name', 'notes', 'rightsImage', 'rightsProtect', 'rightsUnderage']),
            ...computeObjectFields(['rate', 'amount', 'paymenttype', 'iban', 'ibanownername', 'ibanownerdni',], 'paymentData'),
            /* Mapping vuex */
            ...mapGetters(['getCustomerByField', 'getCustomerById', 'getDefaultState']),
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
             * Determine if the current form state has belts setted
             *
             * @returns {Boolean} Boolean that indicates if the current customer has or not any belt reached
             */
            hasBelts() {
                return this.form.belts.some(belt => belt.date != null);
            },
            /**
             * Determine if the current form state has payments registered
             *
             * @returns {Boolean} Boolean that indicates if the current customer has or not any payment registered
             */
            hasPayments() {
                return this.form.payments.length > 0;
            },
            /**
             * Determines if the current dateofbirth selected is between 3 and 18
             *
             * @return {Boolean|Null} If the age is under 3 years returns null, if the age is between 3 and 18 returns true, if is 18 or more returns false
             */
            underage() {
                if (this.$moment(this.dateofbirth, 'YYYY-MM-DD').isValid() && 3 <= this.$moment().diff(this.$moment(this.dateofbirth, 'YYYY-MM-DD'), 'years')) {
                    return this.$moment().diff(this.$moment(this.dateofbirth, 'YYYY-MM-DD'), 'years') < 18;
                }
                return null;
            },
            /**
             * Determine if a customer was underage on the signup date
             *
             * @return {Boolean} If the customer was underage on the signup date returns true
             */
            wasUnderage() {
                return this.$moment(this.form.created_at, 'YYYY-MM-DD').diff(this.$moment(this.dateofbirth, 'YYYY-MM-DD')) < 18;
            }
        },
        destroyed() {
            /* Destroy de listeners */
            window.removeEventListener('beforeunload', this.beforeUnload);
            window.removeEventListener('resize', this.stackRadios);
            window.removeEventListener('load', this.stackRadios);
        },
        methods: {
            /* Mapping vuex */
            ...mapActions(['addNewCustomer', 'addNewElement', 'delFormElement', 'deleteBelts', 'getAllCustomers', 'fetchEditForm', 'fetchForm', 'setCustomerEdited', 'updateCustomerData']),
            ...mapMutations(['ADD_TUTOR', 'CLEAR_FORM', 'UPDATE_FIELD']),
            /**
             * Call to the mutation that add dynamic elements to the form
             *
             * @param {String} element: the name of the element to add
             * @param {String} entity: the name of the entity to add on it the element
             */
            addElement(element, entity) {
                const _id = this.form._id != null ? this.form._id : null;
                this.addNewElement({ _id: _id, element: element, entity: entity });
            },
            /**
             * Prevent leave the page with changes unsaved
             *
             * @param {Event} ev: the event fired
             */
            beforeUnload(ev) {
                let answer = true;
                /* From Chrome 60 onward, the beforeunload dialog will only appear if the frame attempting to display it has received a user gesture or user interaction (or if any embedded frame has received such a gesture). */
                if (!this.submitting && this.$route.name != 'customers.profile') {
                    answer = confirm('No has guardado los cambios, ¿seguro que quieres salir?');
                    if (!answer) {
                        ev.preventDefault();
                        /* Chromium requires returnValue to stop the default propagation */
                        ev.returnValue = '';
                    }
                }
            },
            /**
             * On delete belts (set its date as null) commit it at vuex, the api save is do it at the save of the edit or new customer
             */
            async beltsDelete() {
                try {
                    const response = await this.deleteBelts({ id: this.form._id, selectedBelts: this.selectedBelts});
                    this.$showToast('success', 'Se han guardado los cambios.', 'Grados actualizados correctamente', 5000);
                } catch(error) {
                    this.$showToast('danger', 'No se ha podido completar la operación. Código de error: FESoFo@BeDe', 'Ha ocurrido un error')
                    console.error(error.response ? error.response.data : error);
                }
                /* Reset the inputs and selectors involved */
                this.beltsResetFields();
            },
            /**
             * Reset the values that manages the belts modifications
             */
            beltsResetFields() {
                /* Empty the selected belts array */
                this.selectedBelts = [];
                /* Set the v-model of the belts date to its initial value */
                this.beltsNewDate = '';
            },
            /**
             * Commit the new date selected on vuex for the belts selecteds
             */
            async beltsUpdate() {
                try {
                    const response = await http.post('/api/updateBelts', ({ id: this.form._id, belts: this.selectedBelts, date: this.$moment(this.beltsNewDate).format('DD-MM-YYYY') }));
                    this.UPDATE_FIELD({ target: this.form, field: 'belts', newVal: response.data.updatedBelts });
                    this.$showToast('success', 'Se han guardado los cambios.', 'Grados actualizados correctamente', 5000);
                } catch(error) {
                    this.$showToast('danger', 'No se ha podido completar la operación. Código de error: FESoFo@BeUp', 'Ha ocurrido un error')
                    console.error(error.response ? error.response.data : error);
                }
                /* Reset the inputs and selectors involved */
                this.beltsResetFields();
            },
            /**
             * Fill the iban owner data with the customer data
             */
            fillIbanData() {
                this.ibanownername = this.name;
                this.ibanownerdni = this.dni;
            },
            /**
             * Prompt to the user a confirm message when the edition of the customer wants to be cancelled
             *
             * @return {Promise} A promise with the new route to navigate
             */
            manageEditBtn() {
                if (this.$route.name == 'customers.edit') {
                    return this.$router.push({ name: 'customers.profile', params: { id: this.form._id } });
                } else {
                    return this.$router.push({ name: 'customers.edit', params: { id: this.form._id } });
                }
            },
            /**
             * Download the documentation
             *
             * @param {String} file: informs the file to download
             *
             * @return {Promise}
             */
            printFile(file) {
                return new Promise((resolve, reject) => {
                    const filename = this.form.name.replace(/\s/g, '') + '__' + (file == 'RI' ? 'derechosdeimagen' : file == 'RU' ? 'autorizacióndemenor' : 'proteccióndedatos') + '__' + this.$moment().format('YYYY-MM-DD_HH_mm') + '.pdf';
                    const variable = file == 'RI' ? 'printRightsImage' : file == 'RU' ? 'printRightsUnderage' : 'printRightsProtect';
                    /* Active the flag to userx and disallow multiple downloads */
                    this[variable] = true;
                    this.$html2print(filename, this.$refs['printableMF' + file])
                        .then(() => {
                            /* Restore the flag to userx and disallow multiple downloads */
                            setTimeout(() => {
                                this[variable] = false;
                            }, 300);
                            resolve();
                        })
                        .catch(error => {
                            reject(error);
                        });
                });
            },
            /**
             * Sets the value of the amount field based on the rate selected, the custome rates (personalizadas) let the amount field editable
             */
            selectAmount() {
                switch(this.rate) {
                    case 'Karate':
                        this.amount = 32;
                        break;
                    case 'Dirigidas + Karate':
                        this.amount = 45;
                        break;
                    case 'Dirigidas':
                        this.amount = 50;
                        break;
                    default:
                        this.amount = '';
                }
            },
            /**
             * Manages the stacking of the radio selectors
             */
            stackRadios() {
                if (window.innerWidth < 650) {
                    document.getElementById('tarifa').classList.add('btn-group-vertical');
                    document.getElementById('tipoPago').classList.add('btn-group-vertical');
                    document.getElementById('tarifa').classList.remove('btn-group');
                    document.getElementById('tipoPago').classList.remove('btn-group');
                } else if (window.innerWidth >= 650 && (document.getElementById('tarifa').classList.contains('btn-group-vertical') || document.getElementById('tipoPago').classList.contains('btn-group-vertical'))) {
                    document.getElementById('tarifa').classList.remove('btn-group-vertical');
                    document.getElementById('tipoPago').classList.remove('btn-group-vertical');
                    document.getElementById('tarifa').classList.add('btn-group');
                    document.getElementById('tipoPago').classList.add('btn-group');
                }
            },
            /**
             * Submits the form
             */
            submit() {
                /* Change the submit flag to avoid alert the customer at the page leave */
                this.submitting = true;
                /* First of all validate de form (at the backend it will be validated too) */
                this.$validator.validateAll()
                    .then(async result => {
                        /* If the form isn't shows modal and mark the incorrect fields */
                        if (!result) {
                            this.$bvModal.msgBoxOk('Se han encontrado ' + this.errors.all().length + ' errores en el formulario. Revisa los campos marcados.', {
                                buttonSize: 'sm',
                                centered: true,
                                okTitle: 'Aceptar',
                                size: 'sm',
                                title: 'Hay campos incorrectos',
                            });
                        } else {
                            try {
                                /* Clean the form to store it */
                                this.submitCleanData();
                                /* Save the form on the database */
                                const response = await http.post('/api/newCustomer', this.form);
                                /* Add the new customer to the customers state */
                                this.addNewCustomer(response.data.newCustomer)
                                    .then(async id => {
                                        /* Clear the form state */
                                        this.CLEAR_FORM('form');
                                        await this.$router.push({ name: 'customers.profile', params: { id : id } });
                                        /* Print the documentation */
                                        await this.printFile('RI');
                                        // await this.printFile('RP');
                                        if (this.underage) {
                                            await this.printFile('RU');
                                        }
                                        /* Trigger a modification on the localStorage to propagate the changes on other windows */
                                        localStorage.setItem('customer_updated', id);
                                        localStorage.removeItem('customer_updated');
                                        this.$showToast(response.data.status, response.data.message, response.data.title);
                                    });
                            } catch(error) {
                                if (error.response) {
                                    let message = error.response.data.message;
                                    /* Check if a validation errors occurs on the backend */
                                    if (error.response.status == 422) {
                                        let errors = error.response.data.validationErrors;
                                        for (let error in errors) {
                                            message += '<br><span class="text-danger">- ' + errors[error][0]; + '</span>'
                                        };
                                        const errorMessage = this.$createElement('div',
                                        {
                                            domProps: { innerHTML: message }
                                        })
                                        /* If a validation error on the backend occurs, show the info on a modal */
                                        this.$bvModal.msgBoxOk(errorMessage, {
                                            buttonSize: 'sm',
                                            centered: true,
                                            okTitle: 'Aceptar',
                                            size: 'sm',
                                            title: error.response.data.title,
                                        })
                                        NProgress.done();
                                    }
                                    console.error(error.response.data.trace);
                                } else {
                                    this.$showToast('danger', 'No se han podido guardar los datos correctamente. Código de error: FESoFo@Su', 'Ha ocurrido un error');
                                    console.error(error);
                                }
                            }
                        }
                    });
            },
            /**
             * Searches the empty fields (phones, emails and contacts) and delete it if there are on their pristine state (empty). Also, check if a contact(s) or tutor are customers too and leave at vuex only their id and notes, the rest of data remains linked and will be setted when the profile of the main customer will be loaded. Vee-validate redound on this because it will prevent to leave empty fields too.
             */
            submitCleanData() {
                /* Delete the customer's emtpy phones and emails */
                this.submitCleanEmpties('phones', this.form.phones, 'customer');
                this.submitCleanEmpties('emails', this.form.emails, 'customer');
                /* Iterate over the contacts (if there is someone) to clean the contact's phones, emails and the contact itself if there is added but on its pristine value  */
                if (this.form.contacts && this.form.contacts.length > 0) {
                    let contacts = this.form.contacts;
                    for (let i = 0; i < contacts.length; i++) {
                        let contactToSave = [];
                        /* If we have id store only leave it as reference, also store the notes because there are not of the linked customer */
                        if (contacts[i]._id) {
                            contactToSave = {
                                _id: contacts[i]._id,
                                notes: contacts[i].notes,
                            }
                        } else {
                            /* Clean the empty phones and emails */
                            this.submitCleanEmpties('phones', contacts[i].phones, 'contacts', i);
                            this.submitCleanEmpties('emails', contacts[i].emails, 'contacts', i);
                            contactToSave = contacts[i];
                        }
                        /* If the cleaned contact is also empty, delete it or if is not, assign the new values */
                        if (JSON.stringify(this.getDefaultState('contacts')) === JSON.stringify(contactToSave)) {
                            this.delFormElement({ _id: this.form._id, field: 'contacts', index: i });
                            i--;
                        } else {
                            this.UPDATE_FIELD({ target: this.form.contacts, field: this.index, newVal: contactToSave });
                        }
                    }
                }
                /* If we have added a tutor clean it up */
                if (this.form.tutor) {
                    let tutorToSave = {};
                    /* If we have id store only leave it as reference, also store the notes because there are not of the linked customer */
                    if (this.form.tutor._id) {
                        tutorToSave = {
                            _id: this.form.tutor._id,
                            notes: this.form.tutor._notes,
                        }
                    } else {
                        this.submitCleanEmpties('phones', this.form.tutor.phones, 'tutor');
                        this.submitCleanEmpties('emails', this.form.tutor.emails, 'tutor');
                        tutorToSave = this.form.tutor;
                    }
                    /* If the tutor has its pristine state and the customer is not underage, delete the tutor */
                    if (JSON.stringify(this.getDefaultState('tutor')) === JSON.stringify(tutorToSave) && this.underage == false) {
                        tutorToSave = null;
                    }
                    this.UPDATE_FIELD({ target: this.form, field: 'tutor', newVal: tutorToSave });
                }
            },
            /**
             * Clean the empty fields for phones or emails
             *
             * @param {String} field: name of the field to delete (phones | emails)
             * @param {Array} value: the object to iterate it to delete the data
             * @param {String} target: name of the target (customer | contacts | tutor)
             * @param {String} contactIndex: if the target is contacts we need it index on the mutation
             */
            submitCleanEmpties(field, value, target, contactIndex = null) {
                for (let i = 0; value && i < value.length; i++) {
                    if (JSON.stringify(this.getDefaultState(field)) === JSON.stringify(value[i])) {
                        this.delFormElement({ _id: this.form._id, entity: target, entityIndex: contactIndex, field: field, fieldIndex: i });
                        i--;
                    }
                }
            },
            /**
             * Saves the existing customer changes
             */
            submitEdit() {
                this.submitting = true;
                /* First of all validate de form (at the backend it will be validated too) */
                this.$validator.validateAll()
                    .then(result =>{
                        /* If the form isn't shows modal and mark the incorrect fields */
                        if (!result) {
                            this.$bvModal.msgBoxOk('Se han encontrado ' + this.errors.all().length + ' errores en el formulario. Revisa los campos marcados.', {
                                buttonSize: 'sm',
                                centered: true,
                                okTitle: 'Aceptar',
                                size: 'sm',
                                title: 'Hay campos incorrectos',
                            });
                        } else {
                            /* Clean the form data */
                            this.submitCleanData();
                            http.put('/api/customer/' + this.form._id + '/edit', this.form)
                                .then(response =>{
                                    /* Save the modifications to the store */
                                    this.setCustomerEdited(this.form);
                                    /* Go to the customers profile */
                                    this.$router.push({ name: 'customers.profile', params: { id : this.form._id } });
                                    /* Trigger a modification on the localStorage to propagate the changes on other windows */
                                    localStorage.setItem('customer_updated', this.form._id);
                                    localStorage.removeItem('customer_updated');
                                    this.$showToast(response.data.status, response.data.message, response.data.title);
                                })
                                .catch(error =>{
                                    if (error.response) {
                                        let message = error.response.data.message;
                                        /* Check if a validation errors occurs on the backend */
                                        if (error.response.status == 422) {
                                            let errors = error.response.data.validationErrors;
                                            for (let error in errors) {
                                                message += '<br><span class="text-danger">- ' + errors[error][0]; + '</span>'
                                            };
                                            const errorMessage = this.$createElement('div',
                                            {
                                                domProps: { innerHTML: message }
                                            })
                                            /* If a validation error on the backend occurs, show the info to on a modal */
                                            this.$bvModal.msgBoxOk(errorMessage, {
                                                buttonSize: 'sm',
                                                centered: true,
                                                okTitle: 'Aceptar',
                                                size: 'sm',
                                                title: error.response.data.title,
                                            })
                                            NProgress.done();
                                        }
                                        console.error(error.response.data.trace);
                                    } else {
                                        this.$showToast('danger', 'No se han podido guardar los datos correctamente. Código de error: FESoFo@SuEd', 'Error al guardar los datos');
                                        console.error(error);
                                    }
                                });
                        }
                });
            },
            /**
             * Search the invalid fields on the children elements launching its validations functions
             */
            async validateForm() {
                /* Validate the signature */
                const errorSign = await this.$refs.wacomsign.validate();
                const result = await this.$validator.validateAll();
                if (!result) {
                    this.$bvModal.msgBoxOk('Se han encontrado ' + (this.errors.all().length + errorSign) + ' errores en el formulario. Revisa los campos marcados.', {
                        buttonSize: 'sm',
                        centered: true,
                        okTitle: 'Aceptar',
                        size: 'sm',
                        title: 'Hay campos incorrectos',
                    });
                } else {
                    return true;
                }
            },
        },
        /**
         * Provide the same $validator to the childs
         */
        provide() {
            return {
                $validator: this.$validator,
            }
        },
        watch: {
            isDisabled(newValue, oldValue) {
                if (newValue == true) {
                    /* If we leave the edition we need to reset the selectable fields of the belts asignation */
                    this.beltsResetFields();
                }
            }
        },
    }
</script>
<style scoped>
    .card-body {
        overflow: hidden;
    }
    .customer-dates {
        white-space: nowrap;
    }
    /* Normalize the height of the inline buttons-radios */
    .tiny-radio-selector {
        height: 32.3px!important;
    }
    .tiny-radio-selector .btn.btn-sm {
        line-height: 1;
    }
    #edit-alert {
        opacity: 75%;
        position: fixed;
        top: 64px;
        z-index: 999;
    }
    #tarifa {
        white-space: nowrap;
    }
    @media screen and (min-width: 990px) {
        #btn-ibanowner {
            margin-top: calc(25px + .5rem); /* Vertical align with the labeled elements */
        }
    }
</style>
