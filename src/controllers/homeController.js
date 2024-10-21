import db from '../models/index';
import CRUDService from '../services/CRUDService';
let getHomePage = (req, res) => {
    return res.render('homepage.ejs');
}

let getCRUD = (req, res) => {
    return res.render('crud.ejs');
}

let postCRUD = async (req, res) => {
    let massage = await CRUDService.createNewUser(req.body);
    console.log(massage);
    return res.send('POST CRUD');
}

let displayGetCRUD = async (req, res) => {
    let data = await CRUDService.getAllUser();
    console.log(data);
    return res.render('displayCRUD.ejs',{
        dataTable: data
    });
}

let getEditCRUD = async (req, res) => {
    let userId = req.query.id;
    if(userId){
        let userData = await CRUDService.getUserInfoById(userId);
        //check user data not found
        return res.render("editCRUD.ejs", {
            user: userData
        });
    }
    else {
        return res.send('User ID not found');
    }
}

let putCRUD = async (req, res) => {
    let data = req.body;
    let allUsers = await CRUDService.updateUserData(data);
    return res.render('displayCRUD.ejs',{
        dataTable: allUsers
    });
}

let deleteCRUD = async (req, res) => {
    let userId = req.query.id;
    if(userId){
        let allUsers = await CRUDService.deleteUserById(userId);
        return res.render('displayCRUD.ejs',{
            dataTable: allUsers
        });
    }
    else {
        return res.send('User ID not found');
    }
}

module.exports = {
    getHomePage,
    getCRUD,
    postCRUD,
    displayGetCRUD,
    getEditCRUD,
    putCRUD,
    deleteCRUD
}