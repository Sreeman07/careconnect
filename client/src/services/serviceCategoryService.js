import api from "./api";

const getCategories = async (
  params = {}
) => {
  const response =
    await api.get(
      "/service-categories",
      {
        params,
      }
    );

  return response.data;
};

const getCategoryById = async (
  categoryId
) => {
  const response =
    await api.get(
      `/service-categories/${categoryId}`
    );

  return response.data;
};

const createCategory = async (
  categoryData
) => {
  const response =
    await api.post(
      "/service-categories",
      categoryData
    );

  return response.data;
};

const updateCategory = async (
  categoryId,
  categoryData
) => {
  const response =
    await api.put(
      `/service-categories/${categoryId}`,
      categoryData
    );

  return response.data;
};

const updateCategoryStatus =
  async (
    categoryId,
    isActive
  ) => {
    const response =
      await api.patch(
        `/service-categories/${categoryId}/status`,
        {
          isActive,
        }
      );

    return response.data;
  };

const deleteCategory = async (
  categoryId
) => {
  const response =
    await api.delete(
      `/service-categories/${categoryId}`
    );

  return response.data;
};

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};