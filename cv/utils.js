const Vinyl = require('vinyl');
const through = require('through2');
const process = require('child_process');
const fs = require('fs');


function formatLatex(latexDir, compiler) {
  if(!compiler) compiler = 'xelatex';
  return through.obj(function(file, enc, callback) {
    const filename = file.path.replace(/^.*[\\\/]/, '');
    const basename = filename.split('.').slice(0, -1).join('.');
    process.execSync('rm -rf /tmp/cv-latex-build && mkdir -p /tmp/cv-latex-build');
    process.execSync('cp -r ' + latexDir + '/* /tmp/cv-latex-build/');
    fs.writeFileSync('/tmp/cv-latex-build/' + filename, file.contents);
    process.execSync(`latexmk -${compiler} ` + filename, { cwd: '/tmp/cv-latex-build' });
    this.push(new Vinyl({
      path: basename + '.pdf',
      contents: fs.readFileSync('/tmp/cv-latex-build/' + basename + '.pdf')
    }));
    callback();
  });
}

module.exports = { formatLatex };
