export const ITEM_CATEGORIES = [
  'College ID Card',
  'Wallet / Purse',
  'Smartphones & Tablets',
  'Earphones & Headphones',
  'Laptops & Chargers',
  'Books & Notebooks',
  'Keys & Keychains',
  'Bags & Backpacks',
  'Water Bottles & Flasks',
  'Watches & Smartbands',
  'Scientific Calculators',
  'Eyeglasses & Cases',
  'Sports Equipment',
  'Lab Coats & Uniforms',
  'Other Belongings',
] as const;

export const CAMPUS_LOCATIONS = [
  { area: 'Central Library', zones: ['1st Floor Reading Room', '2nd Floor Book Stacks', 'Digital Reference Section', 'Entrance Turnstiles'] },
  { area: 'Academic Block A (CSE & IT)', zones: ['AI & ML Lab 304', 'Cloud Computing Lab 202', 'Lecture Hall 101', 'Corridor 2nd Floor'] },
  { area: 'Academic Block B (Mech & Civil)', zones: ['Drawing Hall', 'Robotics Lab', 'Workshop B-Ground', 'Seminar Hall 3'] },
  { area: 'Student Canteen & Food Court', zones: ['Main Dining Hall', 'Juice & Coffee Counter', 'Outdoor Pavilion', 'Billing Counter'] },
  { area: 'Central Auditorium', zones: ['Main Hall Seats', 'Backstage Green Room', 'Foyer & Reception', 'Balcony Area'] },
  { area: 'Sports Complex & Gymnasium', zones: ['Badminton Courts', 'Gym Fitness Floor', 'Basketball Arena', 'Locker Room Area'] },
  { area: 'Administrative Block', zones: ['Dean Office Lobby', 'Examination Cell', 'Accounts & Fee Counter', 'Student Affairs Desk'] },
  { area: 'Campus Bus Stand & Parking', zones: ['Student 2-Wheeler Parking', 'Bus Bay 4-6', 'Main Campus Gate Security', 'Staff Parking'] },
  { area: 'Boys Hostels (A & B)', zones: ['Mess Dining Hall', 'Common Study Room', 'Ground Floor Lobby'] },
  { area: 'Girls Hostels (C & D)', zones: ['Mess Dining Hall', 'Reading Area', 'Visitor Lounge'] },
] as const;

export const COMMON_COLORS = [
  'Black',
  'Blue',
  'Dark Navy',
  'Silver / Gray',
  'White',
  'Red',
  'Brown / Tan',
  'Green',
  'Yellow / Gold',
  'Purple',
  'Pink',
  'Multicolor / Patterned',
] as const;

export const STATUS_CONFIG = {
  LOST: {
    label: 'Lost',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    description: 'Reported lost by owner. Seeking finders.',
  },
  FOUND: {
    label: 'Found',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    description: 'Found on campus. Awaiting rightful owner.',
  },
  POTENTIAL_MATCH: {
    label: 'Potential Match',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    description: 'AI detected a strong correlation with another report.',
  },
  CLAIMED: {
    label: 'Claimed',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    description: 'A student has submitted an ownership claim.',
  },
  VERIFICATION_PENDING: {
    label: 'Verification Pending',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    description: 'Claim under authorized review or physical handover.',
  },
  RETURNED: {
    label: 'Returned',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
    description: 'Verified and successfully restored to owner!',
  },
  CLOSED: {
    label: 'Closed',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-400',
    description: 'Case resolved or expired.',
  },
} as const;
