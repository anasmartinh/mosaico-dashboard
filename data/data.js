// Generado automáticamente por scripts/fetch-data.sh — no editar a mano.
// Volver a correr el script para refrescar estos datos.
const RAW_POSTS = [{
  "pk": "3955633317445974423",
  "shortcode": "DblO4tcETmX",
  "date": "2026-08-03T14:44:19.000Z",
  "type": "Image",
  "product_type": "carousel_container",
  "like_count": 120,
  "comment_count": 19,
  "view_count": null,
  "caption": "🌀 nuevo taller de bordado 🌀\n\nEn esta edición, nos juntamos para seguir ayudando a las comunidades más afectadas después del 24 de junio. Por eso, destinaremos el 15% de las ganancias a donaciones directas a @yummy.vzla \n\nSi quieres más info, déjanos un comentario y te mandamos la info al dm ✨🪡",
  "image": "https://scontent-sea5-1.cdninstagram.com/v/t51.82787-15/764539802_17958743439198503_7334520882429266717_n.jpg?stp=c0.160.1280.1280a_dst-jpg_e35_s1080x1080_sh2.08_tt6&_nc_ht=scontent-sea5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2gEk9sy3tQoDFK4k_PPo174NOiVycDdA6X2g7nZ9455pnitE2ZyaGfmPrVAwj-mgfKM&_nc_ohc=laYnwjKRe2YQ7kNvwGgdfvE&_nc_gid=tntU3rSn5HeWMrLn0XcXFQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AQK6IyIapFXmyBIKN4tRGWISnCSOq54OmF555ciFWNxJNg&oe=6A9898E0&_nc_sid=7a9f4b",
  "post_url": "https://www.instagram.com/p/DblO4tcETmX/"
}];
const POSTS_DATA = {
  fetchedAt: "2026-08-29T11:06:03Z",
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
