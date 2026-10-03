import ServiceRequest from "../models/ServiceRequest.js";
import ServiceCategory from "../models/ServiceCategory.js";

const requestPopulate = [
  {
    path: "serviceCategory",
    select:
      "name slug description icon basePrice pricingUnit requiredSkills",
  },
  {
    path: "customer",
    select: "name email phone",
  },
  {
    path: "assignedProvider",
    select: "name email phone",
  },
];

const createServiceRequest = async (req, res, next) => {
  try {
    const {
      serviceCategory,
      title,
      description,
      location,
      preferredDate,
      preferredTimeSlot,
      budget,
      attachments,
    } = req.body;

    if (!serviceCategory) {
      res.status(400);
      throw new Error("Service category is required.");
    }

    const category = await ServiceCategory.findOne({
      _id: serviceCategory,
      isActive: true,
    });

    if (!category) {
      res.status(404);
      throw new Error(
        "Selected service category was not found or is inactive."
      );
    }

    const selectedDate = new Date(preferredDate);

    if (Number.isNaN(selectedDate.getTime())) {
      res.status(400);
      throw new Error("Please provide a valid preferred date.");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      res.status(400);
      throw new Error(
        "Preferred date cannot be in the past."
      );
    }

    const serviceRequest = await ServiceRequest.create({
      customer: req.user._id,
      serviceCategory,
      title,
      description,
      location,
      preferredDate: selectedDate,
      preferredTimeSlot,
      budget: budget || 0,
      attachments: attachments || [],
      status: "open",
      urgency: "normal",
      aiClassification: {
        category: null,
        requiredSkills: [],
        confidence: 0,
        processed: false,
      },
    });

    const populatedRequest =
      await ServiceRequest.findById(
        serviceRequest._id
      ).populate(requestPopulate);

    res.status(201).json({
      success: true,
      message: "Service request created successfully.",
      request: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getMyServiceRequests = async (
  req,
  res,
  next
) => {
  try {
    const requests = await ServiceRequest.find({
      customer: req.user._id,
    })
      .populate(requestPopulate)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

const getServiceRequestById = async (
  req,
  res,
  next
) => {
  try {
    const request =
      await ServiceRequest.findOne({
        _id: req.params.id,
        customer: req.user._id,
      }).populate(requestPopulate);

    if (!request) {
      res.status(404);
      throw new Error(
        "Service request not found."
      );
    }

    res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    next(error);
  }
};

const updateServiceRequest = async (
  req,
  res,
  next
) => {
  try {
    const request =
      await ServiceRequest.findOne({
        _id: req.params.id,
        customer: req.user._id,
      });

    if (!request) {
      res.status(404);
      throw new Error(
        "Service request not found."
      );
    }

    if (request.status !== "open") {
      res.status(400);
      throw new Error(
        "Only open service requests can be edited."
      );
    }

    const allowedFields = [
      "serviceCategory",
      "title",
      "description",
      "location",
      "preferredDate",
      "preferredTimeSlot",
      "budget",
      "attachments",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        request[field] = req.body[field];
      }
    });

    if (req.body.serviceCategory) {
      const category =
        await ServiceCategory.findOne({
          _id: req.body.serviceCategory,
          isActive: true,
        });

      if (!category) {
        res.status(404);
        throw new Error(
          "Selected service category was not found or is inactive."
        );
      }
    }

    if (req.body.preferredDate) {
      const selectedDate = new Date(
        req.body.preferredDate
      );

      if (Number.isNaN(selectedDate.getTime())) {
        res.status(400);
        throw new Error(
          "Please provide a valid preferred date."
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        res.status(400);
        throw new Error(
          "Preferred date cannot be in the past."
        );
      }
    }

    await request.save();

    const populatedRequest =
      await ServiceRequest.findById(
        request._id
      ).populate(requestPopulate);

    res.status(200).json({
      success: true,
      message: "Service request updated successfully.",
      request: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

const cancelServiceRequest = async (
  req,
  res,
  next
) => {
  try {
    const request =
      await ServiceRequest.findOne({
        _id: req.params.id,
        customer: req.user._id,
      });

    if (!request) {
      res.status(404);
      throw new Error(
        "Service request not found."
      );
    }

    if (
      !["open", "matching", "quoted"].includes(
        request.status
      )
    ) {
      res.status(400);
      throw new Error(
        "This service request cannot be cancelled."
      );
    }

    request.status = "cancelled";

    await request.save();

    const populatedRequest =
      await ServiceRequest.findById(
        request._id
      ).populate(requestPopulate);

    res.status(200).json({
      success: true,
      message: "Service request cancelled successfully.",
      request: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createServiceRequest,
  getMyServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  cancelServiceRequest,
};