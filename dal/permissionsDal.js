const jsonfile = require('jsonfile');

const fileName = __dirname + "/Permissions.json";
exports.readPermissionsFile = function()
{
    return new Promise((resolve,reject) =>
    {
        jsonfile.readFile(fileName, function(err,data)
        {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(data);
            }
        });
    });
}

exports.writeToPermissionsFile = function(users)
{
    return new Promise((resolve,reject) =>
    {
        jsonfile.writeFile(fileName, users, function(err,data)
        {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(data);
            }
        });
    });
}