import { DeployFunction } from 'hardhat-deploy/types';
import { developmentChains, networkConfig } from '../helper-hardhat-config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const DECIMALS = '18';
const INITIAL_PRICE = '2000000000000000000000'; // 2000

const deployMocks: DeployFunction = async ({
	getNamedAccounts,
	deployments,
	network,
}: HardhatRuntimeEnvironment) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId: number = network.config.chainId!;

	if (developmentChains.includes(network.name)) {
		log('Local network detected! Deploying mocks...');
		await deploy('MockV3Aggregator', {
			from: deployer,
			contract: 'MockV3Aggregator',
			log: true,
			args: [DECIMALS, INITIAL_PRICE],
		});
		log('Mocks Deployed!');
		log('----------------------------------');
		log(
			"You are deploying to a local network, you'll need a local network running to interact"
		);
		log(
			'Please run `yarn hardhat console` to interact with the deployed smart contracts!'
		);
		log('----------------------------------');
	}
};
export default deployMocks;
deployMocks.tags = ['all', 'mocks'];
