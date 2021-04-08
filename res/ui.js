var sortedIpObjects, decimalSortedIps;

document.getElementById('getIPs').onclick = () => {
    temp_asn_array = asn.value.split(',');
    promises = temp_asn_array.map(el => get(el));
    Promise.all(promises).then(values => {

        //IP Objects from SubNet Calculator
        IpObjects = values.map(el => {
            return [...new Set(ipCIDRFromHttp(el))].map(el => getIpRangeFromAddressAndNetmask(el));
        });

        //Sorted Ip Objects from $IpObjects
        sortedIpObjects = [].concat(...IpObjects).sort((a, b) => a.ipLow - b.ipLow);

        //Delete Overlapping IPs
        sortedIpObjectOverlapsFiltered = filterOverlaps(sortedIpObjects, 'ipLow', 'ipHigh');

        //Decimal IP Range Array from $sortedIpObjectOverlapsFiltered
        decimalIpArray = sortedIpObjectOverlapsFiltered.map(el => [el.ipLow, el.ipHigh]);

        //Merged IP Range Array from $decimalIpArray
        mergedDecimalIpRangeArray = mergeDecimalIpRanges(decimalIpArray);
        console.log(sortedIpObjects);
        console.log(decimalIpArray.join('\n'));
        console.log(mergedDecimalIpRangeArray.join('\n'));

    });
}