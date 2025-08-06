const getAccurateTime = async () => {
  const TIMEOUT_MS = 1500;

  const fetchWithTimeout = (url, timeout) => {
    return Promise.race([
      fetch(url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      ),
    ]);
  };

  try {
    const response = await fetchWithTimeout(
      "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata",
      TIMEOUT_MS
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Accurate time from timeapi.io:", data.dateTime);
    return new Date(data.dateTime);
  } catch (error) {
    console.warn("⚠️ Failed to fetch accurate time:", error.message);
    console.warn("⏰ Falling back to system time.");
    return new Date(); // fallback to local time
  }
};

export { getAccurateTime };
