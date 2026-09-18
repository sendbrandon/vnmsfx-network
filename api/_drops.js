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
    liveFrom: "2026-09-17T12:00:00Z",   // countdown + drop rate open  (Thu 9/17 8:00 AM ET)
    early:    "2026-09-20T16:00:00Z",   // pass holders emailed the film (Sun 9/20 12:00 PM ET)
    release:  "2026-09-21T16:00:00Z",   // public                        (Mon 9/21 12:00 PM ET)
    close:    "2026-09-23T16:00:00Z",   // drop rate closes              (Wed 9/23 12:00 PM ET)
    film: "/tv/drops/r-7423688ff693.mp4",
    poster: "/tv/drops/the-recipient-poster.jpg",
    tease: "/tv/drops/the-recipient-tease.mp4",
    cards: ["/tv/drops/card-1-ramp.jpg", "/tv/drops/card-2-backseat.jpg", "/tv/drops/card-3-coming-soon.jpg"],
    // Season Pass promises 01 + 02 — the brief the spot answered, and what it took. DRAFT, pending Brandon's sign-off.
    brief: "Every fragrance ad shows you the bottle. So nobody looks. We shot this one like something you’re not supposed to have: never named, never explained, logo on the last frame only. You look.",
    // THE SAUCE — what pass holders get with this drop. Placeholders block the send (see _drop-mail.js ready()).
    sauce: {
      label: "DROP 01 · WHERE THE IDEA CAME FROM",
      lines: [
        "TBD — the observation that started it (what everyone in the category does)",
        "TBD — the tension we found in it (why that stops people looking)",
        "TBD — the idea in one line, and the rule that protected it (nothing named until the last frame)",
        "TBD — the stack that built it, excerpted (world, scenes, the handoff beat)",
      ],
    },
    took: "Fifteen seconds usually buys one room and a product shot. This one needed a cargo plane, a back seat and a hotel bathroom. One week, three actors, one line of dialogue, and the house look on top: 35mm grain, halation, anamorphic squeeze.",
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
