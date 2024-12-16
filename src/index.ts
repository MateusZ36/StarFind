// alt1 base libs, provides all the commonly used methods for image matching and capture
// also gives your editor info about the window.alt1 api
import * as a1lib from "alt1";

import "./index.html";
import "./appconfig.json";
import "./css/style.css";
import "./icon.png";
import Papa from "papaparse";

const SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/1ctBuqO42ZYYheuEIsbJO1NFPAJsoMrJv9oWxyhsBH9g/export?format=csv&gid=1852026355";

const output = document.getElementById("output") as HTMLElement;

async function fetchAndDisplaySheet() {
  try {
    // Step 1: Fetch CSV data
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch the Google Sheet.");
    }
    const csvText = await response.text();

    // Step 2: Parse CSV data
    const parsedData = Papa.parse(csvText, {
      header: true, // Use the first row as column headers
      skipEmptyLines: true, // Ignore empty lines
    });

    const data = parsedData.data as Record<string, string>[];

    // Step 3: Generate and display the table
    displayTable(data);
  } catch (error) {
    console.error("Error fetching or parsing Google Sheet:", error);
    output.innerHTML = "<p>Error loading data. Please try again later.</p>";
  }
}

function displayTable(data: Record<string, string>[]) {
    if (!data.length) {
        output.innerHTML = "<p>No data available.</p>";
        return;
    }

    // Create the table element
    const table = document.createElement("table");
    table.border = "1";

    // Generate table header
    const headers = Object.keys(data[0]);
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach((header) => {
        if (header !== "F2P") { // Skip F2P in the header
            const th = document.createElement("th");
            th.textContent = header;
            th.addEventListener("click", () => filterTable(header)); // Add filter on column click
            headerRow.appendChild(th);
        }
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Generate table body
    const tbody = document.createElement("tbody");
    data.forEach((row) => {
        const tr = document.createElement("tr");

        // Loop through headers and create cells for the data, skipping F2P
        headers.forEach((header) => {
            if (header !== "F2P") { // Skip F2P column
                const td = document.createElement("td");

                if (header === "World") {
                    // Special handling for "World" column
                    const worldName = row[header] || "";
                    td.textContent = worldName; // Set the world name as usual

                    // Check F2P value and render the appropriate icon next to the world name
                    const icon = document.createElement("img");
                    icon.classList.add("icon-size");

                    if (row["F2P"] && row["F2P"].toUpperCase() === "TRUE") {
                        icon.src = "https://runescape.wiki/images/F2P_icon.png";
                    } else {
                        icon.src = "https://runescape.wiki/images/P2P_icon.png";
                    }

                    // Insert the icon before the world name (so it's on the left)
                    td.prepend(icon); // Prepend icon to the cell, so it's on the left of the text
                } else {
                    td.textContent = row[header] || "";
                }

                tr.appendChild(td);
            }
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    output.innerHTML = ""; // Clear previous content
    output.appendChild(table);
}

function filterTable(column: string) {
  const searchValue = prompt(`Enter a value to filter the ${column} column:`) || "";
  const rows = output.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    const htmlRow = row as HTMLElement; // Explicitly cast to HTMLElement
    const cell = htmlRow.querySelector(`td:nth-child(${getColumnIndex(column) + 1})`) as HTMLElement;
    if (cell && cell.textContent?.includes(searchValue)) {
      htmlRow.style.display = ""; // Show row
    } else {
      htmlRow.style.display = "none"; // Hide row
    }
  });
}

function getColumnIndex(column: string): number {
  const headerCells = output.querySelectorAll("thead th");
  for (let i = 0; i < headerCells.length; i++) {
    if (headerCells[i].textContent === column) {
      return i;
    }
  }
  return -1;
}

fetchAndDisplaySheet();

if (window.alt1) {
    //tell alt1 about the app
    //this makes alt1 show the add app button when running inside the embedded browser
    //also updates app settings if they are changed
    alt1.identifyAppUrl("./appconfig.json");
} else {
    let addappurl = `alt1://addapp/${new URL("./appconfig.json", document.location.href).href}`;
    let newEle = `<li>Alt1 not detected, click <a href='${addappurl}'>here</a> to add this app to Alt1</li>`;
    let alt1warning = document.getElementById("alt1warning") as HTMLElement;
    alt1warning.insertAdjacentHTML("beforeend", newEle);
}