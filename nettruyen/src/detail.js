load('bypass.js');
load('config.js');

function execute(url) {
    // Chuẩn hóa URL để luôn dùng BASE_URL
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    // Fetch trang và áp dụng bypass
    var doc = bypass(url, Http.get(url).html());
    if (!doc) return null;

    // Lấy ảnh cover
    var cover = doc.select(".book_avatar img, .thumb img").first().attr("src");
    if (cover && cover.startsWith("//")) {
        cover = "https:" + cover;
    } else if (cover && cover.startsWith("/")) {
        cover = BASE_URL + cover;
    }

    // Lấy tên tác giả (thường ở mục "Tác giả")
    var author = doc.select("a.org, .author a, .info-item.author a").text();

    // Lấy mô tả truyện
    var description = doc.select("div.story-detail-info, .detail-content, .summary").html();

    // Thông tin chi tiết (genre, trạng thái,...)
    var detailInfo = doc.select(".book_info div.txt, .info .other-info").first().html();

    // Kiểm tra trạng thái ongoing
    var isOngoing = false;
    var statusBlock = doc.select(".book_info div.txt, .info .status").text();
    if (statusBlock && statusBlock.toLowerCase().indexOf("đang") >= 0) {
        isOngoing = true;
    }

    return Response.success({
        name: doc.select("h1[itemprop=name], h1.title-detail, h1").first().text(),
        cover: cover,
        host: BASE_URL,
        author: author,
        description: description,
        detail: detailInfo,
        ongoing: isOngoing
    });
}
