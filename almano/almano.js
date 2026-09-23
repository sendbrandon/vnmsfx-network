(function(){
  "use strict";
  var page = "/almano";

  /* Day counter: the review began 2026-09-22 with 30 days. */
  var start = Date.UTC(2026, 8, 22);
  var left = 30 - Math.floor((Date.now() - start) / 864e5);
  var el = document.getElementById("days-left");
  if (el) el.textContent = String(Math.max(0, Math.min(30, left)));

  /* Numbers count up from 0 when they scroll into view, easing out as they land. */
  function countUp(node, to, ms){
    var t0=null; to=Number(to)||0;
    function step(ts){ if(!t0) t0=ts; var k=Math.min(1,(ts-t0)/ms); var e=1-Math.pow(1-k,4); node.textContent=String(Math.round(to*e)); if(k<1) requestAnimationFrame(step); else node.textContent=String(to); }
    node.textContent="0"; requestAnimationFrame(step);
  }
  var nums = document.querySelectorAll(".almano-numbers strong");
  if (nums.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(entries){ entries.forEach(function(en){ if(!en.isIntersecting) return; var n=en.target; io.unobserve(n); countUp(n, n.getAttribute("data-to"), 1800 + Math.min(1200, Number(n.getAttribute("data-to"))/2)); }); }, {threshold:0.4});
    nums.forEach(function(n){ n.setAttribute("data-to", n.textContent.trim()); io.observe(n); });
  }

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
