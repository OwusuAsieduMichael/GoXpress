# Image Reorganization Guide

Since all images are mismatched, here's the easiest way to fix them:

## Step 1: Create a Temporary Folder

```bash
mkdir frontend/public/products/temp
```

## Step 2: Move All Images to Temp

Move all images from food/, groceries/, and gadgets/ folders into the temp folder:

```bash
# Windows PowerShell
Move-Item frontend/public/products/food/* frontend/public/products/temp/
Move-Item frontend/public/products/groceries/* frontend/public/products/temp/
Move-Item frontend/public/products/gadgets/* frontend/public/products/temp/
```

## Step 3: Rename Images Based on What They Actually Show

Now you have all images in one place. Open the temp folder and rename each image based on what it actually shows:

### Food Items (what the image actually shows):
- If image shows **jollof rice** → rename to `FD001.jpg`
- If image shows **waakye** → rename to `FD002.jpg`
- If image shows **banku flour/mix** → rename to `FD003.jpg`
- If image shows **fufu flour** → rename to `FD004.jpg`
- If image shows **kenkey balls** → rename to `FD005.jpg`
- If image shows **kelewele/spiced plantain chips** → rename to `FD006.jpg`
- If image shows **mild shito sauce** → rename to `FD007.jpg`
- If image shows **hot shito sauce** → rename to `FD008.jpg`
- If image shows **salted plantain chips** → rename to `FD009.jpg`
- If image shows **spicy plantain chips** → rename to `FD010.jpg`
- If image shows **coconut toffee/candy** → rename to `FD011.jpg`
- If image shows **groundnut brittle** → rename to `FD012.jpg`
- If image shows **sobolo/hibiscus drink** → rename to `FD013.jpg`
- If image shows **asaana drink** → rename to `FD014.jpg`
- If image shows **tigernut drink** → rename to `FD015.jpg`
- If image shows **milo drink bottle** → rename to `FD016.jpg`
- If image shows **tom brown cereal** → rename to `FD017.jpg`
- If image shows **hausa koko mix** → rename to `FD018.jpg`
- If image shows **koose/bean mix** → rename to `FD019.jpg`
- If image shows **gari** → rename to `FD020.jpg`

### Groceries (what the image actually shows):
- If image shows **Nhyira rice bag** → rename to `GR001.jpg`
- If image shows **KDM rice** → rename to `GR002.jpg`
- If image shows **Daibon rice** → rename to `GR003.jpg`
- If image shows **Royal Umbrella rice** → rename to `GR004.jpg`
- If image shows **Tilemsi basmati rice** → rename to `GR005.jpg`
- If image shows **Peacock rice** → rename to `GR006.jpg`
- If image shows **Frytol oil** → rename to `GR007.jpg`
- If image shows **Nkulenu palm soup** → rename to `GR008.jpg`
- If image shows **Tasty Tom sachet** → rename to `GR009.jpg`
- If image shows **Lele corned beef can** → rename to `GR010.jpg`
- If image shows **Cowbell milk powder** → rename to `GR011.jpg`
- If image shows **Tetley green tea** → rename to `GR012.jpg`
- If image shows **groundnuts/peanuts pack** → rename to `GR013.jpg`
- If image shows **Golden Morn cereal** → rename to `GR014.jpg`
- If image shows **tigernut gari** → rename to `GR015.jpg`
- If image shows **sweet potato gari** → rename to `GR016.jpg`
- If image shows **Gevans water bottles** → rename to `GR017.jpg`
- If image shows **kitchen roll/paper towel** → rename to `GR018.jpg`
- If image shows **toilet tissue rolls** → rename to `GR019.jpg`
- If image shows **oyster sauce bottle** → rename to `GR020.jpg`

### Home Gadgets (what the image actually shows):
- If image shows **Samsung 32" N5000 TV** → rename to `HG001.jpg`
- If image shows **Samsung 32" T5300 Smart TV** → rename to `HG002.jpg`
- If image shows **LG 32" Smart TV** → rename to `HG003.jpg`
- If image shows **Nasco 43" TV** → rename to `HG004.jpg`
- If image shows **TCL 43" TV** → rename to `HG005.jpg`
- If image shows **Asano 32" TV** → rename to `HG006.jpg`
- If image shows **Acutec 32" TV** → rename to `HG007.jpg`
- If image shows **Smeco 32" TV** → rename to `HG008.jpg`
- If image shows **Vizio 32" TV** → rename to `HG009.jpg`
- If image shows **Starlife 32" TV** → rename to `HG010.jpg`
- If image shows **4G mobile wifi hotspot** → rename to `HG011.jpg`
- If image shows **MTN 4G router** → rename to `HG012.jpg`
- If image shows **Samsung 32GB USB-C** → rename to `HG013.jpg`
- If image shows **Samsung 64GB USB-C** → rename to `HG014.jpg`
- If image shows **wireless keyboard mouse** → rename to `HG015.jpg`
- If image shows **electric kettle** → rename to `HG016.jpg`
- If image shows **blender** → rename to `HG017.jpg`
- If image shows **air fryer** → rename to `HG018.jpg`
- If image shows **microwave oven** → rename to `HG019.jpg`
- If image shows **rechargeable fan** → rename to `HG020.jpg`

## Step 4: Move Renamed Images Back to Correct Folders

After renaming all images in the temp folder:

```bash
# Move food images back
Move-Item frontend/public/products/temp/FD*.jpg frontend/public/products/food/

# Move groceries images back
Move-Item frontend/public/products/temp/GR*.jpg frontend/public/products/groceries/

# Move gadgets images back
Move-Item frontend/public/products/temp/HG*.jpg frontend/public/products/gadgets/

# Delete temp folder
Remove-Item frontend/public/products/temp
```

## Step 5: Refresh Browser

Hard refresh your browser (Ctrl + Shift + R) and all images should now match their products!

---

## Quick Tip

If you're not sure what a product should look like, refer to the `PRODUCT_LIST_FOR_IMAGES.md` file which has descriptions and search terms for each product.
