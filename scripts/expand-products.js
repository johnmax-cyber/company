const fs = require('fs');

// Read existing products.json - only the valid first part
let existingContent = '';
try {
  existingContent = fs.readFileSync('products.json', 'utf8');
  // Find the end of valid JSON (first complete object)
  let braceCount = 0;
  let endIndex = 0;
  for (let i = 0; i < existingContent.length; i++) {
    if (existingContent[i] === '{') braceCount++;
    else if (existingContent[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }
  existingContent = existingContent.substring(0, endIndex);
} catch (err) {
  console.error('Error reading existing products.json:', err);
  process.exit(1);
}

let existingData;
try {
  existingData = JSON.parse(existingContent);
} catch (err) {
  console.error('Error parsing existing products.json:', err);
  process.exit(1);
}

// Generate 50 new products with IDs 31-80
const newProducts = [];

// Helper functions for generation
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return (Math.random() * (max - min) + min).toFixed(1);
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Image URLs using Unsplash
const imageBases = {
  men: [
    'https://images.unsplash.com/photo-1596755094514-8d4a8a3b2e7b?w=400',
    'https://images.unsplash.com/photo-1608749954927-6e0c8b2b2e7b?w=400',
    'https://images.unsplash.com/photo-1591047139829-9a864d7b2e7b?w=400',
    'https://images.unsplash.com/photo-1558011175-08c598a97908?w=400',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400'
  ],
  women: [
    'https://images.unsplash.com/photo-1595777707802-21b287d3f2ff?w=400',
    'https://images.unsplash.com/photo-1571268633221-0dfb1c1a0e0d?w=400',
    'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400',
    'https://images.unsplash.com/photo-1582142407261-cb835faf6bcc?w=400',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'
  ],
  children: [
    'https://images.unsplash.com/photo-1519340241574-d87c08999c77?w=400',
    'https://images.unsplash.com/photo-1503919545889-6f7ee89e1c31?w=400',
    'https://images.unsplash.com/photo-1512628772945-f9dcae28b2f9?w=400',
    'https://images.unsplash.com/photo-1519238263561-ed4c67851c0f?w=400',
    'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=400'
  ],
  books: [
    'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400',
    'https://images.unsplash.com/photo-1495446815901-a7297e3ffe2d?w=400',
    'https://images.unsplash.com/photo-1512820790803-83d5b814b5a6?w=400',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    'https://images.unsplash.com/photo-1581557399319-efa07b26a8b7?w=400'
  ]
};

// Product templates by subcategory
const templates = {
  'clothes men': [
    { name: 'Classic Fit Formal Shirt', price: 4500, sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Blue', 'Gray'] },
    { name: 'Premium Oxford Shirt', price: 5500, sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['White', 'Light Blue', 'Navy'] },
    { name: 'Cotton Chino Shorts', price: 2800, sizes: ['28', '30', '32', '34', '36'], colors: ['Khaki', 'Navy', 'Black'] },
    { name: 'Wool Blend Sweater Vest - Extra Long Name For Layout Testing', price: 6500, sizes: ['S', 'M', 'L', 'XL'], colors: ['Gray', 'Navy', 'Burgundy'] },
    { name: 'Leather Loafer Shoes', price: 8500, sizes: ['7', '8', '9', '10', '11', '12'], colors: ['Black', 'Brown'] },
    { name: 'Denim Jacket - Vintage Wash', price: 7500, sizes: ['S', 'M', 'L', 'XL'], colors: ['Blue', 'Black', 'Gray'] },
    { name: 'Silk Knit Tie', price: 1900, sizes: ['One Size'], colors: ['Navy', 'Burgundy', 'Gold'] },
    { name: 'Men\'s Wool Overcoat', price: 12000, sizes: ['M', 'L', 'XL'], colors: ['Black', 'Gray', 'Navy'] }
  ],
  'clothes women': [
    { name: 'Satin Blouse - Ivory', price: 3200, sizes: ['XS', 'S', 'M', 'L'], colors: ['Ivory', 'Black', 'Navy'] },
    { name: 'A-Line Midi Skirt', price: 2500, sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Navy', 'Burgundy'] },
    { name: 'High-Waisted Jeans', price: 3800, sizes: ['24', '26', '28', '30', '32'], colors: ['Blue', 'Black', 'Gray'] },
    { name: 'Cashmere Scarf', price: 2800, sizes: ['One Size'], colors: ['Gray', 'Navy', 'Cream'] },
    { name: 'Wrap Dress - Floral', price: 4500, sizes: ['XS', 'S', 'M', 'L'], colors: ['Floral', 'Solid Black'] },
    { name: 'Tailored Blazer - Navy', price: 5200, sizes: ['XS', 'S', 'M', 'L'], colors: ['Navy', 'Black', 'Gray'] },
    { name: 'Ankle Boots - Leather', price: 4200, sizes: ['6', '7', '8', '9', '10'], colors: ['Black', 'Brown'] },
    { name: 'Wide-Leg Trousers', price: 3500, sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Gray', 'Navy'] },
    { name: 'Knit Beanie - Wool', price: 1500, sizes: ['One Size'], colors: ['Gray', 'Navy', 'Burgundy'] },
    { name: 'Silk Camisole Top', price: 2200, sizes: ['XS', 'S', 'M', 'L'], colors: ['Ivory', 'Black', 'Red'] }
  ],
  'clothes children': [
    { name: 'Boys Dinosaur Pajamas', price: 1200, sizes: ['2-3', '4-5', '6-7', '8-9'], colors: ['Blue', 'Green', 'Red'] },
    { name: 'Girls Floral Dress', price: 1800, sizes: ['2-3', '4-5', '6-7'], colors: ['Pink', 'Yellow', 'Purple'] },
    { name: 'Kids Rain Jacket', price: 1500, sizes: ['XS', 'S', 'M', 'L'], colors: ['Yellow', 'Blue', 'Red'] },
    { name: 'Children\'s Wool Socks (3-pack)', price: 800, sizes: ['S', 'M', 'L'], colors: ['White', 'Gray', 'Navy'] },
    { name: 'Toddler Sneakers - Light Up', price: 2500, sizes: ['18', '19', '20', '21', '22'], colors: ['White', 'Blue', 'Pink'] },
    { name: 'Kids Sun Hat', price: 900, sizes: ['One Size'], colors: ['Pink', 'Blue', 'Green'] },
    { name: 'Baby Onesie - Set of 3', price: 1200, sizes: ['0-3m', '3-6m', '6-9m'], colors: ['White', 'Yellow', 'Green'] },
    { name: 'Children\'s Backpack', price: 3000, sizes: ['One Size'], colors: ['Blue', 'Red', 'Black'] }
  ],
  'books spiritual': [
    { name: 'SDA Hymnal - Pocket Edition', price: 800, pages: 256, language: 'English' },
    { name: 'Conflict of the Ages Series - Complete Set', price: 2800, pages: 1200, language: 'English' },
    { name: 'Prayer Warriors Handbook', price: 1800, pages: 320, language: 'English' },
    { name: 'Bible Commentary - Genesis to Revelation', price: 2200, pages: 800, language: 'English' },
    { name: 'Christ\'s Object Lessons', price: 1200, pages: 192, language: 'English' },
    { name: 'The Ministry of Healing', price: 1500, pages: 256, language: 'English' }
  ],
  'books fiction': [
    { name: 'The Faithful Shepherd', price: 1500, pages: 280, language: 'English' },
    { name: 'Whispers of the Heart - A Christian Romance Novel', price: 1300, pages: 320, language: 'English' },
    { name: 'Nairobi Nights', price: 1100, pages: 240, language: 'English' },
    { name: 'The Lost Treasure Adventure', price: 1600, pages: 200, language: 'English' },
    { name: 'Beneath the Acacia Tree', price: 1400, pages: 260, language: 'English' }
  ],
  'books textbooks': [
    { name: 'Kenya Mathematics Form 1 Textbook', price: 7500, pages: 400, language: 'English' },
    { name: 'English Grammar in Use - Advanced', price: 6200, pages: 350, language: 'English' },
    { name: 'Kiswahili Kitabu cha Kisomo Darasa la Saba', price: 5800, pages: 300, language: 'Swahili' },
    { name: 'World Geography for Secondary Students', price: 6800, pages: 450, language: 'English' }
  ],
  'books childrens': [
    { name: 'The Friendly Lion Storybook', price: 800, pages: 32, language: 'English' },
    { name: 'Colors Everywhere Picture Book', price: 600, pages: 24, language: 'English' },
    { name: '123 Counting Fun Book', price: 1000, pages: 40, language: 'English' },
    { name: 'Bible Stories for Little Ones', price: 900, pages: 48, language: 'English' },
    { name: 'My First Puzzle Activity Book', price: 1100, pages: 64, language: 'English' },
    { name: 'Animals of the Savannah Board Book', price: 1300, pages: 20, language: 'English' },
    { name: 'Daniel and the Lions Bible Story', price: 1200, pages: 36, language: 'English' },
    { name: 'The Good Samaritan Tale', price: 1400, pages: 32, language: 'English' },
    { name: 'Creation Story for Children', price: 1500, pages: 28, language: 'English' }
  ]
};

// Generate products
let productId = 31;
const ratings = [5.0, 4.9, 4.8, 4.7, 4.6, 4.5, 4.4, 4.3, 4.2, 4.1, 4.0, 3.9, 3.8, 3.7, 3.6, 3.5, 3.4, 3.3, 3.2, 3.1, 3.0, 2.9, 2.8, 2.7, 2.6, 2.5, 0];
const outOfStockIds = [35, 42, 48, 52, 57, 61, 66, 70, 74, 78]; // 10 out-of-stock

for (const [subcat, products] of Object.entries(templates)) {
  const [category, subcategory] = subcat.split(' ');
  const imageBase = imageBases[category] || imageBases.books;
  
  for (const template of products) {
    const numImages = getRandomInt(1, 5);
    const images = [];
    for (let i = 0; i < numImages; i++) {
      images.push(imageBase[getRandomInt(0, imageBase.length - 1)]);
    }
    
    const rating = getRandomElement(ratings);
    const reviewsCount = rating === 0 ? 0 : getRandomInt(5, 2000);
    
    let description = `A ${template.name.toLowerCase()} perfect for everyday use.`;
    if (Math.random() > 0.8) {
      description = `This is an exceptionally long description that tests how the layout handles very verbose product descriptions. It includes multiple sentences and even some HTML entities like &amp; &lt; &gt; to ensure proper escaping and rendering. The text should wrap nicely across different screen sizes and demonstrate how the UI adapts to content of varying lengths.\n\nAdditional details about quality, materials, and care instructions go here to make this a truly comprehensive test case for description rendering.`;
    }
    
    const product = {
      id: productId,
      name: template.name,
      category: category,
      subcategory: subcategory,
      price: template.price,
      compareAtPrice: Math.random() > 0.7 ? template.price * 1.2 : null,
      inStock: !outOfStockIds.includes(productId),
      images: images,
      description: description,
      sizes: template.sizes || [],
      colors: template.colors || [],
      tags: Math.random() > 0.5 ? [['New'], ['Sale'], ['Popular']][getRandomInt(0, 2)] : [],
      rating: rating,
      reviewsCount: reviewsCount,
      ...(template.pages && { pages: template.pages }),
      ...(template.language && { language: template.language })
    };
    
    newProducts.push(product);
    productId++;
  }
}

// Combine existing and new products - keep only first 30 existing + 50 new
const originalProducts = existingData.products.slice(0, 30);
const allProducts = {
  products: [...originalProducts, ...newProducts]
};

// Write to file
fs.writeFileSync('products.json', JSON.stringify(allProducts, null, 2));
console.log(`Generated ${newProducts.length} new products. Total: ${allProducts.products.length} products in products.json`);