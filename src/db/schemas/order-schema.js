const { Schema, model } = require("mongoose");
const { shortId } = require("../../utils/short-id");

/**
 * 여기에 작성된 OrderedProductSchema는 OrderSchema의 속성을 사용하기 위해 작성된 Schema 입니다.
 * 하나의 주문 안에 하나 이상의 품목이 들어갈 수 있습니다.
 * product_id는 Product의 Object_id를 가져 어떤 상품이 주문에 들어가는지 찾을 때 사용합니다.
 * amount, price, image, total_price는 사용자에게 정보를 제공하기 위해 데이터가 각 정보를 모두 가지고 있을 수 있도록 구현합니다.
 */
const OrderedProductSchema = new Schema(
  {
    product_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    maker: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: Array,
      require: true,
    },
    total_price: {
      type: Number,
      require: true,
      min: 0,
    },
  },
  {
    collection: "OrderedProduct",
  }
);

/**
 * 주문 관련된 정보를 저장합니다.
 * ordered_product는 하나 이상의 값이 들어올 수 있기 때문에 배열 형태로 저장됩니다.
 * timestamps를 두어 주문 시간을 기록합니다.
 * shipping_status 상태는 주문 테이블이 생기고 나서 추가 기능을 만들기 위해 필요하며 생성되면 default 값으로 '배송준비중'을 가집니다.
 */
const OrderSchema = new Schema(
  {
    order_id: shortId,
    user_id: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    user_phone: {
      type: String,
      required: true,
    },
    ordered_product: {
      type: [OrderedProductSchema],
      required: true,
    },
    shipping_status: {
      type: String,
      enum: ["배송준비중", "배송중", "배송완료"],
      required: true,
      default: "배송준비중",
    },
    address: {
      type: Object,
      required: true,
    },
    total_price: {
      type: Number,
      require: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "Order",
  }
);

const Order = model("Order", OrderSchema);
const OrderedProduct = model("OrderedProduct", OrderedProductSchema);

module.exports = { Order, OrderedProduct };
