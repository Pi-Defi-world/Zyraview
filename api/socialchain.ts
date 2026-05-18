import axios from 'axios';

const BASE_URL_SOCIALCHAIN = 'https://api.zyrachain.org/';

const api = axios.create({
  baseURL: BASE_URL_SOCIALCHAIN,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const socialchain = {
  // 🔍 Get account details by ID
  getSupply: async () => {
    try {
      const response = await api.get(`/data/mainnet-supply`);
      return response.data;
    } catch (error) {
      console.error('Error fetching account details:', error);
      return {
        "total_circulating_supply": 6600980756.30989,
        "total_locked": 4968482226.44967,
        "total_supply": 10155355009.7075,
      }
    }
  },
};
