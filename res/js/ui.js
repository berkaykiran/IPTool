var sortedIpObjects, decimalIpArray;
var nav_cidr_by_asn = document.getElementById('nav-cidr-by-asn');
var nav_sorted_no_overlap = document.getElementById('nav-sorted-no-overlap');

document.getElementById('getIPs').onclick = () => {
    nav_cidr_by_asn.innerHTML = '';
    nav_sorted_no_overlap.innerHTML = '';

    temp_asn_array = asn.value.split(',');
    promises = temp_asn_array.map(el => getASNFromRipeNet(el));
    Promise.all(promises).then(values => {

        //IP Objects from SubNet Calculator
        IpObjects = values.map(el => {
            return [...new Set(ipCIDRFromHttp(el))].map(el => getIpRangeFromAddressAndNetmask(el));
        });

        //Sorted Ip Objects from $IpObjects
        sortedIpObjects = IpObjects.flat().sort((a, b) => a.ipLow - b.ipLow);

        //Delete Overlapping IPs
        sortedIpObjectOverlapsFiltered = filterOverlaps(sortedIpObjects, 'ipLow', 'ipHigh');

        //Decimal IP Range Array from $sortedIpObjectOverlapsFiltered
        decimalIpArray = sortedIpObjectOverlapsFiltered.map(el => [el.ipLow, el.ipHigh]);

        //Merged Decimal IP Range Array from $decimalIpArray
        mergedDecimalIpRangeArray = mergeDecimalIpRanges(decimalIpArray);

        //Reverse Decimal IP Range Array from $mergedDecimalIpRangeArray
        reversedDecimalIpRange = reverseDecimalIpRange(mergedDecimalIpRangeArray);

        //Reversed IP CIDR range
        optimizedRange = returnOptimizedRange(reversedDecimalIpRange, 'ipLowStr', 'prefixSize');

        /* console.log(sortedIpObjects);
        console.log(decimalIpArray.join('\n'));
        console.log(mergedDecimalIpRangeArray.join('\n'));
        console.log(reversedDecimalIpRange.join('\n')); */

        ripe_reversed_cidr.value = optimizedRange.join('\n');

        
        nav_cidr_by_asn.innerHTML = IpObjects.map(el => el.map(item => `${item.ipLowStr}/${item.prefixSize}`).join('\n')).reduce((acc, value, i) => 
            acc += `
                <label for="ripe_cidr_by_asn${i}">${temp_asn_array[i]} CIDR:</label>
                <textarea class="form-control mb-2" id="ripe_cidr_by_asn${i}" rows="10">${value}</textarea>
            `, '');

        nav_sorted_no_overlap.innerHTML = IpObjects.map(el => filterOverlaps([...new Set(el)].sort((a, b) => a.ipLow - b.ipLow), 'ipLow', 'ipHigh').map(item => `${item.ipLowStr}/${item.prefixSize}`).join('\n')).reduce((acc, value, i) => 
            acc += `
                <label for="ripe_cidr_by_asn_sorted_no_overlap${i}">${temp_asn_array[i]} CIDR:</label>
                <textarea class="form-control mb-2" id="ripe_cidr_by_asn_sorted_no_overlap${i}" rows="10">${value}</textarea>
            `, '');


    }).catch(error => {
        ripe_reversed_cidr.value = `ASN ${error.message}`;
        console.log(error.message);
    });;
}