// Página de detalle de producto (ruta dinámica: /producto/[id])
// TODO: Imagen grande, descripción, precio, botón agregar al carrito

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ProductoPage({ params }: Props) {
    const { id } = await params;

    return (
        <main>
            <h1>Detalle del Producto</h1>
            <p>ID: {id}</p>
            {/* TODO: ProductImage, ProductInfo, AddToCartButton */}
        </main>
    );
}
