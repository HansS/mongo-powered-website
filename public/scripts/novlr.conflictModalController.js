var novlr = require("./novlr");
var _ = require("lodash");

novlr.controller('conflictModalController', ["$scope", "$rootScope", "$modalInstance", "chapterService", "editorService",
  function ($scope, $rootScope, $modalInstance, chapterService, editorService) {

    $scope.saveLocalChapters = function() {
      // Save all remote chapters as backups.
      _.each(chapterService.remote_chapters, function(remote_chapter) {
        var backup_chapter = {
          backup_id: remote_chapter._id,
          text: remote_chapter.text
        };
        chapterService.add(backup_chapter, {already_added: true, remote_only: true});
      });
      // Force save all local chapters.
      var local_chapters = chapterService.local.get_all();
      _.each(local_chapters, function(local_chapter) {
        local_chapter.force = true;
        chapterService.update(local_chapter._id, local_chapter, local_chapter)
      });
      $modalInstance.close();
    };

    $scope.getNewerWords = function() {
      // Set all local chapters to 'not offline' and refresh chapter data from remote.
      var local_chapters = chapterService.local.get_all();
      _.each(local_chapters, function(local_chapter) {
        // We only want to reject and backup chapters which have an online timestamp.
        if (local_chapter.updated) {
          // Save a backup.
          var backup_chapter = {
            backup_id: local_chapter._id,
            text: local_chapter.text
          };
          chapterService.add(backup_chapter, {already_added: true, remote_only: true});
          // Unmark as offline so that the remote version overrides on refresh.
          local_chapter.offline = false;
          chapterService.local.update(local_chapter);
        }
      });
      chapterService.init();
      $scope.modal_status = 'loading';
      $scope.$on('chapters-loaded-from-remote', function() {
        $scope.modal_status = '';
        $rootScope.$broadcast("setPaper", editorService.get_current_chapter_id());
        $modalInstance.close();
      });
      $scope.$on('novlr-offline', function() {
        $scope.modal_status = '';
      });
    };

  }]);