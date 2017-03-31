(function () {
    'use strict';

    angular
        .module('app.account.home')
        .controller('AccountHomeController', AccountHomeController);

    AccountHomeController.$inject = ['$scope', '$http', '$filter', 'NgTableParams', 'LoginService', 'AlertService'];

    function AccountHomeController($scope, $http, $filter, NgTableParams, LoginService, AlertService) {
        //console.log("Account home controller called");
        var vm = this;
        var usuario = LoginService.currentLoggedUser();

        //*********************************************************************************************************//

        //Pesos

        //Cosas de chartjs
        vm.onClick = function (points, evt) {
            //console.log(points, evt);
        };
        vm.chartOptions = {
            scales: {
                yAxes: [{id: 'y-axis-1', type: 'linear', position: 'left', ticks: {min: 30}}]
            }
        };
        vm.labels = [];
        vm.data = [[]];

        //Obtenemos pesos del usuario
        $http.get("/api/peso/" + usuario.username).then(
            function (response) { //success
                var objetoPeso = response.data;

                for (var i = 0; i < objetoPeso.length; i++) {
                    var peso = objetoPeso[i].peso;
                    var fecha = new Date(objetoPeso[i].fecha);
                    var fechaParseada = $filter('date')(fecha, "dd/MM/yyyy");

                    vm.labels.push(fechaParseada);
                    vm.data[0].push(peso);
                }
            },
            function (response) { //error
                AlertService.addAlert('danger', 'Error al obtener los pesos del usuario ' + usuario.username);
            }
        );

        //*********************************************************************************************************//

        //Inventario

        vm.products = [];

        //Obtenemos inventario
        $http.get("/api/inventario/" + usuario.username).then(
            function (response) { //success
                var objetoInventario = response.data;
                //console.log("Inventario: " + objetoInventario);

                for (var i = 0; i < objetoInventario.length; i++) {
                    var nombreProducto = objetoInventario[i].producto.nombre;
                    var cantidad = objetoInventario[i].cantidad;
                    var cantidadMinima = objetoInventario[i].cantidadMinima;
                    var fechaCaducidad = new Date(objetoInventario[i].fechaCaducidad);

                    vm.products.push({
                        nombreProducto: nombreProducto, cantidad: cantidad,
                        cantidadMinima: cantidadMinima, fechaCaducidad: fechaCaducidad
                    });
                }

                vm.inventario = new NgTableParams({count: 5}, {dataset: vm.products, counts: [5, 10, 20]});
            },
            function (response) { //error
                AlertService.addAlert('danger', 'Error al obtener el inventario del usuario ' + usuario.username);
            }
        );

        //*********************************************************************************************************//

        //Funciones del controlador

        vm.peso = null;
        vm.addPeso = addPeso;

        function addPeso(event) {
            event.preventDefault();

            if (usuario != undefined) {
                //console.log('Registrando nuevo peso para el usuario ' + usuario.username + ' (' + vm.peso + ')');
                var dataAPI = {
                    username: usuario.username,
                    peso: vm.peso
                };

                $http.post("/api/peso", dataAPI).then(
                    function (response) { //success
                        vm.data[0].push(vm.peso);
                        vm.labels.push($filter('date')(new Date(), "dd/MM/yyyy"));

                        AlertService.addAlert('success', 'Nuevo peso añadido al sistema');
                    },
                    function (response) { //error
                        AlertService.addAlert('danger', 'Error del sistema al intentar añadir el peso');
                    }
                );
            } else AlertService.addAlert('danger', 'Error interno del sistema al obtener el usuario actual');
        }
    }
})();