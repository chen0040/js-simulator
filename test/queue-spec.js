var expect = require('chai').expect;
var jssim = require('../src/jssim');

describe('Queue', function(){
   it('should perform FIFO', function(){
       var queue = new jssim.Queue();
       queue.enqueue(1);
       queue.enqueue(2);
       queue.enqueue(3);
       expect(queue.size()).to.equal(3);
       expect(queue.isEmpty()).to.equal(false);
       expect(queue.dequeue()).to.equal(1);
       expect(queue.dequeue()).to.equal(2);
       expect(queue.dequeue()).to.equal(3);
       expect(queue.isEmpty()).to.equal(true);
       queue.enqueue(3);
       expect(queue.size()).to.equal(1);
       expect(queue.dequeue()).to.equal(3);
       expect(queue.isEmpty()).to.equal(true);
   });
});