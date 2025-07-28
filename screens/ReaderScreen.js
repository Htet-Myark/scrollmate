import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ReaderScreen() {
  const { fileUri, fileName } = useLocalSearchParams();
  const [content, setContent] = useState('');
  const [scrolling, setScrolling] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const scrollRef = useRef();
  const scrollStep = 2; // pixels
  const scrollDelay = 100; // ms

  useEffect(() => {
    if (fileUri) {
      FileSystem.readAsStringAsync(fileUri)
        .then(setContent)
        .catch(() => setContent('Failed to read file.'));
    }
  }, [fileUri]);

  const startScroll = () => {
    if (!scrollRef.current) return;
    const id = setInterval(() => {
      scrollRef.current.scrollTo({
        y: scrollRef.currentPosition + scrollStep,
        animated: true,
      });
      scrollRef.currentPosition += scrollStep;
    }, scrollDelay);
    setIntervalId(id);
    setScrolling(true);
  };

  const stopScroll = () => {
    clearInterval(intervalId);
    setScrolling(false);
  };

  useEffect(() => {
    return () => clearInterval(intervalId);
  }, []);

  scrollRef.currentPosition = scrollRef.currentPosition || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.filename}>{fileName || 'Your Document'}</Text>
      <ScrollView ref={scrollRef} style={styles.scrollView}>
        <Text style={styles.content}>{content}</Text>
      </ScrollView>
      <View style={styles.buttons}>
        <Button title={scrolling ? 'Pause' : 'Start'} onPress={scrolling ? stopScroll : startScroll} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  filename: { fontSize: 18, textAlign: 'center', marginBottom: 10, fontWeight: '600' },
  scrollView: { marginHorizontal: 20, marginBottom: 10 },
  content: { fontSize: 16, lineHeight: 26 },
  buttons: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
});
