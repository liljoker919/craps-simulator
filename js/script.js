(() => {
    // craps_simulator.js - Web-based Craps Simulator

    // Function to generate random dice roll (2d6)
    const rollDice = () => {
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        return die1 + die2; // Return the sum instead of individual dice
    };

    // Function to resolve bets based on roll results
    const resolveBets = (total, bets, bankroll, gameState) => {
        let payout = 0;

        // Ensure bankroll is a valid number
        bankroll = bankroll || 0;

        console.log(`Processing Roll: ${total}, Initial Bankroll: ${bankroll}`);

        if (!gameState.point) {
            // Come-out roll
            if (total === 7 || total === 11) {
                if (bets.passLine) payout += bets.passLine;
                console.log("Natural! Pass Line Wins.");
            } else if (total === 2 || total === 3 || total === 12) {
                if (bets.passLine) payout -= bets.passLine;
                console.log("Craps! Pass Line Loses.");
            } else {
                gameState.point = total;
                console.log(`Point established: ${gameState.point}`);
            }
        } else {
            // Point is established, continue rolling
            if (total === gameState.point) {
                if (bets.passLine) payout += bets.passLine;
                console.log(`Point ${gameState.point} hit! Pass Line Wins.`);
                gameState.point = null;
                gameState.pointHits += 1;
            } else if (total === 7) {
                console.log("Seven Out! All active bets cleared.");
                bets.passLine = 0; // Clear pass line bet
                gameState.point = null;
                // Clear Place bets
                bets.place = { 4: 0, 5: 0, 6: 0, 8: 0, 9: 0, 10: 0 };
            }
        }

        // Field Bet
        if (bets.field && [2, 3, 4, 9, 10, 11, 12].includes(total)) {
            const multiplier = (total === 2) ? 2 : (total === 12) ? 3 : 1;
            payout += bets.field * (multiplier);
        }

        // Hardways Bet
        if (bets.hardways && bets.hardways[total] && total % 2 === 0) {
            payout += bets.hardways[total] * 7;
        }

        // Place Bets
        if (gameState.point && bets.place) {
            const placePayouts = { 4: 2, 5: 1.5, 6: 1.1667, 8: 1.1667, 9: 1.5, 10: 2 };
            if (bets.place[total]) {
                payout += bets.place[total] * placePayouts[total];
                console.log(`Place bet on ${total} wins!`);
            }
        }

        // Deduct total bet amount (Ensure every value is valid)
        const totalBet = (bets.passLine || 0) + (bets.field || 0) +
            (bets.hardways[4] || 0) + (bets.hardways[6] || 0) +
            (bets.hardways[8] || 0) + (bets.hardways[10] || 0) +
            (bets.place[4] || 0) + (bets.place[5] || 0) +
            (bets.place[6] || 0) + (bets.place[8] || 0) +
            (bets.place[9] || 0) + (bets.place[10] || 0);

        console.log(`Total Bet: ${totalBet}, Payout: ${payout}`);

        // Ensure we are not subtracting undefined values
        bankroll = bankroll + payout - totalBet;

        console.log(`Updated Bankroll: ${bankroll}`);

        return bankroll;
    };

    // Function to run a simulation session
    const runSimulation = (bankroll, targetWin, bets, numSimulations) => {
        const results = [];
        const startingBankroll = bankroll;
        const gameState = { point: null, pointHits: 0 };

        console.log("Starting Simulation");
        console.log(`Initial Bankroll: ${bankroll}, Target Win: ${targetWin}`);

        for (let i = 0; i < numSimulations; i++) {
            if (bankroll <= 0) {
                console.log("Simulation Ended: Bankroll Depleted");
                break;
            }

            const total = rollDice();
            bankroll = resolveBets(total, bets, bankroll, gameState);

            if (isNaN(bankroll)) {
                console.error(`ERROR: Bankroll became NaN at roll ${i + 1}`);
                break;
            }

            console.log(`Roll ${i + 1}: ${total}, New Bankroll: ${bankroll}`);

            results.push({ roll: total, bankroll, point: gameState.point, pointHits: gameState.pointHits });

            if (bankroll >= startingBankroll + targetWin) {
                console.log("Simulation Ended: Win Condition Reached");
                break;
            }
        }
        return results;
    };

    // Function to export results to CSV
    const exportToCSV = (data) => {
        const csvContent = "Roll, Bankroll, Point, Point Hits\n" +
            data.map(row => `${row.roll}, ${row.bankroll}, ${row.point || 'None'}, ${row.pointHits}`).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "craps_simulation_results.csv";
        a.click();
    };

    // Event listener for running the simulation
    document.getElementById("runSimulation").addEventListener("click", () => {
        const bankroll = parseFloat(document.getElementById("bankroll").value) || 0;
        const tableMin = parseFloat(document.getElementById("tableMin").value) || 0;
        const targetWin = parseFloat(document.getElementById("targetWin").value) || 0;
        const numSimulations = parseInt(document.getElementById("numSimulations").value) || 0;

        const bets = {
            passLine: parseFloat(document.getElementById("passLine").value) || 0,
            field: parseFloat(document.getElementById("field").value) || 0,
            hardways: {
                4: parseFloat(document.getElementById("hard4").value) || 0,
                6: parseFloat(document.getElementById("hard6").value) || 0,
                8: parseFloat(document.getElementById("hard8").value) || 0,
                10: parseFloat(document.getElementById("hard10").value) || 0,
            },
            place: {
                4: parseFloat(document.getElementById("place4").value) || 0,
                5: parseFloat(document.getElementById("place5").value) || 0,
                6: parseFloat(document.getElementById("place6").value) || 0,
                8: parseFloat(document.getElementById("place8").value) || 0,
                9: parseFloat(document.getElementById("place9").value) || 0,
                10: parseFloat(document.getElementById("place10").value) || 0,
            },
        };

        console.log("Bankroll:", bankroll);
        console.log("Table Minimum:", tableMin);
        console.log("Target Win:", targetWin);
        console.log("Num Simulations:", numSimulations);
        console.log("Bets:", bets);

        const results = runSimulation(bankroll, targetWin, bets, numSimulations);
        console.table(results);
        exportToCSV(results);
    });
})();