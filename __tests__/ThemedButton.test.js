import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ThemedButton from "../components/ThemedButton";
import { Text } from "react-native";

jest.mock("../context/ThemedModes", () => ({
  useTheme: () => ({
    theme: {
      buttonBackground: "#007AFF",
    },
  }),
}));


describe("ThemedButton", () => {
  test("renders children correctly", () => {
    const { getByText } = render(
      <ThemedButton>
        <Text>Click Me</Text>
      </ThemedButton>
    );

    expect(getByText("Click Me")).toBeTruthy();
  });

  test("calls onPress when pressed", () => {
    const onPressMock = jest.fn();

    const { getByText } = render(
      <ThemedButton onPress={onPressMock}>
        <Text>Press</Text>
      </ThemedButton>
    );

    fireEvent.press(getByText("Press"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});