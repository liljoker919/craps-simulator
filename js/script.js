// craps_simulator.js - Web-based Craps Simulator

// Function to generate random dice roll (2d6)
function rollDice() {
    return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
}

// Function to resolve bets based on roll results
function resolveBets(roll, bets, bankroll) {
    const total = roll[0] + roll[1];
    let payout = 0;

    // Ensure bankroll is a valid number
    bankroll = bankroll || 0;

    console.log(`Processing Roll: ${roll.join("-")}, Initial Bankroll: ${bankroll}`);

    // Pass Line Bet
    if (bets.passLine && (total === 7 || total === 11)) {
        payout += bets.passLine * 2;
    } else if (bets.passLine && (total === 2 || total === 3 || total === 12)) {
        payout -= bets.passLine;
    }

    // Field Bet
    if (bets.field && [2, 3, 4, 9, 10, 11, 12].includes(total)) {
        let multiplier = (total === 2) ? 2 : (total === 12) ? 3 : 1;
        payout += bets.field * (1 + multiplier);
    }

    // Hardways Bet
    if (bets.hardways && bets.hardways[total] && roll[0] === roll[1]) {
        payout += bets.hardways[total] * 7;
    }

    // Deduct total bet amount (Ensure every value is valid)
    let totalBet = (bets.passLine || 0) + (bets.field || 0) +
        (bets.hardways[4] || 0) + (bets.hardways[6] || 0) +
        (bets.hardways[8] || 0) + (bets.hardways[10] || 0);

    console.log(`Total Bet: ${totalBet}, Payout: ${payout}`);

    // Ensure we are not subtracting undefined values
    bankroll = bankroll + payout - totalBet;

    console.log(`Updated Bankroll: ${bankroll}`);

    return bankroll;
}

// Function to run a simulation session
function runSimulation(bankroll, targetWin, targetLoss, bets, numSimulations) {
    let results = [];
    let startingBankroll = bankroll;

    console.log("Starting Simulation");
    console.log(`Initial Bankroll: ${bankroll}, Target Win: ${targetWin}, Target Loss: ${targetLoss}`);

    for (let i = 0; i < numSimulations; i++) {
        const roll = rollDice();
        bankroll = resolveBets(roll, bets, bankroll);

        if (isNaN(bankroll)) {
            console.error(`ERROR: Bankroll became NaN at roll ${i + 1}`);
            break;
        }

        console.log(`Roll ${i + 1}: ${roll.join("-")}, New Bankroll: ${bankroll}`);

        results.push({ roll: roll.join("-"), bankroll });

        if (bankroll >= startingBankroll + targetWin || bankroll <= targetLoss) {
            console.log("Simulation Ended: Win/Loss Condition Reached");
            break;
        }
    }
    return results;
}

// Function to export results to CSV
function exportToCSV(data) {
    let csvContent = "Roll, Bankroll\n" + data.map(row => `${row.roll}, ${row.bankroll}`).join("\n");
    let blob = new Blob([csvContent], { type: "text/csv" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "craps_simulation_results.csv";
    a.click();
}

// Event listener for running the simulation
document.getElementById("runSimulation").addEventListener("click", function () {
    let bankroll = parseFloat(document.getElementById("bankroll").value) || 0;
    let tableMin = parseFloat(document.getElementById("tableMin").value) || 0;
    let targetWin = parseFloat(document.getElementById("targetWin").value) || 0;
    let numSimulations = parseInt(document.getElementById("numSimulations").value) || 0;

    let bets = {
        passLine: parseFloat(document.getElementById("passLine").value) || 0,
        field: parseFloat(document.getElementById("field").value) || 0,
        hardways: {
            4: parseFloat(document.getElementById("hard4").value) || 0,
            6: parseFloat(document.getElementById("hard6").value) || 0,
            8: parseFloat(document.getElementById("hard8").value) || 0,
            10: parseFloat(document.getElementById("hard10").value) || 0,
        },
    };

    console.log("Bankroll:", bankroll);
    console.log("Table Minimum:", tableMin);
    console.log("Target Win:", targetWin);
    console.log("Num Simulations:", numSimulations);
    console.log("Bets:", bets);

    let results = runSimulation(bankroll, targetWin, targetWin * -1, bets, numSimulations);
    console.table(results);
    exportToCSV(results);
});
