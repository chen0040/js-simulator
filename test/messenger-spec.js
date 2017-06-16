var expect = require('chai').expect;
var jssim = require('../src/jssim');

describe('Messenger', function(){
   it('should delete messages when the inbox grows larger than 10', function(){
        var scheduler = new jssim.Scheduler();
        var repeated = new jssim.SimEvent();
        repeated.id = 1;
        repeated.update = function(deltaTime) {
            for(var i=0; i < 100; ++i){
                this.sendMsg(2, {
                    content: 'message that no body tries to read'
                });
            }
        };
       
        scheduler.scheduleRepeatingIn(repeated, 1);
       
        while(scheduler.current_time < 20) {
            scheduler.update();
            console.log('inbox: ' + scheduler.messenger.inbox[2].size());
            expect(scheduler.messenger.inbox[2].size()).to.equal(100);
        }
   });
});