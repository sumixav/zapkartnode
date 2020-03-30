const cleanDeep = require("clean-deep");
const { carts, users } = require("../auth_models");
const Product = require("../models/product");
const Pricing = require("../models/pricing");
const validator = require("validator");
const { to, TE, ReE, ReS, isEmpty } = require("../services/util.service");
const Logger = require("../logger");
const { STRINGS } = require("../utils/appStatics");

const Op = require("sequelize").Op;

/**
 * to add multiple products to cart from guest to logged in user
 * @param {Object[]} params.products - a list of products
 * @param {string} params.products[].productId -  productId
 * @param {number} params.products[].qty -  product qty
 * @param {number} params.userId - userId of cart (searched against in cart)
 */
exports.addToCartFromGuestToLogged = async params => {
  const { products: prodParams, userId } = params;


  // at front check deleted, status, out of stock and proceed with order if all satiffied; notify user

  const cartsToUpdate = [];

  const [err, promises] = await to(
    Promise.all(
      prodParams.map(async cartProd => {
        const [errF, product] = await to(
          Product.findOne({ _id: cartProd.productId }).populate("pricing")
        );
        if (errF) throw TE(errF.message);
        if (!product) TE("Product does not exist");

        const [errC, existingCart] = await to(
          carts.findOne({ where: { userId, productId: cartProd.productId } })
        );
        if (errC) TE(errC.message);

        Logger.info("cart", existingCart);
        let updatedQty =
          existingCart && existingCart !== null
            ? existingCart.quantity + cartProd.quantity
            : cartProd.quantity;
        if (updatedQty > product.maxOrderQty) {
          updatedQty = product.maxOrderQty;
          // TE("Max limit reached")
        }

        if (updatedQty < product.minOrderQty) updatedQty = product.minOrderQty;

        Logger.info("userId", userId);
        if (existingCart) {
          // existing cart
          // cart.price = pricing.salePrice;
          existingCart.quantity = updatedQty;
          existingCart.prescriptionRequired = product.prescriptionNeeded ? "yes" : "no"

          const [errM, updatedCart] = await to(existingCart.save());
          if (errM) TE(err.message);
          if (!updatedCart) TE("cart not updated");
          return Promise.resolve({ ...updatedCart.toWeb(), product: { ...product._doc } });
        }

        // create cart if not exist
        if (!existingCart) {
          // create new cart
          const newCart = {
            productId: product._id.toString(),
            userId,
            quantity: updatedQty,
            price: product.pricing.salePrice,
            prescriptionRequired: product.prescriptionNeeded ? "yes" : "no"
          };
          const [errM, updatedCart] = await to(carts.create(newCart));
          if (errM) TE(errM.message);
          if (!updatedCart) TE("cart not created");
          return Promise.resolve({ ...updatedCart.toWeb(), product: { ...product._doc } });
        }
      })));
  if (err) TE(err.message)


  const [errM, userCartProds] = await to(carts.findAll({ userId }))
  if (errM) TE(errM.message);
  if (!userCartProds) TE("No cart for user")
  return this.getCart(userId);
};

exports.addToCartFromGuestToLoggedBulk = async params => {
  const { products: prodParams, userId } = params;

  // at front check deleted, status, out of stock and proceed with order if all satiffied; notify user

  const cartsToUpdate = [];

  let cartArray = [];
  const [errB, promises] = await to(
    Promise.all(
      prodParams.map(async cartProd => {
        const [errF, product] = await to(
          Product.findOne({ _id: cartProd.productId }).populate("pricing")
        );
        if (errF) throw TE(errF.message);
        if (!product) TE("Product does not exist");

        const [errC, existingCart] = await to(
          carts.findOne({ where: { userId, productId: cartProd.productId } })
        );
        if (errC) TE(errC.message);

        Logger.info("cart", existingCart);
        let updatedQty =
          existingCart && existingCart !== null
            ? existingCart.quantity + cartProd.quantity
            : cartProd.quantity;
        if (updatedQty > product.maxOrderQty) {
          updatedQty = product.maxOrderQty;
          // TE("Max limit reached")
        }

        if (updatedQty < product.minOrderQty) updatedQty = product.minOrderQty;

        Logger.info("userId", userId);
        if (existingCart) {
          // existing cart
          // cart.price = pricing.salePrice;
          existingCart.quantity = updatedQty;
          cartArray.push({
            id: existingCart.id,
            userId,
            productId: cartProd.productId,
            quantity: updatedQty,
            price: product.pricing.salePrice
          });
        }

        // create cart if not exist
        if (!existingCart) {
          // create new cart
          const newCart = {
            productId: product._id.toString(),
            quantity: updatedQty,
            price: product.pricing.salePrice,
            userId
          };

          cartArray.push(newCart);
        }
      })
    )
  );
  if (errB) TE(errB.message);

  Logger.info(cartArray);

  console.log(Object.keys(carts.attributes));

  const [errC, cartsNew] = await to(
    carts.bulkCreate(cartArray, {
      updateOnDuplicate: ["quantity"],
      individualHooks: true
    })
  );
  if (errC) TE(errC.message);
  if (!cartsNew) TE("not updated");
  return cartsNew;
};

/**
 * @param {object} param
 * @param {string} param.productId
 * @param {int} param.quantity
 * @param {int} param.user
 */
exports.addToCart = async param => {
  let err, pricing, cart, product;
  const { productId, quantity, user } = param;

  // no user
  if (!user) TE("Unauthorized");

  // find active product
  [err, product] = await to(
    Product.findOne({ _id: productId, deleted: false })
  );
  if (err) TE(err);
  if (!product) {
    TE("Product not found");
  }
  if (product.status === "hold") TE("Product no longer active");

  [err, pricing] = await to(Pricing.findOne({ _id: product.pricing }));
  if (err) TE(err.message);
  if (!pricing) TE("Invalid product");
  // find cart if exists to update
  Logger.info("will execute find cart");
  [err, cart] = await to(
    carts.findOne({ where: { userId: user.id, productId } })
  );
  if (err) TE(err.message);

  Logger.info(cart);

  let updatedQty = cart && cart !== null ? cart.quantity + quantity : quantity;
  if (updatedQty > product.maxOrderQty) {
    updatedQty = product.maxOrderQty;
    // TE("Max limit reached")
  }

  if (updatedQty < product.minOrderQty)
    updatedQty = product.minOrderQty;
  // TE(`Minimum ${product.minOrderQty} required`);

  Logger.info("will save/ create cart");
  // if existing cart
  if (cart) {
    // existing cart
    // cart.price = pricing.salePrice;
    cart.quantity = updatedQty;
    cart.prescriptionRequired = product.prescriptionNeeded ? "yes" : "no"
    [err, cart] = await to(cart.save());
    if (err) TE(err.message);
    if (!cart) TE("No cart updated");
    [err, userCartProds] = await to(carts.findAll({ userId: user.id }))
    if (err) TE(err.message);
    if (!userCartProds) TE("No cart for user")
    return this.getCart(user.id);
  }

  // create cart if not exist
  if (!cart) {
    // create new cart
    [err, cart] = await to(
      carts.create({
        productId: product._id.toString(),
        quantity: updatedQty,
        price: pricing.salePrice,
        userId: user.id,
        prescriptionRequired: product.prescriptionNeeded ? "yes" : "no"
      })
    );
    if (err) TE("Error creating cart. " + err.message);
    if (!cart) TE("No cart created");
    return this.getCart(user.id);
  }
};

exports.removeFromCart = async param => {
  const { productId, userId } = param;
  const [err, deletedC] = await to(
    carts.destroy({ where: { productId, userId } })
  );
  if (err) TE(err.message);
  if (!deletedC) TE("Nothing to delete");
  return this.getCart(userId);
};

exports.restoreToCart = async param => {
  const { productId, userId } = param;

  const [errA, cart] = await to(
    carts.findOne({
      where: {
        productId,
        userId
      },
      paranoid: false
    })
  );
  if (cart.deletedAt === null) TE("Nothing to restore");
  if (errA) TE(errA.message);
  if (!cart) TE(STRINGS.NOT_EXIST);
  const [err, restored] = await to(cart.restore());
  if (err) TE(err.message);
  if (!restored) TE("Nothing to restore");
  return restored;
};

exports.addToCartOld = async param => {
  let err, pricing, cart, product;
  const { productId, quantity, user } = param;

  // no user
  if (!user) TE("Unauthorized");

  // find active product
  [err, product] = await to(Product.findOne({ _id: productId }));
  if (err) return err;
  if (!product) {
    TE("Product not found");
  }
  if (product.status === "hold") TE("Product no longer active");

  [err, pricing] = await to(Pricing.findOne({ _id: product.pricing }));
  if (err) TE(err.message);
  if (!pricing) TE("Invalid product");
  // find cart if exists to update
  Logger.info("will execute find cart");
  [err, cart] = await to(
    carts.findOne({ where: { userId: user.id, productId } })
  );
  if (err) TE(err.message);

  Logger.info(cart);

  let updatedQty = cart && cart !== null ? cart.quantity + quantity : quantity;
  if (updatedQty > product.maxOrderQty) {
    updatedQty = product.maxOrderQty;
    // TE("Max limit reached")
  }

  if (updatedQty < product.minOrderQty)
    TE(`Minimum ${product.minOrderQty} required`);

  Logger.info("will save/ create cart");
  // if existing cart
  if (cart) {
    // existing cart
    // cart.price = pricing.salePrice;
    cart.quantity = updatedQty;
    [err, cart] = await to(cart.save());
    if (err) TE(err.message);
    if (!cart) TE("No cart updated");
    return cart;
  }

  // create cart if not exist
  if (!cart) {
    // create new cart
    [err, cart] = await to(
      carts.create({
        productId: product._id.toString(),
        quantity: updatedQty,
        price: pricing.salePrice,
        userId: user.id
      })
    );
    if (err) TE("Error creating cart. " + err.message);
    if (!cart) TE("No cart created");
    return cart;
  }
};

const getCart = async userid => {
  [err, cart] = await to(carts.findAll({ where: { userId: userid } }));
  if (err) {
    return err;
  }
  let cartResult = {};
  //console.log(cart[0].id);

  if (!cart) TE("No cart available");
  // return cart.map(i=> i.toWeb())
  Logger.info('cart', cart)
  if (cart) {
    cartResult = await Promise.all(
      cart.map(async function (item) {
        //Object.assign(item, {key3: "value3"});
        product = await Product.findOne({ _id: item.productId }).populate(
          "pricing stock"
        ).select("id slug name maxOrderQty minOrderQty prescriptionNeeded deleted status pricing stock images");
        let obj = { ...item.toWeb(), product: { ...product._doc } };
        return obj;
      })
    );
    console.log(cartResult);
  }
  return cartResult;
};

module.exports.getCart = getCart;

const updateCart = async (id, param) => {
  console.log("hh", param);
  [err, cart] = await to(carts.update(param, { where: { id: id } }));
  if (err) TE(err.message);
  return cart;
};

module.exports.updateCart = updateCart;

const deleteCart = async id => {
  console.log("hh", param);
  [err, cart] = await to(carts.destroy({ where: { id: id } }));
  if (err) {
    return err;
  }
  return cart;
};

module.exports.deleteCart = deleteCart;
