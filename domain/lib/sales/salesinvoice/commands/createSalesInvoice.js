module.exports = require('cqrs-domain').defineCommand({
  name: 'createSalesInvoice'
}, function (data, aggregate) {
  aggregate.apply('salesInvoiceCreated', data);
});