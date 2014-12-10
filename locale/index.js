(function() {
  var template = document.createElement("div");
  var script = document.querySelector("script[type='text/html']");
  template.innerHTML = script.textContent;

  var xhr = new XMLHttpRequest();
  xhr.open("GET", "en_US.json", true);
  xhr.onload = function() {
    try {
      var obj = JSON.parse(xhr.responseText);
      var errors = Object.keys(obj);
      var div = document.getElementById("entries");
      errors.forEach(function(error) {
        var p = template.cloneNode(true);
        p.querySelector("h1").textContent = error;
        p.querySelector("p").innerHTML = obj[error];
        p.querySelector("pre").textContent = obj[error];
        div.appendChild(p);
      });
    } catch (e) {
      alert("ERROR: unable to decode locale string as JSON.");
    }
  }
  xhr.onerror = function() {
    alert("ERROR: could not load resource 'en_US.json'.");
  }
  xhr.send(null);
}());
