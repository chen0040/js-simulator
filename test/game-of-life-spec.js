var expect = require('chai').expect;
var jssim = require('../src/jssim');

describe('Game of Life', function() {
   it('should generate and kill cell based on the 8 surrounding cells', function(){
      var CellularAgent = function(world) {
          jssim.SimEvent.call(this);
          this.world = world;
      }; 
       
      CellularAgent.prototype = Object.create(jssim.SimEvent.prototype);
      CellularAgent.prototype.update = function (deltaTime) {
          var width = this.world.width;
          var height = this.world.height;
          var past_grid = this.world.makeCopy();
          for(var i=0; i < width; ++i) {
              for(var j = 0; j < height; ++j) {
                  var count = 0;
                  for(var dx = -1; dx < 2; ++dx) {
                      var x = i + dx;
                      if (x >= width) {
                          x = 0;
                      }
                      if (x < 0) {
                          x = width - 1;
                      }
                      for(var dy = -1; dy < 2; ++dy) {
                        var y = j + dy;
                          if(y >= height) {
                              y = 0;
                          }
                          if(y < 0) {
                              y = height - 1;
                          }
                          count += past_grid.getCell(x, y);
                      }
                  }
                  if (count <= 2 || count >= 5) {
                      this.world.setCell(i, j, 0); // dead
                  }
                  if (count == 3) {
                      this.world.setCell(i, j, 1); // live
                  }
              }
          }
      };
       
      var scheduler = new jssim.Scheduler();
      var grid = new jssim.Grid(640, 640);
       
      scheduler.reset();
      grid.reset();
       
      grid.setCell(1, 0, 1);
      grid.setCell(2, 0, 1);
      grid.setCell(0, 1, 1);
      grid.setCell(1, 1, 1);
      grid.setCell(1, 2, 1);
      grid.setCell(2, 2, 1);
      grid.setCell(2, 3, 1);
       
      scheduler.scheduleRepeatingIn(new CellularAgent(grid), 1);
       
      while(scheduler.current_time < 20) {
          scheduler.update();
      }
   });
});