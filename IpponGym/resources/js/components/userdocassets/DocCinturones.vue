<template>
    <div id="doc-cinturones">
        <b-form-group>
            <h1 class="subtitle">
                Gestión global de grados
            </h1>
            <p>
                Desde la sección de grados tendremos una visión global de los grados otorgados a los socios del club y podremos modificar datos de manera masiva o individualmente y podremos buscar fácilmente para localizar socios concretos:
            </p>
            <DocImg alt="Gestión global de grados" desc="Desde la vista general de grados podemos ver el grado actual y el siguiente de nuestros socios y podremos acceder a todo el histórico así como buscar o filtrar para localizar los que necesitemos" img="Grados1.png" type="image/png"></DocImg>
            <p>
                En esta sección también podremos borrar individualmente grados a un socio, esta acción está pensada como un acceso rápido ya que si necesitamos hacer modificaciones individualizadas lo ideal es hacerlas desde la ficha del socio. Para acceder al borrado pulsaremos el nombre del socio o su grado actual o siguiente y usaremos el botón de edición para activarla:
            </p>
            <DocImg alt="Borrando cinturones" desc="Desde una línea de la tabla podemos borrar grados a un socio, añadir grados se hace desde la herramienta principal de actualización de grados o desde la ficha del socio" img="Grados2.png" type="image/png"></DocImg>
            <p>
                Además, en la barra de navegación principal tendremos acceso a herramientas que nos permitirán gestionar los cinturones de manera masiva:
                <DocImg alt="Herramientas para grados" desc="En la gestión global de grados podremos actualizarlos masivamente o descargar manualmente archivos para generar de diplomas" img="Grados3.png" type="image/png"></DocImg>
                <p>
                    <h4 id="doc-grados-actualizar">
                        Actualización de grados:
                    </h4>
                    <p>
                        Es el proceso con el que podremos actualizar masivamente los grados otorgados a uno o varios socios/as. El proceso funciona de la siguiente manera:
                        <br>
                        &emsp;- Disponemos de un listado de socios que tienen grados de karate otorgados
                        <br>
                        &emsp;- Deberemos seleccionar los socios de los que necesitamos actualizar sus grados, podremos buscar o filtrar los socios como queramos
                        <br>
                        &emsp;- La aplicación tendrá en cuenta cuál fue el último grado otorgado para otorgarle el siguiente en cada caso
                        <br>
                        &emsp;- Podremos seleccionar de entre los grados pendientes el que necesitemos para que ese sea el que tome el proceso para actualizarlo, para ello solamente deberemos clicar sobre el grado para que se añada como Siguiente grado
                        <br>
                        &emsp;- Un socio/a que ya sea cinturón negro no será seleccionable, si quisiéramos otorgarle un grado inferior que tuviera pendiente deberemos seleccionarlo como Siguiente grado
                        <br>
                        &emsp;- La cantidad de grados que podemos actualizar no está definida, puede ser uno o muchos según nuestra necesidad
                        <br>
                        &emsp;- Al finalizar el proceso se descarga automáticamente un fichero en formato csv con la relación de socios/as actualizados y con él podremos generar posteriormente los diplomas para entregárselos a los socios/as
                    </p>
                </p>
                <p>
                    <h4 id="doc-grados-descargar">
                        Descarga manual de archivo de diplomas:
                    </h4>
                    <p>
                        Esta herramienta nos servirá para descargar manualmente los datos necesarios para generar diplomas. Como hemos visto, durante el proceso de actualización de grados se descargará este fichero automáticamente pero siempre podemos necesitar descargarlo manualmente.
                    </p>
                    <p>
                        El proceso consiste en la selección de los socios/as de los que necesitamos sus datos y una vez seleccionados usaremos el botón descargar para obtener el fichero.
                    </p>
                </p>
            </p>
        </b-form-group>
    </div>
</template>
