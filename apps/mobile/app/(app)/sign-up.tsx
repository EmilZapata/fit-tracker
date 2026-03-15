import {
  SignUpFormData,
  signUpSchema,
} from "@/features/auth/sign-up/toolbox/schemas";
import { useAuth, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Href, Link, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [code, setCode] = React.useState("");

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    const { error } = await signUp.password({
      emailAddress: data.email,
      password: data.password,
    });

    if (error) {
      const errorCode = (error as any)?.errors?.[0]?.code;

      if (errorCode === "form_password_pwned") {
        Alert.alert(
          "Weak Password",
          "The password you entered is too common. Please choose a more unique password.",
          [{ text: "OK" }],
        );
      }

      console.error(JSON.stringify(error, null, 2));

      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    if (!code) {
      Alert.alert(
        "Error",
        "Please enter the verification code sent to your email.",
      );
      return;
    }

    const { error } = await signUp.verifications.verifyEmailCode({
      code,
    });

    if (signUp.status === "complete") {
      await signUp.finalize({
        // Redirect the user to the home page after signing up
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            // Handle pending session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    } else {
      const errorCode = (error as any)?.errors?.[0]?.code;
      if (errorCode === "verification_expired") {
        await signUp.verifications.sendEmailCode();

        Alert.alert(
          "Code Expired",
          "Your verification code has expired. We've sent you a new code, please check your email.",
          [{ text: "OK" }],
        );
        return;
      }

      if (errorCode === "form_code_incorrect") {
        Alert.alert(
          "Incorrect Code",
          "The verification code you entered is incorrect. Please try again.",
          [{ text: "OK" }],
        );
        return;
      }

      Alert.alert(
        "Verification Failed",
        "There was an issue verifying your account. Please try again or contact support if the problem persists.",
        [{ text: "OK" }],
      );
      console.log("🚀 ~ handleVerify ~ errorCode:", errorCode);
    }
  };

  useEffect((): any => {
    if (signUp.status === "complete" || isSignedIn) {
      return;
    }

    return () => {
      console.log("Resetting sign-up state");
      signUp.reset();
      signUp.finalize();
    };
  }, [signUp.status, isSignedIn]);

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 px-6">
            <View className="flex-1 justify-center">
              {/* Logo/Branding */}
              <View className="items-center mb-8">
                <View className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                  <Ionicons name="mail" size={40} color="white" />
                </View>
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                  Check your Email
                </Text>
                <Text className="text-lg text-gray-600 text-center">
                  We've sent a verification code to{"\n"}
                  {signUp.emailAddress}
                </Text>
              </View>

              {/* Verification form */}
              <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Enter Verification Code
                </Text>

                {/* Code Input */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-1 border border-gray-200">
                    <Ionicons name="key-outline" size={20} color="#6B7280" />
                    <TextInput
                      value={code}
                      placeholder="Enter 6-digi code"
                      placeholderTextColor="#9CA3AF"
                      onChangeText={setCode}
                      className="flex-1 ml-3 text-gray-900 text-center text-lg tracking-wide"
                      // onChange={(code) => setCode(code.nativeEvent.text)}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={fetchStatus !== "fetching"}
                    />
                  </View>
                </View>

                {/* Verify Button */}
                <Pressable
                  onPress={handleVerify}
                  disabled={fetchStatus === "fetching"}
                  className={`rounded-xl py-4 shadow-sm mb-4 ${fetchStatus === "fetching" ? "bg-gray-400" : "bg-green-600"}`}
                >
                  <View className="flex-row items-center justify-center ">
                    {fetchStatus === "fetching" ? (
                      <Ionicons name="refresh" size={20} color="white" />
                    ) : (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="white"
                      />
                    )}
                    <Text className="text-white font-semibold text-lg ml-2">
                      {fetchStatus === "fetching"
                        ? "Verifying..."
                        : "Verify Account"}
                    </Text>
                  </View>
                </Pressable>

                {/* Resend code */}
                <Pressable
                  onPress={() => signUp.verifications.sendEmailCode()}
                  className="flex-row items-center justify-center"
                >
                  <Text className="text-blue-500 font-medium text-lg">
                    Didn't receive the code? Resend
                  </Text>
                </Pressable>
              </View>
            </View>
            {/* Footer */}
            <View className="pb-6">
              <Text className="text-center text-gray-500 text-sm">
                Almost there! Just one more step
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6">
          {/* Main */}
          <View className="flex-1 justify-center">
            {/* Logo/Branding */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                <Ionicons name="fitness" size={40} color="white" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Join FitTracker
              </Text>
              <Text className="text-lg text-gray-600 text-center">
                Track your fitness journey{"\n"} and reach your goals
              </Text>
            </View>

            {/* Sign up form */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Create your account
              </Text>

              {/* Email Input */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="mb-4 flex flex-col gap-2">
                    <Text style={styles.label}>Email</Text>
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
                      <Ionicons name="mail-outline" size={20} color="#5B7280" />
                      <TextInput
                        autoCapitalize="none"
                        value={value}
                        placeholder="Enter your email"
                        placeholderTextColor="#9CA3AF"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        className="flex-1 ml-3 text-gray-900"
                        editable={!isSubmitting}
                        inputMode="email"
                      />
                    </View>
                    {formErrors.email && (
                      <Text style={styles.error}>
                        {formErrors.email.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* Password Input */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="mb-6 flex flex-col gap-2">
                    <Text style={styles.label}>Password</Text>
                    <View className="flex flex-col gap-1">
                      <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color="#5B7280"
                        />
                        <TextInput
                          autoCapitalize="none"
                          value={value}
                          placeholder="Enter your password"
                          placeholderTextColor="#9CA3AF"
                          onChangeText={onChange}
                          onBlur={onBlur}
                          className="flex-1 ml-3 text-gray-900"
                          editable={!isSubmitting}
                          secureTextEntry={true}
                          inputMode="text"
                        />
                      </View>
                      <Text className="text-xs text-gray-500">
                        Must be at least 8 characters
                      </Text>
                    </View>
                    {formErrors.password && (
                      <Text style={styles.error}>
                        {formErrors.password.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* Sign in button */}
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className={`rounded-xl py-4 shadow-sm mb-4 ${isSubmitting ? "bg-gray-400" : "bg-blue-600"}`}
              >
                <View className="flex-row items-center justify-center">
                  {isSubmitting ? (
                    <Ionicons name="refresh" size={20} color="white" />
                  ) : (
                    <Ionicons
                      name="person-add-outline"
                      size={20}
                      color="white"
                    />
                  )}
                  <Text className="text-white font-semibold text-lg ml-2">
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </Text>
                </View>
              </Pressable>

              {/* Terms */}
              <Text className="text-xs text-gray-500 text-center mb-4">
                By creating an account, you agree to our Terms and Privacy
                Policy.
              </Text>
            </View>

            {/* Sign in link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600">Already have an account? </Text>
              <Link href="/sign-in" asChild>
                <Pressable>
                  <Text className="text-blue-600 font-semibold">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
          {/* Footer */}
          <View className="pb-6">
            <Text className="text-center text-gray-500 text-sm">
              Ready to transform your fitness?
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    gap: 4,
    marginTop: 12,
    alignItems: "center",
  },
  error: {
    color: "#d32f2f",
    fontSize: 12,
    marginTop: -8,
  },
  debug: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 8,
  },
});
