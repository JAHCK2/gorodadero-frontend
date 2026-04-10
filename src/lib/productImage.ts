/**
 * Product Image URL resolver — GoRodadero
 *
 * Priority:
 *   1. Existing image_url from DB (if set)
 *   2. Supabase Storage bucket: {barcode}.webp
 *   3. Supabase Storage bucket: {product-id}.webp
 *
 * Handles float barcodes (e.g. "7702432001503.0" → "7702432001503")
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eoqethwihsupbcivmgvw.supabase.co";
const BUCKET_NAME = "product-images";
const BUCKET_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}`;

/**
 * Clean barcode: strip trailing .0, whitespace, and validate
 */
function cleanBarcode(barcode: string | number | null | undefined): string | null {
    if (!barcode) return null;
    let bc = String(barcode).trim();
    if (bc === "" || bc === "nan" || bc === "null" || bc === "undefined") return null;
    // Handle float notation: "7702432001503.0" → "7702432001503"
    if (/^\d+\.0+$/.test(bc)) {
        bc = bc.replace(/\.0+$/, "");
    }
    // Also handle scientific notation edge case: "7.70243E+12"
    if (bc.includes("E") || bc.includes("e")) {
        try { bc = BigInt(Number(bc)).toString(); } catch { return null; }
    }
    return bc.length >= 6 ? bc : null; // Valid barcodes are 6+ digits
}

/**
 * Get the best image URL for a product.
 * 
 * @param imageUrlFromDb - The image_url column from the database
 * @param barcode - The barcode column (may be float string)
 * @param productId - The product UUID
 * @returns The image URL to use, or null if no image available
 */
export function getProductImageUrl(
    imageUrlFromDb: string | null | undefined,
    barcode: string | number | null | undefined,
    productId: string,
): string | null {
    // 1. If DB has an explicit image URL, use it
    if (imageUrlFromDb && imageUrlFromDb.trim() !== "") {
        return imageUrlFromDb;
    }

    // 2. Try barcode-based URL
    const cleanBc = cleanBarcode(barcode);
    if (cleanBc) {
        return `${BUCKET_BASE}/${cleanBc}.webp`;
    }

    // 3. Fallback to product-id-based URL
    return `${BUCKET_BASE}/${productId}.webp`;
}
