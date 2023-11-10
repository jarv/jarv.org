function resetCnt() {
  fetch("//{{ .Site.Params.WSHost }}/reset", {
    method: "PUT",
  })
}
(function() {
  var cnt = document.getElementById("cnt");
  var wss = (window.location.protocol == "https:") ? "wss:" : "ws:"
  var conn = new WebSocket(wss + "//{{ .Site.Params.WSHost }}/ws");
  conn.onclose = function(evt) {
      cnt.textContent = '';
  }
  conn.onmessage = function(evt) {
      cnt.textContent = evt.data;
  }
})();
