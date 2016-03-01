module.exports = require('cqrs-domain').defineEvent({
  name: 'salesInvoiceDeleted'
}, function (data, aggregate) {
  aggregate.destroy();
});