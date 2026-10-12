# invitacion-karla-marvin
Invitación floral de boda · Karla y Marvin · 19 de diciembre de 2026

## Panel de invitados

`panel.html` crea enlaces personalizados, importa/exporta Excel y registra respuestas recibidas por WhatsApp. Se conserva el diseño floral de la invitación.

Esta primera versión utiliza localStorage en el navegador. No publica la lista de invitados en el repositorio y no sincroniza entre dispositivos. La confirmación sigue llegando por WhatsApp; el panel permite registrar la respuesta manualmente. Descargar respaldos JSON permite conservar la lista y restaurarla sin reemplazar registros existentes. Las invitaciones archivadas se conservan en el respaldo.

Los enlaces incluyen nombre, espacios y dedicatoria en el fragmento URL. Son editables por quien recibe el enlace, por lo que no constituyen un control de acceso o cupo seguro. No incluir información privada en las dedicatorias. Tras editar hay que compartir el nuevo enlace. Para enlaces cortos, respuestas automáticas, acceso privado y sincronización entre los novios se necesita conectar una base de datos con autenticación (pendiente).

Plantilla Excel: columnas Nombre, Apellido, Espacios, WhatsApp, Dedicatoria. Nombre y apellido son opcionales; espacios entero entre 1 y 50. WhatsApp incluye código de país. Máximo 1000 filas por importación. Cada fila crea una invitación nueva; se previsualiza antes de confirmar. Archivos XLSX/CSV de hasta 5 MB. SheetJS se distribuye localmente con su licencia `xlsx-license.txt`.
