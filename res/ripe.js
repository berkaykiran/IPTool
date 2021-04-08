function ipCIDRFromHttp(array) {
    return array.map((element) => {
        var temp;
        element.attributes.attribute.forEach(obj => { if (obj.name === "route") { temp = obj.value } });
        return temp;
    });
}

function getIpRangeFromAddressAndNetmask(str) {
    var part = str.split('/');
    return IpSubnetCalculator.calculateSubnetMask(part[0], parseInt(part[1]));
}

function filterOverlaps(arr, lowKey, highKey) {
    arrayOverlapFix = [];

    for (let i = 0; i < arr.length; i++) {
        var temp_bool = true;
        for (let j = 0; j < arr.length; j++) {
            if (arr[i][lowKey] >= arr[j][lowKey] && arr[i][lowKey] <= arr[j][highKey] && i !== j) {
                if (arr[i][highKey] >= arr[j][lowKey] && arr[i][highKey] <= arr[j][highKey]) {
                    temp_bool = false;
                }
            }
        }
        if (temp_bool) {
            arrayOverlapFix.push(arr[i]);
        }
    }
    return arrayOverlapFix;
}

function mergeDecimalIpRanges(arr){
    tempMergedDecimalIpRangeArray = [];
    for (let i = 0; i < arr.length - 1; i++) {
        var first_decimal = arr[i][0];
        var last_decimal = arr[i][1];
        for (let j = i + 1; j < arr.length - 1; j++) {
            if (arr[i][1] + 1 >= arr[i + 1][0]) {
                last_decimal = arr[i + 1][1];
                i++;
            }
        }
        tempMergedDecimalIpRangeArray.push([first_decimal, last_decimal]);
    }
    return tempMergedDecimalIpRangeArray;
}

{
    function returnOptimizedRange(arr, key, pref) {
        let newArray = [];
        getAllId(arr, key, pref, newArray);
        return newArray;
    }
    function getAllId(arr, key, pref, tempArr) {
        arr.forEach((item) => {
            for (let keys in item) {
                if (keys === key) {
                    tempArr.push(item[key] + '/' + item[pref]);
                } else if (Array.isArray(item[keys])) {
                    getAllId(item[keys], key, pref, tempArr);
                }
            }
        });
    }
}

function reverseDecimalIPRangeFromArray(arr) {
    let temp_arr = [[0, arr[0][0]]];
    for (let i = 0; i < arr.length - 1; i++) {
        temp_arr.push([arr[i][1], arr[i + 1][0]]);
    }
    temp_arr.push([arr[arr.length - 1][1], 4294967295]);
    return temp_arr;
}

function get(asn) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', `https://a.smrtrdrct.com/iptool/get.php?asn=${asn}`, true);
        req.onload = function () {
            if (req.status == 200) {
                resolve(JSON.parse(req.response).objects.object);
            }
            else {
                reject(Error(req.statusText));
            }
        };
        req.onerror = function () {
            reject(Error("Network Error"));
        };
        req.send();
    });
}

/*let getIp = asn => {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", `https://a.smrtrdrct.com/iptool/get.php?asn=${asn}`, true);
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            objects = JSON.parse(xhttp.responseText).objects.object;

            // x.x.x.x/x
            ipCIDRArray = [...new Set(ipCIDRFromHttp(objects))];

            //{object from lib}
            ipObject = ipCIDRArray.map(el => getIpRangeFromAddressAndNetmask(el));

            //xxxxxxxxx,xxxxxxxxx
            ipDecimal = ipObject.map(el => [el.ipLow, el.ipHigh]).sort((a, b) => a[0] - b[0]);
            console.log('DECIMAL:\n' + ipDecimal.join('\n'));

            // x.x.x.x, x.x.x.x
            ipRangeArray = ipObject.map(el => {
                return [el.ipLowStr, el.ipHighStr];
            });

        }
    };
    xhttp.send();
}
getIp('AS16135');*/