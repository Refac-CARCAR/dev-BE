const { model, Schema } = require("mongoose");
const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "Category",
  }
);

exports.Category = model("Category", CategorySchema);
