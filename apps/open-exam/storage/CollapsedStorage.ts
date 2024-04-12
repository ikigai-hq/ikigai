class CollapsedStorage {
  key: string = "sideMenuCollapsed";

  public get(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    const data = localStorage.getItem(this.key);
    return data === "1";
  }

  public set(collapsed: boolean) {
    if (collapsed) {
      localStorage.setItem(this.key, "1");
    } else {
      localStorage.setItem(this.key, "0");
    }
    window.dispatchEvent(new Event("storage"));
  }

  public del() {
    localStorage.removeItem(this.key);
  }
}

export default new CollapsedStorage();
