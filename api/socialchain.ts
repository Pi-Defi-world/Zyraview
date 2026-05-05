import axios from 'axios';

const BASE_URL_SOCIALCHAIN = 'https://oracle-three-xi.vercel.app';

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
  checkScamWarning: async (address: string) => {
    try {
      const response = await api.get(`/check-scam-wallet/${address}`);
      // alert(response.data.is_scam);
      if (response.data.is_scam) {
        return true;
      }
    } catch (error) {
      console.error('Error fetching scam warning:', error);
      return false;
    }
  }
};
