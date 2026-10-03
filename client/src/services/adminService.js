import api from "./api";

const getAdminDashboardStats = async () => {
  const response = await api.get("/admin/dashboard");

  return response.data;
};

export {
  getAdminDashboardStats,
};