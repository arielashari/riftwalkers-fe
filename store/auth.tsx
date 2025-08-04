import { makeAutoObservable } from "mobx";
import {TokenUtil} from "@/utils/token";
import {authRepository} from "@/repository/auth";
import {jwtDecode} from "jwt-decode";

export class AuthStore {
  userData: {
    role: string;
    email: string;
  } = {
    role: "",
    email: "",
  };

  constructor() {
    makeAutoObservable(this);

    if (TokenUtil.accessToken != null) {
      this.setUserData(TokenUtil.accessToken);
    }
  }

  setUserData(accessToken: string) {
    const decodedJwt = jwtDecode<{
      role: string;
      email: string;
    }>(accessToken);

    this.userData.role = decodedJwt?.role ?? "";
    this.userData.email = decodedJwt?.email ?? "";
  }

  async login(email: string, password: string) {
    const data = {
      email: email,
      password: password,
    };

    const req = await authRepository.api.login(data);
    if (req.statusCode != 201) {
      throw new Error(req?.message)
    }
    TokenUtil.setAccessToken(req?.data?.access_token);
    TokenUtil.setRefreshToken(req?.data?.refresh_token);
    TokenUtil.persistToken();
    this.setUserData(req?.data?.access_token);

    return req;
  }
}
