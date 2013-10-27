dropstore-ng
============

dropstore-ng is a set of [AngularJS](http://angularjs.org/) bindings for [Dropbox Datastore](https://www.dropbox.com/developers/datastore).
With Dropbox Datastore, AngularJS and dropstore-ng you can easily create completely serverless client-side applications with syncing across multiple devices !

The bindings wrap the first three tiers (Client, DatastoreManager, Datastore) of the Dropbox Datastore API within
[Angular Promises](http://docs.angularjs.org/api/ng.$q). This is because only the first three tiers use callbacks and because
 it creates a easy to follow chain of async function calls rather than the hell usually associated with callback heavy libraries.
 The Dropbox Datastore API is also wrapped with promises to create a
simple way to ensure that the AngularJS scope is updated properly. dropstore-ng also provides AngularJS publish/subscribe functionality
allowing applications to listen for local and/or remote updates to the datastores.


### Live Demo: <a target="_blank" href="https://dropstore-ng.herokuapp.com/">Real-time TODO app</a>.

Check out the `example-todo` branch for more the live demo code.

Usage
-----
Include [dropbox javascript sdk](https://www.dropbox.com/developers/datastore/sdks/js), angular.js and dropstore-ng.js in your application.

```html
<script src="https://www.dropbox.com/static/api/dropbox-datastores-1.0-latest.js" type="text/javascript"></script>
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js"></script>
<script src="dropstore-ng.js"></script>
```

Add the module `dropstore-ng` as a dependency to your app module:

```js
var myapp = angular.module('myapp', ['dropstore-ng']);
```

Quick Start
----------------------------------

Set `dropstoreClient` as a service dependency in your controller:

```js
myapp.controller('MyCtrl', ['$scope', 'dropstoreClient',
  function MyCtrl($scope, dropstoreClient) {
    ...
  }
]);
```

Create an `authentication` handler that will be called when the controller first loads.
dropstore-ng just wraps the standard [authenticate](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Client.authenticate)
 method inside of a promise. The success callback of the authenticate method is a modified [datastoreManager](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Datastore.DatastoreManager) object.

```js
$scope.tasks = [];
dropstoreClient.create({key: 'YOUR_APP_KEY_HERE'})
    .authenticate({interactive: true})
    .then(function(datastoreManager){
        console.log('completed authentication');
        return datastoreManager.openDefaultDatastore();
    });
```

the datastoreManager and the datastore objects has been modified such that their instance methods are wrapped in promises:

```js
    ...
    .then(function(datastore){
        var taskTable = datastore.getTable('tasks');
        $scope.tasks =  taskTable.query();
    })
```

You can display the datastore report items using the standard Dropbox Datastore API commands:

```html
<ul>
    <li ng-repeat="task in tasks">
       {{task.get('taskname')}}
    </li>
</ul>
```
See the source for the
[controller behind the todo app](http://analogj.github.com/dropstore-ng/example/todo/controllers.js)
for a working example including syncing changes.

Dropbox Datastore API and Promises
-----------
As I stated above, only the first three tiers of the Dropbox Datastore API are wrapped in AngularJS Promises.
Only methods that make use of callbacks are wrapped in promises, all other instance methods are passed through like usual.
I've included the full documentation on the modified instance methods, and how to use them, below:

###Dropbox Client
-----------
All unmentioned instance methods for the standard Dropbox.Client are transparently aliased. Only wrapped/changed functionality  methods are documented here. Refer to
[Dropbox SDK Documentation for Dropbox.Client](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Client) for more information.

####dropstoreClient.create
alias for [Dropbox.client.constructor](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Client)

####dropstoreClient.authenticate
[Dropbox.Client.authenticate](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Client.authenticate) has been wrapped in a promise, such that the callback parameter is not necessary.
On success, a [dropstoreDatastoreManager](#dropbox-datastore-datastoremanager) object is returned, which wraps the [Dropbox.Datastore.DatastoreManager](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Datastore.DatastoreManager)
```js
    dropstoreClient.authenticate({interactive: true})
        .then(function(datastoreManager){
            console.log('auth successful');
            ..
        }, function(error){
            console.log('auth failure');
            ..
        };
```

####dropstoreClient.getDatastoreManager
[Dropbox.Client.getDatastoreManager](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Client.getDatastoreManager) has been modified to return a [dropstoreDatastoreManager](#dropbox-datastore-datastoremanager), which wraps the standard [Dropbox.Datastore.DatastoreManager](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Datastore.DatastoreManager) in promises.

####dropstoreClient.signOut
[Dropbox.Client.signOut](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Client.signOut) has been wrapped in a promise, such that the callback parameter is not necessary.
On success nothing is returned, however failures will passthrough a [Dropbox.ApiError](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.ApiError) object
```js
    dropstoreClient.signOut({mustInvalidate: true})
        .then(function(){
            console.log('signout successful');
            ..
        }, function(error){
            console.log('signout failure');
            ..
        };
```

####dropstoreClient.getAccountInfo
[Dropbox.Client.getAccountInfo](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Client.getAccountInfo) has been wrapped in a promise, such that the callback parameter is not necessary.
On success the Dropbox.AccountInfo object will be passed through and failures will passthrough a [Dropbox.ApiError](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.ApiError) object
```js
    dropstoreClient.getAccountInfo({httpCache: true})
        .then(function(accountInfo){
            console.log('getAccountIno successful');
            ..
        }, function(error){
            console.log('getAccountInfo failure');
            ..
        };
```

####Other methods
[Dropbox.Client](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Client) has many methods. Currently only the following methods are transparently aliased to the Client.
`dropstoreClient.dropboxUid`, `dropstoreClient.credentials`, `dropstoreClient.isAuthenticated`, `dropstoreClient.getUserInfo`

###Dropbox Datastore DatastoreManager
-----------
All unmentioned instance methods for the standard Dropbox.Datastore.DatastoreManager are transparently aliased. Only wrapped/changed functionality  methods are documented here. Refer to
[Dropbox SDK Documentation for Dropbox.Datastore.DatastoreManager](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Datastore.DatastoreManager) for more information.


####dropstoreDatastoreManager.openDefaultDatastore
[Dropbox.Datastore.DatastoreManager.openDefaultDatastore](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Datastore.DatastoreManager.openDefaultDatastore) has been wrapped in a promise, such that the callback parameter is not necessary.
On success, a [dropstoreDatastore](#dropbox-datastore) object is returned, which wraps the [Dropbox.Datastore](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Datastore).
Failures will passthrough a [Dropbox.ApiError](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.ApiError) object
```js
    dropstoreDatastoreManager.openDefaultDatastore()
        .then(function(datastore){
            console.log('openDefaultDatastore successful');
            ..
        }, function(error){
            console.log('openDefaultDatastore failure');
            ..
        };
```
####dropstoreDatastoreManager.openDatastore dropstoreDatastoreManager.createDatastore
`openDatastore` and `createDatastore` follow the pattern listed above.
On success, a [dropstoreDatastore](#dropbox-datastore) object is returned, which wraps the [Dropbox.Datastore](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Datastore).
Failures will passthrough a [Dropbox.ApiError](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.ApiError) object

####dropstoreDatastoreManager.listDatastoreIds
[Dropbox.Datastore.DatastoreManager.listDatastoreIds](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Datastore.DatastoreManager.listDatastoreIds) has been wrapped in a promise, such that the callback parameter is not necessary.
On success, a `Array<String>` is returned, which lists the IDs of all accessible datastores.
Failures will passthrough a [Dropbox.ApiError](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.ApiError) object
```js
    dropstoreDatastoreManager.listDatastoreIds()
        .then(function(datastore){
            console.log('listDatastoreIds successful');
            ..
        }, function(error){
            console.log('listDatastoreIds failure');
            ..
        };
```

####dropstoreDatastoreManager.deleteDatastore
[Dropbox.Datastore.DatastoreManager.deleteDatastore](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Datastore.DatastoreManager.deleteDatastore) has been wrapped in a promise, such that the callback parameter is not necessary.
On success nothing is returned
Failures will passthrough a [Dropbox.ApiError](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.ApiError) object
```js
    dropstoreDatastoreManager.deleteDatastore()
        .then(function(){
            console.log('deleteDatastore successful');
            ..
        }, function(error){
            console.log('deleteDatastore failure');
            ..
        };
```
####dropstoreDatastoreManager.DatastoreListChanged Event
dropstore-ng allows you to easily subscribe and unsubscribe from dropbox.js events, and ensure that your $scope is updated properly.

```js
    //to subscribe to changes..
    var ptr = datastoreManager.SubscribeDatastoreListChanged(function(datastoreListids){
        for(var ndx in datastoreListids){
            console.log(datastoreListids[ndx]);
            $scope.ids = datastoreListids;
        }
    });

    //and to unsubscribe
    datastoreManager.UnsubscribeDatastoreListChanged(ptr);

```


###Dropbox Datastore
-----------
All unmentioned instance methods for the standard Dropbox.Datastore are transparently aliased. Only wrapped/changed functionality  methods are documented here. Refer to
[Dropbox SDK Documentation for Dropbox.Datastore](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Datastore) for more information.


####dropstoreDatastore.SyncStatusChanged  Event
dropstore-ng allows you to easily subscribe and unsubscribe from dropbox.js events, and ensure that your $scope is updated properly.

```js
    //to subscribe to all record changes..
    var ptr = datastore.SubscribeSyncStatusChanged (function(){
        console.log('sync status changed');
    });

    //and to unsubscribe
    datastore.UnsubscribeSyncStatusChanged (ptr);
```

####dropstoreDatastore.RecordsChanged Event
dropstore-ng allows you to easily subscribe and unsubscribe from dropbox.js events, and ensure that your $scope is updated properly.
The `SubscribeRecordsChanged` method also takes a optional secondary parameter `tableid` that automatically retrieves the records that changed for a specific table.

```js
    //to subscribe to all record changes..
    var ptr = datastore.SubscribeRecordsChanged(function(event){
        var records = event.affectedRecordsForTable('tasks');
        for(var ndx in records){
            console.log(records[ndx].get('taskname'));
            $scope.tasks.push(records[ndx]);
        }
    });

    //with optional tableid parameter
    var ptr = datastore.SubscribeRecordsChanged(function(records){
        for(var ndx in records){
            console.log(records[ndx].get('taskname'));
            $scope.tasks.push(records[ndx]);
        }
    }, 'tasks');

    //and to unsubscribe
    datastore.UnsubscribeRecordsChanged(ptr);
```


TODO
-----------
- [Dropbox.Client](https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Client) has many methods. Currently only the methods directly related to account information or authentication are handled, other file related instance methods should be coming shortly.
- Tests for the dropstore-ng framework are coming shortly.

Pull Requests
-----------
To make a pull request, please do the following:

Mention what specific version of dropbox.js and dropstore-ng.js you were using when you encountered the issue/added the feature. This can be accessed by looking at the dropstore-ng.js file header.
Provide a pastie or gist that demonstrates the bug/feature
Do not modify the version header. I will modify that manually when merging the request


License
-------
Copyright (c) 2013 Jason Kulatunga, released under the [MIT license](http://analogj.mit-license.org/)
