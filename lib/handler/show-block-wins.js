const BigNumber = require('bignumber.js');

const logger = require('../services/logger');
const Walker = require('../walker');
const Wallet = require('../wallet');

module.exports = async (plotDirs, opts) => {
  const walker = new Walker(plotDirs);
  await walker.scanAll();

  logger.log({ level: 'info', msg: `Scanned ${walker.directoriesScanned} directories and found ${walker.plots.length} plot files` });
  if (walker.plots.length === 0) {
    return;
  }

  const wallet = new Wallet({ coin: opts.coin, url: opts.url });

  // Calculate won blocks
  let totalWonBlocks = 0;
  let totalWonBlocksDetected = 0;
  const plotsByAccountId = walker.plotsByAccountId;
  await Promise.all(Object.keys(plotsByAccountId).map(async accountId => {
    logger.log({ level: 'info', msg: `Checking won blocks for plotterId ${accountId} ..` });
    const wonBlocks = await wallet.getWonBlocksForPlotterId(accountId);
    const plots = plotsByAccountId[accountId];
    wonBlocks.forEach(block => {
      const winningPlot = plots.find(plot => plot.containsNonce(block.nonce));
      if (!winningPlot) {
        return;
      }
      winningPlot.blocksWon += 1;
    });
    plots.sort((a, b) => {
      if ((new BigNumber(a.blocksWon)).isLessThan(b.blocksWon)) {
        return 1;
      }
      if ((new BigNumber(a.blocksWon)).isGreaterThan(b.blocksWon)) {
        return -1;
      }
      return 0;
    });

    totalWonBlocks += wonBlocks.length;
    totalWonBlocksDetected += plots.reduce((acc, curr) => acc + curr.blocksWon, 0);
  }));

  logger.log({ level: 'info', msg: `Won a total of ${totalWonBlocks} blocks, ${totalWonBlocksDetected} block wins with matching plot files` });

  Object.keys(plotsByAccountId).map(accountId => {
    const plots = plotsByAccountId[accountId];
    logger.log({ level: 'info', msg: `PlotterId ${accountId}:` });
    plots.map(plot => {
      logger.log({ level: 'info', msg: `${plot.blocksWon.toString().padStart(3, ' ')} blocks won | ${plot.path} (${plot.sizeInGiB.toFixed(0)} GiB) | Age: ${plot.age}` });
    });
  });
};