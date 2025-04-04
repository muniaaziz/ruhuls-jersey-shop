
import { Product, Category } from '../types';

export const categories: Category[] = [
  {
    id: 'football',
    name: 'Football Jerseys',
    imageUrl: '/images/categories/football.jpg',
    subcategories: ['Club Jerseys', 'National Team Jerseys', 'World Cup Editions']
  },
  {
    id: 'cricket',
    name: 'Cricket Jerseys',
    imageUrl: '/images/categories/cricket.jpg',
    subcategories: ['Team Jerseys', 'World Cup Editions', 'League Jerseys']
  },
  {
    id: 'basketball',
    name: 'Basketball Jerseys',
    imageUrl: '/images/categories/basketball.jpg',
    subcategories: ['NBA', 'College', 'Custom Designs']
  },
  {
    id: 'tshirts',
    name: 'T-Shirts',
    imageUrl: '/images/categories/tshirts.jpg',
    subcategories: ['Casual', 'Sports', 'Event']
  },
  {
    id: 'custom',
    name: 'Fully Custom Designs',
    imageUrl: '/images/categories/custom.jpg',
  }
];

export const featuredProducts: Product[] = [
  {
    id: 'p1',
    name: 'Premium Football Jersey - Barcelona Style',
    description: 'High-quality replica of the famous Barcelona home jersey with breathable fabric perfect for team sports.',
    category: 'football',
    subcategory: 'Club Jerseys',
    imageUrl: '/images/products/football-1.jpg',
    price: {
      tier1: 650, // 10-100 pieces (price per piece)
      tier2: 600, // 101-200 pieces
      tier3: 550  // 200+ pieces
    },
    popular: true,
    features: ['Breathable fabric', 'Durable print', 'Sizes S to XXL'],
    customizationOptions: {
      nameAllowed: true,
      numberAllowed: true,
      logoAllowed: true,
      customDesignAllowed: false
    }
  },
  {
    id: 'p2',
    name: 'World Cup Cricket Jersey - Bangladesh',
    description: 'Official style Bangladesh cricket team jersey with premium fabric and detailed stitching.',
    category: 'cricket',
    subcategory: 'World Cup Editions',
    imageUrl: '/images/products/cricket-1.jpg',
    price: {
      tier1: 750,
      tier2: 700,
      tier3: 650
    },
    popular: true,
    features: ['Premium polyester', 'Official colors', 'Sweat-wicking'],
    customizationOptions: {
      nameAllowed: true,
      numberAllowed: true,
      logoAllowed: true,
      customDesignAllowed: false
    }
  },
  {
    id: 'p3',
    name: 'Basketball Team Jersey - Pro Edition',
    description: 'Professional basketball jersey with mesh construction for maximum ventilation during intense games.',
    category: 'basketball',
    subcategory: 'Custom Designs',
    imageUrl: '/images/products/basketball-1.jpg',
    price: {
      tier1: 700,
      tier2: 650,
      tier3: 600
    },
    popular: false,
    features: ['Mesh construction', 'Reinforced stitching', 'Customizable design'],
    customizationOptions: {
      nameAllowed: true,
      numberAllowed: true,
      logoAllowed: true,
      customDesignAllowed: true
    }
  },
  {
    id: 'p4',
    name: 'Premium Sport T-Shirt',
    description: 'Versatile sport t-shirt suitable for casual wear, team events, and training sessions.',
    category: 'tshirts',
    subcategory: 'Sports',
    imageUrl: '/images/products/tshirt-1.jpg',
    price: {
      tier1: 450,
      tier2: 425,
      tier3: 400
    },
    popular: true,
    features: ['100% Cotton', 'Pre-shrunk', 'Durable print'],
    customizationOptions: {
      nameAllowed: true,
      numberAllowed: true,
      logoAllowed: true,
      customDesignAllowed: true
    }
  },
  {
    id: 'p5',
    name: 'Football Jersey - Real Madrid Style',
    description: 'High-quality replica inspired by Real Madrid with premium fabric and detailed finish.',
    category: 'football',
    subcategory: 'Club Jerseys',
    imageUrl: '/images/products/football-2.jpg',
    price: {
      tier1: 650,
      tier2: 600,
      tier3: 550
    },
    popular: false,
    features: ['Lightweight material', 'Sweat-wicking', 'Durable print'],
    customizationOptions: {
      nameAllowed: true,
      numberAllowed: true,
      logoAllowed: true,
      customDesignAllowed: false
    }
  },
  {
    id: 'p6',
    name: 'Custom Team Jersey',
    description: 'Fully customizable team jersey with your choice of colors, designs and features.',
    category: 'custom',
    imageUrl: '/images/products/custom-1.jpg',
    price: {
      tier1: 850,
      tier2: 800,
      tier3: 750
    },
    popular: true,
    features: ['Fully customizable', 'Premium materials', 'Professional finishing'],
    customizationOptions: {
      nameAllowed: true,
      numberAllowed: true,
      logoAllowed: true,
      customDesignAllowed: true
    }
  }
];

// Generate a larger product list for browsing
export const generateProductList = () => {
  const products: Product[] = [...featuredProducts];
  
  // Football jerseys
  for (let i = 3; i <= 15; i++) {
    products.push({
      id: `football-${i}`,
      name: `Football Club Jersey - Design ${i}`,
      description: 'Professional football jersey made with high-quality materials with customizable options.',
      category: 'football',
      subcategory: i % 3 === 0 ? 'Club Jerseys' : i % 3 === 1 ? 'National Team Jerseys' : 'World Cup Editions',
      imageUrl: `/images/products/football-${(i % 3) + 1}.jpg`,
      price: {
        tier1: 600 + (i % 5) * 25,
        tier2: 550 + (i % 5) * 25,
        tier3: 500 + (i % 5) * 25
      },
      popular: i % 5 === 0,
      features: ['Breathable fabric', 'Durable print', 'Sizes S to XXL'],
      customizationOptions: {
        nameAllowed: true,
        numberAllowed: true,
        logoAllowed: true,
        customDesignAllowed: i % 3 === 0
      }
    });
  }
  
  // Cricket jerseys
  for (let i = 2; i <= 15; i++) {
    products.push({
      id: `cricket-${i}`,
      name: `Cricket Team Jersey - Design ${i}`,
      description: 'High-performance cricket jersey designed for comfort and durability.',
      category: 'cricket',
      subcategory: i % 3 === 0 ? 'Team Jerseys' : i % 3 === 1 ? 'World Cup Editions' : 'League Jerseys',
      imageUrl: `/images/products/cricket-${(i % 2) + 1}.jpg`,
      price: {
        tier1: 700 + (i % 5) * 25,
        tier2: 650 + (i % 5) * 25,
        tier3: 600 + (i % 5) * 25
      },
      popular: i % 7 === 0,
      features: ['Premium polyester', 'Sweat-wicking', 'Durable colors'],
      customizationOptions: {
        nameAllowed: true,
        numberAllowed: true,
        logoAllowed: true,
        customDesignAllowed: i % 4 === 0
      }
    });
  }
  
  // Basketball jerseys
  for (let i = 2; i <= 12; i++) {
    products.push({
      id: `basketball-${i}`,
      name: `Basketball Jersey - Design ${i}`,
      description: 'Professional basketball jersey with mesh construction for maximum ventilation.',
      category: 'basketball',
      subcategory: i % 3 === 0 ? 'NBA' : i % 3 === 1 ? 'College' : 'Custom Designs',
      imageUrl: `/images/products/basketball-${(i % 2) + 1}.jpg`,
      price: {
        tier1: 650 + (i % 5) * 25,
        tier2: 600 + (i % 5) * 25,
        tier3: 550 + (i % 5) * 25
      },
      popular: i % 6 === 0,
      features: ['Mesh construction', 'Reinforced stitching', 'Customizable design'],
      customizationOptions: {
        nameAllowed: true,
        numberAllowed: true,
        logoAllowed: true,
        customDesignAllowed: i % 2 === 0
      }
    });
  }
  
  // T-shirts
  for (let i = 2; i <= 15; i++) {
    products.push({
      id: `tshirt-${i}`,
      name: `Premium T-Shirt - Design ${i}`,
      description: 'High-quality t-shirt for casual wear, team events, and everyday use.',
      category: 'tshirts',
      subcategory: i % 3 === 0 ? 'Casual' : i % 3 === 1 ? 'Sports' : 'Event',
      imageUrl: `/images/products/tshirt-${(i % 2) + 1}.jpg`,
      price: {
        tier1: 400 + (i % 5) * 25,
        tier2: 375 + (i % 5) * 25,
        tier3: 350 + (i % 5) * 25
      },
      popular: i % 8 === 0,
      features: ['100% Cotton', 'Pre-shrunk', 'Durable print'],
      customizationOptions: {
        nameAllowed: true,
        numberAllowed: i % 2 === 0,
        logoAllowed: true,
        customDesignAllowed: true
      }
    });
  }
  
  // Custom designs
  for (let i = 2; i <= 10; i++) {
    products.push({
      id: `custom-${i}`,
      name: `Custom Design Template ${i}`,
      description: 'Fully customizable template for your team or event needs with premium quality materials.',
      category: 'custom',
      imageUrl: `/images/products/custom-${(i % 2) + 1}.jpg`,
      price: {
        tier1: 800 + (i % 5) * 25,
        tier2: 750 + (i % 5) * 25,
        tier3: 700 + (i % 5) * 25
      },
      popular: i % 3 === 0,
      features: ['Fully customizable', 'Premium materials', 'Professional finishing'],
      customizationOptions: {
        nameAllowed: true,
        numberAllowed: true,
        logoAllowed: true,
        customDesignAllowed: true
      }
    });
  }
  
  return products;
};

export const allProducts = generateProductList();
