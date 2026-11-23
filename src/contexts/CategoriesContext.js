/**
 * MAZRATI - Categories Context
 * إدارة حالة الأقسام (CRUD) مع تحديث تلقائي
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as CategoryService from '../services/categoryService';

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CategoryService.getCategories();
      setCategories(data);
    } catch (err) {
      setError('تعذر تحميل الأقسام');
      console.error('Categories load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCategory = useCallback(async (data) => {
    const newCat = await CategoryService.createCategory(data);
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  }, []);

  const updateCategory = useCallback(async (id, updates) => {
    const updated = await CategoryService.updateCategory(id, updates);
    if (updated) {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
    }
    return updated;
  }, []);

  const deleteCategory = useCallback(async (id) => {
    await CategoryService.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getCategoryById = useCallback(
    (id) => categories.find((c) => c.id === id) || null,
    [categories]
  );

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        error,
        refresh,
        createCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within CategoriesProvider');
  }
  return context;
};

export default CategoriesContext;
