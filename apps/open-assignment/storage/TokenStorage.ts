class TokenStorage {
  key: string = "openexam_token";

  public get(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(this.key);
  }

  public set(token: string) {
    localStorage.setItem(this.key, token);
  }

  public del() {
    localStorage.removeItem(this.key);
  }
}

export default new TokenStorage();
