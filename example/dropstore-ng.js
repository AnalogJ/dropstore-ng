'use strict';

/* Services */

angular.module("dropstore-ng", []).
    factory('dropstoreClient', function($rootScope,$q,safeApply,dropstoreDatastoreManager) {
        //Partially based on: https://gist.github.com/katowulf/5006634
        var dropstoreService = {};
        console.log('Creating dropstoreClient');
        ///////////////////////////////////////////////////////////////////////
        // Configuration
        ///////////////////////////////////////////////////////////////////////
        var APP_KEY = '3xqz1dtko5plr99';

        // when true, all Dropbox Datastore ops are logged to the JavaScript console
        // some critical errors and warnings are always logged, even if this is false
        var DEVMODE = true;

        // create a dummy console object for dummy IE
        //if( typeof(console) === 'undefined' ) {
        //    var f = function(){};
        //    var console = { log: f, info: f, warn: f, error: f };
        //}

        //add support for 'trim' to sad and lonely browsers
        if (!String.prototype.trim) {
            //code for trim
            String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
        }

        ///////////////////////////////////////////////////////////////////////
        // Private Methods
        ///////////////////////////////////////////////////////////////////////
        function authDeferredCallback(deferred, cmdName){
            return function(err, res){
                safeApply($rootScope, function() {
                    if (err) {
                        DEVMODE && console.log('dropstore "'+cmdName+'" returned error', err);
                        deferred.reject(err)
                    } else {
                        DEVMODE && console.log('dropstore "'+cmdName+'" returned successfully', res);
                        deferred.resolve(dropstoreDatastoreManager(res,DEVMODE))
                    }
                });
            }
        }

        ///////////////////////////////////////////////////////////////////////
        // Public Methods
        ///////////////////////////////////////////////////////////////////////
        //should never be called directly, but is available for custom calls.

        dropstoreService._client = new Dropbox.Client({key: APP_KEY});
        /**
         * Dropbox API client representing an user or an application.
         * For an optimal user experience, applications should use a single client for all Dropbox interactions.
         * Maps directly to the Dropbox.Client constructor
         * @param options
         */
        dropstoreService.client = function(options){
            dropstoreService._client = new Dropbox.Client(options);
        }

        /**
         *  Authenticates the app's user to Dropbox's API server.
         *  In most cases, the process will involve sending the user to an authorization server on the Dropbox servers.
         *  If the user clicks "Allow", the application will be authorized. If the user clicks "Deny", the method will
         *  pass a Dropbox.AuthError to its callback, and the error's code will be {Dropbox.AuthError.ACCESS_DENIED}.
         *
         *  To manually start: add a button to your app and then add the following code to its click handler.
         *  dropstoreService.authenticate();
         */
        dropstoreService.authenticate =  function(options) {
            var deferred = $q.defer();
            if(options){
                dropstoreService._client.authenticate(options,authDeferredCallback(deferred, 'authenticate'));
                return deferred.promise;
            }
            else{
                dropstoreService._client.authenticate();
            }
        }
        dropstoreService.getDatastoreManager = function(){
            return dropstoreDatastoreManager(dropstoreService._client,DEVMODE);
        }




        return dropstoreService;
    })
    .factory('dropstoreDatastoreManager', function($rootScope,$q,safeApply, dropstoreDatastore) {

        return function(_client, DEVMODE){
            DEVMODE = DEVMODE || false;
            console.log('Creating dropstoreDatastoreManager');
            ///////////////////////////////////////////////////////////////////////
            // Private Methods
            ///////////////////////////////////////////////////////////////////////
            function managerDeferredCallback(deferred, cmdName){
                return function(err, res){
                    safeApply($rootScope, function() {
                        if (err) {
                            DEVMODE && console.log('dropstore "'+cmdName+'" returned error', err);
                            deferred.reject(err)
                        } else {
                            DEVMODE && console.log('dropstore "'+cmdName+'" returned successfully', res);
                            deferred.resolve(dropstoreDatastore(dropstoreDatastoreManagerService, res,DEVMODE))
                        }
                    });
                }
            }
            function basicDeferredCallback(deferred, cmdName){
                return function(err, res){
                    safeApply($rootScope,function() {
                        if (err) {
                            DEVMODE && console.log('dropstore "'+cmdName+'" returned error', err);
                            deferred.reject(err)
                        } else {
                            DEVMODE && console.log('dropstore "'+cmdName+'" returned successfully', res);
                            deferred.resolve(res)
                        }
                    });
                }
            }

            ///////////////////////////////////////////////////////////////////////
            // Public Methods
            ///////////////////////////////////////////////////////////////////////
            //should never be called directly, but is available for custom calls.
            var dropstoreDatastoreManagerService = {};
            dropstoreDatastoreManagerService._client = _client;
            dropstoreDatastoreManagerService._datastoreManager = dropstoreDatastoreManagerService._client.getDatastoreManager();

            /**
             * Asynchronously opens your app's default datastore for the current user, then returns promise with the corresponding Datastore object (or an error).
             * @returns {*} Dropbox.Datastore
             */
            dropstoreDatastoreManagerService.openDefaultDatastore =  function() {
                var deferred = $q.defer();
                dropstoreDatastoreManagerService._datastoreManager.openDefaultDatastore(managerDeferredCallback(deferred, 'openDefaultDatastore'));
                return deferred.promise;
            }
            /**
             * Asynchronously opens the datastore with the given ID, then calls callback with the corresponding Datastore object (or an error).
             * TODO: documentation looks incorrect: No parameters.
             * @returns {*} Dropbox.Datastore
             */
            dropstoreDatastoreManagerService.openDatastore =  function() {
                var deferred = $q.defer();
                dropstoreDatastoreManagerService._datastoreManager.openDatastore(managerDeferredCallback(deferred, 'openDatastore'));
                return deferred.promise;
            }
            /**
             * Asynchronously creates a new datastore, then calls callback with the corresponding Datastore object (or an error).
             * TODO: documentation looks incorrect: No parameters.
             * @returns {*} Dropbox.Datastore
             */
            dropstoreDatastoreManagerService.createDatastore =  function() {
                var deferred = $q.defer();
                dropstoreDatastoreManagerService._datastoreManager.createDatastore(managerDeferredCallback(deferred, 'createDatastore'));
                return deferred.promise;
            }
            /**
             * Asynchronously deletes the datastore with the given ID, then calls callback.
             * Deleting a nonexistent datastore is not considered an error.
             * TODO: documentation looks incorrect: No parameters.
             * @returns {*} null
             */
            dropstoreDatastoreManagerService.deleteDatastore =  function() {
                var deferred = $q.defer();
                dropstoreDatastoreManagerService._datastoreManager.deleteDatastore(basicDeferredCallback(deferred, 'deleteDatastore'));
                return deferred.promise;
            }
            /**
             * Asynchronously retrieves the list of datastores accessible to your app as the current user, then calls callback with the result (or an error).
             * After creating or deleting a datastore, there may be a delay before the datastore appears/disappears from the list of datastores.
             * @returns {*} Array<String>
             */
            dropstoreDatastoreManagerService.listDatastoreIds =  function() {
                var deferred = $q.defer();
                dropstoreDatastoreManagerService._datastoreManager.listDatastoreIds(basicDeferredCallback(deferred, 'listDatastoreIds'));
                return deferred.promise;
            }

            return dropstoreDatastoreManagerService;
        }
    })
    .factory('dropstoreDatastore', function($rootScope,$q,safeApply) {

        return function(datastoreManager,datastore, DEVMODE){
            DEVMODE = DEVMODE || false;
            console.log('Creating dropstoreDatastore');

            ///////////////////////////////////////////////////////////////////////
            // Private Methods
            ///////////////////////////////////////////////////////////////////////
            function immediateDeferredCallback(deferred, value, cmdName){

                safeApply($rootScope,function() {
                        DEVMODE && console.log('dropstore "'+cmdName+'" returned successfully', value);
                        deferred.resolve(value)
                    });
            }
            function basicDeferredCallback(deferred, cmdName){
                return function(err, res){
                    safeApply($rootScope,function() {
                        if (err) {
                            DEVMODE && console.log('dropstore "'+cmdName+'" returned error', err);
                            deferred.reject(err)
                        } else {
                            DEVMODE && console.log('dropstore "'+cmdName+'" returned successfully', res);
                            deferred.resolve(res)
                        }
                    });
                }
            }

            ///////////////////////////////////////////////////////////////////////
            // Public Methods
            ///////////////////////////////////////////////////////////////////////
            //should never be called directly, but is available for custom calls.
            var dropstoreDatastoreService = {};
            dropstoreDatastoreService._datastore = datastore;
            dropstoreDatastoreService._datastoreManager = datastoreManager;


            /**
             * Creates a Table instance for a given table ID.
             * @returns {*} Dropbox.Datastore
             */
            dropstoreDatastoreService.getTable =  function(tableId) {
                var deferred = $q.defer();
                immediateDeferredCallback(deferred,dropstoreDatastoreService._datastore.getTable(tableId),'getTable:'+tableId);
                return deferred.promise;
            }
            /**
             * The IDs of all the tables in this datastore.
             * Tables that contain no records are not listed.
             * @returns {*} Dropbox.Datastore
             */
            dropstoreDatastoreService.listTableIds =  function() {
                var deferred = $q.defer();
                immediateDeferredCallback(deferred,dropstoreDatastoreService._datastore.listTableIds(),'listTableIds');
                return deferred.promise;
            }
            /**
             * Closes the datastore.
             * After a call to Dropbox.Datastore#close, you can no longer call methods that read or modify tables or records of the datastore.
             * @returns {*}
             */
            dropstoreDatastoreService.close =  function() {
                var deferred = $q.defer();
                immediateDeferredCallback(deferred,dropstoreDatastoreService._datastore.close(),'close');
                return deferred.promise;
            }
            /**
             * Returns this datastore's ID.
             * @returns {*}
             */
            dropstoreDatastoreService.getId =  function() {
                return dropstoreDatastoreService._datastore.getId();
            }
            /**
             * Returns an object representing the sync status of the datastore.
             * The returned object has a single property:
             * uploading: true if there are changes to the datastore that have not been synced to the server yet. This can happen if, for example, the application is temporarily offline.
             * @returns {*} Dropbox.Datastore
             */
            dropstoreDatastoreService.getSyncStatus =  function() {
                var deferred = $q.defer();
                immediateDeferredCallback(deferred,dropstoreDatastoreService._datastore.getSyncStatus(),'getSyncStatus');
                return deferred.promise;
            }

            ///////////////////////////////////////////////////////////////////////
            // Public PUBSUB Methods // Listen for Datasource Changes.
            ///////////////////////////////////////////////////////////////////////
            dropstoreDatastoreService._cache = {}; //for PUBSUB functionality.
            var _isListening = false;
            function isListeningToUpdates(){
                return _isListening;
            }
            var eventHandler = function (event) {
                console.log('inside event handler')
                var updates = event.affectedRecordsByTable();

                for(var key in updates){
                    var records = updates[key]
                    console.log(records);
                    if(dropstoreDatastoreService._cache[key]){
                        dropstoreDatastoreService.publish(key, records);
                    }
                }
            }
            function startListeningToUpdates(){
                _isListening = true;
                DEVMODE && console.log('dropstore started listening for updates');
                dropstoreDatastoreService._datastore.recordsChanged.addListener(eventHandler);

            }
            function stopListeningToUpdates(){
                _isListening = false;
                DEVMODE && console.log('dropstore stopped listening for updates');
                dropstoreDatastoreService._datastore.recordsChanged.removeListener(eventHandler)
            }

            dropstoreDatastoreService.subscribe = function(topic){
                if(!dropstoreDatastoreService._cache[topic]){
                    dropstoreDatastoreService._cache[topic] = 0;
                }
                dropstoreDatastoreService._cache[topic] += 1; //increment the subscriber counter for the topic.
                if(!isListeningToUpdates()){
                    startListeningToUpdates();
                }
                //return the fully qualified topic to listen to.
                return  '/'+dropstoreDatastoreService.getId()+'/'+topic;
            }
            dropstoreDatastoreService.unsubscribe = function(topic){

                if(!dropstoreDatastoreService._cache[topic]){
                    dropstoreDatastoreService._cache[topic] = 0;
                }
                dropstoreDatastoreService._cache[topic]-= 1;
                if(dropstoreDatastoreService._cache[topic]<=0){
                    delete dropstoreDatastoreService._cache[topic];
                }
                var prop_count = 0;
                for(var prop in dropstoreDatastoreService._cache[topic]){
                    prop_count++;
                }
                if(prop_count == 0){
                    stopListeningToUpdates();
                }
            }
            dropstoreDatastoreService.publish = function(topic,records){
                $rootScope.$broadcast('/'+dropstoreDatastoreService.getId()+'/'+topic, records);
            }
            return dropstoreDatastoreService;
        }
    }).factory('safeApply', [function($rootScope) {
        return function($scope, fn) {
            var phase = $scope.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if (fn) {
                    $scope.$eval(fn);
                }
            } else {
                if (fn) {
                    $scope.$apply(fn);
                } else {
                    $scope.$apply();
                }
            }
        }
    }])
