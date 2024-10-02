
<template>
<div class="container mx-auto p-4 bg-opacity-20 bg-white backdrop-filter backdrop-blur-lg rounded-lg shadow-lg">
<h1 class="text-3xl font-bold mb-4 text-center text-blue-500">Wrap Ether (WETH)</h1>
<div class="mb-4">
<label class="block text-sm font-medium text-gray-700" for="amount">Amount of ETH to wrap:</label>
<input class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" id="amount" min="0" placeholder="Enter amount" step="0.01" type="number" v-model="amount"/>
</div>
<button @click="wrapEther" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
      Wrap ETH
    </button>
<div class="mt-4 p-4 bg-opacity-30 bg-gray-100 rounded-lg shadow-inner">
<p class="text-lg font-semibold">WETH Balance: {{ wethBalance }} WETH</p>
<p :class="{'text-green-500': txStatus === 'success', 'text-red-500': txStatus === 'error'}" class="text-sm mt-2">
        {{ txMessage }}
      </p>
</div>
</div>
</template>
<script>
import { ethers } from 'ethers'

export default {
  name: 'WrapEther',
  data() {
    return {
      amount: '',
      wethBalance: '0',
      txStatus: '',
      txMessage: '',
      provider: null,
      signer: null,
      contract: null,
      contractAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chainId: 1,
      abi: [
        {
          "name": "deposit",
          "stateMutability": "payable",
          "inputs": [],
          "outputs": []
        },
        {
          "name": "balanceOf",
          "stateMutability": "view",
          "inputs": [
            {
              "name": "account",
              "type": "address"
            }
          ],
          "outputs": [
            {
              "name": "balance",
              "type": "uint256"
            }
          ]
        }
      ]
    }
  },
  methods: {
    async connectWallet() {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' })
          this.provider = new ethers.providers.Web3Provider(window.ethereum)
          this.signer = this.provider.getSigner()
          this.contract = new ethers.Contract(this.contractAddress, this.abi, this.signer)
          await this.checkNetwork()
          await this.updateBalance()
        } catch (error) {
          console.error('Failed to connect wallet:', error)
          this.txStatus = 'error'
          this.txMessage = 'Failed to connect wallet. Please try again.'
        }
      } else {
        this.txStatus = 'error'
        this.txMessage = 'Please install MetaMask or another Web3 wallet.'
      }
    },
    async checkNetwork() {
      const network = await this.provider.getNetwork()
      if (network.chainId !== this.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ethers.utils.hexValue(this.chainId) }],
          })
        } catch (error) {
          console.error('Failed to switch network:', error)
          this.txStatus = 'error'
          this.txMessage = 'Please switch to the Ethereum mainnet in your wallet.'
        }
      }
    },
    async updateBalance() {
      if (this.contract && this.signer) {
        const address = await this.signer.getAddress()
        const balance = await this.contract.balanceOf(address)
        this.wethBalance = ethers.utils.formatEther(balance)
      }
    },
    async wrapEther() {
      if (!this.amount || parseFloat(this.amount) <= 0) {
        this.txStatus = 'error'
        this.txMessage = 'Please enter a valid amount.'
        return
      }

      if (!this.contract) {
        await this.connectWallet()
      }

      if (this.contract) {
        try {
          const tx = await this.contract.deposit({
            value: ethers.utils.parseEther(this.amount)
          })
          this.txStatus = 'pending'
          this.txMessage = 'Transaction pending...'
          await tx.wait()
          this.txStatus = 'success'
          this.txMessage = 'ETH successfully wrapped to WETH!'
          await this.updateBalance()
        } catch (error) {
          console.error('Error wrapping ETH:', error)
          this.txStatus = 'error'
          this.txMessage = 'Failed to wrap ETH. Please try again.'
        }
      }
    }
  },
  mounted() {
    this.connectWallet()
  }
}
</script>
