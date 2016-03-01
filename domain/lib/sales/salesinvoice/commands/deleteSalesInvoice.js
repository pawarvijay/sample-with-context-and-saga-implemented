module.exports = require('cqrs-domain').defineCommand({
  name: 'deleteSalesInvoice'
}, function (data, aggregate) {
  aggregate.apply('salesInvoiceDeleted', data);
});