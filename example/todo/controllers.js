/**
 * Created with JetBrains WebStorm.
 * User: Jason
 * Date: 7/9/13
 * Time: 4:36 PM
 * To change this template use File | Settings | File Templates.
 */
angular.module('testApp.controllers', [])
    //Panel Controllers
    .controller('pageTestCtrl', function ($scope, $rootScope,safeApply, dropstoreClient) {
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

                _datastore.SubscribeTableRecordsChanged(function(records){

                    for(var ndx in records){
                        console.log(records[ndx].get('taskname'));

                        $scope.tasks.push(records[ndx]);
                    }
                },'tasks');

                /*var fqtopic = datastore.subscribe('tasks');

                $rootScope.$on(fqtopic, function(event, records) {
                    console.log('record added', records);
                    for(var ndx in records){
                        console.log(records[ndx].get('taskname'), 'current tasks', $scope.tasks);

                        $scope.tasks.push(records[ndx]);
                    }
                    safeApply($scope); //todo:for some reason the $on function is not updating the scope properly when updates occur on non-local browser.
                });
                */
                var taskTable = datastore.getTable('tasks');
                $scope.tasks =  taskTable.query();
            })

        $scope.newTaskName = '';
        $scope.handleNewTask = function(){
            var taskTable = _datastore.getTable('tasks')

                    var firstTask = taskTable.insert({
                        taskname: $scope.newTaskName,
                        completed: false,
                        created: new Date()
                    });

        }



    })