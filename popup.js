const countrySelect = document.getElementById("country-list");
const saveBtn = document.getElementById("save");
const clearBtn = document.getElementById("clear");

const COUNTRIES = [
	"United Kingdom",
	"United States",
	"Canada",
	"Australia",
	"Germany",
	"France",
	"Spain",
	"Italy",
	"Netherlands",
	"Sweden",
	"Norway",
	"Denmark",
	"Finland",
	"Poland",
	"Russia",
	"Brazil",
	"Mexico",
	"Argentina",
	"India",
	"China",
	"Japan",
	"South Korea",
	"Turkey",
	"Egypt",
	"South Africa",
];

function populate() {
	countrySelect.innerHTML = "";
	COUNTRIES.forEach((c) => {
		const opt = document.createElement("option");
		opt.value = c;
		opt.textContent = c;
		countrySelect.appendChild(opt);
	});
}

async function loadSettings() {
	const data = await chrome.storage.sync.get({ allowedCountries: [] });
	const allowed = data.allowedCountries;
	Array.from(countrySelect.options).forEach((opt) => {
		opt.selected = allowed.includes(opt.value);
	});
}

saveBtn.addEventListener("click", async () => {
	const selected = Array.from(countrySelect.selectedOptions).map(
		(o) => o.value
	);
	await chrome.storage.sync.set({ allowedCountries: selected });
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs[0])
			chrome.scripting.executeScript({
				target: { tabId: tabs[0].id },
				files: ["content.js"],
			});
	});
	window.close();
});

clearBtn.addEventListener("click", async () => {
	Array.from(countrySelect.options).forEach((o) => (o.selected = false));
	await chrome.storage.sync.set({ allowedCountries: [] });
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs[0])
			chrome.scripting.executeScript({
				target: { tabId: tabs[0].id },
				files: ["content.js"],
			});
	});
	window.close();
});

populate();
loadSettings();
