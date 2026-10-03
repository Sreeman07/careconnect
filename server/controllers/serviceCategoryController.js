import ServiceCategory from "../models/ServiceCategory.js";

const createSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const getCategories = async (
  req,
  res,
  next
) => {
  try {
    const {
      search,
      includeInactive,
    } = req.query;

    const query = {};

    if (includeInactive !== "true") {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const categories =
      await ServiceCategory.find(query)
        .populate(
          "createdBy",
          "name email"
        )
        .sort({
          name: 1,
        });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (
  req,
  res,
  next
) => {
  try {
    const category =
      await ServiceCategory.findById(
        req.params.id
      ).populate(
        "createdBy",
        "name email"
      );

    if (!category) {
      res.status(404);
      throw new Error(
        "Service category not found."
      );
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      description,
      icon,
      basePrice,
      pricingUnit,
      requiredSkills,
    } = req.body;

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error(
        "Service category name is required."
      );
    }

    const slug = createSlug(name);

    const existing =
      await ServiceCategory.findOne({
        $or: [
          {
            name: name.trim(),
          },
          {
            slug,
          },
        ],
      });

    if (existing) {
      res.status(400);
      throw new Error(
        "A service category with this name already exists."
      );
    }

    const category =
      await ServiceCategory.create({
        name: name.trim(),

        slug,

        description:
          description?.trim() || "",

        icon:
          icon?.trim() || "🔧",

        basePrice:
          Number(basePrice) || 0,

        pricingUnit:
          pricingUnit ||
          "per_job",

        requiredSkills:
          Array.isArray(
            requiredSkills
          )
            ? requiredSkills
                .map((skill) =>
                  String(skill).trim()
                )
                .filter(Boolean)
            : [],

        createdBy:
          req.user._id,
      });

    res.status(201).json({
      success: true,
      message:
        "Service category created successfully.",
      category,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (
  req,
  res,
  next
) => {
  try {
    const category =
      await ServiceCategory.findById(
        req.params.id
      );

    if (!category) {
      res.status(404);
      throw new Error(
        "Service category not found."
      );
    }

    const {
      name,
      description,
      icon,
      basePrice,
      pricingUnit,
      requiredSkills,
    } = req.body;

    if (
      name !== undefined &&
      name.trim() !== category.name
    ) {
      const newName =
        name.trim();

      const newSlug =
        createSlug(newName);

      const existing =
        await ServiceCategory.findOne({
          $or: [
            {
              name: newName,
            },
            {
              slug: newSlug,
            },
          ],

          _id: {
            $ne: category._id,
          },
        });

      if (existing) {
        res.status(400);
        throw new Error(
          "Another category with this name already exists."
        );
      }

      category.name =
        newName;

      category.slug =
        newSlug;
    }

    if (description !== undefined) {
      category.description =
        description.trim();
    }

    if (icon !== undefined) {
      category.icon =
        icon.trim() || "🔧";
    }

    if (basePrice !== undefined) {
      category.basePrice =
        Number(basePrice) || 0;
    }

    if (pricingUnit !== undefined) {
      category.pricingUnit =
        pricingUnit;
    }

    if (requiredSkills !== undefined) {
      category.requiredSkills =
        Array.isArray(
          requiredSkills
        )
          ? requiredSkills
              .map((skill) =>
                String(skill).trim()
              )
              .filter(Boolean)
          : [];
    }

    await category.save();

    res.status(200).json({
      success: true,
      message:
        "Service category updated successfully.",
      category,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategoryStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        isActive,
      } = req.body;

      if (
        typeof isActive !==
        "boolean"
      ) {
        res.status(400);
        throw new Error(
          "isActive must be a boolean."
        );
      }

      const category =
        await ServiceCategory.findByIdAndUpdate(
          req.params.id,
          {
            isActive,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!category) {
        res.status(404);
        throw new Error(
          "Service category not found."
        );
      }

      res.status(200).json({
        success: true,
        message: isActive
          ? "Service category activated successfully."
          : "Service category deactivated successfully.",
        category,
      });
    } catch (error) {
      next(error);
    }
  };

const deleteCategory =
  async (
    req,
    res,
    next
  ) => {
    try {
      const category =
        await ServiceCategory.findById(
          req.params.id
        );

      if (!category) {
        res.status(404);
        throw new Error(
          "Service category not found."
        );
      }

      await category.deleteOne();

      res.status(200).json({
        success: true,
        message:
          "Service category deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  };

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};