# Timelines

Viewing orders for franchises. One page (`index.html`). The content lives in `data/`.

## Add an entry

Open the franchise's file in `data/` and add a line where it belongs. The order in the file is the order on the timeline.

```js
{ title: "Rogue One", info: "A Star Wars Story", year: "2016", tag: "movie" },
```

| field    | shown as                                      |
|----------|-----------------------------------------------|
| `title`  | big white line                                |
| `info`   | grey line underneath                          |
| `year`   | appended to `info` in brackets, or on its own |
| `tag`    | icon in the bullet + filter (see below)       |
| `items`  | list of strings with chevrons                 |
| `groups` | several labelled lists: `[{ name: "Arrow", items: ["Staffel 1"] }]` |
| `url`    | turns the title into a link                   |

Only `title` is required. Entries without a `tag` are always shown, even while a filter is active.

## Add a franchise

1. Create `data/<id>.js`:

   ```js
   Timelines.add({
     id: "lotr",
     title: "Der Herr der Ringe",
     image: "images/lotr.jpg",
     entries: [
       { title: "Die Ringe der Macht", info: "Staffel 1", year: "2022", tag: "series" },
       { title: "Die Gefährten", year: "2001", tag: "movie" }
     ]
   });
   ```

2. Add `"lotr"` to `Timelines.franchises` in `data/config.js`. That list sets the carousel order.

`image` is optional. Without one, the carousel shows a grey tile with the title. Square images work best.

## Tags

Tags are defined in `data/config.js` (`movie`, `series`, `special`, `game`, `book`). To add a new tag, add a line there with a label and a [Material Icons](https://fonts.google.com/icons) name. The filter only lists the tags a franchise actually uses, and it stays hidden when there's only one.

## Links

`index.html#mcu` opens a specific franchise. The old `sites/*.html` URLs redirect there.

## Running locally

Open `index.html` directly in the browser. No server or build step is needed.
