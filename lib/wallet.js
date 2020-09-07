const axios = require('axios');
const logger = require('./services/logger');

class Wallet {
  constructor({ coin, url }) {
    this.coin = coin;
    this.url = url;
  }

  async getWonBlocksForPlotterId(plotterId) {
    switch (this.coin) {
      case 'BURST':
        let wonBlocks = [];
        let done = false;
        while (!done) {
          try {
            const { blocks } = await this.doBurstApiCall('getAccountBlocks', {
              account: plotterId,
            });
            wonBlocks = blocks;
            done = true;
          } catch (err) {
            logger.log({ level: 'error', msg: `Wallet | ${this.coin} | Error: ${err.message}` });
            await new Promise(resolve => setTimeout(resolve, 2 * 1000));
          }
        }
        return wonBlocks;
      case 'BHD':
        return this.getBhdWonBlocksFromExplorer(plotterId);
      default: throw new Error(`Unknown coin: ${this.coin}`);
    }
  }

  async getBhdWonBlocksFromExplorer(plotterId) {
    let wonBlocks = [];
    let done = false;
    let page = 1;
    const limit = 100;
    while (!done) {
      try {
        const { data: blocks } = await axios.get(`https://bhdnetwork.azurewebsites.net/api/block/searchforger/${plotterId}/${page}/${limit}`);
        wonBlocks = wonBlocks.concat(blocks);
        if (blocks.length !== limit) {
          done = true;
        }
        page += 1;
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        logger.log({ level: 'error', msg: `Wallet | ${this.coin} | Error: ${err.message}` });
        await new Promise(resolve => setTimeout(resolve, 2 * 1000));
      }
    }

    return wonBlocks;
  }

  async doBurstApiCall(method, params = {}, endpoint = 'burst') {
    const queryParams = {
      requestType: method,
    };
    Object.keys(params).forEach(key => {
      queryParams[key] = params[key];
    });
    const { data } = await axios.get(`${this.url}/${endpoint}`, {
      params: queryParams,
    });

    if (data.errorDescription) {
      throw new Error(data.errorDescription);
    }

    return data;
  }
}

module.exports = Wallet;
