var novlr = require("./novlr");
var _ = require("lodash");
var objectid = require("objectid");

novlr.factory("chapterService", ["$resource", "storageService", "$rootScope",
  function($resource, storageService, $rootScope) {
    var Chapter = $resource("/api/chapter/:id", {}, { update: { method:"PUT" }});
    var noop = function(){};
    var save_attempts = 0;
    var KEY = "chapter_";

    return {

      remote_chapters: [],

      init: function() {
        // Get all chapters on initial page load.
        var chapterService = this;
        Chapter.query({}, function (remote_chapters, getHeaders) {
          chapterService.remote_chapters = remote_chapters;
          var working_chapters = [];
          var conflicted_chapters = [];
          var current_source = getHeaders()['x-novlr-session_id'];
          remote_chapters = chapterService.sort(remote_chapters);
          // Check each chapter for offline conflicts, set the source to current and save into local storage.
          _.each(remote_chapters, function (remote_chapter) {
            var local_chapter = chapterService.local.get(remote_chapter._id);
            switch (true) {
              case (!local_chapter || !local_chapter.offline):
                // No offline work on this chapter.
                chapterService.set_source(remote_chapter._id, current_source);
                // We need to save the local version now so that it can be used by Paper immediately.
                chapterService.local.update(remote_chapter);
                working_chapters.push(remote_chapter);
                break;
              case (local_chapter.offline && local_chapter.source == remote_chapter.source):
                // Work has been done offline and was last saved online by this client.
                chapterService.update(local_chapter._id, local_chapter);
                working_chapters.push(local_chapter);
                break;
              case (local_chapter.offline && local_chapter.source != remote_chapter.source):
                // Work has been done offline here and remotely.
                if (local_chapter.text != remote_chapter.text) {
                  conflicted_chapters.push(remote_chapter);
                } else {
                  working_chapters.push(local_chapter);
                }
                break;
            }
            // Uncomment below to force the chapter conflict dialog
            //conflicted_chapters.push(remote_chapter);
          });
          // Check each local chapter to see if there are additional offline chapters
          var remote_chapter_ids = _.map(remote_chapters, function(chapter) {
            return chapter._id;
          });
          var local_chapters = chapterService.local.get_all();
          _.each(local_chapters, function(local_chapter) {
            if (!_.contains(remote_chapter_ids, local_chapter._id)) {
              // Chapter has been created offline and never saved online.
              chapterService.add(local_chapter, {already_added: true});
              working_chapters.push(local_chapter);
            }
          });
          // Put chapters into order.
          working_chapters = chapterService.sort(working_chapters);
          // Broadcast any chapter conflicts.
          if (conflicted_chapters.length) {
            $rootScope.$broadcast("chapter-version-conflict", conflicted_chapters[0]);
          }
          // Broadcast loaded chapters.
          $rootScope.$broadcast('chapters-loaded', working_chapters);
          $rootScope.$broadcast('chapters-loaded-from-remote');
        }, function() {
          var local_chapters = chapterService.local.get_all();
          $rootScope.$broadcast("novlr-offline");
          $rootScope.$broadcast('chapters-loaded', local_chapters);
        });
      },

      /**
       * Gets a chapter by id.
       * @param {Number} id of chapter
       * @return {Object} $promise
       */
      get: function(id) {
        return Chapter.get({id:id}, noop).$promise;
      },

      /**
       * Attempt to create the new chapter online first, fall back to a local copy on failure.
       */
      add: function(chapter, options) {
        var that = this;
        options = options || {};
        var server_success = function(remote_chapter) {
          if (!options.remote_only) {
            that.local.update(remote_chapter)
          }
          if (!options.already_added) {
            $rootScope.$broadcast("chapter-added", remote_chapter);
            $rootScope.$broadcast("novlr-online");
          }
        };
        var server_error = function() {
          if (!options.remote_only) {
            var local_chapter = that.local.add(chapter);
            if (!options.already_added) {
              $rootScope.$broadcast("chapter-added", local_chapter);
              $rootScope.$broadcast("novlr-offline");
            }
          }
        };
        Chapter.save(chapter, server_success, server_error);
      },

      /**
       * Saves chapter to db.
       * @param {Number} id of chapter
       * @param  {Object} contents of chapter {text, count}
       * @param {Object} chapter object.
       * @return {Object} $promise
       */
      update: function(id, contents, chapter) {
        var that = this;
        var server_success = function(remote_chapter){
          $rootScope.$broadcast("novlr-online");
          remote_chapter.offline = false;
          that.local.update(remote_chapter);
        };
        var server_error = function(response){
          switch (response.status) {
            case 409:
              $rootScope.$broadcast("chapter-version-conflict", response.data);
              break;
            case 0:
            case 500:
              chapter.offline = true;
              that.local.update(chapter);
              $rootScope.$broadcast("novlr-offline");
              break;
          }
        };
        // Save a local version before we try to save to remote.
        if (chapter) {
          that.local.update(chapter);
        }
        return Chapter.update({id:id}, contents, server_success, server_error).$promise;
      },

      set_source: function(id, source) {
        this.update(id, {source: source, force: true});
      },

      set_orders: function(chapters) {
        var chapterService = this;
        _.each(chapters, function(chapter, key) {
          if (key != chapter.order) {
            chapter.order = key;
            chapterService.update(chapter._id, {order: chapter.order}, chapter);
          }
        });
      },

      delete_chapter: function(id, success, error) {
        var server_success = function() {
          this.local.remove(id);
          $rootScope.$broadcast("novlr-online");
        };
        var server_error = function(response) {
          switch (response.status) {
            case 409:
              $rootScope.$broadcast("chapter-version-conflict", response.data);
              break;
            case 0:
            case 500:
              // Mark chapter as deleted in local storage.
              var chapter = this.local.get(id);
              chapter.deleted = true;
              this.local.update(chapter);
              $rootScope.$broadcast("novlr-offline");
          }
        };
        Chapter.delete({id:id}, server_success.bind(this), server_error.bind(this));
      },

      sort: function(chapters) {
        return this.local.sort(chapters);
      },

      local: {
        add: function(chapter) {
          var id = objectid();
          var key = this.get_key(id);
          chapter._id = id;
          chapter.created_locally = true;
          chapter.userid = $rootScope.user._id;
          storageService.setItem(key, chapter);
          return chapter;
        },
        get: function(id) {
          var key = this.get_key(id);
          var chapter = storageService.getItem(key);
          if (chapter && chapter.userid == $rootScope.user._id) {
            return chapter;
          }
        },
        get_all: function() {
          var chapters = [];
          for (var key in localStorage) {
            if (key.slice(0, 7) == 'chapter') {
              var chapter_id = key.slice(8);
              var chapter = this.get(chapter_id);
              if (chapter) {
                chapters.push(chapter);
              }
            }
          }
          return this.sort(chapters);
        },
        remove: function(id) {
          var key = this.get_key(id);
          return storageService.removeItem(key);
        },
        update: function(chapter) {
          var id = chapter._id;
          var key = KEY + id;
          chapter.updated_offline = new Date().getTime();
          return storageService.setItem(key, chapter);
        },
        get_key: function(id) {
          return KEY + id;
        },
        sort: function(chapters) {
          return chapters.sort(function (c1, c2) {
            return c1.order < c2.order ? -1 : (c1.order > c2.order ? 1 : 0);
          });
        }
      }

    };
  }
]);
