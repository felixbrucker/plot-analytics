const {basename} = require('path');
const BigNumber = require('bignumber.js');
const moment = require('moment');

const plotFileRegex = /^([0-9]+)_([0-9]+)_([0-9]+)$/;

class Plot {
  static isPlot(file) {
    return !!file.match(plotFileRegex);
  }

  constructor(path, createdAt) {
    this._path = path;
    this.createdAt = createdAt;
    this._fileName = basename(this.path);
    const parts = this.fileName.match(plotFileRegex);
    this._accountId = parts[1];
    this._startNonce = parts[2];
    this._nonces = parts[3];
    this._sizeInGiB = (new BigNumber(this.nonces)).multipliedBy(256).dividedBy(1024).dividedBy(1024).toNumber();
    this._overlappingPlots = [];
    this.blocksWon = 0;
  }

  isInside(plot) {
    if (this === plot) {
      return false;
    }
    const startOverlaps = (new BigNumber(this.startNonce)).isGreaterThanOrEqualTo(plot.startNonce) && (new BigNumber(this.startNonce)).isLessThan(plot.endNonce);
    const endOverlaps = (new BigNumber(this.endNonce)).isGreaterThan(plot.startNonce) && (new BigNumber(this.endNonce)).isLessThanOrEqualTo(plot.endNonce);

    return startOverlaps || endOverlaps;
  }

  containsNonce(nonce) {
    return (new BigNumber(this.startNonce)).isLessThanOrEqualTo(nonce) && (new BigNumber(this.endNonce)).isGreaterThanOrEqualTo(nonce);
  }

  get accountId() {
    return this._accountId;
  }

  get startNonce() {
    return this._startNonce;
  }

  get nonces() {
    return this._nonces;
  }

  get endNonce() {
    return (new BigNumber(this.startNonce)).plus(this.nonces).toString();
  }

  get fileName() {
    return this._fileName;
  }

  get sizeInGiB() {
    return this._sizeInGiB;
  }

  get path() {
    return this._path;
  }

  get overlappingPlots() {
    return this._overlappingPlots;
  }

  get age() {
    return moment.duration(moment().diff(this.createdAt)).humanize();
  }

  addOverlappingPlot(plot) {
    this.overlappingPlots.push(plot);
  }
}

module.exports = Plot;
