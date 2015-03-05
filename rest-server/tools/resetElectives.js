'use strict';

var Promise       = require('promise');
var Elective      = require('../models/elective');
var ElectiveGroup = require('../models/electiveGroup');

var electives = [{
  name: 'Physical Fitness: Soccer Dome',
  description: 'Description goes here',
  semester: false,
  required: false,
  cap: 30,
  perYear: 2,
  images: ['http://www.real.com/resources/wp-content/uploads/2012/11/soccer.jpg'],
  grades: [6,7,8],
  available: [1,4]
},
{
  name: 'Physical Fitness: Team Sports',
  description: 'Description goes here',
  semester: false,
  required: false,
  cap: 30,
  perYear: 2,
  images: ['http://www.atlantajcc.org/clientuploads/400-width/SP-FlagFootball-Home.jpg'],
  grades: [6,7,8],
  available: [2,3]
},
{
  name: 'Art',
  description: 'Description goes here',
  semester: false,
  required: false,
  cap: 21,
  perYear: 4,
  images: ['http://www.arttherapyblog.com/uimages/2011/01/art-therapy-career2.jpg'],
  grades: [6,7,8],
  available: [1,2,3,4]
},
{
  name: 'Martial Arts',
  description: 'Description goes here',
  semester: false,
  required: false,
  cap: 15,
  perYear: 2,
  images: ['http://www.soramartialarts.com/Images/kick.jpg'],
  grades: [6,7,8],
  available: [1,2,3,4]
},
{
  name: 'Home Economics',
  description: 'Description goes here',
  semester: true,
  required: false,
  cap: 12,
  perYear: 1,
  images: ['http://jacksonville.com/sites/default/files/imagecache/superphoto/lif_08LifeHomeMaker0.jpg'],
  grades: [6,7,8],
  available: [1]
},
{
  name: 'Hand Sewing',
  description: 'Description goes here',
  semester: false,
  required: false,
  cap: 12,
  perYear: 1,
  images: ['http://www.offthegridnews.com/wp-content/uploads/2013/11/sewing-400x266.jpg'],
  grades: [6,7,8],
  available: [3]
},
{
  name: 'Kitchen Science',
  description: 'Description goes here',
  semester: false,
  required: false,
  cap: 12,
  perYear: 1,
  images: ['http://www.bizbag.com/Kitchen%20Science/Kitchen%20Science%20title%20pic.jpg'],
  grades: [6,7,8],
  available: [4]
},
{
  name: 'Hand Bells',
  description: 'Description goes here',
  semester: false,
  required: false,
  cap: 10,
  perYear: 1,
  images: ['http://www.lancasterunited.org/files/LancasterUMC/Music/HandbellChoir/handbells.jpg'],
  grades: [6,7,8],
  available: [4]
},
{
  name: 'Foreign Language (Spanish)',
  description: 'Description goes here',
  semester: true,
  required: true,
  cap: 21,
  perYear: 2,
  images: ['http://www.nyc.ie/wp-content/uploads/2013/03/Spain-in-Sand.jpg'],
  grades: [7,8],
  available: [1,3]
},
{
  name: 'Robotics',
  description: 'Description goes here',
  semester: true,
  required: false,
  cap: 10,
  perYear: 1,
  images: ['http://www.youngeng.com.ng/wp-content/uploads/2012/08/robotics-enrichment-program.png'],
  grades: [6,7,8],
  available: [1]
}];

function resetElectivesData() {
  return new Promise(function(resolve, reject) {
    ElectiveGroup.remove().exec().then(function() {
      Elective.remove().exec().then(function() {
        var total = electives.length;
        var count = 0;
        var peElectives = [];
        electives.forEach(function(elective) {
          var newElective = new Elective(elective);
          if (newElective.name.indexOf('Physical Fitness') > -1) { peElectives.push(newElective); }
          newElective.save(function(err) {
            if (err) { reject(err); }
            count++;
            if (count === total) { resolve(peElectives); }
          });
        });
      });
    });
  });
}

function setupElectiveGroup(peElectives) {
  return new Promise(function(resolve, reject) {
    var electiveGroup = new ElectiveGroup({
      name:         'Physical Fitness',
      description:  'P.E. electives',
      perYear:      2
    });

    var index = 0;
    peElectives.forEach(function(elective) {
      electiveGroup.electives.push(elective.id);
      elective._group = electiveGroup.id;
      elective.save(function(err) {
        if (err) { reject(err); }
        index++;
        if (index >= peElectives.length) {
          electiveGroup.save(function(err) {
            if (err) { reject(err); }
            resolve();
          });
        }
      });
    });
  });
}

module.exports = function(req, res) {
  resetElectivesData()
    .then(setupElectiveGroup)
    .then(function() {
      res.json({ message: 'Electives reset successfully' });
    });
};
