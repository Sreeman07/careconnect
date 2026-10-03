import api from "./api";

const createReview = async (reviewData) => {
  const response = await api.post(
    "/reviews",
    reviewData
  );

  return response.data;
};

const getCustomerReviews = async () => {
  const response = await api.get(
    "/reviews/customer"
  );

  return response.data;
};

const getProviderReviews = async () => {
  const response = await api.get(
    "/reviews/provider"
  );

  return response.data;
};

export {
  createReview,
  getCustomerReviews,
  getProviderReviews,
};