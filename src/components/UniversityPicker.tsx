import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, shadows, commonStyles } from '../utils/styles';
import { logWarning } from '../utils/logger';
import { colors } from '../utils/colors';
import { t } from '../i18n';
import { getUniversityLogo } from '../utils/universityLogos';
import { logoStorageService } from '../services/storageService';
import { createUrlSlug } from '../utils/slugify';

const { width: screenWidth } = Dimensions.get('window');

interface UniversityPickerProps {
  value?: string;
  onChange: (name: string, isOther?: boolean) => void;
  popular: string[];
  placeholder?: string;
}

export const UniversityPicker: React.FC<UniversityPickerProps> = ({
  value,
  onChange,
  popular,
  placeholder = t('field_university'),
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleUniversitySelect = (universityName: string) => {
    onChange(universityName, false);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };
  
  // Get universities without "other university" option for the main list
  const regularUniversities = useMemo(() => {
    const otherUni = t('other_university');
    return popular.filter(uni => uni !== otherUni);
  }, [popular, t]);
  const allUniversities = useMemo(() => {
    // Always add "other university" option at the end
    const otherUni = t('other_university');
    return [...regularUniversities, otherUni];
  }, [regularUniversities, t]);

  const renderUniversityItem = ({ item }: { item: string }) => {
    // Special styling for "other university" option
    const isOtherUniversity = item === t('other_university');
    
    // Logo logic for regular universities
    let logoSource = null;
    let useUri = false;
    
    if (!isOtherUniversity) {
      // Try local logo first, then storage URL
      const localLogo = getUniversityLogo(item);
      if (localLogo) {
        logoSource = localLogo;
        useUri = false;
      } else {
        // Fallback to storage URL if needed
        const universitySlug = createUrlSlug(item);
        const storageLogoUrl = logoStorageService.getUniversityLogoUrlWithFallbacks(universitySlug);
        if (storageLogoUrl) {
          logoSource = storageLogoUrl;
          useUri = true;
        }
      }
    }
    
    return (
      <TouchableOpacity
        style={styles.universityItem}
        onPress={() => handleUniversitySelect(item)}
      >
        <View style={styles.universityContent}>
          {isOtherUniversity ? (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="add-circle" size={20} color={colors.ai.primary} />
            </View>
          ) : logoSource ? (
            <Image 
              source={useUri ? { uri: logoSource } : logoSource} 
              style={styles.universityLogo}
              onError={() => {
                logWarning('UniversityPicker', `Failed to load university logo: ${logoSource}`);
              }}
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="school" size={20} color={colors.text.tertiary} />
            </View>
          )}
          <Text style={[
            styles.universityName,
            isOtherUniversity && styles.otherUniversityText
          ]}>{item}</Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={colors.text.tertiary} 
        />
      </TouchableOpacity>
    );
  };

  // Get logo for selected university
  const getSelectedLogo = () => {
    if (!value) return null;
    
    // Special case for "other university"
    if (value === t('other_university')) {
      return null; // No logo for "other university"
    }
    
    // Try local logo first
    const localLogo = getUniversityLogo(value);
    if (localLogo) {
      return { source: localLogo, useUri: false };
    }
    
    // Fallback to storage URL if needed
    const universitySlug = createUrlSlug(value);
    const storageLogoUrl = logoStorageService.getUniversityLogoUrlWithFallbacks(universitySlug);
    if (storageLogoUrl) {
      return { source: { uri: storageLogoUrl }, useUri: true };
    }
    
    return null;
  };
  
  const selectedLogoInfo = getSelectedLogo();

  return (
    <>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={value ? `${t('field_university')}: ${value}` : placeholder}
        accessibilityHint={t('university_picker_hint')}
      >
        <View style={styles.pickerContent}>
          {selectedLogoInfo && (
            <Image 
              source={selectedLogoInfo.source} 
              style={styles.pickerLogo}
              onError={() => {
                logWarning('UniversityPicker', `Failed to load selected university logo: ${selectedLogoInfo.source}`);
              }}
            />
          )}
          <Text style={[
            styles.pickerText,
            !value && styles.placeholder,
            selectedLogoInfo && styles.pickerTextWithLogo
          ]}>
            {value || placeholder}
          </Text>
        </View>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={colors.text.tertiary} 
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCancel}
              accessibilityLabel={t('btn_cancel')}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {t('university_picker_title')}
            </Text>
            <View style={styles.closeButton} />
          </View>
          
          <FlatList
            data={allUniversities}
            renderItem={renderUniversityItem}
            keyExtractor={(item, index) => `${item}-${index}`}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={15}
            windowSize={10}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 48,
    ...shadows.small,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pickerLogo: {
    width: 24,
    height: 24,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  pickerText: {
    ...commonStyles.bodyMD,
    color: colors.text.primary,
    flex: 1,
  },
  pickerTextWithLogo: {
    marginLeft: 0,
  },
  placeholder: {
    color: colors.text.tertiary,
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...commonStyles.headingMD,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  
  list: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  universityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  universityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  universityLogo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    marginRight: spacing.md,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'transparent',
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  universityName: {
    ...commonStyles.bodyMD,
    color: colors.text.primary,
    flex: 1,
  },
  otherUniversityText: {
    color: colors.ai.primary,
    fontWeight: '500',
  },
});