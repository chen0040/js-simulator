var expect = require('chai').expect;
var jssim = require('../src/jssim');

describe ('School Yard Simulation', function () {
   it ('should generate forces to pull buddies together and random forces to allow them to explore new connection', function() {
       var Student = function(id, yard, network) {
           jssim.SimEvent.call(this);
           this.id = id;
           this.yard = yard;
           this.network = network;
           this.MAX_FORCES = 3.0;
           this.forceToSchoolMultiplier = 0.01;
           this.randomMultiplier = 0.1;
       };
       Student.prototype = Object.create(jssim.SimEvent.prototype);
       Student.prototype.update = function(deltaTime) {
           var students = this.yard.findAllAgents();
        

           var me = this.yard.getLocation(this.id);

            var sumForces = new jssim.Vector2D(0, 0);
            var forceVector = new jssim.Vector2D(0, 0);
            var edges = this.network.adj(this.id);
            var len = edges.length;
            for (var buddy = 0; buddy < len; ++buddy)
            {
                var e = edges[buddy];
                var buddiness = e.info;
                

                var him = this.yard.getLocation(e.other(this.id));

                if (buddiness >= 0)
                {
                    forceVector.set((him.x - me.x) * buddiness, (him.y - me.y) * buddiness);
                    if (forceVector.length() > this.MAX_FORCES)
                    {
                        forceVector.resize(this.MAX_FORCES);
                    }
                }
                else
                {
                    forceVector.set((me.x - him.x) * buddiness, (me.y - him.y) * buddiness);
                    if (forceVector.length() > this.MAX_FORCES)
                    {
                        forceVector.resize(0);
                    }
                    else if(forceVector.length() > 0)
                    {
                        forceVector.resize(this.MAX_FORCES - forceVector.length());
                    }
                }

                sumForces.addIn(forceVector);
            }

            sumForces.addIn(
                new jssim.Vector2D((this.yard.width * 0.5 - me.x) * this.forceToSchoolMultiplier, (this.yard.height * 0.5 - me.y) * this.forceToSchoolMultiplier)
                );

            sumForces.addIn(
                new jssim.Vector2D(this.randomMultiplier * (Math.random() * 1.0 - 0.5), this.randomMultiplier * Math.random() * 1.0 - 0.5));

            sumForces.addIn(me);

            me.x = sumForces.x;
            me.y = sumForces.y;

            console.log("Student " + this.id + " is at (" + me.x + ", " + me.y + ") at time " + this.time);
       };
       
       var scheduler = new jssim.Scheduler();
       var yard = new jssim.Space2D();
       var network = new jssim.Network(30);
       yard.width = 50;
       yard.height = 50;
       yard.network = network;
       
       scheduler.reset();
       yard.reset();
       network.reset();
       for(var i=0; i < 30; ++i) {
           var student = new Student(i, yard, network);
           yard.updateAgent(student, Math.random() * yard.width, Math.random() * yard.height);
           scheduler.scheduleRepeatingIn(student, 1);
       }
       
       var buddies = {};
       for (var i = 0; i < 30; ++i)
        {
            var student = i;
            var studentB = i;
            do
            {
                studentB = Math.floor(Math.random() * 30);
            } while (student == studentB);
            var buddiness = Math.random();
            if(!network.connected(student, studentB)){
                network.addEdge(new jssim.Edge(student, studentB, buddiness));
            }

            var studentB = i;
            do
            {
                studentB = Math.floor(Math.random() * 30);
            } while (student == studentB);

            buddiness = Math.random();
            if(!network.connected(student, studentB)){
                network.addEdge(new jssim.Edge(student, studentB, buddiness));
            }
        }
       
       while (scheduler.current_time < 2) {
           scheduler.update();
       }
       
       
   });
});