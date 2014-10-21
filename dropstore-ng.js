/* dropstore-ng v1.0.7 | (c) 2013 Jason Kulatunga, Inc. | http://analogj.mit-license.org/
 */

'use strict';

/* Services */
var DEVMODE = true;
// when true, all Dropbox Datastore ops are logged to the JavaScript console
// some critical errors and warnings are always logged, even if this is false
angular.module("recordWrapper", [])
.factory('recordWrapper', [function() {
    return function (record, fieldId){
        var _record = record;
        return {
            get mdl() { console.log('reading from mdl:'+fieldId, _record); return _record.get(fieldId); },
            set mdl(val) { console.log('write to mdl:'+fieldId, _record); _record.set(fieldId, val||''); }
        }


    }
}])


angular.module("dropstore-ng", []).
    factory('dropstoreClient', function($rootScope,$q,safeApply,dropstoreDatastoreManager, logger) {

        //Partially based on: https://gist.github.com/katowulf/5006634

        logger.log('Creating dropstoreClient');
        ///////////////////////////////////////////////////////////////////////
        // Configuration
        ///////////////////////////////////////////////////////////////////////

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
                        logger.log('dropstore "'+cmdName+'" returned error', err);
                        deferred.reject(err)
                    } else {
                        logger.log('dropstore "'+cmdName+'" returned successfully', res);
                        deferred.resolve(dropstoreDatastoreManager(res))
                    }
                });
            }
        }
        function basicDeferredCallback(deferred, cmdName){
            return function(err, res){
                safeApply($rootScope,function() {
                    if (err) {
                        logger.log('dropstore "'+cmdName+'" returned error', err);
                        deferred.reject(err)
                    } else {
                        logger.log('dropstore "'+cmdName+'" returned successfully', res);
                        deferred.resolve(res)
                    }
                });
            }
        }

        ///////////////////////////////////////////////////////////////////////
        // Public Methods
        ///////////////////////////////////////////////////////////////////////
        //should never be called directly, but is available for custom calls.
        var dropstoreService = {};
        /**
         * Dropbox API client representing an user or an application.
         * For an optimal user experience, applications should use a single client for all Dropbox interactions.
         * Maps directly to the Dropbox.Client constructor
         * @param options
         */
        dropstoreService.create = function(options){
            dropstoreService._client = new Dropbox.Client(options);
            return dropstoreService;
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

            dropstoreService._client.authenticate(options,authDeferredCallback(deferred, 'authenticate'));
            return deferred.promise;
        }
        dropstoreService.getDatastoreManager = function(){
            return dropstoreDatastoreManager(dropstoreService._client);
        }
        /**
         * Invalidates and forgets the user's Dropbox OAuth 2 access token.
         * This should be called when the user explicitly signs off from your application, to meet the users' expectation that after they sign out, their access tokens will not be persisted on the machine.
         * @param options
         * @returns {*}
         */
        dropstoreService.signOut = function(options){
            var deferred = $q.defer();
            dropstoreService._client.signOut(options,basicDeferredCallback(deferred, 'signOut'));
            return deferred.promise;
        }
        /**
         * Retrieves information about the logged in user.
         * @param options
         * @returns {*}
         */
        dropstoreService.getAccountInfo = function(options){
            var deferred = $q.defer();
            dropstoreService._client.getAccountInfo(options,basicDeferredCallback(deferred, 'getAccountInfo'));
            return deferred.promise;
        }
        ///////////////////////////////////////////////////////////////////////
        // Aliased Methods
        ///////////////////////////////////////////////////////////////////////
        var ctx = dropstoreService._client;
        dropstoreService.dropboxUid = function(){
            return dropstoreService._client.dropboxUid.apply(ctx, arguments);
        }
        dropstoreService.credentials = function(){
            return dropstoreService._client.credentials.apply(ctx, arguments);
        }
        dropstoreService.isAuthenticated = function(){
            return dropstoreService._client.isAuthenticated.apply(ctx, arguments);
        }
        dropstoreService.getUserInfo = function(){
            return dropstoreService._client.getUserInfo.apply(ctx, arguments);
        }

        return dropstoreService;
    })
    .factory('dropstoreDatastoreManager', function($rootScope,$q,safeApply, dropstoreDatastore, logger) {

        return function(_client){
            logger.log('Creating dropstoreDatastoreManager');
            ///////////////////////////////////////////////////////////////////////
            // Private Methods
            ///////////////////////////////////////////////////////////////////////
            function managerDeferredCallback(deferred, cmdName){
                return function(err, res){
                    safeApply($rootScope, function() {
                        if (err) {
                            logger.log('dropstore "'+cmdName+'" returned error', err);
                            deferred.reject(err)
                        } else {
                            logger.log('dropstore "'+cmdName+'" returned successfully', res);
                            deferred.resolve(dropstoreDatastore(dropstoreDatastoreManagerService, res))
                        }
                    });
                }
            }
            function basicDeferredCallback(deferred, cmdName){
                return function(err, res){
                    safeApply($rootScope,function() {
                        if (err) {
                            logger.log('dropstore "'+cmdName+'" returned error', err);
                            deferred.reject(err)
                        } else {
                            logger.log('dropstore "'+cmdName+'" returned successfully', res);
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
             * @param datastoreId
             * @returns {*} Dropbox.Datastore
             */
            dropstoreDatastoreManagerService.openDatastore =  function(datastoreId) {
                var deferred = $q.defer();
                dropstoreDatastoreManagerService._datastoreManager.openDatastore(datastoreId, managerDeferredCallback(deferred, 'openDatastore'));
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
             * @param datastoreId
             * @returns {*} null
             */
            dropstoreDatastoreManagerService.deleteDatastore =  function(datastoreId) {
                var deferred = $q.defer();
                dropstoreDatastoreManagerService._datastoreManager.deleteDatastore(datastoreId, basicDeferredCallback(deferred, 'deleteDatastore'));
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
            /**
             * Shuts down the DatastoreManager. All Dropbox.Datastore instances obtained through this DatastoreManager become invalid.
             * @returns {*} void
             */
            dropstoreDatastoreManagerService.close =  function() {
                return dropstoreDatastoreManagerService._datastoreManager.close();
            }

            ///////////////////////////////////////////////////////////////////////
            // Public PUBSUB Methods // Listen for Datasource Changes.
            ///////////////////////////////////////////////////////////////////////
            var datastoreListChangedHandler = function(callback){
                return function(arr){
                    safeApply($rootScope, function(){
                        callback(arr);
                    });
                }
            }
            dropstoreDatastoreManagerService.SubscribeDatastoreListChanged = function(callback){
                var fn = datastoreListChangedHandler(callback);
                dropstoreDatastoreManagerService._datastoreManager.datastoreListChanged.addListener();
                return fn;
            }
            dropstoreDatastoreManagerService.UnsubscribeDatastoreListChanged = function(fn){
                dropstoreDatastoreManagerService._datastoreManager.datastoreListChanged.removeListener(fn);
            }

            return dropstoreDatastoreManagerService;
        }
    })
    .factory('dropstoreDatastore', function($rootScope,$q,safeApply, logger) {

        return function(datastoreManager,datastore){
            logger.log('Creating dropstoreDatastore');

            ///////////////////////////////////////////////////////////////////////
            // Private Methods
            ///////////////////////////////////////////////////////////////////////
            function immediateDeferredCallback(deferred, value, cmdName){

                safeApply($rootScope,function() {
                    logger.log('dropstore "'+cmdName+'" returned successfully', value);
                    deferred.resolve(value)
                });
            }
            function basicDeferredCallback(deferred, cmdName){
                return function(err, res){
                    safeApply($rootScope,function() {
                        if (err) {
                            logger.log('dropstore "'+cmdName+'" returned error', err);
                            deferred.reject(err)
                        } else {
                            logger.log('dropstore "'+cmdName+'" returned successfully', res);
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



            ///////////////////////////////////////////////////////////////////////
            // Aliased Methods
            ///////////////////////////////////////////////////////////////////////
            var ctx = dropstoreDatastoreService._datastore;
            dropstoreDatastoreService.getTable = function(){
                return dropstoreDatastoreService._datastore.getTable.apply(ctx,arguments);
            }
            dropstoreDatastoreService.listTableIds = function(){
                return dropstoreDatastoreService._datastore.listTableIds.apply(ctx, arguments);
            }
            dropstoreDatastoreService.close = function(){
                return dropstoreDatastoreService._datastore.close.apply(ctx, arguments);
            }
            dropstoreDatastoreService.getId = function(){
                return dropstoreDatastoreService._datastore.getId.apply(ctx, arguments);
            }
            dropstoreDatastoreService.getSyncStatus = function(){
                return dropstoreDatastoreService._datastore.getSyncStatus.apply(ctx, arguments);
            }

            ///////////////////////////////////////////////////////////////////////
            // Public PUBSUB Methods // Listen for Datasource Changes.
            ///////////////////////////////////////////////////////////////////////
            var datastoreEventHandler = function(callback){
                return function(arr){
                    safeApply($rootScope, function(){
                        callback(arr);
                    });
                }
            }
            dropstoreDatastoreService.SubscribeRecordsChanged = function(callback, tableid){
                var fn = function(){};
                if(tableid){
                    fn = datastoreEventHandler(function(event){
                        var records = event.affectedRecordsForTable(tableid);
                        callback(records);
                    });
                }
                else{
                    fn = datastoreEventHandler(callback);
                }

                dropstoreDatastoreService._datastore.recordsChanged.addListener(fn);
                return fn;
            }
            dropstoreDatastoreService.SubscribeSyncStatusChanged = function(fn){
                var fn = datastoreEventHandler(callback);
                dropstoreDatastoreService._datastore.syncStatusChanged.addListener(fn);
                return fn;
            }

            dropstoreDatastoreService.UnsubscribeSyncStatusChanged = function(fn){
                dropstoreDatastoreService._datastore.syncStatusChanged.removeListener(fn);
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
    .provider('logger', function(){
		this.DEVMODE = false;
		
		this.setDEVMODE = function(devmode){
			this.DEVMODE = devmode;
		}
		
		this.$get = ['$window',function($window) {
			var DEVMODE = this.DEVMODE;
			var logger = {};
			logger.log = function(){
				DEVMODE && console.log.apply(console, arguments);
			}
			logger.always = function(){
				console.log.apply(console, arguments);
			}
			return logger;
		}]		
	})
	.config(function(loggerProvider){
        loggerProvider.setDEVMODE(true);
    });



