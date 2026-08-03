-- ============================================
-- Euroschool Sleepover Food Ordering Portal
-- Seed Data
-- ============================================

-- ============================================
-- RESTAURANTS
-- ============================================
INSERT INTO restaurants (id, name, type, is_active) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'McDonald''s', 'dinner', true),
  ('b2222222-2222-2222-2222-222222222222', 'Local Breakfast Vendor', 'breakfast', true);

-- ============================================
-- SETTINGS
-- ============================================
INSERT INTO settings (key, value, description) VALUES
  ('event_name', 'Euroschool Sleepover 2026', 'Name of the event'),
  ('event_date_start', '2026-08-21T17:00:00+05:30', 'Event start date and time'),
  ('event_date_end', '2026-08-22T10:00:00+05:30', 'Event end date and time'),
  ('reporting_time', '5:00 PM', 'Student reporting time'),
  ('ordering_deadline', '2026-08-20T23:59:59+05:30', 'Deadline for placing orders'),
  ('ordering_open', 'true', 'Whether ordering is currently open'),
  ('dinner_restaurant', 'McDonald''s', 'Dinner restaurant name'),
  ('breakfast_restaurant', 'Local Breakfast Vendor', 'Breakfast restaurant name');

-- ============================================
-- DINNER ITEMS (McDonald's Menu - Pune Prices)
-- ============================================
INSERT INTO dinner_items (name, description, price, category, veg_status, platform, available, restaurant_id, sort_order) VALUES
  -- Burgers
  ('McAloo Tikki Burger', 'Crispy aloo tikki patty with fresh lettuce and tangy mayo', 62.00, 'Burgers', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 1),
  ('McVeggie Burger', 'Veggie patty with lettuce, mayo, and cheese', 120.00, 'Burgers', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 2),
  ('McSpicy Paneer Burger', 'Spicy paneer patty with habanero sauce and crispy lettuce', 180.00, 'Burgers', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 3),
  ('Veg Maharaja Mac', 'Double veggie patty, cheese, lettuce, onions, and special sauce', 210.00, 'Burgers', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 4),
  ('McChicken Burger', 'Tender chicken patty with creamy mayo and shredded lettuce', 150.00, 'Burgers', 'non-veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 5),
  ('Chicken Maharaja Mac', 'Double chicken patty with habanero sauce, onions, and lettuce', 250.00, 'Burgers', 'non-veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 6),
  ('McSpicy Chicken Burger', 'Spicy crispy chicken patty with habanero sauce', 190.00, 'Burgers', 'non-veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 7),

  -- Wraps
  ('McAloo Tikki Wrap', 'McAloo Tikki wrapped in a soft tortilla with veggies', 90.00, 'Wraps', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 8),
  ('Paneer Wrap', 'Crispy paneer strips with veggies in a tortilla wrap', 170.00, 'Wraps', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 9),
  ('Chicken Wrap', 'Grilled chicken with lettuce and mayo in a tortilla', 180.00, 'Wraps', 'non-veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 10),

  -- Sides
  ('French Fries (Small)', 'Golden crispy fries - small portion', 79.00, 'Sides', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 11),
  ('French Fries (Medium)', 'Golden crispy fries - medium portion', 119.00, 'Sides', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 12),
  ('French Fries (Large)', 'Golden crispy fries - large portion', 149.00, 'Sides', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 13),
  ('Veg Pizza McPuff', 'Crispy pastry filled with spicy pizza-flavored veggies', 50.00, 'Sides', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 14),
  ('Chicken McNuggets (6 Pcs)', '6 pieces of crispy chicken nuggets', 150.00, 'Sides', 'non-veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 15),
  ('Chicken McNuggets (9 Pcs)', '9 pieces of crispy chicken nuggets', 200.00, 'Sides', 'non-veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 16),

  -- Beverages
  ('Coca-Cola (Medium)', 'Refreshing Coca-Cola', 85.00, 'Beverages', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 17),
  ('Coca-Cola (Large)', 'Refreshing Coca-Cola - large', 115.00, 'Beverages', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 18),
  ('Fanta (Medium)', 'Refreshing orange Fanta', 85.00, 'Beverages', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 19),
  ('Sprite (Medium)', 'Refreshing lemon-lime Sprite', 85.00, 'Beverages', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 20),
  ('Cappuccino (Small)', 'Hot frothy cappuccino', 129.00, 'Beverages', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 21),
  ('Chocolate Shake (Medium)', 'Rich and creamy chocolate milkshake', 135.00, 'Beverages', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 22),
  ('Strawberry Shake (Medium)', 'Sweet strawberry milkshake', 135.00, 'Beverages', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 23),

  -- Desserts
  ('McFlurry Oreo', 'Vanilla soft serve with Oreo cookie crumbles', 130.00, 'Desserts', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 24),
  ('McFlurry KitKat', 'Vanilla soft serve with KitKat pieces', 130.00, 'Desserts', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 25),
  ('Soft Serve Cone', 'Classic vanilla soft serve cone', 40.00, 'Desserts', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 26),
  ('Hot Fudge Sundae', 'Vanilla soft serve drizzled with hot fudge', 60.00, 'Desserts', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 27),

  -- Combos/Meals
  ('McAloo Tikki Meal', 'McAloo Tikki + Medium Fries + Medium Coke', 170.00, 'Combos', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 28),
  ('McVeggie Meal', 'McVeggie + Medium Fries + Medium Coke', 240.00, 'Combos', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 29),
  ('McSpicy Paneer Meal', 'McSpicy Paneer + Medium Fries + Medium Coke', 290.00, 'Combos', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 30),
  ('McChicken Meal', 'McChicken + Medium Fries + Medium Coke', 270.00, 'Combos', 'non-veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 31);

-- ============================================
-- BREAKFAST ITEMS
-- ============================================
INSERT INTO breakfast_items (name, description, price, veg_status, available, restaurant_id, sort_order) VALUES
  ('Vada Pav', 'Classic Mumbai-style vada pav with chutneys', 30.00, 'veg', true, 'b2222222-2222-2222-2222-222222222222', 1),
  ('Samosa', 'Crispy triangular pastry filled with spiced potatoes and peas', 25.00, 'veg', true, 'b2222222-2222-2222-2222-222222222222', 2),
  ('Sandwich', 'Fresh vegetable sandwich with butter and chutney', 50.00, 'veg', true, 'b2222222-2222-2222-2222-222222222222', 3);
