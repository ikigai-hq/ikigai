class CurrentPathStorage {
  key: string = "current_path";

  public get(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(this.key);
  }

  public set(path: string) {
    localStorage.setItem(this.key, path);
  }

  public del() {
    localStorage.removeItem(this.key);
  }
}

export default new CurrentPathStorage();
