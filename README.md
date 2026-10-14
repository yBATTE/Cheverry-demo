# Cheverry Academia — React + Vite

Demo frontend responsive con React, componentes JSX, estado React y almacenamiento local. Mantiene la identidad negra/roja, las guías del cliente y WhatsApp.

## Iniciar en Windows

Necesitás Node.js 22.12 o superior (incluye npm). Extraé el ZIP y abrí PowerShell en la carpeta que contiene `package.json`:

```powershell
npm install
npm run dev
```

Abrí la URL que indique Vite, normalmente http://localhost:5173. Para detenerlo: Ctrl + C.
Si PowerShell bloquea `npm.ps1`, usá `npm.cmd install` y `npm.cmd run dev`.

## Probar desde el celular

Conectá ambos dispositivos a la misma red. Vite muestra una dirección Network para entrar desde el teléfono. Si Windows pregunta, permití el acceso únicamente en tu red privada. La vista previa del aula funciona sin registro. Para crear contraseñas en la demo usá localhost en la PC o publicá con HTTPS; Web Crypto requiere un contexto seguro.

## Compilar y publicar

```powershell
npm run build
npm run preview
```

Subí el contenido de `dist` a un hosting estático. En Vercel: framework Vite, build `npm run build`, salida `dist`. La navegación utiliza hash y no necesita reglas especiales para las rutas.

## Recorrido de demostración

1. En la página de venta, elegí conocer el curso.
2. Completá datos ficticios y opcionalmente un comprobante JPG, PNG o PDF de hasta 2 MB.
3. Abrí Panel administrador desde la barra superior.
4. Aprobá el registro o rechazalo con un motivo.
5. Tras aprobarlo, abrí Ver correo demo y creá una contraseña ficticia.
6. Entrá al aula, recorré las guías, descargalas y completá la checklist.
7. Desde Mi aula podés volver a ingresar con esos datos en el mismo navegador.

También podés entrar directamente al aula de muestra sin inscribirte. El progreso de esa vista se guarda separado del de cada inscripción.

## Archivos principales

- `src/App.jsx`: navegación, estado y coordinación del flujo.
- `src/components/`: portada, layout, aula, panel, formularios y modales.
- `src/config.js`: WhatsApp, Instagram y configuración principal.
- `src/lessons.js`: contenidos del aula.
- `src/storage.js`: almacenamiento local y utilidades de la demo.
- `src/styles.css`: diseño y adaptación mobile.
- `public/assets/`: logo, fotografía y guías.

## Alcance

Es una demo, no una plataforma lista para vender cursos. No incluye backend, envío de correos, pagos reales, permisos de administrador ni autenticación segura. El hash de la clave solo evita guardarla en texto plano: no convierte el acceso local en seguro. Los archivos del aula son públicos dentro del frontend. Usá datos y claves ficticios.

Para producción falta implementar API, base de datos, sesiones y roles seguros, archivos privados y envío de emails. Precio y datos de transferencia pendientes de definir. Las tipografías de Google requieren Internet; hay alternativas locales de sistema. El material del curso debe revisarse antes de su publicación definitiva.

El ZIP no incluye node_modules: se instala con npm install. Incluye package-lock.json para reproducir las dependencias (npm ci).
