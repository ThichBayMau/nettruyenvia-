/*
  bypass.js - NetTruyenVia
  Mục tiêu:
  - Trả về `doc` có chứa <img> nếu fetch ban đầu đã có ảnh.
  - Nếu không có (site trả JS / challenge / bị block), thử các bước:
      1) kiểm tra document.cookie style (như TruyenQQ) và refetch với Cookie
      2) refetch với header Referer + User-Agent
      3) dùng Engine.newBrowser() để render JS (fallback cuối cùng)
  - Trả về Document object cuối cùng (doc / rdoc / bdoc).
*/

function bypass(url, doc) {
  try {
    // 1) nếu đã có ảnh trong doc -> trả về luôn
    try {
      var imgs = doc.select(".reading-content img, .chapter-content img, .page-chapter img, img");
      if (imgs && imgs.size() > 0) return doc;
    } catch (e) {
      // nếu doc.select không tồn tại hoặc lỗi, bỏ qua
    }

    // 2) Kiểm tra kiểu challenge giống TruyenQQ: document.cookie = "..."
    try {
      var html = doc.html();
      var m = html.match(/document\.cookie\s*=\s*['"]([^'"]+)['"]/i);
      if (m && m[1]) {
        var cookie = m[1];
        try {
          var refetched = Http.get(url).headers({ "Cookie": cookie }).html();
          var imgs2 = refetched.select("img");
          if (imgs2 && imgs2.size() > 0) return refetched;
          // nếu không có ảnh, tiếp tục các bước khác
          doc = refetched;
        } catch (e) {
          // ignore and continue
        }
      }
    } catch (e) {
      // ignore
    }

    // 3) Thử fetch lại với Referer và User-Agent (nhiều CDN kiểm tra Referer)
    try {
      var tryHeaders = { "Referer": url, "User-Agent": UserAgent.android() };
      var rdoc = Http.get(url).headers(tryHeaders).html();
      var imgs3 = rdoc.select("img");
      if (imgs3 && imgs3.size() > 0) return rdoc;
      // cập nhật doc để thử các bước tiếp theo
      doc = rdoc;
    } catch (e) {
      // ignore
    }

    // 4) Fallback: render bằng Browser (Engine.newBrowser) để chạy JS và load tài nguyên
    try {
      var browser = Engine.newBrowser();
      // Chọn user-agent phù hợp (android/desktop nếu cần)
      browser.setUserAgent(UserAgent.android());
      browser.launch(url, 15000); // timeout 15s
      var bdoc = browser.html();
      browser.close();
      // Nếu browser trả về doc có ảnh -> trả về
      try {
        var bimgs = bdoc.select("img");
        if (bimgs && bimgs.size() > 0) return bdoc;
      } catch (e) {
        // ignore
      }
      // nếu không có ảnh, trả bdoc (hoặc doc nếu bdoc undefined)
      return bdoc || doc;
    } catch (e) {
      console.log("bypass.browser.error: " + e);
      return doc;
    }
  } catch (e) {
    console.log("bypass.error: " + e);
    return doc;
  }
}
