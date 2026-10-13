# Invitación de Karla Monge y Marvin Reyes

Invitación floral · 19 de diciembre de 2026. La foto, el sobre, la música y la composición aprobados se conservan.

## Panel conectado a Cloudflare

`panel.html` incluye acceso con clave, invitados, espacios, dedicatorias, Excel, respaldo, archivado y respuestas. El diseño usa verde salvia oscuro y dorado. La API está en `worker-cloudflare.mjs` y usa D1 `boda-karla-marvin`, vínculo `DB`.

### Activación en la cuenta del propietario

1. En D1 → boda-karla-marvin → Console, ejecutar `indices-cloudflare.sql` una sola vez. Requiere la tabla `invitations` ya creada.
2. En Workers & Pages → boda-karla-marvin-api → Settings → Variables and Secrets, crear **Secret** `PANEL_KEY` con una clave aleatoria de al menos 32 caracteres. Guardarla en el gestor de contraseñas. No ponerla en GitHub ni compartirla por chat. Compartirla únicamente con los administradores de confianza del panel.
3. En Edit code, reemplazar todo worker.js por el contenido de `worker-cloudflare.mjs` y Deploy. El vínculo D1 `DB` se conserva. No es necesario contratar el plan Paid.
4. Abrir `panel.html` e ingresar esa clave. Crear un invitado de prueba, abrir su enlace, confirmar asistencia y pulsar Actualizar respuestas en el panel. Archivar la invitación de prueba después.

La clave se conserva solo en memoria de la pestaña. Recargar o Cerrar sesión obliga a ingresarla de nuevo. Es un acceso compartido de administradores, sin cuentas individuales. Rotar `PANEL_KEY` revoca la clave anterior. La lista y teléfonos requieren autenticación; las respuestas de invitado solo contienen nombre, espacios, dedicatoria, estado y versión.

Cada enlace nuevo usa un código aleatorio de 256 bits. Quien tenga el enlace puede ver y responder esa invitación: debe tratarse como personal. Editar conserva el enlace; archivar lo desactiva. Los enlaces antiguos `#invitacion=` siguen mostrando su copia anterior y confirmando por WhatsApp; recuperar los registros locales crea enlaces nuevos que deben enviarse nuevamente.

## Consumo limitado a acciones

- Panel: carga paginada al iniciar sesión y al pulsar Actualizar respuestas (250 registros por consulta). Crear, editar, archivar e importar hacen solicitudes explícitas. Los filtros, estadísticas, búsquedas, plantillas, exportación y respaldo trabajan con los datos ya cargados.
- Invitación genérica: cero solicitudes a D1. Enlace personal nuevo: una lectura al abrir y una escritura al guardar respuesta.
- No hay polling, cron ni reintentos automáticos. El contador por segundo y las animaciones son locales. La API raíz informa versión sin consultar D1.
- Importación: hasta 1000 filas por Excel (5 MB), grupos de 100, con revisión antes de guardar. Las filas de un grupo se validan antes de escribir. Cada grupo es atómico; los grupos ya guardados se conservan ante una interrupción. Reintentar los mismos identificadores no crea duplicados.
- Respaldo: admite versiones 1 y 2 (10 MB, máximo 10000 registros), añade registros nuevos sin sobrescribir existentes. Recuperar lista de este navegador lee el localStorage antiguo y conserva la copia original.
- Edición y respuesta validan versión para evitar sobrescribir cambios de otro dispositivo. Ante conflicto, actualización manual.

R2 y el álbum todavía no están conectados. Su configuración y consumo son independientes.

## Archivos de Excel

Columnas: Nombre, Apellido, Espacios, WhatsApp, Dedicatoria. Nombre y apellido opcionales; espacios de 1 a 50. WhatsApp con código de país, entre 8 y 15 dígitos. Cada fila crea una invitación. SheetJS está alojado localmente con su licencia.

## Verificación

Pruebas locales de API con SQLite real y de interfaz con DOM simulado: autenticación antes de lecturas, CORS, validación de cupos, privacidad de teléfonos, idempotencia, control de versiones, archivado, importación, inicio/cierre de sesión, generación de enlace, actualización manual y confirmación desde el invitado. No se ejecutaron escrituras en D1 de producción durante estas pruebas. El despliegue del Worker, el secreto y la prueba real de extremo a extremo deben completarse en la cuenta del propietario.
