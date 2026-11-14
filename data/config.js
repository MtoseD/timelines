// Franchises, in carousel order. Each id loads data/<id>.js.
// The first one is shown when the page opens without a #hash.
Timelines.franchises = [
  "starwars",
  "mcu",
  "xmen",
  "arrowverse",
  "witcher"
];

// Tags an entry can have (entry.tag). The key is what goes in the data file,
// label is shown in the filter, icon is a Material Icons name and shows
// up inside the timeline bullet. Add a line here to make a new tag.
Timelines.tags = {
  movie:   { label: "Filme",    icon: "movie" },
  series:  { label: "Serien",   icon: "tv" },
  special: { label: "Specials", icon: "star_border" },
  game:    { label: "Spiele",   icon: "sports_esports" },
  book:    { label: "Bücher",   icon: "menu_book" }
};
