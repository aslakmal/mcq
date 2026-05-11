(function(w, d) {
    // We hide "location", "hostname", "includes", and "href"
    var _propLoc = atob('bG9jYXRpb24=');    // "location"
    var _propHost = atob('aG9zdG5hbWU=');   // "hostname"
    var _methodInc = atob('aW5jbHVkZXM='); // "includes"
    var _propRef = atob('aHJlZg==');       // "href"
    
    // The secret "gib" check
    var secret = atob('Z2li');              // "gib"
    
    // The secret destination
    var dest = atob('aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbQ==');

    // Accessing window['location']['hostname'] dynamically
    if (!w[_propLoc][_propHost][_methodInc](secret)) {
        // Equivalent to: window.location.href = dest;
        w[_propLoc][_propRef] = dest;
    }
})(window, document);