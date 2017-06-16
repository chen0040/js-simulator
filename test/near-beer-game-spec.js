var expect = require('chai').expect;
var jssim = require('../src/jssim');

describe('Near Beer Game', function(){
   it('should work as a simple supply chain', function(){
        var supplier_id = 'supplier';
        var customer_id = 'customer';
        var agent_id = 'agent';


        var Customer = function() {
            jssim.SimEvent.call(this, 1);
            this.id = customer_id;
            this.activities = [];
            this.cumulativeUnfulfilledOrders = 0;
        };

        Customer.prototype = Object.create(jssim.SimEvent.prototype);

        Customer.prototype.update = function (delta) {
            var inbox = this.readInBox();

            var arrived_goods = 0;
            for(var i=0; i < inbox.length; ++i) {
                var msg = inbox[i];
                if(msg.type == 'newShipment') {
                    arrived_goods += msg.quantity;
                } 
            }

            if(arrived_goods > 0) {
                this.cumulativeUnfulfilledOrders -= arrived_goods;
                this.sendMsg(agent_id, {
                    type: 'newGDN',
                    quantity: arrived_goods
                });
            }

            var order = this.makeOrder();
            this.cumulativeUnfulfilledOrders += order;

            var record = {};
            record.weeks = this.time;
            record.order = order;
            record.totalOrder = this.cumulativeUnfulfilledOrders;
            record.received = arrived_goods;

            this.activities.push(record);
        };

        Customer.prototype.makeOrder = function () {
            var weeks = this.time;
            var order = 15;
            if (weeks <= 3)
            {
                order = 10;
            }
            this.sendMsg(agent_id, {
                quantity: order,
                type: 'newOrder'
            });
            return order;
        };



        var NearBeerAgent = function() {
            jssim.SimEvent.call(this, 1);
            this.id = agent_id;
            this.inventoryOnHand = 25;
            this.outgoingInventory = 0;
            this.backlog = 0;
            this.activities = [];
        };

        NearBeerAgent.prototype = Object.create(jssim.SimEvent.prototype);
        NearBeerAgent.prototype.update = function (deltaTime) {


            var arrived_raw_materials = 0;
            var inbox = this.readInBox();
            for(var i=0; i < inbox.length; ++i) {
                var msg = inbox[i];
                if(msg.type == 'newShipment') {
                    arrived_raw_materials += msg.quantity;
                } else if(msg.type == 'newOrder') {
                    this.backlog += msg.quantity;
                } else if(msg.type == 'newGDN') { // goods delivery note from customer
                    this.backlog -= msg.quantity; 
                    this.outgoingInventory -= msg.quantity;
                }
            }

            var beers = this.brewBeers(arrived_raw_materials);

            this.inventoryOnHand += beers;

            var shipment = this.makeShipment();
            var order = this.makeOrder();

            var record = {};
            record.newRawMaterialOrder = order;
            record.backlog = this.backlog;
            record.beers = beers;
            record.inventoryOnHand = this.inventoryOnHand;
            record.weeks = this.time;
            record.shipment = shipment;
            this.activities.push(record);
        };

        NearBeerAgent.prototype.makeShipment = function () {
            var shipment = Math.min(this.backlog - this.outgoingInventory, this.inventoryOnHand);
            if(shipment > 0) {
                this.sendMsg(customer_id, {
                   type: 'newShipment',
                   quantity: shipment
                });
                this.inventoryOnHand -= shipment;
                this.outgoingInventory += shipment;

            }
            return shipment;
        };

        NearBeerAgent.prototype.makeOrder = function () {
            var weeks = this.time;
            var value = 0;
            if (weeks <= 4)
            {
                value = 10;
            }
            else if ((weeks > 4) && (weeks <= 7))
            {
                value = 25;
            }
            else
            {
                value = 15;
            }

            this.sendMsg(supplier_id, {
                quantity: value,
                type: 'newOrder'
            });

            return value;
        };

        NearBeerAgent.prototype.brewBeers = function (rawMaterials) {
            return Math.floor(rawMaterials * (0.8 + Math.random() * 0.1 - 0.05));  
        };

        var Supplier = function () {
            jssim.SimEvent.call(this, 2); // higher rank than agent and customer so that it executes first
            this.id = supplier_id;
            this.activities = [];
            this.totalShipment = 0;
            this.inventoryOnHand = 0;
        };

        Supplier.prototype = Object.create(jssim.SimEvent.prototype);

        Supplier.prototype.update = function (delta) {
            var messages = this.readInBox();
            var order = 0;
            for(var i=0; i < messages.length; ++i) {
                var msg = messages[i];
                if(msg.type == 'newOrder') {
                    order += msg.quantity;
                }
            }

            var produced = this.produce(order);
            var shipment = this.makeShipment(order);
            this.totalShipment += shipment;

            var record = {};
            record.produced = produced;
            record.inventoryOnHand = this.inventoryOnHand;
            record.shipment = shipment;
            record.totalShipment = this.totalShipment;
            record.weeks = this.time;
            this.activities.push(record);
        };

        Supplier.prototype.produce = function(order) {
            var produced = Math.max(10, order);  
            if(Math.random() < 0.5) {
                produced -= 5;
            }
            this.inventoryOnHand += produced;
            return produced;
        }

        Supplier.prototype.makeShipment = function (order) {
            var shipment = Math.max(0, this.inventoryOnHand - order)
            if(shipment > 0){
                this.sendMsg(agent_id, {
                    quantity: shipment,
                    type: 'newShipment'
                });
                this.inventoryOnHand -= shipment;
            }
            return shipment;
        };

        var scheduler = new jssim.Scheduler();

        function reset() {
            scheduler.reset(); 
            var customer = new Customer();
            var supplier = new Supplier();
            var agent = new NearBeerAgent();

            scheduler.scheduleRepeatingIn(customer, 1);
            scheduler.scheduleRepeatingIn(supplier, 1);
            scheduler.scheduleRepeatingIn(agent, 1);
        }

        reset();
        while(scheduler.current_time < 150) {
          scheduler.update();
        }
   }) ;
});