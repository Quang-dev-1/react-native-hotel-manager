import React, { createContext, ReactNode, useContext, useState } from 'react';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    description: string;
    sizes: string[];
    colors: string[];
}

interface FavoritesContextType {
    favorites: Product[];
    favoriteIds: number[];
    addFavorite: (product: Product) => void;
    removeFavorite: (productId: number) => void;
    isFavorite: (productId: number) => boolean;
    toggleFavorite: (product: Product) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<Product[]>([]);

    const favoriteIds = favorites.map(item => item.id);

    const addFavorite = (product: Product) => {
        setFavorites((prev) => {
            if (prev.some(item => item.id === product.id)) {
                return prev;
            }
            return [...prev, product];
        });
    };

    const removeFavorite = (productId: number) => {
        setFavorites((prev) => prev.filter(item => item.id !== productId));
    };

    const isFavorite = (productId: number) => {
        return favorites.some(item => item.id === productId);
    };

    const toggleFavorite = (product: Product) => {
        if (isFavorite(product.id)) {
            removeFavorite(product.id);
        } else {
            addFavorite(product);
        }
    };

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                favoriteIds,
                addFavorite,
                removeFavorite,
                isFavorite,
                toggleFavorite,
            }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}