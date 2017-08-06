/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Solace Systems Web Messaging API for JavaScript
 * PublishSubscribe tutorial - Topic Subscriber
 * Demonstrates subscribing to a topic for direct messages and receiving messages
 */

/*jslint es6 browser devel:true*/
/*global solace*/


var TopicSubscriber = function (topicName) {
    "use strict";
    var subscriber = {};
    var idx = 0;
    subscriber.session = null;
    subscriber.topicName = topicName;
    subscriber.subscribed = false;

    // Logger
    subscriber.log = function (line) {
        var now = new Date();
        var time = [('0' + now.getHours()).slice(-2), ('0' + now.getMinutes()).slice(-2), ('0' + now.getSeconds()).slice(-2)];
        var timestamp = '[' + time.join(':') + '] ';
        console.log(timestamp + line);
        var logTextArea = document.getElementById('log');
        logTextArea.value += timestamp + line + '\n';
        logTextArea.scrollTop = logTextArea.scrollHeight;
    };
    // Logger
    subscriber.xmllog = function (xmlstr) {
        var xmlDoc = $.parseXML(xmlstr);
        var titles = xmlDoc.getElementsByTagName("Title")[0];
        var dtimes = xmlDoc.getElementsByTagName("DateTime")[0];
        var poffices = xmlDoc.getElementsByTagName("PublishingOffice")[0];
        var title = titles.childNodes[0];
        var dtime = dtimes.childNodes[0];
        var poffice = poffices.childNodes[0];
        idx = idx + 1;
        //var titles = $(xmlDoc).find("Title").text();
        //var dtimes = $(xmlDoc).find("DateTime").text();
        var adddata = {id: idx, title: title.nodeValue, puboffice: poffice.nodeValue, dtime: dtime.nodeValue};


        $('#list').addRowData(undefined, adddata);

    };


    subscriber.log('\n*** Subscriber to topic "' + subscriber.topicName + '" is ready to connect ***');

    // Callback for message events
    //subscriber.messageEventCb = function (session, message) {
    //    var msg = message.getBinaryAttachment();
    //    subscriber.log('Received message: "' + decodeURIComponent(escape(msg)) + '"');
    //};


    // Establishes connection to Solace router
    subscriber.connect = function () {
        if (subscriber.session !== null) {
            subscriber.log('Already connected and ready to subscribe.');
        } else {
            var host = document.getElementById('host').value;
            if (host) {
                subscriber.connectToSolace(host);
            } else {
                subscriber.log('Cannot connect: please specify the Solace router web transport URL.');
            }
        }
    };

    subscriber.connectToSolace = function (host) {
        subscriber.log('Connecting to Solace router web transport URL ' + host + '.');

        var clientId = "JavaScriptClient-"+(Math.floor(Math.random() * 100000));
        //client = new Paho.MQTT.Client(host, Number(1895), "/", clientId);
        subscriber.session = new Paho.MQTT.Client(host, Number(1895), "/", clientId);

        // Callback設定
        subscriber.session.onConnectionLost = onConnectionLost;
        subscriber.session.onMessageArrived = onMessageArrived;


        subscriber.log('Client username: ' + 'hakuser');

        subscriber.session.connect({
            onSuccess:onConnect,
            onFailure:onFailure,
            userName:'hackuser', 
            password:'hackuser' 
        });

        function onConnect() {
          // subscribeするTopics設定
          //  subscriber.subscribeTopic(subscriber.topicName);
            subscriber.log('Connecting to Solace router - Success!');
        }

        function onFailure(failure) {
        //    console.log("failure:"+failure.errorMessage);
            subscriber.log("failure:"+failure.errorMessage);
        }

        // コネクション切断Callback
        function onConnectionLost(responseObject) {
          if (responseObject.errorCode !== 0) {
          //  console.log("onConnectionLost:"+responseObject.errorMessage);
            subscriber.log("onConnectionLost:"+responseObject.errorMessage);
          }
        }

        // messeage到達Callback
        function onMessageArrived(message) {
        //  console.log("onMessageArrived:"+message.payloadString);
          subscriber.log("onMessageArrived:"+message.payloadString);
          subscriber.xmllog(message.payloadString);
        }
    };

    // Gracefully disconnects from Solace router
    subscriber.disconnect = function () {
        subscriber.log('Disconnecting from Solace router...');
        if (subscriber.session !== null) {
            try {
                subscriber.session.disconnect();
                subscriber.session = null;
                subscriber.subscribed = false;
                subscriber.log('Disconnected!');
            } catch (error) {
                subscriber.log(error.toString());
            }
        } else {
            subscriber.log('Not connected to Solace router.');
        }
    };

    // Subscribes to topic on Solace Router
    subscriber.subscribe = function () {
        if (subscriber.session !== null) {
            if (subscriber.subscribed) {
                subscriber.log('Already subscribed to "' + subscriber.topicName + '" and ready to receive messages.');
            } else {
                            subscriber.topicName = document.getElementById('topic').value;

                subscriber.log('Subscribing to topic: ' + subscriber.topicName);
                subscriber.session.subscribe(subscriber.topicName);
                subscriber.subscribed = true;
            }
        } else {
            subscriber.log('Cannot subscribe because not connected to Solace router.');
        }
    };

    // Unsubscribes from topic on Solace Router
    subscriber.unsubscribe = function () {
        if (subscriber.session !== null) {
            if (subscriber.subscribed) {
                subscriber.log('Unsubscribing from topic: ' + subscriber.topicName);
                subscriber.session.unsubscribe(subscriber.topicName);
                subscriber.subscribed = false;
                subscriber.log('Unsubscribed!');
            } else {
                subscriber.log('Cannot unsubscribe because not subscribed to the topic "' + subscriber.topicName + '"');
            }
        } else {
            subscriber.log('Cannot unsubscribe because not connected to Solace router.');
        }
    };

    return subscriber;
};
