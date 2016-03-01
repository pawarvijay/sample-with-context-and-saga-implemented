(function() {

    // Create Backbone Model and Collection
    // ------------------------------------

    // model
    var Item = Backbone.Model.extend({
        modelName: 'salesinvoice', // so denormalizers can resolve events to model
        
        initialize: function() {
            // bind this model to get event updates - a lot of magic ;)
            // not more to do the model gets updated now
            this.bindCQRS(); 
        }
    });

    // collection
    var Items = Backbone.Collection.extend({
        model: Item,
        url: '/allItems.json'
    });

    var items = new Items();


    // Init Backbone.CQRS
    // ------------------

    // we just have to override eventNameAttr:
    Backbone.CQRS.hub.init({ eventNameAttr: 'event' });

    // override Backbone.sync with CQRS.sync which allows only GET method
    Backbone.sync = Backbone.CQRS.sync;


    // Wire up communication to/from server
    // ------------------------------------

    // create a socket.io connection
    var socket = io.connect('http://localhost:3000');
    
    // on receiving an event from the server via socket.io 
    // forward it to backbone.CQRS.hub
    socket.on('events', function(evt) {
        Backbone.CQRS.hub.emit('events', evt);
    });

    // forward commands to server via socket.io
    Backbone.CQRS.hub.on('commands', function(cmd) {
        socket.emit('commands', cmd);
    });



    // Create a few EventDenormalizers
    // -------------------------------

    // itemCreated event 
    var itemCreateHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'create',
        model: Item,
        collection: items,

        // bindings
        forModel: 'salesinvoice',
        forEvent: 'salesInvoiceCreated'
    });

    // itemChanged event
    var itemChangedHandler = new Backbone.CQRS.EventDenormalizer({
        forModel: 'salesinvoice',
        forEvent: 'salesInvoiceChanged'
    });

    // itemDeleted event 
    var itemDeletedHandler = new Backbone.CQRS.EventDenormalizer({
        methode: 'delete',

        // bindings
        forModel: 'salesinvoice',
        forEvent: 'salesInvoiceDeleted'
    });



    // Create Backbone Stuff
    // ---------------------

    // view templates
    var itemTemplate = _.template('<%= text %> <a class="deleteItem" href="">delete</a> <a class="editItem" href="">edit</a>');
    var editItemTemplate = _.template('<input id="newText" type="text" value="<%= text %>"/><button id="changeItem">save</button>');

    // views
    var ItemView = Backbone.View.extend({
        
        tagName: 'li',
        className: 'item',

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },

        events: {
            'click .editItem' : 'uiEditItem',
            'click .deleteItem' : 'uiDeleteItem',
            'click #changeItem' : 'uiChangeItem'
        },

        // render edit input
        uiEditItem: function(e) {
            e.preventDefault();
            this.model.editMode = true;
            this.render();
        },

        // send deletePerson command with id
        uiDeleteItem: function(e) {
            e.preventDefault();

            // CQRS command
            var cmd = new Backbone.CQRS.Command({
                id:_.uniqueId('msg'),
                command: 'deleteSalesInvoice',
                context: { name: 'sales' },
                payload: { 
                    id: this.model.id
                }
            });

            // emit it
            cmd.emit();
        },

        // send changeItem command with new name
        uiChangeItem: function(e) {
            e.preventDefault();

            var itemText = this.$('#newText').val();

            this.$('#newText').val('');
            this.model.editMode = false;
            this.render();

            if (itemText) {

                /*{ id: '0558642d-d854-b7c9-4856-23ff651e9017',
                    command: 'deleteSalesInvoice',
                    context: { name: 'sales' },
                    payload: { id: '56d426b0614b83722fe653a4' } }*/

                // CQRS command
                var cmd = new Backbone.CQRS.Command({
                    id:_.uniqueId('msg'),
                    command: 'changeSalesInvoice',
                    context: { name: 'sales' },
                    payload: { 
                        id: this.model.id,
                        text: itemText 
                    }
                });

                // emit it
                cmd.emit();
            }
        },

        render: function() {
            if (this.model.editMode) {
                $(this.el).html(editItemTemplate(this.model.toJSON()));
            } else {
                $(this.el).html(itemTemplate(this.model.toJSON()));
            }
            return this;
        }, 

        remove: function() {
            $(this.el).fadeOut('slow');
        }

    });

    var IndexView =  Backbone.View.extend({

        el: '#index-view',

        initialize: function() {
            _.bindAll(this, 'addItem');

            this.collection = app.items;
            this.collection.bind('reset', this.render, this);
            this.collection.bind('add', this.addItem, this);
        },

        events: {
            'click #addItem' : 'uiAddItem'
        },

        // send createPerson command
        uiAddItem: function(e) {
            e.preventDefault();  

            var itemText = this.$('#newItemText').val();

            if (itemText) {

                // CQRS command
                var cmd = new Backbone.CQRS.Command({
                    id:_.uniqueId('msg'),
                    command: 'createSalesInvoice',
                    context: { name: 'sales' },
                    payload: {
                        text: itemText,
                        iscancelled : 'no',
                        header: {
                              text: itemText,
                              salesinvoiceid: _.uniqueId('id'),
                              narration :'hello',
                              amount : '55'
                        }}
                });

                // emit it
                cmd.emit();
            }

            this.$('#newItemText').val('');
        },

        render: function() {
            this.collection.each(this.addItem);
        },

        addItem: function(item) {
            var view = new ItemView({model: item});
            this.$('#items').append(view.render().el);
        }

    });


    // Bootstrap Backbone
    // ------------------

    var app = {};
    var init = function() {
        app.items = items;
        app.items.fetch();

        var indexView = new IndexView();
        indexView.render();
    };

    // kick things off
    $(init);

})();