
import { supabase } from "@/integrations/supabase/client";

// Demo product generation
export const seedProducts = async () => {
  // Get all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*');
    
  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    return;
  }
  
  if (!categories || categories.length === 0) {
    console.error('No categories found');
    return;
  }
  
  // For each category, add products
  for (const category of categories) {
    const categoryId = category.id;
    const categoryName = category.name;
    const subcategories = category.subcategories || [];
    
    // Generate 15-20 products per category
    const productsToCreate = [];
    
    // Product data based on category
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
    for (const product of products) {
      productsToCreate.push({
        ...product,
        category_id: categoryId
      });
    }
    
    // Insert products in batches
    if (productsToCreate.length > 0) {
      const { error } = await supabase
        .from('products')
        .insert(productsToCreate);
        
      if (error) {
        console.error(`Error creating products for ${categoryName}:`, error);
      } else {
        console.log(`Created ${productsToCreate.length} products for ${categoryName}`);
      }
    }
  }
};

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
      description: `Official ${team.name} home jersey for the 2025 season. Made from high-quality, breathable fabric with sweat-wicking technology. Features the team crest and sponsor logos.`,
      image_url: `https://source.unsplash.com/random?football,jersey,${team.colors.split('/')[0].toLowerCase()}`,
      price_tier1: Math.floor(Math.random() * (1500 - 1000) + 1000),
      price_tier2: Math.floor(Math.random() * (900 - 700) + 700),
      price_tier3: Math.floor(Math.random() * (600 - 400) + 400),
      popular: Math.random() < 0.3,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: subcategory,
      features: ['Breathable fabric', 'Sweat-wicking', 'Official merchandise', 'Regular fit']
    });
    
    // Away jersey
    products.push({
      name: `${team.name} Away Jersey 2025`,
      description: `Official ${team.name} away jersey for the 2025 season. Made from lightweight, breathable fabric designed for optimal performance on the field.`,
      image_url: `https://source.unsplash.com/random?football,jersey,away`,
      price_tier1: Math.floor(Math.random() * (1500 - 1000) + 1000),
      price_tier2: Math.floor(Math.random() * (900 - 700) + 700),
      price_tier3: Math.floor(Math.random() * (600 - 400) + 400),
      popular: Math.random() < 0.2,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: subcategory,
      features: ['Lightweight material', 'Official merchandise', 'Team emblem embroidered', 'Sponsor logos']
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
      description: `Official ${team.name} home basketball jersey for the 2025 season. Lightweight, breathable material designed for maximum performance on the court.`,
      image_url: `https://source.unsplash.com/random?basketball,jersey,${team.colors.split('/')[0].toLowerCase()}`,
      price_tier1: Math.floor(Math.random() * (2000 - 1500) + 1500),
      price_tier2: Math.floor(Math.random() * (1400 - 1100) + 1100),
      price_tier3: Math.floor(Math.random() * (1000 - 800) + 800),
      popular: Math.random() < 0.3,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: team.league,
      features: ['Breathable mesh fabric', 'Double-knit construction', 'Heat-applied graphics', 'NBA official merchandise']
    });
    
    // Away jersey
    products.push({
      name: `${team.name} Away Basketball Jersey 2025`,
      description: `Official ${team.name} away basketball jersey for the 2025 season. Features team colors and logo, made with premium materials.`,
      image_url: `https://source.unsplash.com/random?basketball,jersey,away`,
      price_tier1: Math.floor(Math.random() * (2000 - 1500) + 1500),
      price_tier2: Math.floor(Math.random() * (1400 - 1100) + 1100),
      price_tier3: Math.floor(Math.random() * (1000 - 800) + 800),
      popular: Math.random() < 0.2,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: team.league,
      features: ['Moisture-wicking fabric', 'Athletic cut', 'Team logo embroidered', 'Durable construction']
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
      description: `Official ${team.name} One Day International cricket jersey for 2025. Made with moisture-wicking fabric to keep players dry during long matches.`,
      image_url: `https://source.unsplash.com/random?cricket,jersey,${team.colors.split('/')[0].toLowerCase()}`,
      price_tier1: Math.floor(Math.random() * (1800 - 1200) + 1200),
      price_tier2: Math.floor(Math.random() * (1100 - 900) + 900),
      price_tier3: Math.floor(Math.random() * (800 - 600) + 600),
      popular: Math.random() < 0.3,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: team.type,
      features: ['UV protection', 'Moisture-wicking', 'Anti-microbial treatment', 'Official team colors']
    });
    
    // Test jersey
    if (team.type === 'National Team' || team.type === 'Test') {
      products.push({
        name: `${team.name} Test Cricket Jersey 2025`,
        description: `Official ${team.name} Test cricket whites for 2025. Traditional design with modern fabric technology for ultimate comfort during long test matches.`,
        image_url: `https://source.unsplash.com/random?cricket,test,white`,
        price_tier1: Math.floor(Math.random() * (1800 - 1200) + 1200),
        price_tier2: Math.floor(Math.random() * (1100 - 900) + 900),
        price_tier3: Math.floor(Math.random() * (800 - 600) + 600),
        popular: Math.random() < 0.2,
        name_allowed: true,
        number_allowed: true,
        logo_allowed: false,
        custom_design_allowed: false,
        subcategory: 'Test',
        features: ['Classic cricket whites', 'Breathable fabric', 'Traditional collar', 'Full button front']
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
    { name: 'Phillies', colors: 'Red/White', league: 'MLB' },
    { name: 'Durham Bulls', colors: 'Blue/White', league: 'Minor League' },
    { name: 'Toledo Mud Hens', colors: 'Navy/Yellow', league: 'Minor League' },
    { name: 'Sacramento River Cats', colors: 'Red/Black', league: 'Minor League' }
  ];
  
  const products = [];
  
  for (const team of teams) {
    if (!subcategories.includes(team.league)) continue;
    
    // Home jersey
    products.push({
      name: `${team.name} Home Baseball Jersey 2025`,
      description: `Official ${team.name} home baseball jersey for the 2025 season. Features authentic team styling with embroidered team logo.`,
      image_url: `https://source.unsplash.com/random?baseball,jersey,${team.colors.split('/')[0].toLowerCase()}`,
      price_tier1: Math.floor(Math.random() * (2000 - 1500) + 1500),
      price_tier2: Math.floor(Math.random() * (1400 - 1100) + 1100),
      price_tier3: Math.floor(Math.random() * (1000 - 800) + 800),
      popular: Math.random() < 0.3,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: team.league,
      features: ['Authentic on-field design', 'Cool Base technology', 'Embroidered logo', 'Button front']
    });
    
    // Away jersey
    products.push({
      name: `${team.name} Away Baseball Jersey 2025`,
      description: `Official ${team.name} away baseball jersey for the 2025 season. Made from authentic materials used in professional games.`,
      image_url: `https://source.unsplash.com/random?baseball,jersey,away`,
      price_tier1: Math.floor(Math.random() * (2000 - 1500) + 1500),
      price_tier2: Math.floor(Math.random() * (1400 - 1100) + 1100),
      price_tier3: Math.floor(Math.random() * (1000 - 800) + 800),
      popular: Math.random() < 0.2,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: team.league,
      features: ['100% polyester', 'Moisture-wicking fabric', 'Tackle twill numbers', 'Heat-sealed MLB logo']
    });
    
    // Alternative jersey
    products.push({
      name: `${team.name} Alternative Baseball Jersey 2025`,
      description: `Official ${team.name} alternative baseball jersey for special games during the 2025 season. Limited edition design.`,
      image_url: `https://source.unsplash.com/random?baseball,jersey,alternative`,
      price_tier1: Math.floor(Math.random() * (2200 - 1800) + 1800),
      price_tier2: Math.floor(Math.random() * (1700 - 1400) + 1400),
      price_tier3: Math.floor(Math.random() * (1300 - 1000) + 1000),
      popular: Math.random() < 0.4,
      name_allowed: true,
      number_allowed: true,
      logo_allowed: false,
      custom_design_allowed: false,
      subcategory: team.league,
      features: ['Limited edition design', 'Special color scheme', 'Premium materials', 'Collector\'s item']
    });
  }
  
  return products;
};

const generateGenericProducts = (categoryName: string, subcategories: string[]) => {
  const products = [];
  
  for (let i = 1; i <= 15; i++) {
    products.push({
      name: `${categoryName} Jersey Type ${i}`,
      description: `High-quality ${categoryName.toLowerCase()} jersey made from premium materials. Professionally designed for comfort and performance.`,
      image_url: `https://source.unsplash.com/random?${categoryName.toLowerCase()},jersey,${i}`,
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
        'Premium material',
        'Comfortable fit',
        'Durable construction',
        'Professional design'
      ]
    });
  }
  
  return products;
};
