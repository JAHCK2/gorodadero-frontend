# 🛍️ ESTRATEGIA Y MEMORIA GO — GoRodadero (gorodadero.co)

> 🚨 **REGLA SUPREMA PERMANENTE (PARA SIEMPRE): IDIOMA 100% ESPAÑOL**
> Todos los mensajes, respuestas, análisis, acciones, títulos, descripciones de herramientas y comunicación con James (Jaime / JI) deben ser **estricta y exclusivamente en ESPAÑOL**. Ninguna notificación, resumen o texto del asistente debe generarse en inglés.

---

## 🏛️ 1. Identidad de Marca y Presencia Digital
- **Marca Oficial:** `GoRodadero` *(Tu Súper en Minutos)*
- **Web App / Tienda Virtual:** [`gorodadero.co`](https://gorodadero.co/)
- **Concepto:** Quick-Commerce estilo Rappi Turbo pero para una sola tienda física de supermercado en El Rodadero, Santa Marta, Colombia. Entrega 24/7 en 15-20 minutos.
- **Catálogo:** ~2,317 productos en base de datos (abarrotes, bebidas, aseo, snacks, licores, lácteos, frutas, verduras, carnes, etc.).
- **ADN y Pilares Diferenciales:**
  1. 🏖️ **Identidad Visual Premium:** Estética Apple VisionOS Glassmorphism con fotografía real de la playa de El Rodadero como fondo permanente.
  2. ⚡ **Velocidad Extrema:** Catálogo en caché Edge y buscador instantáneo en memoria a 60 FPS.
  3. 🔢 **Aritmética Exacta:** Regla Zero-Float — todos los precios se manejan en enteros COP, nunca decimales.
  4. 🧠 **Base de Datos Inteligente Compartida:** El inventario, costos y fotos provienen del ecosistema central **Chucho V2** (ERP/POS de la tienda física).
  5. 📱 **Mobile-First Absoluto:** Cada decisión de diseño se piensa primero para celulares Android/iOS.

---

## 🗂️ 2. Ubicación del Proyecto y Ecosistema Local

| Ruta Local | Proyecto | Propósito |
| :--- | :--- | :--- |
| **`D:\GORODADERO\gorodaderov2`** | 🚀 **GoRodadero V2** | Código activo de la tienda virtual pública. Next.js 16 + App Router. |
| **`D:\GORODADERO\go_whatsapp_bot`** | 🤖 **Go WhatsApp Bot** | Bot autónomo de WhatsApp (Node.js + `whatsapp-web.js`) con sesión aislada `auth_data_go`. |
| **`D:\GORODADERO\GoHub.html`** | 🎛️ **GoRodadero Launcher** | Portal central de control con estilo Beach Glassmorphism y switch Nube/Local. |
| **`D:\CONSEJEROS\CHUCHO-V2`** | 🧠 **Chucho V2** | ERP / POS de la tienda física. **Cerebro maestro** que alimenta el catálogo. |
| **`D:\GORODADERO\frontend`** | 📦 Frontend V1 (Legacy) | Versión anterior de referencia. No se usa en producción. |
| **`D:\GORODADERO\docs`** | 📄 Documentación | Bitácora, esquemas de BD, API reference. |

**Repositorio GitHub:** `https://github.com/JAHCK2/gorodadero-frontend.git`  
**Equipo del Proyecto:** James (JI) — Desarrollador full-stack y dueño del negocio.

---

## 🔗 3. Relación Crítica: GoRodadero ↔ Chucho V2 (Base de Datos Compartida)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE PostgreSQL (Cloud)                      │
│               eoqethwihsupbcivmgvw.supabase.co                     │
│                                                                     │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐   │
│   │  productos    │   │  pedidos      │   │  configuracion       │   │
│   │  (~2,317)     │   │  (órdenes)    │   │  (margen %, radio km)│   │
│   └──────┬───────┘   └──────────────┘   └──────────────────────┘   │
│          │                                                          │
└──────────┼──────────────────────────────────────────────────────────┘
           │
     ┌─────┴──────────────────────────────────────────────┐
     │                                                     │
     ▼                                                     ▼
┌────────────────────────┐          ┌─────────────────────────────────┐
│  CHUCHO V2 (ERP/POS)  │          │  GORODADERO V2 (Tienda Virtual) │
│  chucho-v2.vercel.app  │          │  gorodadero.co                  │
│                        │          │                                  │
│  ✍️ ESCRIBE:           │          │  👁️ LEE:                        │
│  • Ingresa productos   │          │  • Descarga catálogo completo    │
│  • Fija precios costo  │          │  • Aplica su propio margen (40%) │
│  • Categoriza          │          │  • Calcula precios de venta      │
│  • Sube imágenes       │          │  • Muestra al cliente final      │
│  • Gestiona stock      │          │  • Toma pedidos y notifica       │
│  • Escanea barcodes    │          │                                  │
│  • Procesa facturas IA │          │  ✍️ ESCRIBE:                     │
│                        │          │  • Guarda pedidos en 'pedidos'   │
│  Tiempo Real:          │          │  • Lee config de márgenes        │
│  WebSocket 'chucho-    │          │                                  │
│  realtime'             │          │  CDN Imágenes:                   │
│                        │          │  chucho-v2.vercel.app/           │
│                        │          │  product-images/{barcode}.webp   │
└────────────────────────┘          └─────────────────────────────────┘
```

### Mecánica del Precio Dinámico:
1. **Chucho V2** fija el costo de compra (`vcompra`) de cada producto en Supabase.
2. **GoRodadero V2** lee ese costo y aplica el margen configurado en `configuracion.margen_ganancia` (por defecto 40%):
   ```
   sellPrice = Math.round(vcompra × 1.40)
   ```
3. El administrador puede cambiar el margen de **toda la tienda** en 1 solo clic desde `/admin` → Configuración, sin alterar los datos base de la tienda física.

### CDN de Imágenes & Tolerancia a Fallos:
- Las imágenes de productos residen físicamente en `public/product-images/` del despliegue de Chucho V2 en Vercel.
- GoRodadero las resuelve vía URL: `https://chucho-v2.vercel.app/product-images/{barcode}.webp`.
- **Sincronización con "Tinder de Imágenes":** Si un producto tiene imagen marcada como `'RECHAZADA_TODAS'` o `'NO_IMAGE'` en Chucho V2, GoRodadero automáticamente asigna `imageUrl = null` y muestra el logo/fallback limpio sin romperse con errores 404.

---

## 🎯 4. Decisiones Estratégicas y Operativas Aprobadas

1. **Visibilidad de Productos con Stock 0:**
   * **Decisión:** **NO ocultar**. Los productos se mantienen visibles en la tienda online para no dar la impresión de catálogo incompleto ni perder la intención de compra. Si en el momento de armar el pedido en bodega un producto está físicamente agotado, el operador utiliza el **Módulo de Contingencia** en `/admin` para ajustar la factura en caliente.
2. **CDN de Imágenes:**
   * **Decisión:** **Mantener en Chucho V2**. Se aprovecha la CDN global de Vercel para servir las fotos WebP. Se evaluará migración a Cloudflare R2 o Supabase Storage únicamente si el catálogo supera los 5,000 archivos.
3. **Flujo de WhatsApp 100% Nativo (Retiro de Telegram):**
   * **Decisión:** **Implementado exitosamente**. Toda la atención de despachos, solicitud de ubicación GPS en tiempo real y el embudo de reseñas operan a través del bot local `go_whatsapp_bot`.
4. **Control de Zona y Envíos Especiales (> 2 km):**
   * **Decisión:** **Siguiente fase**. Siguiendo el estándar de *El Castillo del Sabor*, si un cliente geolocaliza su pedido fuera del radio de entrega estándar, la app mostrará un modal amigable y firmará el pedido para cotizar flete personalizado por WhatsApp sin abortar la venta.

---

## 🛠️ 5. Stack Tecnológico Completo

| Capa | Tecnología | Versión |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router, SSR + ISR) | 16.2.2 |
| **UI** | React | 19.2.4 |
| **Lenguaje** | TypeScript | 5.x |
| **Estilos** | Tailwind CSS v4 + CSS Modules + Beach Glassmorphism | v4.0 |
| **Estado Global** | Zustand (persistencia localStorage) | 5.0.12 |
| **Base de Datos** | Supabase PostgreSQL (compartida con Chucho V2) | 2.102.1 |
| **ORM** | Prisma Client | 7.7.0 |
| **Mapas / GPS** | Leaflet + React-Leaflet + OpenStreetMap | 1.9.4 / 5.0 |
| **Correo Transaccional** | Nodemailer (SMTP SSL `smtp.mi.com.co`) | 8.0.5 |
| **Bot de WhatsApp** | `whatsapp-web.js` + Node.js (Sesión `auth_data_go`) | 1.26.0 |
| **Gráficas Admin** | Recharts | 3.8.1 |
| **Iconos** | Lucide React | 1.16.0 |
| **Hosting / Deploy** | Vercel | Conectado a GitHub |

---

## 🛒 6. Flujo Completo de Compra (E2E)

```
┌────────────────────────────────────────────────────────┐
│                   Cliente en Web                       │
│  - Arma carrito ($15.000 COP mínimo)                   │
│  - Checkout 4 pasos (Datos, Pago, Resumen)             │
│  - Clic en "Confirmar Pedido"                          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             Disparo Fire-and-Forget                    │
│  1. Inserta orden en Supabase (tabla 'pedidos')        │
│  2. Envía correo SMTP con detalle a pedidos@ y jahck2@ │
│  3. Redirige a WhatsApp (+57 320 249 9339)             │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             go_whatsapp_bot (Node.js)                  │
│  1. Detecta pedido entrante (*GoRodadero*)             │
│  2. Reenvía orden completa al Grupo de Domiciliarios   │
│  3. Si es Domicilio -> Pide Ubicación en Tiempo Real   │
│  4. Al recibir GPS -> Genera link Google Maps al Grupo │
│  5. A los 30 min -> Dispara Embudo de Reseñas (1-5 ⭐) │
└──────────────────────────┘
```

---

## 🔐 7. Panel Administrativo (`/admin`)

- **Acceso:** Triple clic rápido en el logo GoRodadero → PIN secreto `0314`.
- **Funcionalidades:**
  - 📊 **Dashboard** con KPIs y gráficas Recharts (ventas, métodos de pago, horas pico).
  - 📋 **Tabla de Pedidos** con Supabase Realtime (alerta sonora al entrar pedido nuevo).
  - ✏️ **Edición de Facturas** en caliente: eliminar productos agotados, ajustar cantidades, recalcular total.
  - 🖨️ **Impresión POS** directa a impresoras térmicas 58mm/80mm.
  - ⚙️ **Configuración:** Margen de ganancia global (%) y radio de cobertura (km).
  - 📲 **Botones de Contingencia:** Notificar al cliente y al domiciliario por WhatsApp cuando se modifica un pedido con el enlace al recibo público.

---

## 🛠️ 8. Bitácora de Trabajo Realizado (Sesión: 15 de Agosto de 2026)

En esta sesión completamos hitos fundamentales de modernización, automatización e infraestructura:

1. **Configuración de Idioma Permanente:** Establecida la regla suprema de 100% Español en `AGENTS.md` de todos los repositorios.
2. **Auditoría Comparativa Profunda:** Análisis de arquitecturas entre *El Castillo del Sabor*, *Chucho V2* y *GoRodadero V2*.
3. **Creación de la Bitácora Maestra:** Bautizada formalmente como `ESTRATEGIA_Y_MEMORIA_GO.md`.
4. **Desacople Total de Telegram:**
   - Se eliminaron las dependencias y llamadas a Telegram en `src/app/api/send-order/route.ts`.
   - Se preservó el registro limpio en Supabase y el despacho de correos SMTP con HTML corporativo.
   - Compilación verificada con `npx tsc --noEmit` (**0 errores**).
5. **Creación del Bot Oficial `go_whatsapp_bot`:**
   - Proyecto Node.js autónomo en `D:\GORODADERO\go_whatsapp_bot`.
   - Sesión aislada `auth_data_go` (capaz de correr en simultáneo con el bot de El Castillo en la misma PC).
   - Comandos `/registrar_grupo`, `/pausa`, `/resuelto`, auto-pausa humana de 20 min, solicitud de ubicación GPS en tiempo real y embudo de reseñas (30 min).
6. **Construcción del Launcher `GoHub.html`:**
   - Interfaz con el diseño **Beach Glassmorphism** oficial de la tienda (fondo de la bahía de El Rodadero, logo 3D SVG, slogan con olas, badges 24/7 y contenedor turquesa).
   - Switch de 1 clic para alternar entre **En Línea ☁️** y **Servidor Local 💻**.
   - Detector inteligente en vivo que monitorea si el servidor local está encendido o apagado.
7. **Acceso Directo en el Escritorio de Windows:**
   - Se generó el ícono `D:\GORODADERO\go_icon.ico` a partir del logo oficial.
   - Creados los accesos directos en el escritorio: **`GoRodadero Launcher`** y **`Iniciar GoRodadero Local`** (`INICIAR_TODO_LOCAL.bat`).
8. **Diagnóstico en Vivo de la Base de Datos (Taxonomía):**
   - Escaneo de los 2,317 productos en Supabase.
   - Identificación de 2,048 productos correctos (88.4%) y 269 con descalces a normalizar en Chucho V2.
9. **Preparación de Chucho V2:** Creación del documento maestro `D:\CONSEJEROS\CHUCHO-V2\ESTRATEGIA_Y_MEMORIA_CHUCHO.md` para iniciar la sesión de normalización.

---

## 🚀 9. Hoja de Ruta / Próximos Pasos

1. **Sesión en Chucho V2 (Siguiente Paso Inmediato):**
   - Abrir nuevo chat en `D:\CONSEJEROS\CHUCHO-V2`.
   - Normalizar la tabla `productos` en Supabase (unificar mayúsculas, tildes en `PANADERÍA`, añadir `MISCELÁNEOS` y reasignar huérfanos).
2. **Retorno a GoRodadero V2:**
   - Sincronizar `categoryMapper.ts` con la jerarquía 100% limpia de Chucho V2.
   - Implementar el modal de **Envío Especial** para pedidos a más de 2-3 km.
   - Probar el ciclo completo de compra con `go_whatsapp_bot` conectado.

---

## 📱 11. Herramienta de Live Preview Móvil Integrada (scrcpy + ADB + Antigravity)

Para interactuar y ver en tiempo real el teléfono móvil físico de James (Samsung Galaxy Note 9 / `SM-N960U1`) o un simulador interactivo directamente dentro de Antigravity o en ventanas flotantes de Windows:

### 🌟 Cómo solicitarlo en cualquier chat nuevo de Antigravity:
1. **Si el servidor local ya está en ejecución:**
   > 💬 *«Muestra la pestaña de Live Preview del móvil conectada a `http://localhost:5555/screen.jpg`»*
   - El agente creará el artefacto visual `live_preview.html` (`UserFacing: true`) y aparecerá la pestaña de **Live Preview** de inmediato en el panel derecho de la interfaz.
2. **Si se inicia desde cero en una sesión nueva:**
   > 💬 *«Inicia scrcpy y abre el Live Preview interactivo de mi celular»*

### ⚙️ Arquitectura y Componentes del Sistema Live Preview:
- **Ruta del ejecutable scrcpy y ADB:** `D:\descargas\scrcpy-win64-v3.3.4\scrcpy-win64-v3.3.4\`
- **Resolución nativa calibrada del Note 9:** `1080 × 2220` píxeles (FHD+).
- **Servidor Local de Streaming y Toque (`phone_stream_server.js`):**
  - **Puerto:** `http://localhost:5555`
  - **Ruta `/screen.jpg`:** Retorna fotogramas JPEG comprimidos al vuelo con `sharp` vía `adb exec-out screencap -p`.
  - **Ruta `/tap?x=...&y=...`:** Envía eventos táctiles (`adb shell input tap X Y`) al hacer clic en el panel de Antigravity.
  - **Ruta `/swipe?x1=...&y1=...&x2=...&y2=...`:** Envía gestos de scroll/arrastre por ADB.
- **Ventana Nativa Flotante de SCRCPY (60 FPS sin delay):**
  ```powershell
  Start-Process "D:\descargas\scrcpy-win64-v3.3.4\scrcpy-win64-v3.3.4\scrcpy.exe" -ArgumentList @("--window-title=GoRodadero Móvil", "--always-on-top")
  ```
- **Visor Modal de Zoom Táctil (`ProductImageZoomModal.tsx`):**
  - Ubicado en `src/components/molecules/ProductImageZoomModal.tsx`.
  - Soporta Pinch-to-zoom (1x a 4x), doble toque (2.5x / 1x), arrastre/paneo, rueda de ratón en PC, selector de cantidad `[-] [qty] [+]` y botón `🛒 Agregar $TOTAL` con feedback visual instantáneo hacia `useCartStore`.

---

*Última actualización: 29 de Agosto de 2026 — Implementación de Live Preview ADB/scrcpy integrado en Antigravity, visor modal de producto con zoom táctil y compra integrada v2.12-live.*
