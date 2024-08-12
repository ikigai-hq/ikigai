pub fn read_str_var(key: &str) -> Option<String> {
    std::env::var(key).ok()
}

pub fn read_str_var_with_default(key: &str, default_val: impl Into<String>) -> String {
    read_str_var(key).unwrap_or(default_val.into())
}

pub fn read_integer_val(key: &str) -> Option<i32> {
    read_str_var(key).and_then(|val| val.parse::<i32>().ok())
}

pub fn read_integer_val_with_default(key: &str, default_val: i32) -> i32 {
    read_integer_val(key).unwrap_or(default_val)
}
