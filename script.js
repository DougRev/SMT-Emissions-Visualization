const Emissions = {
  // Vehicle (Hauler) Running Emissions
  RunningCO2: 1743.222553,
  RunningCO2EQ: 1745.107042,

  // Vehicle (Hauler) Idle Emissions
  IdleCO2: 7558.133922,
  IdleCO2EQ: 7591.358337,

  // Smash SmashEmissions
  SmashCO2: 9098.481403,
  SmashCO2EQ: 9137.863419,

  // Smash Running Emissions
  SmashRunCO2: 1714.101577,
  SmashRunCO2EQ: 1715.763589,

  // Smash Idle Emissions
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

// Define incrementEmissionsForPath in the global scope
function incrementEmissionsForPath(pathId, pathRunningEmissions, pathIdlingEmissions) {

  let currentEmissions = parseFloat(document.getElementById('emissionsValueWithoutSmt').textContent) || 0;
  console.log(pathRunningEmissions, pathIdlingEmissions);
  // Convert the path emissions and idling emissions to pounds
  let totalPathEmissions = pathRunningEmissions + pathIdlingEmissions;
  let newEmissions = currentEmissions + totalPathEmissions;
  
  // Retrieve the end icon ID from the path element's custom attribute
  var pathElement = d3.select('#' + pathId).node();
  var endIconId = pathElement.getAttribute('endIcon'); // Assuming you've set this attribute when creating the path
  var endIconElement = document.getElementById(endIconId);

  if (endIconElement) {
    animateEmissionChange(totalPathEmissions, endIconElement);
  } else {
    console.error('End icon element not found for path: ' + pathId);
  }

  document.getElementById('emissionsValueWithoutSmt').textContent = newEmissions.toFixed(2) + ' lbs/week CO2';
}

function incrementEmissionsForPathWithSMT(pathId, pathRunningEmissions, pathIdlingEmissions) {

  let currentEmissions = parseFloat(document.getElementById('emissionsValueWithSmt').textContent) || 0;
  console.log(pathRunningEmissions, pathIdlingEmissions);
  // Convert the path emissions and idling emissions to pounds
  let totalPathEmissions = pathRunningEmissions + pathIdlingEmissions;
  let newEmissions = currentEmissions + totalPathEmissions;
  
  // Retrieve the end icon ID from the path element's custom attribute
  var pathElement = d3.select('#' + pathId).node();
  var endIconId = pathElement.getAttribute('endIcon'); // Assuming you've set this attribute when creating the path
  var endIconElement = document.getElementById(endIconId);

  if (endIconElement) {
    animateEmissionChange(totalPathEmissions, endIconElement);
  } else {
    console.error('End icon element not found for path: ' + pathId);
  }

  document.getElementById('emissionsValueWithSmt').textContent = newEmissions.toFixed(2) + ' lbs/week CO2';
}

function animateEmissionChange(emissionAmount, iconElement) {
  const rect = iconElement.getBoundingClientRect();
  const bubble = document.createElement('div');
  bubble.classList.add('emission-bubble');
  bubble.textContent = `+${emissionAmount.toFixed(2)} CO2`;

  // Position the bubble over the icon
  bubble.style.left = `${rect.left + rect.width / 2}px`;
  bubble.style.top = `${rect.top - 10}px`; // Adjust as needed

  document.body.appendChild(bubble);

  // Remove the bubble after animation
  bubble.addEventListener('animationend', function() {
    bubble.remove();
  });
}


// Function to calculate running emissions
function calculateRunningEmissions(haulsPerWeek, distance, emissionFactor) {
  return haulsPerWeek * distance * emissionFactor * conversionFactor;
}

// Function to calculate idling emissions
function calculateWeeklyIdlingEmissions(haulsPerWeek, vit, emissionFactor) {
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
function calculateIdlingEmissions(haulsPerWeek, vit) {
  let emissionFactor = Emissions.IdleCO2;
  let idlingEmissions =
    haulsPerWeek * vit * emissionFactor * conversionFactor;
  return idlingEmissions;
}

// Calculate emissions for each path
function calculatePathEmissions(distance, emissionFactor, isIdle) {
  if (isIdle) {
    return vit * emissionFactor * conversionFactor;
  } else {
    return distance * emissionFactor * conversionFactor;
  }
}

function animateDotAlongPath(pathId, duration, onComplete, reverse = false, batchCount) {
  var path = d3.select('#' + pathId);
  var pathNode = path.node();
  console.log('Batch Count in Animate Function:', batchCount);
  if (!pathNode) {
    console.error('Path element not found:', pathId);
    return;
  }

  var totalLength = pathNode.getTotalLength();

  // Create a group to hold both the dot and the text
  var dotGroup = d3.select('#visualization-map').append('g');

  var dot = dotGroup.append('circle')
    .attr('r', 8) // Increased radius for visibility of the text
    .attr('fill', 'blue');

  // Add text to the group, adjusting size for visibility
  var text = dotGroup.append('text')
    .attr('text-anchor', 'middle') // Center the text horizontally
    .attr('dy', '.3em') // Adjust the vertical alignment to be in the middle
    .style('fill', 'white') // Text color
    .style('font-size', '10px') // Specify font size for clarity
    .text(batchCount); // Set the batch count as the text

  dotGroup.transition()
    .duration(duration)
    .attrTween('transform', function() {
      return function(t) {
        var point = reverse ? pathNode.getPointAtLength((1 - t) * totalLength) : pathNode.getPointAtLength(t * totalLength);
        return 'translate(' + point.x + ',' + point.y + ')';
      };
    })
    .on('end', function() {
      dotGroup.remove(); // Remove the entire group, including the dot and text
      onComplete();
    });
}


function updateHaulingCost(haulCost) {
  let currentHaulingCost = parseFloat(document.getElementById('haulingCostValue').textContent.replace(/[^0-9.-]+/g,"")) || 0;
  let newHaulingCost = currentHaulingCost + haulCost;
  const formattedHaulingCost = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
  }).format(newHaulingCost);
  document.getElementById('haulingCostValue').textContent = formattedHaulingCost;
}

function updateHaulingCostWithSMT(haulCost) {
  let currentHaulingCost = parseFloat(document.getElementById('newHaulingCostValue').textContent.replace(/[^0-9.-]+/g,"")) || 0;
  let newHaulingCost = currentHaulingCost + haulCost;
  const formattedHaulingCostWithSMT = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
  }).format(newHaulingCost);
  document.getElementById('newHaulingCostValue').textContent = formattedHaulingCostWithSMT;
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
let haulerIdlingEmissions = calculateIdlingEmissions(1, vit)

// Function to run the haul sequence for the given number of hauls
function runHaulSequence(hauls, duration, onComplete) {
  let currentHaul = 0;
  const batchSize = (hauls >= 6 && hauls <= 9) ? 5 : hauls > 20 ? 10 : (hauls >= 10 && hauls <= 20) ? 5 : hauls;

  function processBatch() {
    let batchEnd = Math.min(currentHaul + batchSize, hauls);
    if (currentHaul < hauls) {
      let transferStationChecked = document.getElementById('transferStation').checked;
      let haulerDistance = parseFloat(document.getElementById("haulerDistance").value || 0);
      let landfillDistance = parseFloat(document.getElementById("landfillDistance").value || 0);
      let transferStationDistance = parseFloat(document.getElementById("transferStationDistance").value || 0);
      let haulCost = parseFloat(document.getElementById('haulCost').value || 0);

      // Calculate the number of hauls in the current batch
      let haulsInCurrentBatch = batchEnd - currentHaul;

      // Hauler to Customer (Simulate once for the batch)
      animateDotAlongPath('haulerToCustomer', duration, () => {
        let batchRunningEmissions = haulsInCurrentBatch * haulerDistance * (Emissions.RunningCO2 * conversionFactor);
        let batchIdlingEmissions = haulsInCurrentBatch * vit * (Emissions.IdleCO2 * conversionFactor);
        incrementEmissionsForPath('haulerToCustomer', batchRunningEmissions, (batchIdlingEmissions / 3));

        // Determine the next destination based on transfer station usage
        let destinationPathId = transferStationChecked ? 'customerToTransfer' : 'customerToLandfill';
        let destinationDistance = transferStationChecked ? transferStationDistance : landfillDistance;
        let destinationRunningEmissions = haulsInCurrentBatch * destinationDistance * (Emissions.RunningCO2 * conversionFactor);
        updateHaulingCost(haulCost * haulsInCurrentBatch);

        // Customer to Next Destination (Transfer Station or Landfill) - Simulate once for the batch
        animateDotAlongPath(destinationPathId, duration, () => {
          incrementEmissionsForPath(destinationPathId, destinationRunningEmissions, (batchIdlingEmissions / 3));
          
          // Reverse the animation for the return path - Simulate once for the batch
          animateDotAlongPath(destinationPathId, duration, () => {
            incrementEmissionsForPath('haulerToCustomer', destinationRunningEmissions, (batchIdlingEmissions / 3));
            currentHaul += batchSize;
            if (currentHaul < hauls) {
                setTimeout(processBatch, duration);
            } else {
                if (typeof onComplete === 'function') {
                    onComplete(); // Callback when the entire sequence is complete
                }
            }
        }, true, haulsInCurrentBatch); // Indicates return path
        }, false, haulsInCurrentBatch); // Ensure haulsInCurrentBatch is passed here
      }, false, haulsInCurrentBatch); // Pass the batch count as an argument
    }
  }

  processBatch(); // Start processing the hauls in batches
}

// Function to run the SMT service sequence
function runSMTSequence(compactibility, hauls, duration) {

  let adjustedHauls = calculateSmashes(hauls, compactibility);
  console.log('Adjusted Hauls with SMT:', adjustedHauls); 
  let timesSmashed = getSMTSmashes(compactibility);
  console.log('Times Smashed:', timesSmashed);


  function animateSMTPath(currentHaul = 0) {
    console.log('Animate Path Current Haul:', currentHaul);
    if (currentHaul < adjustedHauls) {

      let transferStationChecked = document.getElementById('transferStation').checked;
      let haulerDistance = parseFloat(document.getElementById("haulerDistance").value || 0);
      let landfillDistance = parseFloat(document.getElementById("landfillDistance").value || 0);
      let transferStationDistance = parseFloat(document.getElementById("transferStationDistance").value || 0);
      let haulCost = parseFloat(document.getElementById('haulCost').value || 0);
      
      let haulsWithSMT = calculateSmashes(hauls, compactibility);
      console.log('Adjusted Hauls with SMT:', haulsWithSMT); 
      
      let defaultSMTDistance = 2;
      let smtEmissions = calculateSMTPathEmissions(1, defaultSMTDistance); // Assuming calculateSMTPathEmissions & defaultSMTDistance are defined
      let batchSMTEmissions = smtEmissions * timesSmashed;
      // Run animation and update emissions for each SMT-optimized haul
      animateDotAlongPath('smtToCustomer', duration, () => {
        incrementEmissionsForPathWithSMT('smtToCustomer', batchSMTEmissions, 0);

        // Proceed with the hauler path simulation
        animateHaulerPath(currentHaul);
      }, false, timesSmashed > 1 ? timesSmashed : undefined); 
    }
  }

  function animateHaulerPath(currentHaul) {
    let haulerDistance = parseFloat(document.getElementById("haulerDistance").value || 0);
    let landfillDistance = parseFloat(document.getElementById("landfillDistance").value || 0);
    let transferStationDistance = parseFloat(document.getElementById("transferStationDistance").value || 0);
    let transferStationChecked = document.getElementById('transferStation').checked;
    let haulCost = parseFloat(document.getElementById('haulCost').value || 0);
    let haulerIdlingEmissions = vit * (Emissions.IdleCO2 * conversionFactor); // Assuming 'vit' and 'CF' are correctly defined and applied
    
    // Hauler to Customer animation with batch information
    animateDotAlongPath('haulerToCustomer', duration, () => {
      let haulerRunningEmissions = haulerDistance * (Emissions.RunningCO2 * conversionFactor); // Ensure conversionFactor is applied if needed
      incrementEmissionsForPathWithSMT('haulerToCustomer', haulerRunningEmissions, (haulerIdlingEmissions / 3));
  
      // Determine the next destination based on transfer station usage
      let destinationPathId = transferStationChecked ? 'customerToTransfer' : 'customerToLandfill';
      let destinationDistance = transferStationChecked ? transferStationDistance : landfillDistance;
      let destinationRunningEmissions = destinationDistance * (Emissions.RunningCO2 * conversionFactor);
      updateHaulingCostWithSMT(haulCost);
  
      // Customer to Next Destination (Transfer Station or Landfill) - Simulate once for the batch
      animateDotAlongPath(destinationPathId, duration, () => {
        incrementEmissionsForPathWithSMT(destinationPathId, destinationRunningEmissions, (haulerIdlingEmissions / 3));
        
        // Reverse the animation for the return path - Simulate once for the batch
        animateDotAlongPath(destinationPathId, duration, () => {
          incrementEmissionsForPathWithSMT('haulerToCustomer', destinationRunningEmissions, (haulerIdlingEmissions / 3));
          if (currentHaul + 1 >= adjustedHauls) {
            let currentEmissions = parseFloat(document.getElementById('emissionsValueWithoutSmt').textContent);
            let currentEmissionsWithSMT = parseFloat(document.getElementById('emissionsValueWithSmt').textContent);
            let emissionsSavings = currentEmissions - currentEmissionsWithSMT;

            let currentCost = parseFloat(document.getElementById('haulingCostValue').textContent.replace('$', ''));
            let currentCostWithSMT = parseFloat(document.getElementById('newHaulingCostValue').textContent.replace('$', ''));
            let costSavings = currentCost - currentCostWithSMT;
            
            let yearlyCostSavings = costSavings * 52;
            let yearlyEmissionsSaved = emissionsSavings * 52;
            showSMTSavingsModal(costSavings, emissionsSavings, yearlyCostSavings, yearlyEmissionsSaved);
          } else {
            // Not the last haul, proceed with the next SMT animation after a delay
            setTimeout(() => animateSMTPath(currentHaul + 1), duration);
          }
        }, true); // Indicates this is a return path
      }); 
    }); 
  }
  
  animateSMTPath();
} 
 
function calculateSMTPathEmissions(timesSmashed, defaultSMTDistance) {

  const CF = 0.00220462; 
  const ST = 0.083333333; 

  let smtRunning = smtRunningEmissions(defaultSMTDistance, Emissions.SmashRunCO2, CF);
  let smtIdling = smtIdlingEmissions(ST, Emissions.SmashIdleCO2, CF);

  let smashingEmissions = calculateSmashingEmissions(timesSmashed, ST, Emissions.SmashCO2, CF);
  let totalSMTEmissions = smtRunning + smtIdling + smashingEmissions;

  console.log('Total SMT Emissions:', totalSMTEmissions);

  return totalSMTEmissions; // Return total emissions for the SMT service
}

// Function to open the SMT Savings Modal
function showSMTSavingsModal(savings, emissionsReduction, yearlyCost, yearlyEmissions) {

  // Format the savings as a currency string
const formattedSavings = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
}).format(savings);

// Format the yearlyCost as a currency string
const formattedYearlyCost = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
}).format(yearlyCost);



  // Existing updates to modal content
  document.getElementById('savingsAmount').innerHTML = `Estimated Weekly Cost Savings: <span style="color: green;">${formattedSavings}</span>`;
  document.getElementById('emissionsReduction').innerText = `Estimated Weekly Emissions Reduction: ${emissionsReduction.toFixed(2)} lbs CO2/week`;
  document.getElementById('yearlyCostSavings').innerHTML = `Estimated Yearly Cost Savings: <span style="color: green;">${formattedYearlyCost}</span>`;
  document.getElementById('yearlyEmissionsSavings').innerText = `Estimated Yearly Emissions Reduction: ${yearlyEmissions.toFixed(2)} lbs CO2/year`;

  // Hide the equivalencies section initially each time the modal is shown
  document.getElementById('equivalenciesSection').style.display = 'none';

  // Display the modal
  var modal = document.getElementById('smtSavingsModal');
  modal.style.display = "block";

  // Initialize "See More" button functionality
  document.getElementById('seeMoreButton').addEventListener('click', function() {
    var equivalenciesSection = document.getElementById('equivalenciesSection');
    
    // Toggle the display status based on its current state
    if (getComputedStyle(equivalenciesSection).display === 'none') {
      // If hidden, show it and calculate/update equivalencies
      equivalenciesSection.style.display = 'block';
      updateEquivalencies(parseFloat(document.getElementById('emissionsReduction').textContent.split(':')[1].trim().split(' ')[0]));
    } else {
      // If shown, hide it
      equivalenciesSection.style.display = 'none';
    }
  });
  

  // Close modal functionality
  var span = document.getElementsByClassName("close-button")[0];
  span.onclick = function() {
    modal.style.display = "none";
  };
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

// Function to calculate and update equivalencies
function updateEquivalencies(emissionsReductionLbs) {
  // Calculate equivalencies based on emissionsReductionLbs
  document.getElementById('dieselSaved').textContent = (emissionsReductionLbs * equivalencyFactors.diesel).toFixed(2) + ' gallons';
  document.getElementById('treesPlanted').textContent = (emissionsReductionLbs * equivalencyFactors.trees).toFixed(2) + ' trees';
  document.getElementById('energySaved').textContent = (emissionsReductionLbs * equivalencyFactors.energy).toFixed(2) + ' homes';
  document.getElementById('milesAvoided').textContent = (emissionsReductionLbs * equivalencyFactors.miles).toFixed(2) + ' miles';
}


const equivalencyFactors = {
  diesel: 22.38, // Gallons of diesel burned per 100 lbs of CO2
  trees: 0.039, // Number of trees planted per lb of CO2
  energy: 0.000118, // Homes' energy use for one year per lb of CO2
  miles: 0.91, // Miles driven by an average passenger vehicle per lb of CO2
};


function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}



// Function to calculate the number of smashes based on compactibility
function calculateSmashes(haulsPerWeek, compactibility) {
  let adjustedHauls;
  if (compactibility === 'high') {
    adjustedHauls = Math.ceil(haulsPerWeek * 0.2);
  } else if (compactibility === 'medium') {
    adjustedHauls = Math.ceil(haulsPerWeek * 0.3);
  } else if (compactibility === 'low') {
    adjustedHauls = Math.ceil(haulsPerWeek * 0.4);
  }
  return adjustedHauls;
}

function getSMTSmashes(compactibility){
  let timesSmashed;
  if(compactibility === 'high'){
    timesSmashed = 3;
  } else if (compactibility === 'medium'){
    timesSmashed = 2;
  } else {
    timesSmashed = 1;
  }
  return timesSmashed;

}
function smtRunningEmissions(distance, emissionFactor, conversionFactor){
  const emissions =  distance * (emissionFactor * conversionFactor);
  return emissions;
}

function smtIdlingEmissions(smashingTime, emissionFactor, conversionFactor){
  const emissions = smashingTime * (emissionFactor * conversionFactor)
  return emissions;
}

function calculateSmashingEmissions(numberOfWasteHauls, smashingTime, emissionFactor, conversionFactor) {
  const emissions = numberOfWasteHauls * smashingTime * (emissionFactor * 17) * conversionFactor;
  return emissions;
}



function getPathWithRightAngle(startIconId, endIconId) {
  const startIcon = document.getElementById(startIconId);
  const endIcon = document.getElementById(endIconId);

  if (!startIcon || !endIcon) {
    console.error(`Elements with IDs "${startIconId}" or "${endIconId}" were not found.`);
    return '';
  }

  // Calculate the positions of the icons
  const start = { x: startIcon.offsetLeft, y: startIcon.offsetTop };
  const end = { x: endIcon.offsetLeft, y: endIcon.offsetTop };

  // Determine the 'corner' point for the right-angle turn
  // For simplicity, this example uses the x from the end point and y from the start point
  const corner = { x: end.x, y: start.y };

  // Create the path data string
  const pathData = `M${start.x},${start.y} L${corner.x},${corner.y} L${end.x},${end.y}`;
  return pathData;
}

function getPathCoordinates(startIconId, endIconId) {
  const startIcon = document.getElementById(startIconId);
  const endIcon = document.getElementById(endIconId);

  if (!startIcon || !endIcon) {
    console.error(
      `One or both elements with IDs "${startIconId}" or "${endIconId}" were not found.`
    );
    return null;
  }
  // Calculate the top-left corner positions of the icons
  const startTopLeft = { x: startIcon.offsetLeft, y: startIcon.offsetTop };
  const endTopLeft = { x: endIcon.offsetLeft, y: endIcon.offsetTop };

  return {
    startX: startTopLeft.x,
    startY: startTopLeft.y,
    endX: endTopLeft.x,
    endY: endTopLeft.y,
  };
}

document.addEventListener("DOMContentLoaded", function () {
  let hasRunWithoutSMT = false;

  // Call this function when the page loads and also on window resize
  const haulerToCustomerPathCoordinates = getPathCoordinates(
    "hauler-icon",
    "customer-icon"
  );
  const customerToLandfillPathCoordinates = getPathCoordinates(
    "customer-icon",
    "landfill-icon"
  );
  const smtToCustomerPathCoordinates = getPathCoordinates(
    "smt-icon",
    "customer-icon"
  );
  const customerToTransferPathCoordinates = getPathCoordinates(
    "customer-icon",
    "transfer-station-icon"
  );
  
  const pathData = [];

  pathData.push(
    {
      id: "haulerToCustomer",
      startIcon: "hauler-icon",
      endIcon: "customer-icon",
      startX: haulerToCustomerPathCoordinates.startX,
      startY: haulerToCustomerPathCoordinates.startY,
      endX: haulerToCustomerPathCoordinates.endX,
      endY: haulerToCustomerPathCoordinates.endY,
      distance: 0,
      emissionFactor: 0,
      color: "brown",
    },
    {
      id: "customerToLandfill",
      startIcon: "customer-icon",
      endIcon: "landfill-icon",
      startX: customerToLandfillPathCoordinates.startX,
      startY: customerToLandfillPathCoordinates.startY,
      endX: customerToLandfillPathCoordinates.endX,
      endY: customerToLandfillPathCoordinates.endY,
      distance: 0,
      emissionFactor: 0,
      color: "green",
    },
    {
      id: "smtToCustomer",
      startIcon: "smt-icon",
      endIcon: "customer-icon",
      startX: smtToCustomerPathCoordinates.startX,
      startY: smtToCustomerPathCoordinates.startY,
      endX: smtToCustomerPathCoordinates.endX,
      endY: smtToCustomerPathCoordinates.endY,
      distance: 0,
      emissionFactor: 0,
      color: "red",
    },
    {
      id: "customerToTransfer",
      startIcon: "customer-icon",
      endIcon: "transfer-station-icon",
      startX: customerToTransferPathCoordinates.startX,
      startY: customerToTransferPathCoordinates.startY,
      endX: customerToTransferPathCoordinates.endX,
      endY: customerToTransferPathCoordinates.endY,
      distance: 0,
      emissionFactor: 0,
      color: "green",
    },
  );
d3.select("#visualization-map")
  .selectAll("path")
  .data(pathData)
  .enter()
  .append("path")
  .attr("d", d => getPathWithRightAngle(d.startIcon, d.endIcon))
  .attr("stroke", d => d.color)
  .attr("fill", "none")
  .attr("id", d => d.id)
  .attr("endIcon", d => d.endIcon); // Set custom attribute here



  pathData.forEach((path) => {
    d3.select(`#${path.id}`)
      .transition()
      .duration(2000)
      .attrTween("stroke-dasharray", function () {
        const length = this.getTotalLength();
        return d3.interpolate(`0,${length}`, `${length},${length}`);
      });
  });
  d3.selectAll("path")
    .on("mouseover", function (event, d) {
      // Show tooltip
      d3.select("#tooltip")
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px")
        .style("display", "inline-block")
        .html(
          `Path: ${d.id}<br>Emissions: ${calculatePathEmissions(
            d.distance,
            d.emissionFactor,
            false
          ).toFixed(2)} lbs CO2`
        );
    })
    .on("mouseout", function () {
      // Hide tooltip
      d3.select("#tooltip").style("display", "none");
    });

  const svg = d3
    .select("#visualization-map")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 400 400")
    .classed("svg-content-responsive", true);

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
  window.addEventListener("resize", function () {
    updatePathData(); // Function to update the path coordinates
    console.log("Path Updated");
  });

  function updatePathData() {
    const newHaulerToCustomerCoordinates = getPathCoordinates(
      "hauler-icon",
      "customer-icon"
    );
    const newCustomerToLandfillCoordinates = getPathCoordinates(
      "customer-icon",
      "landfill-icon"
    );
    const newSmtToCustomerCoordinates = getPathCoordinates(
      "smt-icon",
      "customer-icon"
    );
    const newCustomerToTransferCoordinates = getPathCoordinates(
      "customer-icon",
      "transfer-station-icon"
    );

    pathData.forEach((path) => {
      switch (path.id) {
        case "haulerToCustomer":
          path.startX = newHaulerToCustomerCoordinates.startX;
          path.startY = newHaulerToCustomerCoordinates.startY;
          path.endX = newHaulerToCustomerCoordinates.endX;
          path.endY = newHaulerToCustomerCoordinates.endY;
          break;
        case "customerToLandfill":
          path.startX = newCustomerToLandfillCoordinates.startX;
          path.startY = newCustomerToLandfillCoordinates.startY;
          path.endX = newCustomerToLandfillCoordinates.endX;
          path.endY = newCustomerToLandfillCoordinates.endY;
          break;
        case "smtToCustomer":
          path.startX = newSmtToCustomerCoordinates.startX;
          path.startY = newSmtToCustomerCoordinates.startY;
          path.endX = newSmtToCustomerCoordinates.endX;
          path.endY = newSmtToCustomerCoordinates.endY;
          break;
        case "customerToTransfer":
          path.startX = newCustomerToTransferCoordinates.startX;
          path.startY = newCustomerToTransferCoordinates.startY;
          path.endX = newCustomerToTransferCoordinates.endX;
          path.endY = newCustomerToTransferCoordinates.endY;
          break;
        }
    });

    // Now update the paths in the SVG using D3
    d3.select("#visualization-map")
      .selectAll("path")
      .data(pathData)
  .attr("d", d => getPathWithRightAngle(d.startIcon, d.endIcon)) // Generate path with right angle
  }
  window.addEventListener("resize", updatePathData);

  document
    .getElementById("transferStation")
    .addEventListener("change", function () {
      var transferStationChecked = this.checked;
      var transferStationDistanceContainer = document.getElementById(
        "transferStationDistanceContainer"
      );
      var landfillDistanceField = document.getElementById("landfillDistance"); // Ensure this is the correct ID for your landfill distance input
      var landfillDistanceLabel = document.querySelector(
        'label[for="landfillDistance"]'
      ); // Adjust if needed to select the correct label

      transferStationDistanceContainer.style.display = transferStationChecked
        ? "block"
        : "none";
      landfillDistanceField.style.display =
        landfillDistanceLabel.style.display = transferStationChecked
          ? "none"
          : "block";
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
    .getElementById("submitWithoutSMT")
    .addEventListener("click", function (event) {
      event.preventDefault();

      let emissionsElement = document.getElementById(
        "emissionsValueWithoutSmt"
      );
      emissionsElement.textContent = "0 lbs/week CO2";
      let haulingCostElement = document.getElementById("haulingCostValue");
      haulingCostElement.textContent = "$0.00";

      // Get form values
      let haulsPerWeek =
        parseFloat(document.getElementById("haulsPerWeek").value) || 0;
      let landfillDistance =
        parseFloat(document.getElementById("landfillDistance").value) || 0;
      let haulerDistance =
        parseFloat(document.getElementById("haulerDistance").value) || 0;

      let haulCost = parseFloat(document.getElementById("haulCost").value) || 0;
      let transferStationChecked =
        document.getElementById("transferStation").checked;
      let transferStationDistance = parseFloat(
        document.getElementById("transferStationDistance").value || 0
      );
      document.getElementById('emissionsValueWithoutSmt').textContent = '0 lbs/week CO2';

      runHaulSequence(haulsPerWeek, 2000, function() {
        hasRunWithoutSMT = true;
        console.log("Haul sequence without SMT completed.");
    });
  }
  );
  
  // Call this function when the SMT service is to be simulated
  document.getElementById("submitWithSMT").addEventListener("click", function (event) {
    event.preventDefault();
    if (!hasRunWithoutSMT) {
      showToast("Please run the simulation without SMT first.");
      return;
    }

    // Get form values
    let haulsPerWeek = parseFloat(document.getElementById("haulsPerWeek").value) || 0;
    let landfillDistance = parseFloat(document.getElementById("landfillDistance").value) || 0;
    let haulerDistance = parseFloat(document.getElementById("haulerDistance").value) || 0;
    let compactibilityValue = document.getElementById('compactibility').value;
    let haulCost = parseFloat(document.getElementById("haulCost").value) || 0;
    let transferStationChecked = document.getElementById("transferStation").checked;
    let transferStationDistance = parseFloat(document.getElementById("transferStationDistance").value) || 0;
    const ST = 0.083333333; 
    const CF = 0.00220462; 

    const smashingEmissions = calculateSmashingEmissions(haulsPerWeek, ST, Emissions.SmashCO2, CF);
    console.log(`Smashing Emissions: ${smashingEmissions.toFixed(2)} lbs/week`);

    let totalHaulerDistWithLandfill = haulerDistance + landfillDistance;
    let totalHaulerDistWithTransfer = haulerDistance + transferStationDistance;

    let smtDistance = 2 
    
    runSMTSequence(compactibilityValue, haulsPerWeek, 2000); // Duration 2000 can be adjusted

  });

});
