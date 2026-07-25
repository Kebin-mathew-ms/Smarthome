class GalleryItem {
  constructor({ id, company_id, image_path, caption, display_order, created_at }) {
    this.id = id;
    this.company_id = company_id;
    this.image_path = image_path;
    this.caption = caption;
    this.display_order = display_order || 0;
    this.created_at = created_at;
  }
}

module.exports = GalleryItem;
