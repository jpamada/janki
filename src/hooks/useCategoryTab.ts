import { useEffect, useRef } from "react";
import { FlatList } from "react-native";

type Category = {
  id: string;
  name: string;
};

type UseCategoryTabProps = {
  categories: Category[];
  defaultSubjects: unknown[];
  selectedCategoryId: string | null;
};

export function useCategoryTab({
  categories,
  defaultSubjects,
  selectedCategoryId,
}: UseCategoryTabProps) {
  const categoryScrollRef = useRef<FlatList>(null);

  const showDefault = defaultSubjects.length > 0 || categories.length === 0;

  const isSelectionValid = selectedCategoryId === null
    ? showDefault
    : categories.some((category) => category.id === selectedCategoryId);

  const activeCategoryId = isSelectionValid
    ? selectedCategoryId
    : (showDefault ? null : (categories[0]?.id ?? null));

  useEffect(() => {
    categoryScrollRef.current?.scrollToOffset({
      offset: 0,
      animated: false,
    });
  }, [categories]);

  return {
    showDefault: showDefault,
    activeCategoryId: activeCategoryId,
    categoryScrollRef: categoryScrollRef,
  };
}