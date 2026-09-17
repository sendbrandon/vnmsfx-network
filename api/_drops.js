// The drop calendar — ONE source of truth for the server, the page and the
// drop-day script. Times are UTC instants; the page renders them in ET.
//
// A drop has three moments:
//   early    pass holders get the film by email (24h before public)
//   release  the page flips from countdown to film for everyone
//   close    the drop rate closes (48h after release)
//
// The drop rate is honoured only between the countdown going live and `close`.
// Outside a window the Sprint is list price, and the page says so.

const DROPS = [
  {
    id: "the-recipient",
    title: "The Recipient",
    tagline: "Package is inbound.",
    liveFrom: "2026-09-18T00:00:00Z",   // countdown + drop rate open  (Wed 9/17 8:00 PM ET)
    early:    "2026-09-21T16:00:00Z",   // pass holders emailed the film (Sun 9/21 12:00 PM ET)
    release:  "2026-09-22T16:00:00Z",   // public                        (Mon 9/22 12:00 PM ET)
    close:    "2026-09-24T16:00:00Z",   // drop rate closes              (Wed 9/24 12:00 PM ET)
    film: "/tv/drops/r-7423688ff693.mp4",
    poster: "/tv/drops/the-recipient-poster.jpg",
    tease: "/tv/drops/the-recipient-tease.mp4",
    cards: ["/tv/drops/card-1-ramp.jpg", "/tv/drops/card-2-backseat.jpg", "/tv/drops/card-3-coming-soon.jpg"],
  },
];

const DROP_RATE = 1500;
const LIST_RATE = 2000;

function byId(id) { return DROPS.find((d) => d.id === id) || null; }
function current(now) {
  const t = (now || new Date()).getTime();
  return DROPS.find((d) => t >= Date.parse(d.liveFrom) && t < Date.parse(d.close)) || null;
}
function rateOpen(now) { return !!current(now); }

module.exports = { DROPS, DROP_RATE, LIST_RATE, byId, current, rateOpen };
