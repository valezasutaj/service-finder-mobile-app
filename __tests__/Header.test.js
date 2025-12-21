import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

import Header from "../components/header"; 



jest.mock("../context/ThemedModes", () => ({
  useTheme: () => ({
    theme: {
      uiBackground: "#fff",
      primary: "#007AFF",
      text: "#000",
      mutedText: "#666",
      border: "#ddd",
      surface: "#eee",
    },
    isDarkMode: false,
  }),
}));

jest.mock("../utils/SafeRouter", () => ({
  safeRouter: {
    push: jest.fn(),
  },
}));

jest.mock("../services/storageService", () => ({
  getUser: jest.fn().mockResolvedValue({
    uid: "123",
    fullName: "Test User",
    location: { city: "Prishtina" },
  }),
}));

jest.mock("../services/userService", () => ({
  userService: {
    getUserById: jest.fn().mockResolvedValue({
      fullName: "Test User",
      location: { city: "Prishtina" },
    }),
  },
}));

jest.mock("../services/WeatherService", () => ({
  getWeatherByCity: jest.fn().mockResolvedValue({
    temp: 20,
    icon: "01d",
  }),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({})), 
  onAuthStateChanged: jest.fn((auth, cb) => {
    cb(null);
    return jest.fn();
  }),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));



describe("Header component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders user name and city", async () => {
    const { getByText } = render(<Header />);

    await waitFor(() => {
      expect(getByText("Test User")).toBeTruthy();
      expect(getByText("20°C - Prishtina")).toBeTruthy();
    });
  });

  it("navigates to profile on avatar press", async () => {
    const { getByTestId } = render(<Header />);

    fireEvent.press(getByTestId("profile-btn"));

    const { safeRouter } = require("../utils/SafeRouter");
    expect(safeRouter.push).toHaveBeenCalledWith("/myprofile");
  });

  it("navigates to bookings on notification press", async () => {
    const { getByTestId } = render(<Header />);

    fireEvent.press(getByTestId("notifications-btn"));

    const { safeRouter } = require("../utils/SafeRouter");
    expect(safeRouter.push).toHaveBeenCalledWith("provider/bookings");
  });

  it("navigates to booking screen on calendar press", async () => {
    const { getByTestId } = render(<Header />);

    fireEvent.press(getByTestId("calendar-btn"));

    const { safeRouter } = require("../utils/SafeRouter");
    expect(safeRouter.push).toHaveBeenCalledWith("/booking");
  });

  it("matches snapshot", async () => {
    const tree = render(<Header />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
