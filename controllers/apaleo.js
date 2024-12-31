
const axios = require("axios");


const getToken = async () => {
    const apiUrl = "https://identity.apaleo.com/connect/token";

    const data = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: 'LONT-SP-NETWORKOPTIX',
        client_secret: 'uHdidWfFYYGmUljsOg79VnSkKK6ct5',
    });

    const response = await axios.post(apiUrl, data.toString(), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    if (!response.data || !response.data.access_token) {
        throw new Error("Failed to retrieve access token.");
    }

    return response.data.access_token;
};

const getUser = async (req, res) => {
    const roomNumber = req.query.roomNumber;
    const status = req.query.status;

    if (!roomNumber) {
        return res.status(400).send({ error: "Room number is missing" });
    }

    const apiUrl = "https://api.apaleo.com/booking/v1/reservations";
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(today.getDate()).padStart(2, '0');

    // Create the formatted string
    const formattedDate = `${year}-${month}-${day}T00:00:00Z`;

    try {

        const token = await getToken();

        // Define query parameters for the Apaleo API
        const params = {
            status: status || "Confirmed", // Default to 'InHouse' if status is not provided
            from: formattedDate,
            dateFilter: "Stay",
            propertyIds: "21201",
            textSearch: roomNumber, // Use the roomNumber dynamically
            pageSize: 50,
            pageNumber: 1,
        };

        // Make GET request to the Apaleo API
        const response = await axios.get(apiUrl, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            params, // Attach query parameters
        });

        if (!response.data || !response.data.reservations || response.data.reservations.length === 0) {
            return res.status(404).json({ message: 'NO CUSTOMER FOUNDED' });
        }

        // Filter results to include only the specified roomNumber
        const filteredReservations = response.data.reservations.filter(
            (reservation) => reservation.unit.name === roomNumber
        );

        if (filteredReservations.length === 0) {
            return res.status(404).json({ message: `No reservations found for room number ${roomNumber}` });
        }

        // Extract relevant fields for filtered reservations
        const processedData = filteredReservations.map((reservation) => ({
            reservationId: reservation.id,
            customerName: `${reservation.primaryGuest.firstName} ${reservation.primaryGuest.lastName}`,
            customerPhone: reservation.primaryGuest.phone,
            roomNumber: reservation.unit.name,
            status: reservation.status,
            arrival: reservation.arrival,
            departure: reservation.departure,
            checkInTime: reservation.checkInTime,
            checkOutTime: reservation.checkOutTime,
            adults: reservation.adults,
            totalGrossAmount: reservation.totalGrossAmount.amount,
            // totalAmounts: reservation.totalAmounts.
            data: reservation
        }));

        // Return processed data
        res.status(200).json(processedData);
    } catch (error) {
        console.error("Error fetching reservations:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send(error.response?.data || "Internal Server Error");
    }
}

const getIncluded = async (req, res) => {
    const roomNumber = req.query.roomNumber;

    if (!roomNumber) {
        return res.status(400).send({ error: "Room number is missing" });
    }

    const apiUrlReservations = "https://api.apaleo.com/booking/v1/reservations";
    const apiUrlFolios = "https://api.apaleo.com/finance/v1/folios";

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    try {
        // Get token
        const token = await getToken();

        // Fetch reservations for the given room number
        const response = await axios.get(apiUrlReservations, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            params: {
                status: "InHouse",
                textSearch: roomNumber,
                from: `${formattedDate}T00:00:00Z`,
                dateFilter: "Stay",
                propertyIds: "21201",
                pageSize: 50,
            },
        });

        const reservations = response.data?.reservations || [];
        if (reservations.length === 0) {
            return res.status(404).json({ message: `No reservations found for room number ${roomNumber}` });
        }

        const reservation = reservations.find((r) => r.unit.name === roomNumber);
        if (!reservation) {
            return res.status(404).json({ message: `No reservation found for room number ${roomNumber}` });
        }

        // Fetch folios for the reservation
        const folioResponse = await axios.get(apiUrlFolios, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            params: {
                propertyIds: "21201",
                reservationIds: reservation.id,
            },
        });

        const folios = folioResponse.data?.folios || [];
        if (folios.length === 0) {
            return res.status(404).json({ message: `No folios found for reservation ${reservation.id}` });
        }

        // Inspect folios to find included breakfast for today and isPosted: false
        let breakfastIncluded = false;
        let totalBreakfastQuantity = 0;

        for (const folio of folios) {
            const folioDetailsResponse = await axios.get(`${apiUrlFolios}/${folio.id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const charges = folioDetailsResponse.data?.charges || [];
            charges.forEach((charge) => {
                if (
                    charge.serviceType === "FoodAndBeverages" &&
                    charge.type === "IncludedService" &&
                    charge.name.toLowerCase().includes("breakfast") &&
                    charge.serviceDate === formattedDate &&
                    charge.isPosted === false
                ) {
                    breakfastIncluded = true;
                    totalBreakfastQuantity += charge.quantity || 0;
                }
            });
        }

        // Return result with reservation details
        return res.status(200).json({
            reservationId: reservation.id,
            customerName: `${reservation.primaryGuest.firstName} ${reservation.primaryGuest.lastName}`,
            customerPhone: reservation.primaryGuest.phone,
            roomNumber: reservation.unit.name,
            status: reservation.status,
            arrival: reservation.arrival,
            departure: reservation.departure,
            checkInTime: reservation.checkInTime,
            adults: reservation.adults,
            totalGrossAmount: reservation.totalGrossAmount.amount,
            reservationData: reservation,
            breakfastIncluded,
            totalBreakfastQuantity,
        });
    } catch (error) {
        console.error("Error fetching included breakfast:", error.response?.data || error.message);
        return res.status(error.response?.status || 500).send(error.response?.data || "Internal Server Error");
    }
};
const postChargeToFolio = async (folioId, token, qtBreakfast, amount) => {
    const apiUrlFolioActions = `https://api.apaleo.com/finance/v1/folio-actions/${folioId}/charges`;

    const chargeData = {
        serviceType: "FoodAndBeverages",
        vatType: "Normal",
        serviceId: "21201-BRK",
        name: "Breakfast",
        amount: {
            amount: amount,
            currency: "EUR",
        },
        quantity: qtBreakfast,
    };

    // Perform the PUT request
    const response = await axios.post(apiUrlFolioActions, chargeData, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

    return response.data;
};

const makeCharges = async (req, res) => {
    const roomNumber = req.query.roomNumber;
    const { qtBreakfast, amount } = req.body;

    if (!roomNumber || !qtBreakfast || !amount) {
        return res.status(400).json({ error: "Missing roomNumber, qtBreakfast, or amount" });
    }

    const apiUrlReservations = "https://api.apaleo.com/booking/v1/reservations";
    const apiUrlFolios = "https://api.apaleo.com/finance/v1/folios";

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    try {
        // Step 1: Get the access token
        const token = await getToken();

        // Step 2: Fetch reservations for the given room number
        const reservationResponse = await axios.get(apiUrlReservations, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            params: {
                status: "InHouse",
                textSearch: roomNumber,
                from: `${formattedDate}T00:00:00Z`,
                dateFilter: "Stay",
                propertyIds: "21201",
                pageSize: 50,
            },
        });

        const reservations = reservationResponse.data?.reservations || [];
        if (reservations.length === 0) {
            return res.status(404).json({ message: `No reservations found for room number ${roomNumber}` });
        }

        const reservation = reservations.find((r) => r.unit.name === roomNumber);
        if (!reservation) {
            return res.status(404).json({ message: `No reservation found for room number ${roomNumber}` });
        }

        // Step 3: Fetch folios for the reservation
        const folioResponse = await axios.get(apiUrlFolios, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            params: {
                propertyIds: "21201",
                reservationIds: reservation.id,
            },
        });

        const folios = folioResponse.data?.folios || [];
        if (folios.length === 0) {
            return res.status(404).json({ message: `No folios found for reservation ${reservation.id}` });
        }

        const folioId = folios[0].id; // Assuming the first folio is the one to use

        // Step 4: Post the breakfast charge to the folio
        await postChargeToFolio(folioId, token, qtBreakfast, amount);

        // Step 5: Return success response
        return res.status(200).json({
            message: "Breakfast charge successfully posted",
            reservationId: reservation.id,
            folioId: folioId,
            roomNumber: roomNumber,
            qtBreakfast: qtBreakfast,
            amount: amount,
        });
    } catch (error) {
        console.error("Error posting breakfast charge:", error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            error: error.response?.data || "Internal Server Error",
        });
    }
};



const getAllUsers = async (req, res) => {

    const apiUrl = "https://api.apaleo.com/booking/v1/reservations";
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(today.getDate()).padStart(2, '0');

    // Create the formatted string
    const formattedDate = `${year}-${month}-${day}T00:00:00Z`;

    try {

        const token = await getToken();

        // Define query parameters for the Apaleo API
        const params = {
            status: "InHouse", // Default to 'InHouse' if status is not provided
            from: formattedDate,
            dateFilter: "Stay",
            propertyIds: "21201",
            //   textSearch: roomNumber, // Use the roomNumber dynamically
            //   pageSize: 50,
            //   pageNumber: 1,
        };

        // Make GET request to the Apaleo API
        const response = await axios.get(apiUrl, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            params, // Attach query parameters
        });

        // Return processed data
        res.status(200).json({
            numberGuests: response.data.reservations.length
        });
    } catch (error) {
        console.error("Error fetching reservations:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send(error.response?.data || "Internal Server Error");
    }
}



const getService = async (req, res) => {    // Extract token and reservationId from query parameters
    const reservationId = req.query.reservationId;



    if (!reservationId) {
        return res.status(400).send({ error: "Reservation ID is missing" });
    }

    const apiUrl = `https://api.apaleo.com/booking/v1/reservations/${reservationId}/service-offers`;

    try {
        const token = await getToken();
        // Make GET request to the Apaleo API
        const response = await axios.get(apiUrl, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.data || !response.data.services || response.data.services.length === 0) {
            return res.status(404).json({ message: 'No services found for this reservation.' });
        }

        // Filter services with code BRK and BRKEXTRA
        const filteredServices = response.data.services.filter(
            (service) => service.service.code === "BRK" || service.service.code === "BRKEXTRA"
        );

        if (filteredServices.length === 0) {
            return res.status(404).json({ message: 'No breakfast-related services found.' });
        }

        // Return filtered services
        res.status(200).json(filteredServices);
    } catch (error) {
        console.error("Error fetching reservation services:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send(error.response?.data || "Internal Server Error");
    }
}


const getBfInfo = async (req, res) => {
    const roomNumber = req.query.roomNumber;

    if (!roomNumber) {
        return res.status(400).send({ error: "Room number is missing" });
    }

    try {
        const token = await getToken();

        const apiUrl = "https://api.apaleo.com/reports/v1/reports/ordered-services";
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Increment the date to get tomorrow's date

        const yearToday = today.getFullYear();
        const monthToday = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const dayToday = String(today.getDate()).padStart(2, '0');
        const formattedToday = `${yearToday}-${monthToday}-${dayToday}`;

        const yearTomorrow = tomorrow.getFullYear();
        const monthTomorrow = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dayTomorrow = String(tomorrow.getDate()).padStart(2, '0');
        const formattedTomorrow = `${yearTomorrow}-${monthTomorrow}-${dayTomorrow}`;

        // Define query parameters for the Apaleo API
        const params = {
            propertyId: "21201",
            serviceIds: "21201-BRK,21201-BRKEXTRA",
            from: formattedToday,
            to: formattedTomorrow,
        };
        // Make GET request to the Apaleo API
        const response = await axios.get(apiUrl, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            params,
        });

        if (!response.data || !response.data.orderedServices || response.data.orderedServices.length === 0) {
            return res.status(404).json({ message: 'No breakfast orders found' });
        }

        // Filter results to include only the specified roomNumber
        const filteredServices = response.data.orderedServices.filter(
            (service) => service.unit.name === roomNumber
        );

        if (filteredServices.length === 0) {
            return res.status(404).json({ message: `No breakfast orders found for room number ${roomNumber}` });
        }

        // Calculate total breakfast quantity and prepare customer data
        const totalBreakfastQuantity = filteredServices.reduce((total, item) => total + item.count, 0);
        const customerName = `${filteredServices[0].guest.firstName} ${filteredServices[0].guest.lastName}`;

        // Return processed data
        res.status(200).json({
            roomNumber: roomNumber,
            totalBreakfastQuantity: totalBreakfastQuantity,
            customerName: customerName,
            breakfastIncluded: true
        });
    } catch (error) {
        console.error("Error fetching breakfast information:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send(error.response?.data || "Internal Server Error");
    }
}


const getTotalBf = async (req, res) => {

    const startDate = req.query.startDate;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const formattedTomorrow = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    try {
        const token = await getToken();  // Make sure you define or import getToken() appropriately

        const apiUrl = "https://api.apaleo.com/reports/v1/reports/ordered-services";
        const params = {
            propertyId: "21201",
            serviceIds: "21201-BRK,21201-BRKEXTRA",  // Assuming '21201-BRK' is the service ID for breakfast
            from: formattedToday,
            to: formattedTomorrow,
        };

        const response = await axios.get(apiUrl, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            params,
        });

        if (!response.data || !response.data.orderedServices || response.data.orderedServices.length === 0) {
            return res.status(404).json({ message: 'No breakfast orders found for the selected date range.' });
        }

        // Calculate the total number of breakfasts
        const totalBreakfastQuantity = response.data.orderedServices.reduce((total, service) => total + service.count, 0);

        // Return the total count
        res.status(200).json({ totalBreakfastQuantity });
    } catch (error) {
        console.error("Error fetching breakfast information:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send({ message: error.response?.data || "Internal Server Error" });
    }
};



module.exports = {
   getUser, getService, getAllUsers, getIncluded, makeCharges, getBfInfo, getTotalBf
};

