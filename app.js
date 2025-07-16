let provider;
let signer;
let contract;
let userAddress;

const CONTRACT_ADDRESS = '0xc27B770ea78025857bF6B5F55bf1F919C8D47a51';
const ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "ItemRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "registerItem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "itemCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "items",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

document.getElementById('connectButton').onclick = async () => {
  if (typeof window.ethereum !== 'undefined') {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    alert("Wallet connected: " + userAddress);
    fetchItems();
  }
};

document.getElementById('registerButton').onclick = async () => {
  const name = document.getElementById('itemName').value;
  const tx = await contract.registerItem(name);
  await tx.wait();
  alert("Item registered!");
  fetchItems();
};

async function fetchItems() {
  document.getElementById('itemList').innerHTML = "";

  const filter = contract.filters.ItemRegistered();
  const events = await contract.queryFilter(filter, 0, "latest");

  for (let e of events) {
    const id = e.args.id.toString();
    const name = e.args.name;
    const owner = e.args.owner;

    const li = document.createElement('li');
    li.innerHTML = `
      <b>${name}</b> (ID: ${id})<br>
      Owner: ${owner}<br>
      ${owner.toLowerCase() === userAddress.toLowerCase() ?
        `<input placeholder="New owner address" id="to-${id}">
         <button onclick="transfer(${id})">Transfer</button>` : ''}
      <button onclick="viewHistory(${id})">View History</button>
    `;
    document.getElementById('itemList').appendChild(li);
  }
}

async function transfer(id) {
  const newOwner = document.getElementById(`to-${id}`).value;
  const tx = await contract.transferOwnership(id, newOwner);
  await tx.wait();
  alert("Ownership transferred.");
  fetchItems();
}

async function viewHistory(id) {
  const filter = contract.filters.OwnershipTransferred(id);
  const events = await contract.queryFilter(filter, 0, "latest");

  let history = `Ownership History for Item ${id}:\n`;
  for (let e of events) {
    history += `From: ${e.args.from} → To: ${e.args.to}\n`;
  }

  if (events.length === 0) {
    history += "No transfers recorded yet.";
  }

  alert(history);
}
