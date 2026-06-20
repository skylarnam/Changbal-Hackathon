import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { ProfileForm } from "../src/components/ProfileForm";
import { demoProfile } from "../src/state/appReducer";

describe("ProfileForm", () => {
  test("loads demo profile and submits it", async () => {
    const submit = jest.fn();
    const { getByTestId } = await render(<ProfileForm initialProfile={null} submitLabel="저장" onSubmit={submit} />);
    fireEvent.press(getByTestId("onboarding-demo-profile"));
    await waitFor(() => expect(getByTestId("profile-avoid-ingredients").props.value).toBe("향료"));
    fireEvent.press(getByTestId("onboarding-submit"));
    await waitFor(() => expect(submit).toHaveBeenCalledWith(demoProfile));
  });

  test("limits concerns to two", async () => {
    const { getByText } = await render(<ProfileForm initialProfile={demoProfile} submitLabel="저장" onSubmit={jest.fn()} />);
    fireEvent.press(getByText("건조함"));
    await waitFor(() => expect(getByText("피부 고민은 최대 두 개까지 선택할 수 있어요.")).toBeTruthy());
  });
});
