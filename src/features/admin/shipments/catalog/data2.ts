/** More item names, built by combining a short list of things with the ways they are really sold. */
import type { CatalogGroup } from './data';

const VEG = ['Potato', 'Onion', 'Tomato', 'Cauliflower', 'Cabbage', 'Spinach', 'Mustard greens', 'Radish', 'Carrot', 'Brinjal', 'Okra', 'Pumpkin', 'Bottle gourd', 'Bitter gourd', 'Green beans', 'Green peas', 'Capsicum', 'Cucumber', 'Mushroom', 'Bamboo shoot|tama', 'Fiddlehead fern|ningro', 'Colocasia leaves|karkalo', 'Yam|pidalu', 'Taro|tarul', 'Garlic', 'Ginger', 'Chilli', 'Coriander leaves', 'Mint', 'Turnip', 'Beetroot', 'Drumstick|sajiwan|sajyun', 'Jackfruit|rukh katahar|katahar', 'Broccoli', 'Corn|makai', 'Lemon', 'Pointed gourd|parwar', 'Ridge gourd|jhinge', 'Sponge gourd|ghiraula', 'Cowpea|bodi'];
const FRUIT = ['Mango|aam', 'Apple|syau', 'Banana|keraa|kera', 'Orange|suntala', 'Lemon|nimbu', 'Lime|kagati', 'Grapes|angur', 'Guava|ambak', 'Papaya|mewa', 'Pineapple|bhogate|ananas', 'Pomegranate|anar', 'Pear|naspati', 'Peach|aaru', 'Plum|aalubakhada', 'Apricot|khurpani', 'Fig|anjir', 'Kiwi', 'Strawberry', 'Cherry', 'Litchi|lichee', 'Jackfruit', 'Amla|amala', 'Tamarind|imli', 'Sea buckthorn|dale chuk|chuk', 'Lapsi|lapsi fruit', 'Mandarin|junar', 'Watermelon|tarbuja', 'Muskmelon|kharbuja', 'Berries', 'Dates'];
const DEITY = ['Buddha', 'Ganesh', 'Shiva', 'Parvati', 'Laxmi', 'Saraswati', 'Hanuman', 'Krishna', 'Vishnu', 'Durga', 'Kali', 'Tara', 'Avalokiteshvara', 'Manjushri', 'Guru Rinpoche', 'Radha Krishna', 'Ram Sita', 'Saibaba'];
const SUBJECT = ['Nepali', 'English', 'Hindi', 'Maths', 'Science', 'Medical', 'Engineering', 'Cooking', 'Religious', "Children's", 'Story', 'Poetry', 'Novel', 'Law', 'Accounts', 'Computer', 'History', 'Language learning', 'Exam preparation', 'Art'];
const CRAFT = ['Singing bowl', 'Prayer wheel', 'Thangka', 'Mask', 'Vase', 'Bell', 'Lamp', 'Basket', 'Carpet', 'Statue', 'Wall hanging', 'Photo frame', 'Box'];
const UTENSIL = ['Plate', 'Bowl', 'Glass', 'Cup', 'Jug', 'Water bottle', 'Spoon set', 'Pot', 'Pan', 'Tray', 'Lunch box', 'Kettle', 'Jar', 'Container', 'Mug', 'Lamp', 'Bell', 'Vase', 'Candle holder', 'Ladle'];
const WOOD = ['Box', 'Basket', 'Tray', 'Bowl', 'Spoon set', 'Toy', 'Statue', 'Mask', 'Photo frame', 'Comb', 'Stool', 'Cutting board', 'Handicraft', 'Jewellery box', 'Pen stand'];

export const MORE_GROUPS: CatalogGroup[] = [
  { cat: 'food', unit: 'kg', prefixes: ['Dried ', 'Fresh '], items: VEG },
  { cat: 'food', unit: 'kg', prefixes: ['Dried ', 'Fresh '], items: FRUIT },
  { cat: 'food', unit: 'btl', prefixes: [''], suffixes: [' pickle', ' juice', ' jam'], items: FRUIT.slice(0, 20) },
  { cat: 'food', unit: 'pkt', suffixes: [' pickle'], items: VEG.slice(0, 24) },
  { cat: 'religious', unit: 'pcs', suffixes: [' statue', ' photo frame', ' painting', ' locket', ' pendant'], items: DEITY },
  { cat: 'book', unit: 'pcs', suffixes: [' books', ' dictionary', ' notebook'], items: SUBJECT },
  { cat: 'handicraft', unit: 'pcs', prefixes: ['Small ', 'Medium ', 'Large ', 'Handmade ', 'Antique style '], items: CRAFT },
  { cat: 'home', unit: 'pcs', prefixes: ['Steel ', 'Brass ', 'Copper ', 'Bronze ', 'Silver plated ', 'Glass ', 'Ceramic ', 'Plastic ', 'Clay '], items: UTENSIL },
  { cat: 'handicraft', unit: 'pcs', prefixes: ['Wooden ', 'Bamboo ', 'Cane ', 'Hemp ', 'Jute ', 'Stone ', 'Leather '], items: WOOD },
  { cat: 'clothing', unit: 'pcs', prefixes: ['Winter ', 'Woolen ', 'Used '], items: ['Jacket', 'Sweater', 'Cap', 'Gloves', 'Socks', 'Scarf', 'Shirt', 'T-shirt', 'Pants', 'Dress', 'Blanket', 'Coat', 'Hoodie'] },
  { cat: 'clothing', unit: 'pcs', prefixes: ['School '], items: ['Shirt', 'Pants', 'Skirt', 'Dress', 'Sweater', 'Jacket', 'Tie', 'Belt', 'Socks', 'Bag', 'Uniform'] },
  { cat: 'clothing', unit: 'pcs', prefixes: ['Party ', 'Traditional ', 'Wedding '], items: ['Dress', 'Shirt', 'Kurta', 'Saree', 'Cap', 'Shawl', 'Suit', 'Blouse'] },
  { cat: 'footwear', unit: 'pair', prefixes: ['Winter ', 'School ', 'Leather ', 'Canvas ', 'Rubber ', 'Handmade '], items: ['Shoes', 'Boots', 'Sandals', 'Slippers'] },
  { cat: 'sweet', unit: 'pkt', variants: ['Dark', 'Milk', 'White', 'Hazelnut', 'Almond', 'Orange', 'Mint', 'Caramel', 'Fruit and nut', 'Coconut', 'Assorted'], items: ['Chocolate', 'Chocolate bar', 'Chocolate box', 'Truffle'] },
  { cat: 'sweet', unit: 'pkt', variants: ['Mango', 'Orange', 'Strawberry', 'Mint', 'Lemon', 'Coffee', 'Milk', 'Fruit', 'Cola', 'Assorted'], items: ['Candy', 'Toffee', 'Jelly', 'Lollipop', 'Chewing gum'] },
  { cat: 'food', unit: 'pkt', variants: ['Cream', 'Chocolate', 'Butter', 'Coconut', 'Jeera', 'Salted', 'Ginger', 'Oat', 'Milk', 'Marie', 'Sugar free'], items: ['Biscuits', 'Cookies'] },
  { cat: 'food', unit: 'pkt', variants: ['Cheese', 'Tomato', 'Masala', 'Salted', 'Onion', 'Chilli', 'Barbecue', 'Plain'], items: ['Chips', 'Popcorn', 'Namkeen', 'Peanuts'] },
  { cat: 'drink', unit: 'btl', variants: ['Mustard', 'Sesame', 'Coconut', 'Almond', 'Olive', 'Sunflower', 'Soybean', 'Neem', 'Castor', 'Amla', 'Bhringraj', 'Argan'], items: ['Oil', 'Hair oil'] },
  { cat: 'drink', unit: 'btl', variants: ['Wild', 'Forest', 'Himalayan', 'Raw', 'Organic', 'Mustard flower', 'Litchi', 'Mixed flower'], items: ['Honey'] },
  { cat: 'drink', unit: 'pkt', variants: ['Ilam', 'Dooars', 'Assam', 'Darjeeling', 'Masala', 'Ginger', 'Tulsi', 'Lemon', 'Mint', 'Himalayan', 'Organic', 'Orthodox', 'CTC'], items: ['Tea', 'Tea leaves', 'Tea bags', 'Green tea', 'Black tea'] },
  { cat: 'food', unit: 'kg', variants: ['Basmati', 'Sona masuli', 'Jira masino', 'Brown', 'Red', 'Parboiled', 'Black', 'Local', 'Organic'], items: ['Rice', 'Beaten rice'] },
  { cat: 'food', unit: 'pkt', suffixes: [' dal', ' flour', ' powder', ' seeds'], items: ['Moong', 'Masoor', 'Urad', 'Chana', 'Toor', 'Rajma', 'Soy', 'Black soy', 'Lentil', 'Maize', 'Millet', 'Wheat', 'Buckwheat', 'Barley', 'Rice', 'Gram', 'Fenugreek', 'Mustard', 'Sesame', 'Flax', 'Chia', 'Pumpkin', 'Sunflower', 'Lotus', 'Basil'] },
  { cat: 'beauty', unit: 'pcs', prefixes: ['Herbal ', 'Ayurvedic ', 'Natural ', 'Handmade ', 'Aloe vera ', 'Neem ', 'Sandalwood ', 'Rose ', 'Turmeric ', 'Coconut '], items: ['Soap', 'Shampoo', 'Face wash', 'Face cream', 'Body lotion', 'Hair oil', 'Face pack', 'Body scrub', 'Lip balm', 'Hand cream'] },
  { cat: 'herbal', unit: 'pkt', suffixes: [' powder', ' tablets', ' capsules', ' tea', ' oil'], items: ['Ashwagandha', 'Triphala', 'Amla', 'Neem', 'Tulsi', 'Giloy', 'Brahmi', 'Shatavari', 'Moringa', 'Turmeric', 'Ginger', 'Aloe vera', 'Isabgol|psyllium husk', 'Cinnamon', 'Fenugreek', 'Hibiscus', 'Chamomile', 'Lemongrass', 'Mint', 'Nettle'] },
  { cat: 'other', unit: 'pcs', prefixes: ['Plastic ', 'Metal ', 'Glass ', 'Paper ', 'Rubber ', 'Cloth ', 'Wooden ', 'Steel ', 'Leather '], items: ['Items', 'Goods', 'Products', 'Parts', 'Samples', 'Toys', 'Boxes', 'Bags'] },
  { cat: 'electronic', unit: 'pcs', suffixes: [' cover', ' charger', ' cable', ' stand', ' holder', ' case'], items: ['Mobile', 'Tablet', 'Laptop', 'Camera', 'Watch', 'Earphone', 'Speaker'] },
  { cat: 'toy', unit: 'pcs', prefixes: ['Wooden ', 'Plastic ', 'Soft ', 'Educational ', 'Remote control ', 'Musical ', 'Handmade '], items: ['Toy car', 'Toy train', 'Doll', 'Puzzle', 'Blocks', 'Teddy bear', 'Game', 'Ball'] },
  { cat: 'baby', unit: 'pcs', prefixes: ['Newborn ', 'Infant ', 'Toddler ', 'Winter ', 'Cotton '], items: ['Baby clothes', 'Baby cap', 'Baby socks', 'Baby blanket', 'Baby shoes', 'Baby dress', 'Baby sweater', 'Baby jacket', 'Baby gloves', 'Baby set'] },
];
