const { Schema, model } = require("mongoose");

const UserAddressSchema = new Schema(
  {
    postal_code: {
      type: String,
      required: true,
    },
    address_main: {
      type: String,
      required: true,
    },
    address_detail: {
      type: String,
      required: false,
    },
  },
  {
    collection: "UserAddress",
  }
);

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 11,
    },
    full_name: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    address: UserAddressSchema,
    role: {
      type: String,
      required: false,
      default: "basic-user",
    },
  },
  {
    collection: "User",
    timestamps: true,
  }
);

const User = model("User", UserSchema);
const UserAddress = model("UserAddress", UserAddressSchema);

module.exports = { User, UserAddress };
