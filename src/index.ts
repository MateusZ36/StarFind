

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

    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch the Google Sheet.");
    }
    const csvText = await response.text();


    const parsedData = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const data = parsedData.data as Record<string, string>[];


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


    const table = document.createElement("table");
    table.border = "1";


    const headers = Object.keys(data[0]);
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.classList.add("header");

    headers.forEach((header) => {
        if (header !== "F2P") {
            const th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
        }
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);


    const tbody = document.createElement("tbody");
    data.forEach((row) => {
        const tr = document.createElement("tr");


        headers.forEach((header) => {
            if (header !== "F2P") {
                const td = document.createElement("td");

                if (header === "World") {

                    const worldName = row[header] || "";
                    td.textContent = worldName;


                    const icon = document.createElement("img");
                    icon.classList.add("icon-size");

                    if (row["F2P"] && row["F2P"].toUpperCase() === "TRUE") {
                        icon.src = "https://runescape.wiki/images/F2P_icon.png";
                    } else {
                        icon.src = "https://runescape.wiki/images/P2P_icon.png";
                    }


                    td.prepend(icon);
                } else {
                    td.textContent = row[header] || "";
                }

                tr.appendChild(td);
            }
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    output.innerHTML = "";
    output.appendChild(table);
}

fetchAndDisplaySheet();

if (window.alt1) {
    alt1.identifyAppUrl("./appconfig.json");
} else {
    let addappurl = `alt1://addapp/${new URL("./appconfig.json", document.location.href).href}`;
    let newEle = `<li>Alt1 not detected, click <a href='${addappurl}'>here</a> to add this app to Alt1</li>`;
    let alt1warning = document.getElementById("alt1warning") as HTMLElement;
    alt1warning.insertAdjacentHTML("beforeend", newEle);
}