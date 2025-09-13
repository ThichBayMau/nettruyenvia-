
/*
  chap.js - NetTruyenVia (updated)
  - Uses bypass(url, doc) to ensure images are present (handles referer/cookie/js render).
  - Picks data-original/data-src/src in that order.
  - Normalizes protocol and relative URLs.
  - Builds a fallback array by trying common CDN/server substitutions to increase chance of a good mirror.
*/

load('bypass.js');
load('config.js');

function normalizeUrl(base, link) {
  if (!link) return null;
  link = link.trim();
  if (link.indexOf('//') === 0) link = 'https:' + link;
  if (/^https?:\/\//i.test(link)) return link;
  // relative path
  if (link.indexOf('/') === 0) {
    return base.replace(/\/+$/, '') + link;
  }
  return base.replace(/\/+$/, '') + '/' + link;
}

function generateFallbacks(link) {
  var f = [];
  try {
    // try common patterns:
    // 1) numeric image servers: image1..., image2..., image3...
    var m = link.match(/(image)(\d+)(\.[a-z0-9\.-]+)/i);
    if (m) {
      for (var n = 1; n <= 5; n++) {
        var candidate = link.replace(m[0], m[1] + n + m[3]);
        if (candidate !== link) f.push(candidate);
      }
    }

    // 2) iXXX.truyenvua.com => try common i servers seen in other sites
    if (link.indexOf('truyenvua.com') > -1) {
      var common = ['i109.truyenvua.com','i125.truyenvua.com','i138.truyenvua.com','i200.truyenvua.com','i216.truyenvua.com'];
      for (var j = 0; j < common.length; j++) {
        var cand = link.replace(/\/\/?i\d+\.(truyenvua\.com)/i, '//' + common[j]);
        if (cand && cand !== link) f.push(cand);
      }
    }

    // 3) kcgsbok or other image CDNs with numeric suffixes: change trailing digit groups
    var m2 = link.match(/(image)(\d+)\.([a-z0-9\.-]+)/i);
    if (m2) {
      for (var k = 1; k <= 6; k++) {
        var cand2 = link.replace(m2[1] + m2[2], m2[1] + k);
        if (cand2 !== link) f.push(cand2);
      }
    }

    // 4) some sites host images on different hostnames (photruyen/tintruyen/qqtaku) -> try common replacements
    var replacements = [
      ['mangaqq.net','i200.truyenvua.com'],
      ['cdnqq.xyz','i200.truyenvua.com'],
      ['mangaqq.com','i216.truyenvua.com'],
      ['photruyen.com','i109.truyenvua.com'],
      ['tintruyen.com','i109.truyenvua.com'],
      ['tintruyen.net','i138.truyenvua.com'],
      ['qqtaku.com','i125.truyenvua.com']
    ];
    for (var r = 0; r < replacements.length; r++) {
      if (link.indexOf(replacements[r][0]) > -1) {
        f.push(link.replace(replacements[r][0], replacements[r][1]));
      }
    }

    // Deduplicate while preserving order
    var seen = {};
    var uniq = [];
    for (var ii = 0; ii < f.length; ii++) {
      if (f[ii] && !seen[f[ii]]) {
        uniq.push(f[ii]);
        seen[f[ii]] = true;
      }
    }
    return uniq;
  } catch (e) {
    return [];
  }
}

function execute(url) {
  // Normalize to configured base (config.js should define BASE_URL)
  try {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
  } catch (e) {
    // ignore and continue with original url
  }

  var doc = bypass(url, fetch(url).html());
  if (!doc) return null;

  // Select many possible image containers (some sites use different classes)
  var imgs = doc.select(".chapter_content img.lazy, .chapter_content img, .reading-content img, .page-chapter img, img");
  var data = [];

  for (var i = 0; i < imgs.size(); i++) {
    try {
      var e = imgs.get(i);
      var raw = e.attr("data-original") || e.attr("data-src") || e.attr("data-lazy") || e.attr("src");
      if (!raw) continue;
      var link = normalizeUrl(url, raw);

      // Build fallback list heuristically
      var fallback = generateFallbacks(link || raw);

      // As additional fallback, include original raw (normalized) if not already
      if (link && fallback.indexOf(link) === -1) fallback.unshift(link);

      data.push({
        link: link,
        fallback: fallback
      });
    } catch (err) {
      // ignore this image and continue
      console.log("chap.img.error: " + err);
    }
  }

  return Response.success(data);
}
