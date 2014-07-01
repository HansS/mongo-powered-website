var novlr = require("./novlr");
var _ = require("lodash");

novlr.factory("offlineService",
  ["chapterService", "editorService", "$rootScope", "$resource",
    function (chapterService, editorService, $rootScope, $resource) {
    var User = $resource("/api/user");

    return {
      offline: function () {
        var that = this;
        var server_success = function() {
          $rootScope.$broadcast('novlr-online');
        };
        var server_error = function() {
          that.offline();
        };
        // Attempt to get the user object every 10 seconds to check if online.
        setTimeout(function () {
          User.get({}, server_success, server_error);
        }, 10000)
      },

      online: function () {
        // Save all chapters from local storage when we go back online.
        var chapters = chapterService.local.get_all();
        _.each(chapters, function(chapter) {
          // Check the local chapter belongs to the logged in user
          if (chapter.userid == $rootScope.user._id) {
            if (!chapter.deleted) {
              // No updated timestamp means never saved online.
              if (!chapter.updated) {
                chapterService.add(chapter, {already_added: true});
              } else {
                chapterService.update(chapter._id, chapter, chapter);
              }
            } else {
              chapterService.delete_chapter(chapter._id);
            }
          }
        })
      },

      local_sync_init: function() {
        // Sync from local storage if there are updates in another tab.
        window.addEventListener('storage', function(local_storage_event) {
          // Update all chapters to take account of chapter deletion, reordering etc.
          var local_chapters = chapterService.local.get_all();
          var current_chapter_id = editorService.get_current_chapter_id();
          $rootScope.$broadcast('chapters-updated', local_chapters);
          // Update the editor if the current chapter has been updated.
          if (chapterService.local.get_key(current_chapter_id) == local_storage_event.key) {
            editorService.setHTML(chapterService.local.get(current_chapter_id).text);
          }
        }, false);
      }
    };

  }]);