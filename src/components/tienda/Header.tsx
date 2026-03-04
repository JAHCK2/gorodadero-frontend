// ═══════════════════════════════════════════
// Header — Small logo + delivery indicator
// ═══════════════════════════════════════════

"use client";

import { LogoGoOficial } from "./LogoGoOficial";

export default function Header() {
    return (
        <div className="hdr">
            <a href="/" className="hdr__logo">
                <LogoGoOficial className="w-24 h-auto" />
            </a>

            <div className="hdr__delivery">
                <span className="hdr__deliveryDot" />
                Delivery activo
            </div>
        </div>
    );
}
