import { SourceApp } from '../types';

export const PACKAGE_NAME_MAP: Record<string, SourceApp> = {
  'in.org.npci.upiapp': 'BHIM',
  'com.npci.bhimupi': 'BHIM',
  'com.dreamplug.androidapp': 'CRED',
  'net.one97.paytm': 'Paytm',
  'com.paytm.business': 'Paytm',
  'com.equitas.mobileapp': 'Equitas',
  'com.equitas.net': 'Equitas',
};

export const SUPPORTED_PACKAGES = Object.keys(PACKAGE_NAME_MAP);

export const PARSER_VERSION = '1.0.0';

export function getSourceApp(packageName: string): SourceApp {
  return PACKAGE_NAME_MAP[packageName] ?? 'Unknown';
}

export function isSupportedPackage(packageName: string): boolean {
  return packageName in PACKAGE_NAME_MAP;
}
