load('bypass.js');
load('config.js');

function execute(url, page) {
    if (!page) page = '1';

    // Chuẩn hoá URL, bỏ đuôi .html rồi thêm số trang
    url = url.replace(".html", "") + "/trang-" + page + ".html";

    // Fetch với bypass
    var fullUrl = BASE_URL + url;
    var doc = bypass(fullUrl, fetch(fullUrl).html());
    if (!doc) return null;

    var novelList = [];
    // Lấy nút next page
    var next = doc.select(".page_redirect a:has(p.active) + a").last().text();

    // Duyệt danh sách truyện
    doc.select("#main_homepage .list_grid li, .ModuleContent .items .item").forEach(e => {
        var cover = e.select(".book_avatar img, .image img").attr("src");
        if (cover.startsWith("//")) {
            cover = "https:" + cover;
        } else if (cover.startsWith("/")) {
            cover = BASE_URL + cover;
        }

        novelList.push({
            name: e.select(".book_name, h3.title a").text(),
            link: e.select(".book_name a, h3.title a").first().attr("href"),
            description: e.select(".last_chapter, .chapter-text").text(),
            cover: cover,
            host: BASE_URL
        });
    });

    return Response.success(novelList, next);
}
