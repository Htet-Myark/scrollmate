import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'text/plain' });
      if (result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        const fileName = result.assets[0].name;
        router.push({
          pathname: '/reader',
          params: { fileUri, fileName },
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 ScrollMate</Text>
      <Button title="Upload Text File" onPress={pickDocument} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
});
