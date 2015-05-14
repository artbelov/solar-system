/* global module */

var bs = require('browser-sync');

module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bwr: grunt.file.readJSON('bower.json'),
    project: {
      app: './app',
      src: './src',
      nwjs: './nwjs-build',
      index: '<%= project.app %>/index.html',
      assets: '<%= project.app %>/assets',
      components: './bower_components',
      banner: '/*!\n' +
      ' * <%= pkg.title %> v<%= pkg.version %> (<%= grunt.template.today("dd.mm.yyyy") %>)\n' +
      ' * Copyright by <%= pkg.author %>\n' +
      ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n' +
      ' */\n'
    },

    clean: {
      options: {
        force: true
      },
      app: {
        src: ['<%= project.app %>']
      },
      nwjs: {
        src: ['<%= project.nwjs %>']
      }
    },

    sass: {
      app: {
        options: {
          noLineComments: false,
          relativeAssets: true,
          sourceMap: false
        },
        files: [
          {
            expand: true,
            cwd: '<%= project.src %>/styles',
            dest: '<%= project.assets %>/styles',
            src: '**/*.{scss,sass}',
            ext: '.css'
          }
        ]
      }
    },

    wiredep: {
      app: {
        src: '<%= project.index %>',
        exclude: ['<%= project.components %>/bootstrap/dist/css/bootstrap.css', '<%= project.components %>/bootstrap/dist/js/bootstrap.js', '<%= project.components %>/modernizr/modernizr.js']
      }
    },

    modernizr: {
      app: {
        options: {
          preserveComments: false
        },
        uglify: true,
        devFile: '<%= project.components %>/modernizr/modernizr.js',
        outputFile: '<%= project.assets %>/scripts/modernizr.custom.min.js',
        extra: {
          shiv: true,
          printshiv: true,
          load: true,
          mq: false,
          cssclasses: true
        },
        extensibility: {
          addtest: false,
          prefixed: true,
          teststyles: false,
          testprops: false,
          testallprops: false,
          hasevents: false,
          prefixes: true,
          domprefixes: true
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '<%= project.src %>/scripts/.jshintrc'
      },
      app: ['Gruntfile.js', '<%= project.src %>/scripts/**/*.js', '!<%= project.src %>/scripts/vendor/**/*.js']
    },

    jscs: {
      options: {
        config: '<%= project.src %>/scripts/.jscsrc'
      },
      app: {
        src: ['<%= project.src %>/scripts/**/*.js', '!<%= project.src %>/scripts/vendor/**/*.js']
      }
    },

    ngAnnotate: {
      app: {
        options: {
          sourceMap: false,
          singleQuotes: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= project.src %>/scripts',
            src: ['*.js', '!*.min.js'],
            dest: '<%= project.assets %>/scripts'
          }
        ]
      }
    },

    nodewebkit: {
      options: {
        platforms: ['osx32'],
        buildDir: '<%= project.nwjs %>',
        cacheDir: './.cache',
        winIco: '<%= project.src %>/images/ico/app.ico',
        macIcns: '<%= project.src %>/images/ico/app.icns'
      },
      src: ['<%= project.app %>/**/*', './package.json']
    },

    uglify: {
      app: {
        options: {
          sourceMap: false,
          preserveComments: false
        },
        files: [
          {
            expand: true,
            cwd: '<%= project.assets %>/scripts',
            src: ['*.js', '!*.min.js'],
            dest: '<%= project.assets %>/scripts',
            ext: '.min.js'
          }
        ]
      }
    },

    autoprefixer: {
      options: {
        browsers: ['Android 2.3', 'Android >= 4', 'Chrome >= 20', 'Firefox >= 24', 'Explorer >= 8', 'iOS >= 6', 'Opera >= 12', 'Safari >= 6']
      },
      app: {
        options: {
          map: false
        },
        files: [
          {
            expand: true,
            cwd: '<%= project.assets %>/styles',
            src: ['*.css', '!*.min.css'],
            dest: '<%= project.assets %>/styles'
          }
        ]
      }
    },

    csslint: {
      options: {
        csslintrc: '<%= project.src %>/styles/.csslintrc'
      },
      app: {
        files: [
          {
            expand: true,
            cwd: '<%= project.assets %>/styles',
            src: ['*.css', '!*.min.css', '!bootstrap.css'],
            dest: '<%= project.assets %>/styles'
          }
        ]
      }
    },

    cssmin: {
      app: {
        options: {
          sourceMap: false,
          compatibility: 'ie8',
          keepSpecialComments: '*',
          advanced: false
        },
        files: [
          {
            expand: true,
            cwd: '<%= project.assets %>/styles',
            src: ['*.css', '!*.min.css'],
            dest: '<%= project.assets %>/styles',
            ext: '.min.css'
          }
        ]
      }
    },

    usebanner: {
      options: {
        position: 'top',
        banner: '<%= project.banner %>'
      },
      css: {
        files: {
          src: ['<%= project.assets %>/styles/app.css', '<%= project.assets %>/styles/app.min.css']
        }
      },
      js: {
        files: {
          src: ['<%= project.assets %>/scripts/app.js', '<%= project.assets %>/scripts/app.min.js']
        }
      }
    },

    csscomb: {
      options: {
        config: '<%= project.src %>/styles/.csscomb.json'
      },
      app: {
        files: [
          {
            expand: true,
            cwd: '<%= project.assets %>/styles',
            src: ['*.css', '!*.min.css'],
            dest: '<%= project.assets %>/styles'
          }
        ]
      }
    },

    copy: {
      fonts: {
        expand: true,
        cwd: '<%= project.src %>/fonts',
        src: '*',
        dest: '<%= project.assets %>/fonts'
      },
      vendor: {
        expand: true,
        cwd: '<%= project.src %>/scripts/vendor',
        src: '*',
        dest: '<%= project.assets %>/scripts/vendor'
      },
      svg: {
        expand: true,
        cwd: '<%= project.src %>/images',
        src: ['**/*.svg'],
        dest: '<%= project.assets %>/images'
      }
    },

    jade: {
      options: {
        pretty: true
      },
      app: {
        expand: true,
        cwd: '<%= project.src %>/templates',
        src: ['**/*.jade', '!**/_*.jade'],
        dest: '<%= project.app %>',
        ext: '.html'
      }
    },

    useminPrepare: {
      options: {
        dest: '<%= project.app %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      },
      html: '<%= project.index %>'
    },

    usemin: {
      options: {
        assetsDirs: ['<%= project.components %>']
      },
      html: '<%= project.index %>',
      css: ['<%= project.assets %>/styles/**/*.css']
    },

    imagemin: {
      app: {
        options: {
          optimizationLevel: 3
        },
        files: [
          {
            expand: true,
            cwd: '<%= project.src %>/images',
            src: ['**/*.{png,jpg,gif}'],
            dest: '<%= project.assets %>/images'
          }
        ]
      }
    },

    uncss: {
      bootstrap: {
        options: {
          stylesheets: ['../<%= project.components %>/bootstrap/dist/css/bootstrap.css'],
          ignore: []
        },
        files: {
          '<%= project.assets %>/styles/bootstrap.css': ['<%= project.index %>']
        }
      }
    },

    watch: {
      options: {
        spawn: false
      },
      js: {
        files: '<%= project.src %>/scripts/**/*.js',
        tasks: ['ngAnnotate', 'uglify:app', 'usebanner:js', 'bs-inject']
      },
      sass: {
        files: '<%= project.src %>/styles/**/*.{scss,sass}',
        tasks: ['newer:imagemin', 'newer:copy', 'sass', 'csscomb', 'autoprefixer', 'cssmin:app', 'usebanner:css', 'bs-inject']
      },
      jade: {
        files: '<%= project.src %>/templates/**/*.jade',
        tasks: ['newer:imagemin', 'newer:copy', 'jade', 'uncss', 'wiredep', 'useminPrepare', 'usemin', 'ngAnnotate', 'uglify:app', 'csscomb', 'cssmin:app', 'usebanner:css', 'bs-inject']
      },
      images: {
        files: '<%= project.src %>/images',
        tasks: ['newer:imagemin', 'newer:copy', 'bs-inject']
      }
    }
  });

  require('time-grunt')(grunt);

  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin',
    usebanner: 'grunt-banner',
    nodewebkit: 'grunt-node-webkit-builder'
  });

  grunt.registerTask('bs-init', 'Start BrowserSync Server', function () {
    var done;
    done = this.async();
    bs({
      server: './app',
      ghostMode: false
    }, function () {
      done();
    });
  });

  grunt.registerTask('bs-inject', 'Reload Files in Browser', function () {
    return bs.reload();
  });

  grunt.registerTask('default', ['build', 'lint', 'serve']);

  grunt.registerTask('lint', ['jshint', 'jscs', 'csslint']);

  grunt.registerTask('serve', ['bs-init', 'watch']);

  grunt.registerTask('app', ['build', 'clean:nwjs', 'nodewebkit']);

  grunt.registerTask('build', ['clean:app', 'imagemin', 'copy', 'jade', 'uncss', 'wiredep', 'useminPrepare', 'sass', 'modernizr', 'autoprefixer', 'cssmin:generated', 'ngAnnotate', 'concat:generated', 'uglify:generated', 'usemin', 'uglify:app', 'csscomb', 'cssmin:app', 'usebanner']);
};
