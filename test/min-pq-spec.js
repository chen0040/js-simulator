var expect    = require("chai").expect;
var jssim = require("../src/jssim");

describe("MinPQ", function() {
  it("should operate correctly", function(){
     var pq = new jssim.MinPQ();
      pq.clear();
      pq.enqueue(100);
      pq.enqueue(10);
      expect(pq.min()).to.equal(10);
      pq.enqueue(1);
      expect(pq.size()).to.equal(3);
      expect(pq.isEmpty()).to.equal(false);
      expect(pq.delMin()).to.equal(1);
      expect(pq.delMin()).to.equal(10);
      expect(pq.delMin()).to.equal(100);
      expect(pq.isEmpty()).to.equal(true);
  });


});