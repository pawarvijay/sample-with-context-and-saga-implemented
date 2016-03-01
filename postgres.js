/**
 * Created with JetBrains WebStorm.
 * User: vijay
 * Date: 29/2/16
 * Time: 11:22 AM
 * To change this template use File | Settings | File Templates.
 */

var pg = require('pg');
var conString = 'postgres://postgres:passpass@127.0.0.1:5432/';
var _ = require('lodash');

var executeQueryWithParameters = function(dbName, query, params, callback){
    getConnection(dbName, function(error, client, done){
        if(error){
            callback(error);
            return;
        }
        console.log("Got connection for executing query");
        client.query(query, params,function(err, result) {
            done();
            console.log("client.query result : " + err);
            if(err) {
                callback(err);

                return console.error('error running query', err);
            }
            else{
                var r = {};
                r.data = result.rows;
                callback(null,r);
            }
        });
    });
};

exports.executeQueryWithParameters = executeQueryWithParameters;


var getConnection =  function(dbName, callback){
    console.log("Establishing connection with postgre");
    pg.connect(conString + dbName, callback);
};

module.exports.getConnection = getConnection;


