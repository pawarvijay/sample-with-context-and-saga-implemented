module.exports = require('cqrs-domain').defineCommand({
  name: 'createAccounting'
}, function (data, aggregate) {
  aggregate.apply('accountingCreated', data);
});