const { promises: fs } = require('fs');
const { join } = require('path');
const { groupBy } = require('lodash');
const Plot = require('./plot');

class Walker {
  constructor(rootDirs) {
    this.rootDirs = rootDirs;
    this.plots = [];
    this.directoriesScanned = 0;
  }

  async scanAll() {
    await Promise.all(this.rootDirs.map(rootDir => this.scan(rootDir)));
  }

  async scan(dir) {
    let files = null;
    try {
      files = await fs.readdir(dir);
    } catch(err) {
      return;
    }
    this.directoriesScanned += 1;
    await Promise.all(files.map(async file => {
      const filePath = join(dir, file);
      let stats = null;
      try {
        stats = await fs.stat(filePath);
      } catch (err) {
        return;
      }
      if (stats.isDirectory()) {
        await this.scan(filePath);
        return;
      }
      if (!Plot.isPlot(file)) {
        return;
      }
      this.plots.push(new Plot(filePath, stats.birthtime));
    }));
  }

  get plotsByAccountId() {
    return groupBy(this.plots, plot => plot.accountId);
  }
}

module.exports = Walker;
