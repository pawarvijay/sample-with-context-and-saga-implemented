module.exports = require('cqrs-domain').defineEvent({
  name: 'salesInvoiceCreated'
},
function (data, aggregate) {
  aggregate.set(data);
});