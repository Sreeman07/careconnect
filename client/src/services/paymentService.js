import api from "./api";

const createPayment = async (
  invoiceId
) => {
  const response = await api.post(
    "/payments",
    {
      invoiceId,
    }
  );

  return response.data;
};

const getCustomerPayments =
  async () => {
    const response =
      await api.get(
        "/payments/customer"
      );

    return response.data;
  };

const getProviderPayments =
  async () => {
    const response =
      await api.get(
        "/payments/provider"
      );

    return response.data;
  };

const getPaymentById = async (
  id
) => {
  const response =
    await api.get(
      `/payments/${id}`
    );

  return response.data;
};

export {
  createPayment,
  getCustomerPayments,
  getProviderPayments,
  getPaymentById,
};