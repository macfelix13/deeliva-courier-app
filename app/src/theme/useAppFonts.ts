import { useFonts } from 'expo-font';
import { Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold } from '@expo-google-fonts/barlow';
import { BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';

export function useAppFonts() {
  return useFonts({
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
  });
}
