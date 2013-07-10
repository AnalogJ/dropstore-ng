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