/**
 * Gets the IP addresses and returns a promise object with IP Objects
 * @param {string} asn
 * @return {object} promise object with IP Objects | error
 */
function getRoutesByAsnFromRipeNet(asn) {
	return new Promise(function (resolve, reject) {
		let req = new XMLHttpRequest();
		req.open("GET", `get.php?asn=${asn}`, true);
		req.onload = function () {
			if (req.status == 200) {
				resolve(JSON.parse(req.response).objects.object);
			} else {
				reject(Error(`${req.statusText}: ${asn}`));
			}
		};
		req.onerror = function () {
			reject(Error(`Network Error ${asn}`));
		};
		req.send();
	});
}

/**
 * Gets the IP addresses and returns a promise object with IP Objects
 * @param {string} asn
 * @return {object} promise object with IP Objects | error
 */
function betterGetFromRipeNet_nodejs(asn) {
	fetch(
		`https://rest.db.ripe.net/search.json?query-string=${asn}&inverse-attribute=origin&type-filter=route&flags=no-referenced&flags=no-irt&source=RIPE`,
		{
			mode: "no-cors",
			headers: {
				Accept: "text/html",
			},
		}
	)
		.then(response => console.log(response))
		.then(data => {
			console.log("Success:", data);
		});
}

/**
 * Returns IP CIDR objects of Ripe.net Response
 * @param {string} IPs
 * @return {object|null}
 */
function getCidrRoutesFromRipeNetResponse(IPs) {
	return IPs.map(element => {
		let temp;
		element.attributes.attribute.forEach(obj => {
			if (obj.name === "route") {
				temp = obj.value;
			}
		});
		return temp;
	});
}

/**
 * Creates and Returns Ip Object with IpSubnetCalculator(calculateSubnetMask) library
 * @param {string} ipCidrString
 * @return {object|null}
 */
function createIpObjectFromIpCidr(ipCidrString) {
	let cidrParts = ipCidrString.split("/");
	return IpSubnetCalculator.calculateSubnetMask(
		cidrParts[0],
		parseInt(cidrParts[1])
	);
}

/**
 * Filters sorted IP Objects(Array) for overlapping IPs
 * @param {object} sortedIPs
 * @return {object} overlapping filtered IP objects
 */
function filterOverlappingIps(
	sortedIPs,
	lowIpKey = "ipLow",
	highIpKey = "ipHigh"
) {
	let filteredIps = [];

	for (let i = 0; i < sortedIPs.length; i++) {
		let overlapping = true;
		for (let j = 0; j < sortedIPs.length; j++) {
			if (
				sortedIPs[i][lowIpKey] >= sortedIPs[j][lowIpKey] &&
				sortedIPs[i][lowIpKey] <= sortedIPs[j][highIpKey] &&
				i !== j
			) {
				if (
					sortedIPs[i][highIpKey] >= sortedIPs[j][lowIpKey] &&
					sortedIPs[i][highIpKey] <= sortedIPs[j][highIpKey]
				) {
					overlapping = false;
				}
			}
		}
		if (overlapping) {
			filteredIps.push(sortedIPs[i]);
		}
	}
	return filteredIps;
}

/**
 * Merges decimal IP Objects(Array) for duplicates
 * @param {object} IPs [LowIP, HighIP]
 * @return {object} merged IP objects
 */
function mergeDecimalIpRanges(IPs) {
	let mergedRange = [];
	for (let i = 0; i < IPs.length - 1; i++) {
		let first_decimal = IPs[i][0];
		let last_decimal = IPs[i][1];
		for (let j = i + 1; j < IPs.length - 1; j++) {
			if (IPs[i][1] + 1 >= IPs[i + 1][0]) {
				last_decimal = IPs[i + 1][1];
				i++;
			}
		}
		mergedRange.push([first_decimal, last_decimal]);
	}
	return mergedRange;
}

/**
 * Returns a reversed decimal IP range
 * @param {object} decimalIpArray [LowIpDecimal, HighIpDecimal]
 * @return {object} Reversed decimal IP range
 */
function reverseDecimalIpRange(decimalIpArray) {
	let reversedIpDecimalArray = [[16777216, decimalIpArray[0][0] - 1]]; //bogon before 1.0.0.0
	for (let i = 0; i < decimalIpArray.length - 1; i++) {
		reversedIpDecimalArray.push([
			decimalIpArray[i][1] + 1,
			decimalIpArray[i + 1][0] - 1,
		]);
	}
	reversedIpDecimalArray.push([
		decimalIpArray[decimalIpArray.length - 1][1] + 1,
		3758096383,
	]); //bogon after 224.0.0.0
	return reversedIpDecimalArray;
}

function optimizeRange(arr, key = "ipLowStr", pref = "prefixSize") {
	reversedCidr = arr.map(el => {
		return [IpSubnetCalculator.calculate(el[0], el[1])];
	}); //nested
	reversedCidr = reversedCidr.flat(Infinity);
	reversedCidr = reversedCidr.map(el => {
		return [`${el[key]}/${el[pref]}`];
	});
	return reversedCidr;
}
