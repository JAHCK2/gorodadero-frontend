# GoRodadero — Architecture & Design Knowledge Base

## 1. Core Brand & Aesthetics (Apple VisionOS x Rappi Turbo)
- **Primary Action Color:** Naranja `#F97316` (usado estrictamente para botones de conversión y CTAs de checkout).
- **Backgrounds:** Utilizamos un sistema global `beach-canvas` con `sun-glare`. En el Home, la imagen es vibrante y 100% nítida. En las vistas internas (Pasillos, Carrito, Checkout), se inyecta dinámicamente una capa de cristal esmerilado (`backdrop-blur-[16px] bg-white/20`) para aislar el contenido y facilitar la lectura manteniendo el aura premium (Glassmorphism).
- **Layout MasterView (Pasillos):** Emula **Rappi Turbo** pero con estética de cristal: Barra de búsqueda superior y contenedores backdrop-blur.

## 2. Navigation & View Architecture
- **CatalogShell.tsx:** Componente monolítico centralizado que gestiona los tres estados atómicos del catálogo: `home`, `masterView` y `deepView`.
- **History API (App-Like Navigation):** Componentes desplegables críticos como el `ProductBottomSheet` inyectan estados virtuales a través del `history.pushState()`. El "Android Back Button" (`popstate`) los procesa directamente (`history.back()`) aislando el cierre preventivo sin retroceder la vista general del `CatalogShell`.
- **Z-Index Collision Protocol:** Elementos flotantes de sistema como el `CartSummaryBar` están renderizados en Portales globales (`z-[9999]`). Cuando se desencadena un modal intermedio (`z-[100]`), dicho portal debe ser orquestado pasándole la prop `hidden={true}` para que se retraiga sin colisionar en pantalla.

## 3. Advanced Mobile UX (Search & Interaction)
- **Smart Search Overlay:** Buscador full-screen nativo. Cuenta con aceleración de GPU (`touch-pan-y`), limitadores de rebase de scroll (`overscroll-contain`) y el mecanismo **"Keyboard Dismiss on Drag"** (`onTouchMove -> blur()`), el cual cierra inteligentemente el teclado sin paralizar el deslizamiento del usuario en listas densas.
- **Direct Add Micro-interactions:** Permite agregar productos directamente desde los resultados de búsqueda interceptando la cascada de DOM (`e.stopPropagation()`), confirmando la acción (✅) vía animación sin necesidad de cerrar el modal del buscador para compras en ráfaga.

## 4. Checkout & Order Flow (Completed)
- **Validation Pipeline:** Recolección progresiva estricta en 3 Pasos (Datos de cliente, Selección de Pago, Resumen Final).
- **Geolocation API:** Integra lógica transaccional de posicionamiento para la obtención asíncrona de Barrios basada en Polígonos de Santa Marta y el consecuente Cálculo de Envío Variable.
- **WhatsApp String Generation:** Enrutamiento de URL estática cifrada que procesa Ticket de supermercado, Totalización, Delivery y el Link Geográfico de trazabilidad (Google Maps) directo hacia el Dispatch central del comercio.
