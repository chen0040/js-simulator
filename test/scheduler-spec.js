expect = require('chai').expect;
jssim = require('../src/jssim');

describe('Discrete Event Scheduler', function(){
   it('should remove events with same time and rank and with min time and highest rank first', function(){
      var scheduler = new jssim.Scheduler(); 
       for(var time = 9; time >= 0; --time) {
           for(var rank = 1; rank <= 3; ++rank) {
               for(var id = 0; id < 10; ++id) {
                   var evt = new jssim.SimEvent(rank);
                   evt.id = time + ":" + rank + ":" + id;
                   evt.update = function(deltaTime){
                       console.log("event " + this.id + " fired");
                       
                       if(Math.random() < 0.1){
                           scheduler.scheduleOnceIn((function(parent_rank, parent_id){
                               var child_event = function(rank){   
                                   jssim.SimEvent.call(this, rank);
                               };
                               child_event.prototype = Object.create(jssim.SimEvent.prototype);
                               child_event.prototype.update = function(deltaTime) {
                                   console.log("event with rank " + this.rank + " fired at time " + this.time + " from event " + parent_id);
                               };
                               return new child_event(parent_rank);
                           })(this.rank, this.id), 2);
                       }
                   }
                   scheduler.schedule(evt, time);
               }
           }
       }
       
       scheduler.scheduleRepeatingIn((function(_rank){
           var child_event = function(rank){   
               jssim.SimEvent.call(this, rank);
               this.id = 100;
           };
           child_event.prototype = Object.create(jssim.SimEvent.prototype);
           child_event.prototype.update = function(deltaTime) {
               console.log("repeated event with id = " + this.id + " and rank " + this.rank + " fired at time " + this.time);
           };
           
           return new child_event(_rank);
       })(4), 2);
       
       var prev_time = 0;
       var prev_rank = 5;
       while(scheduler.hasEvents()) {
           var fired = scheduler.update_mini();
           expect(scheduler.current_time).not.to.below(prev_time);
           if(prev_time == scheduler.current_time) {
               expect(scheduler.current_rank).to.below(prev_rank);
               prev_rank = scheduler.current_rank;
           } else {
               prev_rank = 5;
           }
           
           prev_time = scheduler.current_time;
           
           if(scheduler.current_time >= 20) {
               break;
           }
           
       }
       
       
   });
});