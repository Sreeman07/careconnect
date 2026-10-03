import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail =
      "admin@careconnect.com";

    const adminPassword =
      "Admin@12345";

    const adminPhone =
      "9999999999";

    const hashedPassword =
      await bcrypt.hash(
        adminPassword,
        12
      );

    let admin =
      await User.findOne({
        email: adminEmail,
      }).select("+password");

    if (admin) {
      admin.name =
        "CareConnect Admin";

      admin.phone =
        adminPhone;

      admin.password =
        hashedPassword;

      admin.role = "admin";

      admin.isActive = true;

      admin.isVerified = true;

      await admin.save();

      console.log("");
      console.log(
        "=========================================="
      );
      console.log(
        "CareConnect admin account updated successfully."
      );
      console.log(
        "=========================================="
      );
      console.log(
        `Email: ${adminEmail}`
      );
      console.log(
        `Phone: ${adminPhone}`
      );
      console.log(
        `Password: ${adminPassword}`
      );
      console.log("Role: admin");
      console.log(
        "Password: bcrypt hashed"
      );
      console.log(
        "=========================================="
      );
      console.log("");

      process.exit(0);
    }

    admin =
      await User.create({
        name: "CareConnect Admin",

        email: adminEmail,

        phone: adminPhone,

        password: hashedPassword,

        role: "admin",

        isActive: true,

        isVerified: true,
      });

    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "CareConnect admin account created successfully."
    );
    console.log(
      "=========================================="
    );
    console.log(
      `Email: ${adminEmail}`
    );
    console.log(
      `Phone: ${adminPhone}`
    );
    console.log(
      `Password: ${adminPassword}`
    );
    console.log("Role: admin");
    console.log(
      "Password: bcrypt hashed"
    );
    console.log(
      "=========================================="
    );
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error(
      "Failed to create/update admin account:"
    );
    console.error(
      error.message
    );
    console.error("");

    process.exit(1);
  }
};

createAdmin();