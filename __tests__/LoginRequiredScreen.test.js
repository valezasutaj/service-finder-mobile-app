import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LoginRequiredScreen from "../components/LoginRequiredScreen";


jest.mock("../utils/SafeRouter", () => ({
  safeRouter: {
    push: jest.fn(),
  },
}));

jest.mock("../context/ThemedModes", () => ({
  useTheme: () => ({
    theme: {
      primary: "#007AFF",
      background: "#FFFFFF",
      text: "#000000",
      mutedText: "#666666",
      cardBackground: "#F5F5F5",
    },
  }),
}));


import { safeRouter } from "../utils/SafeRouter";

describe("LoginRequiredScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default title and message", () => {
    const { getByText } = render(<LoginRequiredScreen />);

    expect(getByText("Authentication Required")).toBeTruthy();
    expect(getByText("Please login to continue.")).toBeTruthy();
    expect(getByText("Login")).toBeTruthy();
    expect(getByText("Create Account")).toBeTruthy();
    expect(getByText("Continue to Home")).toBeTruthy();
  });

  it("renders with custom title and message", () => {
    const title = "Please Sign In";
    const message = "You need to sign in first.";

    const { getByText } = render(
      <LoginRequiredScreen title={title} message={message} />
    );

    expect(getByText(title)).toBeTruthy();
    expect(getByText(message)).toBeTruthy();
  });

  it("calls onLogin when Login button is pressed", () => {
    const onLoginMock = jest.fn();

    const { getByText } = render(<LoginRequiredScreen onLogin={onLoginMock} />);

    fireEvent.press(getByText("Login"));

    expect(onLoginMock).toHaveBeenCalledTimes(1);
  });

  it("calls onSignup when Create Account button is pressed", () => {
    const onSignupMock = jest.fn();

    const { getByText } = render(<LoginRequiredScreen onSignup={onSignupMock} />);

    fireEvent.press(getByText("Create Account"));

    expect(onSignupMock).toHaveBeenCalledTimes(1);
  });

  it('calls safeRouter.push("/") when Continue to Home button is pressed', () => {
    const { getByText } = render(<LoginRequiredScreen />);

    fireEvent.press(getByText("Continue to Home"));

    expect(safeRouter.push).toHaveBeenCalledWith("/");
  });

  it("matches snapshot", () => {
    const tree = render(<LoginRequiredScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});