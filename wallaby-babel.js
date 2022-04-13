/*jshint esversion: 8 */
module.exports = function (wallaby) {
  return {

    files: [
      'src/**/*.js'
    ],

    tests: [
      'tests/**/*.js'
    ],

    env: {
      type: 'node'
    },


  };
};
