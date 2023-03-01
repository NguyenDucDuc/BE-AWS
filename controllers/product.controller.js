const productService = require('../services/product.service');
module.exports = {
  getProductByKw: async (req, res) => {
    try {
      let params = req.query;
      params.page = params.page === undefined ? 1 : params.page;
      params.name = params.name === undefined ? '' : params.name;
      const { code, data } = await productService.getProductByKw(params);
      return res.status(code).json(data);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },

  getProductByID: async (req, res) => {
    try {
      const { code, data } = await productService.getProductByID(req.params.id);
      return res.status(code).json(data);
    } catch (error) {
      console.log(error);
      return res.status(500);
    }
  },

  addProduct: async (req, res) => {
    let { attributes, ...product } = req.body;
    if (req?.files) {
      product.image = req.files.image;
    }

    product.createAt = new Date();
    product.updateAt = new Date();
    try {
      const { code, data } = await productService.addProduct(
        product,
        attributes
      );
      return res.status(code).json(data);
    } catch (error) {
      console.log(error);
      return res.status(500);
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const { code, data } = await productService.deleteProduct(
        req.params.productId
      );
      return res.status(code).json(data);
    } catch (error) {
      console.log(error);
      return res.status(500);
    }
  },
  updateProduct: async (req, res) => {
    let productData = req.body;
    productData.image = req.files.image;
    let productId = req.params.productId;
    try {
      const { code, data } = await productService.updateProduct(
        productId,
        productData
      );
      return res.status(code).json(data);
    } catch (error) {
      console.log(error);
      return res.status(500);
    }
  },

  compareProduct: async (req, res) => {
    const { productId1, productId2 } = req.body;
    try {
      const { code, data } = await productService.compareProduct(
        parseInt(productId1),
        parseInt(productId2)
      );
      return res.status(code).json(data);
    } catch (error) {
      console.log(error);
      return res.status(500);
    }
  },


};
