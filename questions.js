// Front door questions for the homepage.
//
// Add a question by giving it an id under `questions`.
// Change `start` to choose which question shows first.
//
// Each option does one thing:
//   href: "page.html"     open a page (relative or absolute URL)
//   next: "question-id"   ask another question from this file
// If an option includes both, href wins and the page opens.
//
// Example of a follow-up you can paste in later:
//
// "which-vibe": {
//   prompt: "What kind of visit?",
//   lede: "One more question.",
//   options: [
//     { label: "The games", emoji: "🎮", href: "games.html" },
//     { label: "The list", emoji: "🎁", href: "christmas.html" },
//     { label: "Start over", next: "here-for" }
//   ]
// }
//
// Then point an option at it with next: "which-vibe".

window.EASTON_GATE_CONFIG = {
  start: "here-for",

  questions: {
    "here-for": {
      prompt: "What are you here for?",
      lede: "Pick one. You can switch later.",
      options: [
        {
          label: "Pleasure / games",
          detail: "Easton's Games. One live, two still plotting.",
          emoji: "🎮",
          href: "games.html"
        },
        {
          label: "Christmas list",
          detail: "The wish list, and a place to request something.",
          emoji: "🎁",
          href: "christmas.html"
        }
      ]
    }
  }
};
