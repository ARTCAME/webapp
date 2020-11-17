<template>
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
            <h5>Durante los próximos días se publicará <router-link target="_blank" to="/wiki">la documentación</router-link> relacionada con todos estos cambios.</h5>
        </p>
    </b-container>
</template>
