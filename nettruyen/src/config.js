let BASE_URL = 'https://nettruyenvia.com';
try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
} catch (error) {
    // Ignore if CONFIG_URL is not defined
}
