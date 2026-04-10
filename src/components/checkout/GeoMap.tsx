"use client";

// ═══════════════════════════════════════════
// GeoMap — Mapa Leaflet para ubicación de entrega
// Pin draggable, GPS, reverse geocoding
// Centrado en El Rodadero, Santa Marta
// ═══════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Loader2, AlertTriangle } from "lucide-react";

// El Rodadero defaults
const DEFAULT_LAT = 11.196;
const DEFAULT_LNG = -74.227;
const DEFAULT_ZOOM = 15;

export interface GeoLocation {
    latitude: number;
    longitude: number;
    address: string;
}

interface GeoMapProps {
    location: GeoLocation | null;
    error: string | null;
    onChange: (location: GeoLocation) => void;
}

export function GeoMap({ location, error, onChange }: GeoMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [loading, setLoading] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [mapReady, setMapReady] = useState(false);

    // Reverse geocode coordinates to address
    const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                { headers: { "Accept-Language": "es" } }
            );
            const data = await res.json();
            if (data.display_name) {
                // Trim to a readable address
                const parts = data.display_name.split(",").slice(0, 4);
                return parts.join(",").trim();
            }
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        } catch {
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
    }, []);

    // Handle position update (from GPS or marker drag)
    const handlePositionUpdate = useCallback(async (lat: number, lng: number) => {
        const address = await reverseGeocode(lat, lng);
        onChange({ latitude: lat, longitude: lng, address });
    }, [onChange, reverseGeocode]);

    // Initialize Leaflet map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;
        // Guard against React StrictMode double-mount
        if (mapRef.current.dataset.leafletInitialized) return;
        mapRef.current.dataset.leafletInitialized = "true";

        // Dynamic import Leaflet (client-only)
        import("leaflet").then((L) => {
            // Fix Leaflet default icon paths
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            const map = L.map(mapRef.current!, {
                center: [location?.latitude || DEFAULT_LAT, location?.longitude || DEFAULT_LNG],
                zoom: DEFAULT_ZOOM,
                zoomControl: false,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap",
                maxZoom: 19,
            }).addTo(map);

            // Add zoom control to bottom right
            L.control.zoom({ position: "bottomright" }).addTo(map);

            mapInstanceRef.current = map;
            setMapReady(true);

            // If we already have a location, add marker
            if (location) {
                const marker = L.marker([location.latitude, location.longitude], { draggable: true }).addTo(map);
                marker.on("dragend", () => {
                    const pos = marker.getLatLng();
                    handlePositionUpdate(pos.lat, pos.lng);
                });
                markerRef.current = marker;
            }

            // Click on map to set/move marker
            map.on("click", (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;
                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);
                } else {
                    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
                    marker.on("dragend", () => {
                        const pos = marker.getLatLng();
                        handlePositionUpdate(pos.lat, pos.lng);
                    });
                    markerRef.current = marker;
                }
                handlePositionUpdate(lat, lng);
            });
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Get GPS location
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setGpsError("Tu navegador no soporta geolocalización");
            return;
        }

        setLoading(true);
        setGpsError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Update map + marker
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([lat, lng], 17);

                    if (markerRef.current) {
                        markerRef.current.setLatLng([lat, lng]);
                    } else {
                        import("leaflet").then((L) => {
                            const marker = L.marker([lat, lng], { draggable: true }).addTo(mapInstanceRef.current!);
                            marker.on("dragend", () => {
                                const pos = marker.getLatLng();
                                handlePositionUpdate(pos.lat, pos.lng);
                            });
                            markerRef.current = marker;
                        });
                    }
                }

                await handlePositionUpdate(lat, lng);
                setLoading(false);
            },
            (err) => {
                setLoading(false);
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setGpsError("Permiso de ubicación denegado. Actívalo en los ajustes de tu navegador.");
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setGpsError("No se pudo obtener tu ubicación. Intenta de nuevo.");
                        break;
                    case err.TIMEOUT:
                        setGpsError("La petición de ubicación expiró. Intenta de nuevo.");
                        break;
                    default:
                        setGpsError("Error al obtener ubicación");
                }
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    return (
        <section className="px-4 pt-4 pb-2">
            <h2 className="text-base font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-emerald-500" />
                Ubicación de entrega *
            </h2>

            {/* Botón GPS */}
            <button
                onClick={handleGetLocation}
                disabled={loading}
                className="w-full mb-3 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/25 active:scale-[0.98] transition-all hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-wait"
            >
                {loading ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                    <Navigation className="w-4.5 h-4.5" />
                )}
                {loading ? "Obteniendo ubicación..." : "Usar mi ubicación"}
            </button>

            {/* Mapa */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                {/* Leaflet CSS */}
                {/* eslint-disable-next-line @next/next/no-css-tags */}
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <div
                    ref={mapRef}
                    className="w-full h-[250px]"
                    style={{ zIndex: 0 }}
                />
                {!mapReady && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                )}
            </div>

            {/* Instrucción */}
            <p className="text-[11px] text-gray-400 font-medium mt-2 text-center">
                Toca el mapa para marcar tu ubicación o arrastra el pin
            </p>

            {/* Dirección detectada */}
            {location?.address && (
                <div className="mt-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-xs text-emerald-700 font-semibold flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        {location.address}
                    </p>
                </div>
            )}

            {/* Error GPS */}
            {gpsError && (
                <div className="mt-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 font-semibold">{gpsError}</p>
                </div>
            )}

            {/* Error de validación */}
            {error && (
                <p className="text-xs text-red-500 font-semibold mt-2">{error}</p>
            )}
        </section>
    );
}
