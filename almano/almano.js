(function(){
  "use strict";
  var page = "/almano";

  /* Day counter: the review began 2026-09-22 with 30 days. */
  var start = Date.UTC(2026, 8, 22);
  var left = 30 - Math.floor((Date.now() - start) / 864e5);
  var el = document.getElementById("days-left");
  if (el) el.textContent = String(Math.max(0, Math.min(30, left)));

  /* Steward watches the cursor. Depth-map parallax when /almano/media/steward-depth.jpg exists; tilt fallback otherwise. */
  var watch = document.querySelector(".steward-watch");
  var still = document.getElementById("steward-still");
  var canvas = document.getElementById("steward-canvas");
  var target = {x: 0, y: 0}, cur = {x: 0, y: 0}, raf = null;
  function follow(e){
    var r = watch.getBoundingClientRect();
    var px = (e.touches ? e.touches[0].clientX : e.clientX);
    var py = (e.touches ? e.touches[0].clientY : e.clientY);
    target.x = Math.max(-1, Math.min(1, ((px - (r.left + r.width/2)) / (window.innerWidth/2))));
    target.y = Math.max(-1, Math.min(1, ((py - (r.top + r.height/2)) / (window.innerHeight/2))));
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function rest(){ target.x = 0; target.y = 0; if (!raf) raf = requestAnimationFrame(tick); }
  var depth = null, gl = null, prog = null, tex = {}, ready = false;
  function tick(){
    cur.x += (target.x - cur.x) * 0.12; cur.y += (target.y - cur.y) * 0.12;
    if (ready) draw(); else if (still) still.style.transform = "perspective(900px) rotateY(" + (cur.x*7) + "deg) rotateX(" + (-cur.y*5) + "deg) scale(1.04) translate(" + (cur.x*6) + "px," + (cur.y*4) + "px)";
    raf = (Math.abs(cur.x-target.x) > 0.002 || Math.abs(cur.y-target.y) > 0.002) ? requestAnimationFrame(tick) : null;
  }
  if (watch) {
    window.addEventListener("mousemove", follow, {passive:true});
    window.addEventListener("touchmove", follow, {passive:true});
    window.addEventListener("touchend", rest, {passive:true});
    document.addEventListener("mouseleave", rest);
  }

  /* WebGL depth parallax. Loads only if the depth map exists. */
  function initDepth(){
    var img = new Image(), dep = new Image(); var n = 0;
    function done(){ if (++n < 2) return; try { setup(img, dep); } catch(e){} }
    img.onload = done; dep.onload = done; dep.onerror = function(){};
    img.src = "/almano/media/steward-portrait.jpg"; dep.src = "/almano/media/steward-depth.jpg";
  }
  function setup(img, dep){
    gl = canvas.getContext("webgl", {premultipliedAlpha:false}); if (!gl) return;
    var vs = "attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,1.-(p.y*.5+.5));gl_Position=vec4(p,0.,1.);}";
    var fs = "precision mediump float;varying vec2 v;uniform sampler2D img;uniform sampler2D dep;uniform vec2 m;void main(){float d=texture2D(dep,v).r;vec2 uv=v+(d-.5)*m*.035;gl_FragColor=texture2D(img,uv);}";
    function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o;}
    prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    function load(i, unit, name){ var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, i); gl.uniform1i(gl.getUniformLocation(prog, name), unit); }
    load(img, 0, "img"); load(dep, 1, "dep");
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    ready = true; watch.classList.add("has-depth"); draw();
  }
  function draw(){ gl.uniform2f(gl.getUniformLocation(prog, "m"), cur.x, -cur.y); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
  if (canvas) initDepth();

  /* Enrollment form → /api/almano-enroll */
  var form = document.getElementById("almano-form");
  var confirm = document.getElementById("almano-confirm");
  var err = form && form.querySelector(".form-error");
  var appId = null;
  if (form) form.addEventListener("submit", function(ev){
    ev.preventDefault();
    var fd = new FormData(form);
    var body = { name: fd.get("name"), birthYear: fd.get("birthYear"), kin: fd.get("kin"), email: fd.get("email"), company_website: fd.get("company_website"), page: page, day: el ? el.textContent : "" };
    if (!body.name || !/^\d{4}$/.test(String(body.birthYear||"")) || !body.kin || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(body.email||""))) { show("Please complete every field. A Steward cannot file an incomplete application."); return; }
    var btn = form.querySelector("button"); btn.disabled = true; err.hidden = true;
    fetch("/api/almano-enroll", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) })
      .then(function(r){ return r.json().catch(function(){ return {ok:false}; }).then(function(d){ return {status:r.status, d:d}; }); })
      .then(function(x){
        if (!x.d || !x.d.ok) { show((x.d && x.d.error) || "Almano could not file your application. Please try again."); btn.disabled = false; return; }
        appId = x.d.applicationId || "ALM-PENDING";
        document.getElementById("app-id").textContent = appId;
        form.hidden = true; confirm.hidden = false;
        if (window.gtag) gtag("event", "almano_enroll", {application: appId});
        confirm.scrollIntoView({behavior:"smooth", block:"center"});
      })
      .catch(function(){ show("Almano could not reach the office. Please try again."); btn.disabled = false; });
  });
  function show(m){ if (!err) return; err.textContent = m; err.hidden = false; }

  var share = document.getElementById("share-app");
  if (share) share.addEventListener("click", function(){
    var text = "I applied to Almano. Application " + appId + ". Day " + (el ? el.textContent : "") + ". vnmsfx.com/almano";
    if (navigator.share) { navigator.share({ text: text, url: "https://vnmsfx.com/almano" }).catch(function(){}); return; }
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function(){ document.getElementById("share-note").hidden = false; }).catch(function(){ prompt("Copy this:", text); });
  });
})();
