const { Op } = require('sequelize');
const db = require('../models');

const DATA_TYPE = {
  int: 'ProductInt',
  string: 'ProductVarchar',
  datetime: 'ProductDateTime',
  image: 'ProductImage',
  decimal: 'ProductDecimal',
  text: 'ProductText',
};

const productService = {
  addProduct: async (product, attributes) => {
    const transaction = await db.sequelize.transaction();
    try {
      let listAttribute = await productService.getAtrributeByGroupID(
        product.attributeGroupId
      );

      let listAttributeID = listAttribute.reduce((list, attribute) => {
        list.push(attribute.dataValues.id);
        return list;
      }, []);

      if (
        listAttributeID.length !== attributes.ids.length ||
        JSON.stringify(listAttributeID) !== JSON.stringify(attributes.ids)
      ) {
        return {
          code: 400,
          data: {
            status: 400,
            message: 'Chỉ thêm các thuộc tính của sản phẩm',
          },
        };
      }

      let newProduct = await db.Product.create(product, {
        transaction: transaction,
      });

      let listValue = attributes.list.reduce((newObj, item) => {
        if (!newObj.hasOwnProperty(item['backendType'])) {
          newObj[item['backendType']] = [
            {
              value: item.value,
              attributeId: item.attributeId,
              createAt: new Date(),
              updateAt: new Date(),
              productId: newProduct.id,
            },
          ];
        } else
          newObj[item['backendType']].push({
            value: item.value,
            attributeId: item.attributeId,
            createAt: new Date(),
            updateAt: new Date(),
            productId: newProduct.id,
          });
        return newObj;
      }, {});

      let arrayPromise = Object.keys(listValue).map((value) => {
        return db[DATA_TYPE[value]].bulkCreate(listValue[value], {
          transaction: transaction,
        });
      });

      await Promise.all(arrayPromise);

      await transaction.commit();

      return {
        code: 200,
        data: {
          status: 200,
          message: 'Thêm sản phẩm thành công',
        },
      };
    } catch (error) {
      console.log(error);
      transaction.rollback();
      return {
        code: 500,
        data: {
          status: 500,
          message: 'Thêm sản phẩm thất bại',
        },
      };
    }
    // Lấy hết attribute của loại sp đó từ attributeGroupID
    // So sánh với các attribute của sản phẩm từ request fe đẩy lên
    // Nếu cái nào không khớp thì báo lỗi, cái nào chưa điển thì bắt điền
    // Nếu mà sản phẩm đó cần thêm 1 attribute mới thì cho attribute đó là chung
    // Mục đích của bảng flat là để lưu những thuộc tính thường sử dụng của product
  },

  deleteProduct: async (productID) => {
    try {
      let product = await db.Product.findByPk(productID);
      if (!product) {
        return {
          code: 400,
          data: {
            status: 400,
            message: 'Sản phẩm không tồn tại',
          },
        };
      }

      let listPromise = Object.keys(DATA_TYPE).map((type) => {
        db[DATA_TYPE[type]].destroy({
          where: {
            productId: productID,
          },
        });
      });

      await Promise.all(listPromise).then(() => {
        return product.destroy();
      });

      return {
        code: 200,
        data: {
          status: 200,
          data: 'Sản phẩm đã được xóa',
        },
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
      };
    }
  },

  updateProduct: async (productID, productData) => {
    const { attributes, ...productBase } = productData;
    const transaction = await db.sequelize.transaction();
    try {
      const listPromise = [];
      if (Object.keys(productBase).length) {
        listPromise.push(
          db.Product.update(productBase, {
            where: {
              id: productID,
            },
            transaction: transaction,
          })
        );
      }
      if (attributes.length) {
        attributes.forEach(async (attribute) => {
          listPromise.push(
            db[DATA_TYPE[attribute['backendType']]].update(
              {
                value: attribute['value'],
                updateAt: new Date(),
              },
              {
                where: {
                  [Op.and]: [
                    { productId: productID },
                    { attributeId: attribute['attributeId'] },
                  ],
                },
                transaction: transaction,
              }
            )
          );
        });
      }
      await Promise.all(listPromise);
      await transaction.commit();
      return {
        code: 200,
        data: {
          status: 200,
          data: 'Cập nhật sản phẩm thành công',
        },
      };
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      return {
        code: 500,
        data: {
          status: 500,
        },
      };
    }
  },

  // có thể tạo 1 bảng flat để lấy những thuộc tính hay dùng
  getProductByID: async (productID) => {
    let data, code;
    try {
      let product = await db.Product.findByPk(productID);
      let listAttribute = await productService.getAtrributeByGroupID(
        product.attributeGroupId
      );

      let { listAttributeFetch, listAttributeValidate, listAttributeID } =
        productService.createListAttributeData(listAttribute);

      let listPromise = Object.keys(listAttributeFetch).map((attribute) => {
        return db[DATA_TYPE[attribute]].findAll({
          where: {
            productId: product.id,
            attributeId: {
              [Op.in]: listAttributeID,
            },
          },
        });
      });

      await Promise.all(listPromise).then((values) => {
        let listValueFlat = values.reduce((list, value) => {
          list.push(...value);
          return list;
        }, []);

        listValueFlat.forEach((value) => {
          value.dataValues['name'] =
            listAttributeValidate[value.attributeId]['name'];
          value.dataValues['backendType'] =
            listAttributeValidate[value.attributeId]['backendType'];
          value.dataValues['frontendInput'] =
            listAttributeValidate[value.attributeId]['frontendInput'];

          if (!product.dataValues.hasOwnProperty('attributes')) {
            product.dataValues['attributes'] = [value.dataValues];
          } else {
            product.dataValues['attributes'].push(value.dataValues);
          }
        });

        code = 200;
        data = product;
      });

      return {
        code: code,
        data: {
          status: code,
          data: data,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        code: 400,
        data: {
          status: 400,
          message: 'Đã có lỗi xảy ra',
        },
      };
    }
  },

  getProductByKw: async (params) => {
    const { page, name, fP, tP, sortBy, order, cateID } = params;
    let data, code, start, categories;
    if (page > 0) {
      start = parseInt((page - 1) * process.env.PAGE_SIZE);
    }
    if (cateID) {
      let category = await db.Category.findByPk(cateID);
      categories = category.path.split('/').filter((item) => item >= cateID);
    }
    let products = await db.Product.findAll({
      where: {
        [Op.and]: [
          name ? { name: { [Op.substring]: name } } : {},
          fP ? { price: { [Op.gte]: fP } } : {},
          tP ? { price: { [Op.lte]: tP } } : {},
          cateID ? { categoryId: { [Op.in]: categories } } : {},
        ],
      },
      offset: start,
      limit: parseInt(process.env.PAGE_SIZE),
      order: [sortBy ? [sortBy, order] : ['id', 'desc']],
    });
    const { listProduct, listProductId, listGroupId } =
      productService.createListProductData(products);

    let listAttribute = await productService.getAtrributeByListGroupID(
      listGroupId
    );
    let { listAttributeFetch, listAttributeValidate, listAttributeID } =
      productService.createListAttributeData(listAttribute);

    let listPromise = Object.keys(listAttributeFetch).map((attribute) => {
      return db[DATA_TYPE[attribute]].findAll({
        where: {
          productId: {
            [Op.in]: listProductId,
          },
          attributeId: {
            [Op.in]: listAttributeID,
          },
        },
      });
    });

    await Promise.all(listPromise)
      .then((values) => {
        let listValueFlat = values.reduce((list, value) => {
          list.push(...value);
          return list;
        }, []);

        listValueFlat.forEach((value) => {
          value.dataValues['name'] =
            listAttributeValidate[value.attributeId]['name'];
          value.dataValues['backendType'] =
            listAttributeValidate[value.attributeId]['backendType'];
          value.dataValues['frontendInput'] =
            listAttributeValidate[value.attributeId]['frontendInput'];

          if (
            !listProduct[value.productId].dataValues.hasOwnProperty(
              'attributes'
            )
          ) {
            listProduct[value.productId].dataValues['attributes'] = [
              value.dataValues,
            ];
          } else {
            listProduct[value.productId].dataValues['attributes'].push(
              value.dataValues
            );
          }
        });

        code = 200;
        data = products.map((product) => listProduct[product.dataValues.id]);
      })
      .catch((error) => {
        code = 400;
        data = {
          code: code,
          message: 'Đã có lỗi xảy ra',
        };
      });

    // const productAmount = await db.Product.count({
    //   where: {
    //     [Op.and]: [
    //       name ? { name: { [Op.substring]: name } } : {},
    //       fP ? { price: { [Op.gte]: fP } } : {},
    //       tP ? { price: { [Op.lte]: tP } } : {},
    //       cate ? { categoryId: cate } : {},
    //       !name && !cate ? { isActive: true } : {},
    //     ],
    //   },
    // });

    return {
      code: code,
      data: {
        status: code,
        data: data,
      },
    };
  },

  compareProduct: async (productId1, productId2) => {
    try {
      let data;
      await Promise.all([
        productService.getProductByID(productId1),
        productService.getProductByID(productId2),
      ]).then((values) => {
        data = {
          base: values[0].data?.data,
          compare: values[1].data?.data,
        };
      });
      return {
        code: 200,
        data: {
          status: 200,
          data: data,
        },
      };
    } catch (error) {
      return {
        code: 400,
        data: {
          status: 400,
          message: 'Đã có lỗi xảy ra !',
        },
      };
    }
  },

  //-----------------------------------------------------

  createListAttributeData: (listAttribute) => {
    const initListAttributeData = {
      listAttributeValidate: {},
      listAttributeID: {},
      listAttributeFetch: {},
    };

    return listAttribute.reduce((obj, attribute) => {
      obj['listAttributeValidate'][attribute.id] = attribute;

      Array.isArray(obj['listAttributeID'])
        ? obj['listAttributeID'].push(attribute.id)
        : (obj['listAttributeID'] = [attribute.id]);

      if (!obj['listAttributeFetch'][attribute['backendType']]) {
        obj['listAttributeFetch'] = {
          [attribute['backendType']]: [attribute],
        };
      } else {
        obj['listAttributeFetch'][attribute['backendType']].push(attribute);
      }

      return obj;
    }, initListAttributeData);
  },

  createListProductData: (products) => {
    const initListProductData = {
      listProduct: {},
      listGroupId: {},
      listProductId: {},
    };

    return products.reduce((obj, product) => {
      obj['listProduct'][product.id] = product;

      Array.isArray(obj['listGroupId'])
        ? obj['listGroupId'].push(product.attributeGroupId)
        : (obj['listGroupId'] = [product.attributeGroupId]);

      Array.isArray(obj['listProductId'])
        ? obj['listProductId'].push(product.id)
        : (obj['listProductId'] = [product.id]);

      return obj;
    }, initListProductData);
  },

  getAtrributeByGroupID: async (groupId) => {
    try {
      const attributeSets = await db.AttributeSet.findAll({
        where: { attributeGroupId: groupId },
      });

      const attributesID = attributeSets.reduce((acc, item) => {
        return [...acc, item.dataValues.attributeId];
      }, []);

      const attributes = await db.Attribute.findAll({
        where: {
          id: {
            [Op.in]: attributesID,
          },
        },
      });
      return attributes;
    } catch (error) {
      console.log(error);
    }
  },

  getAtrributeByListGroupID: async (listGroupId) => {
    try {
      const attributeSets = await db.AttributeSet.findAll({
        where: {
          attributeGroupId: {
            [Op.in]: listGroupId,
          },
        },
      });

      const attributesID = attributeSets.reduce((acc, item) => {
        return [...acc, item.dataValues.attributeId];
      }, []);

      const attributes = await db.Attribute.findAll({
        where: {
          id: {
            [Op.in]: attributesID,
          },
        },
      });
      return attributes;
    } catch (error) {
      console.log(error);
    }
  },
};
module.exports = productService;