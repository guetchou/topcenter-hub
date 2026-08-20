import { useEffect } from "react";
import { authStore } from "@/stores/authStore";
import { authService } from "@/services/auth";
import { useApiError } from "./useApiError";

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    impersonatedUser,
  } = authStore();

  const { handleError } = useApiError();

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        await authService.checkUser();
      } catch (error) {
        handleError(error as Error);
      }
    };

    if (!isAuthenticated && !isLoading) {
      checkUserAuth();
    }
  }, [isAuthenticated, isLoading, handleError]);

  const login = async (email: string, password: string, devMode = false) => {
    await authService.login(email, password, devMode);
  };

  const loginWithGoogle = async () => {
    await authService.loginWithGoogle();
  };

  const promoteToSuperAdmin = async (userId: string) => {
    await authService.promoteToSuperAdmin(userId);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    impersonatedUser,
    login,
    loginWithGoogle,
    logout: authService.logout,
    register: authService.register,
    checkUser: authService.checkUser,
    resetPassword: authService.resetPassword,
    impersonateUser: authService.impersonateUser,
    stopImpersonation: authService.stopImpersonation,
    promoteToSuperAdmin,
  };
};
