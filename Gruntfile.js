module.exports = function (grunt) {

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  // This timestamp is picked up in /index.js and fed into the views to create versioned asset files.
  var build_timestamp = Date.now();
  grunt.file.write('dist/build_timestamp.txt', build_timestamp);

  grunt.initConfig({

    pkg: grunt.file.readJSON("package.json"),

    less: {
      development: {
        options: {},
        files: {
          "dist/styles/style.css": "public/styles/*.less"
        }
      }
    },

    browserify: {
      options: {
        bundleOptions: {
          debug: true
        }
      },
      vendor: {
        src: [
          "bower_components/jquery/dist/jquery.js",
          "bower_components/angular/angular.js",
          "bower_components/angular-route/angular-route.min.js",
          "bower_components/angular-resource/angular-resource.min.js",
          "bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js",
          "bower_components/jquery-ui/jquery-ui.min.js",
          "bower_components/angular-ui-sortable/sortable.min.js",
          "bower_components/lodash/dist/lodash.min.js"
        ],
        dest: 'dist/scripts/all-deps.js'
      },
      vendor_signed_out: {
        src: [
          "bower_components/jquery/dist/jquery.min.js",
          "bower_components/angular/angular.min.js",
          "bower_components/angular-resource/angular-resource.min.js"
        ],
        dest: 'dist/scripts/signed_out-deps.js'
      },
      compile: {
        files: {
          "dist/scripts/sign_up.js": ["public/scripts/novlr.signupController.js"],
          "dist/scripts/app.js": ["public/scripts/*.js", "!public/scripts/novlr.signupController.js"],
        }
      }
    },

    cssmin: {
      minify: {
        options: {
          keepSpecialComments: 0,
          banner: '/* NOVLR STYLES */'
        },
        files: {
          'dist/styles/style.min.css': [
            'dist/styles/style.css'
          ],
          'dist/styles/all-deps.min.css': [
            'bower_components/font-awesome/css/font-awesome.css',
            'bower_components/bootstrap/dist/css/bootstrap.css'
          ],
          'dist/styles/signed_out-deps.min.css': [
            'bower_components/font-awesome/css/font-awesome.css'
          ]
        }
      }
    },

    uglify: {
      thirdparty: {
        files: {
          'dist/scripts/all-deps.min.js': ['dist/scripts/all-deps.js'],
          'dist/scripts/signed_out-deps.min.js': ['dist/scripts/signed_out-deps.js']
        }
      },
      scripts: {
        files: {
          'dist/scripts/app.min.js': ['dist/scripts/app.js'],
          'dist/scripts/sign_up.min.js': ['dist/scripts/sign_up.js']
        }
      }
    },

    copy: {
      dev: {
        files: [
          {
            src: 'dist/scripts/sign_up.js',
            dest: 'dist/scripts/sign_up.min.js'
          },
          {
            src: 'dist/scripts/signed_out-deps.js',
            dest: 'dist/scripts/signed_out-deps.min.js'
          },
          {
            src: 'dist/scripts/app.js',
            dest: 'dist/scripts/app.min.js'
          },
          {
            src: 'dist/scripts/all-deps.js',
            dest: 'dist/scripts/all-deps.min.js'
          }
        ]
      },
      fonts: {
        files: [{
          expand: true,
          cwd: 'bower_components/font-awesome/fonts/',
          src: ['./*'],
          dest: 'dist/fonts/',
          filter: 'isFile'
        }]
      }
    },

    watch: {
      options: {
        spawn: false
      },
      styles: {
        files: ["public/styles/*.less"],
        tasks: ["less", "manifest:generate"]
      },
      js: {
        files: ["public/scripts/*.js"],
        tasks: ["browserify:compile", "manifest:generate"]
      }
    },

    shell: {
      webserver: {
        command: 'nodemon --debug ./index.js --ignore node_modules/ ',
        options: {
          async: true
        }
      },
      options: {
        stdout: true,
        stderr: true,
        failOnError: true
      }
    },

    manifest: {
      generate: {
        options: {
          basePath: "./",
          network: ["/api"],
          cache: [
            "/assets/" + build_timestamp + "/styles/all-deps.min.css",
            "/assets/" + build_timestamp + "/styles/style.min.css",
            "/assets/" + build_timestamp + "/scripts/all-deps.min.js",
            "/assets/" + build_timestamp + "/scripts/app.min.js",
            "/public/images/iconmonstr-cloud-11-icon.svg",
            "/public/images/iconmonstr-tools-5-22px-icon.svg",
            "/public/images/Novlr-logo-white.svg",
            "/public/images/iconmonstr-bookmark-19-icon.svg",
            "/public/images/iconmonstr-tools-5-icon-22.png",
            "/public/images/bookmark-left-18px.png",
            "/public/images/iconmonstr-user-icon.svg",
            "/public/images/iconmonstr-email-6-icon.svg",
            "/public/images/iconmonstr-time-icon.svg",
            "/public/images/iconmonstr-password-9-icon.svg",
            "/public/images/iconmonstr-pencil-8-icon-22.png",
            "/public/templates/neditable.html",
            "/public/templates/npaper.html",
            "/public/templates/nprompt.html",
            "/public/templates/nconfirm.html",
            "/public/templates/settings.html",
            "/dist/fonts/fontawesome-webfont.woff?v=4.0.3",
            "/public/fonts/roboto/v10/2UX7WLTfW3W8TclTUvlFyQ.woff",
            "/public/fonts/roboto/v10/RxZJdnzeo3R5zSexge8UUT8E0i7KZn-EPnyo3HZu7kw.woff",
            "/public/fonts/roboto/v10/Hgo13k-tfSpn0qi1SFdUfT8E0i7KZn-EPnyo3HZu7kw.woff",
            "/public/fonts/roboto/v10/vzIUHo9z-oJ4WgkpPOtg1_esZW2xOQ-xsNqO47m55DA.woff",
            "/public/fonts/merriweather/v6/EYh7Vl4ywhowqULgRdYwIG0Xvi9kvVpeKmlONF1xhUs.woff",
            "/public/fonts/merriweather/v6/EYh7Vl4ywhowqULgRdYwIL0qgHI2SEqiJszC-CVc3gY.woff",
            "/public/fonts/merriweather/v6/RFda8w1V0eDZheqfcyQ4EHhCUOGz7vYGh680lGh-uXM.woff",
            "/public/fonts/merriweather/v6/So5lHxHT37p2SS4-t60SlHpumDtkw9GHrrDfd7ZnWpU.woff",
            "/public/fonts/merriweather/v6/ZvcMqxEwPfh2qDWBPxn6nmFp2sMiApZm5Dx7NpSTOZk.woff",
            "/public/fonts/merriweather/v6/ZvcMqxEwPfh2qDWBPxn6nnl4twXkwp3_u9ZoePkT564.woff"
          ],
          fallback: ["/ /public/offline.html"],
          exclude: ["js/jquery.min.js"],
          preferOnline: true,
          verbose: true,
          timestamp: true
        },
        src: [],
        dest: "public/cache.manifest"
      }
    }

  });

  grunt.registerTask("build", [
    "copy:fonts",
    "less",
    "browserify",
    "uglify",
    "cssmin",
    "manifest:generate"
  ]);
  grunt.registerTask("dev", [
    "copy:fonts",
    "less",
    "browserify",
    "cssmin",
    "copy:dev",
    "manifest:generate",
    "shell",
    "watch"
  ]);
  grunt.registerTask("rest", ["shell", "watch"]);

  grunt.registerTask("default", ["build"]);

};