'use strict';
/* global stockElectives:true */
/* exported stockElectives */

var stockElectives = function() {
  var startPop = {
    current: 0,
    grade7: 0,
    grade8: 0
  };
  return [{
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
};
