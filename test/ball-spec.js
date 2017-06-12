var expect = require('chai').expect;
var jssim = require('../src/jssim');

describe('Ball simulation', function(){
   it('should simulate balls collision and spring effect', function(){
        
        var numBalls = 50;
        var numBands = 60;

        var maxMass = 10.0;
        var minMass = 1.0;
        var minLaxBandDistance = 10.0;
        var maxLaxBandDistance = 50.0;
        var minBandStrength = 5.0;
        var maxBandStrength = 10.0;
        var collisionDistance = 40.0;

        var worldWidth = 800;
        var worldHeight = 600;

        var Band = function(laxDistance, strength) {
            this.laxDistance = laxDistance;
            this.strength = strength;
        };

        var Ball = function(rank, id, vx, vy, m, space, bands) {
            jssim.SimEvent.call(this, rank); 

            this.id = id;

            // force on the Ball
            this.forcex = 0;
            this.forcey = 0;

            // Ball mass
            this.mass = m;

            // Current Ball velocity
            this.velocityx = vx;
            this.velocityy = vy;

            // did the Ball collide?
            this.collision = false;

            // for drawing: always sqrt of mass
            this.diameter = Math.sqrt(m);

            this.space = space;
            this.bands = bands;
        };

        Ball.prototype = Object.create(jssim.SimEvent.prototype);

        Ball.prototype.update = function(deltaTime) {

        };

        Ball.prototype.computeCollision = function() {
            var me = this.space.getLocation(this.id);
            var bag = this.space.getNeighborsWithinDistance(me, collisionDistance);
            this.collision = bag.length > 1;  // other than myself of course  
        };

        Ball.prototype.addForce = function(otherBallLoc, myLoc, band) {
            // compute difference
            var dx = otherBallLoc.x - myLoc.x;
            var dy = otherBallLoc.y - myLoc.y;
            var len = Math.sqrt(dx*dx + dy*dy);
            var l = band.laxDistance;

            var k = band.strength / 512.0;  // cut-down
            var forcemagnitude = (len - l) * k;

            // add rubber band force
            if (len - l > 0) 
            {
                this.forcex += (dx * forcemagnitude) / len;
                this.forcey += (dy * forcemagnitude) / len;
            }
        };

        Ball.prototype.computeForce = function() {

            var me = this.space.getLocation(this.id);

            this.forcex = 0; 
            this.forcey = 0;
            // rubber bands exert a force both ways --
            // so our graph is undirected. 
            var adj_v = this.bands.adj(this.id);

            for(var x=0; x < adj_v.length;x++)
            {
                var e = adj_v[x];
                var b = e.info;
                var other = e.other(this.id);  // from him to me
                var him = this.space.getLocation(other);
                this.addForce(him, me, b);

                var otherBall = this.space.getAgent(other);
                otherBall.addForce(me, him, b);
            }
        };

        Ball.prototype.update = function(deltaTime) {
            // acceleration = force / mass
            var ax = this.forcex / this.mass;
            var ay = this.forcey / this.mass;


            // velocity = velocity + acceleration
            this.velocityx += ax;
            this.velocityy += ay;


            // position = position + velocity
            var pos = this.space.getLocation(this.id);
            var newpos = new jssim.Vector2D(pos.x+ this.velocityx, pos.y + this.velocityy);
            this.space.updateAgent(this, newpos.x, newpos.y);


            // compute collisions
            this.computeCollision();  
        };

        Ball.prototype.draw = function(context, pos) {
            context.fillStyle="#000000";
            if(this.collision) {
                context.fillStyle = '#ff0000';
            } else {
                context.fillStyle = '#00ff00';
            }
            var size = 20;

            //context.fillRect(pos.x, worldHeight - pos.y, width, height);
            context.beginPath();
            context.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
            context.fill();

            context.fillStyle = '#ffffff';

            context.font = "12 Arial";
            context.fillText("" + this.id,pos.x, pos.y);

            var me = this.space.getLocation(this.id);
            var adj_me = this.bands.adj(this.id);
            for(var i=0; i < adj_me.length; ++i) {
                var e = adj_me[i];
                var band = e.info;
                var other = this.space.getLocation(e.other(this.id));

                var distance = me.distance(other);
                if(distance > band.laxDistance) {
                    context.strokeStyle = "#cccccc";
                    context.beginPath();
                    context.moveTo(me.x, worldHeight - me.y); // y coordindate is inverted
                    context.lineTo(other.x, worldHeight - other.y); // y coordindate is inverted
                    context.stroke();
                }
            }
        };

        var scheduler = new jssim.Scheduler();

        var space = new jssim.Space2D();
        var bands = new jssim.Network(numBalls);
        var s = [];


        function reset() {
            scheduler.reset(); 
            space.reset();
            bands.reset();
            s = [];


            // make the balls
            for(var i=0; i<numBalls;i++)
            {
                // must be final to be used in the anonymous class below
                var rank = 2;
                var id = i;
                var ball = new Ball(rank, id, 0,0,Math.random() * (maxMass-minMass) + minMass, space, bands);
                space.updateAgent(ball, Math.random() * worldWidth, Math.random() * worldHeight);
                scheduler.scheduleRepeatingIn(ball, 1);

                // schedule the balls to compute their force after everyone's moved
                var forceComputer = new jssim.SimEvent(1);
                forceComputer.ball = ball;
                forceComputer.update = function(deltaTime) {
                    this.ball.computeForce();
                };
                // add the sequence
                scheduler.scheduleRepeatingIn(forceComputer,1);
            }

            // make the bands
            for(var i=0;i<numBands;i++)
            {
                var laxDistance = Math.random() * (maxLaxBandDistance - minLaxBandDistance) + minLaxBandDistance;
                var strength = Math.random() * (maxBandStrength - minBandStrength) + minBandStrength;
                var band = new Band(laxDistance, strength);
                var from = Math.floor(Math.random() * numBalls );

                var to = from;
                while(to == from) {
                    to = Math.floor(Math.random() * numBalls);
                }

                bands.addEdge(new jssim.Edge(from,to,band));
            }

            // To make the initial screenshot pretty, let's have all the balls do an initial collision check
            ballObjs = space.findAllAgents();
            for(var i = 0; i < ballObjs.length; i++) {
                ballObjs[i].computeCollision();
            }
        }
       
        reset();
       
        while (scheduler.current_time < 2) {
           scheduler.update();
        }

   }) ;
});