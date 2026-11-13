// Generado automáticamente por scripts/fetch-data.sh — no editar a mano.
// Volver a correr el script para refrescar estos datos.
const RAW_POSTS = [];
const POSTS_DATA = {
  fetchedAt: "2026-11-13T18:21:41Z",
  username: "mosaico.lab_",
  posts: RAW_POSTS.map(function (p) {
    return {
      id: p.pk,
      shortcode: p.shortcode,
      date: p.date,
      type: p.type,
      productType: p.product_type,
      likes: p.like_count,
      comments: p.comment_count,
      views: p.view_count,
      caption: p.caption,
      image: p.image,
      url: p.post_url
    };
  })
};
