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
  let currentHaulingCost = parseFloat(document.getElementById('haulingCostValue').textContent.replace('$', '')) || 0;
  let newHaulingCost = currentHaulingCost + haulCost;
  document.getElementById('haulingCostValue').textContent = `$${newHaulingCost.toFixed(2)}`;
}

function updateHaulingCostWithSMT(haulCost) {
  let currentHaulingCost = parseFloat(document.getElementById('newHaulingCostValue').textContent.replace('$', '')) || 0;
  let newHaulingCost = currentHaulingCost + haulCost;
  document.getElementById('newHaulingCostValue').textContent = `$${newHaulingCost.toFixed(2)}`;
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
function runHaulSequence(hauls, duration) {
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
            currentHaul = batchEnd; // Move to the end of the current batch
            if (currentHaul < hauls) {
              // Delay before starting the next batch
              setTimeout(processBatch, duration);
            }
          }, true, haulsInCurrentBatch); // Pass haulsInCurrentBatch for return path too
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
      }, false, timesSmashed > 1 ? timesSmashed : undefined); // Pass timesSmashed for the dot text only if > 1
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
          if (currentHaul < adjustedHauls) {
            setTimeout(() => animateSMTPath(currentHaul + 1), duration);
          }
        }, true);
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


// Call this function when the SMT service is to be simulated
document.getElementById("submitWithSMT").addEventListener("click", function (event) {
  event.preventDefault();


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

      runHaulSequence(haulsPerWeek, 2000); // Duration 2000 can be adjusted
  });
   /// animateDotAlongPath('haulerToCustomer', 2000, haulsPerWeek, Emissions.RunningCO2, false);

});
