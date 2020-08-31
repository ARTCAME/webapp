
<template>
    <div>
        <span
            v-if="$route.name == 'payments.index'">
            <Wizard
                name="wzd-pagos-confirming"
                v-show="confirming"
                :steps=wpcSteps></Wizard>
            <Wizard
                name="wzd-pagos-download"
                v-show="manualDownload"
                :steps=wpdSteps></Wizard>
            <Wizard
                name="wzd-main-pagos"
                v-show="!confirming && !manualDownload"
                :steps=wmpSteps></Wizard>
        </span>
            <b-collapse
                :visible="$route.name == 'payments.index' && rowsSelected.length > 200">
                <b-alert
                    show
                    variant="danger">
                    Has seleccionado más de 200 filas, asegúrate que hayas escogido las filas correctas antes de guardar los cambios.
                </b-alert>
            </b-collapse>
            <!-- Content for the confirmation process -->
            <b-collapse
                id="collapse-information-confirm"
                :visible="confirming">
                <h5 data-v-step="wzd-pagos-confirming-0" class="subtitle subtitle-sub" md="4">
                    Confirmación de estado de pagos domiciliados
                </h5>
                <b-row align-h="start" class="mb-2" no-gutters>
                    <b-col cols="sm-12 auto">
                        <!-- It is shown conditionally when the confirmation of payments has been started -->
                        <b-row no-gutters>
                            <span
                                class="col col-12 col-sm-auto mb-1 mr-1"
                                id="wrp-tlt-stats"
                                key="trans-radio-new-state"
                                tabindex="0"
                                v-b-tooltip.hover.noninteractive
                                :title="showingDetails ? 'No puedes confirmar pagos mientras editas una línea de la tabla' : ''">
                                <!-- It will be disabled when a row in the table is being edited or if the confirmation of payments process has not been started -->
                                <b-form-radio-group
                                    buttons
                                    button-variant="outline-secondary"
                                    class="w-100"
                                    data-v-step="wzd-pagos-confirming-2"
                                    size="sm"
                                    v-model="newStateSelected"
                                    :disabled="showingDetails || !confirming">
                                    <b-form-radio
                                        name="radio-stats"
                                        value="confirmado">
                                        Confirmado
                                    </b-form-radio>
                                    <b-form-radio
                                        name="radio-stats"
                                        value="devuelto">
                                        Devuelto
                                    </b-form-radio>
                                </b-form-radio-group>
                            </span>
                            <!-- It is shown conditionally when the confirmation of payments has been started -->
                            <span
                                class="col col-12 col-sm-auto d-inline-block mb-1"
                                id="save-confirmation"
                                key="trans-btn-save-confirm"
                                tabindex="0"
                                v-b-tooltip.hover.noninteractive
                                :title="showingDetails ? 'No puedes confirmar pagos mientras editas una línea de la tabla' : newStateSelected == false && rowsSelected.length == 0 ? 'Selecciona un estado y algún pago de la tabla' : newStateSelected == false ? 'Selecciona un estado' : rowsSelected.length == 0 ?  'Selecciona algún pago de la tabla' : csvDownloadConfirmation ? 'Descargando...' : ''">
                                <!-- It will be disabled when the user hasn't selected a new state for the payment or if he hasn't select a row in the table or if a row in the table is being edited or if the flag wich controls the download of the file is actived -->
                                <b-button
                                    class="w-100"
                                    data-v-step="wzd-pagos-confirming-3"
                                    size="sm"
                                    :disabled="!newStateSelected || rowsSelected.length == 0 || showingDetails || csvDownloadConfirmation"
                                    :variant="csvDownloadConfirmation == false && (newStateSelected && rowsSelected.length > 0 && !showingDetails) ? 'success' : 'outline-success'"
                                    @click="confirmingState()">
                                    <!-- Shown if the flag to control de download is true. It means that the download file has begun  -->
                                    <b-spinner
                                        small
                                        type="grow"
                                        v-if="csvDownloadConfirmation == true"></b-spinner>
                                    <fa-icon
                                        icon="check-double"
                                        v-else></fa-icon>
                                    &ensp;Confirmar estado
                                </b-button>
                            </span>
                            <!-- It will be shown when the confimation of payments has started and has been selected some rows -->
                            <transition name="slide-fade">
                                <span
                                    class="d-inline-block ig-inline-text ml-3"
                                    key="trans-confirm-text"
                                    v-if="confirming && rowsSelected.length > 0">
                                    Vas a confirmar {{ rowsSelected.length }} pago/s
                                </span>
                            </transition>
                        </b-row>
                    </b-col>
                    <b-button
                        class="ml-auto"
                        size="sm"
                        title="Finaliza el proceso, los cambios no guardados se perderán"
                        variant="outline-danger"
                        v-b-tooltip.hover.noninteractive
                        @click="endProcedures()">
                        Finalizar
                    </b-button>
                </b-row>
                <!-- It will be shown when the confirmation process has been started -->
                <b-alert
                    class="mb-2"
                    show
                    variant="info">
                    1 - Busca y selecciona los pagos que quieres cambiar de estado. En este proceso solo podrás seleccionar los que estén 'Pendientes' y tengan forma de pago 'Domiciliación'.
                    <br>
                    2 - Selecciona el estado que quieres aplicar: 'Confirmado' o 'Devuelto'.
                    <br>
                    3 - Para acabar, confirma los cambios.
                    <br>
                    <br>
                    <u>Importante:</u>
                    <br>
                    - Fíjate que el periodo de pago y la forma de pago de los pagos que selecciones sean los correctos.
                    <br>
                    - Si lo necesitas, puedes editar ciertos datos en la tabla o ir a la ficha del usuario y modificar lo que necesites.
                    <br>
                    - Los pagos que no sean domiciliados se gestionan desde la herramienta para pagos de la barra de navegación.
                    <br>
                    - Si hubieras seleccionado un pago no compatible se desmarcará automáticamente (los que no sean domiciliados o los que lo sean y no estén pendientes).
                </b-alert>
            </b-collapse>
            <!-- Content for the manual download of payments process -->
            <b-collapse
                id="collapse-information-manual"
                :visible="manualDownload">
                <h5 class="subtitle subtitle-sub" data-v-step="wzd-pagos-download-0" md="4">
                    Descarga manual de fichero de remesa para los pagos pendientes
                </h5>
                <b-row class="mb-2" no-gutters>
                    <!-- <b-col cols="auto"> -->
                        <!-- It will be shown when the manual download -->
                        <span
                            class="col col-12 col-sm-auto d-inline-block mb-1"
                            key="trans-btn-download"
                            tabindex="0"
                            v-b-tooltip.hover.noninteractive
                            :title="rowsSelected.length == 0 ? 'Selecciona algún pago de la tabla' : showingDetails ? 'No puedes generar el archivo de pagos mientras editas una línea de la tabla' : csvDownloadManual ? 'Descargando...' : ''">
                            <!-- Disabled when any row on the table has been selected or if the edition of some row is actived or if the process of manual download hasn't been started of if the flag wich controls the download of the file is true -->
                            <b-button
                                class="w-100"
                                data-v-step="wzd-pagos-download-2"
                                size="sm"
                                key="trans-btn-save-confirm"
                                :disabled="rowsSelected.length == 0 || showingDetails || !manualDownload || csvDownloadManual"
                                :variant="csvDownloadManual == false && (rowsSelected.length != 0 && !showingDetails && manualDownload) ? 'success' : 'outline-success'"
                                @click="$tableToCsv([ '_id', 'customerNumber', 'dni', 'name', 'iban', 'interval', 'amount' ], rowsSelected, $moment().format('YYYY-MM-DD_HH.mm.ss') + '_pagos_manual.csv', 'csvDownloadManual')">
                                <!-- Shown if the flag to control the download of the file is true -->
                                <b-spinner
                                    small
                                    type="grow"
                                    v-if="csvDownloadManual == true"></b-spinner>
                                <fa-icon
                                    icon="file-download"
                                    v-else></fa-icon>
                                &ensp;Descargar archivo de remesa
                            </b-button>
                        </span>
                        <!-- Shown when the manual download has been initiated and when has been selected some row on the table -->
                        <transition name="slide-fade">
                            <span
                                class="d-inline-block ig-inline-text ml-3 my-auto"
                                key="trans-text-download">
                                Vas a generar un archivo para {{ rowsSelected.length }} pago/s
                            </span>
                        </transition>
                    <!-- </b-col> -->
                    <b-button
                        class="ml-auto"
                        size="sm"
                        title="Finaliza el proceso, los cambios no guardados se perderán"
                        variant="outline-danger"
                        v-b-tooltip.hover.noninteractive
                        @click="endProcedures()">
                        Finalizar
                    </b-button>
                </b-row>
                <!-- It will be shown when the manual download process has been started -->
                <b-alert
                    class="mb-2"
                    show
                    variant="info">
                    1 - Busca y selecciona los socios sobre los que quieres descargar los datos, solo podrás seleccionar de entre los pagos por 'Domiciliación' los que estén en los estados: 'Confirmado' o 'Devuelto'.
                    <br>
                    2 - Descarga el fichero.
                </b-alert>
            </b-collapse>
            <transition-group appear name="fade-height">
                <!-- Shown when the confirmation process has been started and some of the selected items has been hided for the filters applied to the table -->
                <b-alert
                    class="mb-2"
                    key="trans-alert-warning-selected-confirm"
                    show
                    variant="warning"
                    v-if="((confirming || manualDownload) && showingDetails) || selectedHided">
                    <span
                        v-if="((confirming || manualDownload) && showingDetails)">
                        Mientras editas una fila de la tabla no podrás finalizar la descarga de datos o la confirmación de pagos. Finaliza la edición de la tabla o cancélala:
                        <span
                            class="d-inline-block ml-1"
                            key="trans-btn-show-all"
                            tabindex="0">
                            <b-button
                                size="sm"
                                variant="dark"
                                @click="cancelEdit()">
                                Cancelar edición
                            </b-button>
                        </span>
                    </span>
                    <span
                        v-if="selectedHided">
                        Tienes seleccionadas filas que están ocultas debido a los filtros aplicados a la tabla. Pulsa en este botón para mostrar solo las filas seleccionadas:
                        <span
                            class="d-inline-block ml-1"
                            key="trans-btn-show-all"
                            tabindex="0">
                            <b-button
                                size="sm"
                                variant="dark"
                                @click="filterSelected()">
                                Solo seleccionadas
                            </b-button>
                        </span>
                    </span>
                </b-alert>
            </transition-group>
            <!-- Charts -->
            <!-- Shown only at the main payments page -->
            <b-collapse
                id="collapse-charts"
                v-if="$route.name == 'payments.index'"
                :visible="collapseCharts">
                <h5 class="subtitle subtitle-sub" md="4">
                    Gráficos
                </h5>
                <div id="ctn-collapse-charts" class="pb-3 pt-2">
                    <b-row no-gutters>
                        <b-button
                            class="col mr-1"
                            id="btn-chart-pagos-tipo"
                            size="sm"
                            title="Muestra el total mensual por tipo y estado del pago"
                            value="pagos-tipo"
                            v-b-toggle.chart-pagos-tipo
                            v-b-tooltip.hover.noninteractive
                            :variant="$refs.chartPagosTipo && $refs.chartPagosTipo.show ? 'secondary' : 'outline-secondary'">
                            <fa-icon icon="chart-bar"></fa-icon>
                            &ensp;Pagos por tipo
                        </b-button>
                        <b-button
                            class="col mr-1"
                            id="btn-chart-pagos-total"
                            size="sm"
                            title="Muestra el total de pagos completados y pendientes en relación con el total de socios"
                            value="pagos-total"
                            v-b-toggle.chart-pagos-total
                            v-b-tooltip.hover.noninteractive
                            :variant="$refs.chartPagosTotal && $refs.chartPagosTotal.show ? 'secondary' : 'outline-secondary'">
                            <fa-icon icon="chart-bar"></fa-icon>
                            &ensp;Pagos totales
                        </b-button>
                        <b-button
                            class="col"
                            id="btn-chart-pagos-ingresos"
                            size="sm"
                            title="Muestra los ingresos y las devoluciones en relación con el total de socios"
                            value="pagos-ingresos"
                            v-b-toggle.chart-ingresos-total
                            v-b-tooltip.hover.noninteractive
                            :variant="$refs.chartIngresosTotal && $refs.chartIngresosTotal.show ? 'secondary' : 'outline-secondary'">
                            <fa-icon icon="chart-bar"></fa-icon>
                            &ensp;Ingresos
                        </b-button>
                    </b-row>
                    <b-collapse
                        id="chart-pagos-tipo"
                        ref="chartPagosTipo">
                        <div class="wrp-chart">
                            <h5 class="subtitle subtitle-sub">Pagos por tipo</h5>
                            <bar-chart
                                class="chart-pagos"
                                :chart-data="chartPagosTipoData"
                                :options="chartPagosTipoOptions"></bar-chart>
                        </div>
                    </b-collapse>
                    <b-collapse
                        id="chart-pagos-total"
                        ref="chartPagosTotal">
                        <div class="wrp-chart">
                            <h5 class="subtitle subtitle-sub">Pagos totales</h5>
                            <bar-chart
                                class="chart-pagos"
                                :chart-data="chartPagosTotalData"
                                :options="chartPagosTotalOptions"></bar-chart>
                        </div>
                    </b-collapse>
                    <b-collapse
                        id="chart-ingresos-total"
                        ref="chartIngresosTotal">
                        <div class="wrp-chart">
                            <h5 class="subtitle subtitle-sub">Ingresos</h5>
                            <bar-chart
                                class="chart-pagos"
                                :chart-data="chartIngresosTotalData"
                                :options="chartIngresosTotalOptions"></bar-chart>
                        </div>
                    </b-collapse>
                </div>
            </b-collapse>
            <!-- Row with the tags -->
            <b-row align-v="end" class="mb-2" no-gutters>
                <b-col>
                    <b-form-tags
                        class="filter-form-tags p-0"
                        data-v-step="wzd-main-pagos-3"
                        no-outer-focus
                        v-model="filterTags">
                        <template>
                            <b-form-text>Filtros activos:</b-form-text>
                            <b-form-tag
                                class="filter-tag mr-1 mt-1"
                                size="sm"
                                v-for="tag in filterTags"
                                :key="tag"
                                :variant="months.includes(tag) ? 'info' : btnStates.includes(tag) ? 'secondary' : btnPayTypes.includes(tag) ? 'dark' : 'primary'"
                                @remove="deleteTag(tag); cancelEdit()">
                                {{ tag }}
                            </b-form-tag>
                            <!-- Shown when there are no tags added to the v-model of tags -->
                            <b-form-tag
                                class="filter-tag mt-1 tag-ninguno"
                                disabled
                                variant="success"
                                v-if="filterTags.length == 0 && paymentsSearch == '' && !allSelected">
                                Ninguno
                            </b-form-tag>
                            <!-- It will be shown when the flag wich indicates that we want to show all the selected rows on the table is true and only at the main payments page -->
                            <b-form-tag
                                class="filter-tag mr-1 mt-1"
                                variant="primary"
                                v-if="allSelected && $route.name == 'payments.index'"
                                @remove="allSelected = false; cancelEdit()">
                                Seleccionadas
                            </b-form-tag>
                            <!-- It will show the content of the input wich filters the table data -->
                            <b-form-tag
                                class="filter-tag mt-1"
                                variant="danger"
                                v-if="paymentsSearch != ''"
                                @remove="paymentsSearch = ''">
                                {{ paymentsSearch }}
                            </b-form-tag>
                        </template>
                    </b-form-tags>
                </b-col>
            </b-row>
            <!-- Row with the filters for the table -->
            <b-row
                class="mb-2 row-busqueda-table"
                data-v-step="wzd-main-pagos-2"
                no-gutters>
                <b-col class="mt-1 px-0" cols="lg-4">
                    <b-form-input
                        id="table-pagos-search"
                        size="sm"
                        placeholder="Buscar en la tabla..."
                        type="search"
                        v-model="paymentsSearch"
                        @input="disableEditingRow()"
                        @keyup="fetchChartData()"></b-form-input>
                </b-col>
                <b-col cols="lg-8">
                    <b-row class="ml-lg-2" no-gutters>
                        <!-- Shown only on the main payments page -->
                        <span
                            class="col col-auto col-sm mr-1 mt-1 px-0"
                            key="trans-btn-show-all"
                            tabindex="0"
                            v-b-tooltip.hover.noninteractive
                            v-if="$route.name == 'payments.index'"
                            :title="rowsSelected.length == 0 ? 'No hay ninguna fila seleccionado' : 'Mostrar solo las filas seleccionadas'">
                            <!-- It will be disabled when no rows are selected -->
                            <b-button
                                id="payments-seleccionadas-btn"
                                class="col-12 px-1"
                                size="sm"
                                variant="outline-dark"
                                v-b-tooltip.hover.noninteractive
                                :disabled="rowsSelected.length == 0"
                                @click="allSelected = true">
                                Seleccionadas
                            </b-button>
                        </span>
                        <b-dropdown
                            class="col col-auto col-sm ig-dropdown mr-1 mt-1"
                            size="sm"
                            split
                            text="Año"
                            variant="primary">
                            <b-dropdown-form>
                                <b-form-checkbox-group
                                    buttons
                                    button-variant="outline-primary"
                                    size="sm"
                                    stacked
                                    v-model="getSelectedYear">
                                    <b-form-checkbox
                                        class="ig-dropdown-item"
                                        v-for="btn in btnYears"
                                        :key="btn"
                                        :value="btn"
                                        @change.native="addTags(btn); cancelEdit()">
                                        {{ btn }}
                                    </b-form-checkbox>
                                </b-form-checkbox-group>
                            </b-dropdown-form>
                        </b-dropdown>
                        <b-dropdown
                            class="col col-auto col-sm ig-dropdown mr-1 mt-1"
                            size="sm"
                            split
                            text="Mes"
                            variant="info">
                            <b-dropdown-form>
                                <b-form-checkbox-group
                                    buttons
                                    button-variant="outline-info"
                                    name="month-selected"
                                    size="sm"
                                    stacked
                                    v-model="getSelectedMonth">
                                    <b-form-checkbox
                                        class="ig-dropdown-item"
                                        v-for="btn in btnMonths"
                                        :key="btn.value"
                                        :value="btn.value"
                                        @change.native="addTags(btn.value, 'month'); cancelEdit()">
                                        {{ btn.text }}
                                    </b-form-checkbox>
                                    <!-- :title="ctnArray.filter(el => getSelectedYear.includes($moment(el['interval'], 'YYYY-MM').year()) && $moment(el['interval'], 'YYYY-MM').month() == btn.value).length == 0 ? 'Sin datos' : 'Selecciona'" -->
                                </b-form-checkbox-group>
                            </b-dropdown-form>
                        </b-dropdown>
                        <b-dropdown
                            class="col col-auto col-sm ig-dropdown mr-1 mt-1"
                            size="sm"
                            split
                            text="Estado"
                            variant="secondary">
                            <b-dropdown-form>
                                <b-form-checkbox-group
                                    buttons
                                    button-variant="outline-secondary"
                                    size="sm"
                                    stacked
                                    v-model="getSelectedState">
                                    <b-form-checkbox
                                        class="ig-dropdown-item"
                                        v-for="btn in btnStates"
                                        :key="btn"
                                        :value="btn"
                                        @change.native="addTags(btn); cancelEdit()">
                                        {{ btn }}
                                    </b-form-checkbox>
                                </b-form-checkbox-group>
                            </b-dropdown-form>
                        </b-dropdown>
                        <b-dropdown
                            class="col col-auto col-sm ig-dropdown mr-1 mt-1"
                            size="sm"
                            split
                            text="Pago"
                            variant="dark">
                            <b-dropdown-form>
                                <b-form-checkbox-group
                                    buttons
                                    button-variant="outline-dark"
                                    size="sm"
                                    stacked
                                    v-model="getSelectedPayType">
                                    <b-form-checkbox
                                        class="ig-dropdown-item"
                                        v-for="btn in btnPayTypes"
                                        :key="btn"
                                        :value="btn"
                                        @change.native="addTags(btn); cancelEdit()">
                                        {{ btn }}
                                    </b-form-checkbox>
                                </b-form-checkbox-group>
                            </b-dropdown-form>
                        </b-dropdown>
                        <b-col class="col-auto col-sm-auto mt-1">
                            <b-button
                                class="btn-fa-tiny"
                                size="sm"
                                title="Restablecer los filtros"
                                variant="outline-warning"
                                v-b-tooltip.hover.noninteractive
                                @click="resetFilters()">
                                <fa-icon icon="sync-alt"></fa-icon>
                            </b-button>
                            <span
                                align-h="end"
                                data-v-step="wzd-main-pagos-4"
                                class="d-inline-block"
                                tabindex="0"
                                v-b-tooltip.hover.noninteractive.topleft
                                :title="($refs.paymentsTable && $refs.paymentsTable.filteredItems.length == 0) ? 'No hay datos en la tabla para descargar' : csvDownloadTable ? 'Descargando...' : 'Descargar los datos de la tabla'">
                                <!-- It will be disabled when there are no rows on the table or if the flag wich controls the download of the file is on -->
                                <b-button
                                    class="btn-fa-tiny"
                                    size="sm"
                                    variant="outline-success"
                                    :disabled="($refs.paymentsTable && $refs.paymentsTable.filteredItems.length == 0) || csvDownloadTable"
                                    @click="$tableToCsv(['_id', 'customerNumber', 'name', 'rate', 'amount', 'paymenttype', 'iban', 'interval', 'dateconfirmed'], paymentsItems, $moment().format('YYYY-MM-DD_HH.mm.ss') + '_pagos_tabla.csv', 'csvDownloadTable')">
                                    <!-- Shown if the flag to control de download is true. It means that the download file has begun  -->
                                    <b-spinner
                                        small
                                        type="grow"
                                        v-if="csvDownloadTable == true"></b-spinner>
                                    <!-- By default, show plain text -->
                                    <fa-icon
                                        icon="download"
                                        v-else></fa-icon>
                                </b-button>
                            </span>
                        </b-col>
                    </b-row>
                </b-col>
            </b-row>
            <!-- Main table -->
            <div
                :data-v-step="confirming ? 'wzd-pagos-confirming-1' : manualDownload ? 'wzd-pagos-download-1' : 'wzd-main-pagos-0'">
                <b-table
                    bordered
                    filter-debounce="200"
                    id="paymentsTable"
                    no-select-on-click
                    per-page="1000"
                    ref="paymentsTable"
                    responsive="lg"
                    select-mode="multi"
                    selectable
                    show-empty
                    small
                    striped
                    :busy="paymentsTableBusy"
                    :current-page="paymentsTablePagination"
                    :fields="tableFields"
                    :filter="paymentsSearch"
                    :filter-function="filterTable"
                    :items="paymentsItems">
                    <!-- sticky-header="10000px" -> causes that the head elements cannot to be focused -->
                    <!-- :tbody-transition-props="{ mode: 'out-in', name: 'fade' }"> will cause jumps between filtered states -->
                    <template
                        #head(selected)>
                        <b-button
                            :class="'ig-table-checkbox' + (selectedAll ? ' ig-checked' : '')"
                            @click="rowSelectAll(!selectedAll)">
                            <fa-icon
                                icon="check"
                                v-if="selectedAll"></fa-icon>
                            <fa-icon
                                icon="circle"
                                v-else-if="selectedSome"></fa-icon>
                        </b-button>
                    </template>
                    <!-- The selected elems are managed locally, don't depend on vuex and the table events, it will be evaluated by local functions -->
                    <template
                        #cell(selected)="row">
                        <span
                            v-b-tooltip.hover.noninteractive
                            :title="(confirming && (row.item.status != 'Pendiente' || row.item.paymenttype != 'Domiciliación')) ? 'Este pago no se puede confirmar. El estado no es Pendiente y/o la forma de pago Domiciliación' :  (manualDownload && (row.item.paymenttype != 'Domiciliación' || (row.item.status != 'Pendiente' && row.item.paymenttype == 'Domiciliación'))) ? 'No puedes descargar archivo de remesa de un pago que no sea por domiciliación o si lo es, que esté pendiente' : ''">
                            <b-button
                                :class="'ig-table-checkbox' + (isSelected(row.item) ? ' ig-checked' : '')"
                                :disabled="(confirming && (row.item.status != 'Pendiente' || row.item.paymenttype != 'Domiciliación')) || (manualDownload && (row.item.paymenttype != 'Domiciliación' || (row.item.status != 'Pendiente' && row.item.paymenttype == 'Domiciliación')))"
                                @click="rowSelect(row.item, !isSelected(row.item))">
                                <fa-icon
                                    icon="check"
                                    v-if="isSelected(row.item)"></fa-icon>
                            </b-button>
                        </span>
                    </template>
                    <!-- <template
                        #cell(_id)="row">
                        <b-link
                            positioning="top"
                            target="_blank"
                            title="Abre la ficha del socio"
                            v-b-tooltip.hover.noninteractive
                            v-html="row.value"
                            :to="{ name: 'customers.profile', params: { id: row.item._id } }"></b-link>
                    </template> -->
                    <template
                        #cell(active)="row">
                        <b-form-checkbox
                            disabled
                            switch
                            v-model="row.value"></b-form-checkbox>
                    </template>
                    <template
                        #cell(name)="row">
                        <b-link
                            positioning="top"
                            target="_blank"
                            title="Abre la ficha del socio"
                            v-b-tooltip.hover.noninteractive
                            v-html="row.value"
                            :to="{ name: 'customers.profile', params: { id: row.item._id } }"></b-link>
                    </template>
                    <template
                        #cell(rate)="row">
                        <b-form-select
                            :class="'editable-field slot-table-input ' + (!row.detailsShowing ? 'disabled' : '')"
                            :disabled="!row.detailsShowing"
                            :options="rates"
                            :value="row.value"
                            @change="updatePaymentField({ field: 'rate', newVal: $event, ...row.item }); selectImporte(row, $event)"></b-form-select>
                    </template>
                    <template
                        #cell(amount)="row">
                        <!-- Input disabled when the row is not showing details wich means is not being edited -->
                        <b-form-input
                            type="number"
                            v-validate="'required|numeric|max_value:99|min_value:10'"
                            :class="'editable-field slot-table-input' + (!row.detailsShowing ? ' disabled' : (row.item.rate != 'Personalizada' && row.item.rate != 'Personalizada + Karate') ? ' disabled' : '') + (errors.has('amount-row' + row.index) ? ' is-invalid' : '')"
                            :disabled="!row.detailsShowing"
                            :id="'amount-row' + row.index"
                            :name="'amount-row' + row.index"
                            :value="row.value"
                            @input="updatePaymentField({ field: 'amount', newVal: $event, ...row.item })"
                            @keypress="$isNumber($event)"></b-form-input>
                        <transition mode="out-in" name="liveFeedbacks">
                            <b-form-invalid-feedback
                                v-for="error in errors.collect('amount-row' + row.index)"
                                :key="error">
                                {{ error }}
                            </b-form-invalid-feedback>
                        </transition>
                    </template>
                    <template
                        #cell(paymenttype)="row">
                        <!-- Input disabled when the row is not showing details wich means is not being edited -->
                        <b-form-select
                            :class="'editable-field slot-table-input' + (!row.detailsShowing ? ' disabled' : '')"
                            :disabled="!row.detailsShowing"
                            :id="'forma-pago-row' + row.index"
                            :name="'forma-pago-row' + row.index"
                            :options="paymentTypes"
                            :value="row.value"
                            @change="updatePaymentField({ field: 'paymenttype', newVal: $event, ...row.item })"></b-form-select>

                    </template>
                    <template
                        #cell(iban)="row">
                        <!-- Input disabled when the row is not showing details wich means is not being edited -->
                        <transition-group mode="out-in" name="liveFeedbacks-table">
                            <span
                                v-if="row.item.paymenttype == 'Domiciliación'"
                                :key="'trans-iban-input-' + row.index">
                                <!-- V-validate deshabilitado para pruebas  |iban' -->
                                <b-form-input
                                    v-validate.immediate="'required'"
                                    :class="'editable-field slot-table-input' + (!row.detailsShowing ? ' disabled' : '') + (errors.has('iban-row' + row.index) ? ' is-invalid' : '')"
                                    :disabled="!row.detailsShowing"
                                    :id="'iban-row' + row.index"
                                    :name="'iban-row' + row.index"
                                    :value="row.value"
                                    @input="updatePaymentField({ field: 'iban', newVal: $event, ...row.item })"></b-form-input>
                                <transition mode="in-out" name="liveFeedbacks">
                                    <b-form-invalid-feedback
                                        v-for="error in errors.collect('iban-row' + row.index)"
                                        :key="error">
                                        {{ error }}
                                    </b-form-invalid-feedback>
                                </transition>
                            </span>
                            <!-- If the paymenttype of the payment is different from the original advise to the user that the IBAN will be deleted-->
                            <div
                                v-else-if="row.item.paymenttype != 'Domiciliación' && row.detailsShowing && onEditItem.iban != row.item.iban"
                                :key="'trans-iban-advise-' + row.index">
                                <span class="needs-attention-message">
                                    El iban se borrará
                                </span>
                            </div>
                        </transition-group>
                    </template>
                    <template
                        #cell(status)="row">
                        <!-- Depending of the selection on paymenttype during the edition, the options will change -->
                        <b-form-select
                            v-validate="'required'"
                            :class="'editable-field slot-table-input' + (!row.detailsShowing ? ' disabled' : row.value == '' ? ' is-invalid' : '') + (!row.detailsShowing && row.value == 'Pendiente' ? ' text-warning' : !row.detailsShowing && row.value == 'Devuelto' ? ' text-danger' : '')"
                            :disabled="!row.detailsShowing"
                            :id="'status-pago-row' + row.index"
                            :name="'status-pago-row' + row.index"
                            :options="!row.detailsShowing ? states : row.detailsShowing && row.item.paymenttype != 'Domiciliación' ? [{ text: 'Confirmado', value: 'Confirmado' }, { text: 'Pendiente', value: 'Pendiente' }, { text: 'Devuelto', value: 'Devuelto', disabled: true }] : states"
                            :value="row.value"
                            @change.capture="updatePaymentField({ field: 'status', newVal: $event, ...row.item }); $event == 'Pendiente' && (newEditRowDate = null); $refs.paymentsTable.refresh(); "></b-form-select>
                        <transition mode="in-out" name="liveFeedbacks">
                            <b-form-invalid-feedback
                                v-if="row.item.status == ''">
                                {{ errors.first('status-pago-row' + row.index) }}
                                <!-- {{ errors.first('forma-pago-row' + row.index) }} -->
                            </b-form-invalid-feedback>
                        </transition>
                    </template>
                    <template
                        #cell(dateconfirmed)="row">
                        <transition-group mode="out-in" name="liveFeedbacks-table">
                            <!-- It will be shown when the row is showing its details and when the payment status is not 'Pendiente' -->
                            <span
                                v-if="row.detailsShowing && row.item.status != 'Pendiente'"
                                :key="'trans-datepicker-' + row.index">
                                <!-- Because it is dynamic rendered this input cannot be vee-validated and its validation simulated via conditions -->
                                <b-form-input
                                    size="sm"
                                    type="date"
                                    v-model="newEditRowDate"
                                    :class="{ 'is-invalid' : !newEditRowDate }"
                                    :id="'datepicker-pagos-' + row.index"
                                    :name="'editPagoFecha' + row.index"
                                    @input="updatePaymentField({ field: 'dateconfirmed', newVal: $moment($event).format('DD-MM-YYYY HH:mm:ss'), ...row.item })"></b-form-input>
                                <transition mode="out-in" name="liveFeedbacks">
                                    <b-form-invalid-feedback
                                        v-if="row.detailsShowing && row.item.status != 'Pendiente' && !newEditRowDate">
                                        Campo obligatorio
                                    </b-form-invalid-feedback>
                                </transition>
                            </span>
                            <!-- If the state of the payment is different from the original and the new state is pending we need to show an advise to the user -->
                            <div
                                v-else-if="row.detailsShowing && onEditItem.status != row.item.status && row.item.status == 'Pendiente' && onEditItem.status != 'Pendiente'"
                                :key="'trans-datepicker-pendiente-' + row.index">
                                <span class="needs-attention-message">
                                    La fecha se borrará
                                </span>
                            </div>
                            <!-- By default, show the date in plain text -->
                            <span
                                v-else
                                :key="'trans-datepicker-default-' + row.index">
                                {{ row.item.dateconfirmed }}
                                <!-- {{ $moment(parseInt(row.item.dateconfirmed.$date.$numberLong)).format('DD-MM-YYYY HH:mm:ss') }} -->
                            </span>
                        </transition-group>
                    </template>
                    <template
                        #head(editRow)>
                        <span class="d-inline-block" data-v-step="wzd-main-pagos-1">
                            <fa-icon icon="edit"></fa-icon>
                        </span>
                    </template>
                    <!-- Conditionally rendered at the customer profile (when the isDisabled prop is false) -->
                    <template
                        #cell(editRow)="row"
                        v-if="isDisabled == false">
                        <!-- Shown only when the flag wich indicates there is a row on edition is false. Only can edit one row at time -->
                        <fa-icon
                            icon="edit"
                            v-if="!showingDetails"
                            :id="'tooltip_edit_row' + row.index"
                            @click="manageDetails(row.item)"></fa-icon>
                        <b-tooltip
                            noninteractive
                            placement="topleft"
                            v-if="!row.item._showDetails"
                            :target="'tooltip_edit_row' + row.index">
                            Editar el pago
                        </b-tooltip>
                    </template>
                    <!-- Shown only when other procedures are not initiated -->
                    <template
                        #row-details="row">
                        <b-row align-h="end" align-v="center" class="m-0">
                            <b-col class="mr-auto px-0">
                                <b-button
                                    class="px-1 py-0"
                                    id="btn-del-payment"
                                    size="sm"
                                    variant="outline-danger"
                                    @click="delPayment(row.item)">
                                <b-tooltip noninteractive target="btn-del-payment" title="Modifícalo para que se ajuste a lo que necesites. Evita borrar los pagos." variant="warning"></b-tooltip>
                                    Borrar
                                </b-button>
                            </b-col>
                            <b-col class="px-1" cols="auto">
                                <b-button
                                    size="sm"
                                    @click="cancelEdit()">
                                    Cancelar
                                </b-button>
                            </b-col>
                            <b-col class="p-0" cols="auto">
                                <span
                                    class="d-inline-block"
                                    tabindex="0"
                                    v-b-tooltip.hover.noninteractive
                                    :title="!rowEdited(row.item) ? 'Nada que guardar' : row.item.status == '' || (newEditRowDate == null && row.item.status != 'Pendiente') || (row.item.paymenttype == 'Domiciliación' && errors.has('iban-row' + row.index)) || (errors.has('amount-row' + row.index)) ? 'Revisa los campos incorrectos' : 'Guardar'">
                                    <!-- Button disabled when if no changes are made to the data on the row, when the edition is started, the data on the row is stored on onEditItem -->
                                    <b-button
                                        size="sm"
                                        variant="primary"
                                        :disabled="!rowEdited(row.item) || (newEditRowDate == null && row.item.status != 'Pendiente') || (row.item.paymenttype == 'Domiciliación' && row.item.iban == null || (errors.has('amount-row' + row.index) || errors.has('iban-row' + row.index) || errors.has('status-pago-row' + row.index)))"
                                        @click="applyEditRow(row.item)">
                                        Guardar
                                    </b-button>
                                </span>
                            </b-col>
                        </b-row>
                    </template>
                    <template
                        #table-colgroup="scope">
                        <col
                            v-for="field in scope.fields"
                            :key="field.key"
                            :style="{ width: field.key == 'selected' || field.key == 'editRow' || field.key == 'active' ? '30px' : field.key == 'amount' ? '100px' : field.key == 'interval' ? '60px' : field.key == 'status' || field.key == 'paymenttype' ? '110px' : field.key == 'rate' ? '180px' :  field.key == 'dateconfirmed' || field.key == 'iban' ? '140px' : field.key == 'customerNumber' ? '75px' : 'auto' }">
                    </template>
                    <template
                        #table-caption>
                        <b-row align-h="between" no-gutters>
                            <!-- Shown only at the main payments page -->
                            <b-col
                                v-if="$route.name == 'payments.index'"
                                :cols="$refs.paymentsTable && $refs.paymentsTable.isFiltered && ($refs.paymentsTable.filteredItems.length > 1000 || paymentsItems.length > 1000) ? 6 : 'auto'">
                                <p>
                                    La tabla solo muestra los socios activos. Mostrar los inactivos
                                    <b-form-checkbox
                                        class="d-inline custom inline-switch"
                                        size="sm"
                                        switch
                                        v-model="inactives"
                                        @change="cancelEdit()"></b-form-checkbox>
                                </p>
                                Filas seleccionadas:
                                <AnimatedNum
                                    :numFounded="rowsSelected.length"></AnimatedNum>
                                <br>
                                Filas totales: {{ $refs.paymentsTable && $refs.paymentsTable.isFiltered ? $refs.paymentsTable.filteredItems.length : paymentsItems.length }}
                                <!-- <AnimatedNum
                                    :numFounded="$refs.paymentsTable && $refs.paymentsTable.isFiltered ? $refs.paymentsTable.filteredItems.length : paymentsItems.length"></AnimatedNum> -->
                            </b-col>
                            <b-col cols="auto">
                                <b-pagination
                                    aria-controls="paymentsTable"
                                    class="float-right"
                                    per-page="1000"
                                    size="sm"
                                    v-model="paymentsTablePagination"
                                    v-if="$refs.paymentsTable && $refs.paymentsTable.isFiltered ? $refs.paymentsTable.filteredItems.length > 1000 : paymentsItems.length > 1000"
                                    :total-rows="$refs.paymentsTable && $refs.paymentsTable.isFiltered ? $refs.paymentsTable.filteredItems.length : paymentsItems.length"></b-pagination>
                            </b-col>
                        </b-row>
                    </template>
                    <template
                        #table-busy>
                        <div class="text-center my-2">
                            <b-spinner class="align-middle" type="grow" variant="secondary"></b-spinner>
                        </div>
                    </template>
                    <!-- It will be shown when the table hasn't rows because the filters have emptied it -->
                    <template
                        #empty>
                        <b-form-text>
                            No hay pagos con estos criterios
                        </b-form-text>
                    </template>
                    <template
                        #emptyfiltered>
                        <b-form-text>
                            Ningún registro coincide con tu búsqueda
                        </b-form-text>
                    </template>
                </b-table>
            </div>
    </div>
</template>
<script>
    import { http } from '../utils/http';
    import BarChart from '../charts/BarChart.vue';
    import LineChart from '../charts/LineChart.vue';
    import { mapActions, mapGetters } from 'vuex';
    import * as WzdSteps from './wzdsteps/payments';
    const QS = require('qs'); /* Needed at axios.post function to pass arrays as params to the controller */
    const RESTORE_FIELDS = [ '_id', '_showDetails', 'amount', 'dateconfirmed', 'dategenerated', 'iban', 'interval', 'paymenttype', 'rate', 'status'];
    const SPECIAL_CHARACTERS = { 'Ã': 'A', 'À': 'A', 'Á': 'A', 'Ä': 'A', 'Â': 'A', 'È': 'E', 'É': 'E', 'Ë': 'E', 'Ê': 'E', 'Ì': 'I', 'Í': 'I', 'Ï': 'I', 'Î': 'I', 'Ò': 'O', 'Ó': 'O', 'Ö': 'O', 'Ô': 'O', 'Ù': 'U', 'Ú': 'U', 'Ü': 'U', 'Û': 'U', 'ã': 'a', 'à': 'a', 'á': 'a', 'ä': 'a', 'â': 'a', 'è': 'e', 'é': 'e', 'ë': 'e', 'ê': 'e', 'ì': 'i', 'í': 'i', 'ï': 'i', 'î': 'i', 'ò': 'o', 'ó': 'o', 'ö': 'o', 'ô': 'o', 'ù': 'u', 'ú': 'u', 'ü': 'u', 'û': 'u', 'Ñ': 'N', 'ñ': 'n', 'Ç': 'c', 'ç': 'c' };
    export default {
        components: { BarChart, LineChart },
        data() {
            return {
                allSelected: false, /* Flag to obtain only the selected elements on the table */
                btnMonths: [
                    { text: 'Enero', value: 0, },
                    { text: 'Febrero', value: 1, },
                    { text: 'Marzo', value: 2, },
                    { text: 'Abril', value: 3, },
                    { text: 'Mayo', value: 4, },
                    { text: 'Junio', value: 5, },
                    { text: 'Julio', value: 6, },
                    { text: 'Agosto', value: 7, },
                    { text: 'Septiembre', value: 8, },
                    { text: 'Octubre', value: 9, },
                    { text: 'Noviembre', value: 10, },
                    { text: 'Diciembre' ,value: 11, },
                ], /* Data for a b-checkbox-group with the selectable months and its values to show it on the view, it is used to apply filters on the table data */
                btnPayTypes: [ 'Efectivo', 'Tarjeta', 'Domiciliación' ], /* The selectable pay types to show it on the view, it is used to apply filters on the table data */
                btnStates: [ 'Confirmado', 'Pendiente', 'Devuelto' ], /* The selectable states to show it on the view, it is used to apply filters on the table data */
                btnYears: [], /* Data to show on a b-form-checkbox with the selectable years, the years will be calculated based on the data stored on the database. It is used to apply filters on the table data */
                chartIngresosTotalData: {}, /* Chart data */
                chartIngresosTotalOptions: {
                    animation: {
                        ease: 'easeInOutBounce',
                    },
                    legend: {
                        position: 'bottom',
                    },
                    maintainAspectRatio: false,
                    responsive:true,
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display: false,
                            },
                        }],
                        yAxes: [{
                            id: 'left',
                            type: 'linear',
                            position: 'left',
                            ticks: {
                                beginAtZero: true,
                                precision: 0,
                            },
                        }, {
                            id: 'right',
                            type: 'linear',
                            position: 'right',
                            ticks: {
                                beginAtZero: true,
                                precision: 0,
                            },
                        }]
                    },
                    tooltips: {
						intersect: true,
					},
                }, /* Chart options */
                chartPagosTipoData: {}, /* Chart data */
                chartPagosTipoOptions: {
                    animation: {
                        ease: 'easeInOutBounce',
                    },
                    legend: {
                        position: 'bottom',
                    },
                    maintainAspectRatio: false,
                    responsive:true,
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display: false,
                            },
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                precision: 0,
                            }
                        }]
                    },
                    tooltips: {
						intersect: true,
					},
                }, /* Chart options */
                chartPagosTotalData: {}, /* Chart data */
                chartPagosTotalOptions: {
                    animation: {
                        ease: 'easeInOutBounce',
                    },
                    legend: {
                        position: 'bottom',
                    },
                    maintainAspectRatio: false,
                    responsive:true,
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display: false,
                            },
                        }],
                        yAxes: [{
                            id: 'left',
                            type: 'linear',
                            position: 'left',
                            ticks: {
                                beginAtZero: true,
                                precision: 0,
                            },
                        }, {
                            id: 'right',
                            type: 'linear',
                            position: 'right',
                            ticks: {
                                beginAtZero: true,
                                precision: 0,
                            },
                        }]
                    },
                    tooltips: {
						intersect: true,
					},
                }, /* Chart options */
                csvDownloadConfirmation: false, /* Flag to conditional render an spinner or icon on the confirmation button */
                csvDownloadManual: false, /* Flag to conditional render an spinner or icon on the manual download button */
                csvDownloadTable: false, /* Flag to conditional render an spinner or icon on a manual print table button */
                filterTags: [], /* v-model that contains the filters applied on the table */
                getSelectedMonth: [ this.$moment().month() ], /* v-model for a b-checkbox-group, it stores the months selecteds to filter the data on the table. The current month is the default selected */
                getSelectedMonthRecover: [], /* Array to store the filters applied to return to a previous state */
                getSelectedPayType: [], /* v-model for a b-checkbox-group, it stores the pay type of the payments selecteds to filter the data on the table */
                getSelectedPayTypeRecover: [], /* Array to store the filters applied to return to a previous state */
                getSelectedState: [], /* v-model for a b-checkbox-group, it stores the states of the payments selecteds to filter the data on the table */
                getSelectedStateRecover: [], /* Array to store the filters applied to return to a previous state */
                getSelectedYear: [ this.$moment().year() ], /* v-model for a b-checkbox-group, it stores the years selected to filter the data on the table. The current year is the default selected */
                getSelectedYearRecover: [], /* Array to store the filters applied to return to a previous state */
                inactives: false, /* Flag to show or not the inactive customers */
                months: [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ], /* Array used to convert the numbers to string */
                newEditRowDate: null, /* v-model to the datepicker of the table row modifications */
                newStateSelected: false, /* v-model for a b-checkbox-group, acts like a flag to activate options on the confirming payments procedure */
                onEditItem: {}, /* Stores the data of a row when it is edited to allow recover it */
                paymentsItemsFields: [
                    { key: 'selected', label: '', class: 'text-center' },
                    { key: 'id', label: 'ID', sortable: true, },
                    { key: 'name', label: 'Socio', sortable: true, },
                    { key: 'rate', label: 'Tarifa', sortable: true, },
                    { key: 'amount', label: 'Importe', sortable: true, },
                    { key: 'paymenttype', label: 'Forma de pago', sortable: true, },
                    // { key: 'fechaPago', label: 'Fecha de pago', sortable: true, },
                    { key: 'interval', label: 'Periodo', sortable: true, },
                    { key: 'status', label: 'Estado', sortable: true, },
                    { key: 'dateconfirmed', label: 'Fecha de pago confirmado', sortable: true, },
                    { key: 'editRow', class: 'tableEditRow' },
                ], /* Array width the fields of the main b-table */
                paymentsTableBusy: true, /* Flag to mark table as busy */
                paymentsTablePagination: 1, /* The pagination index of the table */
                paymentTypes: [
                    { value: 'Domiciliación', text: 'Domiciliación' },
                    { value: 'Tarjeta', text: 'Tarjeta' },
                    { value: 'Efectivo', text: 'Efectivo' },
                ], /* options for a b-select on the main b-table element */
                rates: [ 'Karate', 'Dirigidas', 'Dirigidas + Karate', 'Personalizada', 'Personalizada + Karate' ], /* Options for a b-select on the main b-table element to select the fee when edit a row */
                rowsSelected: [], /* Stores the selected rows of the table to manage some conditional rendering and states */
                states: [
                    { text: 'Confirmado', value: 'Confirmado' },
                    { text: 'Pendiente', value: 'Pendiente' },
                    { text: 'Devuelto', value: 'Devuelto' }
                ], /* Options for a select element */
                paymentsSearch: '', /* v-model for the table input search */
                wmpSteps: null, /* Steps for vue-tour, will be filled with external data */
                wpcSteps: null, /* Steps for vue-tour, will be filled with external data */
                wpdSteps: null, /* Steps for vue-tour, will be filled with external data */
            }
        },
        /**
         * Prevent leaving the page with editings open
         */
        beforeRouteLeave(to, from, next) {
            let answer = true;
            if (this.confirming || this.manualDownload || this.paymentsItems.some(el => el._showDetails == true)) {
                answer = confirm('No has guardado los cambios, ¿seguro que quieres salir?');
                if (!answer) {
                    next(false);
                }
            }
            if (answer) {
                /* End the open payments procedures at vuex */
                this.endProcedures('payments');
                /* Pause the validations before leave the page to prevent errors at assign the validation again to the reusable components */
                this.$validator.pause();
                next();
            }
        },
        computed: {
            ...mapGetters(['getPayments', 'getPaymentsById', 'getPaymentsYears']),
            ...mapGetters('navbar', ['getProcedureState']),
            /**
             * v-model that indicates if the charts has been saw
             */
            collapseCharts: {
                get() {
                    return this.getProcedureState('paymentsCharts');
                },
                set(val) {
                    this.setProcedureState({ procedure: 'paymentsCharts', newVal: val });
                }
            },
            /**
             * v-model that indicates if the confiming process has been started (it will be setted Vuex and its changes will be tracked on a watcher)
             */
            confirming() {
                return this.getProcedureState('paymentsConfirming');
            },
            /**
             * v-model that indicates if the dowload process has been started (it will be setted Vuex and its changes will be tracked on a watcher)
             */
            manualDownload() {
                return this.getProcedureState('paymentsPrinting');
            },
            /**
             * Compute all the payments without any filter
             */
            paymentsAll() {
                return this.getPayments();
            },
            /**
             * Initialize the payments data from the store. Determine the value of local variables.
             *
             * @return {Array} Array with the objects-rows to the table
             */
            paymentsItems() {
                /* If an id is provided via props then search the payments related with it, if not id is provided acquire all the payments o every customer */
                let payments = this.customer_id != null ? this.getPaymentsById(this.customer_id, this.getSelectedYear, this.getSelectedMonth, this.getSelectedState, this.getSelectedPayType, this.inactives) : this.getPayments(this.getSelectedYear, this.getSelectedMonth, this.getSelectedState, this.getSelectedPayType, this.inactives);
                if (this.allSelected) {
                    /* Get only the selected rows */
                    payments = payments.filter(payment => this.rowsSelected.some(rs => rs._id == payment._id && rs.interval == payment.interval) == true);
                }
                /* If a row has its '_showDetails' attribute actived it is necessary to check on the current filtered payments and to avoid errors, if on the current is not founded, checks on all the payments also */
                if (this.showingDetails) {
                    /* If the payment is on the current array of payments */
                    if (payments.find(payment => payment._id == this.onEditItem._id && payment.interval == this.onEditItem.interval)) {
                        this.$set(payments.find(payment => payment._id == this.onEditItem._id && payment.interval == this.onEditItem.interval), '_showDetails', true);
                    /* If the payment is not on the current array of payments discard finding on all the payments */
                    } else {
                        this.$set(this.paymentsAll.find(payment => payment._id == this.onEditItem._id && payment.interval == this.onEditItem.interval), '_showDetails', true);
                    }
                }
                return payments;
            },
            /**
             * Determines if all the elements are selected under visible filtered elements on the table. This function is used at the simulated checkbox of the head at the col selected of the table
             *
             * @return {Boolean} Boolean to determine if all the elements of the table are selected
             */
            selectedAll() {
                const filteredItems = this.$refs.paymentsTable && this.$refs.paymentsTable.filteredItems;
                if (this.rowsSelected.length > 0 && filteredItems.length > 0) {
                    if (this.confirming || this.manualDownload) {
                        const usefulRows = filteredItems.filter(el => el.paymenttype == 'Domiciliación' && el.status == 'Pendiente');
                        return usefulRows.every(ur => this.rowsSelected.some(rs => rs._id == ur._id && rs.interval == ur.interval) == true);
                    }
                    if (!this.confirming && !this.manualDownload) {
                        return filteredItems.every(fi => this.rowsSelected.some(rs => rs._id == fi._id && rs.interval == fi.interval) == true);
                    }
                }
            },
            /**
             * Determines if some selected row has been hided by the filters applied
             *
             * @return {Boolean} Boolean that determines if some row has been hided by the filters applied
             */
            selectedHided() {
                const filteredItems = this.$refs.paymentsTable && this.$refs.paymentsTable.filteredItems;
                return this.rowsSelected.length > 0 && this.rowsSelected.some(rs => filteredItems.findIndex(fi => fi._id == rs._id && rs.interval == fi.interval) == -1);
            },
            /**
             * Determines if some row is selected
             *
             * @return {Boolean} Boolean to determina if some element has been selected
             */
            selectedSome() {
                const filteredItems = this.$refs.paymentsTable && this.$refs.paymentsTable.filteredItems;
                return this.rowsSelected.length > 0 && filteredItems.length > 0 && this.rowsSelected.length > 0;
            },
            /**
             * Informs if some row is showing its details that means is editing
             *
             * @return {Boolean} Boolean that informs if some row is showing its details
             */
            showingDetails() {
                return Object.keys(this.onEditItem).length !== 0;
            },
        },
        created() {
            /* Prevents leave the page when changes has been made */
            window.addEventListener('beforeunload', this.beforeUnload);
            /* Initialize the imported information for the wizard steps */
            this.wmpSteps = WzdSteps.wmpSteps;
            this.wpcSteps = WzdSteps.wpcSteps;
            this.wpdSteps = WzdSteps.wpdSteps;
        },
        destroyed() {
            /* Destroy de listeners */
            window.removeEventListener('beforeunload', this.beforeUnload);
        },
        methods: {
            ...mapActions(['deletePayment', 'updatePaymentData', 'updatePaymentField']),
            ...mapActions('navbar', ['endProcedures', 'setProcedureState']),
            /**
             * Function that add the tags to the array v-model. Is called when a filter on the table is selected and on the mounted hook to apply the current year and month
             *
             * @param {String|Integer} value: is the value of the selected filter applied to the table, on the months it will be an integer
             * @param {String} type: is the type of tag to add, is passed only from the months to select the value correctly
             */
            addTags(value, type = null) {
                /* Only the months need to be interpreted, the rest of tag are pushed as comes */
                let tag = type == 'month' ? this.months[value] : value;
                this.filterTags.includes(tag) ? this.filterTags.splice(this.filterTags.indexOf(tag), 1) : this.filterTags.push(tag);
            },
            /**
             * Function to save the changes at the db
             *
             * @param {Object} row: contains the row from the table with the customer data that will be edited
             */
            applyEditRow(row) {
                this.paymentsTableBusy = true;
                /* Determine and format the date to pass to the api */
                let toControllerDate = this.determineDate(row);
                /* Pass the params as an Array */
                http.post('/api/updatePayments', QS.stringify({ data: new Array(row), date: toControllerDate, action: 'updating' }))
                    .then(response => {
                        /* Hide de details of the row (that means the edit has been finished) */
                        this.$set(row, '_showDetails', false);
                        /* Trigger a modification on the localStorage to propagate the changes on other windows */
                        localStorage.setItem('customer_updated', row._id);
                        localStorage.removeItem('customer_updated');
                        /* Reset the backup var */
                        this.onEditItem = {};
                        /* Check if any process (confirm or manual download) of payments is activated and manage the selection of the edited row */
                        this.evaluateRowSelectedState();
                        /* Regenerate the charts data */
                        this.fetchChartData();
                    })
                    .catch(error => {
                        this.$showToast('danger', 'No se ha podido completar la operación. Código de error: FEPa@ApEdRo', 'Ha ocurrido un error')
                        console.error(error.response ? error.response.data : error);
                    });
                this.paymentsTableBusy = false;
            },
            /**
             * Prevent leave the page with changes unsaved
             *
             * @param {Event} ev: the event fired
             */
            beforeUnload(ev) {
                let answer = true;
                /* From Chrome 60 onward, the beforeunload dialog will only appear if the frame attempting to display it has received a user gesture or user interaction (or if any embedded frame has received such a gesture). */
                if (this.confirming || this.manualDownload || this.paymentsItems.some(el => el._showDetails == true)) {
                    answer = confirm('No has guardado los cambios, ¿seguro que quieres salir?');
                    if (!answer) {
                        ev.preventDefault();
                        /* Chromium requires returnValue to stop the default propagation */
                        ev.returnValue = '';
                    }
                }
                if (answer) {
                    /* End the open payments procedures at vuex */
                    this.endProcedures('payments');
                    /* Pause the validations before leave the page to prevent errors at assign the validation again to the reusable components */
                    this.$validator.pause();
                }
            },
            /**
             * Cancel the edition of a row on demand
             */
            cancelEdit() {
                if (this.showingDetails) {
                    /* Restore the _showDetails attr */
                    this.$set(this.paymentsAll.find(payment => payment._id == this.onEditItem._id), '_showDetails', false);
                    /* Restore the entire editable data from the backup variable */
                    this.updatePaymentData({ _id: this.onEditItem._id, interval: this.onEditItem.interval, ...this.onEditItem });
                    /* Restore the backup variable */
                    this.onEditItem = {};
                }
            },
            /**
             * Mass confirmation of the payments on the payments.index route
             */
            confirmingState() {
                // this.paymentsTableBusy = true;
                http.post('/api/updatePayments', QS.stringify({ data: this.rowsSelected, action: this.newStateSelected }))
                    .then(response => {
                        /* Iterate over all the edited items */
                        response.data.updated.forEach(item => {
                            /* Update the customers state */
                            this.updatePaymentData({ ...item });
                            /* Trigger a modification on the localStorage to propagate the changes on other windows */
                            localStorage.setItem('customer_updated', item._id);
                            localStorage.removeItem('customer_updated');
                            /* Delete the selected row from the array of selected elements */
                            this.rowSelect(item, false);
                        });
                        /* Reset the used vars */
                        this.newStateSelected = false;
                        this.newEditRowDate = null
                        this.$showToast(response.data.status, response.data.message, 'Confirmación de pagos');
                        /* Regenerate the charts data */
                        this.fetchChartData();
                    })
                    .then(() => {
                        this.paymentsTableBusy = false;
                    })
                    .catch(error => {
                        this.$showToast('danger', 'No se ha podido completar la operación. Código de error: FEPa@CoSt', 'Ha ocurrido un error')
                        console.error(error.response ? error.response.data : error);
                    });
            },
            /**
             * Function that deletes a payment in the db
             *
             * @param {Object} row: contains the row from the table with the customer data that will be deleted
             */
            delPayment(row) {
                this.paymentsTableBusy = true;
                /* Confirm to the user that the action can not be undoed */
                this.$bvModal.msgBoxConfirm("EVITA USAR ESTA OPCIÓN, SI LO NECESITAS EDITA EL PAGO. ¿Estás seguro de que quieres borrar el pago? Nota: ESTO NO SE PUEDE DESHACER", {
                    title: 'ATENCIÓN',
                    size: 'sm',
                    buttonSize: 'sm',
                    okVariant: 'danger',
                    okTitle: 'Continuar',
                    cancelTitle: 'Volver',
                })
                .then(value => {
                    if (value) {
                        http.post('/api/deletePayments', QS.stringify(row))
                            .then(response => {
                                this.deletePayment({ _id: row._id, interval: row.interval });
                                /* Trigger a modification on the localStorage to propagate the changes on other windows */
                                localStorage.setItem('customer_updated', row._id);
                                localStorage.removeItem('customer_updated');
                                /* Reset the on edit item */
                                this.onEditItem = {};
                                this.$showToast(response.data.status, response.data.message, 'Borrado de pagos');
                            })
                            .catch(error => {
                                this.paymentsTableBusy = false;
                                this.$showToast('danger', 'No se ha podido completar la operación. Código de error: FEPa@DePa', 'Ha ocurrido un error')
                                console.error(error.response ? error.response.data : error);
                            });
                    }
                })
                .then(() => {
                    this.paymentsTableBusy = false;
                })
            },
            /**
             * Function called when a tag is removed from its interaction. It will splice the tag removed from the v-model of the tags element
             *
             * @param {String} tag: name of the tag clicked to be removed
             */
            deleteTag(tag) {
                /* Delete the specific tag */
                this.filterTags.splice(this.filterTags.indexOf(tag), 1);
                /* Delete the deleted tag on the array of filters too */
                if (this.getSelectedYear.indexOf(tag) != -1) {
                    this.getSelectedYear.splice(this.getSelectedYear.indexOf(tag), 1);
                } else if (this.months.indexOf(tag) != -1) {
                    this.getSelectedMonth.splice(this.getSelectedMonth.indexOf(this.months.indexOf(tag)), 1);
                } else if (this.btnStates.indexOf(tag) != -1) {
                    this.getSelectedState.splice(this.getSelectedState.indexOf(tag), 1);
                } else if (this.btnPayTypes.indexOf(tag) != -1) {
                    this.getSelectedPayType.splice(this.getSelectedPayType.indexOf(tag), 1);
                }
            },
            /**
             * Determine the date format to store at the database on the edition of a specific row in the confirmingState()
             *
             * @param {Object} row: the row item to update
             *
             * @returns The date formatted or null
             */
            determineDate(row) {
                /* If the new state is 'Pendiente' the date must be always null */
                if (row.status == 'Pendiente') {
                    return null;
                /* Format the date to the controller if the selected at the datepicker is different of null */
                } else if ((this.onEditItem.dateconfirmed != null && this.newEditRowDate != this.$moment(this.onEditItem.dateconfirmed, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD')) || (this.onEditItem.dateconfirmed == null && this.newEditRowDate != null)) {
                    return this.$moment(this.newEditRowDate, 'YYYY-MM-DD').format('DD-MM-YYYY HH:mm:ss');
                /* If the selected datepicker-dateconfirmed dates are the same pass it to the controller */
                } else if (this.onEditItem.dateconfirmed != null && this.newEditRowDate == this.$moment(this.onEditItem.dateconfirmed, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD')) {
                    return this.onEditItem.dateconfirmed;
                }
            },
            /**
             * Function that resets the variables that were changed on a row edition and recover the data of the row. Called to prevent hidding the row with and editing open when is applied some filter to the table with the input searcher or using the filter buttons dropdown.
             */
            disableEditingRow() {
                if (this.showingDetails) {
                    this.updatePaymentData({ _id: this.onEditItem._id, interval: this.onEditItem.interval, ...this.onEditItem });

                }
            },
            /**
             * Evaluate if the selected rows on the table can be selected when the manual download of payments or confirmation of payments process are launched. If the rows can be used on the process launched this function will unmark it and delete it from the rowsSelected array
             */
            evaluateRowSelectedState() {
                this.rowsSelected.forEach(item => {
                    /* If a payment is not on the status 'Pendiente' and with the paymenttype 'Domiciliación', cannot be used at te procedures */
                    if ((this.confirming || this.manualDownload) && (item.paymenttype != 'Domiciliación' || (item.paymenttype == 'Domiciliación' && item.status != 'Pendiente'))) {
                        this.rowSelect(item, false);
                        /* Recursive call to iterate over all the items of the array */
                        this.evaluateRowSelectedState();
                    }
                });
            },
            /**
             * Function that fetch the chart data with the table data. The data can be generated inside of the function when is called from a initial load of the table data or can be passed as a param when is called from an update of the table data
             */
            fetchChartData() {
                let auxDatos = this.generateChartData();
                let datos = auxDatos[0];
                let datosTotales = auxDatos[1];
                let auxDomDev = [],
                    auxDomPen = [],
                    auxDomPag = [],
                    auxEfePen = [],
                    auxEfePag = [],
                    auxTarPen = [],
                    auxTarPag = [],
                    totalIngresos = [],
                    totalIngresosPerdidos = [],
                    totalPagosCompletados = [],
                    totalPagosPendientes = [],
                    totalSocios = [];
                for (let i = 0; i <= 11; i++) {
                    auxDomDev.push(datos.months[i].domiciliacion.devuelto);
                    auxDomPen.push(datos.months[i].domiciliacion.pendiente);
                    auxDomPag.push(datos.months[i].domiciliacion.pagado);
                    auxEfePen.push(datos.months[i].efectivo.pendiente);
                    auxEfePag.push(datos.months[i].efectivo.pagado);
                    auxTarPen.push(datos.months[i].tarjeta.pendiente);
                    auxTarPag.push(datos.months[i].tarjeta.pagado);
                    totalIngresos.push(datosTotales.months[i].totalIngresos);
                    totalIngresosPerdidos.push(datosTotales.months[i].totalIngresosPerdidos);
                    totalPagosCompletados.push(datosTotales.months[i].totalPagosCompletados);
                    totalPagosPendientes.push(datosTotales.months[i].totalPagosPendientes);
                    totalSocios.push(datosTotales.months[i].totalSocios);
                }
                this.chartPagosTipoData = {
                    datasets: [
                        {
                            backgroundColor: '#BFE0D4',
                            data: auxDomDev,
                            label: 'Domiciliados devueltos',
                        }, {
                            backgroundColor: '#60B292',
                            data: auxDomPen,
                            label: 'Domiciliados pendientes',
                        }, {
                            backgroundColor: '#008351',
                            data: auxDomPag,
                            label: 'Domiciliados pagados',
                        }, {
                            backgroundColor: '#9260B2',
                            data: auxEfePen,
                            label: 'Efectivo pendientes',
                        }, {
                            backgroundColor: '#510083',
                            data: auxEfePag,
                            label: 'Efectivo pagado',
                        }, {
                            backgroundColor: '#B29260',
                            data: auxTarPen,
                            label: 'Tarjeta pendientes',
                        }, {
                            backgroundColor: '#835100',
                            data: auxTarPag,
                            label: 'Tarjeta pagado',
                        },
                    ],
                    labels: this.months,
                }
                this.chartPagosTotalData = {
                    datasets: [
                        {
                            backgroundColor: '#008351',
                            borderColor: '#008351',
                            borderWidth: 1,
                            data: totalSocios,
                            fill: false,
                            label: 'Socios totales',
                            type: 'line',
                            yAxisID: 'right',
                        }, {
                            backgroundColor: '#830032',
                            borderColor: '#830032',
                            borderWidth: 1,
                            data: totalPagosCompletados,
                            fill: false,
                            label: 'Pagos completados',
                            yAxisID: 'left'
                        }, {
                            backgroundColor: '#748300',
                            borderColor: '#748300',
                            borderWidth: 1,
                            data: totalPagosPendientes,
                            fill: false,
                            label: 'Pagos pendientes',
                            yAxisID: 'left'
                        },
                    ],
                    labels: this.months,
                }
                this.chartIngresosTotalData = {
                    datasets: [
                        {
                            backgroundColor: '#008351',
                            borderColor: '#008351',
                            borderWidth: 1,
                            data: totalSocios,
                            fill: false,
                            label: 'Socios totales',
                            type: 'line',
                            yAxisID: 'right',
                        }, {
                            backgroundColor: '#0F0083',
                            borderColor: '#0F0083',
                            borderWidth: 1,
                            data: totalIngresos,
                            fill: false,
                            label: 'Ingresos totales',
                            yAxisID: 'left'
                        }, {
                            backgroundColor: '#830032',
                            borderColor: '#830032',
                            borderWidth: 1,
                            data: totalIngresosPerdidos,
                            fill: false,
                            label: 'Ingresos perdidos',
                            yAxisID: 'left'
                        }
                    ],
                    labels: this.months,
                }
            },
            /**
             * Activates the flags to show the selected elements on the table and reset the filters applied
             */
            filterSelected() {
                /* Active the flag/v-model to show the tag and all the  */
                this.allSelected = true;
                /* Reset all the filters and tags */
                this.filterTags = [];
                this.getSelectedMonth = [];
                this.getSelectedPayType = [];
                this.getSelectedYear = [];
                this.getSelectedState = [];
                this.paymentsSearch = '';
                /* If one of the selected elements is inactive, active the option to show the inactive customers */
                if (this.rowsSelected.some(el => el.active == false)) {
                    this.inactives = true;
                }
            },
            /**
             * Filters the table component by the input provided for it
             *
             * @param {Object} value: the row of the table to make the search
             *
             * @return {Boolean} Boolean which indicates if the row includes or not the search
             */
            filterTable(value) {
                /* Stringify and clean the received object */
                let auxValue = JSON.stringify(value).toLowerCase().replace(new RegExp(/\"/g), '');
                let valueClean = '';
                /* Iterate over the stringified value passed to convert every special character to a regular */
                for (let i = 0; i < auxValue.length; i++) {
                    valueClean += SPECIAL_CHARACTERS[auxValue.charAt(i)] || auxValue.charAt(i);
                }
                let auxFilter = this.paymentsSearch.toLowerCase();
                let filterClean = '';
                /* Iterate over the input search value to convert every special character to a regular */
                for (let i = 0; i < auxFilter.length; i++) {
                    filterClean += SPECIAL_CHARACTERS[auxFilter.charAt(i)] || auxFilter.charAt(i);
                }
                return !this.paymentsSearch || valueClean.includes(filterClean)
            },
            /**
             * Function that generates the data for the charts, it can be called on the initial load of the table data or when the table data is updated
             *
             * @param {Boolean} manual: indicates if the function is called from the initial load or from the updates of the table data
             *
             * @return {Array} formed with the generated chart data and the totals of the generated chart data, it is necessary to fetch the different charts
             */
            generateChartData() {
                let aux = {};
                aux.months = [];
                this.$set(aux.months, 0, this.months);
                let total = {};
                total.months = [];
                for (let i = 0; i <= 11; i++) {
                    aux.months[i] = {
                        efectivo: {
                            pendiente: 0,
                            pagado: 0,
                        },
                        tarjeta: {
                            pendiente: 0,
                            pagado: 0,
                        },
                        domiciliacion: {
                            pendiente: 0,
                            pagado: 0,
                            devuelto: 0,
                        },
                    },
                    total.months[i] = {
                        totalSocios: 0,
                        totalPagosCompletados: 0,
                        totalPagosPendientes: 0,
                        totalIngresos: 0,
                        totalIngresosPerdidos: 0,
                    }
                }
                let auxDatosPago = this.$refs.paymentsTable.isFiltered ? this.$refs.paymentsTable.filteredItems : this.paymentsItems;
                auxDatosPago.forEach(pago => {
                    for (let j = 0; j <= 11; j++) {
                        if (this.$moment(pago['interval'],'YYYY-MM').month() == j) {
                            total.months[j].totalSocios++;
                            switch (pago['paymenttype']) {
                                case 'Domiciliación':
                                    if (pago['status'] == 'Pendiente') {
                                        aux.months[j].domiciliacion.pendiente++;
                                        total.months[j].totalPagosPendientes++;
                                        total.months[j].totalIngresosPerdidos += parseInt(pago['amount'])
                                    } else if (pago['status'] == 'Devuelto') {
                                        aux.months[j].domiciliacion.devuelto++;
                                        total.months[j].totalPagosPendientes++;
                                        total.months[j].totalIngresosPerdidos += parseInt(pago['amount']);
                                    } else {
                                        aux.months[j].domiciliacion.pagado++;
                                        total.months[j].totalPagosCompletados++;
                                        total.months[j].totalIngresos += parseInt(pago['amount']);
                                    }
                                    break;
                                case 'Tarjeta':
                                    if (pago['status'] == 'Pendiente') {
                                        aux.months[j].tarjeta.pendiente++;
                                        total.months[j].totalPagosPendientes++;
                                        total.months[j].totalIngresosPerdidos += parseInt(pago['amount']);
                                    } else {
                                        aux.months[j].tarjeta.pagado++;
                                        total.months[j].totalPagosCompletados++;
                                        total.months[j].totalIngresos += parseInt(pago['amount']);
                                    }
                                    break;
                                case 'Efectivo':
                                    if (pago['status'] == 'Pendiente') {
                                        aux.months[j].efectivo.pendiente++;
                                        total.months[j].totalPagosPendientes++;
                                        total.months[j].totalIngresosPerdidos += parseInt(pago['amount']);
                                    } else {
                                        aux.months[j].efectivo.pagado++;
                                        total.months[j].totalPagosCompletados++;
                                        total.months[j].totalIngresos += parseInt(pago['amount']);
                                    }
                                    break;
                            }
                        }
                    }
                });
                return [aux, total];
            },
            /**
             * Determines if a specific row is selected on the table. Its used on every row checkbox at the select col
             *
             * @param {Object} row: is the table row item
             *
             * @return {Boolean} Boolean to determine if the row passed is selected
             */
            isSelected(row) {
                return this.rowsSelected.some(el => el._id == row._id && el.interval == row.interval);
            },
            /**
             * Function that shows the details on a table row. The details showed means that this row its being updated or deleted. Moreover, the function backups the data passed to allows a 'Cancel' option and revert the possible modifications do it without save at the db
             *
             * @param {Object} row: contains the row from the table with the customer data that will be deleted
             */
            manageDetails(row) {
                /* Assign formatted value to the v-model of the date if a date is provided on the row */
                this.newEditRowDate = row.dateconfirmed != null ? this.$moment(row.dateconfirmed, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD') : null;
                this.$set(row, '_showDetails', !row._showDetails);
                if (!this.showingDetails) {
                    /* Backup the data to allow the user undo the edition if it is goint to be saved (on the recover only recovers the relevant/editable data) */
                    RESTORE_FIELDS.forEach(field => {
                        this.$set(this.onEditItem, field, row[field]);
                    });
                }
            },
            /**
             * Function that unselect all the actived checkbox filters of the table and reload the data, this function will show all the existing payments on the database for every customer for the current year
             */
            resetFilters() {
                /* Reset the filters of the main table. Always mantain the filters to the current year and month to avoid performance issues */
                this.paymentsSearch = '';
                this.getSelectedYear = [ this.$moment().year() ];
                this.getSelectedMonth = [ this.$moment().month() ];
                this.getSelectedState = [];
                this.getSelectedPayType = [];
                /* Reset the tags */
                this.filterTags = [];
                this.allSelected = false;
                this.inactives = false;
                this.addTags(this.getSelectedYear[0]);
                this.addTags(this.getSelectedMonth[0], 'month');
            },
            /**
             * Resolves if a row has some field edited to allow its restore
             *
             * @param {Object} row: row item of the table
             *
             * @return {Boolean} true when the row has an edited fied and false when the row remains inalterated
             */
            rowEdited(row) {
                return RESTORE_FIELDS.some(field => {
                    return (field == 'dateconfirmed' && this.newEditRowDate != (this.onEditItem.dateconfirmed == null ? null : this.$moment(this.onEditItem.dateconfirmed, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD')) || row[field] != this.onEditItem[field]);
                });
            },
            /**
             * Select/Unselect a row (pushing it at the rowsSelected array) individually on check its on-line checkbox
             *
             * @param {Object} row: row item of the table
             * @param {Boolean} ev: the state of the checkbox
             */
            rowSelect(row, newVal) {
                console.log(row);
                let index = this.rowsSelected.findIndex(el => el._id == row._id && el.interval == row.interval);
                if (newVal && index == -1) {
                    this.rowsSelected.push(row);
                } else if (!newVal && index != -1) {
                    this.rowsSelected.splice(index, 1);
                }
            },
            /**
             * Called from the checkbox on the head of 'select' col on the table to select/unselect all the rows
             *
             * @param {Boolean} checked: the state of the checkbox
             */
            rowSelectAll(checked) {
                this.$refs.paymentsTable.filteredItems.forEach(rowItem => {
                    if (checked == true && !this.rowsSelected.some(el => el._id == rowItem._id && el.interval == rowItem.interval)) {
                        /* Evaluate separetly to select the rows in every procedure actived (they cannot be active simultaneously), in some way this overload the conditions on rowSelect() */
                        if ((this.confirming && rowItem.status == 'Pendiente' && rowItem.paymenttype == 'Domiciliación') || (this.manualDownload && rowItem.estado != 'Pendiente' && rowItem.paymenttype == 'Domiciliación') || (!this.confirming && !this.manualDownload)) {
                            this.rowSelect(rowItem, true);
                        }
                    } else if (checked == false && this.rowsSelected.some(el => el._id == rowItem._id && el.interval == rowItem.interval)) {
                        this.rowSelect(rowItem, false);
                    }
                });
            },
            /**
             * Evaluate the value of the amount field based on the rate field on a row editing
             *
             * @param {Object} row: contains the row from the table with the customer data that has being edited
             * @param {Event} ev: contains the value of the select element wich launch this function
             */
            selectImporte(row, ev) {
                let newAmount = '';
                switch(ev) {
                    case 'Karate':
                        newAmount = 32;
                        break;
                    case 'Dirigidas':
                        newAmount = 45;
                        break;
                    case 'Dirigidas + Karate':
                        newAmount = 50;
                        break;
                }
                this.updatePaymentField({ field: 'amount', newVal: newAmount, ...row.item });
            },
        },
        mounted() {
            /* Get all the distinct years in the store */
            this.btnYears = this.getPaymentsYears;
            /* Fetch the charts data */
            this.fetchChartData();
            /* Add the tags of the filters applied always on the first load */
            this.addTags(this.getSelectedYear[0]);
            this.addTags(this.getSelectedMonth[0], 'month');
            /* Stop the 'loading' animation */
            this.paymentsTableBusy = false;
        },
        props: [
            'customer_id', /* If is provided the table items are from this customer */
            'isDisabled', /* Indicates if the form is being edited */
            'tableFields', /* The table fields */
        ],
        watch: {
            /* Watch the confirming changes to evaluate the rows selected */
            confirming(newVal, oldVal) {
                if (newVal == true) {
                    /* Clean the possible selected rows and leave only the permitted */
                    if (this.rowsSelected.length > 0) {
                        this.evaluateRowSelectedState();
                    }
                }
            },
            /* Watch the manualDownload changes to evaluate the rows selected */
            manualDownload(newVal, oldVal) {
                if (newVal == true) {
                    /* Clean the possible selected rows and leave only the permitted */
                    if (this.rowsSelected.length > 0) {
                        this.evaluateRowSelectedState();
                    }
                }
            },
            /* Watch to the table items changes to fetch the carts */
            paymentsItems(newVal, oldVal) {
                if (JSON.stringify(newVal) != JSON.stringify(oldVal)) {
                    this.fetchChartData();
                }
            },
        },
    }
</script>

<style>
    .editable-field {
        padding: 0 2.5px;
    }
    #paymentsTable .b-table-details {
        background-color: rgba(0, 81, 130, .2)!important;
    }
    /* Overwritting the default datepicker values for the table elements  */
    [id^='datepicker-pagos'] {
        height: 25px!important;
        margin-top: 2px!important; /* Align to the rest row inputs */
        padding: 0!important;
        /* width: 130px!important; */
    }
</style>
<style scoped>
    .badge-inline-text {
        transform: translateY(-1px);
    }
    .chart-pagos {
        background: linear-gradient(90deg, rgba(0, 0, 0, .01) 60%, rgba(0, 0, 0, .02) 100%);
        border-radius: .25rem;
        box-sizing: border-box;
        height: 200px;
        margin: 0 auto;
        width: 100%;
    }
    .invalid-feedback {
        position: unset!important; /* Its important to avoid the position: absolute general that in table will produce superposition */
    }
    .tableEditRow span {
        padding: .25rem;
    }
    .subtitle.subtitle-filters {
        font-size: calc(20px + (50 - 20) * ((100vw - 300px) / (1600 - 300))); /* minsize + (max-min) * (maxvw - minvw) * (maxpx - minpx) */
        margin-right: 15px;
    }
    .wrp-chart {
        padding: 1rem;
    }
    [class*='slot-table-input'] {
        max-height: 25px;
        padding-top: 0;
        padding-bottom: 0;
    }
    input[class*='disabled'],
    select[class*='disabled']  {
        background-color: unset!important;
        border: unset!important;
    }
    input[class*='disabled']:focus,
    select[class*='disabled']:focus  {
        box-shadow: unset!important;
    }
    select[class*='slot-table-input'] {
        min-width: 130px;
    }
    #card-pagos {
        margin-bottom: 50px;
    }
    #collapse-charts {
        background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, .02) 100%);
        border-radius: .25rem;
    }
    #payments-seleccionadas-btn {
        white-space: nowrap;
    }
    [id^=amount-row] {
        padding: 0!important;
    }
    /* Media queries */
    @media (max-width: 1200px) {
        .wrp-group-btns {
            display: block;
        }
    }
</style>
