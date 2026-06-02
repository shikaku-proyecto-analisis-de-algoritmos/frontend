# Shikaku Frontend

Frontend del juego de puzzles Shikaku, implementado con Angular 16. Esta aplicación proporciona una interfaz interactiva para jugar puzzles Shikaku, con autenticación de usuarios, sistema de puntaje, leaderboard y más.

## 📋 Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Componentes](#componentes)
- [Servicios](#servicios)
- [Build para Producción](#build-para-producción)
- [Tests](#tests)
- [Despliegue](#despliegue)

## 🛠 Tecnologías

- **Angular 16.2.0** - Framework web de TypeScript
- **TypeScript 5.1.3** - Lenguaje de programación tipado
- **Bootstrap 5.3.8** - Framework CSS para diseño responsivo
- **RxJS 7.8.0** - Programación reactiva
- **Angular CLI 16.2.16** - Herramientas de línea de comandos
- **Karma** - Framework de testing
- **Jasmine** - Framework de testing unitario

## ✨ Características

- **Interfaz Interactiva**: Grid interactivo para dibujar y seleccionar rectángulos
- **Autenticación**: Registro, login local y autenticación con Google OAuth
- **Sistema de Dificultades**: Tres niveles (easy, medium, hard)
- **Sistema de Puntaje**: Cálculo dinámico de puntos con bonuses y penalizaciones
- **Leaderboard**: Ranking global de jugadores
- **Perfil de Usuario**: Estadísticas detalladas, historial de partidas y progreso
- **Sistema de Pistas**: Ayudas inteligentes durante el juego
- **Solver Automático**: Opción para resolver puzzles automáticamente
- **Diseño Responsivo**: Funciona en desktop y dispositivos móviles
- **Navegación SPA**: Single Page Application con routing

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js 16.x o superior** y **npm**
- **Angular CLI 16.2.16** (se instalará automáticamente)

Para verificar tu versión de Node.js:
```bash
node --version
npm --version
```

## 🚀 Instalación

1. **Navega al directorio del frontend**:
```bash
cd frontend
```

2. **Instala las dependencias**:
```bash
npm install
```

Esto instalará todas las dependencias listadas en `package.json`:
- Angular framework y dependencias
- Bootstrap para estilos
- RxJS para programación reactiva
- Herramientas de desarrollo y testing

## ⚙️ Configuración

1. **Configura la URL del backend** (si es diferente de localhost:8000):

Edita el archivo `src/app/services/shikaku.service.ts` y modifica la URL base:
```typescript
private apiUrl = 'http://localhost:8000'; // Cambia esto si tu backend está en otra URL
```

2. **Configura Google OAuth** (opcional):

Si usas autenticación con Google, asegúrate de tener configurado el Google Client ID en el backend.

## 🏃 Ejecución

### Modo Desarrollo

Para ejecutar el servidor de desarrollo con recarga automática:

```bash
ng serve
```

O alternativamente:
```bash
npm start
```

La aplicación estará disponible en: `http://localhost:4200/`

La aplicación se recargará automáticamente cuando hagas cambios en los archivos.

### Abrir en el navegador

Puedes usar:
```bash
ng serve --open
```

Esto abrirá automáticamente el navegador en `http://localhost:4200/`

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/          # Componentes de la aplicación
│   │   │   ├── grid/          # Grid del puzzle Shikaku
│   │   │   ├── controls/      # Controles del juego
│   │   │   ├── victory/       # Pantalla de victoria
│   │   │   ├── sign-in/       # Registro de usuarios
│   │   │   ├── log-in/        # Login de usuarios
│   │   │   ├── home/          # Página principal
│   │   │   ├── navbar/        # Barra de navegación
│   │   │   ├── new-game/      # Selección de nueva partida
│   │   │   ├── profile/       # Perfil de usuario
│   │   │   └── leaderboard/   # Ranking de jugadores
│   │   ├── services/          # Servicios HTTP
│   │   │   ├── auth.service.ts        # Servicio de autenticación
│   │   │   ├── shikaku.service.ts     # Servicio del juego
│   │   │   └── game-settings.service.ts # Configuración del juego
│   │   ├── models/            # Modelos de datos
│   │   ├── app.module.ts      # Módulo principal
│   │   ├── app-routing.module.ts  # Configuración de rutas
│   │   ├── app.component.ts   # Componente raíz
│   │   └── app.component.html # Template raíz
│   ├── assets/                # Archivos estáticos
│   ├── index.html             # HTML principal
│   ├── main.ts                # Punto de entrada
│   └── styles.scss            # Estilos globales
├── angular.json               # Configuración de Angular CLI
├── package.json               # Dependencias de npm
├── package-lock.json          # Lockfile de dependencias
├── tsconfig.json              # Configuración de TypeScript
├── tsconfig.app.json          # Configuración TS para la app
├── tsconfig.spec.json         # Configuración TS para tests
├── .editorconfig             # Configuración del editor
├── .gitignore                # Archivos ignorados por Git
└── README.md                 # Este archivo
```

## 🧩 Componentes

### GridComponent (`components/grid/`)
- Renderiza el grid del puzzle Shikaku
- Maneja la interacción del usuario (selección de celdas)
- Dibuja rectángulos basados en la selección
- Valida visualmente la solución

### ControlsComponent (`components/controls/`)
- Botones de control del juego
- Opciones para solicitar pistas
- Botón para usar el solver automático
- Validación de solución

### VictoryComponent (`components/victory/`)
- Pantalla de victoria al completar un puzzle
- Muestra el puntaje obtenido
- Opciones para jugar de nuevo

### SignInComponent (`components/sign-in/`)
- Formulario de registro de usuarios
- Validación de datos
- Integración con backend para registro

### LogInComponent (`components/log-in/`)
- Formulario de login
- Soporte para login local y Google OAuth
- Manejo de tokens de autenticación

### HomeComponent (`components/home/`)
- Página principal de la aplicación
- Bienvenida y navegación a otras secciones

### NavbarComponent (`components/navbar/`)
- Barra de navegación superior
- Menú de navegación
- Información del usuario autenticado

### NewGameComponent (`components/new-game/`)
- Selección de dificultad para nueva partida
- Configuración de parámetros del juego

### ProfileComponent (`components/profile/`)
- Perfil del usuario
- Estadísticas detalladas
- Historial de partidas

### LeaderboardComponent (`components/leaderboard/`)
- Ranking global de jugadores
- Tabla de mejores puntajes

## 🔧 Servicios

### AuthService (`services/auth.service.ts`)
Maneja la autenticación de usuarios:
- Registro de nuevos usuarios
- Login con credenciales locales
- Autenticación con Google OAuth
- Gestión de tokens JWT
- Almacenamiento de sesión

### ShikakuService (`services/shikaku.service.ts`)
Servicio principal del juego:
- Obtención de tableros del backend
- Envío de soluciones para validación
- Solicitud de pistas
- Uso del solver automático
- Consulta de leaderboard

### GameSettingsService (`services/game-settings.service.ts`)
Gestiona la configuración del juego:
- Dificultad seleccionada
- Parámetros de partida
- Estado del juego

## 🏗️ Build para Producción

Para crear una versión optimizada para producción:

```bash
ng build
```

Los archivos compilados se generarán en el directorio `dist/`.

### Build con configuración específica:

```bash
ng build --configuration production
```

### Build con optimización adicional:

```bash
ng build --prod --build-optimizer
```

Los archivos en `dist/` pueden ser desplegados en cualquier servidor web estático (nginx, Apache, AWS S3, Vercel, Netlify, etc.).

## 🧪 Tests

### Ejecutar tests unitarios:

```bash
ng test
```

Esto ejecutará los tests usando Karma y abrirá una ventana del navegador con los resultados.

### Ejecutar tests con cobertura:

```bash
ng test --code-coverage
```

Los reportes de cobertura se generarán en `coverage/`.

### Ejecutar tests en modo headless (Chrome):

```bash
ng test --browsers ChromeHeadless
```

### Tests end-to-end (e2e):

Para ejecutar tests e2e, primero necesitas configurar un framework de testing e2e (Protractor, Cypress, Playwright):

```bash
ng e2e
```

## 🚀 Despliegue

### Despliegue Local

Sigue los pasos de [Instalación](#instalación) y [Ejecución](#ejecución).

### Despliegue en Producción

1. **Build para producción**:
```bash
ng build --configuration production
```

2. **Despliega los archivos de `dist/`** en tu servidor web preferido.

#### Opciones de despliegue:

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist/frontend
```

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**GitHub Pages:**
```bash
ng build --configuration production --base-href /nombre-repo/
# Sube el contenido de dist/ a la rama gh-pages
```

**Servidor web tradicional (nginx/Apache):**
- Copia el contenido de `dist/` al directorio del servidor
- Configura el servidor para servir archivos estáticos
- Configura el routing para SPA (todas las rutas deben redirigir a index.html)

### Configuración de CORS

Asegúrate de que el backend tenga CORS configurado para permitir solicitudes desde el dominio del frontend. En el backend (`main.py`):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tu-frontend-domain.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Configuración de API URL

Para producción, actualiza la URL del API en `shikaku.service.ts`:

```typescript
private apiUrl = 'https://tu-backend-api.com';
```

## 📝 Comandos Útiles de Angular CLI

```bash
# Generar un nuevo componente
ng generate component nombre-componente

# Generar un nuevo servicio
ng generate service nombre-servicio

# Generar un nuevo módulo
ng generate module nombre-modulo

# Generar una directiva
ng generate directive nombre-directiva

# Generar un pipe
ng generate pipe nombre-pipe

# Verificar el código con linter
ng lint

# Formatear el código
ng format

# Actualizar dependencias
ng update

# Ver ayuda
ng help
```

## 🎨 Personalización

### Cambiar estilos globales

Edita `src/styles.scss` para modificar los estilos globales de la aplicación.

### Configurar Bootstrap

Bootstrap ya está incluido. Puedes personalizarlo sobrescribiendo variables en `styles.scss` o usando clases de Bootstrap en los componentes.

### Configurar el tema

Los colores y temas se pueden modificar en los archivos SCSS de los componentes individuales o en `styles.scss`.

## 🔐 Seguridad

- Los tokens de autenticación se almacenan en localStorage
- Las contraseñas nunca se almacenan en el frontend
- Todas las solicitudes sensibles requieren autenticación
- El backend valida todas las operaciones

## 📊 Flujo de la Aplicación

```
Usuario → Home → NewGame → Grid + Controls → Victory → Profile/Leaderboard
            ↓
        LogIn/SignIn (si no autenticado)
```

## 🐛 Troubleshooting

### Problema: "ng: command not found"
**Solución:**
```bash
npm install -g @angular/cli
```

### Problema: Error de conexión con el backend
**Solución:**
- Verifica que el backend esté corriendo
- Verifica la URL del API en `shikaku.service.ts`
- Verifica la configuración de CORS en el backend

### Problema: Error al instalar dependencias
**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema: Build falla
**Solución:**
```bash
ng cache clean
ng build
```

## 🤝 Contribución

Este es un proyecto académico para el curso de Análisis de Algoritmos. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte de un trabajo académico universitario.

## 📞 Contacto

Para preguntas o soporte, contacta a los desarrolladores del proyecto.

---

**Desarrollado para el curso de Análisis de Algoritmos - Universidad**
