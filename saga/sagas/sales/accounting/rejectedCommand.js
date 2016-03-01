function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

module.exports = require('cqrs-saga').defineSaga({// event to match...
    name: 'rejectedCommand', // optional, default is file name without extension
    aggregate: 'accounting',
    context: 'sales',
    existing: false,
    payload: 'payload', // if not defined it will pass the whole event...
    id: 'payload.id', //if not defined it will generate an id
    priority: 1 // optional, default Infinity, all sagas will be sorted by this value
}, function (evt, saga, callback) {

    console.log('IN ACCOUNTING REJECTED COMMAND AGGREGATE');

    var cmd = {
        id:guid(), // if you don't pass an id it will generate one, when emitting the command...
        command: 'deleteSalesInvoice',
        context: {
            name: 'sales'
        },
        payload: {
            //id : '00008585858', //evt.command.payload.id
            salesinvoiceid : evt.command.payload.salesinvoiceid
        }
    };

    saga.addCommandToSend(cmd);
    saga.destroy();
    saga.commit(callback);

}).defineShouldHandle(function (evt, saga) {
        return evt.payload.command.command === 'createAccounting';
    });
