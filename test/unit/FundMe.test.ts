import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { FundMe, MockV3Aggregator } from '../../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { developmentChains } from '../../helper-hardhat-config';
import { assert, expect } from 'chai';

describe('FundMe', () => {
	let fundMe: FundMe;
	let deployer: SignerWithAddress;
	let mockV3Aggregator: MockV3Aggregator;
	const sendValue = ethers.parseUnits('1'); // 1 ETH
	beforeEach(async () => {
		if (!developmentChains.includes(network.name)) {
			throw 'You need to be on a development chain to run tests';
		}
		deployer = (await ethers.getSigners())[0];
		await deployments.fixture(['all']);
		fundMe = await ethers.getContract('FundMe');
		mockV3Aggregator = await ethers.getContract('MockV3Aggregator');
	});

	describe('constructor', () => {
		it('sets the aggregator addresses correctly', async () => {
			const response = await fundMe.s_priceFeed();
			assert.equal(response, mockV3Aggregator.target);
		});
	});

	describe('fund', () => {
		it("Fails if you don't send enough ETH", async () => {
			await expect(fundMe.fund()).to.be.rejectedWith(
				'You need to spend more ETH!'
			);
		});

		it('Updates the amount funded data structure', async () => {
			await fundMe.fund({ value: sendValue });
			const response = await fundMe.s_addressToAmountFunded(deployer);
			assert.equal(
				response.toString(),
				ethers.parseEther('1').toString()
			);
		});

		it('Adds funder to array of funders', async () => {
			await fundMe.fund({ value: sendValue });
			const response = await fundMe.s_funders(0);
			assert.equal(response, deployer.address);
		});
	});

	describe('withdraw', () => {
		beforeEach(async () => {
			await fundMe.fund({ value: sendValue });
		});

		it('gives a single funder all their ETH back', async () => {
			// Arrange
			const startingFundMeBalance =
				await fundMe.runner!.provider!.getBalance(fundMe.target);
			const startingDeployerBalance =
				await fundMe.runner!.provider!.getBalance(deployer.address);

			// Act
			const transactionResponse = await fundMe.withdraw();
			const transactionReceipt = await transactionResponse.wait(1);
			const { gasUsed, gasPrice } = transactionReceipt!;
			const gasCost = gasUsed * gasPrice;
			const endingFundMeBalance = await ethers.provider.getBalance(
				fundMe.target
			);
			const endingDeployerBalance = await ethers.provider.getBalance(
				deployer.address
			);

			// Assert
			assert.equal(endingFundMeBalance.toString(), '0');
			assert.equal(
				String(startingFundMeBalance + startingDeployerBalance),
				String(endingDeployerBalance + gasCost)
			);
		});

		// this test is overloaded. Ideally we'd split it into multiple tests
		// but for simplicity we left it as one
		it('is allows us to withdraw with multiple funders', async () => {
			// Arrange
			const accounts = await ethers.getSigners();
			for (let i = 1; i < 6; i++) {
				await fundMe.connect(accounts[i]).fund({ value: sendValue });
			}
			// Act
			const startingFundMeBalance =
				await fundMe.runner!.provider!.getBalance(fundMe.target);
			const startingDeployerBalance =
				await fundMe.runner!.provider!.getBalance(deployer.address);
			const transactionResponse = await fundMe.cheaperWithdraw();
			// Let's comapre gas costs :)
			// const transactionResponse = await fundMe.withdraw()
			const transactionReceipt = await transactionResponse.wait();
			const { gasUsed, gasPrice } = transactionReceipt!;
			const withdrawGasCost = gasUsed * gasPrice;
			console.log(`GasCost: ${withdrawGasCost}`);
			console.log(`GasUsed: ${gasUsed}`);
			console.log(`GasPrice: ${gasPrice}`);
			const endingFundMeBalance =
				await fundMe.runner!.provider!.getBalance(fundMe.target);
			const endingDeployerBalance =
				await fundMe.runner!.provider!.getBalance(deployer.address);
			// Assert
			assert.equal(
				String(startingFundMeBalance + startingDeployerBalance),
				String(endingDeployerBalance + withdrawGasCost)
			);
			await expect(fundMe.s_funders(0)).to.be.reverted;
			for (let i = 1; i < 6; i++) {
				assert.equal(
					(
						await fundMe.s_addressToAmountFunded(
							accounts[i].address
						)
					).toString(),
					'0'
				);
			}
		});
	});
});
