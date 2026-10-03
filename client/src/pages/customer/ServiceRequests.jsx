import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getMyRequests,
  cancelRequest,
} from "../../services/serviceRequestService";

const statusStyles = {
  open: "bg-blue-100 text-blue-700",
  matching: "bg-purple-100 text-purple-700",
  quoted: "bg-yellow-100 text-yellow-700",
  booked: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const ServiceRequests = () => {
  const navigate = useNavigate();

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [cancellingId, setCancellingId] =
    useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response =
        await getMyRequests();

      setRequests(
        response.requests || []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load service requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this service request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(id);

      await cancelRequest(id);

      toast.success(
        "Service request cancelled."
      );

      await loadRequests();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to cancel request."
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              My Service Requests
            </h1>

            <p className="mt-2 text-slate-600">
              Track the home services you have
              requested.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard/customer/requests/new"
              )
            }
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            + New Service Request
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading your requests...
            </p>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              🛠️
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              No service requests yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              Create your first service request
              and find a suitable service provider.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/dashboard/customer/requests/new"
                )
              }
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Create Your First Request
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {requests.map((request) => (
              <div
                key={request._id}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-slate-900">
                        {request.title}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[
                            request.status
                          ] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {formatStatus(
                          request.status
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-medium text-blue-600">
                      {request.serviceCategory
                        ?.name ||
                        "Service"}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      {request.description}
                    </p>

                    <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Preferred Date
                        </p>

                        <p className="mt-1 font-medium text-slate-700">
                          {formatDate(
                            request.preferredDate
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Time
                        </p>

                        <p className="mt-1 font-medium capitalize text-slate-700">
                          {request.preferredTimeSlot ||
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Budget
                        </p>

                        <p className="mt-1 font-medium text-slate-700">
                          {request.budget
                            ? `₹${request.budget}`
                            : "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Location
                        </p>

                        <p className="mt-1 font-medium text-slate-700">
                          {request.location
                            ?.city || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/dashboard/customer/requests/${request._id}`
                        )
                      }
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View
                    </button>

                    {request.status ===
                      "open" && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/dashboard/customer/requests/${request._id}/edit`
                          )
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    )}

                    {[
                      "open",
                      "matching",
                      "quoted",
                    ].includes(
                      request.status
                    ) && (
                      <button
                        type="button"
                        disabled={
                          cancellingId ===
                          request._id
                        }
                        onClick={() =>
                          handleCancel(
                            request._id
                          )
                        }
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        {cancellingId ===
                        request._id
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceRequests;