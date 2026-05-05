export const fetchPiPrice = async () => {
    try {
      // Fetch from OKX API
      const response = await fetch('https://api.piscan.io/data/pi-price');
      if (response.ok) {
        const data = await response.json();
        if (data && data.data && data.data[0]) {
           return parseFloat(data.data[0].idxPx)
        }
      }
    } catch (error) {
      console.error("Failed to fetch Pi price:", error);
      // Keep using default price if fetch fails
      return 2;
    }
  };