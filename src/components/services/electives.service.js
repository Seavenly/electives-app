'use strict';

angular.module('electivesApp')
  .factory('Electives',
  function() {
    var startPop = {
      current: 0,
      grade7: 0,
      grade8: 0
    };
    var electives = {};
    electives.findById = function(id) {
      for(var i=0;i<electives.all.length;i++) {
        if(electives.all[i]._id === id) { return electives.all[i]; }
      }
    };
    electives.all = [{
      _id: 'id1',
      name: 'Physical Fitness: Soccer Dome',
      description: 'Description goes here',
      semester: false,
      grades: [6,7,8],
      cap: 30,
      quarters: {
        avail: [1,4],
        q: [startPop, {}, {}, startPop]
      },
      students: [],
      image: 'http://lorempixel.com/600/100'
    },
  {
    _id: 'id2',
    name: 'Physical Fitness: Team Sports',
    description: 'Description goes here',
    semester: false,
    grades: [6,7,8],
    cap: 30,
    quarters: {
      avail: [2,3],
      q: [{}, startPop, startPop, {}]
    },
    students: [],
    image: 'http://lorempixel.com/600/100'
  },
  {
    _id: 'id3',
    name: 'Art',
    description: 'Description goes here',
    semester: false,
    grades: [6,7,8],
    cap: 21,
    quarters: {
      avail: [1,2,3,4],
      q: [startPop, startPop, startPop, startPop]
    },
    students: [],
    image: 'http://lorempixel.com/600/100'
  },
  {
    _id: 'id4',
    name: 'Martial Arts',
    description: 'Description goes here',
    semester: false,
    grades: [6,7,8],
    cap: 15,
    quarters: {
      avail: [1,2,3,4],
      q: [startPop, startPop, startPop, startPop]
    },
    students: [],
    image: 'http://lorempixel.com/600/100'
  },
  {
    _id: 'id5',
    name: 'Home Economics',
    description: 'Description goes here',
    semester: true,
    grades: [6,7,8],
    cap: 12,
    quarters: {
      avail: [1],
      q: [startPop, {}, {}, {}]
    },
    students: [],
    image: 'http://lorempixel.com/600/100'
  },
  {
    _id: 'id6',
    name: 'Hand Sewing',
    description: 'Description goes here',
    semester: false,
    grades: [6,7,8],
    cap: 12,
    quarters: {
      avail: [3],
      q: [{}, {}, startPop, {}]
    },
    students: [],
    image: 'http://lorempixel.com/600/100'
  },
  {
    _id: 'id7',
    name: 'Kitchen Science',
    description: 'Description goes here',
    semester: false,
    grades: [6,7,8],
    cap: 12,
    quarters: {
      avail: [4],
      q: [{}, {}, {}, startPop]
    },
    students: [],
    image: 'http://lorempixel.com/600/100'
  },
  {
    _id: 'id8',
    name: 'Hand Bells',
    description: 'Description goes here',
    semester: false,
    grades: [6,7,8],
    cap: 10,
    quarters: {
      avail: [4],
      q: [{}, {}, {}, startPop]
    },
    students: [],
    image: 'http://lorempixel.com/600/100'
  },
  {
    _id: 'id9',
    name: 'Foreign Language (Spanish)',
    description: 'Description goes here',
    semester: true,
    grades: [7,8],
    cap: 21,
    quarters: {
      avail: [1,3],
      q: [startPop, {}, startPop, {}]
    },
    students: [],
    image: 'http://lorempixel.com/600/100'
  },
  {
    _id: 'id10',
    name: 'Robotics',
    description: 'Description goes here',
    semester: true,
    grades: [6,7,8],
    cap: 10,
    quarters: {
      avail: [1],
      q: [startPop, {}, {}, {}]
    },
    students: [],
    image: 'http://lorempixel.com/600/100'
  }];

  return electives;
});
