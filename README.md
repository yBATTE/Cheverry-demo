# Chéverry — demo del aula

```powershell
npm install
npm run dev
```

Abrir http://localhost:5178. El .env incluido activa una demo sin MongoDB.

- Curso abierto: http://localhost:5178/#aula/papeleria-automotor
- Simular ingreso del alumno: http://localhost:5178/#login
- Email: alumno@cheverry.demo
- Contraseña: CheverryDemo2026!

Modificar DEMO_STUDENT_EMAIL, DEMO_STUDENT_PASSWORD y DEMO_STUDENT_NAME en .env para cambiar el usuario. Reiniciar npm run dev después de modificarlos.

Solo el curso Papelería automotor está abierto. Sus cinco unidades contienen el material enviado convertido a texto web, sin unidades adicionales. La demo guarda el avance en sessionStorage de la pestaña; el usuario y las sesiones de prueba no necesitan base de datos. Las sesiones del servidor se pierden al reiniciar. La cuenta demo es de alumno, no de administrador.

El modo demo no procesa pagos, no guarda comprobantes y no envía emails. Esas funciones usan el backend real existente. Para habilitarlas configurar MongoDB, correo y administrador, cambiar DEMO_MODE=false y ejecutar npm run setup según la configuración de server/setup.js. No usar las credenciales de ejemplo en producción. Con DEMO_MODE=false el aula vuelve a exigir cuenta e inscripción.

El puerto HTTP y la recarga automática comparten 5178.

El informe de dominio incluye el ejemplo enviado, con datos del vehículo en amarillo, titular en verde y alertas en rojo. El botón Ampliar permite verlo a tamaño completo con las mismas marcas.
