const { Op } = require('sequelize');
const Product = require('../pg/models/Products');
const ProductImages = require('../pg/models/ProductImages');
const { saveBrands, getAllBrands } = require('../services/brand.service');
const { saveCategories, getAllCategories } = require('../services/category.service');
const { createProductColor, getProductColorByProductId } = require('../services/productColor.service');
const { createColor } = require('../services/color.service');
const { createProductSize, getProductSizeByProductId } = require('../services/productSize.service');
const { createProductItems } = require('../services/productItem.service');
const { createProductDiscount } = require('../services/productDiscount.service');
const config = require('../config');
const Vendor = require('../pg/models/Vendors');
const { safeString, getLowerCaseSafeString } = require('../utils/string.utils');
const { paginate } = require('../utils');
const { getDistinctValues, getUniqueValuesByField, existFields, returnSlugName } = require('../utils');
const imgStorageSvc = require('../services/imageStorage.service');
const validationField = '__validation__';
const requiredfields = [
    'name',
    'stock',
    'amount',
    'category',
    'brand',
    'sku',
    'code',
    'description'
];
const LIMIT = config.defaultLimit;
const MAIN_INCLUDES = ['productProductDiscount','productBrand', 'productStatus', 'productImages', 'productSizes', 'productColors', 'productProductItems', 'categories', 'subCategoryProduct'];
const MAIN_INCLUDES_MEDIUM = ['productBrand', 'productStatus', 'productImages', 'productProductItems', 'categories'];
const MAIN_INCLUDES_LIGHT = ['productStatus', 'productImages', 'productProductItems'];
const IMPORT = 'IMPORT';
/** Only these fields will be used to save on the database */
const savedFields = requiredfields.concat(['status', 'vendor', 'source']);

/** Creates a new product object with the given data */
const createProductObject = (data, vendor, source) => {
    const slugName = returnSlugName(data.name, data.sku);
    return {
        'name': data.name,
        'stock': +data.stock,
        'amount': +data.amount,
        'category': (data.category) ? data.category : null,
        'brand': (data.brand) ? data.brand : null,
        'sku': data.sku,
        'code': data.code,
        'description': data.description,
        ...vendor  && { vendor: +vendor.id },
        ...data['status'] && { statusId: data.status },
        'discount1': +data.discount1,
        'discount1MinQty': +data.discount1MinQty,
        'discount2': +data.discount2,
        'discount2MinQty': +data.discount2MinQty,
        'slug': slugName,
        'source': source || IMPORT // This is to indicate that the source of input was from an IMPORT
    }
}

const createManualProduct = async(req) => {
  // add / update products
  let quit = false;
  let imgsUploads = [];
  const uploadResult = await imgStorageSvc.uploadImages(req.files);
  if (uploadResult.error) {
    quit = true;
    res.status(500).send(uploadResult.error);
  } else {
    imgsUploads = uploadResult.images;
  }

  if (!quit) { // Prevent the product to be created if image upload fails
    const body = req.body;

    const slugName = returnSlugName(body.name, body.sku);

    const product = await Product.create(
        {
            'name': body.name,
            'stock': body.stock,
            'amount': body.amount,
            'category': body.category,
            'brand': body.brand,
            'model': body.model,
            'sku': body.sku,
            'description': body.description,
            'vendor': body.vendor,
            'slug': slugName
        }
    );

    if (product) {
        let counter = 1;
        const newImages = imgsUploads.map((data) => {
          return {
            'productId': product.id,
            'img_url': data.image.Key,
            'img_thumb_url': data.thumbnail.Key,
            'position': counter++
          }
        })
        await ProductImages.bulkCreate(newImages);
        return product;
    } else {
        return {status: false, code: 401, message: 'Unable to add product'}
    }
  }
}

const updateProduct = async(req) => {
    let quit = false;
    let imagesUploaded = [];
    const uploadResult = await imgStorageSvc.uploadImages(req.files);
    if (uploadResult.error) {
      quit = true;
      res.status(500).send(uploadResult.error);
    } else {
      imagesUploaded = uploadResult.images;
    }

    if (!quit) {
      const body = req.body;
      const slugName = returnSlugName(body.name, body.sku);
      const pid = req.params.id;
      const updated = await Product.update({
          'name': body.name,
          'stock': body.stock,
          'amount': body.amount,
          'category': body.category,
          'brand': body.brand,
          'model': body.model,
          'sku': body.sku,
          'description': body.description,
          'vendor': body.vendor,
          'slug': slugName
      }, { where: { id: pid } });
  
      let message = "Product Updated";
      // delete all images first in servers
      const partBodySaved = req.body.saved ? JSON.parse(req.body.saved) : null;
      if (partBodySaved && Object.keys(partBodySaved).length) {
        let mapFiles = []
        let index = []
        Object.keys(partBodySaved).forEach((key) => {
          mapFiles.push(partBodySaved[key].img_url)
          if (partBodySaved[key].img_thumb_url) { // If a thumbnail exists, have to check if it comes from req.body.saved
            mapFiles.push(partBodySaved[key].img_thumb_url)
          }
          index.push(partBodySaved[key].id)
        })
        
        // delete image selected
        try {
          const promises = [];
          mapFiles.forEach(imageKeys => {
            promises.push(imgStorageSvc.remove(imageKeys))
          })
          await Promise.all(promises);
        // res.status(200).json({ status: true, message: "Product successfully deleted" });
        } catch (e) {
          message += " .Error on deleting image!";
        }
  
        // delete data from db
        try {
          ProductImages.destroy({ where: { id: index }})
        } catch (e) {
          console.log(e)
        }
      }
  
      let counter = 1;
      // save all data to product images
      if (imagesUploaded && imagesUploaded.length) {
        let newImages = imagesUploaded.map((data) => {
          return {
            'productId': pid,
            'img_url': data.image.Key,
            'img_thumb_url': data.thumbnail.Key,
            'position': counter++
          }
        })
  
        // save entired bulk to product images
        await ProductImages.bulkCreate(newImages);
      }
      return true;
    }
}

// This is because variants have size or color (for now)
const isVariant = (value) => {
    return (value) ? value.color || value.size : false
}

const filterOnlyProductVariants = (data) => {
    if (Array.isArray(data)) {
        return data.filter(d => isVariant(d))
    }
    return []
}

/** Returns a new array of newly created product object models */
const verifyImportDataFormat = (data, vendor, source) => {
    if (Array.isArray(data)) {
        const products = [];
        data.forEach((d) => {
            products.push(createProductObject(d, vendor, source));
        });
        return products;
    }
    return null;
}

/** Assigns the reference id from the given searchItems data array to the given data */
const assignReferenceId = (data, dataField, searchItems) => {
    if (!data[validationField]) { data[validationField] = []; }
    if (Array.isArray(searchItems)) {
        const item = searchItems.find(si => safeString(si.name).trim().toLowerCase() === safeString(data[dataField]).trim().toLowerCase());
        if (item) { // Replaces the string value with the correct model id
            data[dataField] = +item.id; // Assuming id is a number
            data[validationField].push({ field: dataField, valid: true });
            return;
        }
    }
    data[validationField].push({ field: dataField, valid: false, message: `Could not assign reference id for ${dataField}` });
}

/**
 * Checks the validation field and returns false if there were any errors in validation
 * @returns bool 
 */
const isAllValid = (data) => { // single data
    const validation = data[validationField];
    if (Array.isArray(validation)) {
        const errors = validation.filter(v => !v.valid);
        if (errors.length === 0) {
            return true;
        }
    }
    return false;
}

/** Returns a new array of valid data based on validationField */
const checkValidationsFromData = (data) => {
    const retval = { valid: [], invalid: [] };
    if (Array.isArray(data)) {
        data.forEach(d => {
            if (isAllValid(d)) {
                retval.valid.push(d);
            } else {
                retval.invalid.push(d);
            }
        });
    }
    return retval;
}

/** Filter out the datas that does not contain the required fields */
const filterForRequiredFields = (dataArray, requiredfields) => {
    const retval = [];
    dataArray.forEach(d => {
        if (existFields(d, requiredfields)) {
            retval.push(d);
        } else {
            logger.warn('Invalid', d);
        }
    });
    return retval;
}

/**
 * Gets the missing values for the field for the given dataArray from the searchItems
 * @param {*} dataArray 
 * @param {*} field 
 * @param {*} searchItems 
 */
const getMissingObjects = (dataArray, field, searchItems) => {
    if (!!dataArray.length) {
        // Get the distinct value from the given field for the data array
        const distinctValues = getDistinctValues(dataArray, field);
        // Loop through the distinct values to see if it exists on the searchItems array
        const missingValues = [];
        distinctValues.forEach(dv => {
            const item = searchItems.find(si => getLowerCaseSafeString(si.name) === getLowerCaseSafeString(dv));
            if (!item) {
                missingValues.push(dv);
            }
        })
        return missingValues;
    }
    return []
}

const createBrands = async (brands) => {
    try {
        const result = await saveBrands(brands);
        return result;
    } catch (err) {
        return []
    }
}

const createCategories = async (categories) => {
    try {
        const result = await saveCategories(categories);
        return result;
    } catch (err) {
        return []
    }
}

/** Generates a batch source id to keep track of import groups */
const generateBatchSourceId = () => {
    return Math.random().toString(36).substring(0, 10);
}

const importProducts = async (datas, userId) => {
    // Unique source id to indentify the batch import
    const batchSource = generateBatchSourceId();
    // Get reference data from database
    logger.info('Getting brands, categories and vendor information from database...');
    let [vendor, brands, categories] = await Promise.all([
        Vendor.findOne({ where: { userId: userId }}),
        getAllBrands(),
        getAllCategories()
    ]);
    
    const data = filterForRequiredFields(datas, requiredfields);
    const dataVariants = filterOnlyProductVariants(datas);
    const uniqueProducts = getUniqueValuesByField(datas, 'name');
    logger.info('Unique products', uniqueProducts.length);
    logger.info('Product variants', dataVariants.length);


    logger.info('Checking for missing brands and categories...');
    // Should check for non existing brands and create them
    const missingBrands = getMissingObjects(data, 'brand', brands);
    // Should check for non existing categories and create them
    const missingCategories = getMissingObjects(data, 'category', categories);
    logger.info('Missing brands on system', missingBrands);
    logger.info('Missing categories on system', missingCategories);

    // Should create the missing brands and categories
    if (missingBrands.length > 0) {
        logger.info('Creating missing brands...');
        await createBrands(missingBrands);
    }
    if (missingCategories.length > 0) {
        logger.info('Creating missing categories...');
        await createCategories(missingCategories);
    }
    
    // Refresh the data
    logger.info('Refreshing brands and categories...');
    [brands, categories] = await Promise.all([
        getAllBrands(), getAllCategories()
    ])
    
    logger.info('Assigning reference ids to brands and categories...');
    // Get reference ids for brands
    data.forEach(d => assignReferenceId(d, 'brand', brands));
    // Get reference ids for categories
    data.forEach(d => assignReferenceId(d, 'category', categories));
    
    const validatedData = checkValidationsFromData(uniqueProducts); // checkValidationsFromData(data);// validatedData.invalid will contain data that did not get the 

    // If entire data set is valid
    if (validatedData.invalid.length === 0) {
        // Just gets the valid data
        const checkedData = verifyImportDataFormat(validatedData.valid, vendor, batchSource);
        if (checkedData !== null) {
            try {
                const results = await Product.bulkCreate(checkedData, {
                    fields: savedFields, // IMPORTANT
                    returning: true
                });
                const pvResults = await processProductVariants(dataVariants, vendor, results, batchSource);
                const productDiscounts = await processProductDiscounts(results, checkedData);
                return { products: results, productItems: pvResults, productDiscounts };
            } catch (err) {
                logger.error({ error: err, batchSource: batchSource });
                // Try to rollback using batch source id to remove changes
                await rollBackProducts(batchSource);
                return Promise.reject({ error: 'Products data could not be formatted or invalid', validation: validatedData, err: err });
            }
        }
    }
    return Promise.reject({ error: 'Products data could not be formatted or invalid', validation: validatedData });
}

const rollBackProducts = (batchSource) => {
    if (batchSource) {
        return Product.destroy({
            where: {
                source: batchSource
            }
        });
    }
    return Promise.reject({ error: 'Cannot rollback without batch source id' })
}

const createProductItemObject = (data, vendor, source) => {
    return {
        'productId': null,
        'productColorId': null,
        'productSizeId': null,
        'stock': +data.stock,
        'model': data.code,
        'code': data.code,
        'sku': data.sku,
        ...vendor  && { vendor: +vendor.id },
        'unitCost': +data.cost,
        'unitPrice': +data.amount,
        'amount6': +data.halfDozen,
        'amount12': +data.dozen,
        'retailPrice': +data.amount,
        'statusId': 2,
        'source': source || IMPORT
    }
}

/**
 * Processes product variants (product items is how they are stored as)
 * @param {[*]} data Product variants
 * @param {*} vendor 
 * @param {[*]} importedProducts already saved products
 */
const processProductVariants = async (data, vendor, importedProducts, source) => {
    if (Array.isArray(data)) {
        const productItems = [];
        // For each of the product variants (product items) in data
        for (let n=0; n<data.length; ++n) {
            const d = data[n];
            // Find base product
            const baseProduct = searchParentProduct(d, importedProducts);
            if (baseProduct) {
                const productItem = createProductItemObject(d, vendor, source);
                productItem.productId = +baseProduct.id; // Assign the parent product
                // Need to create the productSize and productColor :facepalm:
                // Check the original data for color or size
                if (d.color) { // Create color if it does not exist
                    // Search if the color exists for the base color
                    const baseProductColors = await getProductColorByProductId(+baseProduct.id);
                    let color = null;
                    if (!!baseProductColors.length) {
                        color = baseProductColors.find(c => c.name === d.color); // If it already exists
                    }
                    if (!color) {
                        await createColor({ name: d.color, color: d.color });
                        color = await createProductColor({ productId: +baseProduct.id, name: d.color, color: d.color });
                    }
                    productItem.productColorId = +color.id;
                }
                if (d.size) { // Create size if it does not exist
                    const baseProductSizes = await getProductSizeByProductId(+baseProduct.id);
                    let size = null;
                    if (!!baseProductSizes.length) {
                        size = baseProductSizes.find(s => s.name === d.size);
                        if (!size) {
                            size = await createProductSize({ productId: +baseProduct.id, name: d.size });
                        }
                    } else {
                        size = await createProductSize({ productId: +baseProduct.id, name: d.size });
                    }
                    productItem.productSizeId = +size.id;
                }
                productItems.push(productItem);
            }
        };
        if (productItems.length > 0) {
            const results = await createProductItems(productItems);
            return results;
        }
    }
    return []
}

const searchParentProduct = (productVariant, products) => {
    if (productVariant && Array.isArray(products)) {
        // Will try to match the given matchFields and assume it is the parent
        return products.find(p => productVariant.name === p.name);
    }
    return null;
}

const createProductDiscountName = (percentage, minQty) => {
    if (percentage && minQty) {
        return `Compra ${minQty} unidades o más y recibe ${(percentage*100.0).toFixed(2)}% descuento`;
    }
    return '';
}

const createProductDiscount1Object = (data, productId) => {
    return {
        'productId': +productId,
        'price': (data.price) ? +data.price : null,
        'name': createProductDiscountName(data.discount1, data.discount1MinQty),
        'startDate': (data.startDate) ? data.startDate : null,
        'endDate': (data.endDate) ? (data.endDate) : new Date(9999, 11, 31),
        'minQuantity': +data.discount1MinQty,
        'percentage': +data.discount1,
    }
}

const createProductDiscount2Object = (data, productId) => {
    return {
        'productId': +productId,
        'price': (data.price) ? +data.price : null,
        'name': createProductDiscountName(data.discount2, data.discount2MinQty),
        'startDate': (data.startDate) ? data.startDate : null,
        'endDate': (data.endDate) ? (data.endDate) : new Date(9999, 11, 31),
        'minQuantity': +data.discount2MinQty,
        'percentage': +data.discount2,
    }
}

const processProductDiscounts = async (products, importData) => {
    for (let n=0; n<importData.length; ++n) {
        try {
            const foundProduct = searchParentProduct(importData[n], products);
            if (importData[n].discount1) {
                const discount1 = createProductDiscount1Object(importData[n], foundProduct.id);
                const result = await createProductDiscount(discount1);
            }
            if (importData[n].discount2) {
                const discount2 = createProductDiscount2Object(importData[n], foundProduct.id);
                const result = await createProductDiscount(discount2);
            }
        } catch (err) {
            console.error(err);
        }
    }
}

const getProductImagesKeys = (productImages) => {
    const keys = [];
    productImages.forEach(pi => {
        if (pi.img_url) {
            keys.push(pi.img_url);
        }
        if (pi.img_thumb_url) {
            keys.push(pi.img_thumb_url);
        }
    });
    return keys;
}

const deleteProduct = async (id) => {
    const product = await Product.findOne({
        where: { id: id },
        include: ['productImages','productVendor', 'productBrand', 'categories', 'productStatus', 'rates']
    });
    if (product) {
        if (product.productImages && product.productImages.length) {
            const imageKeys = getProductImagesKeys(product.productImages);
            try {
                const promises = [];
                imageKeys.forEach(imageKey => {
                    promises.push(imgStorageSvc.remove(imageKey))
                });
                promises.push(Product.destroy({ where: { id: product.id } }));
                await Promise.all(promises);
                return { status: true, message: "Product successfully deleted" };
            } catch (e) {
                return { status: false, message: "Product delete, but error on deleting image!", error: e.toString() };
            }
        } else {
            await Product.destroy({ where: { id: product.id } });
            return { status: true, message: "Product successfully deleted" };
        }
    }
    return { status: false, message: 'Product not found for deletion', notFound: true };
}

const searchProductByName = async (search, page = null, isFullDetail = false) => {
    const includes = isFullDetail ? MAIN_INCLUDES : MAIN_INCLUDES_LIGHT;

    const where = {
        [Op.or]: [
            {
                'name': {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                'sku': {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                'model': {
                    [Op.iLike]: `%${search}%`
                }
            }
        ]
    }

    if (page) {
        const offset = paginate(page);

        const countResult = await Product.count({ where });

        const result = await Product.findAll({
            where,
            include: includes,
            offset: offset,
            limit: LIMIT
        });

        const pages = Math.ceil(countResult / LIMIT)
        const results = {
            count: countResult,
            items: result,
            pages: pages
        }
        return results;
    } else {
        const product = await Product.findAll({ where, include: includes});
        return product;
    }
}

const searchProductByType = async (type, search, page = null, isFullDetail = false) => {
    const includes = isFullDetail ? MAIN_INCLUDES : MAIN_INCLUDES_LIGHT;

    const where = {
        [type]: search
    }
    
    let orderBy = [
        ['name', 'ASC']
    ]

    const parPage = Number(page);
    
    if (parPage) {
        const offset = paginate(parPage);

        const countResult = await  Product.count({ 
            where
        });

        const result = await Product.findAll({
            where,
            include: includes,
            offset: offset,
            order: orderBy,
            limit: LIMIT
        })

        const pages = Math.ceil(countResult / LIMIT)
        const results = {
            count: countResult,
            items: result,
            pages: pages
        }

        return results;
    } else {
        const product = await Product.findAll({ where, order: orderBy, include: includes});
        return product;
    }
}

const searchProductByIds = async (ids, page = null, isFullDetail = false) => {
    const includes = isFullDetail ? MAIN_INCLUDES : MAIN_INCLUDES_LIGHT;

    const where = {
        id: {
            [Op.in]: ids
        }
    }

    if (page) {
        const offset = paginate(page);

        const countResult = await Product.count({ where });

        const result = await Product.findAll({
            where,
            include: includes,
            offset: offset,
            limit: LIMIT
        });

        const pages = Math.ceil(countResult / LIMIT)
        const results = {
            count: countResult,
            items: result,
            pages: pages
        }
        return results;
    } else {
        const product = await Product.findAll({ where, include: includes});
        return product;
    }
}

const searchProductBySlugs = async (slugs, page = null, isFullDetail = false) => {
  const includes = isFullDetail ? MAIN_INCLUDES : MAIN_INCLUDES_LIGHT;

  const where = {
      slug: {
          [Op.in]: slugs
      }
  }

  if (page) {
      const offset = paginate(page);

      const countResult = await Product.count({ where });

      const result = await Product.findAll({
          where,
          include: includes,
          offset: offset,
          limit: LIMIT
      });

      const pages = Math.ceil(countResult / LIMIT)
      const results = {
          count: countResult,
          items: result,
          pages: pages
      }
      return results;
  } else {
      const product = await Product.findAll({ where, include: includes});
      return product;
  }
}

const searchProductById = async (id, isFullDetail = false) => {
    const includes = isFullDetail ? ['productProductDiscount','productBrand', 'productStatus', 'productImages', 'productProductItems', 'categories', 'subCategoryProduct'] : MAIN_INCLUDES_LIGHT;

    const where = {
        id: id
    }

    const product = await Product.findOne({ where, include: includes});
    return product;
}

const searchProductByIdFullDetail = async (id) => {
    const includes = MAIN_INCLUDES;

    const where = {
        id: id
    }

    const product = await Product.findOne({ where, include: includes});
    return product;
}

const searchProductByIdsFullDetail = async (ids) => {
    const includes = MAIN_INCLUDES;

    const where = {
        id: {
            [Op.in]: ids
        }
    }

    const product = await Product.findAll({ where, include: includes});
    return product;
}

const searchProductBySlug = async (id, isFullDetail = false) => {
  const includes = isFullDetail ? ['productProductDiscount','productBrand', 'productStatus', 'productImages', 'productProductItems', 'categories', 'subCategoryProduct'] : MAIN_INCLUDES_LIGHT;
  const where = {
      slug: id
  }

  const product = await Product.findOne({ where, include: includes});
  return product;
}

const getAllProducts = async (filter) => {
    const {page, isFullDetail} = filter;

    const includes = isFullDetail ? MAIN_INCLUDES_MEDIUM : MAIN_INCLUDES_LIGHT;

    let query = {
        include: includes
    }
    
    let orderBy = null;

    if (isFullDetail) {
        orderBy = [
            ['updatedAt', 'DESC'],
            ['createdAt', 'DESC'],
            ['productProductItems', 'updatedAt', 'DESC'],
            ['productProductItems', 'createdAt', 'DESC'],
            ['productImages', 'updatedAt', 'DESC'],
            ['productImages', 'createdAt', 'DESC'],
            ['productProductItems', 'prevRetailPrice', 'ASC NULLS LAST'],
        ]
    } else {
        orderBy = [
            ['createdAt', 'ASC'],
            ['productProductItems', 'prevRetailPrice', 'ASC NULLS LAST'],
        ]
    }

    if (page) {
        query = {
            ...query,
            limit: LIMIT,
            distinct: true,
            order: orderBy,
            offset: paginate(page),
        }
    }

    const product = await Product.findAndCountAll(query);
    return product;
}

module.exports = {
    importProducts,
    deleteProduct,
    searchProductByName,
    searchProductByType,
    searchProductByIds,
    searchProductById,
    getAllProducts,
    createManualProduct,
    searchProductByIdFullDetail,
    searchProductByIdsFullDetail,
    updateProduct,
    searchProductBySlug,
    searchProductBySlugs
}
