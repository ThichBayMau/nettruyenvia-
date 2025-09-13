load('bypass.js');
load('config.js');

function execute(key, page) {
    if (!page) page = '1';

    // URL tìm kiếm
    var url = BASE_URL + "/tim-kiem/trang-" + page + ".html?q=" + encodeURIComponent(key);
    
    // Fetch nội dung qua bypass
    var doc = bypass(url, fetch(url).html());

    if (doc) {
        var novelList = [];
        var next = doc.select(".page_redirect a:has(p.active) + a").last().text();

        // Lặp qua danh sách truyện trả về
        doc.select("#main_homepage .list_grid li, .ModuleContent .items .item").forEach(e => {
            var cover = e.select(".book_avatar img, .image img").attr("src");

            // Chuẩn hoá URL ảnh bìa
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

    return null;
}
