var expect = require('chai').expect;
var jssim = require('../src/jssim');

describe('Stack', function(){
   it('should push and pop correctly', function(){
       var stack = new jssim.Stack();
       
       stack.push(1);
       stack.push(2);
       stack.push(3);
       expect(stack.size()).to.equal(3);
       expect(stack.isEmpty()).to.equal(false);
       expect(stack.pop()).to.equal(3);
       expect(stack.pop()).to.equal(2);
       expect(stack.pop()).to.equal(1);
       expect(stack.isEmpty()).to.equal(true);
   }) ;
});