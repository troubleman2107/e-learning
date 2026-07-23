"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export interface FavoriteCourseItem {
  id: string;
  title: string;
  description?: string;
  shortDescription?: string | null;
  price: number;
  thumbnail?: string | null;
  category?: { name: string; slug: string } | null;
  categoryName?: string;
  studentCount?: number;
  author?: { id: string; name: string } | null;
  isPaid?: boolean;
}

interface FavoritesContextType {
  favorites: string[];
  favoriteCourses: FavoriteCourseItem[];
  isFavorite: (courseId: string) => boolean;
  toggleFavorite: (course: FavoriteCourseItem, e?: React.MouseEvent) => void;
  removeFavorite: (courseId: string) => void;
  count: number;
  isLoaded: boolean;
}

const STORAGE_KEY = "vietlearn_favorite_courses_v1";

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  favoriteCourses: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  removeFavorite: () => {},
  count: 0,
  isLoaded: false,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteCourses, setFavoriteCourses] = useState<FavoriteCourseItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavoriteCourses(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load favorites from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage on state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteCourses));
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  }, [favoriteCourses, isLoaded]);

  const favorites = favoriteCourses.map((item) => item.id);

  const isFavorite = (courseId: string) => {
    return favorites.includes(courseId);
  };

  const toggleFavorite = (course: FavoriteCourseItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!course || !course.id) return;

    if (isFavorite(course.id)) {
      setFavoriteCourses((prev) => prev.filter((item) => item.id !== course.id));
      toast.info(`Đã xóa "${course.title}" khỏi danh sách yêu thích`);
    } else {
      setFavoriteCourses((prev) => [course, ...prev.filter((item) => item.id !== course.id)]);
      toast.success(`Đã thêm "${course.title}" vào danh sách yêu thích`);
    }
  };

  const removeFavorite = (courseId: string) => {
    setFavoriteCourses((prev) => prev.filter((item) => item.id !== courseId));
    toast.info("Đã xóa khỏi danh sách yêu thích");
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteCourses,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        count: favoriteCourses.length,
        isLoaded,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
