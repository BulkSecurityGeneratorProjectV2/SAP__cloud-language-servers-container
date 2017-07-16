const WebSocket = require('ws');
const Promise = require('promise');
const PromiseTimeout = require('promise-timeout');
const assert = require("chai").assert;
const expect = require("chai").expect;


var aSubscribers = [];

describe('Protocol test (LSP is socket client)', () => {
	

	function onMessage(msg) {
		console.log("Receiving message: " + msg);
		if ( msg.startsWith("Content-Length:") ) {
			var body = msg.substr(msg.indexOf("{"));
			var mObj = JSON.parse(body);

			// Find subscriber
			var indexFound = -1;
			aSubscribers.forEach(function(oSubscr,index) {
				if (oSubscr.method === mObj.method) {
					indexFound = index;
					oSubscr.callback(mObj);
				}
			});
			if ( indexFound != -1 ) {
				delete aSubscribers[indexFound];
			}

		}
	}
	
	function openAndClose() {
		debugger;
		var ws_o = null;
		return PromiseTimeout.timeout(new Promise(function(resolve, reject){
			openPromise = new Promise(function(openRes,openRej){
				aSubscribers.push({ method: "protocol/Ready", callback: function(msg){
					openRes(true);
				}})
			});
			ws_o = new WebSocket('ws://localhost:8080/LanguageServer/abcd/java');
			ws_o.on('open',function open(){
				ws = ws_o;
				ws.on('message',onMessage);
				resolve(ws);
			})
		}),1000).then(function(ws) {
			return new Promise(function(closeRes,closeRej) {
				ws.close();
				ws.on('close',function close() {
					//ws = null;
					closeRes(true);
				});
				
			})
		});
		
	}

	before(function(){
		// debugger;
	});

	after(function(){

	});

	it('Check for Reload WebIDE', function() {
		this.timeout(1000);
		return openAndClose().then(function(res1,rej1){
			return openAndClose().then(function(res2,rej2){
				res2(true);
			});
		});

	});

});
