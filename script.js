const Emissions = {
  // Vehicle (Hauler) Running Emissions
  RunningNOX: 5.815261805,
  RunningN20: 0.003793665091,
  RunningPM25: 0.1758670473,
  RunningPM10: 0.1911604372,
  RunningSO2: 0.005905093448,
  RunningCH4: 0.03192717203,
  RunningCO: 2.502266751,
  RunningVOC: 0.3611081042,
  RunningCO2: 1743.222553,
  RunningCO2EQ: 1745.107042,

  // Vehicle (Hauler) Idle Emissions
  IdleNOX: 50.16044454,
  IdleN20: 0.08277499601,
  IdlePM25: 1.77749758,
  IdlePM10: 1.932066948,
  IdleSO2: 0.02560554259,
  IdleCH4: 0.3635740162,
  IdleCO: 18.62982519,
  IdleVOC: 3.809808368,
  IdleCO2: 7558.133922,
  IdleCO2EQ: 7591.358337,

  // Smash SmashEmissions
  SmashNOX: 42.56005757,
  SmashN20: 0.1034848964,
  SmashPM25: 0.0259291684,
  SmashPM10: 0.02818391236,
  SmashSO2: 0.03034194794,
  SmashCH4: 0.3453954844,
  SmashCO: 16.98806791,
  SmashVOC: 0.7483118462,
  SmashCO2: 9098.481403,
  SmashCO2EQ: 9137.863419,

  // Smash Running Emissions
  SmashRunNOX: 2.441878983,
  SmashRunN20: 0.00379520135,
  SmashRunPM25: 0.004990633014,
  SmashRunPM10: 0.005424617031,
  SmashRunSO2: 0.005716274046,
  SmashRunCH4: 0.02148934923,
  SmashRunCO: 1.693224025,
  SmashRunVOC: 0.09491856905,
  SmashRunCO2: 1714.101577,
  SmashRunCO2EQ: 1715.763589,

  // Smash Idle Emissions
  SmashIdleNOX: 34.04804606,
  SmashIdleN20: 0.08278773965,
  SmashIdlePM25: 0.0207433472,
  SmashIdlePM10: 0.02254712989,
  SmashIdleSO2: 0.02427355835,
  SmashidleCH4: 0.2763163875,
  SmashIdleCO: 13.59045433,
  SmashIdleVOC: 0.598649477,
  SmashIdleCO2: 7278.785122,
  SmashIdleCO2EQ: 7310.290735,
};

const conversionFactor = 0.002204622622;
const vit = 0.3;

let yearlyHauls = haulsPerWeek * 52;
let landfillDist = landfillDistance;
let haulerDist = haulerDistance;
let transferStationDist = transferStationDistance;
let haulingCost = haulCost;

// Function to calculate running emissions
function calculateRunningEmissions(haulsPerWeek, distance, emissionFactor) {
  return haulsPerWeek * distance * emissionFactor * conversionFactor;
}

// Function to calculate idling emissions
function calculateIdlingEmissions(haulsPerWeek, vit, emissionFactor) {
  return haulsPerWeek * vit * emissionFactor * conversionFactor;
}

// Calculate weekly running emissions
function calculateWeeklyRunningEmissions(
  haulsPerWeek,
  landfillDist,
  haulerDist
) {
  let vmt = landfillDist * 2 + haulerDist;
  let emissionFactor = Emissions.RunningCO2;
  let weeklyRunningEmissions =
    haulsPerWeek * vmt * emissionFactor * conversionFactor;
  return weeklyRunningEmissions;
}

// Calculate weekly idling emissions
function calculateWeeklyIdlingEmissions(haulsPerWeek, vit) {
  let emissionFactor = Emissions.IdleCO2;
  let weeklyIdlingEmissions =
    haulsPerWeek * vit * emissionFactor * conversionFactor;
  return weeklyIdlingEmissions;
}

// Calculate emissions for each path
function calculatePathEmissions(distance, emissionFactor, isIdle) {
    if (isIdle) {
      return vit * emissionFactor * conversionFactor;
    } else {
      return distance * emissionFactor * conversionFactor;
    }
}
  

// Usage example for weekly emissions
let weeklyRunningEmissions = calculateWeeklyRunningEmissions(
  haulsPerWeek,
  landfillDist,
  haulerDist
);
let weeklyIdlingEmissions = calculateWeeklyIdlingEmissions(haulsPerWeek, vit);

// Usage example for path emissions
let haulerToCustomerEmissions = calculatePathEmissions(
  haulerDist,
  Emissions.RunningCO2,
  false
);
let customerToLandfillEmissions = calculatePathEmissions(
  landfillDist * 2,
  Emissions.RunningCO2,
  false
);
let customerToTransferStationEmissions = calculatePathEmissions(
  transferStationDist,
  Emissions.RunningCO2,
  false
);


// JavaScript function to animate the hauler
function animateHauler() {
  const hauler = document.getElementById("hauler-location");
  let position = 0;
  const endPosition = 80; // Assume 80% is the end position

  function frame() {
    if (position < endPosition) {
      position++; // update position
      hauler.setAttribute("cx", position + "%"); // move the hauler
      updateEmissions(position); // update emissions based on new position
      requestAnimationFrame(frame); // call frame again
    }
  }

  requestAnimationFrame(frame); // start the animation
}


document.addEventListener("DOMContentLoaded", function () {
  document.getElementById('transferStation').addEventListener('change', function() {
    var transferStationChecked = this.checked;
    var transferStationDistanceContainer = document.getElementById('transferStationDistanceContainer');
    var landfillDistanceField = document.getElementById('landfillDistance'); // Ensure this is the correct ID for your landfill distance input
    var landfillDistanceLabel = document.querySelector('label[for="landfillDistance"]'); // Adjust if needed to select the correct label
  
    transferStationDistanceContainer.style.display = transferStationChecked ? 'block' : 'none';
    landfillDistanceField.style.display = landfillDistanceLabel.style.display = transferStationChecked ? 'none' : 'block';
  });
  

  document
    .getElementById("haulingCostForm")
    .addEventListener("submit", function (event) {
      var transferStationDistance = document.getElementById(
        "transferStationDistance"
      ).value;
      console.log("Transfer Station Distance:", transferStationDistance);
      event.preventDefault();

      // Extracting values from the form
      var haulsPerWeek = parseFloat(
        document.getElementById("haulsPerWeek").value
      );
      var transferStation = document.getElementById("transferStation").checked;
      var compactibility = document.getElementById("compactibility").value;
      var landfillDistance = parseFloat(
        document.getElementById("landfillDistance").value
      );
      var haulerDistance = parseFloat(
        document.getElementById("haulerDistance").value || 10
      );
      const vit = 0.3; // Vehicle idling time per haul in hours from the whitepaper

      // Perform the emissions calculations
      const weeklyRunningEmissions = calculateWeeklyRunningEmissions(
        haulsPerWeek,
        landfillDistance,
        haulerDistance
      );
      const weeklyIdlingEmissions = calculateWeeklyIdlingEmissions(
        haulsPerWeek,
        vit
      );

      // Display the calculated emissions in the 'Estimated Emissions Without SMT' box
      document.getElementById("emissionsValueWithoutSmt").textContent = `${(
        weeklyRunningEmissions + weeklyIdlingEmissions
      ).toFixed(2)} lbs/week CO2`;

      // Add your further processing here
    });

  document
    .getElementById("submitButton")
    .addEventListener("click", function (event) {
      event.preventDefault();

      let emissionsElement = document.getElementById("emissionsValueWithoutSmt");
      emissionsElement.textContent = "0 lbs/week CO2";
      let haulingCostElement = document.getElementById('haulingCostValue');
      haulingCostElement.textContent = "$0.00";

      // Get form values
      let haulsPerWeek =
        parseFloat(document.getElementById("haulsPerWeek").value) || 0;
      let landfillDistance =
        parseFloat(document.getElementById("landfillDistance").value) || 0;
      let haulerDistance = parseFloat(
        document.getElementById("haulerDistance").value) || 0;

      let haulCost = parseFloat(document.getElementById('haulCost').value) || 0; // Replace 'haulCostInputId' with the correct ID of your input field

      let transferStationChecked = document.getElementById('transferStation').checked;
      let transferStationDistance = parseFloat(document.getElementById('transferStationDistance').value || 0);


      for (let i = 0; i < haulsPerWeek; i++) {
        let delay = i * (2000 + 500);

      // Hauler to Customer Path
      setTimeout(() => {
        animatePath(40, 100, 200, 330, 'red', 2000, 'haulerToCustomer', function() {
          let pathEmissions = calculatePathEmissions(haulerDistance, Emissions.RunningCO2, false);
          incrementEmissionsForPath(pathEmissions);
        });
      }, delay);

      // Choose between Customer to Landfill or Customer to Transfer Station
      if (transferStationChecked) {
        setTimeout(() => {
          animatePath(200, 330, 410, 200, 'orange', 2000, 'customerToTransferStation', function() {
            let pathEmissions = calculatePathEmissions(transferStationDistance, Emissions.RunningCO2, false);
            incrementEmissionsForPath(pathEmissions);
            updateHaulingCost(haulCost);

            animatePath(410, 200, 200, 330, 'orange', 2000, 'transferStationToCustomer', function() {
              let returnPathEmissions = calculatePathEmissions(transferStationDistance, Emissions.RunningCO2, false);
              incrementEmissionsForPath(returnPathEmissions);
            });
          });
        }, delay + 2000);
      } else {
        setTimeout(() => {
          animatePath(200, 330, 305, 60, 'blue', 2000, 'customerToLandfill', function() {
            let pathEmissions = calculatePathEmissions(landfillDistance, Emissions.RunningCO2, false);
            incrementEmissionsForPath(pathEmissions);
            // Update the hauling cost
            updateHaulingCost(haulCost);
        
            animatePath(305, 60, 200, 330, 'blue', 2000, 'landfillToCustomer', function() {
              let returnPathEmissions = calculatePathEmissions(landfillDistance, Emissions.RunningCO2, false);
              incrementEmissionsForPath(returnPathEmissions);
            });
          });
        }, delay + 2000);
      }
    }
  });

  // Function to animate paths
  function animatePath(startX, startY, endX, endY, color, duration, pathType, onComplete) {
  let dot = createDot(startX, startY, color);
  let startTime = null;
  
  function animate(time) {
    if (!startTime) startTime = time;
    let timeElapsed = time - startTime;
    let progress = Math.min(timeElapsed / duration, 1);
    
    let currentX = startX + (endX - startX) * progress;
    let currentY = startY + (endY - startY) * progress;
    dot.setAttribute('cx', currentX);
    dot.setAttribute('cy', currentY);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      dot.remove();
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  }
  
  requestAnimationFrame(animate);
}

  // Define incrementEmissionsForPath in the global scope
  function incrementEmissionsForPath(pathEmissions) {
    let currentEmissions = parseFloat(document.getElementById('emissionsValueWithoutSmt').textContent) || 0;
    let newEmissions = currentEmissions + pathEmissions;
    document.getElementById('emissionsValueWithoutSmt').textContent = newEmissions.toFixed(2) + ' lbs/week CO2';
  }

  function updateHaulingCost(haulCost) {
    let currentHaulingCost = parseFloat(document.getElementById('haulingCostValue').textContent.replace('$', '')) || 0;
    let newHaulingCost = currentHaulingCost + haulCost;
    document.getElementById('haulingCostValue').textContent = `$${newHaulingCost.toFixed(2)}`;
  }
  
  // Function to create an SVG dot
  function createDot(x, y, color) {
    let dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", x);
    dot.setAttribute("cy", y);
    dot.setAttribute("r", 5);
    dot.setAttribute("fill", color);
    document.getElementById("visualization-map").appendChild(dot);
    return dot;
  }

  // Function to update emissions
  function updateEmissions(pathName) {
    // Logic to calculate emissions based on pathName
    let emissions = 0; // Replace with actual calculation
    let emissionsElement = document.getElementById("emissionsValueWithoutSmt");
    let currentEmissions = parseFloat(emissionsElement.textContent) || 0;
    emissionsElement.textContent =
      (currentEmissions + emissions).toFixed(2) + " lbs/week CO2";
  }

  updateEmissions("haulerToCustomer", haulerToCustomerEmissions);

  document
    .getElementById("animateButton")
    .addEventListener("click", function () {
      animatePath(40, 100, 200, 330, "red", 2000, true); // Hauler to Customer, red ball
      animatePath(200, 330, 305, 60, "blue", 2000, true); // Customer to Landfill, blue ball
      animatePath(200, 330, 410, 200, "orange", 2000, true); // Customer to Transfer Station, orange ball
      animatePath(-10, 245, 200, 335, "purple", 2000, true); // SMT to Customer, purple ball
    });
});
