class UserIdStorage {
  key: string = "openexam_user_id";

  public get(): number | undefined {
    if (typeof window === "undefined") {
      return;
    }

    const data = localStorage.getItem(this.key);
    if (data) {
      return parseInt(data, 10);
    }
  }

  public set(userId: number) {
    localStorage.setItem(this.key, userId.toString());
  }

  public del() {
    localStorage.removeItem(this.key);
  }
}

export default new UserIdStorage();
