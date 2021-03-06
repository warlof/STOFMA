'use strict';

angular.module('stofmaApp.controllers')
    .controller('AddProductCtrl', ['$scope', '$state', 'ProductService', function ($scope, $state, ProductService) {
      $scope.setFabButton('clear', function(){
        $state.go('^');
        $scope.setFabButton('add', function () {
          $state.go('manager.products.add');
        });
      });

      $scope.addProduct = function(){
        var form = $scope.createProduct,
            category = form.category.$modelValue,
            name = form.name.$modelValue,
            shortName = form.shortname.$modelValue,
            price = parseFloat(form.unitPrice.$modelValue),
            minimum = parseInt(form.minimum.$modelValue),
            urlImage = form.urlImage.$modelValue;

        if(isNaN(price) || price <= 0)
          form.unitPrice.$setValidity('notaprice');

        if(isNaN(minimum) || minimum <= 0)
          form.minimum.$setValidity('notanumber');

        if(form.$valid){
          ProductService.createProduct({
            category : category,
            name: name,
            shortName : shortName,
            price : price,
            minimum : minimum,
            urlImage : urlImage
          }).then(function(newProduct){
            $scope.products.push(newProduct);
            $state.go('^');
            $scope.setFabButton('add', function () {
              $state.go('manager.products.add');
            });
          }).catch(function(err){
            // TODO Handle err.
          });
        }
      }
    }]);
