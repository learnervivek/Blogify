const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/default.jpg",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  const user = this;
  if (!user.isModified("password")) return;

  const salt = randomBytes(16).toString("hex");

  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedPassword;
});

userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found!");

    const salt = user.salt;
    const hashedPassword = user.password;
    const userProvidedHash = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    if (hashedPassword !== userProvidedHash)
      throw new Error("Incorrect Password");

    const profileImageURL = user.profileImageURL?.startsWith("/public/")
      ? user.profileImageURL.replace("/public/", "/")
      : user.profileImageURL || "/default.jpg";

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profileImageURL,
        role: user.role,
      },
      "secret-key"
    );

    return token;
  }
);

const User = model("user", userSchema);
module.exports = User;
