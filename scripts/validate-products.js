const fs = require('fs');

// Read and validate products.json
try {
  const data = JSON.parse(fs.readFileSync('products.json', 'utf8'));
  const products = data.products;

  console.log(`Validating ${products.length} products...`);

  let errors = [];
  let warnings = [];

  // Check basic structure
  if (!Array.isArray(products)) {
    errors.push('Products should be an array');
  }

  products.forEach((product, index) => {
    const id = product.id || `index_${index}`;

    // Required fields
    const requiredFields = ['id', 'name', 'category', 'subcategory', 'price', 'inStock', 'images'];
    requiredFields.forEach(field => {
      if (product[field] === undefined) {
        errors.push(`Product ${id}: Missing required field '${field}'`);
      }
    });

    // ID uniqueness
    const duplicates = products.filter(p => p.id === product.id);
    if (duplicates.length > 1) {
      errors.push(`Product ${id}: Duplicate ID`);
    }

    // Price validation
    if (typeof product.price !== 'number' || product.price <= 0) {
      errors.push(`Product ${id}: Invalid price ${product.price}`);
    }

    // Images validation
    if (!Array.isArray(product.images) || product.images.length === 0) {
      errors.push(`Product ${id}: Images should be non-empty array`);
    } else {
      product.images.forEach((img, imgIndex) => {
        if (typeof img !== 'string' || !img.startsWith('https://')) {
          errors.push(`Product ${id}: Invalid image URL at index ${imgIndex}`);
        }
      });
    }

    // Arrays validation
    ['sizes', 'colors', 'tags'].forEach(field => {
      if (product[field] && !Array.isArray(product[field])) {
        errors.push(`Product ${id}: ${field} should be an array`);
      }
    });

    // Rating validation
    if (product.rating !== undefined && (product.rating < 0 || product.rating > 5)) {
      errors.push(`Product ${id}: Invalid rating ${product.rating}`);
    }

    // Warnings for edge cases
    if (product.name && product.name.length > 60) {
      warnings.push(`Product ${id}: Very long name (${product.name.length} chars)`);
    }
    if (product.description && product.description.length > 200) {
      warnings.push(`Product ${id}: Very long description (${product.description.length} chars)`);
    }
    if (product.images && product.images.length >= 4) {
      warnings.push(`Product ${id}: Many images (${product.images.length})`);
    }
    if (product.sizes && product.sizes.length > 10) {
      warnings.push(`Product ${id}: Many sizes (${product.sizes.length})`);
    }
    if (product.colors && product.colors.length > 10) {
      warnings.push(`Product ${id}: Many colors (${product.colors.length})`);
    }
    if (product.price < 500) {
      warnings.push(`Product ${id}: Very low price (${product.price})`);
    }
    if (product.price > 20000) {
      warnings.push(`Product ${id}: Very high price (${product.price})`);
    }
  });

  // Summary
  console.log(`\nValidation complete:`);
  console.log(`- Errors: ${errors.length}`);
  console.log(`- Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  ${e}`));
  }

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.slice(0, 10).forEach(w => console.log(`  ${w}`));
    if (warnings.length > 10) {
      console.log(`  ... and ${warnings.length - 10} more warnings`);
    }
  }

  if (errors.length === 0) {
    console.log('\n✅ All products passed validation!');
  } else {
    console.log(`\n❌ ${errors.length} errors found`);
    process.exit(1);
  }

} catch (err) {
  console.error('Failed to validate products.json:', err.message);
  process.exit(1);
}