import assignElectives from './assignElectives';
import resetElectives from './resetElectives';
import fromCsv from './fromCsv';
import createHtmlLog from './createHtmlLog';
import setElectivesCap from './testing/setElectivesCap';
import setStudentLists from './testing/setStudentLists';
import randomizeStudentLists from './testing/randomizeStudentLists';
import logElectives from './testing/logElectives';

export default {
  assignElectives,
  resetElectives,
  fromCsv,
  createHtmlLog,
  testing: {
    setStudentLists,
    randomizeStudentLists,
    logElectives,
    setElectivesCap,
  },
};
