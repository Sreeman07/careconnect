import api from "./api";

const getMyRequests = async () => {
  const response = await api.get(
    "/service-requests"
  );

  return response.data;
};

const getRequestById = async (id) => {
  const response = await api.get(
    `/service-requests/${id}`
  );

  return response.data;
};

const createRequest = async (
  requestData
) => {
  const response = await api.post(
    "/service-requests",
    requestData
  );

  return response.data;
};

const updateRequest = async (
  id,
  requestData
) => {
  const response = await api.put(
    `/service-requests/${id}`,
    requestData
  );

  return response.data;
};

const cancelRequest = async (id) => {
  const response = await api.patch(
    `/service-requests/${id}/cancel`
  );

  return response.data;
};

const classifyRequestWithAI = async (
  id
) => {
  const response = await api.post(
    `/ai/classify-request/${id}`
  );

  return response.data;
};

const getMatchingProviders = async (
  id
) => {
  const response = await api.get(
    `/provider-matching/${id}`
  );

  return response.data;
};

const selectProvider = async (
  requestId,
  providerId
) => {
  const response = await api.post(
    `/provider-selection/${requestId}`,
    {
      providerId,
    }
  );

  return response.data;
};

export {
  getMyRequests,
  getRequestById,
  createRequest,
  updateRequest,
  cancelRequest,
  classifyRequestWithAI,
  getMatchingProviders,
  selectProvider,
};