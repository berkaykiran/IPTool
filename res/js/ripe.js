function get(asn) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', `get.php?asn=${asn}`, true);
        req.onload = function () {
            if (req.status == 200) {
                resolve(JSON.parse(req.response).objects.object);
            } else {
                reject(Error(`${req.statusText} ${asn}`));
            }
        };
        req.onerror = function () {
            reject(Error(`Network Error ${asn}`));
        };
        req.send();
    });
}

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

function mergeDecimalIpRanges(arr) {
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

function reverseDecimalIpRange(arr) {
    temp_arr = [[16777216, arr[0][0] - 1]];//bogon before 1.0.0.0
    for (let i = 0; i < arr.length - 1; i++) {
        temp_arr.push([arr[i][1] + 1, arr[i + 1][0] - 1]);
    }
    temp_arr.push([arr[arr.length - 1][1] + 1, 3758096383]);//bogon after 224.0.0.0
    return temp_arr;
}

{
    function returnOptimizedRange(arr, key, pref) {
        reversedCidr = arr.map(element => {
            return [IpSubnetCalculator.calculate(element[0], element[1])];
        });
        let newArray = [];
        getAllId(reversedCidr, key, pref, newArray);
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