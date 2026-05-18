export type MenuCategory = 'fruit' | 'vegetable';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type DrinkType = 'cold' | 'blended';
export type SweetnessLevel = 'less' | 'normal' | 'more' | 'extra';
export type CupType = 'ready' | 'separate';

export interface ItemOptions {
  type: DrinkType;
  sweetness: SweetnessLevel;
  cup: CupType;
  notes: string;
}

export interface MenuItem {
  id: number;
  name: string;
  nameEn: string;
  category: MenuCategory;
  price: number;
  image: string;
  description: string;
  descriptionEn: string;
  isNew: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  emoji: string;
  bgColor: string;
}

export interface Order {
  id: string;
  customerName: string;
  items: { name: string; nameEn: string; quantity: number; price: number }[];
  total: number;
  status: OrderStatus;
  time: string;
  address: string;
  notes: string;
  createdAt: Date;
}

export interface CustomerOrderItem {
  name: string;
  nameEn: string;
  quantity: number;
  price: number;
  emoji: string;
  bgColor: string;
  options?: ItemOptions;
}

export interface CustomerOrder {
  id: string;
  items: CustomerOrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  address: string;
  notes: string;
  isReceived: boolean;
  rating?: number;
  review?: string;
}

export const menuItems: MenuItem[] = [
  // ---- ผลไม้ (Fruit) ----
  {
    id: 1,
    name: 'สตรอว์เบอร์รี่',
    nameEn: 'Strawberry',
    category: 'fruit',
    price: 45,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
    description: 'สตรอว์เบอร์รี่สด หวานอมเปรี้ยว วิตามินซีสูง',
    descriptionEn: 'Fresh strawberry, sweet & tangy, high vitamin C',
    isNew: false,
    isFeatured: true,
    isAvailable: true,
    emoji: '🍓',
    bgColor: '#FFF0F5',
  },
  {
    id: 2,
    name: 'มะม่วง',
    nameEn: 'Mango',
    category: 'fruit',
    price: 40,
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80',
    description: 'มะม่วงน้ำดอกไม้ หอมหวาน เนื้อเนียน',
    descriptionEn: 'Nam Dok Mai mango, sweet aroma, silky smooth',
    isNew: false,
    isFeatured: true,
    isAvailable: true,
    emoji: '🥭',
    bgColor: '#FFF8E1',
  },
  {
    id: 3,
    name: 'เลมอน',
    nameEn: 'Lemon',
    category: 'fruit',
    price: 35,
    image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400&q=80',
    description: 'เลมอนสด เปรี้ยวกลมกล่อม สดชื่นมาก',
    descriptionEn: 'Fresh lemon, bright and refreshing',
    isNew: false,
    isFeatured: true,
    isAvailable: true,
    emoji: '🍋',
    bgColor: '#FFFFF0',
  },
  {
    id: 4,
    name: 'กีวี',
    nameEn: 'Kiwi',
    category: 'fruit',
    price: 45,
    image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&q=80',
    description: 'กีวีสด เปรี้ยวหวาน วิตามินซีสูงมาก',
    descriptionEn: 'Fresh kiwi, tart & sweet, very high vitamin C',
    isNew: true,
    isFeatured: false,
    isAvailable: true,
    emoji: '🥝',
    bgColor: '#F0FFF0',
  },
  {
    id: 5,
    name: 'แตงโม',
    nameEn: 'Watermelon',
    category: 'fruit',
    price: 38,
    image: 'https://images.unsplash.com/photo-1683166263544-e754e85c3e7c?w=400&q=80',
    description: 'แตงโมฉ่ำ หวานเย็นสดชื่น ไม่ผสมน้ำ',
    descriptionEn: 'Juicy watermelon, sweet and cooling, no added water',
    isNew: false,
    isFeatured: false,
    isAvailable: true,
    emoji: '🍉',
    bgColor: '#FFE8EC',
  },
  {
    id: 6,
    name: 'ส้ม',
    nameEn: 'Orange',
    category: 'fruit',
    price: 40,
    image: 'https://images.unsplash.com/photo-1740555612192-3e3cf77b5d1f?w=400&q=80',
    description: 'ส้มสดทุกวัน หวานอมเปรี้ยว ฉ่ำมาก',
    descriptionEn: 'Fresh daily orange, sweet & tangy, super juicy',
    isNew: false,
    isFeatured: true,
    isAvailable: true,
    emoji: '🍊',
    bgColor: '#FFF4E6',
  },
  {
    id: 7,
    name: 'องุ่น',
    nameEn: 'Grape',
    category: 'fruit',
    price: 48,
    image: 'https://images.unsplash.com/photo-1750762285719-eb784c804f2f?w=400&q=80',
    description: 'องุ่นแดงสด หวานเข้มข้น สีสวยน่าดื่ม',
    descriptionEn: 'Fresh red grape, rich and sweet, beautiful color',
    isNew: true,
    isFeatured: false,
    isAvailable: true,
    emoji: '🍇',
    bgColor: '#F5F0FF',
  },
  {
    id: 8,
    name: 'สับปะรด',
    nameEn: 'Pineapple',
    category: 'fruit',
    price: 38,
    image: 'https://images.unsplash.com/photo-1750762285719-eb784c804f2f?w=400&q=80',
    description: 'สับปะรดฉ่ำ หวานอมเปรี้ยว ย่อยง่าย',
    descriptionEn: 'Juicy pineapple, sweet & tangy, aids digestion',
    isNew: false,
    isFeatured: false,
    isAvailable: true,
    emoji: '🍍',
    bgColor: '#FFFDE7',
  },
  {
    id: 9,
    name: 'พีช',
    nameEn: 'Peach',
    category: 'fruit',
    price: 42,
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80',
    description: 'พีชสด หวานหอม นุ่มลิ้น',
    descriptionEn: 'Fresh peach, sweet and aromatic, velvety smooth',
    isNew: false,
    isFeatured: false,
    isAvailable: true,
    emoji: '🍑',
    bgColor: '#FFF8F5',
  },
  {
    id: 10,
    name: 'บลูเบอร์รี่',
    nameEn: 'Blueberry',
    category: 'fruit',
    price: 50,
    image: 'https://images.unsplash.com/photo-1635232705183-0b42be8efed7?w=400&q=80',
    description: 'บลูเบอร์รี่สด แอนตี้ออกซิแดนท์สูง',
    descriptionEn: 'Fresh blueberry, rich in antioxidants',
    isNew: false,
    isFeatured: true,
    isAvailable: true,
    emoji: '🫐',
    bgColor: '#EEF2FF',
  },
  {
    id: 11,
    name: 'มะพร้าว',
    nameEn: 'Coconut',
    category: 'fruit',
    price: 40,
    image: 'https://images.unsplash.com/photo-1763741184209-8521419626af?w=400&q=80',
    description: 'มะพร้าวอ่อนสด เย็นชื่น ดื่มด่ำ',
    descriptionEn: 'Fresh young coconut, cool and refreshing',
    isNew: false,
    isFeatured: false,
    isAvailable: true,
    emoji: '🥥',
    bgColor: '#F0F9FF',
  },
  {
    id: 12,
    name: 'มะละกอ',
    nameEn: 'Papaya',
    category: 'fruit',
    price: 38,
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80',
    description: 'มะละกอสุก หวานฉ่ำ เต็มคุณค่า ช่วยย่อย',
    descriptionEn: 'Ripe papaya, sweet & nutritious, aids digestion',
    isNew: false,
    isFeatured: false,
    isAvailable: true,
    emoji: '🍈',
    bgColor: '#FFF8F0',
  },
  // ---- ผัก (Vegetable) ----
  {
    id: 13,
    name: 'แครอท',
    nameEn: 'Carrot',
    category: 'vegetable',
    price: 40,
    image: 'https://images.unsplash.com/photo-1635235190722-01f29e91e7d1?w=400&q=80',
    description: 'แครอทสด น้ำผึ้ง ขิง บำรุงสายตา',
    descriptionEn: 'Fresh carrot with honey & ginger, eye health boost',
    isNew: false,
    isFeatured: true,
    isAvailable: true,
    emoji: '🥕',
    bgColor: '#FFF3E0',
  },
  {
    id: 14,
    name: 'แตงกวา',
    nameEn: 'Cucumber',
    category: 'vegetable',
    price: 35,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80',
    description: 'แตงกวาสด มะนาว เกลือหิมาลัย สดชื่นมาก',
    descriptionEn: 'Fresh cucumber, lime & Himalayan salt, ultra refreshing',
    isNew: false,
    isFeatured: false,
    isAvailable: true,
    emoji: '🥒',
    bgColor: '#F0FFF4',
  },
  {
    id: 15,
    name: 'ผักโขม',
    nameEn: 'Spinach',
    category: 'vegetable',
    price: 42,
    image: 'https://images.unsplash.com/photo-1622485831141-0cde75fc4b99?w=400&q=80',
    description: 'ผักโขม แอปเปิล มะนาว เพื่อสุขภาพ',
    descriptionEn: 'Spinach, apple and lemon, healthy green boost',
    isNew: true,
    isFeatured: false,
    isAvailable: true,
    emoji: '🥬',
    bgColor: '#ECFDF5',
  },
  {
    id: 16,
    name: 'บีทรูท',
    nameEn: 'Beet',
    category: 'vegetable',
    price: 45,
    image: 'https://images.unsplash.com/photo-1625750331870-624de6fd3452?w=400&q=80',
    description: 'บีทรูทสด แครอท ขิง เพิ่มพลังงาน',
    descriptionEn: 'Fresh beet, carrot & ginger, energizing blend',
    isNew: false,
    isFeatured: false,
    isAvailable: true,
    emoji: '🫚',
    bgColor: '#FFF0F5',
  },
  {
    id: 17,
    name: 'ขึ้นฉ่าย',
    nameEn: 'Celery',
    category: 'vegetable',
    price: 42,
    image: 'https://images.unsplash.com/photo-1622485831141-0cde75fc4b99?w=400&q=80',
    description: 'ขึ้นฉ่าย แอปเปิล มะนาว ล้างสารพิษ',
    descriptionEn: 'Celery, apple & lemon, detoxifying green drink',
    isNew: true,
    isFeatured: false,
    isAvailable: true,
    emoji: '🌿',
    bgColor: '#F0FFF4',
  },
  {
    id: 18,
    name: 'บร็อคโคลี่',
    nameEn: 'Broccoli',
    category: 'vegetable',
    price: 45,
    image: 'https://images.unsplash.com/photo-1622485831141-0cde75fc4b99?w=400&q=80',
    description: 'บร็อคโคลี่ แอปเปิลเขียว น้ำผึ้ง วิตามินสูง',
    descriptionEn: 'Broccoli, green apple & honey, vitamin-rich',
    isNew: false,
    isFeatured: false,
    isAvailable: true,
    emoji: '🥦',
    bgColor: '#F0F8F0',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'FS-001',
    customerName: 'คุณสมชาย ไอดี',
    items: [
      { name: 'สตรอว์เบอร์รี่', nameEn: 'Strawberry', quantity: 2, price: 45 },
    ],
    total: 110,
    status: 'delivered',
    time: '23:45',
    address: '12/5 ถ.สุขุมวิท แขวงคลองเตย กรุงเทพฯ',
    notes: 'หวานน้อย',
    createdAt: new Date(),
  },
  {
    id: 'FS-002',
    customerName: 'คุณมาลี รักสวย',
    items: [
      { name: 'มะม่วงปั่น', nameEn: 'Mango Blend', quantity: 1, price: 40 },
    ],
    total: 60,
    status: 'delivered',
    time: '23:31',
    address: '45 ถ.รัชดาภิเษก แขวงดินแดง กรุงเทพฯ',
    notes: '',
    createdAt: new Date(),
  },
  {
    id: 'FS-003',
    customerName: 'คุณวิชัย มงคล',
    items: [
      { name: 'เลมอนโซดา', nameEn: 'Lemon Soda', quantity: 3, price: 35 },
    ],
    total: 125,
    status: 'pending',
    time: '23:18',
    address: '88 ถ.พระราม 4 แขวงสีลม กรุงเทพฯ',
    notes: 'น้ำแข็งน้อย',
    createdAt: new Date(),
  },
  {
    id: 'FS-004',
    customerName: 'คุณนิดา ศรีวลัย',
    items: [
      { name: 'กีวี', nameEn: 'Kiwi', quantity: 1, price: 45 },
      { name: 'แครอท', nameEn: 'Carrot', quantity: 1, price: 40 },
    ],
    total: 105,
    status: 'delivered',
    time: '22:55',
    address: '320 ถ.ลาดพร้าว แขวงวังทองหลาง กรุงเทพฯ',
    notes: '',
    createdAt: new Date(),
  },
  {
    id: 'FS-005',
    customerName: 'คุณธนา พงษ์เจริญ',
    items: [
      { name: 'แตงโมปั่น', nameEn: 'Watermelon Blend', quantity: 2, price: 38 },
    ],
    total: 96,
    status: 'delivered',
    time: '22:40',
    address: '55 ถ.เพชรบุรี แขวงมักกะสัน กรุงเทพฯ',
    notes: '',
    createdAt: new Date(),
  },
  {
    id: 'FS-006',
    customerName: 'คุณปราณี จิตดี',
    items: [
      { name: 'สตรอว์เบอร์รี่', nameEn: 'Strawberry', quantity: 1, price: 45 },
      { name: 'แตงโมปั่น', nameEn: 'Watermelon Blend', quantity: 1, price: 38 },
    ],
    total: 103,
    status: 'preparing',
    time: '22:22',
    address: '101 ถ.อโศก แขวงคลองเตยเหนือ กรุงเทพฯ',
    notes: 'ไม่ใส่น้ำแข็ง',
    createdAt: new Date(),
  },
  {
    id: 'FS-007',
    customerName: 'คุณอรรถ ว่างแจ้ง',
    items: [
      { name: 'มะม่วงปั่น', nameEn: 'Mango Blend', quantity: 2, price: 40 },
    ],
    total: 100,
    status: 'delivered',
    time: '22:05',
    address: '33 ถ.สาทร แขวงยานนาวา กรุงเทพฯ',
    notes: '',
    createdAt: new Date(),
  },
  {
    id: 'FS-008',
    customerName: 'คุณกนกวรรณ ทองดี',
    items: [
      { name: 'กีวี', nameEn: 'Kiwi', quantity: 2, price: 45 },
      { name: 'เลมอนโซดา', nameEn: 'Lemon Soda', quantity: 1, price: 35 },
    ],
    total: 145,
    status: 'pending',
    time: '21:48',
    address: '200 ถ.จันทน์ แขวงทุ่งวัดดอน กรุงเทพฯ',
    notes: 'หวานปกติ น้ำแข็งเยอะ',
    createdAt: new Date(),
  },
];

export const mockCustomerOrders: CustomerOrder[] = [
  {
    id: 'FS-2024-001',
    items: [
      { name: 'ส้ม', nameEn: 'Orange', quantity: 2, price: 40, emoji: '🍊', bgColor: '#FFF4E6', options: { type: 'cold', sweetness: 'normal', cup: 'ready', notes: '' } },
      { name: 'สตรอว์เบอร์รี่', nameEn: 'Strawberry', quantity: 1, price: 45, emoji: '🍓', bgColor: '#FFF0F5', options: { type: 'blended', sweetness: 'less', cup: 'separate', notes: 'น้ำแข็งน้อย' } },
    ],
    total: 125,
    status: 'delivered',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    address: '12/5 ถ.สุขุมวิท แขวงคลองเตย กรุงเทพฯ',
    notes: '',
    isReceived: true,
    rating: 5,
    review: 'อร่อยมากค่ะ น้ำผลไม้สดมาก จัดส่งเร็ว ประทับใจมาก!',
  },
  {
    id: 'FS-2024-002',
    items: [
      { name: 'มะม่วง', nameEn: 'Mango', quantity: 2, price: 40, emoji: '🥭', bgColor: '#FFF8E1', options: { type: 'blended', sweetness: 'normal', cup: 'ready', notes: '' } },
    ],
    total: 80,
    status: 'delivered',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    address: '12/5 ถ.สุขุมวิท แขวงคลองเตย กรุงเทพฯ',
    notes: 'ไม่ใส่น้ำแข็ง',
    isReceived: true,
    rating: 4,
    review: 'มะม่วงปั่นอร่อยดีครับ หวานพอดี แพ็คเกจดี',
  },
  {
    id: 'FS-2024-003',
    items: [
      { name: 'กีวี', nameEn: 'Kiwi', quantity: 1, price: 45, emoji: '🥝', bgColor: '#F0FFF0', options: { type: 'cold', sweetness: 'less', cup: 'ready', notes: '' } },
      { name: 'แครอท', nameEn: 'Carrot', quantity: 1, price: 40, emoji: '🥕', bgColor: '#FFF3E0', options: { type: 'cold', sweetness: 'normal', cup: 'separate', notes: '' } },
    ],
    total: 85,
    status: 'ready',
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    address: '12/5 ถ.สุขุมวิท แขวงคลองเตย กรุงเทพฯ',
    notes: '',
    isReceived: false,
  },
  {
    id: 'FS-2024-004',
    items: [
      { name: 'แตงโม', nameEn: 'Watermelon', quantity: 3, price: 38, emoji: '🍉', bgColor: '#FFE8EC', options: { type: 'blended', sweetness: 'normal', cup: 'ready', notes: '' } },
    ],
    total: 114,
    status: 'preparing',
    createdAt: new Date(Date.now() - 12 * 60 * 1000),
    address: '12/5 ถ.สุขุมวิท แขวงคลองเตย กรุงเทพฯ',
    notes: 'หวานน้อยนิด',
    isReceived: false,
  },
  {
    id: 'FS-2024-005',
    items: [
      { name: 'บลูเบอร์รี่', nameEn: 'Blueberry', quantity: 2, price: 50, emoji: '🫐', bgColor: '#EEF2FF', options: { type: 'blended', sweetness: 'normal', cup: 'ready', notes: '' } },
    ],
    total: 100,
    status: 'delivered',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    address: '12/5 ถ.สุขุมวิท แขวงคลองเตย กรุงเทพฯ',
    notes: '',
    isReceived: true,
  },
  {
    id: 'FS-2024-006',
    items: [
      { name: 'เลมอน', nameEn: 'Lemon', quantity: 2, price: 35, emoji: '🍋', bgColor: '#FFFFF0', options: { type: 'cold', sweetness: 'less', cup: 'separate', notes: 'เปรี้ยวมาก' } },
    ],
    total: 70,
    status: 'cancelled',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    address: '12/5 ถ.สุขุมวิท แขวงคลองเตย กรุงเทพฯ',
    notes: '',
    isReceived: false,
  },
  {
    id: 'FS-2024-007',
    items: [
      { name: 'บีทรูท', nameEn: 'Beet', quantity: 1, price: 45, emoji: '🫚', bgColor: '#FFF0F5', options: { type: 'cold', sweetness: 'normal', cup: 'ready', notes: '' } },
      { name: 'ผักโขม', nameEn: 'Spinach', quantity: 1, price: 42, emoji: '🥬', bgColor: '#ECFDF5', options: { type: 'blended', sweetness: 'less', cup: 'ready', notes: '' } },
    ],
    total: 87,
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    address: '12/5 ถ.สุขุมวิท แขวงคลองเตย กรุงเทพฯ',
    notes: 'ด่วนหน่อยนะคะ',
    isReceived: false,
  },
];

export const hourlyData = [
  { hour: '09:00', sales: 850, orders: 6 },
  { hour: '10:00', sales: 1200, orders: 9 },
  { hour: '11:00', sales: 1650, orders: 12 },
  { hour: '12:00', sales: 2300, orders: 16 },
  { hour: '13:00', sales: 1980, orders: 14 },
  { hour: '14:00', sales: 1450, orders: 10 },
  { hour: '15:00', sales: 1100, orders: 8 },
  { hour: '16:00', sales: 900, orders: 6 },
  { hour: '17:00', sales: 650, orders: 5 },
  { hour: '18:00', sales: 370, orders: 3 },
];

export const topSellers = [
  { name: 'ส้ม', nameEn: 'Orange', cups: 42, color: '#FF9500' },
  { name: 'แตงโม', nameEn: 'Watermelon', cups: 38, color: '#FF3B5C' },
  { name: 'มะม่วง', nameEn: 'Mango', cups: 35, color: '#FFCC00' },
  { name: 'เลมอน', nameEn: 'Lemon', cups: 31, color: '#34C759' },
  { name: 'สตรอว์เบอร์รี่', nameEn: 'Strawberry', cups: 28, color: '#FF6B8A' },
];

export const weeklyData = [
  { day: 'จันทร์', dayEn: 'Mon', sales: 8200, orders: 58 },
  { day: 'อังคาร', dayEn: 'Tue', sales: 9400, orders: 67 },
  { day: 'พุธ', dayEn: 'Wed', sales: 7800, orders: 55 },
  { day: 'พฤหัส', dayEn: 'Thu', sales: 11200, orders: 78 },
  { day: 'ศุกร์', dayEn: 'Fri', sales: 13600, orders: 95 },
  { day: 'เสาร์', dayEn: 'Sat', sales: 16800, orders: 118 },
  { day: 'อาทิตย์', dayEn: 'Sun', sales: 14200, orders: 100 },
];

export const categoryData = [
  { name: 'ผลไม้', nameEn: 'Fruit', value: 72, color: '#FF9500' },
  { name: 'ผัก', nameEn: 'Vegetable', value: 28, color: '#34C759' },
];

export const dashboardStats = {
  todaySales: 12450,
  totalOrders: 87,
  avgPerOrder: 143,
  growthRate: 12.5,
  ordersGrowth: 8.3,
};

export const aiResponses: Record<string, { th: string; en: string }> = {
  greeting: {
    th: 'สวัสดีค่ะ! ยินดีให้บริการ มีอะไรให้ช่วยไหมคะ? 😊',
    en: 'Hello! Happy to help. What can I do for you? 😊',
  },
  menu: {
    th: 'เรามีน้ำผลไม้สดและน้ำผักหลากหลายค่ะ ทั้งแบบเย็นและแบบปั่น ลองดูเมนูทั้งหมดได้เลยค่ะ 🍹',
    en: 'We have a variety of fresh fruit and vegetable juices, both cold and blended. Check our full menu! 🍹',
  },
  price: {
    th: 'ราคาของเราเริ่มต้นที่ 35 บาท สูงสุด 50 บาท ประหยัดดีมากค่ะ! 💰',
    en: 'Our prices start from 35 THB up to 50 THB. Very affordable! 💰',
  },
  delivery: {
    th: 'เราจัดส่งฟรีสำหรับออเดอร์แรกของวัน ระยะเวลาจัดส่งประมาณ 20-30 นาทีค่ะ 🛵',
    en: 'Free delivery on your first order of the day! Estimated delivery time is 20-30 minutes. 🛵',
  },
  recommend: {
    th: 'เมนูแนะนำของวันนี้คือ ส้ม 🍊 และสตรอว์เบอร์รี่ 🍓 อร่อยมากค่ะ!',
    en: 'Today\'s recommendations are Orange 🍊 and Strawberry 🍓. So delicious!',
  },
  hours: {
    th: 'ร้านเปิดทุกวัน 08:00 - 20:00 น. ค่ะ ☀️',
    en: 'We\'re open every day from 8:00 AM to 8:00 PM ☀️',
  },
  default: {
    th: 'ขอบคุณสำหรับคำถามค่ะ! หากต้องการข้อมูลเพิ่มเติม สามารถถามได้เลยนะคะ หรือดูเมนูทั้งหมดได้ที่หน้าเมนูค่ะ 🍹',
    en: 'Thanks for your question! Feel free to ask anything else or browse our full menu. 🍹',
  },
};