import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { Product, Category } from '../../types';
import { useCartStore } from '../../store/cart';
import { colors } from '../../theme';

const formatPrice = (v: number) => new Intl.NumberFormat('ru-RU').format(v);

// ─── Иконки и цвета для категорий ───
const CAT_META: Record<string, { icon: string; color: string }> = {
  'Сортовой прокат': { icon: 'iron-board', color: '#5C6BC0' },
  'Листовой прокат': { icon: 'rectangle-outline', color: '#26A69A' },
  'Трубный прокат': { icon: 'pipe', color: '#EF6C00' },
  'Фасонный прокат': { icon: 'alpha-i-box-outline', color: '#8D6E63' },
  'Нержавеющий прокат': { icon: 'shield-star', color: '#78909C' },
  'Трубопроводная арматура': { icon: 'valve', color: '#EC407A' },
  'Метизы': { icon: 'screw-round-top', color: '#7E57C2' },
  'Сэндвич-панели': { icon: 'layers-triple', color: '#FF7043' },
  'Запорная арматура': { icon: 'valve', color: '#AB47BC' },
};

function getMeta(name: string) {
  return CAT_META[name] || { icon: 'package-variant', color: '#607D8B' };
}

// ═══════════════════════════════════════
// Вид 1: Главная — сетка категорий + популярное
// ═══════════════════════════════════════
function CategoryGrid({ categories, onSelect, onSearch, cartCount, onCartPress }: {
  categories: Category[]; onSelect: (cat: Category) => void; onSearch: () => void; cartCount: number; onCartPress: () => void;
}) {
  const [popular, setPopular] = useState<Product[]>([]);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    api.get('/products', { params: { limit: 6 } }).then(({ data }) => {
      setPopular(data.items || []);
    }).catch(() => {});
  }, []);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={s.heroHeader}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroTitle}>StalFed</Text>
              <Text style={s.heroSub}>Металлопрокат по всему Казахстану</Text>
            </View>
            <TouchableOpacity style={s.cartBtn} onPress={onCartPress}>
              <MaterialCommunityIcons name="cart-outline" size={22} color="#fff" />
              {cartCount > 0 && (
                <View style={s.cartBadge}>
                  <Text style={s.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search inside hero */}
          <TouchableOpacity onPress={onSearch} activeOpacity={0.8}>
            <View style={s.heroSearch}>
              <MaterialCommunityIcons name="magnify" size={20} color="#999" />
              <Text style={s.heroSearchText}>Арматура, лист, труба...</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Filters row */}
        <View style={s.filterRow}>
          <Text style={s.sectionLabel}>Каталог</Text>
        </View>

        {/* Categories grid */}
        <View style={s.catGrid}>
          {categories.map((cat) => {
            const meta = getMeta(cat.name);
            const subCount = cat.children?.length || 0;
            return (
              <TouchableOpacity
                key={cat.id}
                style={s.catCard}
                onPress={() => onSelect(cat)}
                activeOpacity={0.7}
              >
                <View style={[s.catIcon, { backgroundColor: meta.color + '15' }]}>
                  <MaterialCommunityIcons name={meta.icon as any} size={26} color={meta.color} />
                </View>
                <Text style={s.catName} numberOfLines={2}>{cat.name}</Text>
                {subCount > 0 && (
                  <Text style={s.catCount}>{subCount} подкат.</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Popular section */}
        {popular.length > 0 && (
          <>
            <Text style={[s.sectionLabel, { marginTop: 24 }]}>Популярные товары</Text>
            {popular.map((item) => (
              <View key={item.id} style={s.popularCard}>
                {item.images?.[0] ? (
                  <Image source={{ uri: item.images[0] }} style={s.popularImg} />
                ) : (
                  <View style={[s.popularImg, s.prodImagePlaceholder]}>
                    <MaterialCommunityIcons name="image-off" size={20} color="#ccc" />
                  </View>
                )}
                <View style={s.popularBody}>
                  <Text style={s.popularName} numberOfLines={1}>{item.name}</Text>
                  {Number(item.price) > 0 ? (
                    <Text style={s.popularPrice}>{formatPrice(Number(item.price))} тг</Text>
                  ) : (
                    <Text style={s.prodPriceRequest}>Цена по запросу</Text>
                  )}
                </View>
                <TouchableOpacity style={s.addBtn} onPress={() => addItem(item)}>
                  <MaterialCommunityIcons name="cart-plus" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <TouchableOpacity style={s.floatingCart} onPress={onCartPress} activeOpacity={0.8}>
          <MaterialCommunityIcons name="cart" size={20} color="#fff" />
          <Text style={s.floatingCartText}>Корзина ({cartCount})</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ═══════════════════════════════════════
// Вид 2: Подкатегории выбранной категории
// ═══════════════════════════════════════
function SubcategoryList({ category, onSelect, onBack }: {
  category: Category; onSelect: (sub: Category) => void; onBack: () => void;
}) {
  const meta = getMeta(category.name);
  const subs = category.children || [];

  return (
    <View style={s.container}>
      {/* Back header */}
      <TouchableOpacity style={s.backHeader} onPress={onBack}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        <Text style={s.backTitle}>{category.name}</Text>
      </TouchableOpacity>

      <FlatList
        data={subs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.subCard} onPress={() => onSelect(item)} activeOpacity={0.7}>
            <View style={[s.subIcon, { backgroundColor: meta.color + '12' }]}>
              <MaterialCommunityIcons name={meta.icon as any} size={22} color={meta.color} />
            </View>
            <View style={s.subBody}>
              <Text style={s.subName}>{item.name}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <TouchableOpacity style={[s.subCard, { backgroundColor: meta.color + '08' }]} onPress={() => onSelect(category)} activeOpacity={0.7}>
            <View style={[s.subIcon, { backgroundColor: meta.color + '20' }]}>
              <MaterialCommunityIcons name="view-grid" size={22} color={meta.color} />
            </View>
            <View style={s.subBody}>
              <Text style={[s.subName, { color: meta.color }]}>Все товары</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={meta.color} />
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <Text style={s.emptyText}>Нет подкатегорий</Text>
        }
      />
    </View>
  );
}

// ═══════════════════════════════════════
// Вид 3: Список товаров
// ═══════════════════════════════════════
function ProductList({ categoryId, categoryName, onBack, navigation }: {
  categoryId: string; categoryName: string; onBack: () => void; navigation: any;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.itemCount)();

  const handleAdd = (item: Product) => {
    addItem(item);
    setToast(`${item.name.substring(0, 25)}... добавлен`);
    setTimeout(() => setToast(''), 2000);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/products', { params: { categoryId, limit: 100 } });
        setProducts(data.items);
      } catch {}
      setLoading(false);
    })();
  }, [categoryId]);

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.backHeader} onPress={onBack}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        <Text style={s.backTitle}>{categoryName}</Text>
        <Text style={s.backCount}>{products.length} товаров</Text>
      </TouchableOpacity>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        renderItem={({ item }) => {
          const isPromo = Number(item.bonusMultiplier) > 1;
          return (
            <TouchableOpacity
              style={s.prodCard}
              onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
              activeOpacity={0.7}
            >
              {item.images && item.images.length > 0 && item.images[0] ? (
                <Image source={{ uri: item.images[0] }} style={s.prodImage} />
              ) : (
                <View style={[s.prodImage, s.prodImagePlaceholder]}>
                  <MaterialCommunityIcons name="image-off" size={24} color="#ccc" />
                </View>
              )}
              <View style={s.prodBody}>
                <Text style={s.prodName} numberOfLines={2}>{item.name}</Text>
                {Number(item.price) > 0 ? (
                  <Text style={s.prodPrice}>{formatPrice(Number(item.price))} тг{item.unit ? ` / ${item.unit}` : ''}</Text>
                ) : (
                  <Text style={s.prodPriceRequest}>Цена по запросу</Text>
                )}
                <View style={s.prodBadgeRow}>
                  <View style={[s.badge, isPromo && s.badgePromo]}>
                    <Text style={[s.badgeText, isPromo && s.badgeTextPromo]}>
                      {item.bonusValue}% кэшбэк
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={s.addBtn} onPress={() => handleAdd(item)}>
                <MaterialCommunityIcons name="cart-plus" size={20} color={colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          loading ? null : (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <MaterialCommunityIcons name="package-variant" size={48} color="#ddd" />
              <Text style={s.emptyText}>Товаров в этой категории пока нет</Text>
            </View>
          )
        }
      />

      {/* Toast notification */}
      {toast !== '' && (
        <View style={s.toast}>
          <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
          <Text style={s.toastText}> {toast}</Text>
        </View>
      )}

      {/* Floating cart */}
      {cartCount > 0 && (
        <TouchableOpacity style={s.floatingCart} onPress={() => navigation.navigate('Cart')} activeOpacity={0.8}>
          <MaterialCommunityIcons name="cart" size={20} color="#fff" />
          <Text style={s.floatingCartText}>Корзина ({cartCount})</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ═══════════════════════════════════════
// Вид 4: Поиск
// ═══════════════════════════════════════
function SearchView({ onBack, navigation }: { onBack: () => void; navigation: any }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get('/products', { params: { search: query, limit: 30 } });
        setResults(data.items);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <View style={s.container}>
      <View style={s.searchHeader}>
        <TouchableOpacity onPress={onBack} style={{ marginRight: 10 }}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Searchbar
          placeholder="Арматура, лист, труба..."
          value={query}
          onChangeText={setQuery}
          style={s.searchBarActive}
          inputStyle={{ fontSize: 14 }}
          elevation={0}
          autoFocus
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.prodCard}
            onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
            activeOpacity={0.7}
          >
            <View style={s.prodBody}>
              <Text style={s.prodName} numberOfLines={1}>{item.name}</Text>
              <Text style={s.prodComp}>{item.category?.name}</Text>
              <Text style={s.prodPrice}>{formatPrice(Number(item.price))} тг / {item.unit}</Text>
            </View>
            <TouchableOpacity style={s.addBtn} onPress={() => addItem(item)}>
              <MaterialCommunityIcons name="cart-plus" size={20} color={colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length >= 2 ? (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <MaterialCommunityIcons name="magnify" size={48} color="#ddd" />
              <Text style={s.emptyText}>Ничего не найдено</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

// ═══════════════════════════════════════
// Главный компонент
// ═══════════════════════════════════════
type Screen = 'categories' | 'subcategories' | 'products' | 'search';

export default function CatalogScreen({ navigation }: any) {
  const [screen, setScreen] = useState<Screen>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [selectedSubName, setSelectedSubName] = useState<string>('');
  const cartCount = useCartStore((s) => s.itemCount)();

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  if (screen === 'search') {
    return <SearchView onBack={() => setScreen('categories')} navigation={navigation} />;
  }

  if (screen === 'products' && selectedSubId) {
    return (
      <ProductList
        categoryId={selectedSubId}
        categoryName={selectedSubName}
        onBack={() => {
          if (selectedCat?.children?.length) setScreen('subcategories');
          else setScreen('categories');
        }}
        navigation={navigation}
      />
    );
  }

  if (screen === 'subcategories' && selectedCat) {
    return (
      <SubcategoryList
        category={selectedCat}
        onBack={() => setScreen('categories')}
        onSelect={(sub) => {
          setSelectedSubId(sub.id);
          setSelectedSubName(sub.name);
          setScreen('products');
        }}
      />
    );
  }

  return (
    <CategoryGrid
      categories={categories}
      cartCount={cartCount}
      onCartPress={() => navigation.navigate('Cart')}
      onSelect={(cat) => {
        setSelectedCat(cat);
        if (cat.children && cat.children.length > 0) {
          setScreen('subcategories');
        } else {
          setSelectedSubId(cat.id);
          setSelectedSubName(cat.name);
          setScreen('products');
        }
      }}
      onSearch={() => setScreen('search')}
    />
  );
}

// ═══════════════════════════════════════
// Стили
// ═══════════════════════════════════════
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },

  // Hero header
  heroHeader: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 1 },
  cartBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: colors.accent, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  heroSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginTop: 14 },
  heroSearchText: { color: '#999', marginLeft: 8, fontSize: 14 },

  // Section & filter
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
  sectionLabel: { fontWeight: '700', fontSize: 16, color: colors.text, marginHorizontal: 16, marginTop: 16, marginBottom: 10 },

  // Categories grid
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  catCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 2,
  },
  catIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  catName: { fontWeight: '600', fontSize: 13, color: colors.text, lineHeight: 17 },
  catCount: { color: colors.textMuted, fontSize: 11, marginTop: 3 },

  // Popular
  popularCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: colors.borderLight },
  popularImg: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#f5f5f5', marginRight: 10 },
  popularBody: { flex: 1 },
  popularName: { fontWeight: '600', fontSize: 13, color: colors.text },
  popularPrice: { fontWeight: '700', fontSize: 14, color: colors.primary, marginTop: 2 },

  // Floating cart
  floatingCart: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  floatingCartText: { color: '#fff', fontWeight: '700', fontSize: 15, flex: 1, marginLeft: 10 },

  // Back header
  backHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  backTitle: { fontWeight: '700', fontSize: 16, color: colors.text, marginLeft: 10, flex: 1 },
  backCount: { color: colors.textMuted, fontSize: 13 },

  // Subcategory
  subCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.borderLight },
  subIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  subBody: { flex: 1 },
  subName: { fontWeight: '600', fontSize: 15, color: colors.text },

  // Product card
  prodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.borderLight },
  prodImage: { width: 56, height: 56, borderRadius: 10, marginRight: 12, backgroundColor: '#f5f5f5' },
  prodImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  prodBody: { flex: 1 },
  prodName: { fontWeight: '700', fontSize: 14, color: colors.text },
  prodComp: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  prodPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  prodPrice: { fontWeight: '700', fontSize: 15, color: colors.primary, marginTop: 3 },
  prodPriceRequest: { fontSize: 13, color: colors.warning, fontWeight: '600', marginTop: 3 },
  prodUnit: { color: colors.textMuted, fontSize: 12, marginLeft: 3 },
  prodBadgeRow: { marginTop: 5 },
  badge: { backgroundColor: colors.bonusGreenBg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  badgePromo: { backgroundColor: colors.promoBg },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.bonusGreen },
  badgeTextPromo: { color: colors.promoOrange },
  addBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f0f4ff', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

  // Search
  searchHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  searchBarActive: { flex: 1, backgroundColor: colors.bgLight, borderRadius: 10, height: 42 },

  // Toast
  toast: { position: 'absolute', top: 60, left: 20, right: 20, backgroundColor: colors.bonusGreen, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5, zIndex: 100 },
  toastText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  emptyText: { color: colors.textMuted, marginTop: 8, textAlign: 'center' },
});
