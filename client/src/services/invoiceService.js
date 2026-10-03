import api from "./api";

const getCustomerInvoices = async () => {
  const response = await api.get(
    "/invoices/customer"
  );

  return response.data;
};

const getProviderInvoices = async () => {
  const response = await api.get(
    "/invoices/provider"
  );

  return response.data;
};

const getInvoiceById = async (id) => {
  const response = await api.get(
    `/invoices/${id}`
  );

  return response.data;
};

export {
  getCustomerInvoices,
  getProviderInvoices,
  getInvoiceById,
};