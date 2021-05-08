const config = require('../config');
const s3 = require('./storage.service');
const uuid = require('uuid');
const imageThumbnail = require("image-thumbnail");
const THUMB_SUFFIX = '__thumb';
const THUMB_WIDTH = 150;
const logger = global.logger;

const getS3Params = (file, options) => {
    let myFile = file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const extraSuffix = options ? options.suffix ? options.suffix : '' : '';
    const fileName = `${uuid.v4()}${extraSuffix}.${fileType}`;
    const params = {
        Bucket: config.s3.bucketName,
        Key: fileName,
        Body: options ? options.anotherBuffer ? options.anotherBuffer : file.buffer : file.buffer
    }
    return params;
}

/** Uploads a file our storage service */
const upload = (file, options) => {
    const params = getS3Params(file, options);
    return s3.upload(params).promise();
}

const getThumbnailBuffer = async (file) => {
    try {
        return await imageThumbnail(file.buffer, {
            width: THUMB_WIDTH
        });
    } catch (error) {
        logger.error(`Error creating thumbnail for ${file.originalname}`, error);
    }
    return null;
}

const uploadAndCreateThumbnail = async (file) => {
    const [data, thumbnail] = await Promise.all([
        upload(file, {}),
        upload(file, { suffix: THUMB_SUFFIX, anotherBuffer: await getThumbnailBuffer(file) })
    ])
    return { image: data, thumbnail }
}

const remove = (fileKey) => {
    return s3.deleteObject({ Bucket: config.s3.bucketName, Key: fileKey }).promise()
}

/** Upload the image and the thumbnail created */
const uploadImages = async (files) => {
    const imgsUploads = [];
    for (let n=0; n<files.length; ++n) {
      try {
        const result = await uploadAndCreateThumbnail(files[n]);
        imgsUploads.push(result);
      } catch (error) {
        return { error }
      }
    }
    return { images: imgsUploads }
}

module.exports = {
    upload,
    uploadAndCreateThumbnail,
    remove,
    uploadImages
}
