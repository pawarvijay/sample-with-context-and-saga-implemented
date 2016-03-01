var pg = require('pg');

module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
    name: 'salesInvoiceCreated',
    aggregate: 'salesinvoice',
    context: 'sales',
    id: 'payload.id'
}, function (data, vm) {

        console.log('IN CREATE SALES INVOICE VIEWBUILDER')

        var conString = "postgres://postgres:passpass@localhost/cqrs";

        pg.connect(conString, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }
            client.query('insert into cqrs (data,iscancelled,salesinvoiceid,narration,amount,text) values ($1,$2,$3,$4,$5,$6)',[data,data.iscancelled,data.header.salesinvoiceid ,data.header.narration,data.header.amount,data.header.text ],  function(err, result) {

                done();

                if(err) {
                    return console.error('error running query', err);
                }
                console.log('YOO CREATED',data,data.iscancelled,data.header.salesinvoiceid ,data.header.narration,data.header.amount,data.header.text )
                console.log(result);
            });
        });
});
