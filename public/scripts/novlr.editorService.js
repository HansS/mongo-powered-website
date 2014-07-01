var novlr = require("./novlr");
var Quill = require('../../lib/quill.js');
var _ = require("lodash");

novlr.factory('editorService', [ function() {
  var current_chapter_id;

  return {
    init: function(html, $element, $paperDirectiveScope) {
      var $paper = $element.find('.paper');
      $paper.html(html);
      var el = $paper.get(0);
      this.editor = new Quill(el, {
        formats: ['bold', 'italic', 'underline', 'strike'],
        theme: 'snow'
      });
      $paper.find('iframe').contents().find('html').attr('manifest','/public/cache.manifest');
      current_chapter_id = $paperDirectiveScope.$parent.chapter._id;
      this.editor.addModule('toolbar', {
        container: '#toolbar'
      });
      this.editor.addStyles({'@font-face': {
        'font-family': 'Merriweather',
        'font-style': 'normal',
        'font-weight': '300',
        'src': "local('Merriweather Light'), local('Merriweather-Light'), url(/public/fonts/merriweather/v6/ZvcMqxEwPfh2qDWBPxn6nmFp2sMiApZm5Dx7NpSTOZk.woff) format('woff')"
      }});
      this.editor.addStyles({'@font-face': {
        'font-family': 'Merriweather',
        'font-style': 'normal',
        'font-weight': '700',
        'src': "local('Merriweather Bold'), local('Merriweather-Bold'), url(/public/fonts/merriweather/v6/ZvcMqxEwPfh2qDWBPxn6nnl4twXkwp3_u9ZoePkT564.woff) format('woff')"
      }});
      this.editor.addStyles({'@font-face': {
        'font-family': 'Merriweather',
        'font-style': 'italic',
        'font-weight': '300',
        'src': "local('Merriweather Light Italic'), local('Merriweather-LightItalic'), url(/public/fonts/merriweather/v6/EYh7Vl4ywhowqULgRdYwIG0Xvi9kvVpeKmlONF1xhUs.woff) format('woff')"
      }});
      this.editor.addStyles({'@font-face': {
        'font-family': 'Merriweather',
        'font-style': 'italic',
        'font-weight': '400',
        'src': "local('Merriweather Italic'), local('Merriweather-Italic'), url(/public/fonts/merriweather/v6/So5lHxHT37p2SS4-t60SlHpumDtkw9GHrrDfd7ZnWpU.woff) format('woff')"
      }});
      this.editor.addStyles({'@font-face': {
        'font-family': 'Merriweather',
        'font-style': 'italic',
        'font-weight': '700',
        'src': "local('Merriweather Bold Italic'), local('Merriweather-BoldItalic'), url(/public/fonts/merriweather/v6/EYh7Vl4ywhowqULgRdYwIL0qgHI2SEqiJszC-CVc3gY.woff) format('woff')"
      }});
      this.editor.addStyles({
        'html': { 'height': '100%', 'width': '960px', 'float': 'none', 'margin': '0 auto' },
        '.editor-container p::-moz-selection' : { 'background': '#89C7DB'},
        '.editor-container p::selection' : { 'background': '#89C7DB'},
        '.editor-container b::-moz-selection' : { 'background': '#89C7DB'},
        '.editor-container b::selection' : { 'background': '#89C7DB'},
        '.editor-container i::-moz-selection' : { 'background': '#89C7DB'},
        '.editor-container i::selection' : { 'background': '#89C7DB'},
        '.editor-container s::-moz-selection' : { 'background': '#89C7DB'},
        '.editor-container s::selection' : { 'background': '#89C7DB'},
        'body.snow': {
          'font-size': '18px',
          'font-family': 'Merriweather',
          'line-height': '1.5',
          'padding': '12px 55px',
          'padding-top': '80px',
          'color': '#3d3f44 !important',
          'cursor': 'default'
        },
        '@media only screen and (max-width : 800px)': {
          'html': {
            'width': '600px'
          }
        },
        '@media only screen and (max-width : 570px)': {
          'html': {
            'width': '500px'
          }
        },
        '@media only screen and (max-width : 480px)': {
          'html': {
            'width': '400px'
          }
        },
        '.paste-container': {
          'width': '500px',
          'height': '500px',
          'overflow': 'hidden'
        },
        '.editor-container': {
          'cursor': 'text'
        },
        '.editor-container p:last-of-type': {
          'margin-bottom': '100px'
        }
      });
      // Give focus to the editor only if no other element has it.
      if ($(':focus').length === 0) {
        var length = this.editor.getLength();
        this.editor.focus();
        this.editor.setSelection(length, length)
      }
      this.editor.on('text-change', _.debounce(function(delta, source) {
        if ("user" === source) {
          $paperDirectiveScope.$parent.save();
        }
      }, 400));
      $paperDirectiveScope.$parent.updateWordCount(this.getWordCount());
    },
    get_current_chapter_id: function() {
      return current_chapter_id;
    },
    getWordCount: function() {
      var text = this.editor.getText().trim();
      var regex = /\s+/gi;
      return (text === '')
        ? 0
        : text.replace(regex, ' ')
        .split(' ')
        .length;
    },
    setHTML: function(html) {
      this.editor.setHTML(html);
    }
  };
}]);
