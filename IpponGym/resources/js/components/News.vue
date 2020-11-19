<template>
    <div>
        <transition appear name="launcher-appear">
            <b-button
                id="tester-news"
                title="Novedades"
                v-b-tooltip.hover.right.noninteractive
                v-if="isLoggedIn && ($route.name != '404' && $route.name != 'wiki' && $route.name != 'maintenance')"
                @click="$bvModal.show('welcome-home-modal')">
                <fa-icon icon="newspaper"></fa-icon>
                <b-badge
                    class="btn-alert-badge"
                    variant="danger"
                    v-if="showNewsBadge">!</b-badge>
            </b-button>
        </transition>
        <b-modal
            class="nav-modals"
            button-size="sm"
            hide-backdrop
            hide-footer
            id="welcome-home-modal"
            modal-class="ig-custom-modal"
            no-close-on-backdrop
            ref="mdl-welcome-home"
            show
            scrollable
            @hidden="$manageScrollBar()"
            @close="unwantNews()"
            @show="$manageScrollBar">
            <template
                #modal-title>
                <h1>Novedades y actualización de errores</h1>
            </template>
            <b-container>
                <h4>
                    📢Se han liberado una gran cantidad de mejoras y cambios, los más relevantes son:
                </h4>
                <p>
                    <h5>Mejoras visuales:</h5>
                    &emsp;- Se ha mejorado y estandarizado el funcionamiento de animaciones y transiciones
                    <br>&emsp;- Se han estandarizado el funcionamiento y estilo de algunos botones
                    <br>&emsp;- Se han añadido mejoras para facilitar el uso en pantallas de menor tamaño
                    <br>&emsp;- Se ha mejorado el funcionamiento de la barra de navegación, sus botones y animaciones
                    <br>&emsp;- Se ha añadido una animación de carga en la página del socio
                    <h5>Pagos:</h5>
                    &emsp;- Los pagos ahora se dividen entre pagos manuales y periódicos y podemos crear pagos manuales basados en un concepto e importe que escojamos nosotros o pagos periódicos basados en la cuota contratada por el socio
                    <br>&emsp;- Se ha revisado el funcionamiento de la tabla de pagos y su filtrado, se han añadido los filtros por fecha de creación y fecha de confirmación
                    <br>&emsp;- Se ha mejorado el proceso de edición de un pago desde la tabla de pagos que comparte diseño y proceso con la creación de nuevos pagos
                    <h5>Alta, edición y ficha del socio:</h5>
                    &emsp;- Los grados ahora se añaden durante la edición de un socio y es necesario guardar la ficha para que se apliquen los cambios
                    <br>&emsp;- Los pagos ahora se pueden editar desde la tabla de pagos que hay en ficha del socio sin necesidad de editar todo el socio
                    <br>&emsp;- Se ha añadido un campo notas para el socio en el que se verán reflejadas tanto el día y hora como la nota, esto se aplica también en contactos y tutores
                    <br>&emsp;- Se ha ampliado el margen del importe de la cuota permitido, ahora empieza en 0,01€
                    <h5>Documentos:</h5>
                    &emsp;- Se ha mejorado visualmente el proceso para generar manualmente documentos desde la herramienta dedicada, también se ha añadido una vista previa del documento
                    <br>&emsp;- Los documentos legales no podrán generarse si el socio no los ha aceptado
                    <br>&emsp;- Cualquier tipo de documento podrá se impreso aun faltando datos del socio, el sistema nos avisará de que faltan datos pero nos permitirá imprimir el documento incompleto
                    <h5>Otras mejoras:</h5>
                    &emsp;- Se han aplicado mejoras en el rendimiento al cargar los socios
                    <br>&emsp;- Se han aplicado mejoras en el rendimiento al buscar socios
                    <br><br>
                    <h5>Durante los próximos días se publicará <router-link class="h5" target="_blank" to="/wiki">la documentación</router-link> relacionada con todos estos cambios.</h5>
                </p>
            </b-container>
        </b-modal>
    </div>
</template>
<script>
    import { http } from "../utils/http";
    import { mapGetters } from 'vuex';
    export default {
        data() {
            return {
                showNewsBadge: null,
                wantNews: false,
            }
        },
        computed: {
            ...mapGetters('auth', ['isLoggedIn', 'authenticatedUser']),
        },
        methods: {
            /**
             * Function executed when the welcome modal is closed to disable this shown on future logins or page changing
             */
            unwantNews() {
                this.showNewsBadge = false
                http.post('/api/unwantNews', { username: this.authenticatedUser });
            }
        },
        mounted() {
            /* If a user is logged in check if is mandatory to show the news modal */
            if (this.isLoggedIn) {
                http.get('api/showNews', { params: { username: this.authenticatedUser } })
                    .then(response => {
                        /* Will be a boolean */
                        this.wantNews = response.data;
                        this.showNewsBadge = response.data;
                        /* If the modal is needed to be show, show it */
                        if (this.wantNews) {
                            setTimeout(() => {
                                this.$bvModal.show('welcome-home-modal');
                            }, 3000);
                        }
                    });
            }
        },
    }
</script>
<style>
    #welcome-home-modal___BV_modal_outer_ {
        z-index: 1100!important;  /* In front of everything, nothing overlays it */
    }
    #welcome-home-modal.ig-custom-modal .modal-content {
        background: linear-gradient(-25deg, rgba(250, 250, 250, .8) 0%, rgba(255, 255, 224, 1) 70%)!important;
    }
    #welcome-home-modal.ig-custom-modal .modal-header {
        padding: 1rem 1rem 1rem 3rem!important;
    }
</style>
<style scoped>
    .btn-alert-badge {
        left: -5px!important;
        position: absolute!important;
        top: -10px!important;
        transition: .3s ease;
    }
    #tester-news {
        background: rgba(0, 131, 81, 1);
        border: rgba(0, 131, 81, 1);
        bottom: 55px;
        box-shadow: 0 0 3px rgba(0, 0, 0, .5);
        font-size: 17px;
        height: 30px;
        left: .5rem;
        line-height: 30px;
        opacity: .4;
        padding: 0;
        position: fixed;
        text-align: center;
        transform: scale(0.98);
        transition: all .3s;
        width: 30px;
        z-index: 1040;
    }
    #tester-news:hover {
        opacity: 1;
        transform: scale(1);
    }
    #tester-news:hover .btn-alert-badge  {
        left: -6px!important;
        top: -11px!important;
    }
</style>
