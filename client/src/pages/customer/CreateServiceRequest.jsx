import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../services/api";
import {
  createRequest,
} from "../../services/serviceRequestService";

const CreateServiceRequest = () => {
  const navigate = useNavigate();

  const [categories, setCategories] =
    useState([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [submitting, setSubmitting] =
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
    const loadCategories = async () => {
      try {
        const response =
          await api.get(
            "/service-categories?active=true"
          );

        setCategories(
          response.data.categories || []
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load service categories."
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

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

    if (!formData.title.trim()) {
      toast.error("Please enter a request title.");
      return;
    }

    if (!formData.description.trim()) {
      toast.error(
        "Please describe the problem."
      );
      return;
    }

    if (!formData.preferredDate) {
      toast.error(
        "Please select your preferred date."
      );
      return;
    }

    setSubmitting(true);

    try {
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

      await createRequest(payload);

      toast.success(
        "Service request created successfully."
      );

      navigate("/dashboard/customer/requests");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create service request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date()
    .toISOString()
    .split("T")[0];

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard/customer/requests"
              )
            }
            className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to My Requests
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Create Service Request
          </h1>

          <p className="mt-2 text-slate-600">
            Tell us what service you need and
            we'll help connect you with suitable
            providers.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
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
                  disabled={loadingCategories}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select a service"}
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
                  placeholder="Example: Kitchen tap is leaking"
                  maxLength={150}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Describe Your Problem *
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                maxLength={2000}
                placeholder="Explain what you need, what happened, and any useful details..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {formData.description.length}/2000
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
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
                  placeholder="House number, street, landmark..."
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
                    placeholder="Hyderabad"
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
                    placeholder="Telangana"
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
                    placeholder="500072"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
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
                  placeholder="Example: 1000"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/dashboard/customer/requests"
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Creating..."
                : "Create Service Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateServiceRequest;