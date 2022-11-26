const fetch = require('node-fetch');
const fs = require('fs');
const cheerio = require('cheerio');


function getPublicationId(title, year) {
  let fw = title.toLowerCase().match(/^[a-z]+/)[0];
  return `${year}${fw}`
}


async function getScholarCitations(url) {
  let response = await fetch(url);
  if(response.status != 200) {
    throw Error('Invalid response');
  }
  let body = await response.text();
  const $ = cheerio.load(body);
  const records = $('.gsc_a_tr');
  var output = {};
  for(var i = 0; i < records.length; ++i) {
    var a = records[i];
    var citeCount = $('.gsc_a_ac', a).text();
    var title = $('.gsc_a_at', a).text();
    var year = $('.gsc_a_y', a).text();
    if(citeCount) {
      output[getPublicationId(title, year)] = parseInt(citeCount);
    }
  }
  return output;
}


async function getData() {
  data = JSON.parse(await fs.promises.readFile('./web/data.json', 'utf8'));
  var gsprofile = data.links.filter(x => x.name.toLowerCase() === 'google scholar' && x.url).map(x => x.url);
  if(gsprofile.length > 0) {
    var citeCount = await getScholarCitations(gsprofile[0]);
    console.log(citeCount);
    data.citeCounts = citeCount;
    if(data.publications) {
      data.publications = data.publications.map(x => Object.assign({}, x, {
        citedBy: citeCount[x.title.toLowerCase()],
      }));
    }
  }
  data.currentYear = (new Date(Date.now())).getFullYear();
  data = {...data, 
    experience: data.experience.filter(x => x.visible !== false),
    projects: data.projects.filter(x => x.visible !== false)};
  return Promise.resolve(data);
}


module.exports = { getData };
