import api from "./api";

const getProviderRequests = async () => {
  const response = await api.get("/quotes/provider/requests");
  return response.data;
};

const getProviderQuotes = async () => {
  const response = await api.get("/quotes/provider");
  return response.data;
};

const createQuote = async (quoteData) => {
  const response = await api.post(
    "/quotes",
    quoteData
  );

  return response.data;
};

const getCustomerQuotes = async () => {
  const response = await api.get("/quotes/customer");
  return response.data;
};

const getQuoteById = async (id) => {
  const response = await api.get(`/quotes/${id}`);
  return response.data;
};

const acceptQuote = async (id) => {
  const response = await api.patch(
    `/quotes/${id}/accept`
  );

  return response.data;
};

const rejectQuote = async (id) => {
  const response = await api.patch(
    `/quotes/${id}/reject`
  );

  return response.data;
};

export {
  getProviderRequests,
  getProviderQuotes,
  createQuote,
  getCustomerQuotes,
  getQuoteById,
  acceptQuote,
  rejectQuote,
};