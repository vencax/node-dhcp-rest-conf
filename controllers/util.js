
var _hexdigit = [
  'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

exports.normalize_mac = function(mac) {
  var validated = [];
  for(var i=0, len=mac.length; i<len; i++) {
    if (_hexdigit.indexOf(mac[i]) >= 0) {
      validated.push(mac[i]);
    }
  }
  return validated.join('');
};

exports.colon_mac = function(mac) {
  var parts = [
    mac.slice(0, 2),
    mac.slice(2, 4),
    mac.slice(4, 6),
    mac.slice(6, 8),
    mac.slice(8, 10),
    mac.slice(10, 12)
  ];
  return parts.join(":");
}
