var novlr = require("./novlr");
var _ = require("lodash");

var between  = function (number, a, b) {
  var min = Math.min.apply(Math, [a,b]);
  var max = Math.max.apply(Math, [a,b]);
  return number > min && number < max;
};


novlr.controller('chapterController', ["$resource", "$scope", "$rootScope", "chapterService", "$modal",
  function ($resource, $scope, $rootScope, chapterService, $modal) {
    $scope.chapters = [];

    $scope.setPaper = function (chapter) {
      $scope.currentChapterId = chapter._id;
      $rootScope.$broadcast("setPaper", chapter._id);
    };

    $scope.addChapter = function (title) {
      chapterService.add({title: title, order: $scope.chapters.length});
    };

    $scope.$on("chapter-added", function(event, chapter) {
      $scope.chapters.push(chapter);
      $scope.setPaper(chapter);
    });

    $scope.$on("chapters-loaded", function(event, chapters) {
      $scope.chapters = chapters;
      // Load the current chapter into the editor.
      if ($scope.currentChapterId) {
        var chapter = $scope.chapters.filter(function (c) {
          return $scope.currentChapterId === c._id;
        })[0];
        if (chapter) {
          $scope.setPaper(chapter);
          return;
        }
      }
      // If there is no current chapter set the first chapter as current.
      if (!$scope.currentChapterId && $scope.chapters.length) {
        chapter = $scope.chapters[0];
        $scope.currentChapterId = chapter._id;
        $scope.setPaper(chapter);
      }
    });

    $scope.$on("chapters-updated", function(event, chapters) {
      $scope.chapters = [];
      $scope.chapters = chapters;
    });

    $scope.deleteChapter = function (chapter_to_delete) {
      chapterService.delete_chapter(chapter_to_delete._id);
      $scope.chapters = _.filter($scope.chapters, function(chapter) {return chapter._id != chapter_to_delete._id});
      chapterService.set_orders($scope.chapters);
      if ($scope.currentChapterId === chapter_to_delete._id) {
        $scope.currentChapterId = null;
      }
    };

    // Renames chapter, triggered by nEditable.
    $scope.rename = function (title, chapter) {
      var id = chapter._id;
      if (title !== chapter.title) {
        chapterService.update(chapter._id, {title: title}, chapter);
      }
    };

    //ui-sortable
    $scope.orderingOptions = {
      update: function (e, ui) {
        $scope.orderingOptions.from = ui.item.scope().$index;
      },
      stop: function (e, ui) {
        chapterService.set_orders($scope.chapters);
      },
      axis: 'y',
      cursor: '-webkit-grabbing',
      distance: 20
    };

    $scope.deleteConfirmData = {
      title: "Delete?",
      text: "Are you definitely, positively, absolutely sure you want to delete this chapter? There is no way to get it back!",
      confirm: "Delete",
      cancel: "Cancel"
    };

    $scope.addPromptData = {
      title: "Create new chapter",
      placeholder: "Title of your chapter",
      confirm: "Create",
      cancel: "Cancel"
    };
  }]);