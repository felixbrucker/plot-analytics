const BigNumber = require('bignumber.js');

const logger = require('../services/logger');
const Walker = require('../walker');

module.exports = async (plotDirs) => {
  const walker = new Walker(plotDirs);
  await walker.scanAll();

  logger.log({ level: 'info', msg: `Scanned ${walker.directoriesScanned} directories and found ${walker.plots.length} plot files` });
  if (walker.plots.length === 0) {
    return;
  }

  // Detect overlaps
  const plotsByAccountId = walker.plotsByAccountId;
  Object.keys(plotsByAccountId).map(accountId => {
    const plots = plotsByAccountId[accountId];
    plots.sort((a, b) => {
      if ((new BigNumber(a.startNonce)).isLessThan(b.startNonce)) {
        return -1;
      }
      if ((new BigNumber(a.startNonce)).isGreaterThan(b.startNonce)) {
        return 1;
      }
      return 0;
    });
    plots.forEach(plot => {
      plots.forEach(plot2 => {
        if (!plot.isInside(plot2)) {
          return;
        }
        plot.addOverlappingPlot(plot2);
      });
    });
  });

  const overlappingPlots = Object.keys(plotsByAccountId).reduce((acc, accountId) => {
    const plots = plotsByAccountId[accountId];
    const overlappingPlots = plots.filter(plot => plot.overlappingPlots.length > 0);

    return acc.concat(overlappingPlots);
  }, []);
  if (overlappingPlots.length === 0) {
    logger.log({ level: 'info', msg: 'No overlapping plots found, nice!' });
    return;
  }

  logger.log({ level: 'info', msg: 'Found the following overlapping plots:' });
  Object.keys(plotsByAccountId).map(accountId => {
    const plots = plotsByAccountId[accountId];
    const overlappingPlots = plots.filter(plot => plot.overlappingPlots.length > 0);
    if (overlappingPlots.length === 0) {
      return;
    }
    logger.log({ level: 'info', msg: `PlotterId ${accountId}:` });
    overlappingPlots.map(plot => {
      logger.log({ level: 'info', msg: `\t${plot.path} (${plot.sizeInGiB.toFixed(0)} GiB) overlaps with` });
      plot.overlappingPlots.map(overlappingPlot => {
        logger.log({ level: 'info', msg: `\t\t${overlappingPlot.path} (${overlappingPlot.sizeInGiB.toFixed(0)} GiB) | Age: ${plot.age}` });
      });
    });
  });
};