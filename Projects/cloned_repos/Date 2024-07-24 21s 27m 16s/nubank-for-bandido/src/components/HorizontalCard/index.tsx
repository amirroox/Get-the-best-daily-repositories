import React from "react";
import { View, Text, StyleSheet } from "react-native";

const HorizontalCard = ({ description }: { description: string }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 263,
    backgroundColor: "#E4E4E7",
    borderRadius: 10,
    padding: 20,
  },
  text: {
    fontSize: 14,
  },
});

export default HorizontalCard;
