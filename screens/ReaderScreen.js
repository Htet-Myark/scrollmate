import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Button, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ReaderScreen() {
  const { fileUri, fileName } = useLocalSearchParams();
  const [content, setContent] = useState('');
  const [scrolling, setScrolling] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [scrollSpeed, setScrollSpeed] = useState(50); // ms
  const [scrollReady, setScrollReady] = useState(false);
  const scrollRef = useRef(null);
  const scrollStep = 2;

  // Read file
  useEffect(() => {
    if (!fileUri) return;

    if (Platform.OS === 'web') {
      fetch(fileUri)
        .then((res) => res.text())
        .then(setContent)
        .catch(() => setContent('❌ Failed to read file on web'));
    } else {
      FileSystem.readAsStringAsync(fileUri)
        .then(setContent)
        .catch(() => setContent('❌ Failed to read file on mobile'));
    }
  }, [fileUri]);

  // Start auto-scroll
  const startScroll = () => {
    if (!scrollRef.current) return;

    stopScroll(); // stop old interval
    const id = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          y: scrollRef.currentPosition + scrollStep,
          animated: true,
        });
        scrollRef.currentPosition += scrollStep;
      }
    }, scrollSpeed);

    setIntervalId(id);
    setScrolling(true);
  };

  // Stop auto-scroll
  const stopScroll = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setScrolling(false);
  };

  // On unmount
  useEffect(() => {
    return () => stopScroll();
  }, []);

  // When layout is ready
  const handleLayout = () => {
    scrollRef.currentPosition = 0;
    setScrollReady(true);
  };

  const onSpeedChange = (value) => {
    setScrollSpeed(value);
    if (scrolling) {
      startScroll(); // restart scroll with new speed
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.filename}>{fileName || 'Your Document'}</Text>

      <ScrollView
        ref={(ref) => {
          scrollRef.current = ref;
        }}
        onLayout={handleLayout}
        style={styles.scrollView}
      >
        <Text style={styles.content}>{content}</Text>
      </ScrollView>

      <View style={styles.controls}>
        <Button
          title={scrolling ? 'Pause' : 'Start'}
          onPress={scrolling ? stopScroll : () => {
            if (scrollReady && scrollRef.current) startScroll();
          }}
        />

        <View style={styles.sliderContainer}>
          <Text>Speed: {scrollSpeed}ms</Text>
          <Slider
            style={{ width: 200 }}
            minimumValue={20}
            maximumValue={200}
            step={10}
            value={scrollSpeed}
            onValueChange={onSpeedChange}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  filename: { fontSize: 18, textAlign: 'center', marginBottom: 10, fontWeight: '600' },
  scrollView: { marginHorizontal: 20, marginBottom: 10 },
  content: { fontSize: 16, lineHeight: 26 },
  controls: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sliderContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
});
