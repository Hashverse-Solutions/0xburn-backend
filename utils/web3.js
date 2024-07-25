const Web3 = require('web3');

// Chain configurations
const mainnetChains = [
  {
    name: 'Arbitrum Nova',
    rpcUrl: 'https://arbitrum-nova-rpc.publicnode.com',
    chainId: 42170,
  }
];

const testnetChains = [
    {
      name: 'Arbitrum Sepolia',
      rpcUrl: 'https://endpoints.omniatech.io/v1/arbitrum/sepolia/public',
      chainId: 421614,
    },
];

// Create Web3 instance with the selected provider
function web3Provider(chainId) {
    return new Promise(async (resolve, reject) => {
        try {
        let chains = process['env']['NODE_ENV'] == 'development' ? testnetChains : mainnetChains;
        const selectedChain = chains.find(chain => chain.chainId === chainId);
      
        if (!selectedChain) {
          console.error('Invalid chain ID');
          return reject('Invalid chain ID');
        }
      
        let web3 = new Web3(new Web3.providers.HttpProvider(selectedChain.rpcUrl));
        console.log(`Web3 instance created for ${selectedChain.name}`);
      
        return resolve(web3);
        } catch (e) { reject(e) }
    });
}

module.exports = web3Provider;