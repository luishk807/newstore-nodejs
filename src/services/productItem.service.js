const ProductItem = require('../pg/models/ProductItems');
const s3 = require('./storage.service');
const config = require('../config');

const deleteProductItem = async (id) => {
    const productItem = await ProductItem.findOne({
        where: { id: id },
        include: ['productItemsStatus','productImages', 'productItemColor', 'productItemSize']
    });
    if (productItem) {
        const mapFiles = productItem.productItemImages.map(data => data.img_url);
        try {
            mapFiles.forEach(data => {
                s3.deleteObject({ Bucket: config.s3.bucketName, Key: data }, (err, data) => {
                    if (err) {
                        // res.status(500).send({status: false, message: err})
                    }
                })
            })
            await ProductItem.destroy({ where: { id: productItem.id } });
            return { status: true, message: "Product Item successfully deleted" };
        } catch (e) {
            return { status: false, message: "Product Item delete, but error on deleting image!", error: e.toString() };
        }
    }
    return { status: false, message: 'Product Item not found for deletion', notFound: true };
}

module.exports = {
    deleteProductItem
}
