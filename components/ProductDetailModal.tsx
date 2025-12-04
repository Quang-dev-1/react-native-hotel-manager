import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  description: string;
  sizes: string[];
  colors: string[];
}

interface ProductDetailModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (size: string, color: string) => void;
}

export default function ProductDetailModal({
  visible,
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      Alert.alert('Please select', 'Please select size and color');
      return;
    }
    onAddToCart(selectedSize, selectedColor);
  };

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#111" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Image
              source={{ uri: product.image }}
              style={styles.modalImage}
              resizeMode="cover"
            />

            <View style={styles.modalBody}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{product.name}</Text>
                  <View style={styles.modalRating}>
                    <Ionicons name="star" size={16} color="#fbbf24" />
                    <Text style={styles.modalRatingText}>
                      {product.rating} (125 reviews)
                    </Text>
                  </View>
                </View>
                <Text style={styles.modalPrice}>${product.price}</Text>
              </View>

              <Text style={styles.modalDescription}>{product.description}</Text>

              {/* Size Selection */}
              <View style={styles.optionSection}>
                <Text style={styles.optionLabel}>
                  Size: <Text style={styles.selectedText}>{selectedSize}</Text>
                </Text>
                <View style={styles.optionButtons}>
                  {product.sizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setSelectedSize(size)}
                      style={[
                        styles.optionButton,
                        selectedSize === size && styles.optionButtonActive,
                      ]}>
                      <Text
                        style={[
                          styles.optionButtonText,
                          selectedSize === size && styles.optionButtonTextActive,
                        ]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Color Selection */}
              <View style={styles.optionSection}>
                <Text style={styles.optionLabel}>
                  Color: <Text style={styles.selectedText}>{selectedColor}</Text>
                </Text>
                <View style={styles.optionButtons}>
                  {product.colors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      style={[
                        styles.optionButton,
                        selectedColor === color && styles.optionButtonActive,
                      ]}>
                      <Text
                        style={[
                          styles.optionButtonText,
                          selectedColor === color && styles.optionButtonTextActive,
                        ]}>
                        {color}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                <LinearGradient
                  colors={['#1f2035ff', '#151165ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addToCartGradient}>
                  <Ionicons name="bag-handle-outline" size={20} color="#fff" />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalBody: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalRatingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2035ff',
  },
  modalDescription: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 24,
  },
  optionSection: {
    marginBottom: 24,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111',
  },
  selectedText: {
    color: '#1f2035ff',
    fontWeight: '700',
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#f3f4f6',
  },
  optionButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#1f2035ff',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  optionButtonTextActive: {
    color: '#1f2035ff',
    fontWeight: '600',
  },
  addToCartButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  addToCartGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});