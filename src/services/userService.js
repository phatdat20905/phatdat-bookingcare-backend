import { raw } from 'body-parser';
import db from '../models/index';
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    });
}

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let isExist = await checkUserEmail(email);
            if(isExist) {
                //user already exists
                let user = await db.User.findOne({
                    attributes: ['email', 'roleId', 'password', 'firstName', 'lastName'],
                    where: { email: email },
                    raw: true
                });
                if(user) {
                    //compare password
                    let check = await bcrypt.compareSync(password, user.password);
                    if(check) {
                        userData.errCode = 0;
                        userData.errMessage = 'OK';

                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = 'Password is incorrect. Please try again!';
                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = `User not found in your system. Please try again!`;
                }                
            }else {
                //return error
                userData.errCode = 1;
                userData.errMessage = `You's Email isn't exist in your system. Please try other email!`;
            } 
            resolve(userData);
        } catch (e) {
            reject(e);
        }
    });   
}

let checkUserEmail = (userEmail) => {
    // check if email is already in use
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            })
            if(user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    });
}

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
                if(userId === 'ALL'){
                    users = await db.User.findAll({
                        attributes: {
                            exclude: ['password']
                        },
                    });
                } 
                if(userId && userId !== 'ALL'){
                    users = await db.User.findOne({
                        where: { id : userId },
                        attributes: {
                            exclude: ['password']
                        },
                    })
                }
            resolve(users);
        } catch (e) {
            reject(e);
        }
    });
}

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            //check email is exists
            let check = await checkUserEmail(data.email);
            if(check) {
                resolve({
                    errCode: 1,
                    errMessage: 'Email already exists. Please use another email.'
                });
            }
            else{
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.avatar
                })
                resolve(
                {   
                    errCode: 0,
                    message: 'OK'
                });
            }
        } catch (e) {
            reject(e);
        }
    });
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId }
            })
            if(!user) {
                resolve({
                    errCode: 2,
                    message: `The use isn't exist.`
                });
            }
            await db.User.destroy({
                where: { id: userId }
            });
            resolve(
            {   
                errCode: 0,
                message: 'The use is deleted'
            });
        } catch (e) {
            reject(e);
        }
    });
}

let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!data.id || !data.roleId || !data.positionId || !data.gender){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing inputs parameters!'
                });
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            })
            if(!user) {
                resolve({
                    errCode: 2,
                    message: `The user isn't exist.`
                });
            }
            else{
                // await db.User.update(
                // {
                //     firstName: data.firstName,
                //     lastName: data.lastName,
                //     address: data.address,
                //     phonenumber: data.phonenumber,
                //     gender: data.gender,
                //     roleId: data.roleId,
                //     positionId: data.positionId,
                //     image: {data.avatar === null ? '' : data.avatar}
                // },
                // { where: { id: data.id } }
                // );
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.phonenumber = data.phonenumber;
                user.gender = data.gender;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                if(data.avatar){
                    user.image = data.avatar;
                }
                await user.save();
                resolve(
                {   
                    errCode: 0,
                    message: 'Update user success!'
                });
            }
        } catch (e) {
            reject(e);
        }
    });
}

let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!typeInput){
                resolve({
                    errCode: 1,
                    errMessage: 'Missing inputs parameters!'
                })
            }else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput },
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    handleUserLogin,
    getAllUsers,
    createNewUser,
    deleteUser,
    updateUserData,
    getAllCodeService
}