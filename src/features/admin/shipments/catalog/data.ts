/**
 * Built-in item names for Nepal international courier bills, written the way they are declared:
 * short, plain English, no brand claims. Each item is "Name" or "Name|alias|alias" where aliases are
 * the words people actually type (Roman Nepali, common misspellings). Groups can multiply items with
 * prefixes (Men's, Women's), suffixes (powder) or variants (flavours) so one line covers many bills.
 *
 * Declared as "Butter" on purpose: the courier does not allow the word "ghee" on a bill.
 * Nothing prohibited or dangerous (knives, perfume, loose batteries, aerosols) is listed.
 */
export type CatKey =
  | 'clothing' | 'footwear' | 'spice' | 'food' | 'sweet' | 'drink' | 'dairy' | 'herbal' | 'beauty'
  | 'handicraft' | 'home' | 'electronic' | 'book' | 'toy' | 'bag' | 'religious' | 'baby' | 'sport' | 'other';

export interface CatalogGroup {
  cat: CatKey;
  /** Default unit chosen when this item is picked. */
  unit: string;
  items: string[];
  prefixes?: string[];
  suffixes?: string[];
  variants?: string[];
}

export const CATEGORY_EMOJI: Record<CatKey, string> = {
  clothing: '👕', footwear: '👟', spice: '🌶️', food: '🍚', sweet: '🍫', drink: '🍵', dairy: '🧈', herbal: '🌿',
  beauty: '🧴', handicraft: '🏺', home: '🍳', electronic: '🎧', book: '📚', toy: '🧸', bag: '👜', religious: '🛕',
  baby: '🍼', sport: '⚽', other: '📦',
};

const AUD = ["Men's ", "Women's ", 'Kids ', 'Baby '];

export const GROUPS: CatalogGroup[] = [
  // ------------------------------------------------------------------ clothing
  {
    cat: 'clothing', unit: 'pcs', prefixes: AUD,
    items: [
      'T-shirt|tshirt|t shirt|teeshirt', 'Shirt', 'Polo shirt', 'Jacket|jaket|jacket winter', 'Sweater|sweeter|swetar|sweatar', 'Hoodie|hudi',
      'Jeans|jins', 'Trousers|pant|pants|paint', 'Shorts', 'Track pants|trackpant|tracksuit pant', 'Tracksuit', 'Leggings', 'Pyjama|pajama', 'Night suit|nightwear|night dress',
      'Vest|baniyan|banyan', 'Undergarments|underwear|under wear|inner wear|innerwear', 'Briefs', 'Boxers', 'Socks|sox|moja', 'Thermal wear|thermal|thermals',
      'Coat', 'Blazer', 'Suit', 'Waistcoat', 'Raincoat|rain coat', 'Windcheater', 'Down jacket|duvet jacket|puffer jacket', 'Fleece jacket|fleece',
      'Cardigan', 'Pullover', 'Sweatshirt', 'Tank top', 'Top', 'Blouse', 'Skirt', 'Dress|frock', 'Kurta|kurtha', 'Kurta suruwal|suruwal|salwar', 'Kurta pyjama', 'Daura suruwal|daura',
      'Gunyo cholo|gunyo|cholo', 'Saree|sari|sadi', 'Lehenga', 'Dupatta|shawl dupatta', 'Palazzo', 'Churidar', 'Gown', 'Jumpsuit', 'Shrug', 'Uniform|school uniform', 'Bra|brassiere', 'Panty|panties',
      'Gloves|hand gloves|glovs', 'Scarf|muffler|mufler', 'Cap|topi', 'Woolen cap|woolen hat|bonnet', 'Hat', 'Dhaka topi|dhaka cap', 'Bhadgaunle topi', 'Belt|bel', 'Tie|necktie', 'Handkerchief|rumal|hankerchief',
      'Pashmina shawl|pashmina|pasmina', 'Shawl|shaal', 'Jersey|jercy', 'Lungi', 'Dhoti', 'Sleeping bag cover', 'Swimwear', 'Apron',
    ],
  },
  {
    cat: 'clothing', unit: 'pcs',
    items: [
      'Blanket|kambal|kambol', 'Bedsheet|bed sheet|chadar', 'Pillow cover', 'Pillow', 'Quilt|razai|rajai', 'Comforter', 'Curtain|parda', 'Towel|tauliya', 'Table cloth', 'Cushion cover', 'Carpet|galaicha|rug', 'Mat|chatai',
      'Mosquito net', 'Sofa cover', 'Door mat', 'Woolen blanket', 'Yak wool blanket', 'Fabric|cloth|kapada', 'Cloth material', 'Thread|dhago', 'Embroidery work', 'Ready made garments', 'Used clothes', 'Garments', 'Mixed clothes|clothes|clothing|lugaa|luga',
    ],
  },
  { cat: 'clothing', unit: 'pcs', prefixes: ['Cotton ', 'Woolen ', 'Silk '], items: ['Scarf', 'Shawl', 'Cap', 'Gloves', 'Socks', 'Blanket', 'Cushion cover', 'Shirt', 'Kurta', 'Saree', 'Dress', 'Curtain', 'Bedsheet', 'Towel'] },
  { cat: 'bag', unit: 'pcs', prefixes: ['Leather '], items: ['Bag', 'Wallet', 'Belt', 'Jacket', 'Gloves', 'Purse', 'Handbag', 'Backpack'] },
  // ------------------------------------------------------------------ footwear
  {
    cat: 'footwear', unit: 'pair', prefixes: AUD,
    items: ['Shoes|shoe|juta|jutta', 'Sports shoes|sport shoes', 'Sneakers', 'Running shoes', 'Formal shoes', 'Leather shoes', 'Boots|boot', 'Winter boots', 'Sandals|sandal', 'Slippers|chappal|chapal|chappals', 'Flip flops|flip-flop', 'Crocs', 'School shoes', 'Canvas shoes', 'Loafers', 'High heels|heels', 'Flats|ballet flats', 'Hiking shoes|trekking shoes', 'Gym shoes', 'Football boots|studs', 'Slip on shoes', 'Indoor slippers|house slippers', 'Woolen socks shoes', 'Insoles'],
  },
  // ------------------------------------------------------------------ spices
  {
    cat: 'spice', unit: 'pkt', suffixes: [' powder'],
    items: ['Turmeric|haldi|besar', 'Red chilli|khursani|mirch', 'Coriander|dhaniya|dhania', 'Cumin|jeera|jira', 'Black pepper|golmaricha|marich', 'Cardamom|elaichi|alaichi', 'Large cardamom|alainchi|badi elaichi', 'Cinnamon|dalchini', 'Clove|lwang|laung', 'Fenugreek|methi|methe', 'Fennel|saunf|sounf', 'Mustard seeds|rayo|sarso', 'Ginger|aduwa|adrak|sutho|sunth', 'Garlic|lasun|lahsun', 'Asafoetida|hing|heeng', 'Nutmeg|jaiphal', 'Mace|jawitri', 'Star anise|chakri phool', 'Bay leaf|tejpat|tejpata', 'Carom seeds|ajwain|ajwin|jwano|ajwayan', 'Black cumin|kalonji|nigella', 'Sesame seeds|til', 'Poppy seeds|khus khus|aphim dana', 'Dry mango|amchur|aamchur', 'Tamarind|imli', 'Black salt|kala namak', 'Rock salt|sendha namak', 'Salt|nun|namak', 'Sugar|chini|chinee', 'Brown sugar|gur|jaggery|chaku', 'Paprika', 'Saffron|kesar|kesari', 'Long pepper|pipla|pipali', 'Cassia', 'Dried ginger|sutho', 'Dried garlic', 'Dried onion', 'Kasuri methi|dry fenugreek leaves', 'Curry leaves|kadi patta', 'Mint dried|pudina', 'Basil seeds|sabja'],
  },
  {
    cat: 'spice', unit: 'pkt',
    items: ['Timur|timmur|sichuan pepper|szechuan pepper', 'Jimbu|jimmu|himalayan herb', 'Garam masala|garam masla|masala', 'Chat masala|chaat masala', 'Meat masala|mutton masala|chicken masala', 'Momo masala|momo achar masala', 'Tea masala|chiya masala|chai masala', 'Curry powder|curry masala', 'Biryani masala', 'Pickle masala|achar masala', 'Sabji masala|vegetable masala', 'Chowmein masala', 'Sekuwa masala', 'Pani puri masala', 'Panch phoron|panchphutana|five spice', 'Mixed spices|spices|masala mix|masalaa', 'Whole spices', 'Chilli flakes', 'Chilli sauce', 'Dalle khursani|dalle chilli|dalle', 'Akbare khursani|akbare chilli', 'Dried chilli|sukeko khursani', 'Hot sauce', 'Tomato ketchup|ketchup', 'Soy sauce', 'Vinegar|sirka'],
  },
  // ------------------------------------------------------------------ dry food, grains, lentils
  {
    cat: 'food', unit: 'pkt',
    items: [
      'Rice|chamal|chawal|bhat', 'Basmati rice', 'Beaten rice|chiura|chewda|chura', 'Puffed rice|murmura|bhuja', 'Flour|pitho|atta|aata', 'Wheat flour|gahun pitho', 'Maize flour|makai pitho', 'Rice flour|chamal ko pitho', 'Millet flour|kodo pitho', 'Buckwheat flour|fapar pitho', 'Gram flour|besan|besen', 'Sattu|satu|sattu flour', 'Semolina|suji|sooji', 'Vermicelli|semiya', 'Sago|sabudana',
      'Lentils|dal|daal', 'Red lentils|masoor dal|masur dal|musuro', 'Yellow lentils|moong dal|mung dal|mugi', 'Black lentils|kalo dal|urad dal|maas ko dal|mas dal', 'Chickpeas|chana|chana dal|chana ko dal', 'Kidney beans|rajma|rajma dal', 'Soybeans|bhatmas|bhatmaas', 'Pigeon peas|rahar dal|arhar dal|rahar', 'Horse gram|gahat|kulthi', 'Black eyed peas|bodi|bori', 'Green gram|moong|mung', 'Peas dry|kerau|matar', 'Beans dry|simi', 'Mixed beans|kwati|kwaati', 'Peanuts|badam|mungfali|mumphali', 'Roasted peanuts', 'Roasted corn|makai bhuja', 'Popcorn',
      'Millet|kodo|finger millet', 'Buckwheat|fapar|phapar', 'Barley|jau', 'Oats|oat', 'Cornflakes|corn flakes', 'Muesli', 'Quinoa', 'Wheat|gahun', 'Maize|makai', 'Cooking oil|tel', 'Instant noodles|noodles|wai wai|waiwai|rara|chowmein|noodle|noddles', 'Pasta|macaroni', 'Bread|pau roti', 'Biscuits|biscuit|biskut|biskit|cookies', 'Cream biscuits', 'Rusk', 'Cake|keik', 'Chips|chip|crisps', 'Namkeen|nimki|bhujia', 'Mixture|mixture snack', 'Papad|papadum|papar', 'Sandheko|snack mix', 'Dried vegetables', 'Gundruk|gundruk dried greens', 'Sinki|sinki fermented radish', 'Dried mushroom|mushroom', 'Morel mushroom|guchhi|guchi', 'Dried fish|sukeko machha|machha', 'Dried fruit|dry fruits|dryfruits|sukeko phal', 'Dried mango|aam papad|mango bar',
      'Pickle|achar|aachar|achaar', 'Mango pickle|aam ko achar', 'Lemon pickle|nimbu ko achar', 'Mixed pickle', 'Radish pickle|mula ko achar', 'Chilli pickle|khursani ko achar', 'Gundruk pickle', 'Fish pickle|machha ko achar', 'Tomato pickle|golbheda ko achar', 'Timur pickle|timur ko achar', 'Lapsi candy|lapsi|lapsi achar', 'Amala pickle|amala ko achar', 'Jam', 'Honey comb', 'Peanut butter', 'Mayonnaise', 'Tomato paste', 'Instant soup|soup', 'Instant mix', 'Baking powder', 'Cooking mix', 'Dal bhat set', 'Ready to eat', 'Frozen momo|momo', 'Dumpling', 'Samosa', 'Sel roti|selroti|sel', 'Khapse|khapsey', 'Yomari', 'Chatamari', 'Tarul|taro', 'Sweet potato|sakhar khand',
    ],
  },
  {
    cat: 'food', unit: 'pkt', variants: ['Spicy', 'Chicken', 'Veg', 'Salted', 'Masala', 'Sweet'],
    items: ['Instant noodles', 'Chips', 'Biscuits', 'Namkeen', 'Popcorn', 'Pickle'],
  },
  // ------------------------------------------------------------------ sweets, chocolate, confectionery
  {
    cat: 'sweet', unit: 'pkt',
    items: ['Chocolate|choclate|chocklet|choco|chocolet|chokolet|cadbury|dairy milk', 'Dark chocolate', 'Milk chocolate', 'White chocolate', 'Hazelnut chocolate', 'Chocolate bar', 'Chocolate box', 'Chocolate spread', 'Cocoa powder', 'Candy|kenday|candies', 'Toffee|tofee', 'Lollipop|lolipop', 'Chewing gum|gum|chewgum', 'Jelly|jelli', 'Mint candy|mints', 'Cotton candy', 'Marshmallow', 'Wafers|wafer', 'Lalmohan|lal mohan|gulab jamun|gulabjamun', 'Rasbari|rasbari sweets|rasgulla|rasagulla', 'Jalebi|jilebi|jeri|jeri swari', 'Laddu|ladu|laddoo', 'Barfi|burfi|barfee', 'Peda|pera', 'Sweets|mithai|mitai|sweet', 'Kheer mix', 'Halwa|haluwa', 'Gajar halwa', 'Sohan halwa', 'Kaju katli|cashew sweet', 'Til laddu|sesame ladoo', 'Chaku|churpi sweet', 'Tilauri|tilori', 'Khuwa|khoa|mawa', 'Ras malai|rasmalai', 'Sugar candy|mishri|misri', 'Lapsi sweet|lapsi toffee', 'Chocolate cake', 'Cake mix', 'Brownie', 'Cookies', 'Candy floss', 'Gift box sweets', 'Dry fruit box'],
  },
  {
    cat: 'sweet', unit: 'pkt',
    items: ['Cashew nuts|kaju|cashew|kajoo', 'Almonds|badaam|almond', 'Walnuts|walnut|okhar|akhrot', 'Raisins|kismis|kishmish|drakhsa|munakka', 'Dates|khajur|khajoor', 'Pistachio|pista', 'Hazelnuts|hazelnut', 'Pine nuts|chilgoza', 'Dried apricot|khurpani|apricot|chuli', 'Dried fig|anjir|fig', 'Makhana|fox nut|phool makhana', 'Coconut|nariwal|nariyal', 'Dry coconut|copra|khopra', 'Mixed nuts|mix nuts', 'Dried berries', 'Prunes', 'Dried cranberry', 'Dried apple', 'Dried kiwi', 'Chestnut|chestnuts', 'Brazil nuts', 'Macadamia'],
  },
  // ------------------------------------------------------------------ drinks (dry) and tea
  {
    cat: 'drink', unit: 'pkt',
    items: ['Tea|chiya|chai|chaay|cha', 'Black tea|kalo chiya', 'Green tea|hariyo chiya', 'Milk tea|dudh chiya', 'Masala tea|masala chai', 'Ilam tea|ilam chiya|ilam', 'Himalayan tea', 'Orthodox tea', 'Herbal tea|jadibuti chiya', 'Tea bags|teabag|tea bag', 'Tulsi tea', 'Lemon tea', 'Ginger tea', 'Tea leaves|patti|chiya patti', 'Coffee|kafi|cofee', 'Nepali coffee|himalayan coffee', 'Coffee beans', 'Ground coffee', 'Instant coffee', 'Coffee mix', 'Hot chocolate|drinking chocolate', 'Milk powder|dudh pauder|powdered milk', 'Energy drink powder', 'Juice powder|tang', 'Protein powder', 'Health drink powder|horlicks', 'Electral|ors powder', 'Sherbet|sharbat', 'Rooh afza'],
  },
  {
    cat: 'drink', unit: 'btl',
    items: ['Honey|madhu|mahu|mah', 'Wild honey|jungle honey', 'Himalayan honey', 'Mustard oil|tori ko tel|sarso ko tel|sarsoon tel', 'Sesame oil|til ko tel', 'Coconut oil|nariwal tel', 'Olive oil', 'Almond oil|badam tel', 'Sunflower oil', 'Cooking oil|khane tel', 'Hair oil|kapal ko tel', 'Massage oil|malish tel|malis tel', 'Essential oil', 'Linseed oil|aalas tel', 'Juice|jus', 'Fruit juice', 'Squash', 'Syrup', 'Sea buckthorn juice|aaru juice', 'Rhododendron juice|laliguras juice', 'Aloe vera juice', 'Amla juice', 'Mango juice|aam juice', 'Soft drink|cold drink', 'Water bottle|paani bottle', 'Vinegar', 'Sauce', 'Pickle oil', 'Liquid jaggery|chaku liquid'],
  },
  // ------------------------------------------------------------------ dairy
  {
    cat: 'dairy', unit: 'pkt',
    items: ['Butter|makhan|makhhan|ghee|ghyu|ghiu|ghi|desi ghee|cow ghee|buffalo ghee', 'Cow butter|gai ko makhan', 'Buffalo butter|bhaisi ko makhan', 'Salted butter', 'Unsalted butter', 'Churpi|chhurpi|chhurpi dry cheese|yak cheese|dog chew churpi', 'Hard churpi|kothe churpi', 'Soft churpi|nauni', 'Yak butter|chauri ko makhan|yak ghee', 'Paneer|panir|cottage cheese', 'Cheese|chij', 'Dried cheese', 'Curd powder', 'Yogurt|dahi|dahee|curd', 'Milk powder|dudh', 'Condensed milk', 'Khoa|khuwa', 'Whey', 'Buttermilk powder|mohi', 'Ice cream mix', 'Cream'],
  },
  // ------------------------------------------------------------------ herbal / ayurvedic
  {
    cat: 'herbal', unit: 'pkt',
    items: ['Herbal powder|jadibuti|jadi buti', 'Ayurvedic powder|ayurved|aayurved', 'Chyawanprash|chyawanprash paste|chavanprash', 'Triphala|triphala powder', 'Ashwagandha|ashwagandha root', 'Tulsi|holy basil|tulsi leaves', 'Neem|neem leaves|neem powder', 'Amla|amala|gooseberry|amla powder', 'Aloe vera|ghiu kumari|aloe', 'Giloy|gurjo|guduchi', 'Brahmi', 'Shatavari|satawari', 'Turmeric root|kachi haldi', 'Cinnamon bark', 'Himalayan salt|himalayan rock salt', 'Shilajit|silajit', 'Yarsagumba|yarsa|yarsa gumba|cordyceps', 'Nettle|sisnu|sisno|nettle tea', 'Nettle powder', 'Lemon grass|lemongrass', 'Wild herbs|jadibuti herbs', 'Herbal soap|jadibuti soap', 'Herbal oil', 'Herbal balm|tiger balm|balm', 'Vicks|vapour rub', 'Pain balm', 'Ayurvedic oil|ayurvedic tel', 'Herbal tablets', 'Medicine|aushadhi|ausadhi|dawai|dabai|tablets|medicines', 'Vitamin tablets|vitamins', 'Herbal shampoo|reetha|ritha|shikakai|aritha', 'Henna|mehendi|mehandi|mehndi', 'Henna powder', 'Rudraksha mala'],
  },
  // ------------------------------------------------------------------ beauty & personal care
  {
    cat: 'beauty', unit: 'pcs',
    items: ['Soap|sabun|sabun bar', 'Shampoo|shampu', 'Conditioner', 'Face wash', 'Face cream|cream', 'Body lotion|lotion', 'Moisturizer|moisturiser', 'Sunscreen', 'Lip balm', 'Lipstick|lip stick', 'Kajal|kajol', 'Eyeliner', 'Mascara', 'Foundation', 'Compact powder', 'Face powder|powder', 'Bindi|tika|teeka', 'Sindoor|sindur', 'Bangles|churi|chura|chudi', 'Glass bangles', 'Hair band|hairband', 'Hair clip', 'Hair brush|hairbrush', 'Comb|kapali|kanghi', 'Razor', 'Toothbrush|tooth brush|danta brush', 'Toothpaste|tooth paste|manjan', 'Dental floss', 'Nail cutter|nail clipper', 'Makeup kit|makeup|make up', 'Makeup brush', 'Sanitary pads|pads', 'Tissue paper|tissue', 'Cotton|kapas', 'Hair dye', 'Hair gel', 'Hair serum', 'Body scrub', 'Face mask', 'Face pack', 'Talcum powder', 'Deodorant roll on', 'Attar|ittar', 'Incense perfume oil', 'Mirror|ainaa|aina', 'Hand cream', 'Foot cream', 'Heel cream', 'Massage oil', 'Bath towel', 'Loofah|scrub sponge'],
  },
  // ------------------------------------------------------------------ handicraft, gifts
  {
    cat: 'handicraft', unit: 'pcs',
    items: ['Singing bowl|singing bawl|tibetan bowl|kansya bowl|bowl singing', 'Singing bowl set', 'Thangka|thanka|tanka|thanka painting', 'Prayer wheel|mani wheel', 'Prayer flags|prayer flag|lungta', 'Buddha statue|buddha murti|budha statue', 'Ganesh statue|ganesh murti|ganesha', 'Shiva statue|shiva murti', 'Statue|murti|moorti', 'Brass statue', 'Copper statue', 'Wooden statue', 'Stone statue', 'Bell|ghanti|ghanta', 'Vajra|bajra', 'Prayer beads|mala|japa mala|jaap mala', 'Rudraksha|rudraksh', 'Rudraksha mala', 'Tulsi mala', 'Crystal mala', 'Necklace|haar|mala necklace', 'Earrings|jhumka|jhumkas|ear ring', 'Ring|aunthi|anguthi', 'Bracelet|bala', 'Pendant', 'Jewellery|jewelry|gahana|gahanaa|jwelry', 'Silver jewellery|silver jewelry|chandi gahana', 'Artificial jewellery|imitation jewellery', 'Pote|potay|pote necklace', 'Tilhari|tilhari necklace', 'Beads|moti|motee', 'Tibetan carpet|tibetan rug', 'Wool carpet|woolen carpet', 'Felt products|felt|wool felt', 'Felt balls', 'Handmade paper|lokta paper|nepali paper', 'Lokta paper products', 'Paper bag|handmade paper bag', 'Notebook handmade', 'Greeting cards', 'Wood carving|wooden carving', 'Wooden box', 'Wooden toy', 'Wooden mask', 'Mask|mukhauta|mukunda', 'Metal craft|metalwork', 'Brass items|brass', 'Copper items|copper', 'Copper bottle|tamba bottle', 'Copper jug', 'Copper plate', 'Bronze items', 'Pottery|bhanda|clay pot|mato ko bhanda', 'Terracotta', 'Ceramic|chinaware', 'Khukuri showpiece|showpiece', 'Showpiece|decoration|decoration piece|decorative', 'Wall hanging', 'Wall art', 'Painting|chitra|paubha', 'Mandala painting|mandala', 'Photo frame', 'Candle holder', 'Candles|batti', 'Incense sticks|dhup|dhoop|agarbatti|agarbati|incense', 'Incense cone', 'Dhoop|dhoop batti', 'Pashmina products', 'Dhaka fabric|dhaka cloth', 'Dhaka topi', 'Hemp products|hemp bag|hemp', 'Hemp rope', 'Nettle fabric|allo cloth|allo', 'Bamboo products|bamboo', 'Bamboo basket|doko', 'Doko|doko basket', 'Naamlo|namlo', 'Cane basket', 'Basket|tokari|tokri', 'Handicraft|handicrafts|hastakala|hasta kala', 'Souvenir|souvenirs|gift item', 'Keyring|key chain|keychain', 'Magnet|fridge magnet', 'Coaster', 'Gift|gifts|upahar|uphar', 'Gift hamper', 'Gift box', 'Gift set', 'Yak bell', 'Yak wool items', 'Lokta diary', 'Wind chime|chime', 'Prayer mat|asan', 'Meditation cushion', 'Incense holder', 'Butter lamp|diyo|deepak|diya', 'Oil lamp', 'Puja items|puja samagri|pooja samagri', 'Puja thali|pooja thali', 'Kalash|kalas', 'Conch shell|shankha|sankha', 'Chandan|sandalwood', 'Sandalwood paste', 'Tika powder', 'Kumkum|kumkum powder', 'Abir|abeer|holi colour', 'Rakhi|rakhee', 'Tihar items|tihar'],
  },
  // ------------------------------------------------------------------ home, kitchen
  {
    cat: 'home', unit: 'pcs',
    items: ['Pressure cooker|cooker|presar cooker', 'Rice cooker', 'Kettle|ketli', 'Electric kettle', 'Pan|frypan|fry pan|tawa', 'Pot|handi|handi pot', 'Kadai|karahi|karai', 'Steel plate|thaal|thali', 'Plate|plet', 'Bowl|bati|katori', 'Glass|gilas', 'Cup|kap', 'Mug', 'Spoon|chamcha|chamchi', 'Fork', 'Knife kitchen', 'Ladle|dhaadu|dadu', 'Spatula|jhara', 'Rolling pin|belan|belna', 'Grater', 'Strainer|chalni', 'Chopping board', 'Lunch box|tiffin|tifin|tiffin box', 'Water bottle|bottle|botal', 'Thermos|flask|thermos flask', 'Steel bottle', 'Jug|jag', 'Container|dabba|dabbaa', 'Plastic container', 'Steel container', 'Spice box|masala dabba|masala box', 'Storage box', 'Cutlery set|cutlery', 'Dinner set', 'Tea set|chiya set', 'Glass set', 'Utensils|bhandaa|bhada|bhanda|kitchenware|kitchen items', 'Steel utensils', 'Brass utensils|pital ko bhanda', 'Copper utensils|tamba ko bhanda', 'Cooking pot', 'Idli maker', 'Sil batta|silauto|lohoro|mortar pestle', 'Mortar and pestle', 'Pickle jar|jar|barni', 'Glass jar', 'Mixer|mixer grinder|grinder', 'Blender', 'Toaster', 'Iron|istri', 'Hair dryer', 'Heater|room heater', 'Fan', 'Lamp|batti lamp', 'Led bulb|bulb', 'Extension cord', 'Torch|torch light|flashlight', 'Clock|ghadi|ghari', 'Wall clock', 'Alarm clock', 'Umbrella|chhata|chhatri|chata', 'Broom|jharu', 'Bucket|balti', 'Mug bath', 'Hanger|hangar', 'Suitcase|trolley bag|suit case', 'Cooler', 'Hot pot', 'Tea strainer', 'Tea cups', 'Sewing machine', 'Needle thread kit', 'Scissors|kainchi', 'Tools|tool kit', 'Screwdriver set', 'Padlock|taala|tala', 'Door lock', 'Keys', 'Candle'],
  },
  // ------------------------------------------------------------------ electronics
  {
    cat: 'electronic', unit: 'pcs',
    items: ['Mobile phone|mobile|phone|fon|smartphone|handset', 'Mobile cover|phone cover|mobile case', 'Charger|chaarger', 'Charging cable|usb cable|cable', 'Adapter|adaptor', 'Earphones|earphone|earbuds|headphones|headphone|handsfree', 'Bluetooth speaker|speaker', 'Laptop|labtop', 'Tablet|ipad', 'Camera|kyamera', 'Memory card|sd card', 'Pen drive|pendrive|usb drive', 'Hard disk|harddisk|external hard disk', 'Keyboard', 'Mouse', 'Laptop bag', 'Watch|ghadi watch|wrist watch|smart watch', 'Smart watch', 'Fitness band', 'Calculator', 'Radio', 'Remote control|remote', 'Electric razor|trimmer', 'Hair straightener', 'Massager', 'Torch light', 'Solar lamp', 'Sim card', 'Router', 'Printer', 'Ink cartridge', 'Spectacles|chasma|glasses|eyeglasses', 'Sunglasses|goggles', 'Contact lens solution', 'Blood pressure machine|bp machine', 'Thermometer', 'Weighing scale|scale|taraju'],
  },
  // ------------------------------------------------------------------ books, stationery, documents
  {
    cat: 'book', unit: 'pcs',
    items: ['Books|book|kitab|kitaab', 'Nepali books|nepali kitab', 'Story books', 'School books|textbooks|text book', 'Religious books|dharmik kitab', 'Gita|geeta|bhagwat gita', 'Ramayan|ramayana', 'Magazine|patrika', 'Newspaper', 'Dictionary|shabdakosh', 'Diary|dayari', 'Notebook|copy|copi|kapi', 'Register', 'Calendar|patro|patra', 'Documents|document|kagaz|kagajat|kagazat|papers|paper', 'Certificates|certificate|praman patra', 'Academic documents|transcripts|transcript', 'Photos|photo|tasbir|tasvir', 'Photo album|album', 'Letters|letter|chitthi|chithi', 'Files|file|folder', 'Maps', 'Pen|kalam', 'Pencil|sisa kalam', 'Marker', 'Eraser|rubber', 'Colour pencils|crayons|colors', 'Paint box', 'Brushes', 'Sketchbook', 'Art materials', 'Stationery|stationary|stationery items', 'School bag|school bag kids', 'Sticker|stickers', 'Flash cards', 'Educational toys'],
  },
  // ------------------------------------------------------------------ bags
  {
    cat: 'bag', unit: 'pcs', prefixes: ['', "Men's ", "Women's ", 'Kids '],
    items: ['Bag|jhola|jhol', 'Backpack|back pack|bag pack|bagpack', 'Handbag|hand bag|purse', 'Shoulder bag', 'Travel bag|travel bag duffel', 'Duffel bag', 'Trekking bag|rucksack|trekking backpack', 'Tote bag', 'Laptop bag', 'Wallet|wallate|purse wallet', 'Clutch', 'Pouch|paauch', 'Sling bag', 'Gym bag', 'Lunch bag', 'Money belt', 'Suitcase', 'Cosmetic bag', 'Mobile pouch', 'Passport holder', 'Card holder', 'Hemp bag', 'Jute bag|jute', 'Cloth bag', 'Leather bag'],
  },
  // ------------------------------------------------------------------ toys, baby, sport
  {
    cat: 'toy', unit: 'pcs',
    items: ['Toys|toy|khelauna|khilauna|khelauna toys', 'Soft toy|teddy|teddy bear|stuffed toy', 'Doll|putali|puttali', 'Toy car', 'Toy set', 'Building blocks|lego|blocks', 'Puzzle', 'Board game|ludo|carrom board|carrom', 'Playing cards|cards|taas', 'Chess set|chess', 'Kite|ghudi|gudi', 'Balloon', 'Kids bicycle toy', 'Remote car', 'Drawing set', 'Musical toy', 'Bat ball set', 'Skipping rope', 'Water gun', 'Slime'],
  },
  {
    cat: 'baby', unit: 'pcs',
    items: ['Baby clothes|baby dress', 'Baby socks', 'Baby cap', 'Baby blanket', 'Baby shawl', 'Baby shoes', 'Baby bottle|feeding bottle|dudh bottle', 'Baby food|cerelac|cerelac food', 'Baby powder', 'Baby oil', 'Baby soap', 'Baby lotion', 'Baby wipes|wipes', 'Diapers|diaper|pampers|nappy', 'Baby bag', 'Baby bed', 'Pacifier|nipple', 'Baby toys', 'Baby carrier', 'Baby swing', 'Baby rattle', 'Maternity wear'],
  },
  {
    cat: 'sport', unit: 'pcs',
    items: ['Football|futball|soccer ball', 'Volleyball', 'Basketball', 'Cricket bat|bat', 'Cricket ball', 'Badminton racket|racket|racquet', 'Shuttlecock|shuttle', 'Table tennis bat', 'Skipping rope', 'Yoga mat|yoga mat roll', 'Dumbbell|dumbell', 'Gym gloves', 'Sports kit', 'Jersey', 'Track suit', 'Swimming goggles', 'Cycle|bicycle|cycle parts', 'Trekking pole|trekking stick', 'Sleeping bag', 'Tent', 'Water bottle sports', 'Hiking socks', 'Climbing gear|climbing equipment'],
  },
  // ------------------------------------------------------------------ religious
  {
    cat: 'religious', unit: 'pcs',
    items: ['Puja items', 'Murti', 'Idol', 'Photo frame god', 'Tulsi plant pot', 'Prasad|prasad sweets|prashad', 'Holy water bottle|gangajal|ganga jal|holy water', 'Janai|janaai|sacred thread|janeu', 'Rudraksha beads', 'Ghanta bell', 'Aarti thali|aarati thali|aarti', 'Havan samagri|hawan samagri', 'Ganga jal bottle', 'Yagya items', 'Puja cloth|puja kapada', 'Bhagwat book', 'Bible', 'Quran|koran', 'Prayer cap', 'Prayer mat muslim', 'Tasbih|tasbeeh', 'Buddhist items', 'Kata|khata|khada|silk scarf khada', 'Mani stone', 'Tibetan incense'],
  },
  // ------------------------------------------------------------------ other / generic
  {
    cat: 'other', unit: 'pcs',
    items: ['Household items|household goods|ghar ko saman|saman', 'Personal items|personal goods|personal effects|personal use', 'Used items|used goods', 'Gift items', 'Samples|sample', 'Commercial samples|sample goods', 'General goods|general cargo', 'Mixed items|mixed goods|mixed', 'Food items|khana|khane kura|khanekura|khadya padartha|food', 'Dry food|dry foods', 'Packed food', 'Nepali food|nepali khana', 'Snacks|snack|nasta', 'Medicines', 'Cosmetics|kosmetik|cosmetic items', 'Clothing items', 'Accessories|accessory', 'Fashion accessories', 'Artificial flowers|plastic flowers', 'Flowers dried', 'Seeds|beu|biu', 'Vegetable seeds', 'Flower seeds', 'Plants|plant', 'Tea gift', 'Pet food|dog food', 'Dog chew|churpi dog chew', 'Pet accessories', 'Aquarium items', 'Sewing items', 'Mobile accessories', 'Computer accessories', 'Spare parts|parts', 'Machine parts', 'Tools', 'Hardware items', 'Plastic items', 'Rubber items', 'Leather items|chamda', 'Wooden items', 'Steel items', 'Glass items', 'Paper items', 'Cloth items', 'Party items|party supplies', 'Decoration items', 'Festival items', 'Wedding items|biha ko saman|wedding gifts', 'Wedding cards|invitation cards', 'Bridal items', 'Lehenga set', 'Sherwani', 'Groom suit'],
  },
];
