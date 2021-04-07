{ var IpSubnetCalculator = { calculate: function (t, r) { var e, i = [], n = r; if (n < t) return null; for (e = t; e <= n;) { var a = this.getOptimalRange(e, n); if (null === a) return null; i.push(a), e = a.ipHigh + 1 } return i }, calculateSubnetMask: function (t, r) { var e; try { e = this.toDecimal(t) } catch (t) { return null } return this.getMaskRange(e, r) }, calculateCIDRPrefix: function (t, r) { var e, i, n, a, u = 0; try { e = this.toDecimal(t), i = this.toDecimal(r) } catch (t) { return null } for (a = 0; a < 32 && (i & (n = u + (1 << 32 - (a + 1)) >>> 0)) >>> 0 == n; a++)u = n; return this.getMaskRange(e, a) }, getOptimalRange: function (t, r) { for (var e = null, i = 32; 0 <= i; i--) { var n = this.getMaskRange(t, i); if (!(n.ipLow === t && n.ipHigh <= r)) break; e = n } return e }, getMaskRange: function (t, r) { var e = this.getPrefixMask(r), i = this.getMask(32 - r), n = (t & e) >>> 0, t = ((t & e) >>> 0) + i >>> 0; return { ipLow: n, ipLowStr: this.toString(n), ipHigh: t, ipHighStr: this.toString(t), prefixMask: e, prefixMaskStr: this.toString(e), prefixSize: r, invertedMask: i, invertedMaskStr: this.toString(i), invertedSize: 32 - r } }, getPrefixMask: function (t) { for (var r = 0, e = 0; e < t; e++)r += 1 << 32 - (e + 1) >>> 0; return r }, getMask: function (t) { for (var r = 0, e = 0; e < t; e++)r += 1 << e >>> 0; return r }, isIp: function (t) { if ("string" != typeof t) return !1; var r = t.match(/^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/); if (null === r) return !1; for (var e = 1; e <= 4; e++) { var i = parseInt(r[e], 10); if (255 < i || i < 0) return !1 } return !0 }, isDecimalIp: function (t) { return "number" == typeof t && t % 1 == 0 && 0 <= t && t <= 4294967295 }, toDecimal: function (t) { if ("number" == typeof t && !0 === this.isDecimalIp(t)) return t; if (!1 === this.isIp(t)) throw new Error("Not an IP address: " + t); t = t.split("."); return 256 * (256 * (256 * +t[0] + +t[1]) + +t[2]) + +t[3] }, toString: function (t) { if ("string" == typeof t && !0 === this.isIp(t)) return t; if (!1 === this.isDecimalIp(t)) throw new Error("Not a numeric IP address: " + t); for (var r = t % 256, e = 3; 0 < e; e--)r = (t = Math.floor(t / 256)) % 256 + "." + r; return r } }; "function" == typeof define && define.amd ? define([], function () { return IpSubnetCalculator }) : "object" == typeof exports && (module.exports = IpSubnetCalculator); }

function ipCIDRFromHttp(array){
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
function int2ip(ipInt) {
    return ((ipInt >>> 24) + '.' + (ipInt >> 16 & 255) + '.' + (ipInt >> 8 & 255) + '.' + (ipInt & 255));
}

function ip2int(ip) {
    return ip.split('.').reduce(function (ipInt, octet) { return (ipInt << 8) + parseInt(octet, 10) }, 0) >>> 0;
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

let getIp = as => {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", `https://apps.db.ripe.net/db-web-ui/api/whois/search?abuse-contact=true&ignore404=true&managed-attributes=true&resource-holder=true&type-filter=ROUTE&inverse-attribute=ORIGIN&flags=r&offset=0&limit=9999&query-string=${as}`, true);
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            objects = JSON.parse(xhttp.responseText).objects.object;

            // x.x.x.x/x
            ipCIDRArray = [...new Set(ipCIDRFromHttp(objects))];

            //{object}
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
getIp('AS16135');