import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Button, RadioButton, TextInput, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cart';
import { colors } from '../../theme';

type BuyerType = 'individual' | 'legal';
type PaymentMethod = 'card' | 'kaspi' | 'invoice';

const formatPrice = (v: number) => new Intl.NumberFormat('ru-RU').format(v);

export default function CheckoutScreen({ navigation }: any) {
  const { totalAmount, totalBonusEarned, items, clearCart } = useCartStore();
  const [buyerType, setBuyerType] = useState<BuyerType>('individual');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('kaspi');
  const [bonusUse, setBonusUse] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  // Форма юрлица
  const [companyName, setCompanyName] = useState('');
  const [bin, setBin] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('+7');

  const total = totalAmount();
  const bonus = totalBonusEarned();
  const bonusApplied = parseInt(bonusUse) || 0;
  const finalTotal = total - bonusApplied;

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Заказ оформлен!',
        buyerType === 'legal'
          ? 'Счёт будет направлен на указанный email в течение 15 минут.'
          : paymentMethod === 'kaspi'
            ? 'Ожидайте push-уведомление от Kaspi для оплаты.'
            : 'Ваш заказ принят. Менеджер свяжется с вами для подтверждения.',
        [{
          text: 'ОК',
          onPress: () => {
            clearCart();
            navigation.navigate('CatalogTab');
          },
        }],
      );
    }, 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Сумма заказа */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Товаров</Text>
          <Text style={styles.summaryValue}>{items.length} поз.</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Сумма</Text>
          <Text style={styles.summaryValue}>{formatPrice(total)} тг</Text>
        </View>
        {bonusApplied > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Бонусы</Text>
            <Text style={[styles.summaryValue, { color: colors.accent }]}>-{formatPrice(bonusApplied)} тг</Text>
          </View>
        )}
        <Divider style={{ marginVertical: 10 }} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>К оплате</Text>
          <Text style={styles.totalValue}>{formatPrice(finalTotal)} тг</Text>
        </View>
        <View style={styles.cashbackHint}>
          <MaterialCommunityIcons name="star" size={14} color={colors.bonusGreen} />
          <Text style={styles.cashbackText}> Кэшбэк с покупки: +{formatPrice(bonus)} тг</Text>
        </View>
      </View>

      {/* Списание бонусов */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Списать бонусы</Text>
        <TextInput
          mode="outlined"
          value={bonusUse}
          onChangeText={setBonusUse}
          keyboardType="numeric"
          right={<TextInput.Affix text="тг" />}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          style={styles.input}
        />
      </View>

      {/* Тип покупателя */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Тип покупателя</Text>
        <View style={styles.buyerToggle}>
          <BuyerButton
            label="Физ. лицо"
            icon="account"
            active={buyerType === 'individual'}
            onPress={() => { setBuyerType('individual'); setPaymentMethod('kaspi'); }}
          />
          <BuyerButton
            label="Юр. лицо"
            icon="domain"
            active={buyerType === 'legal'}
            onPress={() => { setBuyerType('legal'); setPaymentMethod('invoice'); }}
          />
        </View>
      </View>

      {/* Способ оплаты */}
      {buyerType === 'individual' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Способ оплаты</Text>

          <PaymentOption
            icon="cellphone"
            label="Kaspi Pay"
            desc="Моментальная оплата через Kaspi"
            selected={paymentMethod === 'kaspi'}
            onPress={() => setPaymentMethod('kaspi')}
            accentColor="#F14635"
          />
          <PaymentOption
            icon="credit-card"
            label="Банковская карта"
            desc="Visa, Mastercard"
            selected={paymentMethod === 'card'}
            onPress={() => setPaymentMethod('card')}
            accentColor="#1a1a2e"
          />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Реквизиты для счёта</Text>
          <TextInput
            label="Название компании"
            value={companyName}
            onChangeText={setCompanyName}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />
          <TextInput
            label="БИН"
            value={bin}
            onChangeText={setBin}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />
          <TextInput
            label="Контактное лицо"
            value={contactName}
            onChangeText={setContactName}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />
          <TextInput
            label="Телефон"
            value={contactPhone}
            onChangeText={setContactPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          <View style={styles.invoiceHint}>
            <MaterialCommunityIcons name="file-document-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.invoiceHintText}>
              Счёт на оплату будет сформирован и отправлен на email в течение 15 минут
            </Text>
          </View>
        </View>
      )}

      {/* Кнопка */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting || finalTotal <= 0}
        style={styles.submitBtn}
        contentStyle={styles.submitBtnContent}
        buttonColor={colors.accent}
        textColor="#fff"
      >
        {buyerType === 'legal' ? 'Запросить счёт' : `Оплатить ${formatPrice(finalTotal)} тг`}
      </Button>
    </ScrollView>
  );
}

function BuyerButton({ label, icon, active, onPress }: { label: string; icon: any; active: boolean; onPress: () => void }) {
  return (
    <View style={[styles.buyerBtn, active && styles.buyerBtnActive]}>
      <RadioButton
        value=""
        status={active ? 'checked' : 'unchecked'}
        onPress={onPress}
        color={colors.accent}
      />
      <MaterialCommunityIcons name={icon} size={18} color={active ? colors.accent : colors.textMuted} />
      <Text style={[styles.buyerBtnText, active && styles.buyerBtnTextActive]}> {label}</Text>
    </View>
  );
}

function PaymentOption({ icon, label, desc, selected, onPress, accentColor }: {
  icon: any; label: string; desc: string; selected: boolean; onPress: () => void; accentColor: string;
}) {
  return (
    <View style={[styles.paymentOption, selected && { borderColor: accentColor }]}>
      <RadioButton value="" status={selected ? 'checked' : 'unchecked'} onPress={onPress} color={accentColor} />
      <MaterialCommunityIcons name={icon} size={22} color={selected ? accentColor : colors.textMuted} />
      <View style={styles.paymentInfo}>
        <Text style={[styles.paymentLabel, selected && { color: accentColor }]}>{label}</Text>
        <Text style={styles.paymentDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  content: { padding: 16, paddingBottom: 100 },

  // Summary
  summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.borderLight },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { color: colors.textSecondary, fontSize: 14 },
  summaryValue: { fontWeight: '600', fontSize: 14, color: colors.text },
  totalLabel: { fontWeight: '700', fontSize: 16, color: colors.text },
  totalValue: { fontWeight: '800', fontSize: 20, color: colors.primary },
  cashbackHint: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: colors.bonusGreenBg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  cashbackText: { color: colors.bonusGreen, fontSize: 13, fontWeight: '600' },

  // Section
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.borderLight },
  sectionTitle: { fontWeight: '700', color: colors.text, fontSize: 15, marginBottom: 12 },
  input: { backgroundColor: '#fff', marginBottom: 10 },

  // Buyer toggle
  buyerToggle: { flexDirection: 'row', gap: 10 },
  buyerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  buyerBtnActive: { borderColor: colors.accent, backgroundColor: 'rgba(255,0,0,0.04)' },
  buyerBtnText: { color: colors.textMuted, fontWeight: '500', fontSize: 13 },
  buyerBtnTextActive: { color: colors.accent },

  // Payment
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  paymentInfo: { flex: 1, marginLeft: 8 },
  paymentLabel: { fontWeight: '600', fontSize: 14, color: colors.text },
  paymentDesc: { color: colors.textMuted, fontSize: 12, marginTop: 1 },

  // Invoice hint
  invoiceHint: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.bgLight, borderRadius: 10, padding: 12, marginTop: 6 },
  invoiceHintText: { flex: 1, marginLeft: 8, color: colors.textSecondary, fontSize: 13, lineHeight: 18 },

  // Submit
  submitBtn: { borderRadius: 12, marginTop: 8 },
  submitBtnContent: { paddingVertical: 8 },
});
