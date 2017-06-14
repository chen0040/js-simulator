var expect = require('chai').expect;
var jssim = require('../src/jssim');

describe('Render coverage test', function(){
   it('should increase the coverage for render() api in the jssim', function(){
       var Context = function(id) {
           this.id = id;  
       };

       Context.prototype.clearRect = function(x, y, width, height) {
           console.log('clearRect(' + x + ', ' + y + ', ' + width + ', ' + height + ')');
       };
       
       Context.prototype.fillRect = function(x, y, width, height) {
           console.log('fillRect(' + x + ', ' + y + ', ' + width + ', ' + height + ')');  
       };
       
       Context.prototype.stroke = function () {
            console.log('stroke()');  
       };
       
       Context.prototype.beginPath = function () {
            console.log('beginPath()');  
       };
       
       Context.prototype.moveTo = function(x, y) {
            console.log('moveTo(' + x + ', ' + y + ')');  
       };
       
       Context.prototype.lineTo = function(x, y) {
            console.log('lineTo(' + x + ', ' + y + ')');  
       };
       
       Context.prototype.fillText = function(text) {
            console.log('fillText( ' + text + ')');  
       };
       
       var Canvas = function(id) {
           this.id = id;
           this.context = new Context('2d');
       };
       
       Canvas.prototype.getContext = function(id) {
           return this.context;
       };
       
       var grid = new jssim.Grid(64, 64);
       grid.setCell(10, 10, 1);
       grid.setObstable(10, 10, 1);
       grid.setTarget(5, 5, 1);
       grid.showTrails = true;
       grid.showPotential = true;
       grid.setPotential(10, 10, 10);
       grid.setPotential(20, 20, 20);
       var space = new jssim.Space2D();
       
       space.drawLine(0, 0, 10, 10);
       
       var network = new jssim.Network(10);
       space.network = network;
       
       network.addEdge(new jssim.Edge(0, 2));
       
       
       var agent = new jssim.SimEvent();
       agent.id = 0;
       space.updateAgent(agent, 10, 10);
       
       agent = new jssim.SimEvent();
       agent.id = 2;
       space.updateAgent(agent, 10, 10);
       
       var canvas = new Canvas();
       space.render(canvas);
       
       grid.render(canvas);
       
   }) ;
});