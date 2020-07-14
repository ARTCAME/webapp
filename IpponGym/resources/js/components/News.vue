<template>
    <div>
        <h4>Lee detenidamente, por favor: </h4>
        <p>
            <u>Importante</u>: visita la sección TESTS para seguir enviando tus resultados y poder validar el funcionamiento de la aplicación, la encontrarás accesible desde la barra de navegación o desde la página de inicio en el botón 'Realizar TESTS sobre procesos'.
            <br><br>
            Es necesario que rellenes los tests que se piden en esta sección para poder ir conociendo el funcionamiento de la aplicación.
            <br><br>
            Además, te recomiento que <u>accedas a la documentación</u> si tienes cualquier duda o no ya que, aunque es extensa, podrás conocer el funcionamiento de la aplicación en profundidad. Puedes acceder desde cualquier pantalla de la aplicación usando el botón que hay en el margen inferior izquierdo.
        </p>
        <h4>
            Revisa los cambios aplicados y los que están por llegar:
        </h4>
        <p>
            <h6>Cambios recientes:</h6>
            &emsp;- Se ha reconfigurado la conexión con la base de datos ya que al guardar los socios no se estaban mostrando en las búsquedas, ahora ya funciona correctamente
            &emsp;- Se ha añadido esta página de noticias para mostrar las novedades más importantes, se desactivará automáticamente al cerrarla y volverá a aparecer cuando existan actualizaciones
        </p>
        <p>
            <h6>Errores detectados:</h6>
            &emsp;- Al guardar un socio puede existir un error en la fecha de nacimiento que genere un aviso de error. Por favor, cuando utilices este campo comprueba correctamente que:
            <br>&emsp;&emsp;- Que la fecha tenga el formato correcto, el campo debería obligarte a aplicarlo pero siempre deberá ser DD/MM/AAAA
            <br>&emsp;&emsp;- La fecha de nacimiento sea correcta, el sistema detectará que un 30 de febrero o 34 de enero no pueden existir
            <br>&emsp;&emsp;- Si el socio es menor automáticamente te pedirá rellenar datos del tutor, verifica que esto sea así
            <br>&emsp;&emsp;- Si el error persiste recuerda hacer una captura y añadírmela en el test que estuvieras haciendo (si estás en un navegador de ordenador y puedes acceder a la consola añádela a la captura, si este último punto te suena a chino haz como si no lo hubieras leído)
        </p>
        <p>
            <h6>Fallos conocidos que se solucionarán en próximas versiones:</h6>
            &emsp;- La página de inicio, en su versión móvil no tiene scroll y algunos elementos quedan ocultos o tapados y no te podrás desplazar por la página
            <br>&emsp;- Al guardar un socio se descargará automáticamente documentación. Esta documentación por el momento no es correcta y puede contener fallos que no indican un error
        </p>
        <h3>
            Gracias por ayudar a mejorar la aplicación 💝
        </h3>
    </div>
</template>

<script>
</script>

<style>

</style>
