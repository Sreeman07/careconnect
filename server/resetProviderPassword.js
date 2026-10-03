import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const resetProviderPassword = async () => {
  try {
    console.log("");
    console.log("========================================");
    console.log("CARECONNECT PROVIDER PASSWORD RESET");
    console.log("========================================");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");
    console.log("Database:", mongoose.connection.name);
    console.log("");

    const provider = await User.findOne({
      email: "provider@careconnect.com",
    }).select("+password");

    if (!provider) {
      console.log("❌ Provider account not found.");
      await mongoose.disconnect();
      process.exit(1);
    }

    const plainPassword = "Ravi@12345";

    console.log("Provider found.");
    console.log("Email:", provider.email);
    console.log("Role:", provider.role);
    console.log("Verified:", provider.isVerified);
    console.log("Active:", provider.isActive);
    console.log("");

    console.log("Creating bcrypt password hash...");

    const hashedPassword = await bcrypt.hash(
      plainPassword,
      12
    );

    console.log(
      "Hash created:",
      hashedPassword.substring(0, 7) + "..."
    );

    /*
     * Directly update MongoDB.
     *
     * This intentionally bypasses the broken save middleware
     * so we can guarantee that the provider gets a valid bcrypt hash.
     */
    await User.updateOne(
      {
        _id: provider._id,
      },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    console.log("Password hash saved directly to MongoDB.");
    console.log("");

    /*
     * Read the provider again and verify the stored hash.
     */
    const updatedProvider = await User.findOne({
      email: "provider@careconnect.com",
    }).select("+password");

    const passwordMatches = await bcrypt.compare(
      plainPassword,
      updatedProvider.password
    );

    console.log("========================================");
    console.log("PASSWORD VERIFICATION");
    console.log("========================================");

    console.log(
      "Stored password length:",
      updatedProvider.password.length
    );

    console.log(
      "Starts with $2b$:",
      updatedProvider.password.startsWith("$2b$")
    );

    console.log(
      "Password matches:",
      passwordMatches
    );

    console.log("");

    if (passwordMatches) {
      console.log("========================================");
      console.log("✅ PASSWORD RESET SUCCESSFUL");
      console.log("========================================");
      console.log("");
      console.log("Email:    provider@careconnect.com");
      console.log("Password: Ravi@12345");
      console.log("Role:     " + updatedProvider.role);
      console.log("Verified: " + updatedProvider.isVerified);
      console.log("Active:   " + updatedProvider.isActive);
      console.log("");
      console.log("You can now log in.");
      console.log("========================================");
    } else {
      console.log("❌ PASSWORD VERIFICATION FAILED.");
    }

    await mongoose.disconnect();

    process.exit(passwordMatches ? 0 : 1);
  } catch (error) {
    console.error("");
    console.error("❌ PASSWORD RESET FAILED");
    console.error(error);
    console.error("");

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error(
        "MongoDB disconnect error:",
        disconnectError.message
      );
    }

    process.exit(1);
  }
};

resetProviderPassword();