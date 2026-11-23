/**
 * MAZRATI - Items Context
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as ItemService from '../services/itemService';

const ItemsContext = createContext(null);

export function ItemsProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ItemService.getItems();
      setItems(data);
    } catch (err) {
      setError('تعذر تحميل العناصر');
      console.error('Items load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createItem = useCallback(async (data) => {
    const newItem = await ItemService.createItem(data);
    setItems((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  const updateItem = useCallback(async (id, updates) => {
    const updated = await ItemService.updateItem(id, updates);
    if (updated) {
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    }
    return updated;
  }, []);

  const deleteItem = useCallback(async (id) => {
    await ItemService.deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const moveItem = useCallback(async (id, newCategoryId) => {
    const updated = await ItemService.moveItem(id, newCategoryId);
    if (updated) {
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    }
    return updated;
  }, []);

  const getItemById = useCallback(
    (id) => items.find((i) => i.id === id) || null,
    [items]
  );

  const getItemsByCategory = useCallback(
    (categoryId) => items.filter((i) => i.categoryId === categoryId),
    [items]
  );

  return (
    <ItemsContext.Provider
      value={{
        items,
        loading,
        error,
        refresh,
        createItem,
        updateItem,
        deleteItem,
        moveItem,
        getItemById,
        getItemsByCategory,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
}

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error('useItems must be used within ItemsProvider');
  }
  return context;
};

export default ItemsContext;
