// server.js is the starting point of the domain process:
//
// `node server.js`
var colors = require('../colors')
    , msgbus = require('../msgbus');


var domain = require('cqrs-domain')({
    // the path to the "working directory"
    // can be structured like
    // [set 1](https://github.com/adrai/node-cqrs-domain/tree/master/test/integration/fixture/set1) or
    // [set 2](https://github.com/adrai/node-cqrs-domain/tree/master/test/integration/fixture/set2)
    domainPath: __dirname + '/lib',

    // optional, default is 'commandRejected'
    // will be used if an error occurs and an event should be generated
    commandRejectedEventName: 'rejectedCommand',

    // optional, default is 800
    // if using in scaled systems and not guaranteeing that each command for an aggregate instance
    // dispatches to the same worker process, this module tries to catch the concurrency issues and
    // retries to handle the command after a timeout between 0 and the defined value
    retryOnConcurrencyTimeout: 1000,

    // optional, default is 100
    // global snapshot threshold value for all aggregates
    // defines the amount of loaded events, if there are more events to load, it will do a snapshot, so next loading is faster
    // an individual snapshot threshold defining algorithm can be defined per aggregate (scroll down)
    snapshotThreshold: 2,

    // optional, default is in-memory
    // currently supports: mongodb, redis, tingodb, azuretable and inmemory
    // hint: [eventstore](https://github.com/adrai/node-eventstore#provide-implementation-for-storage)
    eventStore: {
        type: 'mongodb',
        host: 'localhost',                          // optional
        port: 27017,                                // optional
        dbName: 'domain',                           // optional
        eventsCollectionName: 'events',             // optional
        snapshotsCollectionName: 'snapshots',       // optional
        transactionsCollectionName: 'transactions', // optional
        timeout: 10000                              // optional
        // authSource: 'authedicationDatabase',        // optional
        // username: 'technicalDbUser',                // optional
        // password: 'secret'                          // optional
    },

    // optional, default is in-memory
    // currently supports: mongodb, redis, tingodb, couchdb, azuretable and inmemory
    // hint settings like: [eventstore](https://github.com/adrai/node-eventstore#provide-implementation-for-storage)
    aggregateLock: {
        type: 'redis',
        host: 'localhost',                          // optional
        port: 6379,                                 // optional
        db: 0,                                      // optional
        prefix: 'domain_aggregate_lock',            // optional
        timeout: 10000                              // optional
        // password: 'secret'                          // optional
    },

    // optional, default is not set
    // checks if command was already seen in the last time -> ttl
    // currently supports: mongodb, redis, tingodb and inmemory
    // hint settings like: [eventstore](https://github.com/adrai/node-eventstore#provide-implementation-for-storage)
    deduplication: {
        type: 'redis',
        ttl: 1000 * 1, // 1 hour          // optional
        host: 'localhost',                          // optional
        port: 6379,                                 // optional
        db: 0,                                      // optional
        prefix: 'BUMPER_lock',            // optional
        timeout: 10000                              // optional
        // password: 'secret'                          // optional
    }
});

domain.defineCommand({
    // optional, default is 'id'
    id: 'id',

    // optional, default is 'name'
    name: 'command',

    // optional, default is 'aggregate.id'
    // if an aggregate id is not defined in the command, the command handler will create a new aggregate instance
    aggregateId: 'payload.id',

    // optional, only makes sense if contexts are defined in the 'domainPath' structure
    context: 'context.name',

    // optional, only makes sense if aggregates with names are defined in the 'domainPath' structure
    aggregate: 'aggregate.name',

    // optional, but recommended
    payload: 'payload',

    // optional, if defined the command handler will check if the command can be handled
    // if you want the command to be handled in a secure/transactional way pass a revision value that matches the current aggregate revision
    revision: 'head.revision',

    // optional, if defined the command handler will search for a handle that matches command name and version number
    version: 'version',

    // optional, if defined theses values will be copied to the event (can be used to transport information like userId, etc..)
    meta: 'meta'
});

domain.defineEvent({
    // optional, default is 'correlationId'
    // will use the command id as correlationId, so you can match it in the sender
    correlationId: 'correlationId',

    // optional, default is 'id'
    id: 'id',

    // optional, default is 'name'
    name: 'event',

    // optional, default is 'aggregate.id'
    aggregateId: 'payload.id',

    // optional, only makes sense if contexts are defined in the 'domainPath' structure
    context: 'context.name',

    // optional, only makes sense if aggregates with names are defined in the 'domainPath' structure
    aggregate: 'aggregate.name',

    // optional, default is 'payload'
    payload: 'payload',

    // optional, default is 'revision'
    // will represent the aggregate revision, can be used in next command
    revision: 'head.revision',

    // optional
    version: 'version',

    // optional, if defined the values of the command will be copied to the event (can be used to transport information like userId, etc..)
    meta: 'meta',

    // optional, if defined the commit date of the eventstore will be saved in this value
    commitStamp: 'commitStamp'
});

domain.init(function(err) {
    if (err) {
        return console.log(err);
    }

    console.log(domain.getInfo());
    // on receiving a message (__=command__) from msgbus pass it to
    // the domain calling the handle function
    msgbus.onCommand(function(cmd) {
        console.log(colors.blue('\ndomain -- received command ' + cmd.command + ' from redis:'));
        console.log(cmd);

        console.log(colors.cyan('\n-> handle command ' + cmd.command));

        domain.handle(cmd,function(err){
            if(err)
            {
                console.log(colors.red('YOO ERROR FROM DOMAIN : '+err))
            }
        });
    });

    // on receiving a message (__=event) from domain pass it to the msgbus
    domain.onEvent(function(evt) {
        console.log('domain: ' + evt.event);
        msgbus.emitEvent(evt);
    });

    console.log('Starting domain service'.cyan);
});