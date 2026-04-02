# Product Images Setup Guide

## Step-by-Step Instructions

### 1. Create Folder Structure

Create these folders in your frontend:

```
frontend/public/products/food/
frontend/public/products/groceries/
frontend/public/products/gadgets/
```

### 2. Upload Your Images

Place your downloaded images in the appropriate folders:

- **Food items (FD001-FD020)** → `frontend/public/products/food/`
- **Groceries (GR001-GR020)** → `frontend/public/products/groceries/`
- **Home Gadgets (HG001-HG020)** → `frontend/public/products/gadgets/`

**Naming Convention:** Use the SKU code as the filename
- Examples: `FD001.jpg`, `GR015.jpg`, `HG008.jpg`
- Supported formats: `.jpg`, `.jpeg`, `.png`

### 3. Update Database

After uploading all images, run the migration script to update the database:

```bash
cd backend
psql $DATABASE_URL -f sql/010_update_product_images.sql
```

Or connect to your database and run the SQL commands from `backend/sql/010_update_product_images.sql`

### 4. Verify Images Display

1. Refresh your frontend at http://localhost:5174
2. Navigate to Products or POS page
3. Images should now display instead of placeholders

## Troubleshooting

**Images not showing?**
- Check file names match SKU codes exactly (case-sensitive)
- Verify images are in correct folders
- Check browser console for 404 errors
- Ensure image file extensions match (.jpg vs .png)

**Mixed formats?**
If some images are JPG and others PNG, you'll need to update the SQL script to handle both, or convert all to one format.

## Quick Commands

Create folders (run from project root):
```bash
mkdir -p frontend/public/products/food
mkdir -p frontend/public/products/groceries
mkdir -p frontend/public/products/gadgets
```

Check if images are in place:
```bash
ls frontend/public/products/food/
ls frontend/public/products/groceries/
ls frontend/public/products/gadgets/
```
