const fs = require('fs');


function markdown(text) {
    let outputText = '';
    let specialMode = 0;
    let tillEnd = 0;
    for(let i = 0; i < text.length; ++i) {
        let curr = text[i];
        if(curr == '*')
            specialMode++;
        else {
            if(specialMode > 0) {
                if(tillEnd > 0) {
                    outputText += tillEnd == 2 ? '</strong>' : '</i>';
                    tillEnd = 0;
                }
                else {
                    tillEnd = specialMode;
                    outputText += tillEnd == 2 ? '<strong>' : '<i>';
                }
                specialMode = 0;
            }
            outputText += text[i];
        }
    }
  const reg = /\[([^\]]+)\]\(([^\)"]+)(?:| "([^"]+)")\)/g;
  outputText = outputText.replace(reg, (_, b, c, d) => `<a href="${c}" alt="${d || b}" target="_blank">${b}</a>`);
  return outputText;
}

const english_months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function format_date(text, months) {
  text = (text || '');
  if(months) {
    for(var i=0; i<12; ++i) {
      text = text.replace(english_months[i].toLowerCase(), months[i]);
    }
  }
  return text;
}

function format_html(text) {
  text = text || '';
  text = text.replace('...', '&hellip;');
  // TODO regex matching
  // Replaces dash with unseparable dash
  // text = text.replace('-', '&#8209;');
  text = markdown(text);
  return text;
}

const publicationIconMap = {
  pdf: 'fa fa-file',
  slides: 'fa fa-file',
  bib: 'fa fa-quote-left',
  web: 'fa fa-globe',
  vid: 'fa fa-film',
};

function load_bib(path) {
  const fpath = require.resolve('../public/' + path);
  return encodeURIComponent(fs.readFileSync(fpath, 'utf-8'));
}

function route(path, is_default_locale, locale, kwargs) {
    if (!path)
        return path;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('://'))
        return path;
    if (path.startsWith('tel:') || path.startsWith('mailto:'))
        return path;

    var base = '';
    var extMatch = path.match(/\.([^\.\/\?\#]+)($|\?|\#).*/);
    var ext = (extMatch !== null)?extMatch[1]:'';
    var is_html_page = (ext == '' || ext == 'html') && path.indexOf('images/') !== 0;
    if(!is_default_locale && !is_html_page) {
      base += '../';
    }
    else if(locale && is_html_page) {
      var default_locale = kwargs['default_locale'] || '';
      if(locale != default_locale) {
        base += `../${locale}/`;
      }
      else {
        base += `../`;
      }
    }
    return base + path;
}

function publication_icon(props) {
  return publicationIconMap[props.type];
}

function get_education_items(props, grade_map) {
    let items = [];
    if(props.subtitle)
        items.push(props.subtitle);
    if(props.note && props.degree && props.major)
        items.push(props.note);
    Array.prototype.push.apply(items, (props.grades || []).map(x => String.raw`${grade_map[x.name]}: ${x.value}`));
    return items;
}

function readable_locale(locale) {
  if(locale == 'cs-CZ')
    return 'cz';
  return locale.slice(0, locale.indexOf('-'));
}

function social_icon(name) {
  return {
    'github': 'fa fa-github',
    'google scholar': 'ai ai-google-scholar-square',
    'research gate': 'ai ai-researchgate',
    'linkedin': 'fa fa-linkedin',
    'stackoverflow': 'fa fa-stack-overflow',
    'twitter': 'fa fa-twitter'
  }[name.toLowerCase()];
}

function publication_title(pub) {
  const title = format_html(pub.title);
  const link = (pub.links || []).find(x => x.type === 'web');
  console.log(link);
  if (link) {
    return `<a class="text-link" href="${link.href}">${title}</a>`;
  }
  return title;
}

function strip_protocol(url) {
  return url.match(/:\/\/(?:www\.|)(.*)/)[1];
}

function map(x, property) {
  return x.map(y => y[property])
}

function image(url, opt) {
  opt = opt || {};
  opt = Object.assign({
    alt: "",
    className: "",
    lazy: false
  }, opt);
  let attr = "";
  if (opt.lazy) {
    attr += ' loading="lazy"';
    opt.className += ' lazy-img';
  }
  if (opt.className) {
    attr += ` class="${opt.className.trim()}`;
  }
  return `<picture>
    <source srcset="${url}.webp, ${url}@2x.webp 2x" type="image/webp" />
    <source srcset="${url}.jpg, ${url}@2x.jpg 2x" type="image/jpeg" />
    <img alt="${opt.alt}" src="${url}.jpg"${attr}/>
  </picture>`
}

module.exports = {format_date, format_html, load_bib, publication_icon, route, get_education_items, readable_locale, social_icon, strip_protocol, map, publication_title, image };
