function resetCnt() {
  fetch("//{{ .Site.Params.WSHost }}/reset", {
    method: "PUT",
  })
}
(function() {
  var cnt = document.getElementById("cnt");
  var like = document.getElementById("like");
  var wss = (window.location.protocol == "https:") ? "wss:" : "ws:";
  var conn = new WebSocket(wss + "//{{ .Site.Params.WSHost }}/ws");
  like.style.display = "block";
  conn.onclose = function(evt) {
      like.style.display = "none";
  }
  conn.onmessage = function(evt) {
      cnt.textContent = evt.data;
  }
})();
