/**
 * Copyright Christoph Hofmann
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";
    function DelayTimer(config) {
        RED.nodes.createNode(this, config);

        this.units = config.units || "Second";
        this.durationType = config.durationType;
        this.delay1 = parseInt(RED.util.evaluateNodeProperty(config.delay1, this.durationType, this, null), 10) || 360;
        this.delay2 = parseInt(RED.util.evaluateNodeProperty(config.delay2, this.durationType, this, null), 10) || 60;
        this.payloadval = config.payloadval || "0";
        this.payloadtype = config.payloadtype || "num";

        if (this.delay1 <= 0) {
            this.delay1 = 0;
        } else {
            if (this.units == "Second") {
                this.delay1 = this.delay1 * 1000;
            }
            if (this.units == "Minute") {
                this.delay1 = this.delay1 * 1000 * 60;
            }
            if (this.units == "Hour") {
                this.delay1 = this.delay1 * 1000 * 60 * 60;
            }
        }

        if ((this.payloadtype === "num") && (!isNaN(this.payloadval))) {
            this.payloadval = Number(this.payloadval);
        }
        else if (this.payloadval === 'true' || this.payloadval === 'false') {
            this.payloadval = Boolean(this.payloadval);
        }
        else if (this.payloadval == "null") {
            this.payloadtype = 'null';
            this.payloadval = null;
        }
        else {
            this.payloadval = String(this.payloadval);
        }

        var node = this;
        var timeout = null;
        var timeout2 = null;
        var timeout3 = null;
        var running = false;
        var running2 = false;
        node.status({});

        this.on("input", function(msg) {            
            node.topi = msg.topic;
            if(running2 === true ) {
                var msg2 = RED.util.cloneMessage(msg);
                running2 = false;
                msg2.payload = node.payloadval;
                node.status({fill: "red", shape: "dot", text: "message send"});
                var t = undefined;
                try {
                    t = RED.util.evaluateNodeProperty(config.topic,config.topicType || "str",node,msg) || node.topi;
                }
                catch(e) { }
                if (t !== undefined) { msg2.topic = t; }
                node.send(msg2);
                timeout3 = setTimeout(function() {
                    running  = false;
                    running2 = false;
                    node.status({});
                    timeout3 = null;
                }, 2000);
            }
            if(running === false ) {
                running  = true;
                running2 = false;
                clearTimeout(timeout2);
                clearTimeout(timeout3);
                clearTimeout(timeout);
                timeout = null;
                timeout2 = null;
                node.status({fill: "green", shape: "dot", text: "running"});
                timeout = setTimeout(function() {
                    node.status({});
                    node.status({fill: "yellow", shape: "dot", text: "running2"});
                    running2  = true;
                    timeout2 = setTimeout(function() {
                        running  = false;                        
                        running2 = false;
                        node.status({});
                    }, node.delay2*1000);
                    timeout = null;
                }, node.delay1);
            }
        });
        this.on("close", function() {
            if (timeout) {
                clearTimeout(timeout);
            }
            if (timeout2) {
                clearTimeout(timeout2);
            }
            if (timeout3) {
                clearTimeout(timeout3);
            }
            node.status({});
        });
    }
    RED.nodes.registerType("delaytimer", DelayTimer);
}
