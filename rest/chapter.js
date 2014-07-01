var Restful = require("./restful"),
    ObjectId = require('mongodb').ObjectID,
    resource = new Restful("chapters"),
    Q = require('q'),
    _ = require('lodash'),
    FS = require('fs');

resource.chapter = function (id, userid) {
   var that = resource;
   return that.database.queryOne(that.collectionName, {_id: new ObjectId(id)})
          .then(function(chapter){
            if (!chapter || chapter.userid !== userid) throw 403;
            return chapter;/*._id.toString();*/
          });
};

resource.show = function(req, res) {
  var that = resource;
  var id = req.params[this.resource];
  if (this.checkHandler('show', id, req, res)) return;
  that.database.queryOne(that.collectionName, {_id: new ObjectId(id)})
    .then(function(chapter){
      if (!chapter) throw new Error(404);
      res.send(chapter);
    })
    .catch(that.notFound(res));
};


resource.handle('index', function(id, req, res) {
  var that = resource;
  var user = req.user;
  if (user && user._id) {
    var userid = user._id.toString();
    that.database.query(that.collectionName, {userid:userid})
      .then(function(chapters) {
        res.set('Cache-Control', 'no-cache');
        res.set('x-novlr-session_id', req.sessionID);
        res.send(chapters);
      })
      .catch(that.notFound(res));
  }
  else {
    res.send([]);
  }
  return true;
});

/*checks that chapter belongs to a user
  who's deleting it */
resource.handle('destroy', function(id, req, res) {
  var that = resource;
  var user = req.user;
  if (user && user._id) {
    var userid = user._id.toString();
    that.chapter(id, userid)
      .then(function(chapter) {
        if (chapter.source !== req.sessionID && !req.body.force) {
          throw new Error('novlr_version_conflict');
        }
      })
      .then(function() {
        return that.database.delete(that.collectionName, id);
      })
      .then(that.success(res))
      .catch(function(error) {
        console.log(error);
        if (error.message == 'novlr_version_conflict') {
          res.send(409);
        } else {
          res.send(404);
        }
      });
  }
  return true;
});


/*gets the total count of chapters,
  belonging to a user, than sets order
  and title to count+1*/
resource.handle('create', function(id, req, res) {
  var that = resource;
  var user = req.user;
  var new_chapter = req.body;
  if (user && user._id) {
    var userid = user._id.toString();
    new_chapter.userid = userid;
    // Don't save user id for chapter backups.
    if (new_chapter.backup_id) {
      delete new_chapter.userid;
    }
    that.database.count(that.collectionName, {userid: userid})
      .then(function() {
        return !(new_chapter.newuser) ?
          Q("") : // empty chapter for non new users
          Q.nfcall(FS.readFile.bind(FS), "./public/templates/novel.html", "utf-8");
      })
      .then(function(server_text) {
        new_chapter.source = req.sessionID;
        // Only replace text if none has been submitted (eg. from chapter created offline).
        if (!new_chapter.text) {
          new_chapter.text = server_text;
        }
        new_chapter.updated = new Date().getTime();
        // If the chapter id has been generated by client offline convert to objectId.
        if (new_chapter._id && typeof(new_chapter._id) == 'string') {
          new_chapter._id = new ObjectId.createFromHexString(new_chapter._id);
        }
        return that.database.create(that.collectionName, new_chapter);
      })
      .then(function(recs) {
        return JSON.stringify(recs[0]);
      })
      .then(that.successp(res))
      .catch(that.error(res));
  } else {
    that.forbidden(res).call(that);
  }
  return true;
});

/*updates chapter values, if chapter order is
  being changed, than finds all other affected
  chapters and updates their order values*/
resource.handle('update', function(id, req, res) {
  var that = resource;
  var db_chapter;
  var user = req.user;
  var updates = req.body;
  if (user && user._id) {
    var userid = user._id.toString();
    that.chapter(id, userid)
      .then(function(chapter) {
        db_chapter = chapter;
        if (chapter.source !== req.sessionID && !updates.force) {
          throw new Error('novlr_version_conflict');
        }
      })
      .then(function() {
        updates.source = req.sessionID;
        updates.updated = new Date().getTime();
        delete updates._id;
        delete updates.force;
        return that.database.update(that.collectionName, id, updates);
      })
      .then(function() {
        // Get the full updated chapter and return that.
        that.chapter(id, userid)
          .then(function(chapter) {
            res.send(200, chapter);
          })
          .catch(function(error) {
            res.send(500);
          })
      })
      .catch(function(error) {
        if (error.message == 'novlr_version_conflict') {
          res.send(409, db_chapter);
        } else {
          res.send(500);
        }
      });
  } else {
    that.forbidden(res).call(that);
  }
  return true;
});

module.exports = resource.routes();
