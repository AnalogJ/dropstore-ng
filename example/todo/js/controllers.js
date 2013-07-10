/**
 * Created with JetBrains WebStorm.
 * User: Jason
 * Date: 7/9/13
 * Time: 4:36 PM
 * To change this template use File | Settings | File Templates.
 */
angular.module('testApp.controllers', [])
    //Panel Controllers
    .controller('pageTestCtrl', function ($scope, $rootScope, dropstoreClient, safeApply, recordWrapper) {
        var _datastore = null;
        $scope.tasks = [];
        $scope.recordWrapper = recordWrapper;
        dropstoreClient.create({key: '3xqz1dtko5plr99'})
            .authenticate({interactive: true})
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
                        var record = records[ndx];

                        if(record.isDeleted()){
                            for(var s_ndx in $scope.tasks){
                                var curr_record = $scope.tasks[s_ndx];
                                if(curr_record.getId() == record.getId()){
                                    $scope.tasks.splice($scope.tasks.indexOf(curr_record), 1);
                                    //deleted task
                                    break;
                                }
                            }
                        }
                        else{
                            console.log(record.get('taskname'));
                            var found= false;
                            //task is new or updated.
                            for(var s_ndx in $scope.tasks){
                                var curr_record = $scope.tasks[s_ndx];
                                if(curr_record.getId() == record.getId()){
                                    $scope.tasks[$scope.tasks.indexOf(curr_record)] = record;
                                    found = true;
                                    //udpate task
                                    break;
                                }
                            }
                            if(!found){
                                $scope.tasks.push(records[ndx]);
                            }
                        }


                    }
                },'tasks');

                var taskTable = datastore.getTable('tasks');
                $scope.tasks =  taskTable.query();
            });

        $scope.editedTodo = null;
        $scope.editTodoText = '';
        $scope.newTodo = '';
        $scope.addTodo = function(){
            var taskTable = _datastore.getTable('tasks')

                    var firstTask = taskTable.insert({
                        taskname: $scope.newTodo,
                        completed: false,
                        created: new Date()
                    });

        }
        $scope.removeTodo = function (todo) {
            todo.deleteRecord();
        };
        $scope.markAll = function (completed) {
            $scope.tasks.forEach(function (todo) {
                todo.set('completed', completed);
            });
        };
        var _text = '';
        $scope.editTodo = function (todo) {
            $scope.editedTodo = todo;
            _text = todo.get('taskname');

            //doing this weird binding with temporary variable because angular $scope is not binding corretly when using todo-blur directive.
            $scope.editTodoText = {
                get text() { return _text; },
                set text(val) { _text = val; }
            };
        };

        $scope.doneEditing = function (todo) {
            safeApply($scope, function(){
                console.log(_text);
                if (!_text.length) {
                    $scope.removeTodo(todo);
                }
                else{
                    todo.set('taskname',_text);
                }
            });

            $scope.editedTodo = null;

        };
        $scope.updateCompleted = function(todo, checked){
            console.log(checked);
            todo.set('completed', checked);
        }

    })