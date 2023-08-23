import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import 'solidity-coverage';
import 'hardhat-gas-reporter';
import 'dotenv/config';
//* ---- nomicfoundation/hardhat-ethers if use ethers.getContract
import '@nomicfoundation/hardhat-ethers';
import 'hardhat-deploy-ethers';
//* ----
import '@nomicfoundation/hardhat-verify';

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || '';
const SEPOLIA_RPC_URL =
	process.env.SEPOLIA_RPC_URL ||
	'https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY';
const PRIVATE_KEY =
	process.env.PRIVATE_KEY ||
	'0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

const config: HardhatUserConfig = {
	solidity: '0.8.19',
	defaultNetwork: 'hardhat',
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
	networks: {
		hardhat: {
			chainId: 31337,
			// gasPrice: 130000000000,
		},
		sepolia: {
			url: SEPOLIA_RPC_URL,
			accounts: [PRIVATE_KEY],
			chainId: 11155111,
		},
	},
	// hardhat gas
	gasReporter: {
		enabled: true,
		currency: 'USD',
		outputFile: 'gas-report.txt',
		noColors: true,
		coinmarketcap: COINMARKETCAP_API_KEY,
	},
	// hardhat-deploy
	namedAccounts: {
		deployer: {
			default: 0, // here this will by default take the first account as deployer
			1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
		},
	},
};

export default config;
