const jsonfile = require('jsonfile');

const fileName = __dirname + "/Users.json";
exports.readUsersFile = function()
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

exports.writeToUsersFile = function(users)
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