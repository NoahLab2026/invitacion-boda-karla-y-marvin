-- Ejecutar UNA VEZ en D1 > boda-karla-marvin > Console.
-- Mejora las búsquedas por enlace y evita códigos duplicados.
CREATE UNIQUE INDEX IF NOT EXISTS invitations_code_unique ON invitations(code);
