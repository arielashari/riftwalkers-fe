import { makeAutoObservable } from "mobx";
import { TokenUtil } from "@/utils/token";
import { authRepository } from "@/repository/auth";
import { jwtDecode } from "jwt-decode";

export class AuthStore {
  userData = {
    id: "",
    playerId: ""
  };

  constructor() {
    makeAutoObservable(this);

    // Load token from localStorage and set user
    const accessToken = TokenUtil.accessToken;
    if (accessToken) {
      this.setUserData(accessToken);
    }
  }

  setUserData(accessToken: string) {
    try {
      const decodedJwt = jwtDecode<{ id: string, playerId: string }>(accessToken);
      this.userData.id = decodedJwt?.id ?? "";
      this.userData.playerId = decodedJwt?.playerId ?? "";
    } catch (err) {
      console.warn("Invalid JWT:", err);
      this.userData.id = "";
    }
  }

  async login(username: string, password: string) {
    const credentials = { username, password };
    const response = await authRepository.api.login(credentials);

    if (response.statusCode !== 201) {
      throw new Error(response.message);
    }

    const { accessToken, refreshToken } = response.data;

    TokenUtil.accessToken = accessToken;
    TokenUtil.refreshToken = refreshToken;
    this.setUserData(accessToken);

    return response;
  }

  logout() {
    TokenUtil.clearAccessToken();
    TokenUtil.clearRefreshToken();
    this.userData.id = "";
    window.location.href = '/login';
  }
}
