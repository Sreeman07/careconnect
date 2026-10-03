import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../services/api";

import {
  getRequestById,
  updateRequest,
} from "../../services/serviceRequestService";

const EditServiceRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [formData, setFormData] = useState({
    serviceCategory: "",
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    preferredDate: "",
    preferredTimeSlot: "anytime",
    budget: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [requestResponse, categoriesResponse] =
          await Promise.all([
            getRequestById(id),
            api.get(
              "/service-categories?active=true"
            ),
          ]);

        const request =
          requestResponse.request;

        if (request.status !== "open") {
          toast.error(
            "Only open requests can be edited."
          );

          navigate(
            `/dashboard/customer/requests/${id}`,
            { replace: true }
          );

          return;
        }

        const preferredDate = request.preferredDate
          ? new Date(request.preferredDate)
              .toISOString()
              .split("T")[0]
          : "";

        setFormData({
          serviceCategory:
            request.serviceCategory?._id || "",
          title: request.title || "",
          description:
            request.description || "",
          address:
            request.location?.address || "",
          city: request.location?.city || "",
          state:
            request.location?.state || "",
          pincode:
            request.location?.pincode || "",
          preferredDate,
          preferredTimeSlot:
            request.preferredTimeSlot ||
            "anytime",
          budget:
            request.budget !== undefined
              ? String(request.budget)
              : "",
        });

        setCategories(
          categoriesResponse.data.categories ||
            []
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load request."
        );

        navigate(
          "/dashboard/customer/requests",
          { replace: true }
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.serviceCategory) {
      toast.error(
        "Please select a service category."
      );
      return;
    }

    if (formData.title.trim().length < 5) {
      toast.error(
        "Request title must contain at least 5 characters."
      );
      return;
    }

    if (
      formData.description.trim().length < 10
    ) {
      toast.error(
        "Description must contain at least 10 characters."
      );
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Please enter the address.");
      return;
    }

    if (!formData.city.trim()) {
      toast.error("Please enter the city.");
      return;
    }

    if (!formData.state.trim()) {
      toast.error("Please enter the state.");
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      toast.error(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    if (!formData.preferredDate) {
      toast.error(
        "Please select a preferred date."
      );
      return;
    }

    const selectedDate = new Date(
      formData.preferredDate
    );

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error(
        "Preferred date cannot be in the past."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        serviceCategory:
          formData.serviceCategory,

        title: formData.title.trim(),

        description:
          formData.description.trim(),

        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },

        preferredDate:
          formData.preferredDate,

        preferredTimeSlot:
          formData.preferredTimeSlot,

        budget: Number(formData.budget) || 0,
      };

      await updateRequest(id, payload);

      toast.success(
        "Service request updated successfully."
      );

      navigate(
        `/dashboard/customer/requests/${id}`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update service request."
      );
    } finally {
      setSaving(false);
    }
  };

  const today = new Date()
    .toISOString()
    .split("T")[0];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading request...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/dashboard/customer/requests/${id}`
            )
          }
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Request
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Edit Service Request
          </h1>

          <p className="mt-2 text-slate-600">
            Update the details of your service
            request.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Service Details
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Service Category *
                </label>

                <select
                  name="serviceCategory"
                  value={
                    formData.serviceCategory
                  }
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select a service
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Request Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={150}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description *
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                maxLength={2000}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {formData.description.length}/2000
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Service Location
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Address *
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    City *
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    State *
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Pincode *
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Schedule & Budget
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Preferred Date *
                </label>

                <input
                  type="date"
                  name="preferredDate"
                  value={
                    formData.preferredDate
                  }
                  min={today}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Preferred Time
                </label>

                <select
                  name="preferredTimeSlot"
                  value={
                    formData.preferredTimeSlot
                  }
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="anytime">
                    Any Time
                  </option>

                  <option value="morning">
                    Morning
                  </option>

                  <option value="afternoon">
                    Afternoon
                  </option>

                  <option value="evening">
                    Evening
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Budget (₹)
                </label>

                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/dashboard/customer/requests/${id}`
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceRequest;