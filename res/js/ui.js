let sortedIpObjects, decimalIpArray;
let nav_cidr_by_asn = document.getElementById("nav-cidr-by-asn");
let nav_sorted_no_overlap = document.getElementById("nav-sorted-no-overlap");

document.getElementById("getIPs").onclick = () => {
	nav_cidr_by_asn.innerHTML = "";
	nav_sorted_no_overlap.innerHTML = "";

	let asnInputs = asn.value.split(",");
	let promises = asnInputs.map(el => getRoutesByAsnFromRipeNet(el.trim()));
	Promise.all(promises)
		.then(values => {
			//IP Objects from SubNet Calculator
			IpObjects = values.map(el => {
				return getCidrRoutesFromRipeNetResponse(el).map(el =>
					createIpObjectFromIpCidr(el)
				);
			});

			//Sorted Ip Objects from $IpObjects
			sortedIpObjects = IpObjects.flat().sort((a, b) => a.ipLow - b.ipLow);

			//Delete Overlapping IPs
			sortedIpObjectOverlapsFiltered = filterOverlappingIps(sortedIpObjects);

			//Decimal IP Range Array from $sortedIpObjectOverlapsFiltered
			decimalIpArray = sortedIpObjectOverlapsFiltered.map(el => [
				el.ipLow,
				el.ipHigh,
			]);

			//Merged Decimal IP Range Array from $decimalIpArray
			mergedDecimalIpRangeArray = mergeDecimalIpRanges(decimalIpArray);

			//Reverse Decimal IP Range Array from $mergedDecimalIpRangeArray
			reversedDecimalIpRange = reverseDecimalIpRange(mergedDecimalIpRangeArray);

			//Reversed IP CIDR range
			optimizedRange = optimizeRange(reversedDecimalIpRange);

			ripe_reversed_cidr.value = optimizedRange.join("\n");

			nav_cidr_by_asn.innerHTML = IpObjects.map(el =>
				el.map(item => `${item.ipLowStr}/${item.prefixSize}`).join("\n")
			).reduce(
				(acc, value, i) =>
					(acc += `
                <label for="ripe_cidr_by_asn${i}">${asnInputs[i]} CIDR:</label>
                <textarea class="form-control mb-2" id="ripe_cidr_by_asn${i}" rows="10">${value}</textarea>
            `),
				""
			);

			nav_sorted_no_overlap.innerHTML = IpObjects.map(el =>
				filterOverlappingIps([...new Set(el)].sort((a, b) => a.ipLow - b.ipLow))
					.map(item => `${item.ipLowStr}/${item.prefixSize}`)
					.join("\n")
			).reduce(
				(acc, value, i) =>
					(acc += `
                <label for="ripe_cidr_by_asn_sorted_no_overlap${i}">${asnInputs[i]} CIDR:</label>
                <textarea class="form-control mb-2" id="ripe_cidr_by_asn_sorted_no_overlap${i}" rows="10">${value}</textarea>
            `),
				""
			);
		})
		.catch(error => {
			ripe_reversed_cidr.value = `ASN ${error.message}`;
			console.log(error.message);
		});
};
