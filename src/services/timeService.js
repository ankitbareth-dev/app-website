const getAccurateTime = async () => {
  try {
    const response = await fetch(
      "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata"
    );
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Accurate time from timeapi.io:", data.dateTime);
    return new Date(data.dateTime);
  } catch (error) {
    console.warn("⚠️ Failed to fetch time from timeapi.io:", error.message);
    console.warn("⏰ Falling back to client system time.");
    return new Date(); // Local system time as fallback
  }
};

export { getAccurateTime };
