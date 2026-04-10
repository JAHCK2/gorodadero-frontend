"use client";

import { useEffect, useState, useRef } from 'react';

export function useScrollSpy(categoryIds: string[], offset: number = 100) {
    const [activeId, setActiveId] = useState<string | null>(categoryIds[0] || null);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');
        if (!scrollContainer) return;

        const handleScroll = () => {
            const { scrollTop, clientHeight, scrollHeight } = scrollContainer;

            // 1. Fallback: Si estamos en el fondo físico, forzar el último.
            if (Math.ceil(scrollTop + clientHeight) >= scrollHeight - 30) {
                setActiveId(categoryIds[categoryIds.length - 1]);
                return;
            }

            // 2. Cálculo determinista: Buscar de arriba a abajo.
            // El activo es el ÚLTIMO elemento cuyo borde superior haya superado o tocado
            // la línea visual del header (aprox 60px desde el contenedor).
            let currentActive = categoryIds[0];
            const containerRect = scrollContainer.getBoundingClientRect();

            for (const id of categoryIds) {
                const el = document.getElementById(`cat-${id}`);
                if (!el) continue;

                const rect = el.getBoundingClientRect();
                // 80px es un "sweet spot" para detectar debajo del header sticky (que mide 58px)
                if (rect.top - containerRect.top <= 80) {
                    currentActive = id;
                }
            }

            setActiveId(currentActive);
        };

        // Escuchar scrolleos. Usamos passive para no bloquear el renderizado nativo.
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        // También disparar una vez al montar para asegurar el estado inicial correcto
        handleScroll();

        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
        };
    }, [categoryIds]);

    return activeId;
}
