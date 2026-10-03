import { useEffect, useState } from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from "../../services/serviceCategoryService";

const emptyForm = {
  name: "",
  description: "",
  icon: "🔧",
  basePrice: "",
  pricingUnit: "per_job",
  requiredSkills: "",
};

const ServiceCategoryManagement = () => {
  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showInactive, setShowInactive] =
    useState(true);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [formData, setFormData] =
    useState(emptyForm);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getCategories({
          search,
          includeInactive: showInactive,
        });

      setCategories(
        data.categories || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load service categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [showInactive]);

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const openCreateForm = () => {
    setEditingCategory(null);

    setFormData(emptyForm);

    setError("");
    setMessage("");

    setShowForm(true);
  };

  const openEditForm = (
    category
  ) => {
    setEditingCategory(
      category
    );

    setFormData({
      name: category.name || "",
      description:
        category.description || "",
      icon:
        category.icon || "🔧",
      basePrice:
        category.basePrice ?? "",
      pricingUnit:
        category.pricingUnit ||
        "per_job",
      requiredSkills:
        category.requiredSkills?.join(
          ", "
        ) || "",
    });

    setError("");
    setMessage("");

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: formData.name.trim(),

      description:
        formData.description.trim(),

      icon:
        formData.icon.trim() ||
        "🔧",

      basePrice:
        Number(
          formData.basePrice
        ) || 0,

      pricingUnit:
        formData.pricingUnit,

      requiredSkills:
        formData.requiredSkills
          .split(",")
          .map((skill) =>
            skill.trim()
          )
          .filter(Boolean),
    };

    try {
      if (editingCategory) {
        await updateCategory(
          editingCategory._id,
          payload
        );

        setMessage(
          "Service category updated successfully."
        );
      } else {
        await createCategory(
          payload
        );

        setMessage(
          "Service category created successfully."
        );
      }

      closeForm();

      await loadCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save service category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (
    category
  ) => {
    try {
      setError("");

      await updateCategoryStatus(
        category._id,
        !category.isActive
      );

      setMessage(
        category.isActive
          ? "Service category deactivated."
          : "Service category activated."
      );

      await loadCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update category status."
      );
    }
  };

  const handleDelete = async (
    category
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${category.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteCategory(
        category._id
      );

      setMessage(
        "Service category deleted successfully."
      );

      await loadCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete service category."
      );
    }
  };

  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    loadCategories();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Service Categories
          </h1>

          <p className="mt-2 text-slate-600">
            Manage services available on the CareConnect
            marketplace.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
        >
          + Add Service Category
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-4 md:flex-row"
        >
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search service categories..."
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700"
          >
            Search
          </button>

          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(event) =>
                setShowInactive(
                  event.target.checked
                )
              }
            />

            Show inactive
          </label>
        </form>
      </div>

      {/* Categories */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl">
              🛠️
            </div>

            <h3 className="mt-4 text-xl font-bold">
              No service categories
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Create your first service category.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-6 py-4 text-sm font-semibold">
                    Service
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Base Price
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Required Skills
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {categories.map(
                  (category) => (
                    <tr
                      key={
                        category._id
                      }
                      className="border-b border-slate-100"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                            {
                              category.icon
                            }
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {
                                category.name
                              }
                            </p>

                            <p className="mt-1 max-w-xs text-xs text-slate-500">
                              {
                                category.description
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-semibold">
                          ₹
                          {Number(
                            category.basePrice
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <p className="text-xs capitalize text-slate-500">
                          {category.pricingUnit.replace(
                            "_",
                            " "
                          )}
                        </p>
                      </td>

                      <td className="max-w-xs px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {category.requiredSkills
                            ?.slice(
                              0,
                              4
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

                          {category.requiredSkills
                            ?.length >
                            4 && (
                            <span className="text-xs text-slate-400">
                              +
                              {category
                                .requiredSkills
                                .length -
                                4}{" "}
                              more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            category.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {category.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              openEditForm(
                                category
                              )
                            }
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleStatus(
                                category
                              )
                            }
                            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                          >
                            {category.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                category
                              )
                            }
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500"
                          >
                            Delete
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

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5 py-8">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingCategory
                    ? "Edit Service Category"
                    : "Create Service Category"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure the service offered through CareConnect.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Service Name
                  </label>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Plumbing"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Icon
                  </label>

                  <input
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    placeholder="🔧"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Base Price (₹)
                  </label>

                  <input
                    name="basePrice"
                    type="number"
                    min="0"
                    value={formData.basePrice}
                    onChange={handleChange}
                    placeholder="500"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Pricing Unit
                  </label>

                  <select
                    name="pricingUnit"
                    value={
                      formData.pricingUnit
                    }
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="per_job">
                      Per Job
                    </option>

                    <option value="per_hour">
                      Per Hour
                    </option>

                    <option value="per_visit">
                      Per Visit
                    </option>

                    <option value="per_day">
                      Per Day
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe what this service category covers..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Required Skills
                </label>

                <input
                  name="requiredSkills"
                  value={
                    formData.requiredSkills
                  }
                  onChange={handleChange}
                  placeholder="Pipe Repair, Leak Detection, Water Tank Repair"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Separate skills with commas. These will later
                  be used by the AI provider matching engine.
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCategoryManagement;