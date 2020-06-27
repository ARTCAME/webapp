<template>
    <div id="doc-utils-pagos">
        <b-form-group>
            <h1 class="subtitle">
                Actualiza y genera pagos
            </h1>
            <p>
                Esta utilidad está orientada a gestionar los pagos que los socios nos realicen físicamente en el centro aunque sus opciones nos permite gestionar cualquier tipo de pago. Debemos tener en cuenta que tenemos la sección para la <a href="doc-pagos" @click.prevent="$scrollTo('#doc-pagos')">gestión global de Pagos</a> desde la que podremos gestionar masivamente los pagos domiciliados.
            </p>
            <p>
                Está pensada para llevar el control de quién nos abona las cuotas y poder generar recibos de pago en el momento ya que la propia utilidad nos permite descargar el recibo en el mismo momento para poder conservarlo o entregárselo al cliente.
            </p>
            <p>
                Los pagos que no hayan sido confirmados aparecerán en el estado ‘Pendiente’, los pagos con tarjeta y efectivo que hayan sido completados cambiarán al estado ‘Confirmado’ y los pagos domiciliados, una vez hayan sido completados, podrán aparecer como ‘Confirmado’ o ‘Devuelto’, según el caso concreto. Cuando usemos esta utilidad marcaremos los pagos pendientes a estos nuevos estados.
            </p>
            <p>
                Podremos actualizar los pagos ya generados o generar pagos nuevos si estos no existen, la aplicación nos advertirá de si estamos generando o actualizando un pago. Que un pago se genere o se actualice depende directamente de la fecha en que se pretenda crear desde esta utilidad ya que los pagos se generarán automáticamente para todos los socios a principios de cada mes.
            </p>
            <p>
                Vamos a contextualizar mejor estos procesos con unos ejemplos genéricos: un socio/a viene a abonarnos el día 25 de enero la cuota de febrero (al ser antes de principio de mes esta cuota no ha sido generada aún por el sistema y por lo tanto, al guardarla la crearemos nosotros en el momento del registro del pago). Al generar en el momento la cuota, ésta se generará con los datos de pago que existen en la ficha del socio/a en el momento de generarlo por lo que, si queremos hacer algún cambio, deberemos ir a la ficha del socio/a, realizar las modificaciones necesarias y finalmente guardar el pago desde la utilidad de pagos.
            </p>
            <p>
                Otro ejemplo: un socio/a viene a abonarnos el día 5 de septiembre la cuota de septiembre (al haber pasado principio de mes la cuota ya se ha generado automáticamente y procederemos a actualizarla para quitarle el estado 'Pendiente'), la cuota se generó con la forma de pago que existía en la ficha del socio/a que es Tarjeta pero el cliente viene a pagar en efectivo, este pago deberá ser modificado desde la ficha del socio/a o desde la sección de pagos antes de marcarlo como completado y una vez modificada la forma de pago a Efectivo se podrá actualizar el pago para marcarlo como pagado.
            </p>
            <p>
                <u>Nota</u>: En la sección Pagos veremos más detalles sobre los procesos de edición y creación de pagos.
            </p>
            <p>
                El proceso para actualizar un pago es tan sencillo como buscar y seleccionar el cliente para posteriormente seleccionar el intervalo de pago. La aplicación actualiza en tiempo real los pagos disponibles para actualizar ya que si un pago ha sido confirmado y ya no consta en estado 'Pendiente' no podremos actualizarlo con esta utilidad y deberemos acceder a la ficha del socio para modificar lo que necesitemos
            </p>
            <p>
                A continuación, presentamos unas capturas que ilustran lo que hemos explicado. En la siguiente vemos como sería la generación de un recibo de un pago en tarjeta, podemos ver como la aplicación nos advierte de que el pago será creado:
            </p>
            <DocImg alt="Generando un nuevo pago con tarjeta" desc="Estamos generando un nuevo pago con tarjeta para agosto de 2021" img="Recibos1.png" type="image/png"></DocImg>
            <p>
                En la siguiente captura vemos otro ejemplo pero en este caso la forma de pago es mediante domiciliación bancaria, podemos ver que tenemos más datos como el iban. Además en este caso vemos como la aplicación nos advierte por un lado de que los datos del pago difieren de los actuales en la ficha de socio y que el pago ya existía por lo que se actualizará. Este ejemplo puede ser uno de los que menos usemos en el día a día pero cabe remarcar que el sistema validará que el iban exista y todo sea correcto antes de permitirnos realizar el registro del pago:
            </p>
            <DocImg alt="Actualizando un pago domiciliado" desc="Actualizamos un pago domiciliado que tiene datos diferentes a los que hay en la ficha de socio" img="Recibos2.png" type="image/png"></DocImg>
            <p>
                Finalmente, cuando decidamos registrar el pago veremos la pantalla de confirmación definitiva en la que podremos guardar generando un recibo o simplemente guardar:
            </p>
            <DocImg alt="Confirmación de guardado de datos de pago" desc="Confirmación de guardado de datos de pago" img="Recibos3.png" noexpandable="true" type="image/png" width="500"></DocImg>
        </b-form-group>
    </div>
</template>
