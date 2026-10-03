import api from "./api";

const getCustomerBookings = async () => {
  const response = await api.get(
    "/bookings/customer"
  );

  return response.data;
};

const getProviderBookings = async () => {
  const response = await api.get(
    "/bookings/provider"
  );

  return response.data;
};

const getBookingById = async (id) => {
  const response = await api.get(
    `/bookings/${id}`
  );

  return response.data;
};

const startBooking = async (id) => {
  const response = await api.patch(
    `/bookings/${id}/start`
  );

  return response.data;
};

const completeBooking = async (
  id,
  completionNotes = ""
) => {
  const response = await api.patch(
    `/bookings/${id}/complete`,
    {
      completionNotes,
    }
  );

  return response.data;
};

export {
  getCustomerBookings,
  getProviderBookings,
  getBookingById,
  startBooking,
  completeBooking,
};