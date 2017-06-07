# js-simulator
Package provides the implementation of various statistics distribution such as normal distribution, fisher, student-t, and so on

[![Build Status](https://travis-ci.org/chen0040/js-simulator.svg?branch=master)](https://travis-ci.org/chen0040/js-simulator) [![Coverage Status](https://coveralls.io/repos/github/chen0040/js-simulator/badge.svg?branch=master)](https://coveralls.io/github/chen0040/js-simulator?branch=master) 

# Features


# Install

Run the following npm command to install

```bash
npm install js-simulator
```

# Usage


### Flocking behavior Demo

The source code below shows how to create a flocking of 15 boids (12 preys and 3 predators) that demonstrate the flocking principles:

Firstly we will declare a Boid class the inherits from the jsssim.SimEvent class, which defines the behavior of a single boid:

```javascript
jssim = require('js-simulator');


var Boid = function(id, initial_x, initial_y, space, isPredator) {
    var rank = 1;
    jssim.SimEvent.call(this, rank);
    this.id = id;
    this.space = space;
    this.space.updateAgent(this, initial_x, initial_y);
    this.sight = 75;
    this.speed = 12;
    this.separation_space = 30;
    this.velocity = new jssim.Vector2D(Math.random(), Math.random());
    this.isPredator = isPredator;
    this.border = 100;
};

Boid.prototype = Object.create(jssim.SimEvent);
Boid.prototype.update = function(deltaTime) {
    var boids = this.space.findAllAgents();
    var pos = this.space.getLocation(this.id);

    if(this.isPredator) {
        var prey = null;
        var min_distance = 10000000;
        for (var boidId in boids)
        {
            var boid = boids[boidId];
            if(!boid.isPredator) {
                var boid_pos = this.space.getLocation(boid.id);
                var distance = pos.distance(boid_pos);
                if(min_distance > distance){
                    min_distance = distance;
                    prey = boid;
                }
            }
        }

        if(prey != null) {
            var prey_position = this.space.getLocation(prey.id);
            this.velocity.x += prey_position.x - pos.x;
            this.velocity.y += prey_position.y - pos.y;
        }
    } else {
        for (var boidId in boids)
        {
            var boid = boids[boidId];
            var boid_pos = this.space.getLocation(boid.id);
            var distance = pos.distance(boid_pos);
            if (boid != this && !boid.isPredator)
            {
                if (distance < this.separation_space)
                {
                    // Separation
                    this.velocity.x += pos.x - boid_pos.x;
                    this.velocity.y += pos.y - boid_pos.y;
                }
                else if (distance < this.sight)
                {
                    // Cohesion
                    this.velocity.x += (boid_pos.x - pos.x) * 0.05;
                    this.velocity.y += (boid_pos.y - pos.y) * 0.05;
                }
                if (distance < this.sight)
                {
                    // Alignment
                    this.velocity.x += boid.velocity.x * 0.5;
                    this.velocity.y += boid.velocity.y * 0.5;
                }
            }
            if (boid.isPredator && distance < this.sight)
            {
                // Avoid predators.
                this.velocity.x += pos.x - boid_pos.x;
                this.velocity.y += pos.y - boid_pos.y;
            }
        }
    }



    // check boundary
    var val = this.boundary - this.border;
    if (pos.x < this.border) this.velocity.x += this.border - pos.x;
    if (pos.y < this.border) this.velocity.y += this.border - pos.y;
    if (pos.x > val) this.velocity.x += val - pos.x;
    if (pos.y > val) this.velocity.y += val - pos.y;

    // check speed
    var speed = this.velocity.length();
    if(speed > this.speed) {
        this.velocity.resize(this.speed);
    }

    pos.x += this.velocity.x;
    pos.y += this.velocity.y;


    console.log("boid [ " + this.id + "] is at (" + pos.x + ", " + pos.y + ") at time " + this.time);
};
```

Once the boid is defined we can then create and schedule the flocking event simulator using the code below:

```javascript
var scheduler = new jssim.Scheduler();
scheduler.reset();

var space = new jssim.Space2D();
for(var i = 0; i < 15; ++i) {
    var is_predator = i > 12;
    var boid = new Boid(i, 0, 0, space, is_predator);
    scheduler.scheduleRepeatingIn(boid, 1);
}

while(scheduler.current_time < 20) {
  scheduler.update();
}


```


