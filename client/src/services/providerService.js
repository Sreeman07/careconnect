import api from "./api";

const getMyProfile = async () => {
  const response = await api.get(
    "/providers/me"
  );

  return response.data;
};

const updateMyProfile = async (
  profileData
) => {
  const response = await api.put(
    "/providers/me",
    profileData
  );

  return response.data;
};

const submitVerification =
  async () => {
    const response =
      await api.post(
        "/providers/me/submit-verification"
      );

    return response.data;
  };

const getProviderById =
  async (providerId) => {
    const response =
      await api.get(
        `/providers/${providerId}`
      );

    return response.data;
  };

const getProviders = async (
  params = {}
) => {
  const response =
    await api.get(
      "/providers",
      {
        params,
      }
    );

  return response.data;
};

const verifyProvider =
  async (providerId) => {
    const response =
      await api.patch(
        `/providers/${providerId}/verify`
      );

    return response.data;
  };

const rejectProvider =
  async (
    providerId,
    reason
  ) => {
    const response =
      await api.patch(
        `/providers/${providerId}/reject`,
        {
          reason,
        }
      );

    return response.data;
  };

const updateProviderStatus =
  async (
    providerId,
    isActive
  ) => {
    const response =
      await api.patch(
        `/providers/${providerId}/status`,
        {
          isActive,
        }
      );

    return response.data;
  };

export {
  getMyProfile,
  updateMyProfile,
  submitVerification,
  getProviderById,
  getProviders,
  verifyProvider,
  rejectProvider,
  updateProviderStatus,
};