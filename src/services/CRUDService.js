import bcrypt from 'bcryptjs';
import db from '../models/index';
import { where } from 'sequelize';
import { raw } from 'body-parser';
const salt = bcrypt.genSaltSync(10);
let createNewUser = async (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            let hashPasswordFromBcrypt = await hashUserPassword(data.password);
            await db.User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phonenumber: data.phonenumber,
                gender: data.gender === '1' ? true : false,
                roleId: data.roleId,
            })
            resolve('ok created successfully');
        } catch (e) {
            reject(e);
        }
    });
    
    console.log(data);
    console.log(hashPasswordFromBcrypt);
}

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

let getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                raw: true,
            });
            resolve(users);
        } catch (e) {
            reject(e);
        }
    });
}

let getUserInfoById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: {id : userId},
                raw: false
            });
            if(user){
                resolve(user);
            }
            else{
                resolve({});
            }
        } catch (e) {
            reject(e);
        }
    });
}

let updateUserData = (data) => {
   return new Promise(async (resolve, reject) => {
    try {
        let [updated] = await db.User.update(
            {
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address
            },
            {
                where: {id : data.id}
            }
        );

        if(updated){
            let allUsers = await db.User.findAll();
            resolve(allUsers);
        } else {
            resolve('User not found');
        }
    } catch (e) {
        reject(e);
    }
    }); 
}

let deleteUserById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: {id : userId}
            })
            if(user){
                await user.destroy();
                let allUsers = await db.User.findAll();
                resolve(allUsers);
            } else {
                resolve('User not found');
            }
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    createNewUser,
    getAllUser,
    getUserInfoById,
    updateUserData,
    deleteUserById
}