/**
 * Created with JetBrains WebStorm.
 * User: Jason
 * Date: 7/9/13
 * Time: 4:36 PM
 * To change this template use File | Settings | File Templates.
 */
angular.module('testApp.controllers', [])
    //Panel Controllers
    .controller('pageTestCtrl', function ($scope, $rootScope, dropstoreClient) {
        var _datastore = null;
        $scope.tasks = [];
        dropstoreClient.authenticate({interactive: true})
            .then(function(datastoreManager){
                console.log('completed authentication');
                return datastoreManager.openDefaultDatastore();
            })
            .then(function(datastore){
                console.log('completed openDefaultDatastore');
                _datastore = datastore;

                //start listening to updates to the tasks table.
                var fqtopic = datastore.subscribe('tasks');

                $rootScope.$on(fqtopic, function(event, records) {
                    console.log(records[fqtopic]);
                    for(var ndx in records){
                        console.log(records[ndx].get('taskname'));
                        $scope.tasks.push(records[ndx]);
                    }
                });

                return datastore.getTable('tasks');
            })
            .then(function(taskTable){
                $scope.tasks =  taskTable.query();
            });

        $scope.newTaskName = '';
        $scope.handleNewTask = function(){
            _datastore.getTable('tasks')
                .then(function(taskTable){
                    var firstTask = taskTable.insert({
                        taskname: $scope.newTaskName,
                        completed: false,
                        created: new Date()
                    });
                })
        }



    })