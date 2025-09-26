import { useCallback } from 'react';
import { Alert } from 'react-native';
import { t } from '../i18n';

export interface ErrorHandler {
  handleError: (error: unknown, context?: string) => void;
  handleApiError: (error: unknown, defaultMessage?: string) => void;
}

export const useErrorHandler = (): ErrorHandler => {
  const handleError = useCallback((error: unknown, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    let message = t('error_unexpected');
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    
    Alert.alert(
      context ? `${t('error_in')} ${context}` : t('error_title'),
      message,
      [{ text: t('ok') }]
    );
  }, []);

  const handleApiError = useCallback((error: unknown, defaultMessage?: string) => {
    console.error('API Error:', error);
    
    let message = defaultMessage || t('error_api_failed');
    
    if (error instanceof Error) {
      // Check if it's a network error
      if (error.message.includes('Network error')) {
        message = t('error_network');
      } else if (error.message.includes('API Error')) {
        message = error.message.replace('API Error: ', '');
      } else {
        message = error.message;
      }
    }
    
    Alert.alert(t('error_request_failed'), message, [{ text: t('ok') }]);
  }, []);

  return { handleError, handleApiError };
};