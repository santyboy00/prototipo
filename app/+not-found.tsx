import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Chrome as Home } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Home size={64} color="#667eea" />
        <Text style={styles.title}>Página no encontrada</Text>
        <Text style={styles.text}>Esta pantalla no existe.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Ir al inicio</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  link: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});