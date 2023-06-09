const { customerRouter } = require("./customer.router");
const { dataRouter } = require("./data.router");
const { notificationRouter } = require("./notification.router");
const { reportRouter } = require("./report.router");
const { sellerRouter } = require("./seller.router");
const { shopRouter } = require("./shop.router");
const { staffRouter } = require("./staff.router");
const { userRouter } = require("./user.router");
const productRouter = require("./product.router");
const orderRouter = require("./order.router");
const adminRouter = require("./admin.router");
const reviewRouter = require("./review.router");
const categoryRouter = require("./category.router");
const attributeRouter = require("./attribute.router");
const attributeGroupRouter = require("./attribute-group.router");
const stripeRouter = require('./stripe.router')
const { addressRouter } = require("./address.router");
const { cartRouter } = require("./cart.router");
const { productCartRouter } = require("./product-cart.router");
const { messageRouter } = require("./message.router");
const { conversationRouter } = require("./conversation.router");
const { promotionRouter } = require("./promotion.router");
const { statsRouter } = require("./stats.router");

const indexRouter = require("express").Router();

indexRouter.use("/user", userRouter);
indexRouter.use("/seller", sellerRouter);
indexRouter.use("/data", dataRouter);
indexRouter.use("/product", productRouter);
indexRouter.use("/shop", shopRouter);
indexRouter.use("/report", reportRouter);
indexRouter.use("/notification", notificationRouter);
indexRouter.use("/staff", staffRouter);
indexRouter.use("/customer", customerRouter);
indexRouter.use("/order", orderRouter);
indexRouter.use("/admin", adminRouter);
indexRouter.use("/review", reviewRouter);
indexRouter.use("/category", categoryRouter);
indexRouter.use("/address", addressRouter);
indexRouter.use("/cart", cartRouter);
indexRouter.use("/product-cart", productCartRouter);
indexRouter.use("/attribute", attributeRouter);
indexRouter.use("/attribute-group", attributeGroupRouter);
indexRouter.use("/message", messageRouter);
indexRouter.use("/conversation", conversationRouter)
indexRouter.use('/checkout', stripeRouter)
indexRouter.use('/promotion', promotionRouter)
indexRouter.use('/stats', statsRouter)


module.exports = { indexRouter };
