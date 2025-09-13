load('bypass.js');
load('config.js');

function execute(url) {
    // Chuẩn hóa domain sang BASE_URL
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    // Fetch nội dung trang truyện thông qua bypass
    var doc = bypass(url, Http.get(url).html());

    if (doc) {
        var list = [];

        // Lấy danh sách chương, đảo ngược từ chương cũ -> mới
        var el = doc.select(".works-chapter-list a, .list-chapter li a");
        for (var i = el.size() - 1; i >= 0; i--) {
            var e = el.get(i);
            list.push({
                name: e.text().trim(),
                url: e.attr("href"),
                host: BASE_URL
            });
        }

        return Response.success(list);
    }

    return null;
}
