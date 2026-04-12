import { useState, useEffect } from 'react';
import { CartItem } from '@/types/product';

interface PurchaseRecord {
    id: string;
    date: string;
    total: number;
    items: CartItem[]; // Guardamos el CartItem completo para evitar un fetch a Supabase en carrito/page
}

const HISTORY_KEY = 'gorodaderov2_purchase_history';
const MAX_ORDERS = 5;

export function usePurchaseHistory() {
    const [history, setHistory] = useState<PurchaseRecord[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(HISTORY_KEY);
            if (stored) {
                try {
                    setHistory(JSON.parse(stored));
                } catch (e) {
                    console.error('Failed to parse purchase history', e);
                }
            }
        }
    }, []);

    const saveOrder = (items: CartItem[], total: number) => {
        if (typeof window === 'undefined' || items.length === 0) return;

        const record: PurchaseRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            total,
            items: [...items]
        };

        setHistory(prev => {
            const newHistory = [record, ...prev].slice(0, MAX_ORDERS);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const getLastOrder = () => {
        if (history.length === 0) return null;
        return history[0];
    };

    const getRecentProducts = (limit = 6) => {
        const uniqueProducts = new Map<string, CartItem['product']>();
        for (const order of history) {
            for (const item of order.items) {
                if (!uniqueProducts.has(item.product.id)) {
                    uniqueProducts.set(item.product.id, item.product);
                }
                if (uniqueProducts.size >= limit) return Array.from(uniqueProducts.values());
            }
        }
        return Array.from(uniqueProducts.values());
    };

    return {
        history,
        saveOrder,
        getLastOrder,
        getRecentProducts
    };
}
