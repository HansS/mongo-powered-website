var novlr = require("./novlr");
var moment = require("moment");


novlr.controller("paperController",
  ["$scope", "$timeout", "chapterService", "$modal", "editorService",
    function ($scope, $timeout, chapterService, $modal, editorService) {

      $scope.status = novlr.STATUS_SAVED;

      $scope.$on("setPaper", function (scope, chapter_id) {
        // Get chapter from local.
        var local_chapter = chapterService.local.get(chapter_id);
        if (local_chapter) {
          $scope.chapter = local_chapter;
        } else {
          // Try to get chapter from remote if it doesn't exist locally (should never happen).
          chapterService.get(chapter_id)
            .then(function (db_chapter) {
              $scope.chapter = db_chapter;
            });
        }
      });

      $scope.$on("novlr-online", function () {
        $timeout(function () {
          $scope.status = novlr.STATUS_SAVED;
        }, 1000);
      });

      $scope.$on("novlr-offline", function () {
        $scope.status = novlr.STATUS_OFFLINE;
      });

      $scope.conflictModalOpen = false;
      $scope.$on("chapter-version-conflict", function (event, chapter) {
        if (!$scope.conflictModalOpen) {
          $scope.conflictModalOpen = true;
          $scope.status = novlr.STATUS_CONFLICT;
          var updated_moment = moment(chapter.updated);
          $scope.chapter.updated_time = updated_moment.format('h.mm a');
          $scope.chapter.updated_date = updated_moment.format('Do of MMMM');
          var $modalInstance = $modal.open({
            templateUrl: '/public/templates/conflict.html',
            controller: 'conflictModalController',
            scope: $scope,
            backdrop: 'static',
            keyboard: false
          });
          $modalInstance.result.then(function() {
            $scope.conflictModalOpen = false;
          });
        }
      });

      // TODO Move to a service rather than calling from $parent.save() in child scopes.
      $scope.save = function (force) {
        var text = editorService.editor.getHTML();
        var count = editorService.getWordCount();
        var id = editorService.get_current_chapter_id();
        if (!!id && !!text && typeof count === "number") {
          $scope.status = novlr.STATUS_SAVING;
          $scope.updateWordCount(count);
          $scope.chapter.text = text;
          $scope.chapter.count = count;
          $scope.chapter.force = force;
          // Save chapter to remote.
          chapterService.update(id, $scope.chapter, $scope.chapter);
        }
      };

      $scope.updateWordCount = function (count) {
        $scope.wordcount = count;
      };

    }]);