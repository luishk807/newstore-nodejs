
const User = require('../pg/models/Users');
const bcrypt = require('bcryptjs');
const s3 = require('../services/storage.service');
const config = require('../config');
const uuid = require('uuid');
const aw3Bucket = `${config.s3.bucketName}/users`;

const deleteById = async (id) => {
    const user = await User.findOne({ where: { id: id }, include: [ 'user_addresses' ] });
    if (user) {
        const userImage = user.img;
        const deletedUser = await User.destroy({ where: { id: user.id } });
        if (deletedUser) {
            const result = await deleteFromStorage(userImage);
            if (result.status) {
                return { status: true, message: "User successfully deleted" };
            } else {
                return { status: false, message: "User deleted, but error on deleting image!", error: err.toString() }
            }
        }
    }
    return { status: false, message: "User does not exist", notFound: true };
}

const deleteFromStorage = async (fileKey) => {
    if (fileKey) {
        try {
            await s3.deleteObject({ Bucket: aw3Bucket, Key: fileKey });
            return { status: true };
        } catch (err) {
            return { status: false, message: "Error on deleting image", error: err.toString() }
        }
    }
    return { status: false, message: "No file key has been provided to delete from storage" }
}

const findById = async(id) => {
    return await User.findOne({where:{id: id}});
}

const create = async (user, file) => {
    const count = await User.count({ where: { email: user.email } } );
    if (count) {
        return { status: false, message: 'Email already registered' };
    } else {
        const hash = await bcrypt.hash(user.password, 10);
        const userRole = user.userRole ? user.userRole : 2;
        const dataEntry = {
            last_name: user.last_name,
            first_name: user.first_name,
            password: hash,
            date_of_birth: user.date_of_birth,
            phone: user.phone,
            gender: user.gender,
            mobile: user.mobile,
            email: user.email,
            userRole: userRole
        }

        let fileName = null;
        if (file) {
            const myFile = file.originalname.split('.');
            const fileType = myFile[myFile.length - 1];
            fileName = `${uuid.v4()}.${fileType}`;
          
            try {
                await s3.upload({ Bucket: aw3Bucket, Key: fileName, Body: file.buffer });
                dataEntry.img = fileName;
            } catch (err) {
                logger.error("Error uploading image", err);
                return { status: false, message: "Error uploading image" };
            }
        }

        try {
            await User.create(dataEntry);
            return { status: true, message: "User succesfully created" };
        } catch (err) {
            logger.error("Error creating user", err);
            // Deleting the previously uploaded/stored file because of user creation failure
            const result = await deleteFromStorage(fileName);
            if (!result.status) {
                logger.error(`Error deleting ${fileName} from storage`, result);
            }
            return { status: false, message: "Error creating user", error: err };
        }
    }
}

module.exports = {
    findById,
    deleteById,
    create
}
