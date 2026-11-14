// Edit this file to add or update papers. Newest first.
//
// type:    "conference" | "journal" | "preprint"  (used by the filter)
// status:  "published" | "accepted" | "under-review" | "preprint" | "in-preparation"
// arxiv:   arXiv ID, used for the live citation count from INSPIRE-HEP
// citations: fallback count shown if the live lookup fails
// authors: mark yourself with a leading "*" to highlight your name
// links:   any label -> URL (slides and posters live in files/)
// image: optional local conference/journal artwork; imageAlt describes it.
// imageTone: "dark" for white artwork, "photo" for banners; omit for white panels.

const PUBLICATIONS = [
  {
    title: "Optimal Error Exponents for Composite Sequential Quantum Hypothesis Testing",
    authors: ["*Jacob Paul Simpson", "Efstratios Palias", "Sharu Theresa Jose"],
    venue: "2026 IEEE Information Theory Workshop",
    image: "images/venues/itw2026-original.jpg",
    imageWidth: 2107, imageHeight: 992, imageViewBox: "6 11 1410 967",
    imageAlt: "ITW 2026 — Information Theory Workshop, Tempe, Arizona",
    location: "Tempe, Arizona, USA",
    year: 2026,
    type: "conference",
    status: "accepted",
    arxiv: "2605.04915",
    citations: 3,
    links: {
      arXiv: "https://arxiv.org/abs/2605.04915",
      Slides: "files/itw2026-slides.pdf",
    },
  },
  {
    title: "Sample Complexity of Composite Quantum Hypothesis Testing",
    authors: ["*Jacob Paul Simpson", "Efstratios Palias", "Sharu Theresa Jose"],
    venue: "2026 IEEE International Symposium on Information Theory",
    image: "images/venues/isit2026-original.jpg",
    imageWidth: 2197, imageHeight: 992, imageViewBox: "0 98 2197 796",
    imageAlt: "ISIT 2026 conference logo",
    location: "Guangzhou, China",
    year: 2026,
    type: "conference",
    status: "published",
    arxiv: "2601.08588",
    citations: 2,
    links: {
      "IEEE Xplore": "https://ieeexplore.ieee.org/document/11654009",
      arXiv: "https://arxiv.org/abs/2601.08588",
      Slides: "files/isit2026-slides.pdf",
      Poster: "files/isit2026-poster.pdf",
    },
  },

  // Template — copy, fill in and uncomment:
  // {
  //   title: "Paper title",
  //   authors: ["*Jacob Paul Simpson", "Co-author"],
  //   venue: "Journal or conference name",
  //   location: "",
  //   year: 2027,
  //   type: "journal",
  //   status: "under-review",
  //   arxiv: "",
  //   citations: 0,
  //   links: { arXiv: "", "IEEE Xplore": "", Slides: "", Poster: "" },
  // },
];
