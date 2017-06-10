var expect = require('chai').expect;
var jssim = require('../src/jssim');

describe('Ant System', function(){
    it('should be able to automatically find the shortest path to reach target using pheromones', function(){
        var target_x = 110;
        var target_y = 40;
        var tiles = 128;
        var tau_0 = 1.0 / (tiles * tiles);

        var Evaporator = function(pheromones) {
            jssim.SimEvent.call(this, 1);
            this.pheromones = pheromones;
        };

        Evaporator.prototype = Object.create(jssim.SimEvent);

        Evaporator.prototype.update = function(deltaTime) {
            for(var x = 0; x < tiles; ++x) {
                for(var y = 0; y < tiles; ++y) {
                    var t = this.pheromones.getCell(x, y);
                    t = 0.9 * t;
                    if (t < tau_0) {
                        t = tau_0;
                    }
                    this.pheromones.setCell(x, y, t);
                }
            }  
        };

        var Ant = function(id, grid, pheromones, x, y) {
            jssim.SimEvent.call(this, 2);
            this.id = id;
            this.x = x;
            this.y = y;
            this.init_x = x;
            this.init_y = y;
            this.prev_x = x;
            this.prev_y = y;
            this.grid = grid;
            this.pheromones = pheromones;
            this.grid.setCell(this.x, this.y, 1);
            this.path = [];
            this.age = 0;
            this.life = 150;
        };
        Ant.prototype = Object.create(jssim.SimEvent);

        Ant.prototype.reset = function () {
            this.grid.setCell(this.x, this.y, 0);
            this.x = this.init_x;
            this.y = this.init_y;
            this.prev_x = this.x;
            this.prev_y = this.y;
            this.grid.setCell(this.x, this.y, 1);
            this.age = 0;
            this.path = [];
        };

        Ant.prototype.depositPheromones = function () {
            for(var i = 0; i < this.path.length; ++i) {
                var move = this.path[i];
                this.pheromones.setCell(move.x, move.y, this.pheromones.getCell(move.x, move.y) + 1.0 / this.path.length);
            }
        };

        Ant.prototype.getCandidateMoves = function () {
            var candidates = [];

            for(var dx = -1; dx <= 1; ++dx) {
                for(var dy = -1; dy <= 1; ++dy) {
                    var _x = this.x + dx;
                    var _y = this.y + dy;
                    if(_x == this.prev_x && _y == this.prev_y) continue;
                    if(_x == this.x && _y == this.y) continue;
                    if(!this.grid.hasPath(_x, _y)) {
                        continue;
                    }
                    if(this.grid.isOccupied(_x, _y)) {
                        continue;
                    }
                    if(this.grid.isTarget(_x, _y)) {
                        this.depositPheromones();
                        this.reset();
                        return candidates;
                    }

                    candidates.push({
                        x: _x,
                        y: _y
                    });
                }
            }
            return candidates;
        };

        Ant.prototype.selectMove = function (candidates) {
            var heuristics = [];

            var dx2 = target_x - this.x;
            var dy2 = target_y - this.y;
            var dlen2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            for(var i = 0; i < candidates.length; ++i) {
                var move = candidates[i];
                var dx = move.x - this.x;
                var dy = move.y - this.y;
                var dlen = Math.sqrt(dx * dx + dy * dy);

                var heuristic_b = ((dx * dx2 + dy * dy2) / (dlen * dlen2) + 1) / (tiles * tiles); 
                var heuristic_a = this.pheromones.getCell(move.x, move.y);
                var heuristic = heuristic_a * Math.pow(heuristic_b, 2.0);

                heuristics.push(heuristic);
            }



            var r = Math.random();

            if(r < 0.9) {
                // Exploitation
                var max_i = -1;
                var max_heuristic = 0;
                for(var i=0; i < candidates.length; ++i) {
                    if(heuristics[i] > max_heuristic) {
                        max_heuristic = heuristics[i];
                        max_i = i;
                    }
                }
                return max_i;
            } else {
                // Exploration
                r = Math.random();
                var heuristic_sum = 0;
                for(var i = 0; i < candidates.length; ++i) {
                    heuristic_sum += heuristics[i];
                    heuristics[i] = heuristic_sum;
                }
                for(var i = 0; i < candidates.length; ++i) {
                    heuristics[i] /= heuristic_sum;
                }

                for(var i = 0; i < candidates.length; ++i) {
                    if(r <= heuristics[i]) {
                        return i;
                    }
                }
            }
            return -1;
        }

        Ant.prototype.update = function(deltaTime) {

            this.age++;

            if(this.age >= this.life) {
                this.reset();
            }



            var candidates = this.getCandidateMoves();

            if(candidates.length == 0) return;

            var max_i = this.selectMove(candidates);

            var act_x = this.x;
            var act_y = this.y;

            if(max_i != -1){
                act_x = candidates[max_i].x;
                act_y = candidates[max_i].y;
                this.path.push(candidates[max_i]);
            }

            this.moveTo(act_x, act_y);

        };

        Ant.prototype.moveTo = function(act_x, act_y) {
            this.grid.setCell(this.x, this.y, 0);
            this.prev_x = this.x;
            this.prev_y = this.y;
            this.x = act_x;
            this.y = act_y;
            this.grid.setCell(this.x, this.y, 1);
        };

        var scheduler = new jssim.Scheduler();

        var grid = new jssim.Grid(tiles, tiles);
        grid.cellWidth = 5;
        grid.cellHeight = 5;
        grid.showTrails = true;

        var pheromones = new jssim.Grid(tiles, tiles);
        pheromones.cellWidth = 5;
        pheromones.cellHeight = 5;


        function reset() {
            scheduler.reset(); 
            grid.reset();
            pheromones.reset();

            grid.createCylinder(50, 80, 20);
            grid.createCylinder(30, 100, 10);
            grid.createCylinder(80, 50, 21);
            grid.createCylinder(80, 28, 11);
            grid.createCylinder(75, 35, 11);

            grid.createCylinder(103, 26, 11);

            for(var x= 0; x < tiles; ++x){
                for(var y = 0; y <tiles; ++y) {
                    pheromones.setCell(x, y, tau_0);
                }
            }

            grid.createTarget(target_x, target_y, 4);

            for(var i = 0; i < 30; ++i) {
                var dx = Math.floor(Math.random() * 10) - 5;
                var dy = Math.floor(Math.random() * 10) - 5;

                var ant = new Ant(i, grid, pheromones, 10+dx, 50+dy);
                scheduler.scheduleRepeatingIn(ant, 1);
            }
            scheduler.scheduleRepeatingIn(new Evaporator(pheromones), 1);
        }

        reset();
        
         while(scheduler.current_time < 150) {
          scheduler.update();
      }
    })
});