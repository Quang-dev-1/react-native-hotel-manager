import ProductDetailModal from '@/components/ProductDetailModal';
import { useCart } from '@/contexts/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const products = [
  {
    id: 1,
    name: 'Classic White Tee',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1693443688057-85f57b872a3c?w=400',
    category: 'Tops',
    rating: 4.5,
    description: 'A timeless classic white t-shirt made from premium cotton. Perfect for any casual occasion.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Gray'],
  },
  {
    id: 2,
    name: 'Denim Jacket',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1706765779494-2705542ebe74?w=400',
    category: 'Jackets',
    rating: 4.8,
    description: 'Stylish denim jacket with a modern fit. Great for layering in any season.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black'],
  },
  {
    id: 3,
    name: 'Summer Dress',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1635447272615-a414b7ea1df4?w=400',
    category: 'Dresses',
    rating: 4.7,
    description: 'Light and breezy summer dress perfect for warm weather. Comfortable and elegant.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['White', 'Pink', 'Yellow'],
  },
  {
    id: 4,
    name: 'Premium Sneakers',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1656944227480-98180d2a5155?w=400',
    category: 'Shoes',
    rating: 4.9,
    description: 'High-quality sneakers with superior comfort and style. Perfect for everyday wear.',
    sizes: ['38', '39', '40', '41', '42'],
    colors: ['White', 'Black', 'Navy'],
  },
  {
    id: 5,
    name: 'Casual Outfit',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1708317031389-1afe5ccc6f96?w=400',
    category: 'Sets',
    rating: 4.6,
    description: 'Complete casual outfit set. Coordinated pieces for effortless style.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Gray', 'Navy'],
  },
  {
    id: 6,
    name: 'Fashion Collection',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1694452243646-959eef618dad?w=400',
    category: 'Premium',
    rating: 5.0,
    description: 'Premium fashion collection featuring the latest trends and highest quality materials.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Multi'],
  },
];

const categories = ['All', 'Tops', 'Jackets', 'Dresses', 'Shoes', 'Sets'];

export default function ShopScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);

  const { addToCart, cartCount } = useCart();

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (product: typeof products[0], size: string, color: string) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      size: size,
      color: color,
    });

    Alert.alert(
      'Added to Cart',
      `${product.name} (${size}, ${color}) has been added to your cart`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        {
          text: 'View Cart',
          onPress: () => router.push('/(tabs)/cart')
        }
      ]
    );
  };

  const handleAddToCartFromDetail = (size: string, color: string) => {
    if (selectedProduct) {
      handleAddToCart(selectedProduct, size, color);
      setSelectedProduct(null);
    }
  };

  const goToCart = () => {
    router.push('/(tabs)/cart');
  };

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === 'All' || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#1f2035ff', '#151165ff']}
              style={styles.logoGradient}>
              <Image
                style={{ width: 50, height: 50 }}
                source={require('../../assets/images/logo_shopp.png')}
              />
            </LinearGradient>
            <Text style={styles.logoText}>QApparel</Text>
          </View>

          {/* Cart Button */}
          <TouchableOpacity
            style={styles.cartContainer}
            onPress={goToCart}>
            <Ionicons name="bag-handle-outline" size={24} color="#111" />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for clothes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          <Ionicons name="options-outline" size={20} color="#9ca3af" />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <ScrollView
        contentContainerStyle={styles.productsContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => setSelectedProduct(product)}
              activeOpacity={0.9}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  style={styles.favoriteButton}>
                  <Ionicons
                    name={favorites.includes(product.id) ? 'heart' : 'heart-outline'}
                    size={20}
                    color={favorites.includes(product.id) ? '#c42228ff' : '#6b7280'}
                  />
                </TouchableOpacity>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{product.category}</Text>
                </View>
              </View>

              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={styles.ratingText}>{product.rating}</Text>
                </View>
                <View style={styles.productFooter}>
                  <Text style={styles.price}>${product.price}</Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    style={styles.addButton}>
                    <LinearGradient
                      colors={['#1f2035ff', '#151165ff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.addButtonGradient}>
                      <Text style={styles.addButtonText}>Select</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={selectedProduct !== null}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCartFromDetail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoGradient: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
  },
  cartContainer: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#151165ff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    padding: 16,
    height: 48,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#1f2035ff',
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productsContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2035ff',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  productCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    aspectRatio: 1,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#130644ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2035ff',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});