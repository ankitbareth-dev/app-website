const fetchTickets = async () => {
try {
setIsFetchingTickets(true);
setApiError("");

      const apiDomain = localStorage.getItem("apiDomain");
      const dbName = localStorage.getItem("dbName");

      const response = await fetch("/api/get-created-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: userLoginData.email,
          password: userLoginData.password,
          apiKey: userLoginData["api-Key"],
          db: dbName,
          apiDomain,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      setIsFetchingTickets(false);

      const data = await response.json();

      if (data && Array.isArray(data.records)) {
        const transformedTickets = data.records.map(transformApiTicket);
        setTickets(transformedTickets);
        // Initialize visible tickets with first page
        setVisibleTickets(transformedTickets.slice(0, TICKETS_PER_PAGE));
      } else {
        setTickets([]);
        setVisibleTickets([]);
        setApiError("No tickets found");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setApiError("Error loading tickets. Please try again later.");
    } finally {
      setIsFetchingTickets(false);
    }

};
