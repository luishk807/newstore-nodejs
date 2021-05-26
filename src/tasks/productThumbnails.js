const Products = require('../pg/models/Products');
const ProductImages = require('../pg/models/ProductImages');
const Task = require('../utils/task');
const imgStoreSvc = require('../services/imageStorage.service');
const axios = require('axios');
const logger = global.logger;
const IMAGE_URL = process.env.IMAGE_URL;

class MissingProductThumbnailCreatorTask extends Task {
    constructor() {
        super('MissingThumbnailCreatorTask');
    }

    async execute() {
        logger.info(`Executing ${this.name} task`);
        const imagesMetaData = [];
        const allP = await this.getAllProducts();
        for (let n=0; n<allP.length; ++n) {
            const p = allP[n];
            // Images exists
            if (p.productImages) {
                // For each image, check if a thumbnail exists
                for (let m=0; m<p.productImages.length; ++m) {
                    const image = p.productImages[m];
                    // If there is an image for this product
                    if (image.img_url) {
                        // Check if a thumbnail is available
                        if (!image.img_thumb_url) {
                            // Create a thumbnail
                            const imgUrl = `${IMAGE_URL}/${image.img_url}`;
                            logger.debug(`Image url: ${imgUrl}`);
                            const storedData = await this.createThumbnail(imgUrl, image.img_url);
                            // console.log('storedData', storedData);
                            imagesMetaData.push(
                                this.createImageMetadataObject(image.id, storedData.Key)
                            )

                        }
                    }
                }
            }
        }
        // Proceed with updating the database
        for (let n=0; n<imagesMetaData.length; ++n) {
            const im = imagesMetaData[n];
            if (im.id && im.key) {
                logger.info(`Processing product images: ${im.id}, adding img_thumb_url: ${im.key}`);
                try {
                    const result = await ProductImages.update({ img_thumb_url: im.key }, { where: { id: im.id }, fields: ['img_thumb_url'] });
                    logger.info('Update result', result);
                    logger.info(`Product images: ${im.id} updated`);
                } catch (error) {
                    logger.error('Error updating ProductImages', error);
                }
            }
        }
        logger.info(`Finished task`);
    }

    createImageMetadataObject(id, imageKey) {
        return {
            id: id,
            key: imageKey
        }
    }

    getAllProducts() {
        return Products.findAll({ include: ['productImages'], attributes: ['id'] });
    }

    async getImageBuffer(url) {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, "utf-8");
        return buffer;
    }

    async createThumbnail(url, filename) {
        if (url) {
            const buffer = await this.getImageBuffer(url);
            const thumbnailBuffer = await imgStoreSvc.getThumbnailBufferRaw(buffer);
            const data = await imgStoreSvc.uploadAsThumbnail(filename, thumbnailBuffer);
            return data;
        }
        return null;
    }
}

module.exports = MissingProductThumbnailCreatorTask;
