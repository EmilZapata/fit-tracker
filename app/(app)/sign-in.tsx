import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Href, Link, useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoogleSignIn from "@/components/google-sign-in";
import {
  signInSchema,
  type SignInFormData,
} from "@/modules/auth/sign-in/toolbox/schemas";

export default function Page() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [code, setCode] = React.useState("");

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    const { error } = await signIn.password({
      emailAddress: data.email,
      password: data.password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
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
    } else if (signIn.status === "needs_second_factor") {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
    } else if (signIn.status === "needs_client_trust") {
      // For other second factor strategies,
      // see https://clerk.com/docs/guides/development/custom-flows/authentication/client-trust
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      // Check why the sign-in is not complete
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({
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
      // Check why the sign-in is not complete
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  if (signIn.status === "needs_client_trust") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify your account</Text>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#666666"
          onChangeText={(code) => setCode(code)}
          keyboardType="numeric"
        />
        {errors.fields.code && (
          <Text style={styles.error}>{errors.fields.code.message}</Text>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            fetchStatus === "fetching" && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleVerify}
          disabled={fetchStatus === "fetching"}
        >
          <Text style={styles.buttonText}>Verify</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => signIn.mfa.sendEmailCode()}
        >
          <Text style={styles.secondaryButtonText}>I need a new code</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6">
          {/* Header section */}
          <View className="flex-1 justify-center">
            {/* Logo/Branding */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                <Ionicons name="fitness" size={40} color="white" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                FitTracker
              </Text>
              <Text className="text-lg text-gray-600 text-center">
                Track your fitness journey{"\n"} and reach your goals
              </Text>
            </View>

            {/* Sign in form */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Welcome Back
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
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-2  border border-gray-200">
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
                    {formErrors.password && (
                      <Text style={styles.error}>
                        {formErrors.password.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {errors.fields.identifier && (
                <Text style={styles.error}>
                  {errors.fields.identifier.message}
                </Text>
              )}

              {errors.fields.password && (
                <Text style={styles.error}>
                  {errors.fields.password.message}
                </Text>
              )}

              {/* Sign in button */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className={`rounded-xl py-4 shadow-sm mb-4 ${isSubmitting ? "bg-gray-400" : "bg-blue-600"}`}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  {isSubmitting ? (
                    <Ionicons name="refresh" size={20} color="white" />
                  ) : (
                    <Ionicons name="log-in-outline" size={20} color="white" />
                  )}
                  <Text className="text-white font-semibold text-lg ml-2">
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* For your debugging purposes. You can just console.log errors, but we put them in the UI for convenience */}
              {/* {errors && (
            <Text style={styles.debug}>{JSON.stringify(errors, null, 2)}</Text>
          )} */}

              {/* Divider */}
              <View className="flex-row items-center my-4 ">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="px-4 text-sm text-gray-500">or</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>
              {/* Google Sign In */}
              <GoogleSignIn />
            </View>

            {/* Sign up link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600">Don't have an account? </Text>
              <Link href="/sign-up" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-semibold">Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Footer section */}
          <View className="pb-6">
            <Text className="text-center text-gray-500 text-sm">
              Start your fitness journey today.
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
