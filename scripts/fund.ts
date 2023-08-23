import { ethers, getNamedAccounts } from 'hardhat';
import { FundMe } from '../typechain-types';

async function main() {
	const { deployer } = await getNamedAccounts();
	const fundMe: FundMe = await ethers.getContract('FundMe', deployer);

	console.log(`Got contract FundMe at ${fundMe.target}`);
	console.log('Funding contract...');

	const transactionResponse = await fundMe.fund({
		value: ethers.parseEther('0.05'),
	});
	await transactionResponse.wait();
	console.log('Funded!');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('fund catch', error);
		process.exitCode = 1;
	});
