import { useEffect, useState } from "react";

import {
  getProviders,
  verifyProvider,
  rejectProvider,
  updateProviderStatus,
} from "../../services/providerService";

const ProviderManagement = () => {
  const [providers, setProviders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [selectedProvider, setSelectedProvider] =
    useState(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const loadProviders =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getProviders({
            search,
            verificationStatus:
              status,
          });

        setProviders(
          data.providers
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to load providers."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadProviders();
  }, [status]);

  const handleSearch = (
    event
  ) => {
    event.preventDefault();
    loadProviders();
  };

  const handleVerify =
    async (id) => {
      try {
        await verifyProvider(id);
        await loadProviders();
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to verify provider."
        );
      }
    };

  const handleReject =
    async () => {
      if (
        !selectedProvider ||
        !rejectionReason.trim()
      ) {
        return;
      }

      try {
        await rejectProvider(
          selectedProvider._id,
          rejectionReason
        );

        setSelectedProvider(
          null
        );

        setRejectionReason("");

        await loadProviders();
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to reject provider."
        );
      }
    };

  const handleStatus =
    async (
      provider,
      isActive
    ) => {
      try {
        await updateProviderStatus(
          provider._id,
          isActive
        );

        await loadProviders();
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to update provider status."
        );
      }
    };

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Provider Management
        </h1>

        <p className="mt-2 text-slate-600">
          Review, verify, and manage service providers.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-4 md:flex-row"
        >
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by name, email, skill or area..."
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">
              All Statuses
            </option>

            <option value="not_submitted">
              Not Submitted
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="verified">
              Verified
            </option>

            <option value="rejected">
              Rejected
            </option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          </div>
        ) : providers.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No providers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-6 py-4 text-sm font-semibold">
                    Provider
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Experience
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Skills
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Account
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {providers.map(
                  (provider) => (
                    <tr
                      key={
                        provider._id
                      }
                      className="border-b border-slate-100"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold">
                          {
                            provider
                              .user
                              ?.name
                          }
                        </p>

                        <p className="text-sm text-slate-500">
                          {
                            provider
                              .user
                              ?.email
                          }
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        {
                          provider.experience
                        }{" "}
                        years
                      </td>

                      <td className="max-w-xs px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {provider.skills
                            ?.slice(
                              0,
                              3
                            )
                            .map(
                              (
                                skill
                              ) => (
                                <span
                                  key={
                                    skill
                                  }
                                  className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
                                >
                                  {
                                    skill
                                  }
                                </span>
                              )
                            )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            provider.verificationStatus ===
                            "verified"
                              ? "bg-green-100 text-green-700"
                              : provider.verificationStatus ===
                                "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : provider.verificationStatus ===
                                "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {provider.verificationStatus
                            .replace(
                              "_",
                              " "
                            )}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={
                            provider
                              .user
                              ?.isActive
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {provider
                            .user
                            ?.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {provider.verificationStatus ===
                            "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleVerify(
                                    provider._id
                                  )
                                }
                                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-500"
                              >
                                Verify
                              </button>

                              <button
                                onClick={() =>
                                  setSelectedProvider(
                                    provider
                                  )
                                }
                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() =>
                              handleStatus(
                                provider,
                                !provider
                                  .user
                                  ?.isActive
                              )
                            }
                            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                          >
                            {provider
                              .user
                              ?.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 className="text-xl font-bold">
              Reject Provider
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Provide a reason for rejecting{" "}
              {
                selectedProvider
                  .user?.name
              }.
            </p>

            <textarea
              value={
                rejectionReason
              }
              onChange={(event) =>
                setRejectionReason(
                  event.target.value
                )
              }
              rows="5"
              placeholder="Enter rejection reason..."
              className="mt-5 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-red-500"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedProvider(
                    null
                  );

                  setRejectionReason(
                    ""
                  );
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleReject
                }
                disabled={
                  !rejectionReason.trim()
                }
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                Reject Provider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderManagement;