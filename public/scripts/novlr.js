var novlr = angular.module("novlr", 
  ["ngResource", "ui.sortable", "ngRoute", "ui.bootstrap"]);

novlr.STATUS_SAVED = "Saved";
novlr.STATUS_CONFLICT = "Conflict..";
novlr.STATUS_SAVING = "Saving..";
novlr.STATUS_OFFLINE = "Offline - saved locally";

module.exports = novlr;
