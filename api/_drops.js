// The drop calendar — ONE source of truth for the server, the page and the
// drop-day script. Times are UTC instants; the page renders them in ET.
//
// Release moments (close is retained for legacy Sprint API compatibility):
//   early    pass holders get the film by email (24h before public)
//   release  the page flips from countdown to film for everyone
//   close    the drop rate closes (48h after release)
//
// Current Season Pass copy uses the first-time-client saving, not this legacy
// rate window. Public buying links lead to /#commercial-options.

const DROPS = [
  {
    id: "the-recipient",
    title: "The Recipient",
    tagline: "Package is inbound.",
    liveFrom: "2026-09-17T12:00:00Z",   // countdown + drop rate open  (Thu 9/17 8:00 AM ET)
    early:    "2026-09-20T16:00:00Z",   // pass holders emailed the film (Sun 9/20 12:00 PM ET)
    release:  "2026-09-21T16:00:00Z",   // public                        (Mon 9/21 12:00 PM ET)
    close:    "2026-09-23T16:00:00Z",   // drop rate closes              (Wed 9/23 12:00 PM ET)
    film: "/tv/drops/r-7423688ff693.mp4",
    poster: "/tv/drops/the-recipient-poster.jpg",
    tease: "/tv/drops/the-recipient-tease.mp4",
    cards: ["/tv/drops/card-1-ramp.jpg", "/tv/drops/card-2-backseat.jpg", "/tv/drops/card-3-coming-soon.jpg"],
    // Based on Brandon's account and the finished 15-second spec ad; no production-cost claim.
    noteTitle: "A whole operation. One bottle of cologne.",
    notes: [
      {
            "heading": "The brief",
            "text": "Make a 15-second cologne ad feel like a major action movie. This is a VNMSFX spec ad, built around that ambition."
      },
      {
            "heading": "Make the arrival matter",
            "text": "The cargo plane opens before the delivery is explained. All that scale raises one question: what needs this much attention?"
      },
      {
            "heading": "Give the product a role",
            "text": "The bottle travels with the characters before the final close-up. It is part of the journey, not just a logo added at the end."
      },
      {
            "heading": "Build the look first",
            "text": "I started with the visual direction, then generated the image assets. Dark clothes, wet streets and warm hotel light make the scenes feel part of one world."
      }
],
    takeaway: "A product feels important when the story treats it that way.",
  },
  {
    id: "youre-up",
    title: "You're Up.",
    tagline: "Frozen fries get a classified extraction.",
    liveFrom: "2026-09-17T08:00:00Z",   // posted Thu 9/17 ~4 AM ET; no rate window on this one
    early:    "2026-09-17T08:00:00Z",
    release:  "2026-09-17T08:00:00Z",
    close:    "2026-09-17T08:00:00Z",
    film: "/tv/spots/fries.mp4",
    poster: "/tv/spots/fries.jpg",
    tease: "/tv/spots/fries.mp4",
    cards: ["/tv/drops/youre-up-frame.jpg"],
    noteTitle: "", notes: [], takeaway: "",
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
