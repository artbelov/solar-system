(function () {
  'use strict';

  /**
   * Контроллер приложения Солнечной системы на Canvas
   *
   *  @ngInject
   */
  function MainCtrl($scope, $timeout, $document, _, AppConfig) {
    // Привязка всех объектов по центру осей OX и OY
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

    var hoverTarget, // Выбранный курсором объект
      planetsCfg = AppConfig.planetsData, // Ссылка на константу
      commonCfg = AppConfig.commonData, // Ссылка на константу
      orbitOffset, // Отступ первой орбиты от центра
      orbits, // Массив всех орбит
      planets, // Массив всех планет
      colors = { // Объект цветов
        green: 'rgba(0, 192, 255, 1)',
        lightGreen: 'rgba(0, 192, 255, 0.5)'
      },
      canvas = new fabric.Canvas('canvas', { // Экз. класса Canvas
        width: commonCfg.canvasWidth,
        height: commonCfg.canvasHeight,
        hoverCursor: 'pointer',
        selection: false,
        perPixelTargetFind: true,
        targetFindTolerance: 5
      }),
      hoverCircle = new fabric.Circle({ // Экз. класса Circle
        fill: '',
        stroke: colors.green,
        strokeWidth: 2
      }).setCoords(),
      planetLabel = new fabric.Text('', { // Экз. класса Text
        fill: '#fff',
        fontSize: 14,
        fontFamily: 'Verdana'
      }).setCoords();

    // Метод предварительной подготовки холста
    function prepareCanvas() {
      orbitOffset = 90; // Отступ первой орбиты от центра
      orbits = []; // Массив всех орбит
      planets = []; // Массив всех планет

      // Очистка холста
      canvas.clear();

      // Размещаем PNG-солнце по центру холста
      fabric.Image.fromURL(commonCfg.sunPng, function (sunImg) {
        canvas.add(sunImg);
        sunImg.center();
      });
    }

    // Метод создания планеты на холсте
    function createPlanet(planetObj, planetKey) {
      // Загрузка PNG при помощи метода класса Image
      fabric.Image.fromURL(commonCfg.planetsPath + planetObj.nameImg + '.png', function (planetImg) {
        // Метод StaticCanvas в качестве буфера
        var tempCanvas = new fabric.StaticCanvas()
            .setDimensions({
              width: planetObj.radius,
              height: planetObj.radius
            }),
          planet,
          orbit;

        // Оси позиционирования изображения
        planetImg.originX = 'left';
        planetImg.originY = 'top';

        // Добавление изображения на холст
        tempCanvas.add(planetImg);

        // Рендер экз. класса Circle в качестве орбиты
        orbit = new fabric.Circle({
          radius: orbitOffset + planetObj.offset,
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          fill: '',
          stroke: colors.lightGreen,
          hasBorders: false,
          hasControls: false,
          lockMovementX: true,
          lockMovementY: true,
          index: planetKey
        }).setCoords();

        // Общий отступ от PNG-солнца
        orbitOffset += planetObj.offset;

        // Добавление орбиты и обводки на холст
        canvas.add(orbit, hoverCircle);

        // Рендер и анимирование планет на орбитах
        planet = renderPlanet(orbitOffset, planetKey, tempCanvas);
        animatePlanet(planet, orbitOffset, planetKey, planetObj.speed);

        // Добавление готовых объектов на холст и массивы
        canvas.add(planetLabel);
        planets.push(planet);
        orbits.push(orbit);
      });
    }

    // Метод рендера PNG-планеты на холсте
    function renderPlanet(orbitOffset, i, tempCanvas) {
      var img = new Image();

      // Запись DataUrl из холста
      img.src = tempCanvas.toDataURL();

      // Рендер и добавление изображения на холст
      var oImg = new fabric.Image(img, {
        radius: planetsCfg[i].radius,
        width: planetsCfg[i].radius,
        height: planetsCfg[i].radius,
        name: planetsCfg[i].nameRu,
        left: canvas.getWidth() / 2 - orbitOffset,
        top: canvas.getHeight() / 2,
        hasBorders: false,
        hasControls: false,
        index: i
      }).setCoords();

      canvas.add(oImg);

      return oImg;
    }

    // Метод анимации планеты на орбите
    function animatePlanet(oImg, orbitOffset, planetIndex, planetSpeed) {
      var radius = orbitOffset,
        cx = canvas.getWidth() / 2, // 0X
        cy = canvas.getHeight() / 2, // 0Y
        duration = planetSpeed * 100, // Скорость вражение планет по орбите
        startAngle = fabric.util.getRandomInt(-180, 0), // Случайное расположение планет
        endAngle = startAngle + 359;

      // Замыкание метода при инициализации
      (function animatePlanetOnOrbit() {
        fabric.util.animate({
          startValue: startAngle,
          endValue: endAngle,
          duration: duration,
          easing: function (t, b, c, d) {
            return c * t / d + b;
          },
          onChange: function (angle) {
            var x = cx + radius * Math.cos(fabric.util.degreesToRadians(angle)),
              y = cy + radius * Math.sin(fabric.util.degreesToRadians(angle));

            // Движение планеты по орбите с вращением к солнцу
            oImg.set({ left: x, top: y, angle: angle }).setCoords();

            // Рендер холста только после загрузки всех планет
            if (planetIndex === planetsCfg.length - 1) {
              canvas.calcOffset().renderAll();
            }
          },
          onComplete: animatePlanetOnOrbit
        });
      })();
    }

    // Рендер динамических элементов холста
    function updateCanvas() {
      // Выделенный элемент - это планета или орбита
      if (_.has(hoverTarget, 'index')) {
        var hoveredPlanet = planets[hoverTarget.index],
          hoveredOrbit = orbits[hoveredPlanet.index];

        // Стилизация орбиты
        hoveredOrbit.set({
          strokeWidth: 2,
          stroke: colors.green
        });

        // Стилизация обводки
        hoverCircle.set({
          radius: hoveredPlanet.radius / 2,
          left: hoveredPlanet.left,
          top: hoveredPlanet.top
        });

        // Стилизация подписи
        planetLabel.set({
          radius: hoveredPlanet.radius,
          left: hoveredPlanet.left,
          top: hoveredPlanet.top + hoveredPlanet.radius / 2 + 15,
          text: hoveredPlanet.name
        });
      } else {
        // Скрытие всех элементов
        hoverCircle.set({ left: -100, top: -100 });
        planetLabel.set({ left: -100, top: -100 });

        _.forEach(orbits, function (item) {
          item.set({
            strokeWidth: 2,
            stroke: colors.lightGreen
          });
        });
      }
    }

    // Публичный метод рендера всех планет
    $scope.resetPlanet = function () {
      $scope.planet = null;
    };

    // Публичный метод рендера всех планет
    $scope.renderGalaxy = function () {
      $timeout(function () {
        var createTimeout = 250;

        prepareCanvas();

        // Рендер каждой планеты с интервалом
        _.forEach(planetsCfg, function (obj, key) {
          (function (ind) {
            $timeout(function () {
              createPlanet(obj, key)
            }, createTimeout + (createTimeout * ind));
          })(key);
        });
      });
    };

    // Коллбэки для событий холста
    canvas
      .on('mouse:over', function (options) {
        hoverTarget = options.target;
      })
      .on('mouse:out', function () {
        hoverTarget = null;
      })
      .on('mouse:down', function (options) {
        $timeout(function () {
          $scope.planet = (_.has(options.target, 'index')) ? planetsCfg[options.target.index] : null;
        });
      })
      .on('after:render', updateCanvas);

    // Вотчер интернет-соединения
    $scope.online = navigator.onLine;

    $scope.$watch('online', function (newValue) {
      $scope.online = !!newValue;
    });

    // Рендер холста после готовности DOM
    angular
      .element($document[0])
      .ready(function () {
        $scope.renderGalaxy();
        angular.element('body').removeClass('hide');
      });
  }

  angular
    .module('solar-system', [])
    .constant('_', _.noConflict())
    .controller('MainCtrl', MainCtrl)
    .constant('AppConfig', {
      commonData: {
        canvasWidth: 1000,
        canvasHeight: 1000,
        sunPng: 'assets/images/sun.png',
        planetsPath: 'assets/images/planets/'
      },
      planetsData: [{
        index: 0,
        nameRu: 'Меркурий',
        nameEn: 'Mercury',
        nameImg: 'mercury',
        radius: 15,
        offset: 0,
        speed: 87,
        wiki: {
          link: 'Меркурий',
          diameter: '0,382',
          weight: '0,06',
          radius: '0,38',
          period: '0,241',
          day: '58,6',
          density: '5427',
          satellites: 'Нет'
        }
      }, {
        index: 1,
        nameRu: 'Венера',
        nameEn: 'Venus',
        nameImg: 'venus',
        radius: 25,
        offset: 35,
        speed: 225,
        wiki: {
          link: 'Венера',
          diameter: '0,949',
          weight: '0,82',
          radius: '0,72',
          period: '0,615',
          day: '243',
          density: '5243',
          satellites: 'Нет'
        }
      }, {
        index: 2,
        nameRu: 'Земля',
        nameEn: 'Earth',
        nameImg: 'earth',
        radius: 25,
        offset: 35,
        speed: 365,
        wiki: {
          link: 'Земля',
          diameter: '12 742 км',
          weight: '5.97 × 10^24 кг',
          radius: '6371,0 км',
          period: '0,997 сут.',
          day: '24 часа',
          density: '5515',
          satellites: '1'
        }
      }, {
        index: 3,
        nameRu: 'Марс',
        nameEn: 'Mars',
        nameImg: 'mars',
        radius: 20,
        offset: 40,
        speed: 687,
        wiki: {
          link: 'Марс',
          diameter: '0,53',
          weight: '0,11',
          radius: '1,52',
          period: '1,88',
          day: '1,03',
          density: '3933',
          satellites: '2'
        }
      }, {
        index: 4,
        nameRu: 'Юпитер',
        nameEn: 'Jupiter',
        nameImg: 'jupiter',
        radius: 60,
        offset: 60,
        speed: 4331,
        wiki: {
          link: 'Юпитер',
          diameter: '11,2',
          weight: '318',
          radius: '5,20',
          period: '11,86',
          day: '0,414',
          density: '1326',
          satellites: '67'
        }
      }, {
        index: 5,
        nameRu: 'Сатурн',
        nameEn: 'Saturn',
        nameImg: 'saturn',
        radius: 70,
        offset: 75,
        speed: 10747,
        wiki: {
          link: 'Сатурн',
          diameter: '9,41',
          weight: '95',
          radius: '9,54',
          period: '29,46',
          day: '0,426',
          density: '687',
          satellites: '62'
        }
      }, {
        index: 6,
        nameRu: 'Уран',
        nameEn: 'Uranus',
        nameImg: 'uranus',
        radius: 30,
        offset: 60,
        speed: 30589,
        wiki: {
          link: 'Уран_(планета)',
          diameter: '3,98',
          weight: '14,6',
          radius: '19,22',
          period: '84,01',
          day: '0,718',
          density: '1270',
          satellites: '27'
        }
      }, {
        index: 7,
        nameRu: 'Нептун',
        nameEn: 'Neptune',
        nameImg: 'neptune',
        radius: 30,
        offset: 45,
        speed: 59802,
        wiki: {
          link: 'Нептун',
          diameter: '3,81',
          weight: '17,2',
          radius: '30,06',
          period: '164,79',
          day: '0,671',
          density: '1638',
          satellites: '14'
        }
      }]
    });
})();
