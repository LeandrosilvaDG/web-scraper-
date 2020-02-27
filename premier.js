const puppeteer = require('puppeteer');
const fs = require('fs');

const SATS_URL = (stats) => `https://www.premierleague.com/stats/top/players/${stats}?se=-1&cl=-1&iso=-1&po=-1?se=-1`;

const self = {
  browser: null,
  page: null,

  initialize: async (stats) => {
    
    self.browser = await puppeteer.launch({
      headless: true
    });
    self.page = await self.browser.newPage();

    await self.page.goto(SATS_URL(stats), { waitUntil: 'networkidle0' });
  
  },

  getResults: async (nr) => {

    let results =[];

    do {
      
      let new_results = await self.parseResults();

      results = [...results, ...new_results ];
      
      if(results.length < nr) {

        let nextPage = await self.page.waitForSelector('.paginationContainer > .paginationNextContainer');

        // let nextPage = await self.page.$('document.querySelector(".paginationContainer > .paginationNextContainer")');

        if(nextPage) {

          await nextPage.click();

        } else {
          console.log("here!!")
          break;

        }
      }

    } while( results.length < nr );

    await self.browser.close();
    return results.slice(0, nr);

  }, 

  parseResults: async () => {
    
    let elements = await self.page.$$('tbody[class*="statsTableContainer"] > tr');
    let results = [];

    for(element of elements) {
      let rank = await element.$eval(('td[class="rank"]'), node => node.innerText.trim());
      let playerName = await element.$eval(('a[class="playerName"]'), node => node.innerText.trim());
      let nationality = await element.$eval(('span[class="playerCountry"]'), node => node.innerText.trim());
      let goals = await element.$eval(('td[class="mainStat"]'), node => node.innerText.trim());
      
      results.push({
        rank,
        name: playerName,
        nationality,
        goals
      }); 

    }

    return results;

  }, 

  exportResuls: async (results) => {

    let data = [];

    for(result of results) {
      data.push(`${result.rank}\t${result.name}\t${result.nationality}\t${result.goals}\n`);
    }
    
    fs.writeFile(`./public/${Date.now()}.xls`, data, 'utf8',(error) => {
      if(error) throw error;
      console.log('File Created!');
    });

  }

}

module.exports = self;
