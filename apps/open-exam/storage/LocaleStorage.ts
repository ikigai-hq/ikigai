class LocaleStorage {
  key: string = "locale";

  public get(): string {
    if (typeof window === "undefined") {
      return "en";
    }

    const locale = localStorage.getItem(this.key);
    if (locale) {
      return locale;
    }
  }

  public set(locale: string): void {
    localStorage.setItem(this.key, locale);
  }

  public del() {
    localStorage.removeItem(this.key);
  }
}

const LocaleStorageInstance = new LocaleStorage();

export default LocaleStorageInstance;
