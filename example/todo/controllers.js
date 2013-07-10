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

                _datastore.SubscribeRecordsChanged(function(records){

                    for(var ndx in records){
                        console.log(records[ndx].get('taskname'));

                        $scope.tasks.push(records[ndx]);
                    }
                },'tasks');

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