const ProductItems = require('../pg/models/ProductItems');
const ProductItemImages = require('../pg/models/ProductItemImages');
const Task = require('../utils/task');
const imgStoreSvc = require('../services/imageStorage.service');
const axios = require('axios');
const logger = global.logger;
const IMAGE_URL = process.env.IMAGE_URL;

class MissingThumbnailCreatorTask extends Task {
    constructor() {
        super('MissingThumbnailCreatorTask');
    }

    async execute() {
        logger.info(`Executing ${this.name} task`);
        const imagesMetaData = [];
        const allPi = await this.getAllProductItems();
        for (let n=0; n<allPi.length; ++n) {
            const pi = allPi[n];
            // Images exists
            if (pi.productImages) {
                // For each image, check if a thumbnail exists
                for (let m=0; m<pi.productImages.length; ++m) {
                    const image = pi.productImages[m];
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
                logger.info(`Processing product item images: ${im.id}, adding img_thumb_url: ${im.key}`);
                try {
                    const result = await ProductItemImages.update({ img_thumb_url: im.key }, { where: { id: im.id }, fields: ['img_thumb_url'] });
                    logger.info('Update result', result);
                    logger.info(`Product item images: ${im.id} updated`);
                } catch (error) {
                    logger.error('Error updating ProductItemImages', error);
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

    getAllProductItems() {
        return ProductItems.findAll({ include: ['productImages'], attributes: ['id'] });
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

module.exports = MissingThumbnailCreatorTask;
