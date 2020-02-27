const premier = require('./premier');

(async () => {

  let nr = process.argv.slice(2);
  
  await premier.initialize('goals');

  let results = await premier.getResults(nr);

  await premier.exportResuls(results);

})();
