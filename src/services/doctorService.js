import db from "../models/index";
require('dotenv').config();
import _ from "lodash";
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
           let users = await db.User.findAll({
            limit: limitInput,
            where: { roleId: 'R2'},
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['password'] },
            include: [
                { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']},
                { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi']},
            ],
            raw: true,
            nest: true
        })
            resolve({
                errCode: 0,
                data: users
            })
        } catch (error) {
            reject(error);
        }
    });
}

let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: {roleId: 'R2'},
                attributes: { exclude: ['password', 'image'] },
            })
            resolve({
                errCode: 0,
                data: doctors
            })
        } catch (error) {
            reject(error);
        }
    });
}

let saveDetailInforDoctor = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!inputData.doctorId 
                || !inputData.contentHTML 
                || !inputData.contentMarkdown || !inputData.action
                || !inputData.selectedPrice || !inputData.selectedPayment
                || !inputData.selectedProvince
                || !inputData.nameClinic || !inputData.addressClinic
                || !inputData.note
            ){
                resolve({
                    errCode: 1,
                    message: 'Missing parameter'
                })
            }else {

                // upsert to Markdown
                if(inputData.action === 'CREATE'){
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId
                    })
                } else if(inputData.action === 'EDIT'){
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false
                    })
                    if(doctorMarkdown){
                        doctorMarkdown.contentHTML = inputData.contentHTML;
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
                        doctorMarkdown.description = inputData.description;
                        doctorMarkdown.updateAt = new Date();
                        await doctorMarkdown.save();
                    }
                }

                // upsert to doctor_infor table
                let doctorInfor = await db.Doctor_Infor.findOne({
                    where: { 
                        doctorId: inputData.doctorId 
                    },
                    raw: false
                })
                if(doctorInfor){
                  //update 
                  doctorInfor.doctorId = inputData.doctorId;
                  doctorInfor.priceId = inputData.selectedPrice;
                  doctorInfor.paymentId = inputData.selectedPayment;
                  doctorInfor.provinceId = inputData.selectedProvince;
                  doctorInfor.nameClinic = inputData.nameClinic;
                  doctorInfor.addressClinic = inputData.addressClinic;
                  doctorInfor.note = inputData.note; 
                  await doctorInfor.save(); 
                } else {
                    //create new
                  await db.Doctor_Infor.create({
                    doctorId: inputData.doctorId,
                    priceId: inputData.selectedPrice,
                    paymentId: inputData.selectedPayment,
                    provinceId: inputData.selectedProvince,
                    nameClinic: inputData.nameClinic,
                    addressClinic: inputData.addressClinic,
                    note: inputData.note,
                  })
                }
                resolve({
                    errCode: 0,
                    message: 'Save information doctor success'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getDetailDoctorById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!inputId) {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameter'
                })
            }
            else {
                let data= await db.User.findOne({
                    where: {id: inputId},
                    attributes: { exclude: ['password'] },
                    include: [                        
                        {
                            model: db.Markdown,
                            attributes: ['contentHTML', 'contentMarkdown', 'description']
                        },
                        {model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']}
                    ],
                    raw: false,
                    nest: true
                })
                if(data && data.image){
                    data.image = Buffer.from(data.image, 'base64').toString('binary');
                }
                if(!data){
                    data = {};
                }
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e);
        }

    })
}

let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!data.arrSchedule || !data.doctorId || !data.formatedDate){
                resolve({
                    errCode: 1,
                    message: 'Missing required parameter'
                })
            } else {
                let schedule = data.arrSchedule;
                if(schedule && schedule.length > 0){
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }

                let existing = await db.Schedule.findAll({
                    where: { doctorId: data.doctorId, date: data.formatedDate },
                    attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                    raw: true
                })

                //compare different
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;
                })

                //create data
                if(toCreate && toCreate.length > 0){
                    await db.Schedule.bulkCreate(toCreate);
                }
                
                resolve({
                    errCode: 0,
                    message: 'OK'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getScheduleByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!doctorId ||!date){
                resolve({
                    errCode: 1,
                    message: 'Missing required parameter'
                })
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: { 
                        doctorId: doctorId, 
                        date: date 
                    },
                    include: [
                        {model: db.Allcode, as: 'timeTypeData', attributes: ['valueEn', 'valueVi']}
                    ],
                    raw: false,
                    nest: true
                })
                
                if(!dataSchedule) dataSchedule = [];
                
                resolve({
                    errCode: 0,
                    data: dataSchedule
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    getTopDoctorHome,
    getAllDoctors,
    saveDetailInforDoctor,
    getDetailDoctorById,
    bulkCreateSchedule,
    getScheduleByDate
}