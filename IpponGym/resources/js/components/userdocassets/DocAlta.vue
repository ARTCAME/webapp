<template>
    <div id="doc-alta">
        <b-form-group>
            <h1 class="subtitle">
                Alta y edición de socios
            </h1>
            <p>
                El formulario que nos va a permitir realizar un alta o una edición de socio mantienen el mismo formato y solamente podrán variar los elementos dinámicos que añadamos en cada caso.
            </p>
            <p>
                Para gestionar una alta nueva usaremos el acceso desde la página de bienvenida o la barra de navegación y para acceder a la edición de un socio usaremos la utilidad de búsqueda de socios para acceder a la ficha y una vez allí activaríamos la edición del socio:
            </p>
            <DocImg alt="Página de bienvenida con acceso a alta y edición" desc="Pantalla de bienvenida una vez hemos iniciado sesión con nuestro usuario y contraseña donde vemos cómo acceder a la alta y búqueda de socios" img="Alta1.png" type="image/png"></DocImg>
            <DocImg alt="Barra de navegación con acceso a alta y edición" desc="Barra de navegación donde vemos cómo acceder a la alta y búqueda de socios" img="Alta2.png" type="image/png"></DocImg>
            <p>
                El formulario actúa en tiempo real sobre las acciones que realizamos pudiendo no dejarnos realizar acciones no permitidas como introducir letras en un campo para teléfono o validar que un dni sea correcto y no esté repetido, el formulario de lo que estemos haciendo incorrectamente conforme estemos haciéndolo:
            </p>
            <DocImg alt="Errores en formulario de alta" desc="Podemos ver varios errores, cada campo puede tener una validación concreta" img="Alta3.png" type="image/png"></DocImg>
            <p>
                Algunos campos incluyen búsquedas en tiempo real: el campo nombre, dni, nombre de tutor, dni de tutor y nombre de contacto. Esta búsqueda en tiempo real nos ayudará a evitar duplicar fichas de socio/a o poder reutilizar datos que ya dimos de alta en su momento para vincularlos a otras fichas de socio.
            <p>
                Esto será especialmente útil cuando estamos introduciendo los datos de un tutor o un contacto a nuestro socio/a, al introducir el nombre o dni en el caso del tutor o el nombre en el caso de los contactos, si el sistema nos devuelve algún resultado podremos seleccionarlo para que ese socio/a ya existente se vincule al que estamos dando de alta o editando, de esta manera quedan referenciados entre sí y no tendremos que rellenar los datos del contacto o tutor ya que se completarán automáticamente (como veremos más adelante, además del buscador en tiempo real existen un buscador en el apartado Tutor y en cada apartado Contacto que nos permitirá buscar un socio/a existente).
            </p>
            <p>
                La cantidad de resultados que devuelva búsqueda nos aparecerá junto al campo que estemos rellenando y pulsando sobre él accederemos a ver la lista de socios que coinciden con los datos que estamos introduciendo, esto nos hará poder descartar rápidamente los resultados y podremos escoger entre usar el socio en el formulario que estamos rellenando (para que sea un tutor, un contacto o para consultar su ficha) o abrir la ficha de socio en una ventana nueva:
            </p>
            <DocImg alt="Búsqueda en tiempo real" desc="La búsqueda en tiempo real nos mostrará la cantidad de coincidencias y nos permitirá usar el socio o acceder a su ficha en una nueva pestaña" img="Alta4.png" type="image/png"></DocImg>
            <p>
                Las fichas de socio nunca se borrarán y pasarán a estar inactivas hasta que el socio/a decida volver a formar parte del club (esto quiere decir que toda la información e histórico se mantendrá almacenada). En el momento de un alta nos podremos encontrar que los buscadores en tiempo real nos devuelven un socio/a ya existente igual al que intentamos dar de alta, en este caso deberemos recuperar esa ficha, activarla y actualizar los datos que hayan cambiado desde que fue socio/a anteriormente.
            </p>
            <p>
                <u>Importante: Debemos tener en cuenta que muchos de los campos del socio son reutilizados en otros lugares de la aplicación, sirven para gestionar pagos o identifican al socio en documentación legal por lo que debemos ser muy cuidadosos a la hora de introducir cualquier dato.</u>
            </p>
            <p>
                Vamos a ver en detalle cada campo del formulario de alta/edición:
            </p>
            <p>
                <h4 id="doc-alta-els">
                    Elementos del formulario:
                </h4>
                <p>
                    <h5>Activo:</h5>
                    - Al dar de alta un socio se indicará siempre como activo y en la edición de un socio/a podremos desactivarlo
                    <br>
                    - Este campo es relevante para que el sistema tenga o no en cuenta al socio/a en diferentes procesos automáticos:
                    <br>
                    &emsp;- Generación de pagos mensuales
                    <br>
                    &emsp;- Mostrar su información en sección de pagos
                    <br>
                    &emsp;- Mostrar su información en sección de cinturones
                    <br>
                    Será muy importante mantener a cada socio en su estado correcto para evitar que se genere información incorrecta o que se ensucien los datos que contiene la aplicación con información irrelevante.
                </p>
                <p>
                    <h5>Nombre y apellidos:</h5>
                    - Contiene el nombre y apellidos de nuestro socio
                    <br>
                    - Para un socio menor de edad aquí irá su nombre y los datos del tutor los rellenaremos más adelante
                    <br>
                    - Este campo tiene habilitada la búsqueda en tiempo real para evitar duplicar un socio
                    <br>
                    - Solamente aceptará letras y guiones, el resto de caracteres serán descartados automáticamente
                    <br>
                    - Es un campo obligatorio
                </p>
                <p>
                    <h5>Dirección:</h5>
                    - Contiene la dirección del socio
                    <br>
                    - Para un socio menor de edad aquí irá su dirección, la dirección del tutor la podremos indicar en su sección
                    <br>
                    - Este campo es de texto libre por lo que intentaremos ser lo más homogéneos posible a la hora de introducir la dirección, está establecido que la dirección debe contener los datos y el formato siguientes (nótense las comas que son lo más relevante): /Tipo de calle (puede ser abreviatura)//Nombre de calle y número/, /Población y código postal/, /Provincia/ => Calle Leopoldo Romeo 9, 50002 Zaragoza
                    <br>
                    - Es un campo obligatorio
                </p>
                <p>
                    <h5>Teléfono:</h5>
                    - El campo para introducir el número de teléfono solo aceptará 9 dígitos numéricos que empiecen por un valor válido (6, 7, 8 y 9), el resto de valores que introduzcamos se descartarán automáticamente
                    <br>
                    - Cada teléfono dispone de un campo notas para añadir lo que consideremos necesario
                    <br>
                    - Podemos añadir tantos teléfonos como queramos
                    <br>
                    - Es muy recomendable que un socio tenga teléfono pero no es obligatorio introducir ningún teléfono, eso sí, si el apartado para rellenar con un teléfono ha sido añadido se nos exigirá rellenarlo o borrarlo para poder guardar el formulario
                </p>
                <DocImg alt="Gestión de teléfonos" desc="Podemos añadir tantos teléfonos como queramos" img="Alta5.png" type="image/png"></DocImg>
                <p>
                    <h5>E-mails:</h5>
                    - El campo para e-mail se valida para que solo pueda contener formatos de e-mail válidos
                    <br>
                    - Podemos añadir tantos e-mails como queramos
                    <br>
                    - Es muy recomendable que un socio tenga e-mail pero no es obligatorio introducir ningún e-mail, eso sí, si el apartado para rellenar con un e-mail ha sido añadido se nos exigirá rellenarlo o borrarlo para poder guardar el formulario
                </p>
                <p>
                    <h5>Sexo:</h5>
                    - Deberemos seleccionar el sexo de nuestro socio
                </p>
                <p>
                    <h5>Fecha de nacimiento:</h5>
                    - Seleccionaremos o introduciremos la fecha de nacimiento de nuestro socio
                    <br>
                    - El sistema valida que la fecha sea correcta y nos avisará si excediera los límites
                    <br>
                    - Un socio deberá tener un mínimo de 3 años para poder darlo de alta
                    <br>
                    - Si el sistema detecta que la fecha de nacimiento pertenece a un menor añadirá automáticamente la sección para rellenar los datos del tutor que será obligatorio rellenar
                </p>
                <p>
                    <h5>¿Es menor?:</h5>
                    - Este campo no es editable y se rellenará al introducir la fecha de nacimiento indicándonos si el socio es menor de edad o no
                </p>
                <p>
                    <h5>Dni:</h5>
                    - Contiene el dni del socio que estamos dando de alta
                    <br>
                    - Si el socio es menor aquí introduciremos su dni y posteriormente en la sección del tutor introduciremos el dni del tutor, es posible que el socio menor de edad no tenga aún dni, si fuera el caso podremos dejar este campo vacío y rellenar solo el dni del tutor o introducir aquí el dni del tutor
                    <br>
                    - El campo tiene búsqueda en tiempo real para evitar duplicar dni
                    <br>
                    - El campo valida el formato del dni y nos indicará si es correcto
                    <br>
                    - Es un campo obligatorio siempre que el socio no sea menor, si lo fuera será solo obligatorio el dni del tutor
                </p>
                <p>
                    <h5>Tutor:</h5>
                    - Este apartado se añade automáticamente cuando al dar de alta un socio se detecta que es menor de edad por su fecha de nacimiento
                    <br>
                    - En los socios menores de edad que pasen a la mayoría de edad seguiremos viendo este apartado aunque se nos advertirá que podremos eliminarlo
                    <br>
                    - Los tutores que sean socios y los vinculemos guardarán una referencia a su ficha de socio por lo que cualquier cambio en la ficha del socio que haga de tutor se verá reflejada en el apartado donde esté seleccionado como tutor
                    <br>
                    - El apartado de tutor, además de las búsquedas en tiempo real en los campos de nombre y dni del tutor, dispone de un botón para buscar socios y así usarlos como tutor
                    <DocImg alt="Gestión de tutor" desc="El tutor es obligatorio cuando el socio sea menor, es importante introducir sus datos correctamente" img="Alta6.png" type="image/png"></DocImg>
                    <p>
                        <h6>&emsp;Nombre del tutor:</h6>
                        &emsp;- Contiene el nombre y apellidos del tutor del menor
                        <br>
                        &emsp;- Este campo tiene habilitada la búsqueda en tiempo real para seleccionar un socio existente si el tutor ya existiera como socio
                        <br>
                        &emsp;- Solamente aceptará letras y guiones, el resto de caracteres serán descartados automáticamente
                        <br>
                        &emsp;- Es un campo obligatorio
                    </p>
                    <p>
                        <h6>&emsp;Dirección del tutor:</h6>
                        &emsp;- Contiene la dirección del tutor
                        <br>
                        &emsp;- Este campo es de texto libre por lo que intentaremos ser lo más homogéneos posible a la hora de introducir la dirección, está establecido que la dirección debe contener los datos y el formato siguientes (nótense las comas que son lo más relevante): /Tipo de calle (puede ser abreviatura)//Nombre de calle y número/, /Población y código postal/, /Provincia/ => Calle Leopoldo Romeo 9, 50002 Zaragoza
                        <br>
                        &emsp;- Es un campo obligatorio
                    </p>
                    <p>
                        <h6>&emsp;Dni del tutor:</h6>
                        &emsp;- Contiene el dni del tutor
                        <br>
                        &emsp;- Cuando el socio que damos de alta es menor su dni no es obligatorio ya que se puede dar el caso que no tenga, el del tutor siempre será obligatorio
                        <br>
                        &emsp;- El campo valida el formato del dni y nos indicará si es correcto
                        <br>
                        &emsp;- Es un campo obligatorio siempre que el socio sea menor
                        <br>
                        &emsp;- El campo tiene búsqueda en tiempo real
                    </p>
                    <p>
                        <h6>&emsp;Teléfono del tutor:</h6>
                        &emsp;- El campo para introducir el número de teléfono solo aceptará 9 dígitos numéricos que empiecen por un valor válido (6, 7, 8 y 9), el resto de valores que introduzcamos se descartarán automáticamente
                        <br>
                        &emsp;- Cada teléfono dispone de un campo notas para añadir lo que consideremos necesario
                        <br>
                        &emsp;- Podemos añadir tantos teléfonos como queramos
                        <br>
                        &emsp;- Es muy recomendable que un tutor tenga teléfono pero no es obligatorio introducir ningún teléfono, eso sí, si el apartado para rellenar con un teléfono ha sido añadido se nos exigirá rellenarlo o borrarlo para poder guardar el formulario
                    </p>
                    <p>
                        <h6>&emsp;E-mails del tutor:</h6>
                        &emsp;- El campo para e-mail se valida para que solo pueda contener formatos de e-mail válidos
                        <br>
                        &emsp;- Podemos añadir tantos e-mails como queremos
                        <br>
                        &emsp;- Es muy recomendable que un tutor tenga e-mail pero no es obligatorio introducir ningún e-mail, eso sí, si el apartado para rellenar con un e-mail ha sido añadido se nos exigirá rellenarlo o borrarlo para poder guardar el formulario
                    </p>
                    <p>
                        <h6>&emsp;Notas del tutor:</h6>
                        &emsp;- Es un campo de texto libre en el que podremos añadir cualquier información relevante sobre este tutor y que no se pueda añadir en el resto de campos
                    </p>
                </p>
                <p>
                    <h5>Contactos:</h5>
                    - Es un apartado que podemos añadir a demanda, es opcional
                    <br>
                    - Está pensado para poder cubrir todas las posibilidades de contacto de un socio y si necesitamos añadir además del tutor otra persona de contacto podamos hacerlo
                    <br>
                    - Podemos añadir tantos contactos como queramos
                    <br>
                    - El apartado de contacto, además de las búsquedas en tiempo real en el campo nombre, dispone de un botón para buscar socios y así usarlos como contacto
                    <DocImg alt="Gestión de contacto" desc="Podemos añadir tantos contactos como queramos, el socio inicialmente no tendrá ninguno" img="Alta7.png" type="image/png"></DocImg>
                    <p>
                        <h6>&emsp;Nombre del contacto:</h6>
                        &emsp;- Contiene el nombre y apellidos de la persona de contacto
                        <br>
                        &emsp;- Este campo tiene habilitada la búsqueda en tiempo real para seleccionar un socio existente si el tutor ya existiera como socio
                        <br>
                        &emsp;- Solamente aceptará letras y guiones, el resto de caracteres serán descartados automáticamente
                        <br>
                        &emsp;- Es un campo obligatorio
                    </p>
                    <p>
                        <h6>&emsp;Teléfono del contacto:</h6>
                        &emsp;- El campo para introducir el número de teléfono solo aceptará 9 dígitos numéricos que empiecen por un valor válido (6, 7, 8 y 9), el resto de valores que introduzcamos se descartarán automáticamente
                        <br>
                        &emsp;- Cada teléfono dispone de un campo notas para añadir lo que consideremos necesario
                        <br>
                        &emsp;- Podemos añadir tantos teléfonos como queramos
                        <br>
                        &emsp;- Es muy recomendable que un contacto tenga teléfono pero no es obligatorio introducir ningún teléfono, eso sí, si el apartado para rellenar con un teléfono ha sido añadido se nos exigirá rellenarlo o borrarlo para poder guardar el formulario
                    </p>
                    <p>
                        <h6>&emsp;E-mails del contacto:</h6>
                        &emsp;- El campo para e-mail se valida para que solo pueda contener formatos de e-mail válidos
                        <br>
                        &emsp;- Podemos añadir tantos e-mails como queremos
                        <br>
                        &emsp;- Es muy recomendable que un contacto tenga e-mail pero no es obligatorio introducir ningún e-mail, eso sí, si el apartado para rellenar con un e-mail ha sido añadido se nos exigirá rellenarlo o borrarlo para poder guardar el formulario
                    </p>
                    <p>
                        <h6>&emsp;Notas del contacto:</h6>
                        &emsp;- Es un campo de texto libre en el que podremos añadir cualquier información relevante sobre este contacto y que no se pueda añadir en el resto de campos
                    </p>
                </p>
                <p>
                    <h5>Datos de pago:</h5>
                    <p>
                        <h6>&emsp;Forma de pago:</h6>
                        &emsp;- Escogeremos entre Tarjeta, Efectivo o Domiciliación
                        <br>
                        &emsp;- Al escoger la forma de pago Domiciliación se hará obligatorio rellenar el IBAN
                        <br>
                        &emsp;- Es un campo obligatorio
                    </p>
                    <p>
                        <h6>&emsp;Tarifa:</h6>
                        &emsp;- Escogeremos entre las tarifas disponibles
                        <br>
                        &emsp;- Cada tarifa lleva asociada un importe que se seleccionará automáticamente al marcar la tarifa
                        <br>
                        &emsp;- Podemos seleccionar una tarifa del tipo personalizada con la que podremos introducir un precio concreto manualmente
                        <br>
                        &emsp;- Las tarifas que incluyen karate habilitarán el apartado Grados para introducir en él los grados del socio
                        <br>
                        &emsp;- Es un campo obligatorio
                    </p>
                    <p>
                        <h6>&emsp;Importe:</h6>
                        &emsp;- El importe vendrá dado al escoger una tarifa del selector de tarifas
                        <br>
                        &emsp;- Podremos editar el importe de la cuota cuando la tarifa sea del tipo Personalizada
                        <br>
                        &emsp;- Es un campo obligatorio
                    </p>
                    <p>
                        <h6>&emsp;Iban:</h6>
                        &emsp;- Este campo se mostrará al seleccionar la forma de pago Domiciliación
                        <br>
                        &emsp;- Es un campo obligatorio
                    </p>
                </p>
                <p>
                    <h5>Cinturones:</h5>
                    - Este apartado será visible cuando la tarifa seleccionada incluya karate o si el socio tiene grados otorgados en su histórico de datos
                    <br>
                    - Veremos las fechas en las que se consiguieron los diferentes grados
                    <DocImg alt="Gestión de cinturones" desc="Veremos los otorgados con la fecha en la que los consiguió el socio o vacíos los que tenga pendiente" img="Alta8.png" type="image/png"></DocImg>
                    <h6>&emsp;En alta:</h6>
                    &emsp;- Al seleccionar una tarifa que incluya karate veremos la sección cinturones pero no la podremos editar hasta haber guardado el socio, esto es así para agilizar el proceso de alta ya que obtener la información de cuándo se obtuvo cada grado alargaría el alta; por lo tanto, no es un campo obligatorio durante el alta
                    <br>
                    <h6>&emsp;En edición:</h6>
                    &emsp;- Veremos los grados y podremos añadir una fecha a los que sepamos cuando se otorgaron o a los que vayamos otorgando, podremos también borrar o modificar cualquier dato
                    <br>
                    &emsp;- La edición desde la ficha de socio está pensada para, una vez finalizada el alta, introducir los grados que el socio tenía antes de ser socio, los grados que consiga siendo socio de nuestro club se actualizarán desde la sección Cinturones donde lo haremos para todos los socios a la vez y no para cada uno individualmente
                    <br>
                    &emsp;- Más adelante explicaremos cómo gestionamos la edición de grados
                </p>
                <p>
                    <h5>Pagos:</h5>
                    - En el proceso de alta este apartado estará vació y mostrará datos una vez hayamos generado los primeros pagos para este socio. Lo habitual será registrar el socio y posteriormente usar la utilidad de gestión de pagos para registrar el primer pago del socio
                    <br>
                    - Los pagos se generarán automáticamente a principios de mes para todos los socios con el estado activo, nosotros los veremos en este apartado con el estado Pendiente y posteriormente los iremos actualizando y confirmando para hacerlos constar como pagados o devueltos, la generación automática de pagos genera un archivo de remesa que recibiremos periodicamente
                    <br>
                    - Desde este apartado podremos consultar y editar los pagos del socio, el apartado de pagos dispone de filtros y buscador para que podamos navegar fácilmente por todos los pagos del socio
                    <br>
                    - Más adelante explicaremos cómo gestionamos la edición de pagos
                </p>
                <p>
                    <h5>Firma:</h5>
                    - Contendrá la firma digitalizada del socio
                    <br>
                    - Es un campo obligatorio
                </p>
                <p>
                    <h5>Documentos:</h5>
                    - Al socio se le presentarán los documentos que va a firmar y se le pedirá que confirme que los acepta
                    <br>
                    - Marcaremos lo que nos indique el socio para cada caso concreto y una vez guardado el socio se nos descargarán los documentos firmados que deberemos conservar por cuestiones legales
                    <br>
                    - Podremos imprimir una copia para el socio si así lo pidiera
                </p>
            </p>
            <p>
                <h4 id="doc-alta-editar">
                    Edición de un socio:
                </h4>
                <p>
                    Anteriormente, comentamos que el formulario será muy similar al gestionar un alta o para la visualización o edición de un socio ya registrado. Como también hemos comentado, para acceder a la ficha de un socio usaremos el buscador de las utilidades globales y finalmente, para editar un socio usaremos el botón editar que veremos al final del formulario, esto habilitará la edición de los campos modificables del formulario y a partir de aquí podremos editar tanto los datos del socio como los del tutor o contactos, lo pagos o los cinturones.
                </p>
                <p>
                    Destacamos que, la edición de datos de tutor y/o contactos se podrá realizar desde la ficha del socio siempre y cuando estos tutor y/o contactos no sean ya socios y estén vinculados, si es este caso, para modificar un dato del tutor y/o contactos deberemos acceder a su ficha de socio/a y allí modificar lo que necesitemos.
                </p>
                <p>
                    <h5 id="doc-alta-grados">Edición de grados/cinturones desde la ficha del socio:</h5>
                    <p>
                        Desde este apartado podremos editar los grados otorgados al socio/a, como hemos visto. Este apartado solo será modificable cuando el socio esté registrado y no durante el proceso de alta. Las modificaciones en este apartado se guardarán al aplicar los cambios y no será necesario guardar la ficha de socio/a aunque igualmente siempre deberemos guardarla tras activar la edición.
                    </p>
                    <p>
                        El proceso de edición es muy sencillo, tenemos las siguientes opciones:
                        <br>
                        &emsp;- Otorgar un grado (asignarle una fecha)
                        <br>
                        &emsp;- Borrar un grado (quitarle la fecha que tuviera)
                        <br>
                        &emsp;- Actualizar un grado (modificar la fecha que tuviera)
                    </p>
                    <p>
                        Para aplicar cualquiera de estas acciones seleccionaremos el/los grados que queramos modificar y acto seguido usaremos los botones inferiores para ejercer la acción que queramos:
                        <br>
                        &emsp;- Para otorgar un grado: si queremos asignar una fecha a un (o varios) nuevo grado otorgado, la seleccionaremos en el selector de fecha y aplicaremos los cambios
                        &emsp;- Para actualizar un grado: si queremos actualizar una fecha, seleccionaremos un grado que ya tenga una fecha asociada y usaremos el selector de fecha para seleccionar el nuevo valor para finalmente aplicar los cambios
                        &emsp;- Para borrar un grado otorgado, seleccionaremos un (o varios) grado con fecha asociada y usaremos el botón Borrar para eliminar la fecha asociada
                    </p>
                    <DocImg alt="Edición de cinturones" desc="Los botones quedarán deshabilitados hasta que seleccionemos los elementos necesarios para aplicar una nueva fecha o para borrarla" img="Alta9.png" type="image/png"></DocImg>
                </p>
                <p>
                    <h5 id="doc-alta-pagos">Edición de pagos desde la ficha del socio:</h5>
                    <p>
                        Dentro del proceso de edición de un socio también podremos editar sus pagos registrados. Los cambios en los pagos se guardarán en el momento de aplicarlos y no será imprescindible guardar la ficha del socio para que se registren, aún así, siempre guardaremos la ficha del socio tras su edición.
                    </p>
                    <p>
                        A la hora de consultar pagos podemos usar los filtros disponibles para localizar rápidamente un pago:
                    </p>
                    <DocImg alt="Edición de pagos" desc="Tenemos disponibles filtros para año, mes, estado del pago y tipo de pago, además podemos usar un buscador de texto" img="Alta10.png" type="image/png"></DocImg>
                    <p>
                        En la edición de un pago podremos editar los siguientes datos:
                        <br>
                        &emsp;- Tarifa
                        <br>
                        &emsp;- Forma de pago
                        <br>
                        &emsp;- Iban
                        <br>
                        &emsp;- Importe
                        <br>
                        &emsp;- Estado
                        <br>
                        &emsp;- Fecha de confirmación
                    </p>
                    <p>
                        Para editar un pago iremos a la línea que lo contiene y pulsaremos en el botón de editar situado en el margen derecho para que se active la edición. Solamente podremos editar un pago a la vez por lo que este botón desaparecerá de todas las líneas cuando estemos editando un pago.
                    </p>
                    <p>
                        La edición de un pago se cancela automáticamente al aplicar filtros a la tabla para evitar que ocultemos un pago que estemos editando.
                    </p>
                    <p>
                        El formulario de edición de pagos tiene ciertos comportamientos en tiempo real que merece la pena remarcar:
                        <br>
                        &emsp;- Tal como hemos visto en el proceso de alta, al cambiar la tarifa el importe de la cuota se modifica automáticamente según las tarifas establecidas, si seleccionamos una tarifa del tipo Personalizada podremos indicar un importe específico
                        <br>
                        &emsp;- Un pago en efectivo o tarjeta no podrá tener el estado Devuelto por lo que no podremos seleccionar esta opción; si estuviera seleccionada se vaciaría y para poder guardar deberemos seleccionar un nuevo estado
                        <br>
                        &emsp;- Los pagos con estado Devuelto o Confirmado tienen fecha de confirmación que es la fecha en la que se estableció ese estado, si modificamos el estado a Pendiente la fecha de confirmación se eliminará automáticamente, esto sumado al punto anterior quiere decir que si tengo un pago domiciliado y devuelto que lo cambio a tarjeta, este cambio alterará el estado eliminando el estado Devuelto y esto a su vez quitará la fecha de confirmación
                    </p>
                    <p>
                        Una vez hayamos realizado los cambios que necesitemos usaremos el botón guardar para finalizar la edición del pago.
                    </p>
                    <DocImg alt="Editando un pago" desc="Al editar un pago los campos modificables estarán habilitados para poder editarlos" img="Alta11.png" type="image/png"></DocImg>
                    <p>
                        Como podemos ver en la captura, la edición de un pago también nos habilita a borrarlo. <u>Borrar un pago es un proceso no recomendado ya que las causas que nos pueden llevar a necesitar borrarlo están cubiertas con la edición de pagos</u>, vamos a ver casos en los que nos puede parecer interesante borrar un pago pero en los que realmente no será necesario:
                        <br>
                        &emsp;- Si un pago no se abonara o el socio/a ya no es socio/a: el pago se mantiene en el histórico como pendiente o devuelto según el caso, recordemos que si desactivamos el socio no se generarán nuevos pagos mensuales
                        <br>
                        &emsp;- Un pago tiene datos que no se corresponden con los datos reales: modificaremos los datos que necesitemos del pago, no hay nada que no podamos cambiar en el pago que justifique borrarlo
                    </p>
                </p>
            </p>
        </b-form-group>
    </div>
</template>