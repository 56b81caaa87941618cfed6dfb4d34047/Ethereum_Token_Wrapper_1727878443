
<template>
<div class="container mx-auto p-8 bg-opacity-20 bg-white backdrop-filter backdrop-blur-lg rounded-lg shadow-lg">
<h1 class="text-3xl font-bold mb-6 text-purple-500">Wrap ETH to WETH</h1>
<div class="mb-4">
<label class="block text-sm font-medium text-gray-700 mb-2" for="amount">Amount of ETH to wrap:</label>
<input class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent" id="amount" min="0" placeholder="Enter amount in ETH" step="0.000000000000000001" type="number" v-model="amount"/>
</div>
<button :disabled="!isValidAmount" @click="wrapEth" class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105">
      Wrap ETH
    </button>
<div class="mt-4 p-4 bg-opacity-20 bg-green-500 backdrop-filter backdrop-blur-lg rounded-md" v-if="result">
<p class="text-green-800">{{ result }}</p>
</div>
<div class="mt-4 p-4 bg-opacity-20 bg-red-500 backdrop-filter backdrop-blur-lg rounded-md" v-if="error">
<p class="text-red-800">{{ error }}</p>
</div>
</div>
</template>
<script>
import { ethers } from 'ethers';

export default {
  name: 'WrapEther',
  data() {
    return {
      amount: '',
      result: '',
      error: '',
      contractAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      abi: [
        {
          name: "deposit",
          stateMutability: "payable",
          inputs: [],
          outputs: []
        }
      ]
    };
  },
  computed: {
    isValidAmount() {
      return this.amount && parseFloat(this.amount) > 0;
    }
  },
  methods: {
    async wrapEth() {
      this.result = '';
      this.error = '';

      if (!this.isValidAmount) {
        this.error = 'Please enter a valid amount greater than 0';
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(this.contractAddress, this.abi, signer);

        // Check if connected to the correct network
        const network = await provider.getNetwork();
        if (network.chainId !== 1) {
          throw new Error('Please connect to Ethereum mainnet');
        }

        const amountInWei = ethers.utils.parseEther(this.amount);
        const tx = await contract.deposit({ value: amountInWei });
        await tx.wait();

        this.result = `Successfully wrapped ${this.amount} ETH to WETH`;
        this.amount = '';
      } catch (err) {
        this.error = `Error: ${err.message}`;
      }
    }
  }
};
</script>
