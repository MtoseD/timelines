// Builds the carousel and timeline from data/*.js.
// Nothing in here needs editing to add franchises or entries; see README.md.

window.Timelines = {
  franchises: [],
  tags: {},
  data: {},
  add: function (franchise) {
    this.data[franchise.id] = franchise;
  }
};

(function () {
  var T = window.Timelines;
  var current = null;          // id of the franchise on screen
  var activeTags = {};         // tag -> true; empty means "show everything"
  var carousel = null;
  var order = [];              // franchise ids in carousel DOM order

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(name, extra) {
    return el('i', 'material-icons' + (extra ? ' ' + extra : ''), name);
  }

  // ---- loading ---------------------------------------------------------

  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () {
        console.warn('Timelines: could not load ' + src);
        resolve();
      };
      document.head.appendChild(s);
    });
  }

  function loadAll() {
    return Promise.all(T.franchises.map(function (id) {
      return loadScript('data/' + id + '.js');
    })).then(function () {
      return T.franchises.filter(function (id) {
        if (!T.data[id]) console.warn('Timelines: data/' + id + '.js did not call Timelines.add with id "' + id + '"');
        return !!T.data[id];
      });
    });
  }

  // ---- carousel --------------------------------------------------------

  function buildCarousel(ids, startId) {
    // Rotate the ring so the starting franchise sits in front.
    // The carousel wraps around, so the neighbours stay the same.
    var i = ids.indexOf(startId);
    order = ids.slice(i).concat(ids.slice(0, i));

    var root = document.getElementById('carousel');
    order.forEach(function (id) {
      var f = T.data[id];
      var a = el('a', 'carousel-item');
      a.href = '#' + id;
      a.dataset.id = id;
      a.title = f.title;
      if (f.image) {
        var img = el('img');
        img.src = f.image;
        img.alt = f.title;
        a.appendChild(img);
      } else {
        a.classList.add('carousel-tile');
        a.appendChild(el('span', null, f.title));
      }
      root.appendChild(a);
    });

    var pending;
    carousel = M.Carousel.init(root, {
      onCycleTo: function (item) {
        // Fires repeatedly while dragging past items; render once it settles.
        clearTimeout(pending);
        pending = setTimeout(function () { show(item.dataset.id); }, 120);
      }
    });
  }

  // ---- filter ----------------------------------------------------------

  function tagsIn(franchise) {
    var counts = {};
    franchise.entries.forEach(function (e) {
      if (e.tag) counts[e.tag] = (counts[e.tag] || 0) + 1;
    });
    // Keep the order from config.js, unknown tags at the end.
    var known = Object.keys(T.tags).filter(function (t) { return counts[t]; });
    var unknown = Object.keys(counts).filter(function (t) { return !T.tags[t]; });
    return known.concat(unknown).map(function (t) { return { tag: t, count: counts[t] }; });
  }

  function effectiveFilter(present) {
    return present.filter(function (p) { return activeTags[p.tag]; }).map(function (p) { return p.tag; });
  }

  function renderFilter(franchise) {
    var bar = document.getElementById('filter');
    bar.textContent = '';
    var present = tagsIn(franchise);
    if (present.length < 2) { bar.hidden = true; return; }
    bar.hidden = false;

    var on = effectiveFilter(present);
    present.forEach(function (p) {
      var def = T.tags[p.tag] || { label: p.tag, icon: 'label' };
      var b = el('button', 'filter-tag');
      b.type = 'button';
      b.setAttribute('aria-pressed', on.indexOf(p.tag) !== -1);
      b.appendChild(icon(def.icon));
      b.appendChild(el('span', null, def.label));
      b.appendChild(el('span', 'filter-count', p.count));
      b.addEventListener('click', function () {
        if (activeTags[p.tag]) delete activeTags[p.tag];
        else activeTags[p.tag] = true;
        render();
      });
      bar.appendChild(b);
    });
  }

  // ---- timeline --------------------------------------------------------

  function list(items) {
    var ul = el('ul', 'grey-text');
    items.forEach(function (text) {
      var li = el('li');
      li.appendChild(icon('chevron_right', 'tiny'));
      li.appendChild(document.createTextNode(' ' + text));
      ul.appendChild(li);
    });
    return ul;
  }

  function subline(e) {
    if (e.info && e.year) return e.info + ' (' + e.year + ')';
    return e.info || e.year || '';
  }

  function eventNode(e) {
    var event = el('div', 'timeline-event');
    var card = el('div', 'card timeline-content');
    var body = el('div', 'card-content');

    var title = el('span', 'card-title grey-text text-lighten-5');
    if (e.url) {
      var a = el('a', 'link', e.title);
      a.href = e.url;
      a.target = '_blank';
      a.rel = 'noopener';
      title.appendChild(a);
    } else {
      title.textContent = e.title;
    }
    body.appendChild(title);

    var sub = subline(e);
    if (sub) body.appendChild(el('p', 'grey-text text-lighten-1', sub));
    if (e.items) body.appendChild(list(e.items));
    (e.groups || []).forEach(function (g) {
      body.appendChild(el('p', 'grey-text text-lighten-1', g.name));
      body.appendChild(list(g.items));
    });

    card.appendChild(body);
    event.appendChild(card);

    var badge = el('div', 'timeline-badge grey darken-3');
    var def = e.tag && T.tags[e.tag];
    badge.appendChild(icon(def ? def.icon : ''));
    if (def) badge.title = def.label;
    event.appendChild(badge);
    return event;
  }

  function render() {
    var f = T.data[current];
    document.title = f.title + ' - Timeline';
    renderFilter(f);

    var on = effectiveFilter(tagsIn(f));
    var root = document.getElementById('timeline');
    root.textContent = '';
    // Re-render instead of hiding, so the left/right alternation and the
    // first/last connector lines stay correct after filtering.
    f.entries.forEach(function (e) {
      // Untagged entries (like a "more" link) are always shown.
      if (on.length && e.tag && on.indexOf(e.tag) === -1) return;
      root.appendChild(eventNode(e));
    });
  }

  function show(id) {
    if (!T.data[id] || id === current) return;
    current = id;
    if (location.hash !== '#' + id) {
      // Some browsers refuse replaceState on file:// pages.
      try { history.replaceState(null, '', '#' + id); }
      catch (err) { location.hash = id; }
    }
    render();
  }

  // ---- start -----------------------------------------------------------

  document.addEventListener('DOMContentLoaded', function () {
    loadAll().then(function (ids) {
      if (!ids.length) return;
      var fromHash = location.hash.slice(1);
      var start = ids.indexOf(fromHash) !== -1 ? fromHash : ids[0];
      buildCarousel(ids, start);
      show(start);

      window.addEventListener('hashchange', function () {
        var id = location.hash.slice(1);
        var i = order.indexOf(id);
        if (i !== -1 && id !== current) carousel.set(i);
      });
    });
  });
})();
