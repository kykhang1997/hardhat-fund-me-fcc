import { ethers } from './ethers-5.6.esm.min.js';
import FundMe from '../artifacts/contracts/FundMe.sol/FundMe.json' assert { type: 'json' };

const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

const connectBtn = document.getElementById('connectButton');
const fundBtn = document.getElementById('fundButton');
const valueInputFun = document.getElementById('ethAmount');
const balanceBtn = document.getElementById('balanceButton');
const withdrawBtn = document.getElementById('withdrawButton');
const accountDom = document.getElementById('account');
const balanceDom = document.getElementById('balance');

let account;

connectBtn.onclick = connect;
fundBtn.onclick = fund;
balanceBtn.onclick = getBalance;
withdrawBtn.onclick = withdraw;

async function connect() {
	if (typeof window.ethereum !== 'undefined') {
		try {
			await window.ethereum.request({
				method: 'eth_requestAccounts',
			});
			connectBtn.innerHTML = 'Connected';
			const accounts = await window.ethereum.request({
				method: 'eth_accounts',
			});
			account = accounts[0];
			console.log('accounts', accounts);
			accountDom.innerHTML = `Account: ${account}`;
		} catch (error) {
			console.log('eth_requestAccounts', error);
		}
	} else {
		connectBtn.innerHTML = 'Please install extension MetaMask';
	}
}

async function getBalance() {
	if (typeof window.ethereum !== 'undefined') {
		try {
			const { provider } = providerContractBase();
			const balance = await provider.getBalance(CONTRACT_ADDRESS);
			balanceDom.innerHTML = `Balance: ${ethers.utils.formatEther(
				balance
			)} ETH`;
		} catch (error) {
			console.log('getBalance', error);
		}
	} else {
		connectBtn.innerHTML = 'Please install extension MetaMask';
	}
}

async function withdraw() {
	console.log(`widthraw with  Account ${account}`);
	if (typeof window.ethereum !== 'undefined') {
		try {
			const { contract, provider } = providerContractBase();
			const transactionResponse = await contract.withdraw();
			await listenForTransactionMined(transactionResponse, provider);
			console.log('Fund done!');
			getBalance();
		} catch (error) {
			console.log('transactionResponse Err', error);
		}
	}
}

async function fund() {
	console.log(`Funding with ${valueInputFun.value} - Account ${account}`);
	if (typeof window.ethereum !== 'undefined') {
		if (valueInputFun.value === '') return;
		try {
			const { contract, provider } = providerContractBase();
			const transactionResponse = await contract.fund({
				value: ethers.utils.parseUnits(`${valueInputFun.value}`),
			});
			// listen for the transaction to the mined
			// listen for an event <- we haven't learned about yet!
			await listenForTransactionMined(transactionResponse, provider);
			console.log('Fund done!');
			getBalance();
			valueInputFun.value = '';
		} catch (error) {
			console.log('transactionResponse Err', error);
		}
	}
}

function listenForTransactionMined(transactionResponse, provider) {
	return new Promise(function (resolve, reject) {
		try {
			provider.once(transactionResponse.hash, (transactionReceipt) => {
				console.log(
					`Completed with ${transactionReceipt.confirmations} confirmations`
				);
				resolve();
			});
		} catch (error) {
			reject(error);
		}
	});
}

function providerContractBase() {
	// provider / connection to the blockchain
	// signer / wallet / someone with some gas
	// contract that we are interacting with
	// ^ ABI & A ddress
	const provider = new ethers.providers.Web3Provider(window.ethereum);
	const signer = provider.getSigner();
	const contract = new ethers.Contract(CONTRACT_ADDRESS, FundMe.abi, signer);
	return { provider, signer, contract };
}
