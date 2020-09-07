const { program } = require('commander');

const version = require('./package.json').version;
const checkOverlapsHandler = require('./lib/handler/check-overlaps');
const showBlockWinsHandler = require('./lib/handler/show-block-wins');

program.version(version);

program
  .command('check-overlaps <plot-directories...>')
  .description('Check the supplied directories for plot files and verify no overlaps exist')
  .action(checkOverlapsHandler);

program
  .command('show-block-wins <plot-directories...>')
  .option('--coin [coin]', 'select the coin to use, currently only BURST is supported', 'BURST')
  .option('--url [url]', 'select the wallet url to use', 'https://wallet1.burst-team.us:2083')
  .description('Check the supplied directories for plot files and show each plot files block wins count')
  .action(showBlockWinsHandler);

program.parse(process.argv);