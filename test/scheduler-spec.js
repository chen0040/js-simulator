expect = require('chai').expect;
jssim = require('../src/jssim');

describe('Discrete Event Scheduler', function(){
   it('should remove events with same time and rank and with min time and highest rank first', function(){
      var scheduler = new jssim.Scheduler(); 
       for(var time = 9; time >= 0; --time) {
           for(var rank = 1; rank < 2; ++rank) {
               for(var id = 0; id < 10; ++id) {
                   var evt = new jssim.SimEvent(time, rank);
                   evt.id = time + ":" + rank + ":" + id;
                   evt.update = function(deltaTime){
                       console.log("event " + this.id + " fired");
                   }
                   scheduler.schedule(evt);
               }
           }
       }
       
       var prev_time = 0;
       while(scheduler.hasEvents()) {
           var fired = scheduler.update();
           expect(fired.length).to.equal(10);
           expect(scheduler.current_time).not.to.below(prev_time);
           prev_time = scheduler.current_time;
       }
   });
});