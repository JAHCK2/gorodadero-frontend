<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Agent Specific Instructions for GoRodadero

1. **Accessibility First (Semantic HTML)**: Never nest `<button>` inside `<button>`. Use `<div role="button" tabIndex={0}>` for complex interactive product cards. Doing otherwise will trigger Hydration Errors in Next.js 15.
2. **Mobile Interaction Boundaries**: Do not use generic `onMouseDown={(e) => e.preventDefault()}` on mobile lists as it interrupts the scroll gesture timeline on Chrome Android contexts. Use `blur()` on `onTouchMove` instead for native keyboard dismissal.
3. **Z-Index Management**: `CartSummaryBar` is a `z-[9999]` Portal. Never attempt to place components over it using generic Z-indexes. Pass the `hidden` prop to it from its parent shell instead to animate it away.
4. **History Stack Rules**: NEVER use `setTimeout` or raw local state unmounts to close `ProductBottomSheet`. Always rely on `history.back()` to maintain synchronicity with the browser's physical back button.
5. **Escape Interception**: Always map the `Escape` key inside floating History sheets (like `ProductBottomSheet`) to `window.history.back()`. Do not create alternate closing routes for keyboard users.
6. **Cart Memory Consistency**: Micro-components (`AddButton`) must derive their checked state directly from the global cart store (`useCartStore`) rather than relying on local click tracking, ensuring structural reliability across category switching.
