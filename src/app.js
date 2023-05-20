const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const { errorHandler } = require("./middlewares/error-handler");
const { orderRouter } = require("./routers/order-router");
const { userRouter } = require("./routers/user-router");
const { adminRouter } = require("./routers/admin-router");
const { productRouter } = require("./routers/product-router");

const app = express();

const DB_URL =
  process.env.MONGODB_URL ||
  "MongoDB 서버 주소가 설정되지 않았습니다.\n./db/index.ts 파일을 확인해 주세요. \n.env 파일도 필요합니다.\n";

mongoose.set("strictQuery", false);

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (error) =>
  console.error("\nMongoDB 연결에 실패하였습니다...\n" + DB_URL + "\n" + error)
);
db.once("connected", () =>
  console.log("정상적으로 MongoDB 서버에 연결되었습니다.  " + DB_URL)
);

// CORS 에러 방지
app.use(cors());

// Content-Type: application/json 형태의 데이터를 인식하고 핸들링할 수 있게 함.
app.use(express.json());

// Content-Type: application/x-www-form-urlencoded 형태의 데이터를 인식하고 핸들링할 수 있게 함.
app.use(express.urlencoded({ extended: false }));

// 라우팅
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/orders", orderRouter);
app.use("/api/product", productRouter);

// 루트페이지 카테고리 로딩 : 논의 필요
const { asyncHandler } = require("./utils/async-handler");
const { categoryService } = require("./services/category-service");
app.get(
  "/api/categories",
  asyncHandler(async (req, res, next) => {
    const categoryList = await categoryService.getAllCategories();
    res.json(categoryList);
  })
);

app.use(errorHandler);

module.exports = { app };
