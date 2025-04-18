
import { supabase } from "@/integrations/supabase/client";

// Demo product generation
export const seedProducts = async (progressCallback?: (progress: number) => void) => {
  // Get all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*');
    
  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    throw new Error('Failed to fetch categories. Please make sure categories exist in the database.');
  }
  
  if (!categories || categories.length === 0) {
    console.error('No categories found');
    throw new Error('No categories found in database. Please create categories first.');
  }

  // Define expected category names for better organization
  const expectedCategories = ['football', 'basketball', 'cricket', 'baseball'];
  
  // Check if we need to create default categories first
  if (categories.length < expectedCategories.length) {
    console.log('Creating missing categories...');
    const existingCategoryNames = categories.map(c => c.name.toLowerCase());
    
    for (const catName of expectedCategories) {
      if (!existingCategoryNames.includes(catName)) {
        const { error } = await supabase
          .from('categories')
          .insert({
            name: catName.charAt(0).toUpperCase() + catName.slice(1),
            image_url: `https://picsum.photos/400/300?random=${Math.random()}`,
            subcategories: getSubcategoriesForCategory(catName)
          });
          
        if (error) {
          console.error(`Error creating category ${catName}:`, error);
        }
      }
    }
    
    // Re-fetch categories
    const { data: updatedCategories, error } = await supabase
      .from('categories')
      .select('*');
      
    if (error || !updatedCategories) {
      throw new Error('Failed to create required categories');
    }
    
    categories.push(...updatedCategories.filter(c => !categories.find(existingCat => existingCat.id === c.id)));
  }
  
  // Count total products to be created for progress calculation
  let totalProductsToCreate = 0;
  let productsCreated = 0;
  
  // For each category, add products
  for (const category of categories) {
    const categoryName = category.name;
    const subcategories = category.subcategories || [];
    
    // Generate products per category
    let products = [];
    
    switch (categoryName.toLowerCase()) {
      case 'football':
        products = generateFootballProducts(subcategories);
        break;
      case 'basketball':
        products = generateBasketballProducts(subcategories);
        break;
      case 'cricket':
        products = generateCricketProducts(subcategories);
        break;
      case 'baseball':
        products = generateBaseballProducts(subcategories);
        break;
      default:
        products = generateGenericProducts(categoryName, subcategories);
    }
    
    // Add category ID to all products
    const productsToCreate = products.map(product => ({
      ...product,
      category_id: category.id
    }));
    
    totalProductsToCreate += productsToCreate.length;
  }
  
  try {
    // Clear any existing products first - Fixed: Use more reliable method
    console.log("Attempting to clear existing products");
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all products with a safer condition
      
    if (deleteError) {
      console.error('Error deleting existing products:', deleteError);
      throw new Error(`Failed to clear existing products: ${deleteError.message}`);
    }
    
    console.log("Successfully cleared existing products");
    
    // Now insert products for each category
    for (const category of categories) {
      const categoryId = category.id;
      const categoryName = category.name;
      const subcategories = category.subcategories || [];
      
      // Generate products based on category
      let products = [];
      
      switch (categoryName.toLowerCase()) {
        case 'football':
          products = generateFootballProducts(subcategories);
          break;
        case 'basketball':
          products = generateBasketballProducts(subcategories);
          break;
        case 'cricket':
          products = generateCricketProducts(subcategories);
          break;
        case 'baseball':
          products = generateBaseballProducts(subcategories);
          break;
        default:
          products = generateGenericProducts(categoryName, subcategories);
      }
      
      // Add category ID to all products
      const productsToCreate = products.map(product => ({
        ...product,
        category_id: categoryId
      }));
      
      // Insert products in batches of 5 for better reliability
      const batchSize = 5;
      for (let i = 0; i < productsToCreate.length; i += batchSize) {
        const batch = productsToCreate.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('products')
          .insert(batch);
          
        if (error) {
          console.error(`Error creating products for ${categoryName}:`, error);
        } else {
          console.log(`Created ${batch.length} products for ${categoryName}`);
          productsCreated += batch.length;
          
          if (progressCallback) {
            const progress = Math.round((productsCreated / totalProductsToCreate) * 100);
            progressCallback(progress);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in product seeding process:", error);
    throw error;
  }
};

// Helper function to get subcategories for a category
function getSubcategoriesForCategory(category: string): string[] {
  switch (category.toLowerCase()) {
    case 'football':
      return ['Club Jerseys', 'National Team Jerseys', 'Custom Teams'];
    case 'basketball':
      return ['NBA', 'College', 'Team USA'];
    case 'cricket':
      return ['National Team', 'IPL', 'Test'];
    case 'baseball':
      return ['MLB', 'Minor League', 'College'];
    default:
      return ['Standard', 'Premium', 'Custom'];
  }
}

const generateFootballProducts = (subcategories: string[]) => {
  const teams = [
    { name: 'Barcelona', colors: 'Blue/Red' },
    { name: 'Real Madrid', colors: 'White' },
    { name: 'Manchester United', colors: 'Red' },
    { name: 'Manchester City', colors: 'Light Blue' },
    { name: 'Liverpool', colors: 'Red' },
    { name: 'Bayern Munich', colors: 'Red' },
    { name: 'Paris Saint-Germain', colors: 'Blue/Red' },
    { name: 'Juventus', colors: 'Black/White' },
    { name: 'AC Milan', colors: 'Red/Black' },
    { name: 'Inter Milan', colors: 'Blue/Black' },
    { name: 'Chelsea', colors: 'Blue' },
    { name: 'Arsenal', colors: 'Red' },
    { name: 'Brazil', colors: 'Yellow/Green' },
    { name: 'Argentina', colors: 'Blue/White' },
    { name: 'Germany', colors: 'White' }
  ];
  
  const products = [];
  
  for (const team of teams) {
    const isNational = ['Brazil', 'Argentina', 'Germany'].includes(team.name);
    const subcategory = isNational ? 'National Team Jerseys' : 'Club Jerseys';
    
    if (!subcategories.includes(subcategory)) continue;
    
    // Home jersey
    products.push({
      name: `${team.name} Home Jersey 2025`,
      description: `Official ${team.name} home jersey for the 2025 season. Made from high-quality, breathable fabric with sweat-wicking technology. Features the team crest and sponsor logos. Perfect for fans who want to show their support on match day or for everyday wear. This jersey is designed for comfort and durability.`,
      image_url: `https://picsum.photos/800/600?random=${Math.random()}`,
      price_tier1: Math.floor(Math.random() * (1500 - 1000) + 1000),
      price_tier2: Math.floor(Math.random() * (900 - 700) + 700),
      price_tier3: Math.floor(Math.random() * (600 - 400) + 400),
      popular: Math.random() < 0.3,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: subcategory,
      features: ['Breathable fabric', 'Sweat-wicking', 'Official merchandise', 'Regular fit', 'Team crest', 'Sponsor logos']
    });
    
    // Away jersey
    products.push({
      name: `${team.name} Away Jersey 2025`,
      description: `Official ${team.name} away jersey for the 2025 season. Made from lightweight, breathable fabric designed for optimal performance on the field. This jersey features the team's away colors that stand out during matches. Features moisture-wicking technology to keep you cool and dry during intense activity.`,
      image_url: `https://picsum.photos/800/600?random=${Math.random()}`,
      price_tier1: Math.floor(Math.random() * (1500 - 1000) + 1000),
      price_tier2: Math.floor(Math.random() * (900 - 700) + 700),
      price_tier3: Math.floor(Math.random() * (600 - 400) + 400),
      popular: Math.random() < 0.2,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: subcategory,
      features: ['Lightweight material', 'Official merchandise', 'Team emblem embroidered', 'Sponsor logos', 'Away colors', 'Performance fabric']
    });
    
    // Third kit or alternate jersey for some teams
    if (Math.random() > 0.5) {
      products.push({
        name: `${team.name} Third Kit 2025`,
        description: `Official ${team.name} third kit for the 2025 season. Features a unique design that stands out from the traditional home and away kits. Made with the same quality materials and attention to detail as all official merchandise. Limited edition design makes this a must-have for collectors and die-hard fans.`,
        image_url: `https://picsum.photos/800/600?random=${Math.random()}`,
        price_tier1: Math.floor(Math.random() * (1800 - 1200) + 1200),
        price_tier2: Math.floor(Math.random() * (1000 - 800) + 800),
        price_tier3: Math.floor(Math.random() * (700 - 500) + 500),
        popular: Math.random() < 0.4,
        name_allowed: true,
        number_allowed: true,
        logo_allowed: false,
        custom_design_allowed: false,
        subcategory: subcategory,
        features: ['Limited edition design', 'Premium quality', 'Collector\'s item', 'Unique pattern', 'Official merchandise']
      });
    }
  }
  
  // Add some custom team options
  if (subcategories.includes('Custom Teams')) {
    const customOptions = [
      { name: 'Basic Team Kit', price: 800 },
      { name: 'Premium Team Kit', price: 1100 },
      { name: 'Pro Team Kit', price: 1400 },
      { name: 'Elite Team Kit', price: 1800 }
    ];
    
    customOptions.forEach(option => {
      products.push({
        name: option.name,
        description: `Custom ${option.name.toLowerCase()} for your football team. Includes jerseys with custom names, numbers, and team logo. Perfect for amateur clubs, school teams, or corporate events. Full customization available with your choice of colors, designs, and patterns.`,
        image_url: `https://picsum.photos/800/600?random=${Math.random()}`,
        price_tier1: option.price,
        price_tier2: Math.floor(option.price * 0.85),
        price_tier3: Math.floor(option.price * 0.7),
        popular: option.name === 'Premium Team Kit',
        name_allowed: true,
        number_allowed: true,
        logo_allowed: true,
        custom_design_allowed: true,
        subcategory: 'Custom Teams',
        features: ['Fully customizable', 'Team name', 'Player names', 'Player numbers', 'Team logo', 'Custom colors']
      });
    });
  }
  
  return products;
};

const generateBasketballProducts = (subcategories: string[]) => {
  const teams = [
    { name: 'Lakers', colors: 'Purple/Gold', league: 'NBA' },
    { name: 'Celtics', colors: 'Green/White', league: 'NBA' },
    { name: 'Bulls', colors: 'Red/Black', league: 'NBA' },
    { name: 'Warriors', colors: 'Blue/Gold', league: 'NBA' },
    { name: 'Nets', colors: 'Black/White', league: 'NBA' },
    { name: 'Heat', colors: 'Red/Black', league: 'NBA' },
    { name: 'Knicks', colors: 'Blue/Orange', league: 'NBA' },
    { name: 'Spurs', colors: 'Silver/Black', league: 'NBA' },
    { name: 'Duke', colors: 'Blue/White', league: 'College' },
    { name: 'North Carolina', colors: 'Light Blue', league: 'College' },
    { name: 'Kentucky', colors: 'Blue/White', league: 'College' },
    { name: 'Kansas', colors: 'Blue/Red', league: 'College' },
    { name: 'Team USA', colors: 'Red/White/Blue', league: 'Team USA' }
  ];
  
  const products = [];
  
  for (const team of teams) {
    if (!subcategories.includes(team.league)) continue;
    
    // Home jersey
    products.push({
      name: `${team.name} Home Basketball Jersey 2025`,
      description: `Official ${team.name} home basketball jersey for the 2025 season. Lightweight, breathable material designed for maximum performance on the court. Features authentic team colors and styling with the official logo. Perfect for games or showing your team spirit as a fan.`,
      image_url: `https://picsum.photos/800/600?random=${Math.random()}`,
      price_tier1: Math.floor(Math.random() * (2000 - 1500) + 1500),
      price_tier2: Math.floor(Math.random() * (1400 - 1100) + 1100),
      price_tier3: Math.floor(Math.random() * (1000 - 800) + 800),
      popular: Math.random() < 0.3,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: team.league,
      features: ['Breathable mesh fabric', 'Double-knit construction', 'Heat-applied graphics', 'NBA official merchandise', 'Authentic design', 'Dri-FIT technology']
    });
    
    // Away jersey
    products.push({
      name: `${team.name} Away Basketball Jersey 2025`,
      description: `Official ${team.name} away basketball jersey for the 2025 season. Features team colors and logo, made with premium materials. This high-quality jersey is designed for ultimate comfort and mobility during intense gameplay, while providing fans with authentic team apparel.`,
      image_url: `https://picsum.photos/800/600?random=${Math.random()}`,
      price_tier1: Math.floor(Math.random() * (2000 - 1500) + 1500),
      price_tier2: Math.floor(Math.random() * (1400 - 1100) + 1100),
      price_tier3: Math.floor(Math.random() * (1000 - 800) + 800),
      popular: Math.random() < 0.2,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: team.league,
      features: ['Moisture-wicking fabric', 'Athletic cut', 'Team logo embroidered', 'Durable construction', 'Official colors', 'Performance material']
    });
  }
  
  return products;
};

const generateCricketProducts = (subcategories: string[]) => {
  const teams = [
    { name: 'India', colors: 'Blue', type: 'National Team' },
    { name: 'Australia', colors: 'Yellow/Green', type: 'National Team' },
    { name: 'England', colors: 'Blue', type: 'National Team' },
    { name: 'Pakistan', colors: 'Green', type: 'National Team' },
    { name: 'New Zealand', colors: 'Black', type: 'National Team' },
    { name: 'South Africa', colors: 'Green/Yellow', type: 'National Team' },
    { name: 'Mumbai Indians', colors: 'Blue/Gold', type: 'IPL' },
    { name: 'Chennai Super Kings', colors: 'Yellow', type: 'IPL' },
    { name: 'Royal Challengers Bangalore', colors: 'Red/Black', type: 'IPL' },
    { name: 'Kolkata Knight Riders', colors: 'Purple/Gold', type: 'IPL' },
    { name: 'Delhi Capitals', colors: 'Blue/Red', type: 'IPL' },
    { name: 'Rajasthan Royals', colors: 'Blue/Pink', type: 'IPL' }
  ];
  
  const products = [];
  
  for (const team of teams) {
    if (!subcategories.includes(team.type)) continue;
    
    // ODI jersey
    products.push({
      name: `${team.name} ODI Cricket Jersey 2025`,
      description: `Official ${team.name} One Day International cricket jersey for 2025. Made with moisture-wicking fabric to keep players dry during long matches. Features team emblem and sponsor logos in official team colors. The breathable material ensures comfort during the entire day's play.`,
      image_url: `https://picsum.photos/800/600?random=${Math.random()}`,
      price_tier1: Math.floor(Math.random() * (1800 - 1200) + 1200),
      price_tier2: Math.floor(Math.random() * (1100 - 900) + 900),
      price_tier3: Math.floor(Math.random() * (800 - 600) + 600),
      popular: Math.random() < 0.3,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: team.type,
      features: ['UV protection', 'Moisture-wicking', 'Anti-microbial treatment', 'Official team colors', 'Team emblem', 'Breathable fabric']
    });
    
    // Test jersey
    if (team.type === 'National Team' || team.type === 'Test') {
      products.push({
        name: `${team.name} Test Cricket Jersey 2025`,
        description: `Official ${team.name} Test cricket whites for 2025. Traditional design with modern fabric technology for ultimate comfort during long test matches. Classic cricket whites with team emblem. Designed for extended wear during multi-day test matches with superior comfort and durability.`,
        image_url: `https://picsum.photos/800/600?random=${Math.random()}`,
        price_tier1: Math.floor(Math.random() * (1800 - 1200) + 1200),
        price_tier2: Math.floor(Math.random() * (1100 - 900) + 900),
        price_tier3: Math.floor(Math.random() * (800 - 600) + 600),
        popular: Math.random() < 0.2,
        name_allowed: true,
        number_allowed: true,
        logo_allowed: false,
        custom_design_allowed: false,
        subcategory: 'Test',
        features: ['Classic cricket whites', 'Breathable fabric', 'Traditional collar', 'Full button front', 'Team emblem', 'Sweat-resistant']
      });
    }
    
    // T20 jersey for IPL teams
    if (team.type === 'IPL') {
      products.push({
        name: `${team.name} T20 Cricket Jersey 2025`,
        description: `Official ${team.name} T20 jersey for the 2025 IPL season. Vibrant team colors with premium sublimation printing that won't fade. Designed for the fast-paced T20 format with lightweight, stretchy materials for maximum mobility and comfort during powerful hits and quick runs.`,
        image_url: `https://picsum.photos/800/600?random=${Math.random()}`,
        price_tier1: Math.floor(Math.random() * (2000 - 1500) + 1500),
        price_tier2: Math.floor(Math.random() * (1400 - 1100) + 1100),
        price_tier3: Math.floor(Math.random() * (1000 - 800) + 800),
        popular: Math.random() < 0.4,
        name_allowed: true,
        number_allowed: true,
        logo_allowed: false,
        custom_design_allowed: false,
        subcategory: 'IPL',
        features: ['Vibrant sublimation print', 'Lightweight fabric', 'Quick-dry technology', 'Team sponsors', 'Official IPL merchandise', 'Stretch fit']
      });
    }
  }
  
  return products;
};

const generateBaseballProducts = (subcategories: string[]) => {
  const teams = [
    { name: 'Yankees', colors: 'Navy/White', league: 'MLB' },
    { name: 'Red Sox', colors: 'Red/White', league: 'MLB' },
    { name: 'Dodgers', colors: 'Blue/White', league: 'MLB' },
    { name: 'Cubs', colors: 'Blue/Red', league: 'MLB' },
    { name: 'Giants', colors: 'Black/Orange', league: 'MLB' },
    { name: 'Cardinals', colors: 'Red', league: 'MLB' },
    { name: 'Braves', colors: 'Navy/Red', league: 'MLB' },
    { name: 'Mets', colors: 'Blue/Orange', league: 'MLB' },
    { name: 'Astros', colors: 'Orange/Navy', league: 'MLB' },
    { name: 'Phillies', colors: 'Red/White', league: 'MLB' }
  ];
  
  const products = [];
  
  for (const team of teams) {
    if (!subcategories.includes(team.league)) continue;
    
    // Home jersey
    products.push({
      name: `${team.name} Home Baseball Jersey 2025`,
      description: `Official ${team.name} home baseball jersey for the 2025 season. Features authentic team styling with embroidered team logo. Made from high-quality polyester fabric that's both durable and comfortable. Perfect for game day or showing your team spirit at the ballpark.`,
      image_url: `https://picsum.photos/800/600?random=${Math.random()}`,
      price_tier1: Math.floor(Math.random() * (2000 - 1500) + 1500),
      price_tier2: Math.floor(Math.random() * (1400 - 1100) + 1100),
      price_tier3: Math.floor(Math.random() * (1000 - 800) + 800),
      popular: Math.random() < 0.3,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: team.league,
      features: ['Authentic on-field design', 'Cool Base technology', 'Embroidered logo', 'Button front', 'Official MLB merchandise', 'Lightweight material']
    });
    
    // Away jersey
    products.push({
      name: `${team.name} Away Baseball Jersey 2025`,
      description: `Official ${team.name} away baseball jersey for the 2025 season. Made from authentic materials used in professional games. Features the team's road colors and styling. The lightweight, breathable fabric keeps you cool and comfortable whether you're playing or cheering from the stands.`,
      image_url: `https://picsum.photos/800/600?random=${Math.random()}`,
      price_tier1: Math.floor(Math.random() * (2000 - 1500) + 1500),
      price_tier2: Math.floor(Math.random() * (1400 - 1100) + 1100),
      price_tier3: Math.floor(Math.random() * (1000 - 800) + 800),
      popular: Math.random() < 0.2,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: team.league,
      features: ['100% polyester', 'Moisture-wicking fabric', 'Tackle twill numbers', 'Heat-sealed MLB logo', 'Road team colors', 'Authentic styling']
    });
    
    // Alternative jersey
    products.push({
      name: `${team.name} Alternative Baseball Jersey 2025`,
      description: `Official ${team.name} alternative baseball jersey for special games during the 2025 season. Limited edition design with unique colorway and styling. Collector's item that stands out from standard home and away jerseys. Features premium materials and construction for the ultimate fan apparel.`,
      image_url: `https://picsum.photos/800/600?random=${Math.random()}`,
      price_tier1: Math.floor(Math.random() * (2200 - 1800) + 1800),
      price_tier2: Math.floor(Math.random() * (1700 - 1400) + 1400),
      price_tier3: Math.floor(Math.random() * (1300 - 1000) + 1000),
      popular: Math.random() < 0.4,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: team.league,
      features: ['Limited edition design', 'Special color scheme', 'Premium materials', 'Collector\'s item', 'Unique styling', 'Official merchandise']
    });
  }
  
  return products;
};

const generateGenericProducts = (categoryName: string, subcategories: string[]) => {
  const products = [];
  
  const styles = ['Standard', 'Premium', 'Pro', 'Elite', 'Custom'];
  const materials = ['Polyester', 'Cotton Blend', 'Performance Fabric', 'Moisture-Wicking Mesh'];
  
  for (let i = 1; i <= 15; i++) {
    const style = styles[Math.floor(Math.random() * styles.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    
    products.push({
      name: `${categoryName} ${style} Jersey Type ${i}`,
      description: `High-quality ${categoryName.toLowerCase()} jersey made from premium ${material.toLowerCase()}. Professionally designed for comfort and performance. Perfect for teams, clubs, and sports enthusiasts. Features custom printing options for names, numbers, and logos. Available in various sizes and colors to suit your team's needs.`,
      image_url: `https://picsum.photos/800/600?random=${Math.random()}`,
      price_tier1: Math.floor(Math.random() * (1800 - 1200) + 1200),
      price_tier2: Math.floor(Math.random() * (1100 - 900) + 900),
      price_tier3: Math.floor(Math.random() * (800 - 600) + 600),
      popular: Math.random() < 0.3,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: Math.random() < 0.5,
      custom_design_allowed: Math.random() < 0.3,
      subcategory: subcategories.length > 0 ? subcategories[Math.floor(Math.random() * subcategories.length)] : null,
      features: [
        'Premium ' + material,
        'Comfortable fit',
        'Durable construction',
        'Professional design',
        'Custom printing options',
        style + ' quality'
      ]
    });
  }
  
  return products;
};
