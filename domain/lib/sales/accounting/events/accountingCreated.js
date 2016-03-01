module.exports = require('cqrs-domain').defineEvent({
  name: 'accountingCreated'
},
function (data, aggregate) {
  aggregate.set(data);
});