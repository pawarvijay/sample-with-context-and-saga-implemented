var pg = require('pg');

module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
    name: 'salesInvoiceDeleted',
    aggregate: 'salesinvoice',
    context: 'sales',
    id: 'payload.id'
}, function (data, vm) {

       console.log('IN DELETE SALES INVOICE VIEWBUILDER')

        var conString = "postgres://postgres:passpass@localhost/cqrs";

        pg.connect(conString, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }
            client.query("update cqrs set iscancelled = 'yes' where salesinvoiceid = $1",[data.salesinvoiceid],  function(err, result) {

                done();

                if(err) {
                    return console.error('error running query', err);
                }
                console.log('YOO DELETED ID' + data.salesinvoiceid)
                console.log(result);
            });
        });

});