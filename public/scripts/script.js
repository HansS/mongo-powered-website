/* Javascript for the menu */

var DropDown = function(el) {
  this.dd = el;
  this.initEvents();
};
DropDown.prototype = {
  initEvents: function() {
    var obj = this;

    obj.dd.on('click', function(event) {
      $(this).toggleClass('active');
      event.stopPropagation();
    });
  }
};

$(function() {
  var dd = new DropDown($('#dd'));

  $(document).click(function() {
    // all dropdowns
    $('.usermenu').removeClass('active');
  });

  /* jquery for moving chapter-list off canvas */
  $('.noveltitle a').click(function() {
    $('.chapter-list').toggleClass('hidden');
    $('.chapter-display').toggleClass('full');
  });

});