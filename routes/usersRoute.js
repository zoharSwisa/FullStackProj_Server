const express = require('express');
const router = express.Router();
const User = require('../models/usersModel');
const UserDal = require('../dal/usersDal');
const PermissionsDal = require('../dal/permissionsDal');

router.route('/CreateUser').post(async function(req,resp)
{
    try
    {
        let dbUser = await User.find({ userName : req.body.userName});

        if (dbUser && dbUser.length > 0) {
            return resp.json({
                "isSuccessful" : false,
                "err" : "User already exists!"
            });
        }
        else {
            let user = {
                "userName" : req.body.userName,
                "firstName" : req.body.firstName,
                "lastName" : req.body.lastName,
                "sessionTimeOut" : req.body.sessionTimeOut,
                "permissions" : req.body.permissions,
            }
            
            let response = await saveUser(user);
            return resp.json(response);
        }
    }
    catch(err)
    {
        return resp.json({
            "isSuccessful" : false,
            "err" : "DB Failed: " + err
        });
    }
});

router.route('/Signin').get(async function(req,resp) {
    try{
        let userName = req.query.userName;
        let password = req.query.password;
        let dbUser = await User.find({ userName : userName, password: ''});

        if (dbUser && dbUser.length > 0) {
            let userId = dbUser[0]._id;
            dbUser.password = password;

            await User.findByIdAndUpdate(userId, {
                password: password
            })

            let response = await getUserDataFromFiles(userId, userName);
            
            return resp.json(response);
        }

        return resp.json({
            "isSuccessful" : false,
            "err" : "Incorrect UserName"
        });
    }
    catch (err)
    {
        return resp.json({
            "isSuccessful" : false,
            "err" : err
        });
    }
});

router.route('/Login').get(async function(req,resp) {
    try{
        let dbUser = await User.find({ userName : req.query.userName, password : req.query.password});

        if (dbUser && dbUser.length > 0) {
            userId = dbUser[0]._id;
            let response = await getUserDataFromFiles(userId, req.query.userName);

            return resp.json(response);
        }

        return resp.json({
            "isSuccessful" : false,
            "err" : "Incorrect UserName / Password"
        });
    }
    catch (err)
    {
        return resp.json({
            "isSuccessful" : false,
            "err" : err
        });
    }
});

router.route('/').get(async function(req,resp) {
    try{
        let dbUsers = await User.find({});

        if (dbUsers && dbUsers.length > 0) {
            let allUsers = await Promise.all(dbUsers.map(async (u) => {
                let result = await getUserDataFromFiles(u._id, u.userName);
                return result.user;
            }));

            return resp.json({
                "isSuccessful" : true,
                "users" : allUsers
            });
        }
        else 
        {
            return resp.json({
                "isSuccessful" : true,
                "users" : []
            });
        }
    }
    catch (err)
    {
        return resp.json({
            "isSuccessful" : false,
            "err" : err
        });
    }
});

router.route('/:id').delete(async function(req,resp) {
    try{
        // Delete from DB
        await User.findByIdAndDelete(req.params.id);

        // Delete from files
        let usersFromFile = await UserDal.readUsersFile();
        let users = usersFromFile.data.filter(u => u.id != req.params.id);
        await UserDal.writeToUsersFile({ "data" : users});

        let permissionsFromFile = await PermissionsDal.readPermissionsFile();
        let permissions = permissionsFromFile.data.filter(p => p.id != req.params.id);
        await PermissionsDal.writeToPermissionsFile({ "data" : permissions});

        return resp.json({
            "isSuccessful" : true
        });
    }
    catch (err)
    {
        return resp.json({
            "isSuccessful" : false,
            "err" : err
        });
    }
});

router.route('/:id').put(async function(req,resp) {
    try
    {
        // Update DB
        await User.findByIdAndUpdate(req.params.id,
            {
                userName : req.body.userName
            });
        
        // Update files
        let usersFromFile = await UserDal.readUsersFile();
        let users = usersFromFile.data.map(u => {
            if (u.id == req.params.id)
            {
                return {
                    "id":req.params.id,
                    "firstName" : req.body.firstName,
                    "lastName" : req.body.lastName,
                    "createdDate": u.createdDate,
                    "sessionTimeOut" : req.body.sessionTimeOut
                }
            }
            else
            {
                return u;
            }
        });

        await UserDal.writeToUsersFile({ "data" : users});

        let permissionsFromFile = await PermissionsDal.readPermissionsFile();
        let permissions = permissionsFromFile.data.map(u => {
            if (u.id == req.params.id)
            {
                return {
                    "id":req.params.id,
                    "permissions" : req.body.permissions
                }
            }
            else
            {
                return u;
            }
        });

        await PermissionsDal.writeToPermissionsFile({ "data" : permissions});

        return resp.json({
            "isSuccessful" : true
        });
    }
    catch(err)
    {
        return resp.json({
            "isSuccessful" : false,
            "err" : err
        });
    }
});

async function saveUser(newUser) {
    const dbUser = new User({
        userName : newUser.userName,
        password : ""
    });

    // Save user data to UsersDB
    try
    {
        await dbUser.save();

        let usersFromFile = await UserDal.readUsersFile();
        let users = usersFromFile.data;
        let fUser = {
            "id":dbUser._id,
            "firstName":newUser.firstName,
            "lastName":newUser.lastName,
            "createdDate": new Date(),
            "sessionTimeOut":newUser.sessionTimeOut
        }
        users.push(fUser);

        // Save user data to UsersFile
        await UserDal.writeToUsersFile({ "data" : users});

        let permissionsFromFile = await PermissionsDal.readPermissionsFile();
        let permissions = permissionsFromFile.data;
        let p = {
            "id":dbUser._id,
            "permissions":newUser.permissions
        }

        permissions.push(p);

        // Save user data to PermissionsFile
        await PermissionsDal.writeToPermissionsFile({ "data" : permissions});

        var user = {
            "id": dbUser._id,
            "firstName":newUser.firstName,
            "lastName":newUser.lastName,
            "userName": newUser.userName,
            "permissions":newUser.permissions,
            "createdDate": fUser.createdDate,
            "sessionTimeOut":newUser.sessionTimeOut
        };

        return {
            "isSuccessful" : true,
            "user" : user
        };
    }
    catch(err)
    {
        return {
            "isSuccessful" : false,
            "err" : err
        };
    }
}

async function getUserDataFromFiles(userId, userName)
{
    try{
        let usersFromFile = await UserDal.readUsersFile();
        let fileUser = usersFromFile.data.filter(u => u.id == userId)[0];

        let permissionsFromFile = await PermissionsDal.readPermissionsFile();
        let filePermission = permissionsFromFile.data.filter(p => p.id == userId)[0];
        
        let user = {
            "id": userId,
            "firstName": fileUser.firstName,
            "lastName": fileUser.lastName,
            "userName": userName,
            "permissions":filePermission.permissions,
            "createdDate": fileUser.createdDate,
            "sessionTimeOut":fileUser.sessionTimeOut
        };

        return {
            "isSuccessful" : true,
            "user" : user
        };
    }
    catch(err) {
        return {
            "isSuccessful" : false,
            "err" : err
        };
    }
}

module.exports = router; 