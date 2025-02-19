// craps_simulator.js - Web-based Craps Simulator

// Function to generate random dice roll (2d6)
function rollDice() {
    return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
}

// Function to resolve bets based on roll results
function resolveBets(roll, bets, bankroll) {
    const total = roll[0] + roll[1];
    let payout = 0;

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

    // Hardways
    if (bets.hardways[total] && roll[0] === roll[1]) {
        payout += bets.hardways[total] * 7; // Standard hardway payout
    }

    // Update bankroll
    bankroll += payout - Object.values(bets).reduce((sum, bet) => sum + (bet || 0), 0);
    return bankroll;
}

// Function to run a simulation session
function runSimulation(bankroll, targetWin, targetLoss, bets, numSimulations) {
    let results = [];
    let startingBankroll = bankroll;

    for (let i = 0; i < numSimulations; i++) {
        const roll = rollDice();
        bankroll = resolveBets(roll, bets, bankroll);
        console.log(`Roll: ${roll.join("-")}, Bankroll: ${bankroll}`); // Debugging output
        results.push({ roll: roll.join("-"), bankroll });

        if (bankroll >= startingBankroll + targetWin || bankroll <= targetLoss) {
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
