export type TranslationKey =
  | 'appName'
  | 'dashboard'
  | 'myTrips'
  | 'tripHistory'
  | 'myRoute'
  | 'myBus'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'logout'
  | 'noNotifications'
  | 'viewAllNotifications'
  | 'settingsTitle'
  | 'settingsSubtitle'
  | 'language'
  | 'languageHint'
  | 'saveSettings'
  | 'driverPortal';

export type TranslationMap = Record<TranslationKey, string>;

export const translations: Record<string, TranslationMap> = {
  en: {
    appName: 'Tracksy Driver',
    dashboard: 'Dashboard',
    myTrips: 'My Trips',
    tripHistory: 'Trip History',
    myRoute: 'My Route',
    myBus: 'My Bus',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    noNotifications: 'No new notifications',
    viewAllNotifications: 'View all notifications',
    settingsTitle: 'Settings',
    settingsSubtitle: 'Manage your app preferences and account settings',
    language: 'Language',
    languageHint: 'Select your preferred language for this device.',
    saveSettings: 'Save Settings',
    driverPortal: 'Driver Portal',
  },
  fr: {
    appName: 'Tracksy Chauffeur',
    dashboard: 'Tableau de bord',
    myTrips: 'Mes trajets',
    tripHistory: 'Historique des trajets',
    myRoute: 'Mon itinéraire',
    myBus: 'Mon bus',
    notifications: 'Notifications',
    profile: 'Profil',
    settings: 'Paramètres',
    logout: 'Se déconnecter',
    noNotifications: 'Aucune nouvelle notification',
    viewAllNotifications: 'Voir toutes les notifications',
    settingsTitle: 'Paramètres',
    settingsSubtitle: 'Gérez les préférences et paramètres du compte',
    language: 'Langue',
    languageHint: 'Sélectionnez la langue de l’interface pour cet appareil.',
    saveSettings: 'Enregistrer',
    driverPortal: 'Portail chauffeur',
  },
  ur: {
    appName: 'ٹریکسی ڈرائیور',
    dashboard: 'ڈیش بورڈ',
    myTrips: 'میری ٹرپس',
    tripHistory: 'ٹرپ ہسٹری',
    myRoute: 'میرا روٹ',
    myBus: 'میری بس',
    notifications: 'نوٹیفیکیشنز',
    profile: 'پروفائل',
    settings: 'ترتیبات',
    logout: 'لاگ آؤٹ',
    noNotifications: 'کوئی نئی اطلاع نہیں',
    viewAllNotifications: 'تمام نوٹیفیکیشنز دیکھیں',
    settingsTitle: 'ترتیبات',
    settingsSubtitle: 'ایپ کی ترجیحات اور اکاؤنٹ سیٹنگز ترتیب دیں',
    language: 'زبان',
    languageHint: 'اس ڈیوائس کے لیے زبان منتخب کریں۔',
    saveSettings: 'ترتیبات محفوظ کریں',
    driverPortal: 'ڈرائیور پورٹل',
  },
  ar: {
    appName: 'تراكسي للسائق',
    dashboard: 'لوحة التحكم',
    myTrips: 'رحلاتي',
    tripHistory: 'سجل الرحلات',
    myRoute: 'مساري',
    myBus: 'حافلتي',
    notifications: 'الإشعارات',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    noNotifications: 'لا توجد إشعارات جديدة',
    viewAllNotifications: 'عرض كل الإشعارات',
    settingsTitle: 'الإعدادات',
    settingsSubtitle: 'إدارة تفضيلات التطبيق وإعدادات الحساب',
    language: 'اللغة',
    languageHint: 'اختر لغة الواجهة لهذا الجهاز.',
    saveSettings: 'حفظ الإعدادات',
    driverPortal: 'بوابة السائق',
  },
};
