import {
  webCategories,
  webSubjects,
} from "./web-data";

export async function getCategories() {
  return [...webCategories].sort(
    (a, b) => a.position - b.position,
  );
}

export async function getCategoryById(id: string) {
  return webCategories.find(
    (category) => category.id === id,
  ) ?? null;
}

export async function createCategory(input: {
  name: string;
}) {
  const categoryId = `category-${Date.now()}`;

  webCategories.push({
    id: categoryId,
    name: input.name,
    position: webCategories.length,
    createdAt: new Date(),
    updatedAt: null,
  });
}

export async function updateCategory(
  id: string,
  input: {
    name: string;
  },
) {
  const category = webCategories.find(
    (category) => category.id === id,
  );

  if (!category) {
    return;
  }

  category.name = input.name;
  category.updatedAt = new Date();
}

export async function swapCategoryPosition(
  categoryId: string,
  targetCategoryId: string,
) {
  const category = webCategories.find(
    (category) => category.id === categoryId,
  );

  const targetCategory = webCategories.find(
    (category) => category.id === targetCategoryId,
  );

  if (!category || !targetCategory) {
    throw new Error("Category not found");
  }

  const position = category.position;

  category.position = targetCategory.position;
  targetCategory.position = position;
}

export async function deleteCategory(id: string) {
  const index = webCategories.findIndex(
    (category) => category.id === id,
  );

  if (index !== -1) {
    webCategories.splice(index, 1);
  }
}