module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
    name: 'accountingCreated',
    aggregate: 'accounting',
    context: 'sales',
    id: 'payload.id'
}, function (data, vm) {

    var pg = require('pg');
    var conString = "postgres://postgres:passpass@localhost/cqrs";

    pg.connect(conString, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        client.query('insert into cqrs (data,iscancelled) values ($1,$2)',[data,'from accounting created'],  function(err, result) {

            done();

            if(err) {
                return console.error('error running query', err);
            }

            console.log(result);
        });
    });

});

/*
 module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
 // optional, default is file name without extension,
 // if name is '' it will handle all events that matches
 name: 'itemCreated',

 // optional
 aggregate: 'item',

 // optional
 context: 'manufactoring',

 // optional, default is 0
 version: 2,

 // optional, if not defined or not found it will generate a new viewmodel with new id
 id: 'payload.id',

 // optional, suppresses auto-creation of new view model if none matching the id can be found, default is true
 autoCreate: true,

 // optional, if not defined it will pass the whole event...
 payload: 'payload',

 // optional, default Infinity, all view-builders will be sorted by this value
 priority: 1
 }, 'create');*/
