import axios from 'axios';

// --- CONFIGURATION ---
const API_URL = 'http://localhost:3000';

// A remplacer par l'ID d'un trajet (avec des places dispo)
const TARGET_RIDE_ID = "066efa68-6f47-4e54-9894-774d93a952e3";

// IA remplacer par un token valide (généré via ton endpoint de login)
const VALID_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYmFmYTc3ZC1kNWJkLTQ4MjMtYjkyMC1hNjlkNDM3NjFiY2MiLCJlbWFpbCI6InBhc3NlbmdlcjlAdGVzdC5jb20iLCJyb2xlIjoiUEFTU0VOR0VSIiwiaWF0IjoxNzc0MjA1NTAzLCJleHAiOjE3NzQyMDY0MDN9.x88_cDHJ0khsaEM-OVDCfE1pQi7iyqAgrj75B6S2zgo";

async function simulateStress() {
    const requests: any[] = [];
    console.log("Staring stress test : 100 concurrent bookings...");

    for (let i = 0; i < 100; i++) {
        // On simule 100 appels API en parallèle
        requests.push(
            axios.post(`${API_URL}/bookings`, { rideId: TARGET_RIDE_ID },
            { headers: { 'Authorization': `Bearer ${VALID_TOKEN}`} })
            .then(res => res.status)
            .catch(err => err.response?.status) // On capture les erreurs (409 Conflict)
        );
    }

    // On attend que les 100 requêtes frappent le serveur en même temps
    const results = await Promise.all(requests);

    // Comptage des résultats
    const success = results.filter(res => res?.data || res === 201).length;
    const conflict = results.filter(res => res === 409).length;
    const forbidden = results.filter(s => s === 403).length;
    const unauthorized = results.filter(s => s === 401).length;

    console.log(`\n--- STRESS TEST RESULT ---`);

    if (unauthorized === 100) {
        console.log(`ERROR : The token is invalid or expired (401 Unauthorized).`);
        return;
    }

    if (forbidden === 100) {
        console.log(`ERROR : The user is not allowed to access the ressource.`);
        return;
    }
    
    console.log(`Successfull Bookings : ${success}`);
    console.log(`Blocked Bookings : ${conflict}`);
    console.log(`\nif [Success] = [Ride's availableSeats], the test is successfull.`);
}

simulateStress();