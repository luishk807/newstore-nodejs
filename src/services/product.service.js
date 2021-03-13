const Product = require('../pg/models/Products');
const { saveBrands, getAllBrands } = require('../services/brand.service');
const { saveCategories, getAllCategories } = require('../services/category.service');
const { createProductColor } = require('../services/productColor.service');
const { createProductSize } = require('../services/productSize.service');
const { createProductItems } = require('../services/productItem.service');
const config = require('../config');
const Vendor = require('../pg/models/Vendors');
const s3 = require('./storage.service');
const { safeString, getLowerCaseSafeString } = require('../utils/string.utils');
const { getDistinctValues } = require('../utils')
const validationField = '__validation__';
const requiredfields = [
    'name',
    'stock',
    'amount',
    // 'category', // Commenting out because there are inputs without category
    // 'brand', // Commenting out because there are inputs without brand
    'sku',
    'code',
    'description'
];
const IMPORT = 'IMPORT';
/** Only these fields will be used to save on the database */
const savedFields = requiredfields.concat(['status', 'vendor', 'source']);

/** Returns a boolean indicating if all provided fields exists */
const existFields = (obj, fields) => {
    if (obj) {
        for (let n = 0; n < fields.length; ++n) {
            if (!obj[fields[n]]) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

/** Creates a new product object with the given data */
const createProductObject = (data, vendor) => {
    return {
        'name': data.name,
        'stock': +data.stock,
        'amount': +data.amount,
        'category': data.category,
        'brand': data.brand,
        'sku': data.sku,
        'code': data.code,
        'description': data.description,
        ...vendor  && { vendor: +vendor.id },
        ...data['status'] && { statusId: data.status },
        'source': IMPORT // This is to indicate that the source of input was from an IMPORT
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
const verifyImportDataFormat = (data, vendor) => {
    if (Array.isArray(data)) {
        const products = [];
        data.forEach((d) => {
            products.push(createProductObject(d, vendor));
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

const importProducts = async (datas, userId) => {
    // Get reference data from database
    logger.info('Getting brands, categories and vendor information from database...');
    let [vendor, brands, categories] = await Promise.all([
        Vendor.findOne({ where: { userId: userId }}),
        getAllBrands(),
        getAllCategories()
    ]);
    
    const data = filterForRequiredFields(datas, requiredfields);
    const dataVariants = filterOnlyProductVariants(datas);

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
    
    const validatedData = checkValidationsFromData(data);// validatedData.invalid will contain data that did not get the 

    // If entire data set is valid
    if (validatedData.invalid.length === 0) {
        // Just gets the valid data
        const checkedData = verifyImportDataFormat(validatedData.valid, vendor);
        if (checkedData !== null) {
            /**
             * For Sequelize#bulkCreate to work on PostgreSQL we need to specifiy the fields option, so we restrict the fields to the one's we want without having id field in it.
             * So basically, the query that it generates when using bulkCreate will generate an error because the id is being set to auto generated.
             * For example the query below, if ran directly on PostgreSQL, it fails asking you to use OVERRIDING SYSTEM VALUE, but there is no way for you to put it.
             * INSERT INTO "products" ("id","name","amount","categoryId","brandId","stock","description","model","code","createdAt","updatedAt") 
             * VALUES 
             * (DEFAULT,'pp laptop',100,1,16,1,'Laptop from great PP brand','pp0001','12345678','2020-11-29 01:40:04.918 +00:00','2020-11-29 01:40:04.918 +00:00'),
             * (DEFAULT,'Apple',0.5,1,16,3,'2 apple from the mountains where bigfoot lives','cfa001','12345677','2020-11-29 01:40:04.918 +00:00','2020-11-29 01:40:04.918 +00:00')
             * RETURNING "id","name","amount","categoryId","brandId","vendorId","statusId","image","stock","description","model","code","createdAt","updatedAt";
             * 
             * If you change the above query to the one below, by adding OVERRIDING SYSTEM VALUE before VALUES, then it works, but there is no way to do it in Sequelize.
             * INSERT INTO "products" ("id","name","amount","categoryId","brandId","stock","description","model","code","createdAt","updatedAt") 
             * OVERRIDING SYSTEM VALUE
             * VALUES 
             * (DEFAULT,'pp laptop',100,1,16,1,'Laptop from great PP brand','pp0001','12345678','2020-11-29 01:40:04.918 +00:00','2020-11-29 01:40:04.918 +00:00'),
             * (DEFAULT,'Apple',0.5,1,16,3,'2 apple from the mountains where bigfoot lives','cfa001','12345677','2020-11-29 01:40:04.918 +00:00','2020-11-29 01:40:04.918 +00:00')
             * RETURNING "id","name","amount","categoryId","brandId","vendorId","statusId","image","stock","description","model","code","createdAt","updatedAt";
             * 
             * So the only way to make it work for tables that have auto generated ids is to restrict the bulkCreate to specific fields.
             */
            const results = await Product.bulkCreate(checkedData, {
                fields: savedFields, // IMPORTANT
                returning: true
            });
            // Shall it have the same concept of you have to at least have a single product item even you don't have size/color?
            const pvResults = await processProductVariants(dataVariants, vendor, results);
            return { products: results, productItems: pvResults };
        }
    }
    return Promise.reject({ error: 'Products data could not be formatted or invalid', validation: validatedData });
}

const createProductItemObject = (data, vendor) => {
    return {
        'productId': null,
        'productColorId': null,
        'productSizeId': null,
        'stock': +data.stock,
        'model': data.model,
        'code': data.code,
        'sku': data.sku,
        ...vendor  && { vendor: +vendor.id },
        'unitCost': +data.cost,
        'unitPrice': +data.amount,
        'amount6': +data.halfDozen,
        'amount12': +data.dozen,
        'retailPrice': +data.amount,
        'statusId': 1,
        'source': IMPORT
    }
}

/**
 * Processes product variants (product items is how they are stored as)
 * @param {[*]} data Product variants
 * @param {*} vendor 
 * @param {[*]} importedProducts
 */
const processProductVariants = async (data, vendor, importedProducts) => {
    if (Array.isArray(data)) {
        const productItems = [];
        for (let n=0; n<data.length; ++n) {
            const d = data[n];
            // Find base product
            const baseProduct = searchParentProduct(d, importedProducts);
            if (baseProduct) {
                const productItem = createProductItemObject(d, vendor);
                productItem.productId = +baseProduct.id; // Assign the parent product
                // Need to create the productSize and productColor :facepalm:
                // Check the original data for color or size
                if (d.color) { // Create color
                    const color = await createProductColor({ productId: +baseProduct.id, name: d.color, color: d.color });
                    productItem.productColorId = +color.id;
                }
                if (d.size) { // Create size
                    const size = await createProductSize({ productId: +baseProduct.id, name: d.size });
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

const deleteProduct = async (id) => {
    const product = await Product.findOne({
        where: { id: id },
        include: ['productImages','productVendor', 'productBrand', 'categories', 'productStatus', 'rates']
    });
    if (product) {
        if (product.productImages && product.productImages.length) {
            const mapFiles = product.productImages.map(data => data.img_url);
            try {
                mapFiles.forEach(data => {
                    s3.deleteObject({ Bucket: config.s3.bucketName, Key: data }, (err, data) => {
                        if (err) {
                            // res.status(500).send({status: false, message: err})
                        }
                    })
                })
                await Product.destroy({ where: { id: product.id } });
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

module.exports = {
    importProducts,
    deleteProduct
}
