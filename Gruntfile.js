module.exports = function(grunt) {

  // 1. All configuration goes here
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['public/dist'],

    concat: {
      options: {
        separator : ';'
      },
    // 2. Configuration for concatinating files goes here.
      dist1: {
        src: ['public/client/app.js','public/client/createLinkView.js','public/client/link.js','public/client/links.js','public/client/linkView.js','public/client/linksView.js','public/client/router.js'],
        dest: 'public/dist/production_client.js'
      },
      dist2: {
        src: ['public/lib/jquery.js','public/lib/underscore.js','public/lib/backbone.js','public/lib/handlebars.js'],
        dest: 'public/dist/production_lib.js'
      }

    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    imagemin: {
      dynamic: {
        files: [{
          expand: true,
          cwd: 'public',
          src: ['*.{png,jpg,gif,jpeg}'],
          dest: 'public/dist'
        }]
      }
    },

    uglify: {
      build1: {
        src: 'public/dist/production_client.js',
        dest: 'public/dist/production_client.min.js'
      },
      build2: {
        src: 'public/dist/production_lib.js',
        dest: 'public/dist/production_lib.min.js'
      }
    },

    jshint: {
      files: ['public/client'],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js'
        ]
      }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'public',
          src: ['*.css'],
          dest: 'public/dist',
          ext: '.min.css'
        }]
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
      }
    },
  });

  // 3. Where we tell Grunt we plan to use this plug-in.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  // grunt.loadNpmTasks('grunt-concat-in-order');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [
  ]);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      // add your production server task here
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  // grunt.registerTask('deploy', [
  //   // add your deploy tasks here
  // ]);
// 'imagemin'

  grunt.registerTask('heroku:production', ['clean', 'concat', 'uglify', 'cssmin','jshint','mochaTest']);

  grunt.registerTask('default', ['clean', 'concat', 'uglify', 'cssmin','jshint', 'mochaTest']);
};
